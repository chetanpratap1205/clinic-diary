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
