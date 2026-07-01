import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, visitNotes, followUps } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const params = await props.params;
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = params;
    const body = await req.json();
    const { vitals, complaint, diagnosis, treatment, followUpRequired } = body;

    // Verify appointment belongs to this clinic
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.clinicId, authUser.clinicId)
        )
      )
      .limit(1);

    if (!appointment || !appointment.patientId) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const now = new Date();

    // 1. Save visit note
    await db.insert(visitNotes).values({
      clinicId: authUser.clinicId,
      patientId: appointment.patientId,
      appointmentId,
      complaint: complaint || null,
      vitals: vitals || null,
      diagnosis: diagnosis || null,
      treatment: treatment || null,
      followUpRequired: followUpRequired || false,
    });

    // 2. Schedule follow-up if requested
    if (followUpRequired && body.followUpDays) {
      const d = new Date();
      d.setDate(d.getDate() + Number(body.followUpDays));
      const dueDateStr = d.toISOString().split("T")[0];

      await db.insert(followUps).values({
        clinicId: authUser.clinicId,
        patientId: appointment.patientId,
        appointmentId,
        dueDate: dueDateStr,
        status: "pending",
        notes: complaint ? `Follow-up for: ${complaint}` : null,
      });
    }

    // 3. Mark appointment as completed
    await db
      .update(appointments)
      .set({
        status: "completed",
        consultationEndTime: now,
      })
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.clinicId, authUser.clinicId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Appointments Complete] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
