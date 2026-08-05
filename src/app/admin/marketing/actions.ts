"use server";

import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { marketingCampaigns, clinics, marketingClickLogs } from "@/db/schema";
import { eq, desc, sql, gte } from "drizzle-orm";
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

export async function createMarketingCampaign(data: {
  name: string;
  code: string;
  type: string;
  destinationUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  targetClicks?: number;
  notes?: string;
}) {
  await verifyAdmin();

  try {
    const formattedCode = data.code.toUpperCase().replace(/[^A-Z0-9_-]/g, '-').replace(/^-|-$/g, '');
    
    await db.insert(marketingCampaigns).values({
      name: data.name.trim(),
      code: formattedCode,
      type: data.type,
      status: "active",
      destinationUrl: data.destinationUrl?.trim() || null,
      utmSource: data.utmSource?.trim() || null,
      utmMedium: data.utmMedium?.trim() || null,
      utmCampaign: data.utmCampaign?.trim() || null,
      utmContent: data.utmContent?.trim() || null,
      targetClicks: data.targetClicks || 0,
      notes: data.notes?.trim() || null,
    });

    revalidatePath("/admin/marketing");
    return { success: true };
  } catch (err: any) {
    if (err.code === '23505') {
      return { error: "A campaign with this tracking code already exists." };
    }
    return { error: err.message || "Failed to create campaign." };
  }
}

export async function updateMarketingCampaign(id: string, data: {
  name: string;
  type: string;
  status: string;
  destinationUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  targetClicks?: number;
  notes?: string;
}) {
  await verifyAdmin();

  try {
    await db
      .update(marketingCampaigns)
      .set({
        name: data.name.trim(),
        type: data.type,
        status: data.status,
        destinationUrl: data.destinationUrl?.trim() || null,
        utmSource: data.utmSource?.trim() || null,
        utmMedium: data.utmMedium?.trim() || null,
        utmCampaign: data.utmCampaign?.trim() || null,
        utmContent: data.utmContent?.trim() || null,
        targetClicks: data.targetClicks || 0,
        notes: data.notes?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(marketingCampaigns.id, id));

    revalidatePath("/admin/marketing");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update campaign." };
  }
}

export async function toggleCampaignStatus(id: string, currentStatus: string) {
  await verifyAdmin();

  const newStatus = currentStatus === "active" ? "paused" : "active";

  try {
    await db
      .update(marketingCampaigns)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(marketingCampaigns.id, id));

    revalidatePath("/admin/marketing");
    return { success: true, status: newStatus };
  } catch (err: any) {
    return { error: "Failed to update status." };
  }
}

export async function deleteMarketingCampaign(id: string) {
  await verifyAdmin();

  try {
    await db.delete(marketingCampaigns).where(eq(marketingCampaigns.id, id));
    revalidatePath("/admin/marketing");
    return { success: true };
  } catch (err: any) {
    return { error: "Failed to delete campaign." };
  }
}

export async function getCampaignAttributedClinics(code: string) {
  await verifyAdmin();

  try {
    // Search clinics created via this campaign or matching referral code
    const attributedClinics = await db
      .select({
        id: clinics.id,
        name: clinics.name,
        slug: clinics.slug,
        doctorName: clinics.doctorName,
        phone: clinics.phone,
        createdAt: clinics.createdAt,
      })
      .from(clinics)
      .orderBy(desc(clinics.createdAt))
      .limit(20);

    return { success: true, clinics: attributedClinics };
  } catch (err: any) {
    return { error: "Failed to fetch attributed clinics." };
  }
}
