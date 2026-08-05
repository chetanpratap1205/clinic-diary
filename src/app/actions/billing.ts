"use server";

import { db } from "@/db";
import { paymentLogs, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addMonths, addYears } from "date-fns";

interface RecordOfflinePaymentParams {
  clinicId: string;
  planId: string; // quarterly | yearly | custom
  planName: string;
  amountRupees: number;
  paymentMethod: string; // bank_transfer | upi | cash | cheque
  referenceNumber: string; // UTR or Ref ID
  notes?: string;
}

export async function recordOfflinePaymentAction({
  clinicId,
  planId,
  planName,
  amountRupees,
  paymentMethod,
  referenceNumber,
  notes,
}: RecordOfflinePaymentParams) {
  try {
    const amountPaise = Math.round(amountRupees * 100);
    const now = new Date();
    const cleanRef = referenceNumber.trim() || `OFF_${Date.now()}`;
    const orderId = `OFFLINE_${cleanRef}`;
    const paymentId = `PAY_${paymentMethod.toUpperCase()}_${cleanRef}`;

    // 1. Insert Payment Log
    const [insertedLog] = await db
      .insert(paymentLogs)
      .values({
        clinicId,
        planId,
        planName,
        amountPaise,
        status: "paid",
        paidAt: now,
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
      })
      .returning();

    // 2. Calculate subscription period
    let periodEnd = addMonths(now, 3);
    if (planId === "yearly") {
      periodEnd = addYears(now, 1);
    } else if (planId === "monthly") {
      periodEnd = addMonths(now, 1);
    }

    // 3. Update or Create Subscription
    const existingSub = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.clinicId, clinicId))
      .limit(1);

    if (existingSub.length > 0) {
      await db
        .update(subscriptions)
        .set({
          planId,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          updatedAt: now,
        })
        .where(eq(subscriptions.clinicId, clinicId));
    } else {
      await db.insert(subscriptions).values({
        clinicId,
        planId,
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });
    }

    revalidatePath("/admin/billing");
    revalidatePath("/admin/finance");
    revalidatePath("/admin/clinics");

    return { success: true, paymentId: insertedLog?.id };
  } catch (error) {
    console.error("Error recording offline payment:", error);
    return { success: false, error: "Failed to record offline payment." };
  }
}
