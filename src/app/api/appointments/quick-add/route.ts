import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, followUps } from "@/db/schema";
import { eq, and, lte, desc } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { getClinicTodayDate } from "@/lib/timezone";
import { ensureUniqueTime } from "@/lib/appointment-utils";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const patientId = formData.get("patientId") as string;
    const patientName = formData.get("patientName") as string;
    const patientPhone = formData.get("patientPhone") as string;

    if (!patientId || !patientName || !patientPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date();
    const appointmentDate = getClinicTodayDate();

    // Fetch existing appointments for today to determine token and prevent time collisions
    const todayAppointmentsData = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, authUser.clinicId),
          eq(appointments.appointmentDate, appointmentDate)
        )
      );

    const existingTimes = new Set<string>(todayAppointmentsData.map((a) => a.appointmentTime));

    // Fetch next available slot according to clinic's schedule settings
    const { getAvailableSlotsForDate } = await import("@/lib/slots");
    const { CLINIC_TIMEZONE } = await import("@/lib/timezone");
    const { formatInTimeZone } = await import("date-fns-tz");

    const slots = await getAvailableSlotsForDate(authUser.clinicId, appointmentDate);
    
    // Find the first available slot that is >= current time in clinic timezone
    const currentTimeStr = formatInTimeZone(now, CLINIC_TIMEZONE, 'HH:mm');
    const futureSlots = slots.filter(s => s.available && s.time >= currentTimeStr);
    
    let rawTime = formatInTimeZone(now, CLINIC_TIMEZONE, 'HH:mm:ss');
    if (futureSlots.length > 0) {
      rawTime = futureSlots[0].time + ":00";
    } else if (todayAppointmentsData.length > 0) {
      const { getWalkInTimeSlot } = await import("@/lib/queue-logic");
      const { clinics } = await import("@/db/schema");
      const [clinicResult] = await db.select().from(clinics).where(eq(clinics.id, authUser.clinicId));
      const avgConsultMins = clinicResult?.averageConsultationMinutes ?? 15;
      rawTime = getWalkInTimeSlot(todayAppointmentsData, now, avgConsultMins);
    }

    // Guarantee unique appointment time to eliminate PostgreSQL unique index constraint failures
    const appointmentTime = ensureUniqueTime(rawTime, existingTimes);

    // Calculate next token number safely
    const maxTokenData = todayAppointmentsData.reduce((max, curr) => Math.max(max, curr.tokenNumber || 0), 0);
    const nextToken = maxTokenData + 1;

    // ─── P2: Detect pending follow-up & link (golden thread) ─────────────────
    const [pendingFollowUp] = await db
      .select()
      .from(followUps)
      .where(
        and(
          eq(followUps.clinicId, authUser.clinicId),
          eq(followUps.patientId, patientId),
          eq(followUps.status, "pending"),
          lte(followUps.dueDate, appointmentDate)
        )
      )
      .orderBy(desc(followUps.dueDate))
      .limit(1);

    const isFollowUpVisit = !!pendingFollowUp;
    const isFreeFollowUp = isFollowUpVisit && pendingFollowUp.isFree;
    const appointmentNotes = isFollowUpVisit
      ? "Auto-generated from Follow-up"
      : "Quick check-in from Queue Dashboard";
    const followUpFee = isFollowUpVisit
      ? (isFreeFollowUp ? 0 : (pendingFollowUp.feeOverride ?? undefined))
      : undefined;

    const [newAppointment] = await db
      .insert(appointments)
      .values({
        clinicId: authUser.clinicId,
        patientId,
        patientName,
        patientPhone,
        appointmentDate,
        appointmentTime,
        tokenNumber: nextToken,
        status: "checked_in",
        checkInTime: now,
        notes: appointmentNotes,
        ...(followUpFee !== undefined && { feeCollected: followUpFee }),
      })
      .returning();

    // Link follow-up to this appointment
    if (pendingFollowUp && newAppointment) {
      await db
        .update(followUps)
        .set({ followUpAppointmentId: newAppointment.id })
        .where(eq(followUps.id, pendingFollowUp.id));
    }
    // ─── end P2 ───────────────────────────────────────────────────────────────

    return NextResponse.json({ appointment: newAppointment });
  } catch (err) {
    console.error("[Appointments QuickAdd] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
