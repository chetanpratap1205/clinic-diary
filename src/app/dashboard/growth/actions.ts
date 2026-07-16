"use server";

import { db } from "@/db";
import { products, orders, orderItems } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function requestGrowthService(service: {
  id: string;
  title: string;
  description: string;
  price?: number;
  category?: string;
}) {
  const authUser = await getAuthUser();

  if (!authUser || !authUser.clinicId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // 1. Find or create the product
    let [productRecord] = await db
      .select()
      .from(products)
      .where(eq(products.name, service.title))
      .limit(1);

    if (!productRecord) {
      const [newProduct] = await db
        .insert(products)
        .values({
          name: service.title,
          description: service.description,
          price: service.price ?? 0,
          category: service.category ?? "service",
        })
        .returning();
      productRecord = newProduct;
    }

    // 2. Create the order
    const [newOrder] = await db
      .insert(orders)
      .values({
        clinicId: authUser.clinicId,
        amount: service.price ?? 0, // In paise/cents usually, but we match the price logic
        status: "pending",
      })
      .returning();

    // 3. Create the order item
    await db.insert(orderItems).values({
      orderId: newOrder.id,
      productId: productRecord.id,
      quantity: 1,
      price: service.price ?? 0,
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("Error creating growth request order:", error);
    return { success: false, error: "Failed to submit request" };
  }
}
