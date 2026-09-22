import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import { BLOG_TOPICS } from "./blog-topics";

// Load env
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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY missing in .env");
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

  const systemPrompt = `You are an expert content writer for Doctor Diary, a clinic management SaaS for independent doctors in India. You write enterprise-quality blog articles that rank on Google and get cited by AI models like ChatGPT and Perplexity.

Write a complete, expert blog article with these requirements:

PRIMARY KEYWORD: "${keyword}"
ARTICLE ANGLE: ${angle}
${specialty ? `TARGET SPECIALTY: ${specialty}` : ""}
${city ? `TARGET CITY: ${city}` : ""}

CONTENT REQUIREMENTS:
- Word count: 1,100–1,400 words
- Structure: Problem (with data/stats) → Why it happens → Solution (specific steps) → How Doctor Diary helps → CTA
- Use real Indian context: ₹ currency, WhatsApp, Practo, Indian city names, "OPD", "lakh", "crore"  
- Every stat must feel authentic and plausible (e.g. "18-25% no-show rate", "₹50,000/month lost")
- Use H2 and H3 headings, bullet points, numbered lists — scannable structure
- Tone: Expert, direct, empathetic to doctors — not salesy, not generic
- Include specific, real-feeling examples (Dr. Sharma in Jaipur, 42 patients/day, etc.)
- End with a clear CTA to Doctor Diary: "Set Up Your Clinic — It's Free" linking to /signup
- Primary keyword must appear in: H1, first paragraph, at least 2 H2s, meta description${internalLinkNote}

FORMAT YOUR RESPONSE AS JSON (no markdown code fences, just raw JSON):
{
  "title": "exact H1 title with primary keyword",
  "excerpt": "150-160 character meta description with primary keyword",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "content": "full article content in markdown format (use ## for H2, ### for H3, **bold**, * for bullets)"
}

DO NOT wrap in \`\`\`json. Return pure JSON only.`;

  let lastErr: any;
  for (const modelName of candidateModels) {
    try {
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
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw lastErr;
}

function appendToBlogData(post: any): void {
  const blogDataPath = path.join(process.cwd(), "src", "lib", "blog-data.ts");
  const existing = fs.readFileSync(blogDataPath, "utf-8");

  // Check if slug already exists
  if (existing.includes(`slug: "${post.slug}"`)) {
    console.log(`⏩ Skipping existing slug: ${post.slug}`);
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

async function runBatch() {
  const limit = process.argv[2] ? parseInt(process.argv[2], 10) : 50;
  console.log(`🚀 Starting Automatic Batch Blog Generation (Limit: ${limit} posts)...`);

  const blogDataPath = path.join(process.cwd(), "src", "lib", "blog-data.ts");
  const existingCode = fs.readFileSync(blogDataPath, "utf-8");

  let count = 0;
  for (const topic of BLOG_TOPICS) {
    if (count >= limit) break;

    const testSlug = slugify(topic.title);
    if (existingCode.includes(testSlug)) {
      console.log(`⏭️  Already generated: [${topic.id}] ${topic.title}`);
      continue;
    }

    console.log(`\n⏳ Generating [${count + 1}/${limit}] - Topic #${topic.id}: "${topic.title}"...`);
    try {
      const article = await generateArticle(
        topic.keyword,
        topic.angle,
        topic.internalLink,
        topic.specialty,
        topic.city
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
        category: topic.category,
        author,
        publishedAt,
        readTime: article.readTime,
        coverImage,
        keywords: article.keywords,
      });

      count++;
      console.log(`✅ Success! Saved: /blog/${slug}`);

      // 13 second delay to stay strictly under Gemini Free Tier 5 RPM limit (60s / 5 = 12s)
      console.log("⏳ Waiting 13s to respect Gemini API rate limits...");
      await new Promise((r) => setTimeout(r, 13000));
    } catch (err: any) {
      console.error(`❌ Failed topic #${topic.id}:`, err?.message || err);
    }
  }

  console.log(`\n🎉 Completed batch generation! Total new articles created: ${count}`);
}

runBatch();
