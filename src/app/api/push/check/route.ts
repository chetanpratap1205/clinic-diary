import { NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * GET /api/push/check?endpoint=<url>&appointmentId=<id>
 * Returns { subscribed: true } if this browser's push subscription
 * is already registered in the DB for the given appointment.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");
  const appointmentId = searchParams.get("appointmentId");

  if (!endpoint || !appointmentId) {
    return NextResponse.json({ subscribed: false }, { status: 400 });
  }

  try {
    const [existing] = await db
      .select({ id: pushSubscriptions.id })
      .from(pushSubscriptions)
      .where(
        and(
          eq(pushSubscriptions.endpoint, endpoint),
          eq(pushSubscriptions.appointmentId, appointmentId)
        )
      )
      .limit(1);

    return NextResponse.json({ subscribed: !!existing });
  } catch (error) {
    console.error("[push/check] DB error:", error);
    return NextResponse.json({ subscribed: false });
  }
}
