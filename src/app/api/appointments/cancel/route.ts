import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.cancelToken, token))
      .limit(1);

    if (!appointment.length) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 });
    }

    if (appointment[0].status === "cancelled") {
      return NextResponse.json({ error: "Appointment already cancelled" }, { status: 400 });
    }

    const [updated] = await db
      .update(appointments)
      .set({ status: "cancelled" })
      .where(eq(appointments.id, appointment[0].id))
      .returning();

    return NextResponse.json({ success: true, appointment: updated });
  } catch (err) {
    console.error("[Cancel] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
