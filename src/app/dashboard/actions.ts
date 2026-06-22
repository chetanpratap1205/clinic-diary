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
