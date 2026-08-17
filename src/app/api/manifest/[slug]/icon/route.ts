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
    const url = new URL(request.url);
    const sizeParam = url.searchParams.get("size");
    const parsedSize = sizeParam ? parseInt(sizeParam, 10) : 512;
    const size = !isNaN(parsedSize) && parsedSize >= 16 && parsedSize <= 1024 ? parsedSize : 512;

    // 1. Fetch clinic from clinics table
    let [clinic] = await db
      .select({
        name: clinics.name,
        themeColor: clinics.themeColor,
        logoUrl: clinics.logoUrl,
      })
      .from(clinics)
      .where(eq(clinics.slug, slug))
      .limit(1);

    // 2. Fallback to doctorLeads table
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
        return new NextResponse("Not Found", { status: 404 });
      }

      clinic = {
        name: lead.name || `${lead.doctorName}'s Clinic`,
        themeColor: "#0d9488",
        logoUrl: lead.logoUrl || null,
      };
    }

    // 3. Proxy remote logo URL with 3.5s timeout
    if (clinic.logoUrl && clinic.logoUrl.startsWith("http")) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const imgRes = await fetch(clinic.logoUrl, {
          signal: controller.signal,
          headers: {
            "User-Agent": "DoctorDiary-ManifestIconProxy/1.0",
          },
        });
        clearTimeout(timeoutId);

        if (imgRes.ok) {
          const contentType = imgRes.headers.get("content-type") || "image/png";
          const buffer = await imgRes.arrayBuffer();
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }
      } catch (e) {
        console.warn(`Failed to fetch clinic logoUrl for icon (${slug}), falling back to dynamic SVG:`, e);
      }
    }

    // 4. Dynamic Scalable SVG Generation (Maskable-safe)
    const rawColor = clinic.themeColor || "#0f766e";
    const themeColor = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(rawColor) ? rawColor : "#0f766e";

    const rawInitials = clinic.name
      ? clinic.name
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "DR";

    const clinicInitials = rawInitials
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
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
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Error generating manifest icon:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
