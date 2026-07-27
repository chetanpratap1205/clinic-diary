import Metadata from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Watch 2-Min Product Demo | Doctor Diary",
  description: "Watch a 2-minute walkthrough of Doctor Diary.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Navigation Bar */}
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
                2-Min Product Demo
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
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center">
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Official Platform Demo
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            2-Minute Product Walkthrough
          </h1>
          
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            See how Doctor Diary automates patient scheduling, WhatsApp reminders, and clinic growth.
          </p>
        </div>

        {/* Video Container */}
        <div className="w-full bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,183,168,0.15)] mb-8 relative">
          <div className="relative aspect-video w-full bg-black">
            <video
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-contain"
            >
              <source src="/demo_video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link href="/signup" className="w-full sm:w-auto flex-1">
            <Button size="lg" className="w-full bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold h-12 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(0,183,168,0.39)]">
              <Star className="w-4 h-4 fill-current" />
              Claim Area Exclusivity
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="w-full border-t border-white/10 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Doctor Diary by NatureXpress. All rights reserved.
      </footer>
    </div>
  );
}
