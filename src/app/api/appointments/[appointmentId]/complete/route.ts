import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, visitNotes, followUps, clinics } from "@/db/schema";
import { eq, and, lte, desc } from "drizzle-orm";
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
    if (complaint || vitals || diagnosis || treatment) {
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
    }

    // 2. Mark appointment as completed with fee
    const updateData: any = {
      status: "completed",
      consultationEndTime: now,
    };
    if (body.feeCollected !== undefined && body.feeCollected !== null) {
      updateData.feeCollected = Number(body.feeCollected);
    }

    await db
      .update(appointments)
      .set(updateData)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.clinicId, authUser.clinicId)
        )
      );

    // ─── P0: Golden Thread — complete all linked follow-ups ──────────────────
    // Path 1: follow-up that ORIGINATED this appointment (appointmentId reference)
    await db
      .update(followUps)
      .set({ status: "completed", completedAt: now })
      .where(
        and(
          eq(followUps.appointmentId, appointmentId),
          eq(followUps.clinicId, authUser.clinicId),
          eq(followUps.status, "pending")
        )
      );
    // Path 2: follow-up whose RETURN appointment = this one (followUpAppointmentId reference)
    await db
      .update(followUps)
      .set({ status: "completed", completedAt: now })
      .where(
        and(
          eq(followUps.followUpAppointmentId, appointmentId),
          eq(followUps.clinicId, authUser.clinicId),
          eq(followUps.status, "pending")
        )
      );
    // ─── end golden thread ────────────────────────────────────────────────────

    // 3. Schedule new follow-up if requested
    if (followUpRequired && body.followUpDays && appointment.patientId) {
      const { CLINIC_TIMEZONE } = await import("@/lib/timezone");
      const { formatInTimeZone } = await import("date-fns-tz");
      const { addDays } = await import("date-fns");
      const targetDate = addDays(now, Number(body.followUpDays));
      const dueDateStr = formatInTimeZone(targetDate, CLINIC_TIMEZONE, "yyyy-MM-dd");

      // ─── P0: Determine free vs paid based on clinic policy ────────────────
      const [clinicData] = await db
        .select({ freeFollowupDays: clinics.freeFollowupDays })
        .from(clinics)
        .where(eq(clinics.id, authUser.clinicId))
        .limit(1);

      const freeWindow = clinicData?.freeFollowupDays ?? 0;
      const isFree = freeWindow > 0 && Number(body.followUpDays) <= freeWindow;

      await db.insert(followUps).values({
        clinicId: authUser.clinicId,
        patientId: appointment.patientId,
        appointmentId, // originating appointment
        dueDate: dueDateStr,
        status: "pending",
        isFree,
        feeOverride: isFree ? 0 : null,
        sourceType: "auto",
        notes: complaint ? `Follow-up for: ${complaint}` : null,
      });
      // ─── end P0 ──────────────────────────────────────────────────────────
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Appointments Complete] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
