import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = await req.json();

    if (!orderId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "fallback_secret";
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (generatedSignature !== razorpaySignature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    // Update order status
    await db
      .update(orders)
      .set({
        status: "processing",
        razorpayPaymentId,
      })
      .where(eq(orders.id, orderId));

    // Get the clinic slug to generate the UTM tracking URL
    const clinicResult = await db.select({ slug: clinics.slug }).from(clinics).where(eq(clinics.id, authUser.clinicId)).limit(1);
    const slug = clinicResult[0]?.slug || "unknown-clinic";

    // Update order items with generated URLs
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      const sourceTrackingStr = `paid_marketing_${item.id.split('-')[0]}`;
      const fullUrl = `https://doctor.naturexpress.in/book/${slug}?source=${sourceTrackingStr}`;
      
      await db
        .update(orderItems)
        .set({ generatedUrl: fullUrl })
        .where(eq(orderItems.id, item.id));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Order verification error:", error);
    return NextResponse.json({ error: error.message || "Verification failed" }, { status: 500 });
  }
}
