import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clinics, availability } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const clinicResult = await db
      .select()
      .from(clinics)
      .where(eq(clinics.slug, slug))
      .limit(1);

    if (!clinicResult.length) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const clinic = clinicResult[0];

    const availabilityResult = await db
      .select()
      .from(availability)
      .where(eq(availability.clinicId, clinic.id));

    return NextResponse.json({ clinic, availability: availabilityResult });
  } catch (err) {
    console.error("[Clinic/Get] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
