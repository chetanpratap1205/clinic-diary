import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await params;

    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointment ID" }, { status: 400 });
    }

    // Verify the appointment exists and is cancellable
    const existing = await db
      .select({ id: appointments.id, status: appointments.status })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const appt = existing[0];

    if (["cancelled", "completed", "in_consultation"].includes(appt.status)) {
      return NextResponse.json(
        { error: "This appointment cannot be cancelled" },
        { status: 409 }
      );
    }

    await db
      .update(appointments)
      .set({ status: "cancelled" })
      .where(eq(appointments.id, appointmentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel appointment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
