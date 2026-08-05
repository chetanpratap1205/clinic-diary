"use server";

import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";

export async function extendClinicTrialAction(clinicId: string, days: number = 14) {
  try {
    const existing = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.clinicId, clinicId))
      .limit(1);

    const now = new Date();
    const newEndDate = addDays(now, days);

    if (existing.length > 0) {
      await db
        .update(subscriptions)
        .set({
          status: "active",
          currentPeriodEnd: newEndDate,
          updatedAt: now,
        })
        .where(eq(subscriptions.clinicId, clinicId));
    } else {
      await db.insert(subscriptions).values({
        clinicId,
        planId: "quarterly",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: newEndDate,
      });
    }

    revalidatePath("/admin/clinics");
    return { success: true, newEndDate };
  } catch (error) {
    console.error("Error extending clinic trial:", error);
    return { success: false, error: "Failed to extend clinic subscription/trial." };
  }
}
