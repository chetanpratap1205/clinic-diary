import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
    const slots = await getAvailableSlotsForDate(authUser.clinicId, appointmentDate);
    
    // Find the first available slot that is >= current time
    const currentTimeStr = format(now, 'HH:mm');
    const futureSlots = slots.filter(s => s.available && s.time >= currentTimeStr);
    
    let rawTime = format(now, 'HH:mm:ss');
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
        notes: "Quick check-in from Queue Dashboard",
      })
      .returning();

    return NextResponse.json({ appointment: newAppointment });
  } catch (err) {
    console.error("[Appointments QuickAdd] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
