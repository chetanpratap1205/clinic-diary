import { NextResponse } from "next/server";
import { BLOG_POSTS } from "@/lib/blog-data";
import { SPECIALTIES, CITIES } from "@/data/seo-data";

export async function GET() {
  const baseUrl = "https://doctor.naturexpress.in";

  // Build RSS Items for Blog Posts
  const blogItemsXml = BLOG_POSTS.map((post) => {
    const pubDate = new Date(post.publishedAt).toUTCString();
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${post.excerpt}]]></description>
      <category>${post.category}</category>
      <author><![CDATA[${post.author.name}]]></author>
    </item>`;
  }).join("\n");

  // Build RSS Items for Top City/Specialty Solution Pages
  const topSpecialties = SPECIALTIES.slice(0, 5);
  const topCities = CITIES.slice(0, 5);
  const solutionItemsXml = topSpecialties
    .flatMap((s) =>
      topCities.map((c) => `
    <item>
      <title><![CDATA[Clinic Software for ${s.shortLabel}s in ${c.label} | Doctor Diary]]></title>
      <link>${baseUrl}/for/${s.slug}/${c.slug}</link>
      <guid isPermaLink="true">${baseUrl}/for/${s.slug}/${c.slug}</guid>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <description><![CDATA[Doctor Diary provides WhatsApp booking, live queue tokens, and digital prescriptions with 0% commission for ${s.shortLabel}s in ${c.label}.]]></description>
      <category>Clinic Solutions</category>
    </item>`)
    )
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Doctor Diary — Clinic Growth &amp; Practice Insights</title>
    <link>${baseUrl}</link>
    <description>Practice management insights, WhatsApp automation workflows, and zero-commission software guides for independent doctors in India &amp; UAE.</description>
    <language>en-in</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${blogItemsXml}
    ${solutionItemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
