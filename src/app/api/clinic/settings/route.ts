import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { clinics, availability, availabilityOverrides, clinicAdmins } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  doctorName: z.string().min(2).max(200).optional(),
  specialty: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).optional(),
  consultationFee: z.number().min(0).optional(),
  themeColor: z.string().optional(),
  address: z.string().optional(),
  about: z.string().optional(),
  workingDays: z.array(z.number().min(0).max(6)).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  slotDuration: z.number().min(10).max(120).optional(),
});

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clinicResult = await db
      .select()
      .from(clinics)
      .where(eq(clinics.id, authUser.clinicId))
      .limit(1);

    if (!clinicResult.length) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const availabilityResult = await db
      .select()
      .from(availability)
      .where(eq(availability.clinicId, authUser.clinicId));

    const overrides = await db
      .select()
      .from(availabilityOverrides)
      .where(eq(availabilityOverrides.clinicId, authUser.clinicId));

    return NextResponse.json({
      clinic: clinicResult[0],
      availability: availabilityResult,
      overrides,
    });
  } catch (err) {
    console.error("[Clinic/Settings GET] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.issues }, { status: 400 });
    }

    const { workingDays, startTime, endTime, slotDuration, ...clinicData } = parsed.data;

    // Update clinic data
    if (Object.keys(clinicData).length > 0) {
      await db
        .update(clinics)
        .set(clinicData)
        .where(eq(clinics.id, authUser.clinicId));
    }

    // Update availability if provided
    if (workingDays !== undefined && startTime && endTime && slotDuration) {
      // Delete existing availability
      await db.delete(availability).where(eq(availability.clinicId, authUser.clinicId));

      // Insert new availability
      if (workingDays.length > 0) {
        await db.insert(availability).values(
          workingDays.map((day) => ({
            clinicId: authUser.clinicId!,
            dayOfWeek: day,
            startTime,
            endTime,
            slotDurationMinutes: slotDuration,
          }))
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Clinic/Settings PUT] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
