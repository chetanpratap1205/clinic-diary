import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getClinicTodayDate } from "@/lib/timezone";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [clinic] = await db
      .select({ id: clinics.id })
      .from(clinics)
      .where(eq(clinics.slug, slug))
      .limit(1);

    if (!clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const today = getClinicTodayDate();
    const todayAppts = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, clinic.id),
          eq(appointments.appointmentDate, today)
        )
      )
      .orderBy(appointments.appointmentTime);

    return NextResponse.json({ appointments: todayAppts });
  } catch (error) {
    console.error("Error fetching TV queue:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
