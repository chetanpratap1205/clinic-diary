import Metadata from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, BLOG_POSTS } from "@/lib/blog-data";
import { ArrowLeft, Clock, Calendar, Share2, Sparkles, User, CheckCircle2, ChevronRight } from "lucide-react";

interface BlogArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Doctor Diary",
    };
  }

  return {
    title: `${post.title} | Doctor Diary Blog`,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [{ url: post.coverImage }],
    },
  };
}

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Schema.org Article JSON-LD for Search Engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "Doctor Diary",
      url: "https://doctor.naturexpress.in",
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Article Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="w-full border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <Link href="/signup">
            <Button size="sm" className="bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold px-4 h-9 rounded-lg shadow-[0_0_15px_rgba(0,183,168,0.4)]">
              Claim Exclusivity Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* Article Meta Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-slate-400 text-xs flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime}
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs">{post.publishedAt}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6 border-l-2 border-[#00B7A8] pl-4 italic">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between py-4 border-y border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-slate-300 font-bold text-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">{post.author.name}</div>
                <div className="text-slate-400 text-xs">{post.author.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-10 border border-white/10 shadow-2xl">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Article Markdown Body */}
        <article className="prose prose-invert prose-emerald max-w-none mb-12 text-slate-300 text-base sm:text-lg leading-relaxed space-y-6">
          {post.content.split('\n\n').map((paragraph, idx) => {
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={idx} className="text-2xl sm:text-3xl font-black text-white pt-6 pb-2 border-b border-white/10">
                  {paragraph.replace('## ', '')}
                </h2>
              );
            }
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-xl sm:text-2xl font-bold text-emerald-400 pt-4">
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('* ')) {
              return (
                <ul key={idx} className="list-disc pl-6 space-y-2 text-slate-300">
                  {paragraph.split('\n* ').map((item, itemIdx) => (
                    <li key={itemIdx}>{item.replace('* ', '')}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-slate-300 leading-relaxed">
                {paragraph}
              </p>
            );
          })}
        </article>

        {/* Bottom Lead Conversion Box */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 rounded-2xl p-6 sm:p-10 text-center relative overflow-hidden mb-12">
          <div className="relative z-10 max-w-xl mx-auto">
            <h3 className="text-2xl font-black text-white mb-2">
              Transform Your Practice with Doctor Diary
            </h3>
            <p className="text-slate-300 text-sm mb-6">
              Join independent doctors across India who reduced patient no-shows and automated WhatsApp booking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold h-12 px-6 rounded-xl">
                  Claim Area Exclusivity
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 h-12 px-6 rounded-xl">
                  Watch 2-Min Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Doctor Diary by NatureXpress. All rights reserved.
      </footer>
    </div>
  );
}
