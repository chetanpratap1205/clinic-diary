import { NextResponse } from "next/server";
import { db } from "@/db";
import { qrCodes, clinics, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

// Edge-compatible fast redirect — this is the heart of the QR system
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  try {
    // 1. Look up the QR code
    const qrResult = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.code, code.toUpperCase()))
      .limit(1);

    // Code doesn't exist — generic coming soon
    if (!qrResult.length) {
      return NextResponse.redirect(`${baseUrl}/q/not-found`, 302);
    }

    const qr = qrResult[0];

    // Not yet assigned to any clinic
    if (!qr.clinicId) {
      return NextResponse.redirect(`${baseUrl}/q/coming-soon`, 302);
    }

    // 2. Fetch clinic and check subscription
    const [clinicResult, subResult] = await Promise.all([
      db.select().from(clinics).where(eq(clinics.id, qr.clinicId)).limit(1),
      db.select().from(subscriptions).where(eq(subscriptions.clinicId, qr.clinicId)).limit(1),
    ]);

    const clinic = clinicResult[0];
    if (!clinic) {
      return NextResponse.redirect(`${baseUrl}/q/coming-soon`, 302);
    }

    const sub = subResult[0];
    const isActive =
      sub &&
      sub.status === "active" &&
      (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > new Date());

    // Subscription expired — show renewal page (not a dead end, still useful)
    if (!isActive) {
      return NextResponse.redirect(
        `${baseUrl}/q/paused?clinic=${encodeURIComponent(clinic.name)}&slug=${clinic.slug}`,
        302
      );
    }

    // ✅ Everything good — redirect to booking page
    return NextResponse.redirect(`${baseUrl}/book/${clinic.slug}`, 302);
  } catch (err) {
    console.error("[QR Redirect Error]", err);
    return NextResponse.redirect(`${baseUrl}/q/not-found`, 302);
  }
}
