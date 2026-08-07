import { NextResponse } from "next/server";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Fetch clinic by slug
    const [clinic] = await db
      .select({
        name: clinics.name,
        themeColor: clinics.themeColor,
        logoUrl: clinics.logoUrl,
      })
      .from(clinics)
      .where(eq(clinics.slug, slug))
      .limit(1);

    if (!clinic) {
      return new NextResponse("Clinic not found", { status: 404 });
    }

    const themeColor = clinic.themeColor || "#0ea5e9";
    const appName = clinic.name || "Clinic App";
    
    // Create a truncated short name for mobile screens (typically ~12 chars max)
    const shortName = appName.length > 12 ? `${appName.substring(0, 11)}…` : appName;

    // Use clinic logo if available, otherwise fallback to our standard icons
    const icons = clinic.logoUrl 
      ? [
          {
            src: clinic.logoUrl,
            sizes: "192x192 512x512",
            type: "image/png", // PWA handles generic URLs well if served correctly
            purpose: "any maskable"
          }
        ]
      : [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ];

    const manifest = {
      name: appName,
      short_name: shortName,
      description: `Official booking app for ${appName}`,
      start_url: `/book/${slug}`,
      display: "standalone",
      background_color: "#f8fafc", // slate-50
      theme_color: themeColor,
      icons,
    };

    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error generating manifest:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
