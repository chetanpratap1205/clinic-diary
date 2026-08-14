import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import crypto from "crypto";
import { db } from "@/db";
import { subscriptions, paymentLogs, clinics, growthPartners, commissionPayouts, doctorLeads } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";


const PLANS = {
  quarterly: { amount: Math.round(2999 * 100), name: "Quarterly" },
  yearly: { amount: Math.round(9999 * 100), name: "Annual" },
};

const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
) => {
  const body = orderId + "|" + paymentId;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");
  return expectedSignature === signature;
};

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Server misconfiguration: missing Razorpay secret" }, { status: 500 });
    }

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Check if subscription exists for clinic
    const existingSubs = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.clinicId, authUser.clinicId))
      .limit(1);

    const activeSub = existingSubs[0];
    const now = new Date();
    
    const planDetails = PLANS[planId as keyof typeof PLANS];

    // Determine trial status to handle deferred billing
    const { getClinicAccessStatus } = await import("@/lib/subscription");
    const accessStatus = await getClinicAccessStatus(authUser.clinicId);
    
    // Enterprise Upgrade Logic: Proration / Time Extension
    let currentPeriodStart = now;
    if (activeSub && activeSub.currentPeriodEnd && activeSub.currentPeriodEnd > now) {
      // Append new time to end of existing active subscription
      currentPeriodStart = new Date(activeSub.currentPeriodEnd);
    } else if (accessStatus.status === "trial_active" && accessStatus.trialEndDate) {
      // Deferred billing: start period after trial ends
      currentPeriodStart = new Date(accessStatus.trialEndDate);
    }
    
    const currentPeriodEnd = new Date(currentPeriodStart);
    
    if (planId === "quarterly") {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 3);
    } else if (planId === "yearly") {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
    }

    // Wrap operations in a single database transaction to guarantee 100% data consistency
    await db.transaction(async (tx) => {
      if (activeSub) {
        // Update existing
        await tx
          .update(subscriptions)
          .set({
            planId,
            status: "active",
            currentPeriodStart,
            currentPeriodEnd,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, activeSub.id));
      } else {
        // Create new
        await tx.insert(subscriptions).values({
          clinicId: authUser.clinicId!,
          planId,
          status: "active",
          currentPeriodStart,
          currentPeriodEnd,
        });
      }

      // Generate Invoice Number: DD/{FY}/{SEQUENCE}
      const currentYear = now.getFullYear();
      const nextYear = currentYear + 1;
      const fy = `${currentYear}-${nextYear.toString().slice(-2)}`;
      
      const [allPayments] = await tx
        .select({ count: sql<number>`count(*)` })
        .from(paymentLogs);
      
      const sequence = (Number(allPayments.count) + 1).toString().padStart(5, '0');
      const invoiceNumber = `DD/${fy}/${sequence}`;

      // Insert payment log inside the same transaction
      const [insertedPayment] = await tx.insert(paymentLogs).values({
        clinicId: authUser.clinicId!,
        invoiceNumber,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        planId,
        planName: planDetails?.name || "Unknown Plan",
        amountPaise: planDetails?.amount || 0,
        status: "paid",
      }).returning();

      // Automated Commission Calculation for Partners
      const [clinic] = await tx
        .select({ referredBy: clinics.referredBy, phone: clinics.phone })
        .from(clinics)
        .where(eq(clinics.id, authUser.clinicId!))
        .limit(1);

      if (clinic && clinic.referredBy) {
        // Look up partner commission rates
        const [partner] = await tx
          .select({
            firstSalePct: growthPartners.commissionFirstSalePct,
            renewalPct: growthPartners.commissionRenewalPct,
          })
          .from(growthPartners)
          .where(eq(growthPartners.id, clinic.referredBy))
          .limit(1);

        if (partner) {
          // Check if this is their first payment or a renewal
          const [existingPayments] = await tx
            .select({ count: sql<number>`count(*)` })
            .from(paymentLogs)
            .where(
              and(
                eq(paymentLogs.clinicId, authUser.clinicId!),
                eq(paymentLogs.status, "paid"),
                sql`${paymentLogs.id} != ${insertedPayment.id}` // Exclude the one just inserted
              )
            );

          const isFirstSale = Number(existingPayments.count) === 0;
          const pct = isFirstSale ? partner.firstSalePct : partner.renewalPct;
          
          if (pct !== null && pct > 0) {
            const commissionPaise = Math.round((planDetails.amount * pct) / 100);

            // Find matching lead to attach payout to
            const [lead] = await tx
              .select({ id: doctorLeads.id })
              .from(doctorLeads)
              .where(
                and(
                  eq(doctorLeads.assignedTo, clinic.referredBy),
                  eq(doctorLeads.phone, clinic.phone)
                )
              )
              .limit(1);

            // Update lead conversion amount if first sale
            if (isFirstSale && lead) {
              await tx
                .update(doctorLeads)
                .set({ conversionAmount: planDetails.amount })
                .where(eq(doctorLeads.id, lead.id));
            }

            // Insert Commission Payout
            await tx.insert(commissionPayouts).values({
              partnerId: clinic.referredBy,
              leadId: lead?.id || null,
              paymentLogId: insertedPayment.id,
              type: isFirstSale ? "first_sale" : "renewal",
              basePaise: planDetails.amount,
              pct,
              commissionPaise,
              status: "pending",
            });
          }
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Verify Subscription Error]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
