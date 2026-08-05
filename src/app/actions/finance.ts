"use server";

import { db } from "@/db";
import { commissionPayouts } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function settlePartnerPayoutsAction(partnerId: string, notes?: string) {
  try {
    await db
      .update(commissionPayouts)
      .set({
        status: "paid",
        paidAt: new Date(),
        notes: notes ? notes : "Settled via Admin Finance Console",
      })
      .where(
        and(
          eq(commissionPayouts.partnerId, partnerId),
          eq(commissionPayouts.status, "pending")
        )
      );

    revalidatePath("/admin/finance");
    return { success: true };
  } catch (error) {
    console.error("Error settling partner payout:", error);
    return { success: false, error: "Failed to settle partner payout." };
  }
}
