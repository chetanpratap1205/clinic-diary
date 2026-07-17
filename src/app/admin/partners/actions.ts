"use server";

import { db } from "@/db";
import { growthPartners, doctorLeads } from "@/db/schema";
import { eq, sql, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ─── Create a new Growth Partner (Admin only) ─────────────────────────────────
export async function createPartnerAction(data: {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  region?: string;
  targetMonthly?: number;
}) {
  try {
    // 1. Generate a referral code
    const referralCode = `GP-${data.name.split(" ")[0].toUpperCase()}-${Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase()}`;

    // 2. Create Supabase Auth user and send invite email (magic link)
    // redirectTo uses /auth/callback?next=/field-portal so the smart routing
    // in the callback correctly identifies them as a partner and routes them there.
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
        data: {
          name: data.name,
          role: "growth_partner",
        },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "https://doctor-diary.in"}/auth/callback?next=/field-portal`,
      });

    if (authError) {
      console.error("Supabase invite error:", authError);
      return { success: false, error: authError.message };
    }

    // 3. Insert into growth_partners table
    const [partner] = await db
      .insert(growthPartners)
      .values({
        authUserId: authData.user.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        city: data.city || null,
        region: data.region || null,
        targetMonthly: data.targetMonthly ?? 5,
        commissionFirstSalePct: 30,
        commissionRenewalPct: 10,
        referralCode,
      })
      .returning();

    revalidatePath("/admin/partners");
    return { success: true, partner };
  } catch (error: any) {
    console.error("createPartnerAction error:", error);
    return { success: false, error: error.message || "Failed to create partner" };
  }
}

// ─── Toggle partner active/inactive ──────────────────────────────────────────
export async function togglePartnerActiveAction(partnerId: string, isActive: boolean) {
  try {
    await db
      .update(growthPartners)
      .set({ isActive })
      .where(eq(growthPartners.id, partnerId));

    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Update partner info ──────────────────────────────────────────────────────
export async function updatePartnerAction(
  partnerId: string,
  data: {
    name?: string;
    phone?: string;
    city?: string;
    region?: string;
    targetMonthly?: number;
  }
) {
  try {
    await db
      .update(growthPartners)
      .set({ ...data })
      .where(eq(growthPartners.id, partnerId));

    revalidatePath("/admin/partners");
    revalidatePath(`/admin/partners/${partnerId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Bulk-assign leads to a partner ──────────────────────────────────────────
// Admin can assign 10, 50, 100 unassigned leads at once
export async function bulkAssignLeadsAction(partnerId: string, count: number) {
  try {
    // Get `count` unassigned leads ordered by created date (oldest first)
    const unassignedLeads = await db
      .select({ id: doctorLeads.id })
      .from(doctorLeads)
      .where(
        and(
          sql`${doctorLeads.assignedTo} IS NULL`,
          ne(doctorLeads.status, "converted"),
          ne(doctorLeads.status, "rejected")
        )
      )
      .limit(count);

    if (unassignedLeads.length === 0) {
      return { success: false, error: "No unassigned leads available" };
    }

    const ids = unassignedLeads.map((l) => l.id);

    // Drizzle doesn't have a batch update with IN natively, use raw SQL
    await db
      .update(doctorLeads)
      .set({ assignedTo: partnerId, updatedAt: new Date() })
      .where(sql`${doctorLeads.id} = ANY(${ids}::uuid[])`);

    revalidatePath("/admin/partners");
    revalidatePath(`/admin/partners/${partnerId}`);
    revalidatePath("/admin/leads");
    return { success: true, assigned: ids.length };
  } catch (error: any) {
    console.error("bulkAssignLeadsAction error:", error);
    return { success: false, error: error.message };
  }
}

// ─── Assign a single lead to a partner ───────────────────────────────────────
export async function assignLeadToPartnerAction(leadId: string, partnerId: string | null) {
  try {
    await db
      .update(doctorLeads)
      .set({ assignedTo: partnerId, updatedAt: new Date() })
      .where(eq(doctorLeads.id, leadId));

    revalidatePath("/admin/leads");
    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Get all partners (for dropdowns) ────────────────────────────────────────
export async function getPartnersAction() {
  return await db
    .select({ id: growthPartners.id, name: growthPartners.name, email: growthPartners.email })
    .from(growthPartners)
    .where(eq(growthPartners.isActive, true));
}

// ─── Mark commission payout as paid ──────────────────────────────────────────
export async function markCommissionPaidAction(payoutId: string) {
  const { commissionPayouts } = await import("@/db/schema");
  try {
    await db
      .update(commissionPayouts)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(commissionPayouts.id, payoutId));

    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Resend invite email to an existing partner ──────────────────────────────
// Admin can click "Resend Invite" if the original email expired.
export async function resendPartnerInviteAction(partnerId: string) {
  try {
    // Get partner details
    const [partner] = await db
      .select({ email: growthPartners.email, name: growthPartners.name })
      .from(growthPartners)
      .where(eq(growthPartners.id, partnerId))
      .limit(1);

    if (!partner) {
      return { success: false, error: "Partner not found" };
    }

    // Re-invite via Supabase admin (sends a fresh magic link)
    const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      partner.email,
      {
        data: {
          name: partner.name,
          role: "growth_partner",
        },
        redirectTo: `${
          process.env.NEXT_PUBLIC_APP_URL || "https://doctor-diary.in"
        }/auth/callback?next=/field-portal`,
      }
    );

    if (error) {
      // If the user already exists and confirmed, Supabase may return an error;
      // in that case we just tell them to use /partner/login directly.
      if (error.message.includes("already been registered") || error.message.includes("already exists")) {
        return {
          success: false,
          error: `This partner already has an account. Ask them to sign in at /partner/login`,
        };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("resendPartnerInviteAction error:", error);
    return { success: false, error: error.message || "Failed to resend invite" };
  }
}
