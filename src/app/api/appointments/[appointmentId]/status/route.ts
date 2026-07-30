import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, followUps } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { appointmentId } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["confirmed", "cancelled", "no_show", "checked_in"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify the appointment belongs to this clinic
    const existing = await db
      .select({ id: appointments.id, status: appointments.status })
      .from(appointments)
      .where(and(eq(appointments.id, appointmentId), eq(appointments.clinicId, authUser.clinicId)))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, appointmentId));

    // If cancelled or no-show, we should also cancel any pending follow-ups linked to this appt
    if (status === "cancelled" || status === "no_show") {
      await db
        .update(followUps)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(followUps.appointmentId, appointmentId),
            eq(followUps.status, "pending")
          )
        );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Appointment Status PATCH] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
