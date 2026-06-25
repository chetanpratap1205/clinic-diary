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

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) {
    return { error: "Unauthorized" };
  }

  try {
    // Only allow update if appointment belongs to doctor's clinic
    await db
      .update(appointments)
      .set({ status })
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.clinicId, authUser.clinicId)
        )
      );

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
  treatment: string;
  followUpDays: number | "none";
}) {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) {
    return { error: "Unauthorized" };
  }

  try {
    // 1. Update appointment status
    await db
      .update(appointments)
      .set({ status: "completed" })
      .where(
        and(
          eq(appointments.id, data.appointmentId),
          eq(appointments.clinicId, authUser.clinicId)
        )
      );

    // 2. Add visit notes
    if (data.patientId && (data.complaint || data.treatment)) {
      const { visitNotes } = await import("@/db/schema");
      await db.insert(visitNotes).values({
        clinicId: authUser.clinicId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        complaint: data.complaint || null,
        treatment: data.treatment || null,
        followUpRequired: data.followUpDays !== "none",
      });
    }

    // 3. Schedule follow-up if requested
    if (data.patientId && data.followUpDays !== "none") {
      const { followUps } = await import("@/db/schema");
      const d = new Date();
      d.setDate(d.getDate() + data.followUpDays);
      const dueDateStr = d.toISOString().split("T")[0];

      await db.insert(followUps).values({
        clinicId: authUser.clinicId,
        patientId: data.patientId,
        appointmentId: data.appointmentId,
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
