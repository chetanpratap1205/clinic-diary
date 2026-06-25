import type { MetadataRoute } from "next";
import { db } from "@/db";
import { clinics } from "@/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

  // Fetch all clinic slugs for dynamic booking pages
  let clinicEntries: MetadataRoute.Sitemap = [];
  try {
    const allClinics = await db
      .select({ slug: clinics.slug, createdAt: clinics.createdAt })
      .from(clinics);

    clinicEntries = allClinics.map((clinic) => ({
      url: `${baseUrl}/book/${clinic.slug}`,
      lastModified: clinic.createdAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch {
    // If DB is unreachable during build, skip dynamic entries
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    ...clinicEntries,
  ];
}
