"use server";

import { db } from "@/db";
import { doctorLeads } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function submitLeadMagnetAction(formData: FormData) {
  try {
    const email = formData.get("email")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim() || "";
    const doctorName = formData.get("doctorName")?.toString().trim() || "Doctor";

    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    // Check if lead already exists with this email or phone
    const existing = await db
      .select({ id: doctorLeads.id })
      .from(doctorLeads)
      .where(eq(doctorLeads.email, email))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(doctorLeads).values({
        doctorName: doctorName,
        email: email,
        phone: phone || "N/A",
        source: "lead_magnet_noshow_guide",
        status: "new",
        priority: "warm",
        notes: "Requested 5-Step System to Eliminate No-Shows PDF Checklist",
      });
    }

    return {
      success: true,
      message: "Checklist ready! Click below to download your copy.",
      downloadUrl: "/assets/docs/5-step-noshow-elimination-guide.pdf"
    };
  } catch (err: any) {
    console.error("Error saving lead magnet submission:", err);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
