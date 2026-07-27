import Metadata from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS } from "@/lib/blog-data";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Calendar, Sparkles, ChevronRight, User } from "lucide-react";

export const metadata = {
  title: "Clinic Growth & Practice Management Blog | Doctor Diary",
  description: "Explore expert insights, setup guides, and software comparisons to help Indian doctors reduce patient no-shows, automate WhatsApp reminders, and grow clinic revenue.",
};

export default function BlogIndexPage() {
  const featuredPost = BLOG_POSTS[0];
  const remainingPosts = BLOG_POSTS.slice(1);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header Navigation */}
      <header className="w-full border-b border-white/10 bg-[#0A0A0A]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center border border-slate-100">
              <Image
                src="/icon-192.png"
                alt="Doctor Diary Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-white text-lg leading-none tracking-tight group-hover:text-[#00B7A8] transition-colors">
                Doctor Diary
              </span>
              <span className="font-semibold text-[#00B7A8] text-[9px] uppercase tracking-widest leading-none mt-1">
                Practice Insights & Blog
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 gap-2 text-sm font-semibold">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold px-5 h-10 rounded-lg text-sm shadow-[0_0_20px_rgba(0,183,168,0.4)]">
                Claim Exclusivity Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Clinic Growth & Automation Insights
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight mb-4 max-w-4xl mx-auto">
          Proven Strategies to Grow Your Practice & Eliminate No-Shows
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          In-depth guides, WhatsApp automation blueprints, and technology insights tailored specifically for independent Indian doctors and clinics.
        </p>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 pb-20">
        {/* Featured Post Card */}
        {featuredPost && (
          <div className="mb-12 bg-gradient-to-br from-[#121215] to-[#0A0A0C] border border-white/15 rounded-3xl overflow-hidden shadow-2xl hover:border-emerald-500/40 transition-all group">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-3 py-1 rounded-full">
                      {featuredPost.category}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-emerald-400 transition-colors mb-3 leading-snug">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-slate-300 text-sm leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-slate-800 flex items-center justify-center text-slate-300">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs">{featuredPost.author.name}</div>
                      <div className="text-slate-500 text-[10px]">{featuredPost.publishedAt}</div>
                    </div>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <Button size="sm" className="bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold gap-1">
                      Read Article
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 h-64 lg:h-full relative min-h-[280px] bg-slate-900">
                <Image
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {remainingPosts.map((post) => (
            <div
              key={post.slug}
              className="bg-[#121215] border border-white/10 rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all flex flex-col justify-between group"
            >
              <div className="relative h-48 w-full bg-slate-900">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-[#0A0A0C]/80 backdrop-blur-md text-emerald-400 border border-emerald-500/20 text-[11px] font-bold px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-3 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                    <span>•</span>
                    <span>{post.publishedAt}</span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors mb-3 leading-snug">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-slate-400 text-xs leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-slate-300 text-xs font-semibold">
                    By {post.author.name}
                  </div>
                  <Link href={`/blog/${post.slug}`}>
                    <Button variant="ghost" size="sm" className="text-[#00B7A8] hover:text-emerald-300 hover:bg-emerald-500/10 p-0 h-auto font-bold gap-1">
                      Read
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="w-full bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-3">
              Ready to Automate Your Practice?
            </h3>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Join 1,200+ doctors across India using Doctor Diary to eliminate no-shows and increase clinic efficiency.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold h-12 px-8 rounded-xl">
                  Claim Area Exclusivity Free
                </Button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 h-12 px-8 rounded-xl font-semibold">
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
