import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { followUps } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const body = await req.json();
    const { status } = body;

    if (!status || !["pending", "completed", "missed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [updated] = await db
      .update(followUps)
      .set({ 
        status,
        completedAt: status === "completed" ? new Date() : null,
      })
      .where(
        and(
          eq(followUps.id, id),
          eq(followUps.clinicId, authUser.clinicId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
    }

    return NextResponse.json({ followUp: updated });
  } catch (err) {
    console.error("[FollowUp PATCH] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
