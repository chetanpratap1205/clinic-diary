import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import crypto from "crypto";
import { db } from "@/db";
import { subscriptions, paymentLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const PLANS = {
  monthly: { amount: 499 * 100, name: "1 Month" },
  quarterly: { amount: 1299 * 100, name: "3 Months" },
  yearly: { amount: 4999 * 100, name: "12 Months" },
};

const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");
  return expectedSignature === signature;
};

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Server misconfiguration: missing Razorpay secret" }, { status: 500 });
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Check if subscription exists for clinic
    const existingSubs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.clinicId, authUser.clinicId))
      .limit(1);

    const activeSub = existingSubs[0];
    const now = new Date();
    
    // Enterprise Upgrade Logic: Proration / Time Extension
    // If they have an active subscription that hasn't expired, we append the new time to the end of it
    const currentPeriodStart = activeSub && activeSub.currentPeriodEnd && activeSub.currentPeriodEnd > now 
      ? new Date(activeSub.currentPeriodEnd) 
      : now;
    
    const currentPeriodEnd = new Date(currentPeriodStart);
    
    if (planId === "monthly") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else if (planId === "quarterly") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
    } else if (planId === "yearly") {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    const planDetails = PLANS[planId as keyof typeof PLANS];

    // Wrap operations in a single database transaction to guarantee 100% data consistency
    await db.transaction(async (tx) => {
      if (activeSub) {
        // Update existing
        await tx
          .update(subscriptions)
          .set({
            planId,
            status: "active",
            currentPeriodStart,
            currentPeriodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, activeSub.id));
      } else {
        // Create new
        await tx.insert(subscriptions).values({
          clinicId: authUser.clinicId!,
          planId,
          status: "active",
          currentPeriodStart,
          currentPeriodEnd,
        });
      }

      // Insert payment log inside the same transaction
      await tx.insert(paymentLogs).values({
        clinicId: authUser.clinicId!,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        planId,
        planName: planDetails?.name || "Unknown Plan",
        amountPaise: planDetails?.amount || 0,
        status: "paid",
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Verify Subscription Error]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
