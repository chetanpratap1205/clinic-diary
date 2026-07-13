import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { products, clinics } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { GrowthClient } from "./growth-client";

export const metadata = {
  title: "Growth & Marketing | Clinic Diary",
};

export default async function GrowthPage() {
  const authUser = await getAuthUser();

  if (!authUser || !authUser.clinicId) {
    redirect("/login");
  }

  // Fetch all active products
  const availableProducts = await db
    .select()
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.price));

  // Fetch clinic fee to populate the ROI calculator default
  const clinicResult = await db
    .select({ consultationFee: clinics.consultationFee, themeColor: clinics.themeColor })
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);

  const consultationFee = clinicResult[0]?.consultationFee || 500;
  const themeColor = clinicResult[0]?.themeColor || "#0ea5e9";

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex flex-col space-y-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Growth & Marketing</h2>
          <p className="text-muted-foreground mt-1">
            Acquire more patients with premium, trackable physical assets for your clinic.
          </p>
        </div>
      </div>

      <GrowthClient 
        products={availableProducts} 
        consultationFee={consultationFee}
        themeColor={themeColor}
      />
    </div>
  );
}
