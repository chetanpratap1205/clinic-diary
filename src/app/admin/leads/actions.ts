"use server";

import { db } from "@/db";
import { doctorLeads, growthPartners, type NewDoctorLead } from "@/db/schema";
import { getAuthUser } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addDoctorLead(
  data: Omit<NewDoctorLead, "id" | "createdAt" | "updatedAt">
) {
  try {
    await db.insert(doctorLeads).values({
      ...data,
      updatedAt: new Date(),
    });
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add doctor lead:", error);
    return { error: error.message || "Failed to add lead" };
  }
}

export async function updateLeadStatus(id: string, status: string) {
  try {
    const updates: Record<string, any> = {
      status,
      updatedAt: new Date(),
    };
    if (status === "contacted") updates.lastContactedAt = new Date();
    if (status === "demo_scheduled") updates.demoScheduledAt = new Date();
    if (status === "converted") updates.convertedAt = new Date();

    await db.update(doctorLeads).set(updates).where(eq(doctorLeads.id, id));
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update lead status:", error);
    return { error: error.message || "Failed to update status" };
  }
}

export async function updateLeadPriority(id: string, priority: string) {
  try {
    await db
      .update(doctorLeads)
      .set({ priority, updatedAt: new Date() })
      .where(eq(doctorLeads.id, id));
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update priority" };
  }
}

export async function assignLeadToPartner(leadId: string, partnerId: string | null) {
  try {
    await db
      .update(doctorLeads)
      .set({ assignedTo: partnerId, updatedAt: new Date() })
      .where(eq(doctorLeads.id, leadId));
    revalidatePath("/admin/leads");
    revalidatePath("/admin/partners");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to assign lead" };
  }
}

export async function bulkInsertLeads(leads: any[]) {
  const authUser = await getAuthUser();
  if (!authUser) throw new Error("Unauthorized");

  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  if (!adminIds.includes(authUser.userId)) {
    throw new Error("Unauthorized");
  }

  if (!leads || leads.length === 0) return { success: true, count: 0 };

  const newLeads = leads.map((l) => ({
    doctorName: l.doctorName || "Unknown",
    clinicName: l.clinicName || null,
    phone: String(l.phone),
    email: l.email || null,
    specialty: l.specialty || null,
    city: l.city || null,
    address: l.address || null,
    source: "imported",
    status: "new",
    priority: "normal",
  }));

  try {
    await db.insert(doctorLeads).values(newLeads);
    revalidatePath("/admin/leads");
    return { success: true, count: newLeads.length };
  } catch (error) {
    console.error("Bulk insert failed:", error);
    return { success: false, error: "Failed to import leads." };
  }
}

export async function getPartners() {
  return await db
    .select({ id: growthPartners.id, name: growthPartners.name })
    .from(growthPartners)
    .where(eq(growthPartners.isActive, true));
}
