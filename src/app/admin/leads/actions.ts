"use server";

import { db } from "@/db";
import { doctorLeads, type NewDoctorLead } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    await db
      .update(doctorLeads)
      .set({ status, updatedAt: new Date() })
      .where(eq(doctorLeads.id, id));
    
    revalidatePath("/admin/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update lead status:", error);
    return { error: error.message || "Failed to update status" };
  }
}
