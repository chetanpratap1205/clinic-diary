import { NextResponse } from "next/server";
import { db } from "@/db";
import { marketingCampaigns } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";

// Edge-compatible fast redirect
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  try {
    // 1. Look up the marketing campaign
    const campaignResult = await db
      .select()
      .from(marketingCampaigns)
      .where(eq(marketingCampaigns.code, code.toUpperCase()))
      .limit(1);

    if (campaignResult.length === 0) {
      // If code doesn't exist, just redirect to home
      return NextResponse.redirect(`${baseUrl}`, 302);
    }

    const campaign = campaignResult[0];

    // 2. Increment clicks asynchronously to not block redirect
    // We await it here because we are on nodejs runtime anyway, but it's fast
    await db
      .update(marketingCampaigns)
      .set({ clicks: sql`${marketingCampaigns.clicks} + 1` })
      .where(eq(marketingCampaigns.id, campaign.id));

    // 3. Set a cookie for 30 days to attribute signups
    const cookieStore = await cookies();
    cookieStore.set("nx_marketing_code", campaign.code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // 4. Redirect to homepage (or onboarding if they passed a destination)
    const urlObj = new URL(_req.url);
    const dest = urlObj.searchParams.get("dest") || "";
    
    // Allow overriding destination via query param (e.g., ?dest=/signup)
    // but ensure it stays on our domain by forcing relative path or same domain
    const finalUrl = dest.startsWith("/") ? `${baseUrl}${dest}` : `${baseUrl}`;

    return NextResponse.redirect(finalUrl, 302);
  } catch (err) {
    console.error("[Marketing Redirect Error]", err);
    return NextResponse.redirect(`${baseUrl}`, 302);
  }
}
