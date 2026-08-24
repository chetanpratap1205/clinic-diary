import type { MetadataRoute } from "next";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { BLOG_POSTS } from "@/lib/blog-data";

// Revalidate sitemap every hour so new real clinics & blog posts are auto-discovered without re-deploying
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

  // 1. High-priority public marketing, directory & content pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. High-value SEO Blog Posts
  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt || Date.now()),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // 3. Known test/dummy clinic slugs to exclude from public indexing
  const dummySlugs = new Set([
    "dr-singh",
    "teena-panchal",
    "nature-express",
    "chirag-eyecare-37wa",
    "test-clinic",
    "demo-clinic",
  ]);

  // 4. Fetch genuine public clinic booking pages
  let clinicEntries: MetadataRoute.Sitemap = [];
  try {
    const allClinics = await db
      .select({ slug: clinics.slug, createdAt: clinics.createdAt })
      .from(clinics);

    clinicEntries = allClinics
      .filter((clinic) => clinic.slug && !dummySlugs.has(clinic.slug.toLowerCase()))
      .map((clinic) => ({
        url: `${baseUrl}/clinic/${clinic.slug}`,
        lastModified: clinic.createdAt,
        changeFrequency: "weekly",
        priority: 0.8,
      }));
  } catch (error) {
    console.error("Error fetching clinics for sitemap:", error);
  }

  return [...staticPages, ...blogEntries, ...clinicEntries];
}

