import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { db } from "@/db";
import { patients, subscriptions, appointments } from "@/db/schema";
import { eq, and, ilike, or, count, max } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { format } from "date-fns";
import { getClinicAccessStatus } from "@/lib/subscription";

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let conditions = [eq(patients.clinicId, authUser.clinicId)];

    if (search) {
      conditions.push(
        or(
          ilike(patients.name, `%${search}%`),
          ilike(patients.phone, `%${search}%`)
        ) as any
      );
    }

    const result = await db
      .select()
      .from(patients)
      .where(and(...conditions))
      .orderBy(patients.name);

    return NextResponse.json({ patients: result });
  } catch (err) {
    console.error("[Patients GET] Error:", err);
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
    const { name, phone, age, gender, address, addToQueue } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    const { isValidIndianMobileNumber } = await import("@/lib/validations");
    if (!isValidIndianMobileNumber(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Check for existing patient with same phone in this clinic
    const existing = await db
      .select()
      .from(patients)
      .where(
        and(eq(patients.clinicId, authUser.clinicId), eq(patients.phone, phone))
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Patient with this phone number already exists" },
        { status: 400 }
      );
    }

    // --- Subscription & 14-Day Enterprise Trial Check ---
    const accessStatus = await getClinicAccessStatus(authUser.clinicId);
    if (!accessStatus.hasAccess) {
      return NextResponse.json(
        {
          error: "TRIAL_EXPIRED",
          message: "Your 14-day free trial has expired. Upgrade your plan to continue adding new patients.",
        },
        { status: 403 }
      );
    }

    const [newPatient] = await db
      .insert(patients)
      .values({
        clinicId: authUser.clinicId,
        name,
        phone,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        address: address || null,
      })
      .returning();

    if (body.addToQueue) {
      const { getClinicTodayDate, CLINIC_TIMEZONE } = await import("@/lib/timezone");
      const { ensureUniqueTime } = await import("@/lib/appointment-utils");
      const { formatInTimeZone } = await import("date-fns-tz");

      const now = new Date();
      const appointmentDate = getClinicTodayDate();

      // Fetch existing appointments for today to determine token and prevent time collisions
      const todayAppointmentsData = await db
        .select({ appointmentTime: appointments.appointmentTime, tokenNumber: appointments.tokenNumber })
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, authUser.clinicId),
            eq(appointments.appointmentDate, appointmentDate)
          )
        );

      const existingTimes = new Set<string>(todayAppointmentsData.map((a) => a.appointmentTime));
      const rawTime = formatInTimeZone(now, CLINIC_TIMEZONE, 'HH:mm:ss');
      const appointmentTime = ensureUniqueTime(rawTime, existingTimes);

      const maxToken = todayAppointmentsData.reduce((max, curr) => Math.max(max, curr.tokenNumber || 0), 0);
      const nextToken = maxToken + 1;

      await db.insert(appointments).values({
        clinicId: authUser.clinicId,
        patientId: newPatient.id,
        patientName: newPatient.name,
        patientPhone: newPatient.phone,
        appointmentDate,
        appointmentTime,
        tokenNumber: nextToken,
        status: "checked_in",
        checkInTime: now,
        notes: "Added from quick walk-in registration",
      });
    }

    return NextResponse.json({ patient: newPatient });
  } catch (err) {
    console.error("[Patients POST] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
