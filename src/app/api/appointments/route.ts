import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("from");
    const dateTo = searchParams.get("to");
    const status = searchParams.get("status");

    const conditions = [eq(appointments.clinicId, authUser.clinicId)];

    if (dateFrom) conditions.push(gte(appointments.appointmentDate, dateFrom));
    if (dateTo) conditions.push(lte(appointments.appointmentDate, dateTo));
    if (status) conditions.push(eq(appointments.status, status));

    const result = await db
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(appointments.appointmentDate, appointments.appointmentTime);

    return NextResponse.json({ appointments: result });
  } catch (err) {
    console.error("[Appointments GET] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 });
    }

    const validStatuses = ["confirmed", "cancelled", "completed", "no_show", "checked_in", "in_consultation"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [updated] = await db
      .update(appointments)
      .set({ status })
      .where(
        and(
          eq(appointments.id, id),
          eq(appointments.clinicId, authUser.clinicId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    return NextResponse.json({ appointment: updated });
  } catch (err) {
    console.error("[Appointments PATCH] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { patientId, appointmentDate, appointmentTime, notes } = body;

    if (!patientId || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { patients } = await import("@/db/schema");
    const [patient] = await db
      .select()
      .from(patients)
      .where(and(eq(patients.id, patientId), eq(patients.clinicId, authUser.clinicId)))
      .limit(1);

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const [newAppt] = await db.insert(appointments).values({
      clinicId: authUser.clinicId,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      appointmentDate,
      appointmentTime,
      status: "confirmed", // Since booked from dashboard
      notes,
    }).returning();

    // Auto-Resolve pending follow-ups for this patient
    const { followUps } = await import("@/db/schema");
    const pendingFollowUps = await db
      .select()
      .from(followUps)
      .where(
        and(
          eq(followUps.patientId, patient.id),
          eq(followUps.clinicId, authUser.clinicId),
          eq(followUps.status, "pending")
        )
      )
      .orderBy(followUps.dueDate);

    if (pendingFollowUps.length > 0) {
      // Complete the oldest pending follow-up and link this new appointment to it
      const targetFu = pendingFollowUps[0];
      await db
        .update(followUps)
        .set({
          status: "completed",
          completedAt: new Date(),
          followUpAppointmentId: newAppt.id,
        })
        .where(eq(followUps.id, targetFu.id));
    }

    return NextResponse.json({ appointment: newAppt });
  } catch (err) {
    console.error("[Appointments POST] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
