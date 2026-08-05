import { NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subscription, clinicId, appointmentId, userType } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    const { endpoint, keys } = subscription;

    // Upsert subscription into DB
    await db
      .insert(pushSubscriptions)
      .values({
        clinicId: clinicId || null,
        appointmentId: appointmentId || null,
        userType: userType || "patient",
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      })
      .onConflictDoNothing({ target: [pushSubscriptions.endpoint, pushSubscriptions.appointmentId] });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Push subscribe error:", error);
    return NextResponse.json({ error: error.message || "Failed to save push subscription" }, { status: 500 });
  }
}
