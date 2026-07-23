"use server";

import { db } from "@/db";
import { patients, subscriptions, appointments, clinics } from "@/db/schema";
import { eq, and, count, max } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { getClinicTodayDate, CLINIC_TIMEZONE } from "@/lib/timezone";
import { formatInTimeZone } from "date-fns-tz";
import { revalidatePath } from "next/cache";

type CreatePatientInput = {
  name: string;
  phone: string;
  age?: string;
  gender?: string;
  address?: string;
  addToQueue?: boolean;
};

export async function createPatientAction(data: CreatePatientInput) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return { error: "Unauthorized" };
    }
    const clinicId = authUser.clinicId;

    const { name, phone, age, gender, address, addToQueue } = data;

    if (!name || !phone) {
      return { error: "Name and phone are required" };
    }

    const { isValidIndianMobileNumber } = await import("@/lib/validations");
    if (!isValidIndianMobileNumber(phone)) {
      return { error: "Please enter a valid 10-digit mobile number." };
    }

    // Check for existing patient with same phone in this clinic
    const existing = await db
      .select()
      .from(patients)
      .where(
        and(eq(patients.clinicId, clinicId), eq(patients.phone, phone))
      )
      .limit(1);

    if (existing.length > 0) {
      return { error: "Patient with this phone number already exists" };
    }

    // --- Subscription & Patient Limit Check ---
    const [{ count: patientCount }] = await db
      .select({ count: count() })
      .from(patients)
      .where(eq(patients.clinicId, clinicId));

    if (patientCount >= 5) {
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
        return {
          error: "You have reached the 5 patient limit on the free plan. Please upgrade to continue.",
        };
      }
    }
    // -------------------------------------------

    let newPatientRecord: any = null;

    await db.transaction(async (tx) => {
      const [newPatient] = await tx
        .insert(patients)
        .values({
          clinicId: clinicId,
          name,
          phone,
          age: age ? parseInt(age) : null,
          gender: gender || null,
          address: address || null,
        })
        .returning();
      
      newPatientRecord = newPatient;

      if (addToQueue) {
        const now = new Date();
        const appointmentDate = getClinicTodayDate();
        const appointmentTime = formatInTimeZone(now, CLINIC_TIMEZONE, "HH:mm:ss");

        // Lock the clinic row to serialize token generation for this clinic
        await tx
          .select()
          .from(clinics)
          .where(eq(clinics.id, clinicId))
          .for("update");

        // Calculate token number safely
        const todayAppointments = await tx
          .select({ maxToken: max(appointments.tokenNumber) })
          .from(appointments)
          .where(
            and(
              eq(appointments.clinicId, clinicId),
              eq(appointments.appointmentDate, appointmentDate)
            )
          );
        const nextToken = (todayAppointments[0]?.maxToken || 0) + 1;

        await tx.insert(appointments).values({
          clinicId: clinicId,
          patientId: newPatient.id,
          patientName: newPatient.name,
          patientPhone: newPatient.phone,
          appointmentDate,
          appointmentTime,
          tokenNumber: nextToken,
          status: "checked_in",
          checkInTime: now,
          notes: "Added from quick walk-in registration",
        });
      }
    });

    revalidatePath("/dashboard/patients");
    if (addToQueue) {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/queue");
    }

    return { patient: newPatientRecord };
  } catch (err) {
    console.error("[createPatientAction] Error:", err);
    return { error: "Server error" };
  }
}

type UpdatePatientInput = {
  name: string;
  phone: string;
  age?: string;
  gender?: string;
  address?: string;
};

export async function updatePatientAction(patientId: string, data: UpdatePatientInput) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return { error: "Unauthorized" };
    }
    const clinicId = authUser.clinicId;

    const { name, phone, age, gender, address } = data;

    if (!name || !phone) {
      return { error: "Name and phone are required" };
    }

    const { isValidIndianMobileNumber } = await import("@/lib/validations");
    if (!isValidIndianMobileNumber(phone)) {
      return { error: "Please enter a valid 10-digit mobile number." };
    }

    // Check if another patient (different ID) has this phone number
    const existing = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.clinicId, clinicId),
          eq(patients.phone, phone)
        )
      );

    const duplicate = existing.find(p => p.id !== patientId);
    if (duplicate) {
      return { error: "Another patient with this phone number already exists" };
    }

    const [updatedPatient] = await db
      .update(patients)
      .set({
        name,
        phone,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        address: address || null,
      })
      .where(
        and(eq(patients.id, patientId), eq(patients.clinicId, clinicId))
      )
      .returning();

    if (!updatedPatient) {
      return { error: "Patient not found" };
    }

    revalidatePath(`/dashboard/patients/${patientId}`);
    revalidatePath("/dashboard/patients");

    return { patient: updatedPatient };
  } catch (err) {
    console.error("[updatePatientAction] Error:", err);
    return { error: "Server error" };
  }
}
