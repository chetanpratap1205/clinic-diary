import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import crypto from "crypto";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

    // Calculate period end based on plan
    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date();
    
    if (planId === "monthly") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
    } else if (planId === "quarterly") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
    } else if (planId === "yearly") {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    // Check if subscription exists for clinic
    const existingSubs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.clinicId, authUser.clinicId))
      .limit(1);

    if (existingSubs.length > 0) {
      // Update existing
      await db
        .update(subscriptions)
        .set({
          planId,
          status: "active",
          currentPeriodStart,
          currentPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existingSubs[0].id));
    } else {
      // Create new
      await db.insert(subscriptions).values({
        clinicId: authUser.clinicId,
        planId,
        status: "active",
        currentPeriodStart,
        currentPeriodEnd,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Verify Subscription Error]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
