import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/clinic/"],
        disallow: ["/dashboard", "/api/", "/onboarding", "/track/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
