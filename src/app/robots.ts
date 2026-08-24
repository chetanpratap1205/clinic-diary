import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/clinic/", "/blog/", "/directory/", "/contact"],
        disallow: [
          "/dashboard/",
          "/admin/",
          "/employee/",
          "/api/",
          "/onboarding/",
          "/track/",
          "/login",
          "/signup",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

