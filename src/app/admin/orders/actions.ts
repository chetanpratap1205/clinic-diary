"use server";

import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { orders, orderItems, products, clinics } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getOrders() {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");
  
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  if (!adminIds.includes(authUser.userId)) {
    throw new Error("Unauthorized");
  }

  const allOrders = await db
    .select({
      order: orders,
      clinicName: clinics.name,
      clinicPhone: clinics.phone,
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

export async function markOrderShipped(orderId: string, trackingUrl?: string) {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");
  
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  if (!adminIds.includes(authUser.userId)) {
    throw new Error("Unauthorized");
  }

  await db
    .update(orders)
    .set({ status: "shipped", trackingUrl: trackingUrl || null })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
}
