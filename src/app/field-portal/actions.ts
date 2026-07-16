"use server";

import { db } from "@/db";
import { doctorLeads, leadActivities, growthPartners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getPartnerId() {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");

  const [partner] = await db
    .select({ id: growthPartners.id })
    .from(growthPartners)
    .where(eq(growthPartners.authUserId, authUser.userId))
    .limit(1);

  if (!partner) throw new Error("Not a Growth Partner");
  return partner.id;
}

export async function checkPhoneExists(phone: string) {
  const partnerId = await getPartnerId(); // Ensure authorized

  const [existing] = await db
    .select({
      id: doctorLeads.id,
      assignedTo: doctorLeads.assignedTo,
      clinicName: doctorLeads.clinicName,
    })
    .from(doctorLeads)
    .where(eq(doctorLeads.phone, phone))
    .limit(1);

  if (existing) {
    return {
      exists: true,
      isAssignedToMe: existing.assignedTo === partnerId,
      clinicName: existing.clinicName,
      leadId: existing.id,
    };
  }
  return { exists: false };
}

export async function addLead(data: any) {
  const partnerId = await getPartnerId();

  const [newLead] = await db
    .insert(doctorLeads)
    .values({
      ...data,
      assignedTo: partnerId,
      source: "field_visit",
      status: "new",
      priority: "normal",
    })
    .returning();

  revalidatePath("/field-portal/leads");
  revalidatePath("/field-portal");
  return newLead.id;
}

export async function logVisit(leadId: string, notes: string, status?: string) {
  const partnerId = await getPartnerId();

  // Verify ownership
  const [lead] = await db
    .select({ assignedTo: doctorLeads.assignedTo, status: doctorLeads.status })
    .from(doctorLeads)
    .where(eq(doctorLeads.id, leadId))
    .limit(1);

  if (!lead || lead.assignedTo !== partnerId) {
    throw new Error("Lead not found or not assigned to you");
  }

  // Add activity
  await db.insert(leadActivities).values({
    leadId,
    partnerId,
    type: "visit",
    notes,
    previousStatus: lead.status,
    newStatus: status ?? lead.status,
  });

  // Update status + timestamps if provided
  if (status) {
    const updates: Record<string, any> = {
      status,
      updatedAt: new Date(),
      lastContactedAt: new Date(),
    };
    if (status === "demo_scheduled") updates.demoScheduledAt = new Date();
    if (status === "converted") updates.convertedAt = new Date();

    await db
      .update(doctorLeads)
      .set(updates)
      .where(eq(doctorLeads.id, leadId));
  } else {
    // Still stamp lastContactedAt even without status change
    await db
      .update(doctorLeads)
      .set({ lastContactedAt: new Date(), updatedAt: new Date() })
      .where(eq(doctorLeads.id, leadId));
  }

  revalidatePath(`/field-portal/leads/${leadId}`);
  revalidatePath("/field-portal/leads");
  revalidatePath("/field-portal");

  return { success: true };
}

export async function logWhatsApp(leadId: string) {
  const partnerId = await getPartnerId();

  await db.insert(leadActivities).values({
    leadId,
    partnerId,
    type: "whatsapp",
    notes: "Sent WhatsApp message",
  });

  await db
    .update(doctorLeads)
    .set({ lastContactedAt: new Date(), updatedAt: new Date() })
    .where(eq(doctorLeads.id, leadId));

  revalidatePath(`/field-portal/leads/${leadId}`);
  revalidatePath("/field-portal");
}
