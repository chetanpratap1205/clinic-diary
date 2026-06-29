import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients, subscriptions, appointments } from "@/db/schema";
import { eq, and, ilike, or, count, max } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { format } from "date-fns";

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
    const { name, phone, age, gender, address } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
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

    // --- Subscription & Patient Limit Check ---
    const [{ count: patientCount }] = await db
      .select({ count: count() })
      .from(patients)
      .where(eq(patients.clinicId, authUser.clinicId));

    if (patientCount >= 5) {
      // Check if clinic has an active subscription
      const activeSubs = await db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.clinicId, authUser.clinicId),
            eq(subscriptions.status, "active")
          )
        )
        .limit(1);

      if (activeSubs.length === 0) {
        return NextResponse.json(
          {
            error: "FREE_LIMIT_REACHED",
            message: "You have reached the 5 patient limit on the free plan. Please upgrade to continue.",
          },
          { status: 403 }
        );
      }
    }
    // -------------------------------------------

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
