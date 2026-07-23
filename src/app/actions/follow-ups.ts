"use server";

import { db } from "@/db";
import { followUps, appointments, patients, clinics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { formatInTimeZone } from "date-fns-tz";
import { getClinicTodayDate, CLINIC_TIMEZONE } from "@/lib/timezone";
import { revalidatePath } from "next/cache";

type CreateFollowUpInput = {
  patientId: string;
  appointmentId?: string;
  dueDate: string;
  notes?: string;
};

export async function createFollowUpAction(data: CreateFollowUpInput) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return { error: "Unauthorized" };
    }

    const { patientId, appointmentId, dueDate, notes } = data;

    if (!patientId || !dueDate) {
      return { error: "patientId and dueDate are required" };
    }

    const [newFollowUp] = await db
      .insert(followUps)
      .values({
        clinicId: authUser.clinicId,
        patientId,
        appointmentId: appointmentId || null,
        dueDate,
        notes: notes || null,
        status: "pending",
      })
      .returning();

    revalidatePath(`/dashboard/patients/${patientId}`);
    revalidatePath("/dashboard/follow-ups");
    revalidatePath("/dashboard");

    return { followUp: newFollowUp };
  } catch (err) {
    console.error("[createFollowUpAction] Error:", err);
    return { error: "Server error" };
  }
}

export async function updateFollowUpStatusAction(id: string, status: string) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return { error: "Unauthorized" };
    }

    if (!status || !["pending", "checked_in", "completed", "missed", "cancelled"].includes(status)) {
      return { error: "Invalid status" };
    }
    const clinicId = authUser.clinicId;

    let appointmentIdToLink: string | null = null;
    let patientIdToRevalidate: string | null = null;

    let updatedRecord: any = null;

    await db.transaction(async (tx) => {
      if (status === "checked_in") {
        const [followUpRecord] = await tx
          .select()
          .from(followUps)
          .where(eq(followUps.id, id))
          .limit(1);

        if (followUpRecord) {
          patientIdToRevalidate = followUpRecord.patientId;
          const [patient] = await tx
            .select()
            .from(patients)
            .where(eq(patients.id, followUpRecord.patientId))
            .limit(1);

          if (patient) {
            const todayStr = getClinicTodayDate();
            const now = new Date();
            
            // Lock the clinic row to serialize token generation
            await tx
              .select()
              .from(clinics)
              .where(eq(clinics.id, clinicId))
              .for("update");

            // Get clinic settings for average consultation minutes
            const [clinicResult] = await tx
              .select({ averageConsultationMinutes: clinics.averageConsultationMinutes })
              .from(clinics)
              .where(eq(clinics.id, clinicId));
            const avgConsultMins = clinicResult?.averageConsultationMinutes ?? 15;

            // Get existing appointments today to calculate the correct walk-in slot
            const todayAppointmentsData = await tx
              .select()
              .from(appointments)
              .where(
                and(
                  eq(appointments.clinicId, clinicId),
                  eq(appointments.appointmentDate, todayStr)
                )
              );
              
            // Get next token number
            const maxTokenData = todayAppointmentsData.reduce((max, curr) => Math.max(max, curr.tokenNumber || 0), 0);
            const nextToken = maxTokenData + 1;

            let appointmentTime = formatInTimeZone(now, CLINIC_TIMEZONE, "HH:mm:ss");
            if (todayAppointmentsData.length > 0) {
              const { getWalkInTimeSlot } = await import("@/lib/queue-logic");
              appointmentTime = getWalkInTimeSlot(todayAppointmentsData, now, avgConsultMins);
            }

            const [newAppt] = await tx.insert(appointments).values({
              clinicId: clinicId,
              patientId: patient.id,
              patientName: patient.name,
              patientPhone: patient.phone,
              appointmentDate: todayStr,
              appointmentTime: appointmentTime,
              tokenNumber: nextToken,
              status: "checked_in",
              checkInTime: now,
              notes: "Auto-generated from Follow-up Check In",
            }).returning({ id: appointments.id });

            if (newAppt) {
              appointmentIdToLink = newAppt.id;
            }
          }
        }
      }

      // Update follow-up status and link appointment if created
      const updateData: any = { 
        status,
        completedAt: status === "completed" ? new Date() : null,
      };

      if (appointmentIdToLink) {
        updateData.appointmentId = appointmentIdToLink;
      }

      const [updated] = await tx
        .update(followUps)
        .set(updateData)
        .where(
          and(
            eq(followUps.id, id),
            eq(followUps.clinicId, clinicId)
          )
        )
        .returning();
        
      updatedRecord = updated;
    });

    if (!updatedRecord) {
      return { error: "Follow-up not found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/follow-ups");
    revalidatePath("/dashboard/queue");
    if (patientIdToRevalidate) {
      revalidatePath(`/dashboard/patients/${patientIdToRevalidate}`);
    }

    return { followUp: updatedRecord };
  } catch (err) {
    console.error("[updateFollowUpStatusAction] Error:", err);
    return { error: "Server error" };
  }
}
