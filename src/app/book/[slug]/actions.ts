"use server";

import { db } from "@/db";
import { appointments, availability, availabilityOverrides, clinics, patients, subscriptions } from "@/db/schema";
import { eq, and, ne, count, inArray } from "drizzle-orm";
import { parseISO, getDay, format, addMinutes } from "date-fns";
import { getClinicTodayDate } from "@/lib/timezone";
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

    // 2. Get ALL sessions for this day (supports breaks: e.g. 10am-1pm + 4pm-8pm)
    const dateObj = parseISO(dateStr);
    const dayOfWeek = getDay(dateObj); // 0 = Sunday

    const sessions = await db
      .select()
      .from(availability)
      .where(
        and(
          eq(availability.clinicId, clinicId),
          eq(availability.dayOfWeek, dayOfWeek)
        )
      );

    // If no schedule for this day, clinic is closed
    if (!sessions.length) {
      return { slots: [] };
    }

    // 3. Generate slots for each session window and merge them
    // Use the slotDurationMinutes from the first session (all sessions share same slot size)
    const slotDurationMinutes = sessions[0].slotDurationMinutes;
    const allSlots = new Set<string>();

    for (const session of sessions) {
      const [startH, startM] = session.startTime.split(":").map(Number);
      const [endH, endM] = session.endTime.split(":").map(Number);

      let current = new Date(dateObj);
      current.setHours(startH, startM, 0, 0);

      const end = new Date(dateObj);
      end.setHours(endH, endM, 0, 0);

      while (current < end) {
        allSlots.add(format(current, "HH:mm"));
        current = addMinutes(current, slotDurationMinutes);
      }
    }

    // Sort slots chronologically
    const slots = Array.from(allSlots).sort();

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
  patientEmail?: string,
  acquisitionSource?: string
) {
  try {
    // We wrap everything in a transaction to prevent race conditions during high-volume booking
    let finalAppointmentId: string | null = null;
    let finalPatientId: string | null = null;

    await db.transaction(async (tx) => {
      // 0. Find or create patient
      let patientId = null;
      const existingPatient = await tx
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
        const [{ count: patientCount }] = await tx
          .select({ count: count() })
          .from(patients)
          .where(eq(patients.clinicId, clinicId));

        if (patientCount >= 5) {
          // Check if clinic has an active subscription
          const activeSubs = await tx
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
            throw new Error("This clinic is currently not accepting new patients.");
          }
        }
        // -------------------------------------------

        const [newPatient] = await tx
          .insert(patients)
          .values({
            clinicId,
            name: patientName,
            phone: patientPhone,
          })
          .returning({ id: patients.id });
        patientId = newPatient.id;
      }
      
      finalPatientId = patientId;

      // --- 1 Active Appointment Restriction ---
      const activeAppts = await tx
        .select({ id: appointments.id })
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, clinicId),
            eq(appointments.patientPhone, patientPhone),
            inArray(appointments.status, ["confirmed", "checked_in", "in_consultation"])
          )
        )
        .limit(1);

      if (activeAppts.length > 0) {
        throw new Error("You already have an active appointment. Please cancel it first to book a new one.");
      }
      // ----------------------------------------

      // Lock the clinic row to serialize token generation for this clinic
      await tx
        .select()
        .from(clinics)
        .where(eq(clinics.id, clinicId))
        .for("update");

      const { desc } = await import("drizzle-orm");
      const [latestAppt] = await tx
        .select({ tokenNumber: appointments.tokenNumber })
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, clinicId),
            eq(appointments.appointmentDate, dateStr)
          )
        )
        .orderBy(desc(appointments.tokenNumber))
        .limit(1);
        
      const nextToken = (latestAppt?.tokenNumber || 0) + 1;
      const cancelToken = crypto.randomUUID();

      // Insert the appointment and return the ID
      const [newAppointment] = await tx.insert(appointments).values({
        clinicId,
        patientId,
        patientName,
        patientPhone,
        patientEmail: patientEmail || null,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        status: "confirmed",
        tokenNumber: nextToken,
        cancelToken,
        acquisitionSource: acquisitionSource || null,
      }).returning({ id: appointments.id });

      finalAppointmentId = newAppointment.id;
    });

    if (!finalAppointmentId) {
      return { error: "Failed to generate appointment." };
    }

    // Fetch clinic details for the notification outside transaction
    const clinicRecord = await db.select().from(clinics).where(eq(clinics.id, clinicId)).limit(1);
    
    if (clinicRecord.length > 0) {
      const clinic = clinicRecord[0];
      const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://doctordiary.in"}/track/${finalAppointmentId}`;
      
      // Fire and forget the simulated SMS notification
      sendNotification("sms", "booking_confirmation", {
        appointmentId: finalAppointmentId,
        patientPhone,
        patientName,
        clinicName: clinic.name,
        doctorName: clinic.doctorName,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        trackingUrl,
      });
    }

    return { success: true, appointmentId: finalAppointmentId };
  } catch (error: any) {
    // Check for Postgres unique constraint violation
    if (error?.code === "23505" || error?.message?.includes("unique")) {
      return { error: "This slot was just taken! Please select another time." };
    }
    // Return custom errors thrown from within the transaction
    if (error instanceof Error && error.message) {
      return { error: error.message };
    }
    console.error("Booking error:", error);
    return { error: "Failed to create booking. Please try again." };
  }
}

export async function findPatientAppointment(clinicId: string, phone: string) {
  try {
    const todayStr = getClinicTodayDate();
    
    // 1. Try to find an appointment for today
    let appts = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          eq(appointments.patientPhone, phone),
          eq(appointments.appointmentDate, todayStr)
        )
      )
      .limit(1);

    if (appts.length > 0) {
      return { appointmentId: appts[0].id };
    }

    // 2. If no appointment today, find the first upcoming appointment
    appts = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, clinicId),
          eq(appointments.patientPhone, phone),
          ne(appointments.status, "cancelled"),
          ne(appointments.status, "completed"),
          ne(appointments.status, "no_show")
        )
      )
      .limit(1);

    if (appts.length > 0) {
      return { appointmentId: appts[0].id };
    }

    return { error: "No active appointments found for this mobile number." };
  } catch (error) {
    console.error("Failed to find appointment:", error);
    return { error: "Something went wrong. Please try again." };
  }
}
