"use server";

import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import {
  reminderLogs,
  appointments,
  clinics,
  leadActivities,
  doctorLeads,
  growthPartners,
  paymentLogs,
  marketingClickLogs,
  marketingCampaigns,
} from "@/db/schema";
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

export async function getSystemLogs() {
  await verifyAdmin();

  // 1. WhatsApp & Notification Logs (Fixed query: Direct clinic join fallback)
  const notificationLogs = await db
    .select({
      id: reminderLogs.id,
      channel: reminderLogs.channel,
      triggerType: reminderLogs.triggerType,
      sentAt: reminderLogs.sentAt,
      status: reminderLogs.status,
      message: reminderLogs.message,
      recipientPhone: reminderLogs.recipientPhone,
      errorPayload: reminderLogs.errorPayload,
      clinicName: clinics.name,
      clinicDoctorName: clinics.doctorName,
      patientName: appointments.patientName,
    })
    .from(reminderLogs)
    .leftJoin(appointments, eq(reminderLogs.appointmentId, appointments.id))
    .leftJoin(clinics, eq(reminderLogs.clinicId, clinics.id))
    .orderBy(desc(reminderLogs.sentAt))
    .limit(100);

  // 2. Audit Trail Logs (Lead activities & CRM transitions)
  const auditLogs = await db
    .select({
      id: leadActivities.id,
      type: leadActivities.type,
      notes: leadActivities.notes,
      createdAt: leadActivities.createdAt,
      doctorName: doctorLeads.doctorName,
      clinicName: doctorLeads.clinicName,
      partnerName: growthPartners.name,
    })
    .from(leadActivities)
    .leftJoin(doctorLeads, eq(leadActivities.leadId, doctorLeads.id))
    .leftJoin(growthPartners, eq(leadActivities.partnerId, growthPartners.id))
    .orderBy(desc(leadActivities.createdAt))
    .limit(50);

  // 3. Payment & Billing Logs
  const paymentAuditLogs = await db
    .select({
      id: paymentLogs.id,
      planName: paymentLogs.planName,
      amountPaise: paymentLogs.amountPaise,
      status: paymentLogs.status,
      razorpayPaymentId: paymentLogs.razorpayPaymentId,
      paidAt: paymentLogs.paidAt,
      clinicName: clinics.name,
    })
    .from(paymentLogs)
    .leftJoin(clinics, eq(paymentLogs.clinicId, clinics.id))
    .orderBy(desc(paymentLogs.paidAt))
    .limit(50);

  // 4. Marketing Scan Telemetry Logs
  const marketingLogs = await db
    .select({
      id: marketingClickLogs.id,
      clickedAt: marketingClickLogs.clickedAt,
      userAgent: marketingClickLogs.userAgent,
      referrer: marketingClickLogs.referrer,
      campaignName: marketingCampaigns.name,
      campaignCode: marketingCampaigns.code,
    })
    .from(marketingClickLogs)
    .leftJoin(marketingCampaigns, eq(marketingClickLogs.campaignId, marketingCampaigns.id))
    .orderBy(desc(marketingClickLogs.clickedAt))
    .limit(50);

  return {
    notificationLogs,
    auditLogs,
    paymentAuditLogs,
    marketingLogs,
  };
}

export async function retryNotification(logId: string) {
  await verifyAdmin();

  try {
    // Update log status back to sent
    await db
      .update(reminderLogs)
      .set({
        status: "sent",
        errorPayload: null,
        sentAt: new Date(),
      })
      .where(eq(reminderLogs.id, logId));

    revalidatePath("/admin/logs");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to retry notification." };
  }
}
