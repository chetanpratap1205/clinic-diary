"use server";

import { db } from "@/db";
import { clinics, growthPartners, paymentLogs, commissionPayouts, doctorLeads } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function assignReferredByAction(clinicId: string, partnerId: string | null) {
  try {
    await db
      .update(clinics)
      .set({ referredBy: partnerId })
      .where(eq(clinics.id, clinicId));

    revalidatePath(`/admin/clinics/${clinicId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function generateManualCommissionAction(clinicId: string) {
  try {
    // 1. Get Clinic and verify it has a referredBy partner
    const [clinic] = await db
      .select()
      .from(clinics)
      .where(eq(clinics.id, clinicId))
      .limit(1);

    if (!clinic || !clinic.referredBy) {
      return { success: false, error: "Clinic has no assigned partner." };
    }

    // 2. Look up partner commission rates
    const [partner] = await db
      .select({
        firstSalePct: growthPartners.commissionFirstSalePct,
        renewalPct: growthPartners.commissionRenewalPct,
      })
      .from(growthPartners)
      .where(eq(growthPartners.id, clinic.referredBy))
      .limit(1);

    if (!partner) return { success: false, error: "Partner not found." };

    // 3. Find payments for this clinic that do NOT already have a commission payout
    const payments = await db
      .select({ id: paymentLogs.id, amountPaise: paymentLogs.amountPaise })
      .from(paymentLogs)
      .leftJoin(commissionPayouts, eq(commissionPayouts.paymentLogId, paymentLogs.id))
      .where(
        and(
          eq(paymentLogs.clinicId, clinicId),
          eq(paymentLogs.status, "paid"),
          sql`${commissionPayouts.id} IS NULL` // Only payments without commission
        )
      )
      .orderBy(paymentLogs.paidAt);

    if (payments.length === 0) {
      return { success: false, error: "No missing commissions found. All paid transactions already have payouts." };
    }

    // 4. Find matching lead to attach payout to
    const [lead] = await db
      .select({ id: doctorLeads.id })
      .from(doctorLeads)
      .where(
        and(
          eq(doctorLeads.assignedTo, clinic.referredBy),
          eq(doctorLeads.phone, clinic.phone)
        )
      )
      .limit(1);

    // 5. Generate missing payouts
    // Count existing payments that DO have commission to determine if these new ones are first_sale or renewal
    const [existingPayments] = await db
      .select({ count: sql<number>`count(*)` })
      .from(paymentLogs)
      .innerJoin(commissionPayouts, eq(commissionPayouts.paymentLogId, paymentLogs.id))
      .where(
        and(
          eq(paymentLogs.clinicId, clinicId),
          eq(paymentLogs.status, "paid")
        )
      );

    let hasHadFirstSale = Number(existingPayments.count) > 0;

    await db.transaction(async (tx) => {
      for (const p of payments) {
        const isFirstSale = !hasHadFirstSale;
        const pct = isFirstSale ? partner.firstSalePct : partner.renewalPct;
        
        if (pct !== null && pct > 0) {
          const commissionPaise = Math.round((p.amountPaise * pct) / 100);

          if (isFirstSale && lead) {
            await tx
              .update(doctorLeads)
              .set({ conversionAmount: p.amountPaise, status: "converted" })
              .where(eq(doctorLeads.id, lead.id));
          }

          await tx.insert(commissionPayouts).values({
            partnerId: clinic.referredBy!,
            leadId: lead?.id || null,
            paymentLogId: p.id,
            type: isFirstSale ? "first_sale" : "renewal",
            basePaise: p.amountPaise,
            pct,
            commissionPaise,
            status: "pending",
          });
        }
        
        hasHadFirstSale = true;
      }
    });

    revalidatePath(`/admin/clinics/${clinicId}`);
    return { success: true, count: payments.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
