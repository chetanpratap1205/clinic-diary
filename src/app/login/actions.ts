"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { growthPartners, employees } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getLoginRedirectPath(): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return "/login";
  }
  
  // 1. Check if super admin via env override
  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map(s => s.trim());
  if (adminIds.includes(user.id)) {
    return "/admin";
  }
  
  // 2. Check if internal employee / staff member
  try {
    const [empRecord] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.authUserId, user.id), eq(employees.isActive, true)))
      .limit(1);

    if (empRecord) {
      if (empRecord.role === "super_admin" || empRecord.role === "area_manager") {
        return "/admin";
      }
      return "/employee";
    }
  } catch (err) {
    console.error("Database error while checking employee role:", err);
  }

  // 3. Check if external affiliate / growth partner
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
  }
  
  // 4. Default to clinic dashboard for doctors
  // CONCIERGE SETUP: On first login, start their 14-day free trial!
  try {
    const { clinicAdmins, subscriptions } = await import("@/db/schema");
    const [adminRecord] = await db
      .select()
      .from(clinicAdmins)
      .where(eq(clinicAdmins.authUserId, user.id))
      .limit(1);

    if (adminRecord) {
      const [existingSub] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.clinicId, adminRecord.clinicId))
        .limit(1);

      if (!existingSub) {
        // Start the 14-day free trial now!
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
        await db.insert(subscriptions).values({
          clinicId: adminRecord.clinicId,
          planId: "quarterly",
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd,
        });
        console.log(`[TRIAL ACTIVATED] Started 14-day trial for clinic ${adminRecord.clinicId}`);
      }
    }
  } catch (err) {
    console.error("Database error while checking/activating trial:", err);
  }

  return "/dashboard";
}
