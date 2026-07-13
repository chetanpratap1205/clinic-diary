import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { products, orders, orderItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import Razorpay from "razorpay";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_fallback",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "fallback_secret",
});

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity = 1, shippingAddress } = await req.json();

    if (!productId || !shippingAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const productList = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!productList.length) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = productList[0];
    const totalAmountPaise = product.price * quantity;

    // Handle free items (Starter Kit)
    if (totalAmountPaise === 0) {
      const [newOrder] = await db.insert(orders).values({
        clinicId: authUser.clinicId,
        amount: 0,
        status: "processing", // Immediately processing
        shippingAddress,
      }).returning({ id: orders.id });

      const trackingUrl = `https://doctor.naturexpress.in/book/clinic-slug?source=free_kit_${newOrder.id.split('-')[0]}`; // Example generation

      await db.insert(orderItems).values({
        orderId: newOrder.id,
        productId: product.id,
        quantity,
        price: 0,
        generatedUrl: trackingUrl,
      });

      return NextResponse.json({ isFree: true, orderId: newOrder.id });
    }

    // Initialize Razorpay Order
    const rzpOrder = await razorpay.orders.create({
      amount: totalAmountPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    // Save pending order to DB
    const [newOrder] = await db.insert(orders).values({
      clinicId: authUser.clinicId,
      amount: totalAmountPaise,
      status: "pending",
      shippingAddress,
      razorpayOrderId: rzpOrder.id,
    }).returning({ id: orders.id });

    // Save order item
    await db.insert(orderItems).values({
      orderId: newOrder.id,
      productId: product.id,
      quantity,
      price: product.price,
    });

    return NextResponse.json({
      isFree: false,
      orderId: newOrder.id,
      razorpayOrderId: rzpOrder.id,
      amount: totalAmountPaise,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_test_fallback",
    });

  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}
