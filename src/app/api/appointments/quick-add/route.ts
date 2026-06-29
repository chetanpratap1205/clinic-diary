import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq, and, max } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
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
    const appointmentDate = format(now, 'yyyy-MM-dd');
    const appointmentTime = format(now, 'HH:mm:ss');

    // Calculate token number
    const todayAppointments = await db
      .select({ maxToken: max(appointments.tokenNumber) })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, authUser.clinicId),
          eq(appointments.appointmentDate, appointmentDate)
        )
      );
      
    const nextToken = (todayAppointments[0]?.maxToken || 0) + 1;

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
