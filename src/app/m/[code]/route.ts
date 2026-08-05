import { NextResponse } from "next/server";
import { db } from "@/db";
import { marketingCampaigns, marketingClickLogs } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  try {
    // 1. Look up marketing campaign
    const [campaign] = await db
      .select()
      .from(marketingCampaigns)
      .where(eq(marketingCampaigns.code, code.toUpperCase()))
      .limit(1);

    if (!campaign || campaign.status === "archived") {
      return NextResponse.redirect(`${baseUrl}`, 302);
    }

    if (campaign.status === "paused") {
      // If campaign paused, redirect to home with notice flag
      return NextResponse.redirect(`${baseUrl}?campaign_paused=true`, 302);
    }

    // 2. Increment total clicks & log scan detail asynchronously
    const userAgent = req.headers.get("user-agent") || undefined;
    const referrer = req.headers.get("referer") || undefined;

    await Promise.allSettled([
      db
        .update(marketingCampaigns)
        .set({ clicks: sql`${marketingCampaigns.clicks} + 1`, updatedAt: new Date() })
        .where(eq(marketingCampaigns.id, campaign.id)),
      db.insert(marketingClickLogs).values({
        campaignId: campaign.id,
        userAgent,
        referrer,
      }),
    ]);

    // 3. Set a cookie for 30 days to attribute signups
    const cookieStore = await cookies();
    cookieStore.set("nx_marketing_code", campaign.code, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    // 4. Construct final redirect URL with UTM parameters
    const reqUrlObj = new URL(req.url);
    const queryDest = reqUrlObj.searchParams.get("dest");

    // Priority: queryParam dest > campaign.destinationUrl > "/"
    let targetPath = queryDest || campaign.destinationUrl || "/";
    if (!targetPath.startsWith("/")) {
      targetPath = `/${targetPath}`;
    }

    const targetUrlObj = new URL(targetPath, baseUrl);

    // Attach UTM Parameters if specified
    if (campaign.utmSource) targetUrlObj.searchParams.set("utm_source", campaign.utmSource);
    if (campaign.utmMedium) targetUrlObj.searchParams.set("utm_medium", campaign.utmMedium);
    if (campaign.utmCampaign) targetUrlObj.searchParams.set("utm_campaign", campaign.utmCampaign);
    if (campaign.utmContent) targetUrlObj.searchParams.set("utm_content", campaign.utmContent);
    
    // Always append tracking code as fallback
    targetUrlObj.searchParams.set("m_code", campaign.code);

    return NextResponse.redirect(targetUrlObj.toString(), 302);
  } catch (err) {
    console.error("[Marketing Redirect Error]", err);
    return NextResponse.redirect(`${baseUrl}`, 302);
  }
}
