"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { growthPartners } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getLoginRedirectPath(): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return "/login";
  }
  
  // Check if admin
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map(s => s.trim());
  if (adminIds.includes(user.id)) {
    return "/admin";
  }
  
  // Check if growth partner
  try {
    const partnerRecord = await db
      .select()
      .from(growthPartners)
      .where(eq(growthPartners.authUserId, user.id))
      .limit(1);
      
    if (partnerRecord.length > 0 && partnerRecord[0].isActive) {
      return "/field-portal";
    }
  } catch (err) {
    console.error("Database error while checking partner role:", err);
    // Continue down to default /dashboard fallback instead of crashing
  }
  
  // Default to dashboard for doctors/clinics
  // The dashboard layout will redirect to /onboarding if clinic isn't fully set up yet
  return "/dashboard";
}
