import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { doctorLeads } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctorName, clinicName, phone, doctorCount, notes } = body;

    if (!doctorName || !phone) {
      return NextResponse.json(
        { error: "Doctor Name and Phone are required." },
        { status: 400 }
      );
    }

    // Insert into doctorLeads CRM with priority='hot' and source='enterprise_inbound'
    const [newLead] = await db
      .insert(doctorLeads)
      .values({
        doctorName: doctorName.trim(),
        clinicName: clinicName ? clinicName.trim() : "Enterprise / Polyclinic",
        phone: phone.trim(),
        source: "enterprise_inbound",
        status: "new",
        priority: "hot",
        leadCategory: "C", // High intent inbound
        notes: `Enterprise Request | Doctors: ${doctorCount || 1} | Requirements: ${notes || "None"}`,
      })
      .returning();

    return NextResponse.json({
      success: true,
      leadId: newLead.id,
      message: "Enterprise lead recorded successfully.",
    });
  } catch (error: any) {
    console.error("Error creating enterprise lead:", error);
    return NextResponse.json(
      { error: "Failed to submit enterprise inquiry. Please try again." },
      { status: 500 }
    );
  }
}
