"use server";

import { db } from "@/db";
import { followUps } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function adminUpdateFollowUpStatusAction(followUpId: string, status: string) {
  try {
    await db
      .update(followUps)
      .set({
        status,
        completedAt: status === "completed" ? new Date() : null,
      })
      .where(eq(followUps.id, followUpId));

    revalidatePath("/admin/follow-ups");
    return { success: true };
  } catch (error) {
    console.error("Error updating admin follow-up:", error);
    return { success: false, error: "Failed to update follow-up status." };
  }
}
