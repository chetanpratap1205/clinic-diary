import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { followUps, patients } from "@/db/schema";
import { eq, and, desc, asc, lt, gte, lte } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // overdue, today, upcoming

    let query = db
      .select({
        followUp: followUps,
        patient: patients,
      })
      .from(followUps)
      .innerJoin(patients, eq(followUps.patientId, patients.id))
      .where(eq(followUps.clinicId, authUser.clinicId));

    // We fetch everything and filter in memory for MVP simplicity, 
    // or add conditions if needed. Let's do basic conditions.
    // Actually, getting all pending is fine for MVP scale, but let's filter pending only.
    
    // Note: The UI dashboard will fetch all pending and group them.
    // This endpoint can just return all pending follow-ups for the clinic.

    const result = await db
      .select({
        id: followUps.id,
        dueDate: followUps.dueDate,
        status: followUps.status,
        notes: followUps.notes,
        patient: {
          id: patients.id,
          name: patients.name,
          phone: patients.phone,
        }
      })
      .from(followUps)
      .innerJoin(patients, eq(followUps.patientId, patients.id))
      .where(
        and(
          eq(followUps.clinicId, authUser.clinicId),
          eq(followUps.status, "pending")
        )
      )
      .orderBy(asc(followUps.dueDate));

    return NextResponse.json({ followUps: result });
  } catch (err) {
    console.error("[FollowUps GET] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { patientId, appointmentId, dueDate, notes } = body;

    if (!patientId || !dueDate) {
      return NextResponse.json(
        { error: "patientId and dueDate are required" },
        { status: 400 }
      );
    }

    const [newFollowUp] = await db
      .insert(followUps)
      .values({
        clinicId: authUser.clinicId,
        patientId,
        appointmentId: appointmentId || null,
        dueDate,
        notes: notes || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ followUp: newFollowUp });
  } catch (err) {
    console.error("[FollowUps POST] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
