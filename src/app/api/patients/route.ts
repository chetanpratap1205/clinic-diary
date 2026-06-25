import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

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

    return NextResponse.json({ patient: newPatient });
  } catch (err) {
    console.error("[Patients POST] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
