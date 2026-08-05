"use server";

import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, products, clinics } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");
  
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  if (!adminIds.includes(authUser.userId)) {
    throw new Error("Unauthorized");
  }
  return authUser;
}

export async function getOrders() {
  await verifyAdmin();

  const allOrders = await db
    .select({
      order: orders,
      clinicName: clinics.name,
      clinicDoctorName: clinics.doctorName,
      clinicPhone: clinics.phone,
      clinicAddress: clinics.address,
    })
    .from(orders)
    .innerJoin(clinics, eq(orders.clinicId, clinics.id))
    .orderBy(desc(orders.createdAt));

  const ordersWithItems = await Promise.all(
    allOrders.map(async (row) => {
      const items = await db
        .select({
          item: orderItems,
          productName: products.name,
          category: products.category,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, row.order.id));

      return {
        ...row,
        items,
      };
    })
  );

  return ordersWithItems;
}

export async function getClinicsAndProducts() {
  await verifyAdmin();

  const clinicsList = await db
    .select({
      id: clinics.id,
      name: clinics.name,
      doctorName: clinics.doctorName,
      phone: clinics.phone,
      address: clinics.address,
    })
    .from(clinics)
    .orderBy(desc(clinics.createdAt));

  const productsList = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(products.name);

  return { clinics: clinicsList, products: productsList };
}

export async function createAdminOrder(data: {
  clinicId: string;
  amount: number;
  paymentStatus: string;
  planType: string;
  shippingAddress: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  items: { productId: string; quantity: number; generatedUrl?: string }[];
}) {
  await verifyAdmin();

  try {
    const [newOrder] = await db
      .insert(orders)
      .values({
        clinicId: data.clinicId,
        amount: data.amount,
        status: "pending",
        paymentStatus: data.paymentStatus || "paid",
        planType: data.planType || "custom",
        shippingAddress: data.shippingAddress.trim() || null,
        courierName: data.courierName?.trim() || null,
        trackingNumber: data.trackingNumber?.trim() || null,
        trackingUrl: data.trackingUrl?.trim() || null,
        notes: data.notes?.trim() || null,
      })
      .returning();

    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        // Fetch product price snapshot
        const [prod] = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .limit(1);

        await db.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity || 1,
          price: prod ? prod.price : 0,
          generatedUrl: item.generatedUrl || null,
        });
      }
    }

    revalidatePath("/admin/orders");
    return { success: true, orderId: newOrder.id };
  } catch (err: any) {
    return { error: err.message || "Failed to create order." };
  }
}

export async function markOrderShipped(orderId: string, trackingUrl?: string) {
  await verifyAdmin();
  await db
    .update(orders)
    .set({ status: "shipped", trackingUrl: trackingUrl || null, updatedAt: new Date() })
    .where(eq(orders.id, orderId));
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function updateOrderStatus(orderId: string, status: string) {
  await verifyAdmin();

  try {
    const updatePayload: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "delivered") {
      updatePayload.deliveredAt = new Date();
    }

    await db
      .update(orders)
      .set(updatePayload)
      .where(eq(orders.id, orderId));

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to update order status." };
  }
}

export async function updateShippingDetails(
  orderId: string,
  data: {
    courierName?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    shippingAddress?: string;
    notes?: string;
  }
) {
  await verifyAdmin();

  try {
    await db
      .update(orders)
      .set({
        courierName: data.courierName?.trim() || null,
        trackingNumber: data.trackingNumber?.trim() || null,
        trackingUrl: data.trackingUrl?.trim() || null,
        shippingAddress: data.shippingAddress?.trim() || null,
        notes: data.notes?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to update shipping details." };
  }
}

export async function deleteOrder(orderId: string) {
  await verifyAdmin();

  try {
    await db.delete(orders).where(eq(orders.id, orderId));
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to delete order." };
  }
}
