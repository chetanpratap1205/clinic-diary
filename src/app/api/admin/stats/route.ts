import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clinics, appointments } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { format } from "date-fns";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Super-admin check — check by email in env
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    if (superAdminEmail && authUser.email !== superAdminEmail) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allClinics = await db.select().from(clinics);

    const today = format(new Date(), "yyyy-MM-dd");
    const todayAppts = await db
      .select({ count: count() })
      .from(appointments)
      .where(eq(appointments.appointmentDate, today));

    const totalAppts = await db
      .select({ count: count() })
      .from(appointments);

    return NextResponse.json({
      clinicsCount: allClinics.length,
      clinics: allClinics,
      todayAppointments: todayAppts[0]?.count ?? 0,
      totalAppointments: totalAppts[0]?.count ?? 0,
    });
  } catch (err) {
    console.error("[Admin/Stats] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
