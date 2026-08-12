"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";

// Server action to mark lead as hot
export async function expressLeadInterest(slug: string) {
  try {
    const { doctorLeads } = await import("@/db/schema");
    const [lead] = await db
      .select({ id: doctorLeads.id, priority: doctorLeads.priority })
      .from(doctorLeads)
      .where(eq(doctorLeads.clinicSlug, slug))
      .limit(1);

    if (lead) {
      await db
        .update(doctorLeads)
        .set({ goLiveIntentAt: new Date() })
        .where(eq(doctorLeads.id, lead.id));
      
      return { success: true };
    }
    return { error: "Lead not found" };
  } catch (error) {
    console.error("Failed to mark interest:", error);
    return { error: "Failed" };
  }
}

