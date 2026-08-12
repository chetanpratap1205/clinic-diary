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
    let [clinic] = await db
      .select({
        name: clinics.name,
        themeColor: clinics.themeColor,
        logoUrl: clinics.logoUrl,
      })
      .from(clinics)
      .where(eq(clinics.slug, slug))
      .limit(1);

    if (!clinic) {
      const { doctorLeads } = await import("@/db/schema");
      const [lead] = await db.select({
        name: doctorLeads.clinicName,
        doctorName: doctorLeads.doctorName,
        logoUrl: doctorLeads.logoUrl,
      }).from(doctorLeads).where(eq(doctorLeads.clinicSlug, slug)).limit(1);
      
      if (!lead) {
        return new NextResponse("Clinic not found", { status: 404 });
      }
      
      clinic = {
        name: lead.name || `${lead.doctorName}'s Clinic`,
        themeColor: "#0ea5e9",
        logoUrl: lead.logoUrl || null,
      };
    }

    const themeColor = clinic.themeColor || "#0ea5e9";
    const appName = clinic.name || "Clinic App";
    
    // Create a truncated short name for mobile screens (typically ~12 chars max)
    const shortName = appName.length > 12 ? `${appName.substring(0, 11)}…` : appName;

    const defaultIcons = [
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

    const icons = clinic.logoUrl 
      ? [
          {
            src: clinic.logoUrl,
            sizes: "192x192 512x512",
            type: "image/png",
            purpose: "any maskable"
          },
          ...defaultIcons
        ]
      : defaultIcons;

    const manifest = {
      name: appName,
      short_name: shortName,
      description: `Official booking app for ${appName}`,
      start_url: `/book/${slug}?utm_source=pwa`,
      scope: `/book/${slug}`,
      id: `/book/${slug}`,
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
