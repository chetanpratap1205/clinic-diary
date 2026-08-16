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
        themeColor: "#0d9488",
        logoUrl: lead.logoUrl || null,
      };
    }

    const themeColor = clinic.themeColor || "#0ea5e9";
    const appName = clinic.name || "Clinic App";
    
    // Create a truncated short name for mobile screens (typically ~12 chars max)
    const shortName = appName.length > 12 ? `${appName.substring(0, 11)}...` : appName;

    // Detect MIME type hint for dynamic icon if logoUrl is provided
    let dynamicIconType = "image/png";
    if (clinic.logoUrl) {
      const lower = clinic.logoUrl.toLowerCase();
      if (lower.endsWith(".svg")) dynamicIconType = "image/svg+xml";
      else if (lower.endsWith(".webp")) dynamicIconType = "image/webp";
      else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) dynamicIconType = "image/jpeg";
    } else {
      dynamicIconType = "image/svg+xml";
    }

    // Standard-compliant icons array with separate "any" and "maskable" purposes
    const icons = [
      // Dynamic clinic icons via same-origin proxy
      {
        src: `/api/manifest/${slug}/icon?size=192`,
        sizes: "192x192",
        type: dynamicIconType,
        purpose: "any",
      },
      {
        src: `/api/manifest/${slug}/icon?size=192`,
        sizes: "192x192",
        type: dynamicIconType,
        purpose: "maskable",
      },
      {
        src: `/api/manifest/${slug}/icon?size=512`,
        sizes: "512x512",
        type: dynamicIconType,
        purpose: "any",
      },
      {
        src: `/api/manifest/${slug}/icon?size=512`,
        sizes: "512x512",
        type: dynamicIconType,
        purpose: "maskable",
      },
      // Static PNG fallbacks
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ];

    const manifest = {
      id: `/clinic/${slug}`,
      name: appName,
      short_name: shortName,
      description: `Official booking and live queue tracking app for ${appName}`,
      start_url: `/clinic/${slug}?utm_source=pwa`,
      scope: `/clinic/${slug}/`,
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#f8fafc",
      theme_color: themeColor,
      categories: ["medical", "health", "productivity"],
      lang: "en-IN",
      prefer_related_applications: false,
      icons,
    };

    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating manifest:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
