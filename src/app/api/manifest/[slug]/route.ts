import { NextResponse } from "next/server";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export const revalidate = 3600;

function compactShortName(name: string, doctorName?: string | null) {
  if (doctorName) {
    const drClean = doctorName.replace(/^dr\.?\s*/i, "").trim();
    const parts = drClean.split(/\s+/);
    const lastName = parts[parts.length - 1];
    if (lastName && `Dr. ${lastName}`.length <= 12) {
      return `Dr. ${lastName}`;
    }
  }

  let cleaned = name
    .replace(/^dr\.?\s*/i, "Dr. ")
    .replace(/\s*(Skin|Laser|Hair|Heart|Dental|Eye|Care|Clinic|Hospital|Center|Centre|Pvt|Ltd|PRACTICE)\b/gi, "")
    .trim();

  if (cleaned.length <= 12) return cleaned;

  const words = cleaned.split(/\s+/);
  if (words.length > 1 && words[0].length <= 12) {
    return words[0];
  }

  return cleaned.substring(0, 12).trim();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    let [clinic] = await db
      .select({
        name: clinics.name,
        doctorName: clinics.doctorName,
        themeColor: clinics.themeColor,
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
        })
        .from(doctorLeads)
        .where(eq(doctorLeads.clinicSlug, slug))
        .limit(1);

      if (!lead) {
        return new NextResponse("Clinic not found", { status: 404 });
      }

      clinic = {
        name: lead.name || `${lead.doctorName}'s Clinic`,
        doctorName: lead.doctorName,
        themeColor: "#0d9488",
      };
    }

    const themeColor = clinic.themeColor || "#0ea5e9";
    const appName = clinic.name || "Clinic App";
    const appShortName = compactShortName(appName, clinic.doctorName);

    const icons = [
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
        purpose: "any",
      },
      {
        src: `/api/manifest/${slug}/icon?size=192`,
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `/api/manifest/${slug}/icon?size=512`,
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: `/api/manifest/${slug}/icon?size=192&purpose=maskable`,
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: `/api/manifest/${slug}/icon?size=512&purpose=maskable`,
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ];

    const manifest = {
      id: `/clinic/${slug}`,
      name: appName,
      short_name: appShortName,
      description: `Official instant appointment booking and real-time live queue tracking app for ${appName}.`,
      start_url: `/clinic/${slug}?utm_source=pwa`,
      scope: `/clinic/${slug}`,
      display: "standalone",
      display_override: ["standalone", "minimal-ui"],
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
        {
          src: "/assets/Dashboard.png",
          sizes: "1280x720",
          type: "image/png",
          form_factor: "wide",
          label: `Official OPD schedule and patient app for ${appName}`,
        },
      ],
    };

    return NextResponse.json(manifest, {
      headers: {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating manifest:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
