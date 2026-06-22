import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { availabilityOverrides } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date } = await req.json();
    if (!date) {
      return NextResponse.json({ error: "Date required" }, { status: 400 });
    }

    await db
      .insert(availabilityOverrides)
      .values({
        clinicId: authUser.clinicId,
        date,
        isClosed: true,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Holidays POST] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date required" }, { status: 400 });
    }

    await db
      .delete(availabilityOverrides)
      .where(
        and(
          eq(availabilityOverrides.clinicId, authUser.clinicId),
          eq(availabilityOverrides.date, date)
        )
      );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Holidays DELETE] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
