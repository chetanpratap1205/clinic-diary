"use server";

import { db } from "@/db";
import { appointments, availability, availabilityOverrides, clinics, patients, subscriptions } from "@/db/schema";
import { eq, and, ne, count } from "drizzle-orm";
import { parseISO, getDay, format, addMinutes } from "date-fns";
import { sendNotification } from "@/lib/notifications";

export async function getAvailableSlots(clinicId: string, dateStr: string) {
  try {
    // 1. Check for overrides (holidays/leaves)
    const override = await db
      .select()
      .from(availabilityOverrides)
      .where(
        and(
          eq(availabilityOverrides.clinicId, clinicId),
          eq(availabilityOverrides.date, dateStr)
        )
      )
      .limit(1);

    if (override.length && override[0].isClosed) {
      return { slots: [] };
    }

    // 2. Get normal weekly availability
    const dateObj = parseISO(dateStr);
    const dayOfWeek = getDay(dateObj); // 0 = Sunday

    const schedule = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.clinicId, clinicId),
          eq(availability.dayOfWeek, dayOfWeek)
        )
      )
      .limit(1);

    // If no schedule for this day, assume closed
    if (!schedule.length) {
      return { slots: [] };
    }

    const { startTime, endTime, slotDurationMinutes } = schedule[0];

    // 3. Generate all possible slots
    const slots: string[] = [];
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    let current = new Date(dateObj);
    current.setHours(startH, startM, 0, 0);

    const end = new Date(dateObj);
    end.setHours(endH, endM, 0, 0);

    while (current < end) {
      slots.push(format(current, "HH:mm"));
      current = addMinutes(current, slotDurationMinutes);
    }

    // 4. Fetch existing appointments
    const existingAppts = await db
      .select({ appointmentTime: appointments.appointmentTime })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          eq(appointments.appointmentDate, dateStr),
          ne(appointments.status, "cancelled")
        )
      );

    const bookedTimes = new Set(
      existingAppts.map((a) => (a.appointmentTime as string).slice(0, 5))
    );

    // 5. Filter out booked slots
    const availableSlots = slots.filter((slot) => !bookedTimes.has(slot));

    return { slots: availableSlots };
  } catch (error) {
    console.error("Failed to get slots:", error);
    return { error: "Failed to load availability" };
  }
}

export async function createBooking(
  clinicId: string,
  dateStr: string,
  timeStr: string,
  patientName: string,
  patientPhone: string,
  patientEmail?: string
) {
  try {
    // 0. Find or create patient
    let patientId = null;
    const existingPatient = await db
      .select({ id: patients.id })
      .from(patients)
      .where(
        and(
          eq(patients.clinicId, clinicId),
          eq(patients.phone, patientPhone)
        )
      )
      .limit(1);

    if (existingPatient.length > 0) {
      patientId = existingPatient[0].id;
    } else {
      // --- Subscription & Patient Limit Check ---
      const [{ count: patientCount }] = await db
        .select({ count: count() })
        .from(patients)
        .where(eq(patients.clinicId, clinicId));

      if (patientCount >= 5) {
        // Check if clinic has an active subscription
        const activeSubs = await db
          .select()
          .from(subscriptions)
          .where(
            and(
              eq(subscriptions.clinicId, clinicId),
              eq(subscriptions.status, "active")
            )
          )
          .limit(1);

        if (activeSubs.length === 0) {
          return { error: "This clinic is currently not accepting new patients." };
        }
      }
      // -------------------------------------------

      const [newPatient] = await db
        .insert(patients)
        .values({
          clinicId,
          name: patientName,
          phone: patientPhone,
        })
        .returning({ id: patients.id });
      patientId = newPatient.id;
    }

    // Insert the appointment and return the ID
    const [newAppointment] = await db.insert(appointments).values({
      clinicId,
      patientId,
      patientName,
      patientPhone,
      patientEmail: patientEmail || null,
      appointmentDate: dateStr,
      appointmentTime: timeStr,
      status: "confirmed",
    }).returning({ id: appointments.id });

    // Fetch clinic details for the notification
    const clinicRecord = await db.select().from(clinics).where(eq(clinics.id, clinicId)).limit(1);
    
    if (clinicRecord.length > 0) {
      const clinic = clinicRecord[0];
      const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://doctordiary.in"}/track/${newAppointment.id}`;
      
      // Fire and forget the simulated SMS notification
      sendNotification("sms", "booking_confirmation", {
        appointmentId: newAppointment.id,
        patientPhone,
        patientName,
        clinicName: clinic.name,
        doctorName: clinic.doctorName,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        trackingUrl,
      });
    }

    return { success: true, appointmentId: newAppointment.id };
  } catch (error: any) {
    // Check for Postgres unique constraint violation
    if (error.code === "23505" || error.message?.includes("unique")) {
      return { error: "This slot was just taken! Please select another time." };
    }
    console.error("Booking error:", error);
    return { error: "Failed to create booking. Please try again." };
  }
}
