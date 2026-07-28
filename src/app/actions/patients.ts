"use server";

import { db } from "@/db";
import { patients, subscriptions, appointments, clinics } from "@/db/schema";
import { eq, and, count, max } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { getClinicTodayDate, CLINIC_TIMEZONE } from "@/lib/timezone";
import { formatInTimeZone } from "date-fns-tz";
import { revalidatePath } from "next/cache";
import { parsePatientExtendedData, serializePatientExtendedData, PatientExtendedData } from "@/lib/patient-helpers";

type CreatePatientInput = {
  name: string;
  phone: string;
  age?: string;
  gender?: string;
  address?: string;
  email?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  allergies?: string;
  chronicConditions?: string;
  notes?: string;
  addToQueue?: boolean;
};

export async function createPatientAction(data: CreatePatientInput) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return { error: "Unauthorized" };
    }
    const clinicId = authUser.clinicId;

    const {
      name,
      phone,
      age,
      gender,
      address,
      email,
      bloodGroup,
      emergencyContact,
      allergies,
      chronicConditions,
      notes,
      addToQueue,
    } = data;

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

    const serializedMedicalNotes = serializePatientExtendedData({
      notes: notes || "",
      bloodGroup: bloodGroup || "",
      email: email || "",
      emergencyContact: emergencyContact || "",
      allergies: allergies || "",
      chronicConditions: chronicConditions || "",
    });

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
          medicalNotes: serializedMedicalNotes,
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
          .select({ appointmentTime: appointments.appointmentTime, tokenNumber: appointments.tokenNumber })
          .from(appointments)
          .where(
            and(
              eq(appointments.clinicId, clinicId),
              eq(appointments.appointmentDate, appointmentDate)
            )
          );

        const existingTimes = new Set<string>(todayAppointments.map((a) => a.appointmentTime));
        const { ensureUniqueTime } = await import("@/lib/appointment-utils");
        const uniqueAppointmentTime = ensureUniqueTime(appointmentTime, existingTimes);

        const maxToken = todayAppointments.reduce((m, curr) => Math.max(m, curr.tokenNumber || 0), 0);
        const nextToken = maxToken + 1;

        await tx.insert(appointments).values({
          clinicId: clinicId,
          patientId: newPatient.id,
          patientName: newPatient.name,
          patientPhone: newPatient.phone,
          appointmentDate,
          appointmentTime: uniqueAppointmentTime,
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
  email?: string;
  bloodGroup?: string;
  emergencyContact?: string;
  allergies?: string;
  chronicConditions?: string;
  notes?: string;
};

export async function updatePatientAction(patientId: string, data: UpdatePatientInput) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return { error: "Unauthorized" };
    }
    const clinicId = authUser.clinicId;

    const {
      name,
      phone,
      age,
      gender,
      address,
      email,
      bloodGroup,
      emergencyContact,
      allergies,
      chronicConditions,
      notes,
    } = data;

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

    const duplicate = existing.find((p) => p.id !== patientId);
    if (duplicate) {
      return { error: "Another patient with this phone number already exists" };
    }

    // Retrieve existing patient to preserve notes if not provided
    const [currentPatient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, patientId), eq(patients.clinicId, clinicId)))
      .limit(1);

    const currentExt = parsePatientExtendedData(currentPatient?.medicalNotes);

    const updatedExt: PatientExtendedData = {
      notes: notes !== undefined ? notes : currentExt.notes,
      bloodGroup: bloodGroup !== undefined ? bloodGroup : currentExt.bloodGroup,
      email: email !== undefined ? email : currentExt.email,
      emergencyContact: emergencyContact !== undefined ? emergencyContact : currentExt.emergencyContact,
      allergies: allergies !== undefined ? allergies : currentExt.allergies,
      chronicConditions: chronicConditions !== undefined ? chronicConditions : currentExt.chronicConditions,
    };

    const serializedMedicalNotes = serializePatientExtendedData(updatedExt);

    const [updatedPatient] = await db
      .update(patients)
      .set({
        name,
        phone,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        address: address || null,
        medicalNotes: serializedMedicalNotes,
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
