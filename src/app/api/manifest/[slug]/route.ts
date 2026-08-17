import { NextResponse } from "next/server";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export const revalidate = 3600;

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
      const [lead] = await db
        .select({
          name: doctorLeads.clinicName,
          doctorName: doctorLeads.doctorName,
          logoUrl: doctorLeads.logoUrl,
        })
        .from(doctorLeads)
        .where(eq(doctorLeads.clinicSlug, slug))
        .limit(1);

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

    // Create a clean short name for mobile home screen (12 chars max)
    const shortName =
      appName.length > 12 ? `${appName.substring(0, 11)}…` : appName;

    // Detect MIME type hint for dynamic icon if logoUrl is provided
    let dynamicIconType = "image/png";
    if (clinic.logoUrl) {
      const lower = clinic.logoUrl.toLowerCase();
      if (lower.endsWith(".svg")) dynamicIconType = "image/svg+xml";
      else if (lower.endsWith(".webp")) dynamicIconType = "image/webp";
      else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg"))
        dynamicIconType = "image/jpeg";
    } else {
      dynamicIconType = "image/svg+xml";
    }

    // Standard-compliant icons array with separate "any" and "maskable" purposes
    const icons = [
      // Dynamic clinic icons via same-origin proxy (purpose: any)
      {
        src: `/api/manifest/${slug}/icon?size=192`,
        sizes: "192x192",
        type: dynamicIconType,
        purpose: "any",
      },
      {
        src: `/api/manifest/${slug}/icon?size=384`,
        sizes: "384x384",
        type: dynamicIconType,
        purpose: "any",
      },
      {
        src: `/api/manifest/${slug}/icon?size=512`,
        sizes: "512x512",
        type: dynamicIconType,
        purpose: "any",
      },
      // High-resolution raster PNG icons for adaptive launcher maskable support
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ];

    const manifest = {
      id: `/clinic/${slug}`,
      name: appName,
      short_name: shortName,
      description: `Official instant appointment booking and real-time live queue tracking app for ${appName}.`,
      start_url: `/clinic/${slug}?utm_source=pwa`,
      scope: `/clinic/${slug}`,
      display: "standalone",
      display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
      orientation: "portrait-primary",
      background_color: "#f8fafc",
      theme_color: themeColor,
      categories: ["medical", "health", "productivity", "utilities"],
      lang: "en-IN",
      prefer_related_applications: false,
      icons,
      shortcuts: [
        {
          name: "Book Appointment",
          short_name: "Book",
          url: `/clinic/${slug}?action=book&utm_source=pwa_shortcut`,
          description: `Book consultation at ${appName}`,
          icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
        },
        {
          name: "Live Queue Status",
          short_name: "Live Queue",
          url: `/clinic/${slug}/status?utm_source=pwa_shortcut`,
          description: `Check live waiting turn and OPD queue at ${appName}`,
          icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
        },
      ],
      screenshots: [
        {
          src: "/assets/booking_app.PNG",
          sizes: "392x696",
          type: "image/png",
          form_factor: "narrow",
          label: `Book appointments at ${appName}`,
        },
        {
          src: "/assets/live_queue.PNG",
          sizes: "392x696",
          type: "image/png",
          form_factor: "narrow",
          label: `Live queue position tracker for ${appName}`,
        },
      ],
    };

    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control":
          "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating manifest:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
