"use server";

import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { marketingCampaigns } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function createMarketingCampaign(data: {
  name: string;
  code: string;
  type: string;
  notes?: string;
}) {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");
  
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  if (!adminIds.includes(authUser.userId)) {
    throw new Error("Unauthorized");
  }

  try {
    await db.insert(marketingCampaigns).values({
      name: data.name,
      code: data.code.toUpperCase().replace(/\s+/g, '-'),
      type: data.type,
      notes: data.notes || null,
    });
    revalidatePath("/admin/marketing");
    return { success: true };
  } catch (err: any) {
    if (err.code === '23505') {
      return { error: "A campaign with this code already exists." };
    }
    return { error: "Failed to create campaign." };
  }
}
