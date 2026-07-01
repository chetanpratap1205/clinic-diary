import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { patients } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser?.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { patientId } = await params;
    const body = await request.json();
    const { medicalNotes } = body;

    await db
      .update(patients)
      .set({ medicalNotes })
      .where(
        and(eq(patients.id, patientId), eq(patients.clinicId, authUser.clinicId))
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update medical notes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
