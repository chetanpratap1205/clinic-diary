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

  const appName = clinic.name.toLowerCase().endsWith("app") || clinic.name.toLowerCase().endsWith("clinic") 
    ? clinic.name 
    : `${clinic.name} Clinic`;
  const startUrl = `/book/${slug}`;
  const iconUrl = `/api/manifest/${slug}/icon`;

  const manifest = {
    id: `clinic-app-${slug}`,
    name: appName,
    short_name: clinic.name,
    description: `Official App for ${clinic.name} — Book appointments & track live queue`,
    start_url: startUrl,
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: clinic.themeColor || "#0f766e",
    background_color: "#ffffff",
    categories: ["medical", "health"],
    lang: "en-IN",
    scope: startUrl,
    icons: [
      {
        src: iconUrl,
        sizes: "192x192 512x512",
        type: "image/svg+xml",
        purpose: "any maskable",
      },
    ],
    prefer_related_applications: false,
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

