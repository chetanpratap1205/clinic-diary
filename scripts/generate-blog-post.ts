/**
 * Blog Auto-Engine — AI Article Generator
 *
 * Usage:
 *   npx tsx scripts/generate-blog-post.ts              → Interactive topic picker
 *   npx tsx scripts/generate-blog-post.ts --id 3       → Generate topic #3 directly
 *   npx tsx scripts/generate-blog-post.ts --custom     → Provide your own keyword
 *
 * Requirements:
 *   GEMINI_API_KEY in .env (get free key: https://aistudio.google.com/apikey)
 *
 * What it does:
 *   1. Loads topic from blog-topics.ts queue (or custom input)
 *   2. Calls Gemini Flash API with expert medical content prompt
 *   3. Parses response into BlogPost schema
 *   4. Appends the new post to src/lib/blog-data.ts
 *   5. Prints preview URL: http://localhost:3000/blog/[slug]
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { BLOG_TOPICS, getTopicById, getPendingTopics } from "./blog-topics";

// ─── Load env ──────────────────────────────────────────────────────────────
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
  console.error(`
❌ GEMINI_API_KEY not found in .env

To fix:
  1. Get a free key at: https://aistudio.google.com/apikey
  2. Add to your .env file:
     GEMINI_API_KEY=your_key_here
  3. Re-run this script
`);
  process.exit(1);
}

// ─── Types ─────────────────────────────────────────────────────────────────

interface GeneratedArticle {
  title: string;
  excerpt: string;
  content: string;
  keywords: string[];
  readTime: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

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

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

// ─── AI Generation ─────────────────────────────────────────────────────────

async function generateArticle(
  keyword: string,
  angle: string,
  internalLink?: string,
  specialty?: string,
  city?: string
): Promise<GeneratedArticle> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

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

  console.log("\n⏳ Generating article with Gemini AI...\n");

  const result = await model.generateContent(systemPrompt);
  const responseText = result.response.text().trim();

  // Strip any accidental markdown fences
  const cleanedResponse = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: Omit<GeneratedArticle, "readTime">;
  try {
    parsed = JSON.parse(cleanedResponse);
  } catch {
    // Try to extract JSON if there's extra text
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error("Failed to parse AI response as JSON. Response:\n" + cleanedResponse.slice(0, 500));
    }
  }

  return {
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.content,
    keywords: parsed.keywords,
    readTime: estimateReadTime(parsed.content),
  };
}

// ─── Write to blog-data.ts ─────────────────────────────────────────────────

function appendToBlogData(post: {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: { name: string; role: string; avatar: string };
  publishedAt: string;
  readTime: string;
  coverImage: string;
  keywords: string[];
}): void {
  const blogDataPath = path.join(process.cwd(), "src", "lib", "blog-data.ts");
  const existing = fs.readFileSync(blogDataPath, "utf-8");

  // Escape backticks and template literal chars in content
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

  // Insert before the closing ]; of BLOG_POSTS array
  const insertRegex = /\];\s*export function getBlogPostBySlug/;
  const match = existing.match(insertRegex);

  if (!match || match.index === undefined) {
    throw new Error("Could not find insertion point in blog-data.ts");
  }

  const insertIdx = match.index;
  const updated = existing.slice(0, insertIdx) + newPostEntry + "\n];\n\n" + existing.slice(insertIdx + match[0].length);
  fs.writeFileSync(blogDataPath, updated, "utf-8");
}

// ─── Interactive CLI ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  let keyword = "";
  let angle = "";
  let category = "Clinic Growth & Revenue";
  let internalLink: string | undefined;
  let specialty: string | undefined;
  let city: string | undefined;

  // Mode: --id <number>
  if (args.includes("--id")) {
    const idArg = args[args.indexOf("--id") + 1];
    const topicId = parseInt(idArg, 10);
    const topic = getTopicById(topicId);
    if (!topic) {
      console.error(`❌ Topic ID ${topicId} not found.`);
      rl.close();
      process.exit(1);
    }
    keyword = topic.keyword;
    angle = topic.angle;
    category = topic.category;
    internalLink = topic.internalLink;
    specialty = topic.specialty;
    city = topic.city;
    console.log(`\n📋 Topic #${topic.id}: ${topic.title}`);
  }

  // Mode: --custom
  else if (args.includes("--custom")) {
    keyword = await prompt(rl, "\n🔑 Enter your target keyword: ");
    angle = await prompt(rl, "📐 Enter the article angle/problem it solves: ");
    category = await prompt(rl, "🏷️  Enter category (e.g. Clinic Growth & Revenue): ") || category;
    const il = await prompt(rl, "🔗 Internal link (e.g. /for/dermatology/mumbai) or press Enter to skip: ");
    if (il.trim()) internalLink = il.trim();
  }

  // Mode: Interactive picker (default)
  else {
    const pending = getPendingTopics();
    if (pending.length === 0) {
      console.log("✅ All 50 topics have been generated! Add more to scripts/blog-topics.ts");
      rl.close();
      return;
    }

    console.log("\n📚 PENDING BLOG TOPICS\n");
    pending.slice(0, 15).forEach((t) => {
      console.log(`  [${t.id.toString().padStart(2)}] ${t.title}`);
    });
    if (pending.length > 15) {
      console.log(`  ... and ${pending.length - 15} more. Use --id <number> to pick any.`);
    }

    const choice = await prompt(rl, "\nEnter topic ID to generate (or press Enter for next in queue): ");
    const chosenId = choice.trim() ? parseInt(choice.trim(), 10) : pending[0].id;
    const topic = getTopicById(chosenId);

    if (!topic) {
      console.error(`❌ Topic ID ${chosenId} not found.`);
      rl.close();
      process.exit(1);
    }

    keyword = topic.keyword;
    angle = topic.angle;
    category = topic.category;
    internalLink = topic.internalLink;
    specialty = topic.specialty;
    city = topic.city;
    console.log(`\n✅ Selected: ${topic.title}`);
  }

  rl.close();

  try {
    // Generate article
    const article = await generateArticle(keyword, angle, internalLink, specialty, city);

    const slug = slugify(article.title);
    const author = pickAuthor();
    const coverImage = pickCoverImage();
    const publishedAt = formatDate(new Date());

    // Preview
    console.log("\n" + "─".repeat(60));
    console.log("📄 GENERATED ARTICLE PREVIEW");
    console.log("─".repeat(60));
    console.log(`\nTitle:     ${article.title}`);
    console.log(`Slug:      ${slug}`);
    console.log(`Excerpt:   ${article.excerpt}`);
    console.log(`Category:  ${category}`);
    console.log(`Author:    ${author.name}`);
    console.log(`Read time: ${article.readTime}`);
    console.log(`Keywords:  ${article.keywords.join(", ")}`);
    console.log("\nContent preview (first 300 chars):");
    console.log(article.content.slice(0, 300) + "...");
    console.log("─".repeat(60));

    // Confirm
    const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
    const confirm = await prompt(rl2, "\n✅ Write this article to blog-data.ts? (y/n): ");
    rl2.close();

    if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
      console.log("❌ Cancelled. Article not saved.");
      process.exit(0);
    }

    // Write to blog-data.ts
    appendToBlogData({
      slug,
      title: article.title,
      excerpt: article.excerpt,
      content: article.content,
      category,
      author,
      publishedAt,
      readTime: article.readTime,
      coverImage,
      keywords: article.keywords,
    });

    console.log(`
✅ Article saved to src/lib/blog-data.ts

🚀 Next steps:
  1. Review it locally: http://localhost:3000/blog/${slug}
  2. Run: npm run build
  3. Deploy to Vercel — it's live at:
     https://doctor.naturexpress.in/blog/${slug}

📊 It'll appear in your sitemap at /sitemap.xml automatically.
`);

  } catch (err) {
    console.error("\n❌ Error generating article:", err);
    process.exit(1);
  }
}

main();
