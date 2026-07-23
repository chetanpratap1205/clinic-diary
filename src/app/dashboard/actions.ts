"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logoutDoctor() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateAppointmentStatus(appointmentId: string, status: string, feeCollected?: number) {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) {
    return { error: "Unauthorized" };
  }

  try {
    const updateData: any = { status };
    if (status === "checked_in") updateData.checkInTime = new Date();
    else if (status === "in_consultation") updateData.consultationStartTime = new Date();
    else if (status === "completed") {
      updateData.consultationEndTime = new Date();
      if (feeCollected !== undefined) {
        updateData.feeCollected = feeCollected;
      }
    }

    // Only allow update if appointment belongs to doctor's clinic
    await db
      .update(appointments)
      .set(updateData)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.clinicId, authUser.clinicId)
        )
      );

    // Sync linked follow-up if applicable
    const { followUps } = await import("@/db/schema");
    if (status === "completed") {
      await db
        .update(followUps)
        .set({ status: "completed", completedAt: new Date() })
        .where(
          and(
            eq(followUps.appointmentId, appointmentId),
            eq(followUps.clinicId, authUser.clinicId),
            eq(followUps.status, "pending")
          )
        );
    } else if (status === "cancelled" || status === "no_show") {
      await db
        .update(followUps)
        .set({ status: status === "no_show" ? "missed" : "cancelled" })
        .where(
          and(
            eq(followUps.appointmentId, appointmentId),
            eq(followUps.clinicId, authUser.clinicId),
            eq(followUps.status, "pending")
          )
        );
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/calendar");
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { error: "Failed to update appointment status" };
  }
}

export async function completeAppointmentWithNotes(data: {
  appointmentId: string;
  patientId: string | null;
  complaint: string;
  diagnosis?: string;
  treatment: string;
  followUpDays: number | "none";
  feeCollected?: number;
}) {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) {
    return { error: "Unauthorized" };
  }

  try {
    const updateData: any = { status: "completed", consultationEndTime: new Date() };
    if (data.feeCollected !== undefined) {
      updateData.feeCollected = data.feeCollected;
    }

    // 1. Update appointment status and timestamp
    await db
      .update(appointments)
      .set(updateData)
      .where(
        and(
          eq(appointments.id, data.appointmentId),
          eq(appointments.clinicId, authUser.clinicId)
        )
      );

    // 1.5 Auto-complete any follow-up that generated this appointment
    const { followUps } = await import("@/db/schema");
    await db
      .update(followUps)
      .set({ status: "completed", completedAt: new Date() })
      .where(
        and(
          eq(followUps.appointmentId, data.appointmentId),
          eq(followUps.clinicId, authUser.clinicId),
          eq(followUps.status, "pending")
        )
      );

    // 2. Add visit notes
    if (data.patientId && (data.complaint || data.diagnosis || data.treatment)) {
      const { visitNotes } = await import("@/db/schema");
      await db.insert(visitNotes).values({
        clinicId: authUser.clinicId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        complaint: data.complaint || null,
        diagnosis: data.diagnosis || null,
        treatment: data.treatment || null,
        followUpRequired: data.followUpDays !== "none",
      });
    }

    // 3. Schedule follow-up if requested
    if (data.patientId && data.followUpDays !== "none") {
      const d = new Date();
      d.setDate(d.getDate() + data.followUpDays);
      const dueDateStr = d.toISOString().split("T")[0];

      await db.insert(followUps).values({
        clinicId: authUser.clinicId,
        patientId: data.patientId,
        appointmentId: data.appointmentId, // This points to the originating appointment
        dueDate: dueDateStr,
        status: "pending",
        notes: data.complaint ? `Follow-up for: ${data.complaint}` : null,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/calendar");
    if (data.patientId) revalidatePath(`/dashboard/patients/${data.patientId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to complete appointment:", error);
    return { error: "Failed to complete appointment" };
  }
}

export async function checkInWalkIn(patientId: string) {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) {
    return { error: "Unauthorized" };
  }

  try {
    const { patients } = await import("@/db/schema");
    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, patientId),
          eq(patients.clinicId, authUser.clinicId)
        )
      )
      .limit(1);

    if (!patient) return { error: "Patient not found" };

    const { format } = await import("date-fns");
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const timeStr = format(new Date(), "HH:mm:ss");

    const { desc } = await import("drizzle-orm");
    const [latestAppt] = await db
      .select({ tokenNumber: appointments.tokenNumber })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, authUser.clinicId),
          eq(appointments.appointmentDate, todayStr)
        )
      )
      .orderBy(desc(appointments.tokenNumber))
      .limit(1);
      
    const nextToken = (latestAppt?.tokenNumber || 0) + 1;

    await db.insert(appointments).values({
      clinicId: authUser.clinicId,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      appointmentDate: todayStr,
      appointmentTime: timeStr,
      status: "checked_in",
      checkInTime: new Date(),
      notes: "Walk-in patient",
      tokenNumber: nextToken,
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/patients/${patientId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to check in walk-in:", error);
    return { error: "Failed to check in walk-in" };
  }
}
