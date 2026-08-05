import { NextResponse } from "next/server";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.slug, slug))
    .limit(1);

  if (!clinic) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // If clinic has a custom logo URL, redirect to or proxy it
  if (clinic.logoUrl && clinic.logoUrl.startsWith("http")) {
    try {
      const imgRes = await fetch(clinic.logoUrl);
      if (imgRes.ok) {
        const contentType = imgRes.headers.get("content-type") || "image/png";
        const buffer = await imgRes.arrayBuffer();
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
          },
        });
      }
    } catch (e) {
      console.warn("Failed to fetch clinic logoUrl for icon, falling back to SVG:", e);
    }
  }

  // Fallback: Generate dynamic SVG App Icon with Clinic Theme Color and Doctor Initials
  const themeColor = clinic.themeColor || "#0f766e";
  const clinicInitials = clinic.name
    ? clinic.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DR";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeColor}" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#bg)" />
  <circle cx="256" cy="256" r="180" fill="white" fill-opacity="0.1" />
  <!-- Stethoscope / Cross Icon -->
  <path d="M256 140 V372 M140 256 H372" stroke="white" stroke-width="36" stroke-linecap="round" filter="url(#glow)" />
  <text x="256" y="440" text-anchor="middle" fill="white" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="44" letter-spacing="2">${clinicInitials}</text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
