import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, appointments, followUps } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = (await params).patientId;

    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(eq(patients.id, patientId), eq(patients.clinicId, authUser.clinicId))
      )
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Fetch visit history (appointments)
    const visitHistory = await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, patientId))
      .orderBy(desc(appointments.appointmentDate), desc(appointments.appointmentTime));

    // Fetch follow-up history
    const followUpHistory = await db
      .select()
      .from(followUps)
      .where(eq(followUps.patientId, patientId))
      .orderBy(desc(followUps.dueDate));

    return NextResponse.json({
      patient,
      visitHistory,
      followUpHistory,
    });
  } catch (err) {
    console.error("[Patient GET] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = (await params).patientId;

    const [deleted] = await db
      .delete(patients)
      .where(
        and(eq(patients.id, patientId), eq(patients.clinicId, authUser.clinicId))
      )
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, patient: deleted });
  } catch (err) {
    console.error("[Patient DELETE] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = (await params).patientId;
    const body = await req.json();
    const { name, phone, age, gender, address } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const { isValidIndianMobileNumber } = await import("@/lib/validations");
    if (!isValidIndianMobileNumber(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Check if another patient (different ID) has this phone number
    const existing = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.clinicId, authUser.clinicId),
          eq(patients.phone, phone)
        )
      );

    const duplicate = existing.find(p => p.id !== patientId);
    if (duplicate) {
      return NextResponse.json(
        { error: "Another patient with this phone number already exists" },
        { status: 400 }
      );
    }

    const [updatedPatient] = await db
      .update(patients)
      .set({
        name,
        phone,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        address: address || null,
      })
      .where(
        and(eq(patients.id, patientId), eq(patients.clinicId, authUser.clinicId))
      )
      .returning();

    if (!updatedPatient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({ patient: updatedPatient });
  } catch (err) {
    console.error("[Patient PATCH] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
