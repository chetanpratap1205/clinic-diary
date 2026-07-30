import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { clinics, orders, orderItems, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { GrowthClient } from "./growth-client";

export const metadata = {
  title: "Growth Hub | Doctor Diary",
};

export default async function GrowthPage() {
  const authUser = await getAuthUser();

  if (!authUser || !authUser.clinicId) {
    redirect("/login");
  }

  // Fetch clinic details for theme color and fee
  const clinicResult = await db
    .select({ consultationFee: clinics.consultationFee, themeColor: clinics.themeColor })
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);

  const consultationFee = clinicResult[0]?.consultationFee || 500;
  const themeColor = clinicResult[0]?.themeColor || "#0ea5e9";

  // Fetch requested services
  const orderedItems = await db
    .select({
      productName: products.name,
      status: orders.status
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orders.clinicId, authUser.clinicId));

  const requestedServices = orderedItems.reduce((acc, curr) => {
    // Keep the most advanced state if duplicates exist
    if (!acc[curr.productName] || curr.status === "active" || curr.status === "paid") {
      acc[curr.productName] = curr.status;
    }
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto pb-20">
      <GrowthClient 
        consultationFee={consultationFee}
        themeColor={themeColor}
        requestedServices={requestedServices}
      />
    </div>
  );
}
