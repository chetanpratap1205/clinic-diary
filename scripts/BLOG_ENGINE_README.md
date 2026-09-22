# 📝 Blog Auto-Engine — Doctor Diary

AI-powered blog article generator. Writes expert SEO articles targeting
`clinic software + [city/specialty]` keywords and publishes them to your live site.

---

## ⚡ Quick Start

### 1. Add your Gemini API key to `.env`

```bash
# Get free key: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_key_here
```

### 2. Generate an article (interactive)

```bash
npm run blog:generate
```

You'll see a list of 50 pre-planned topics. Pick a number and the AI writes a
complete 1,200-word expert article in ~15 seconds.

### 3. Generate a specific topic by ID

```bash
npm run blog:generate:id 3
# Generates topic #3 directly
```

### 4. Generate from your own keyword

```bash
npx tsx scripts/generate-blog-post.ts --custom
# Prompts you for keyword + angle
```

---

## 📋 View All Pending Topics

```bash
npm run blog:topics
```

---

## 🔄 Weekly Publishing Workflow

```
Monday morning:
  1. npm run blog:generate
  2. Pick next topic from queue
  3. Review at localhost:3000/blog/[slug]
  4. git commit + push
  5. Vercel auto-deploys → article is live & indexed
```

**Target**: 1 article/week = 50 articles in 1 year = 50 Google-indexed, AI-citable pages.

---

## 📁 Files

| File | Purpose |
|------|---------|
| `scripts/generate-blog-post.ts` | Main AI generator script |
| `scripts/blog-topics.ts` | 50 pre-planned topic queue |
| `src/lib/blog-data.ts` | Where articles are stored (appended automatically) |
| `src/app/blog/[slug]/page.tsx` | Article renderer (already built) |
| `src/app/blog/page.tsx` | Blog listing (auto-updated) |

---

## 🎯 Article Quality Standard

Every AI-generated article has:
- ✅ Primary keyword in H1, first paragraph, 2+ H2s
- ✅ 1,100–1,400 words
- ✅ Indian context (₹, WhatsApp, Practo, OPD, real city names)
- ✅ Real-feeling data (18-25% no-show rates, ₹50,000/month losses)
- ✅ Internal links to relevant `/for/[specialty]/[city]` pages
- ✅ Article JSON-LD schema (auto-applied by the blog template)
- ✅ CTA → `/signup` at end

---

## 🤖 Why This Gets You Cited by ChatGPT / Perplexity

When doctors ask AI models:
> "What's the best clinic software for dermatologists in India?"

The AI cites pages it finds authoritative. Publishing 50+ expert articles 
that deeply answer specific questions makes Doctor Diary the trusted source
these AI models pull from.

The combination of:
1. **1,260 programmatic SEO pages** (`/for/[specialty]/[city]`)
2. **50+ expert blog articles** (`/blog/[slug]`)
3. **Article schema JSON-LD** (signals authority to AI crawlers)

...builds the citation authority that gets Doctor Diary mentioned by name
when doctors ask AI assistants for clinic software recommendations.
