import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import Razorpay from "razorpay";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "mock_key_id",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_key_secret",
});

const PLANS = {
  monthly: { amount: 499 * 100, name: "1 Month" },
  quarterly: { amount: 1299 * 100, name: "3 Months" },
  yearly: { amount: 4999 * 100, name: "12 Months" },
};

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await req.json();

    if (!planId || !PLANS[planId as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const plan = PLANS[planId as keyof typeof PLANS];

    if (plan.amount < 100) {
      return NextResponse.json({ error: "Amount must be at least 100 paise" }, { status: 400 });
    }

    // Create Razorpay Order
    // Note: For recurring subscriptions, you would use razorpay.subscriptions.create
    // Here we use orders for prepaid access, which is easier to test without dashboard plan setup.
    const orderOptions = {
      amount: plan.amount,
      currency: "INR",
      receipt: `rcpt_${authUser.clinicId.slice(0, 8)}_${Date.now()}`,
    };

    if (!process.env.RAZORPAY_KEY_ID) {
      return NextResponse.json({ error: "Server misconfiguration: missing Razorpay key ID" }, { status: 500 });
    }

    const order = await razorpay.orders.create(orderOptions);

    return NextResponse.json({ 
      orderId: order.id, 
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.error("[Create Subscription Error]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
