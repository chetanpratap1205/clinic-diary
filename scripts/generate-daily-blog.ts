/**
 * Autonomous Daily Blog Generator
 * Executed daily by GitHub Actions (.github/workflows/daily-blog.yml)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import { BLOG_TOPICS } from "./blog-topics";

// Load .env in local dev if process.env.GEMINI_API_KEY is missing
if (!process.env.GEMINI_API_KEY) {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          if (!process.env[key]) process.env[key] = val;
        }
      }
    }
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set.");
  process.exit(1);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function estimateReadTime(content: string): string {
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.max(3, Math.round(wordCount / 220));
  return `${minutes} min read`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function pickAuthor(): { name: string; role: string; avatar: string } {
  const authors = [
    {
      name: "Dr. Chetan Pratap",
      role: "Head of Clinical Growth, Doctor Diary",
      avatar: "/chetan_profile_photo.png",
    },
    {
      name: "Govind Kumar",
      role: "Lead Systems Architect, Doctor Diary",
      avatar: "/govind-profile-pic.png",
    },
  ];
  return authors[Math.floor(Math.random() * authors.length)];
}

function pickCoverImage(): string {
  const images = [
    "/assets/images/clinic-hero-exact.png",
    "/assets/images/cta_general.png",
  ];
  return images[Math.floor(Math.random() * images.length)];
}

async function generateArticle(
  keyword: string,
  angle: string,
  internalLink?: string,
  specialty?: string,
  city?: string
) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
  const candidateModels = ["gemini-flash-latest", "gemini-3.1-pro-preview", "gemini-3.6-flash"];

  const internalLinkNote = internalLink
    ? `\n- Include one natural inline link to: ${internalLink} (use anchor text like "clinic software for ${specialty || "doctors"} in ${city || "India"}")`
    : "";

  const systemPrompt = `You are an expert content writer for Doctor Diary, a clinic management SaaS for independent doctors, polyclinics, and receptionists in India & UAE. You write enterprise-quality blog articles that rank on Google and get cited by AI models like ChatGPT, Gemini, and Perplexity.

Write a complete, expert blog article with these requirements:

PRIMARY KEYWORD: "${keyword}"
ARTICLE ANGLE: ${angle}
${specialty ? `TARGET SPECIALTY: ${specialty}` : ""}
${city ? `TARGET CITY: ${city}` : ""}

CONTENT REQUIREMENTS:
- Word count: 1,100–1,500 words
- Structure: Problem framing (with real clinical/operational stats) → Root Causes → 4-Step Solution → How Doctor Diary Automates It → ROI & Next Steps
- Tone: Highly professional, empathetic to clinic owners & front-desk receptionists, authoritative, non-fluffy
- Regional context: Use real local context (${city || "India/UAE"}, ₹ or AED currency, WhatsApp open rates, OPD workflows, DHA/MOHAP alignment hints where applicable)
- GEO & AI Model Citation Optimization: Formulate clear direct answers to common questions ("Why do patients miss appointments?", "How to reduce front-desk calls by 80%?")
- Incorporate scannable elements: H2, H3, bold key stats, bullet points, callout boxes
- End with a strong conversion CTA: "Set Up Your Clinic — It's Free" linking to /signup
- Ensure primary keyword appears in H1, intro paragraph, at least 2 H2s, and meta description${internalLinkNote}

FORMAT YOUR RESPONSE AS PURE JSON (no markdown fences, just valid JSON):
{
  "title": "exact H1 title with primary keyword",
  "excerpt": "150-160 character meta description with primary keyword",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "content": "full article content in markdown format (use ## for H2, ### for H3, **bold**, * for bullets)"
}`;

  let lastErr: any;
  for (const modelName of candidateModels) {
    try {
      console.log(`🤖 Requesting article via ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(systemPrompt);
      const responseText = result.response.text().trim();

      const cleanedResponse = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      let parsed: any;
      try {
        parsed = JSON.parse(cleanedResponse);
      } catch {
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Failed to parse AI response as JSON");
        }
      }

      return {
        title: parsed.title,
        excerpt: parsed.excerpt,
        content: parsed.content,
        keywords: parsed.keywords,
        readTime: estimateReadTime(parsed.content),
      };
    } catch (err: any) {
      console.warn(`⚠️ Model ${modelName} attempt failed:`, err?.message || err);
      lastErr = err;
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw lastErr;
}

function appendToBlogData(post: any): void {
  const blogDataPath = path.join(process.cwd(), "src", "lib", "blog-data.ts");
  const existing = fs.readFileSync(blogDataPath, "utf-8");

  if (existing.includes(`slug: "${post.slug}"`)) {
    console.log(`⏩ Slug already exists in blog-data.ts: ${post.slug}`);
    return;
  }

  const safeContent = post.content
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$\{/g, "\\${");

  const newPostEntry = `
  {
    slug: "${post.slug}",
    title: "${post.title.replace(/"/g, '\\"')}",
    excerpt: "${post.excerpt.replace(/"/g, '\\"')}",
    category: "${post.category}",
    author: {
      name: "${post.author.name}",
      role: "${post.author.role}",
      avatar: "${post.author.avatar}",
    },
    publishedAt: "${post.publishedAt}",
    readTime: "${post.readTime}",
    coverImage: "${post.coverImage}",
    keywords: ${JSON.stringify(post.keywords)},
    content: \`
${safeContent}
    \`,
  },`;

  const insertRegex = /\];\s*export function getBlogPostBySlug/;
  const match = existing.match(insertRegex);

  if (!match || match.index === undefined) {
    throw new Error("Could not find insertion point in blog-data.ts");
  }

  const insertIdx = match.index;
  const updated = existing.slice(0, insertIdx) + newPostEntry + "\n];\n\n" + existing.slice(insertIdx + match[0].length);
  fs.writeFileSync(blogDataPath, updated, "utf-8");
}

async function main() {
  console.log("📅 Running Daily Autonomous Blog Generator...");
  const blogDataPath = path.join(process.cwd(), "src", "lib", "blog-data.ts");
  const existingCode = fs.readFileSync(blogDataPath, "utf-8");

  // Find first ungenerated topic
  let targetTopic = null;
  for (const topic of BLOG_TOPICS) {
    const slug = slugify(topic.title);
    if (!existingCode.includes(slug)) {
      targetTopic = topic;
      break;
    }
  }

  if (!targetTopic) {
    console.log("🎉 All blog topics have already been generated!");
    process.exit(0);
  }

  console.log(`📝 Selected Topic #${targetTopic.id}: "${targetTopic.title}"`);
  console.log(`🔑 Keyword: "${targetTopic.keyword}"`);

  const article = await generateArticle(
    targetTopic.keyword,
    targetTopic.angle,
    targetTopic.internalLink,
    targetTopic.specialty,
    targetTopic.city
  );

  const slug = slugify(article.title);
  const author = pickAuthor();
  const coverImage = pickCoverImage();
  const publishedAt = formatDate(new Date());

  appendToBlogData({
    slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    category: targetTopic.category,
    author,
    publishedAt,
    readTime: article.readTime,
    coverImage,
    keywords: article.keywords,
  });

  console.log(`✅ Daily Article Published Successfully!`);
  console.log(`📌 Title: ${article.title}`);
  console.log(`🔗 Slug: /blog/${slug}`);
}

main().catch((err) => {
  console.error("❌ Daily blog generation failed:", err);
  process.exit(1);
});
