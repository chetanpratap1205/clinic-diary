import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;

    if (!appointmentId || !appointmentId.match(/^[0-9a-f-]{36}$/i)) {
      return NextResponse.json({ error: "Invalid appointment ID" }, { status: 400 });
    }

    let cancelToken: string | undefined;
    try {
      const body = await _req.json();
      cancelToken = body.cancelToken;
    } catch {
      // allow empty body
    }

    // Verify the appointment exists and is cancellable
    const existing = await db
      .select({ 
        id: appointments.id, 
        status: appointments.status,
        clinicId: appointments.clinicId,
        appointmentDate: appointments.appointmentDate,
        cancelToken: appointments.cancelToken,
      })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const appt = existing[0];

    if (appt.cancelToken && appt.cancelToken !== cancelToken) {
      return NextResponse.json({ error: "Unauthorized to cancel this appointment" }, { status: 401 });
    }

    // Cannot cancel appointments that are already terminal or in progress
    if (["cancelled", "completed", "in_consultation"].includes(appt.status)) {
      return NextResponse.json(
        { error: "This appointment cannot be cancelled" },
        { status: 409 }
      );
    }

    // Prevent cancellation of past appointments (more than 24h ago)
    const appointmentDateTime = new Date(appt.appointmentDate as string);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    if (appointmentDateTime < oneDayAgo) {
      return NextResponse.json(
        { error: "Cannot cancel appointments from more than 24 hours ago" },
        { status: 409 }
      );
    }

    await db
      .update(appointments)
      .set({ status: "cancelled" })
      .where(and(
        eq(appointments.id, appointmentId),
        eq(appointments.clinicId, appt.clinicId) // extra guard
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
