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

  const appName = `${clinic.name}`;
  const startUrl = `/book/${slug}`;

  const manifest = {
    id: `doctor-diary-clinic-${slug}`,
    name: appName,
    short_name: appName,
    description: `Book appointments with ${clinic.name}`,
    start_url: startUrl,
    display: "standalone",
    orientation: "portrait-primary",
    theme_color: clinic.themeColor || "#0f766e",
    background_color: "#f8fafc",
    categories: ["medical", "health"],
    lang: "en-IN",
    scope: startUrl,
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
    prefer_related_applications: false,
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
}
