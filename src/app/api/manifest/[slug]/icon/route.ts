import { NextResponse } from "next/server";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export const revalidate = 86400;

function sanitizeThemeColor(color: string | null | undefined) {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color || "")
    ? color || "#0f766e"
    : "#0f766e";
}

function getIconSize(request: Request) {
  const url = new URL(request.url);
  const parsedSize = Number.parseInt(url.searchParams.get("size") || "512", 10);
  return Number.isFinite(parsedSize) && parsedSize >= 16 && parsedSize <= 1024
    ? parsedSize
    : 512;
}

function getInitials(name: string | null | undefined) {
  const rawInitials = name
    ? name
        .trim()
        .split(/\s+/)
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DR";

  return rawInitials
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const size = getIconSize(request);

    let [clinic] = await db
      .select({
        name: clinics.name,
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
        return new NextResponse("Not Found", { status: 404 });
      }

      clinic = {
        name: lead.name || `${lead.doctorName}'s Clinic`,
        themeColor: "#0d9488",
      };
    }

    const themeColor = sanitizeThemeColor(clinic.themeColor);
    const clinicInitials = getInitials(clinic.name);
    const url = new URL(request.url);
    const isMaskable = url.searchParams.get("purpose") === "maskable";

    const svg = isMaskable
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512" role="img" aria-label="${clinicInitials} clinic app maskable icon">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeColor}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  {/* Full bleed rectangle for safe-zone masking */}
  <rect width="512" height="512" fill="url(#bg)" />
  <g transform="translate(64, 64) scale(0.75)">
    <circle cx="256" cy="256" r="172" fill="white" fill-opacity="0.16" />
    <path d="M256 138v236M138 256h236" stroke="white" stroke-width="38" stroke-linecap="round" />
    <text x="256" y="436" text-anchor="middle" fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="44" letter-spacing="2">${clinicInitials}</text>
  </g>
</svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512" role="img" aria-label="${clinicInitials} clinic app icon">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeColor}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bg)" />
  <circle cx="256" cy="256" r="172" fill="white" fill-opacity="0.12" />
  <path d="M256 138v236M138 256h236" stroke="white" stroke-width="38" stroke-linecap="round" />
  <text x="256" y="436" text-anchor="middle" fill="white" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="44" letter-spacing="2">${clinicInitials}</text>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Error generating manifest icon:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
