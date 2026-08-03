"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Play,
  Star,
  ChevronRight,
  Shield,
  Calendar,
  Check
} from "lucide-react";

export function HeroRedesign() {
  return (
    <section className="relative w-full bg-[#F8FAFC] overflow-hidden lg:h-[calc(100vh-10px)] lg:min-h-[600px] lg:max-h-[820px] flex flex-col justify-center pt-20 lg:pt-22 pb-6 lg:pb-8 group/section">
      {/* Background Studio Gradients & Grid Lines */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0B132B 1px, transparent 1px)",
          backgroundSize: "32px 32px"
        }}
      />

      {/* Organic Emerald Light Arc Backdrop */}
      <div className="absolute top-1/2 right-12 -translate-y-1/2 w-[500px] sm:w-[650px] h-[500px] sm:h-[650px] bg-gradient-to-tr from-emerald-400/20 via-teal-300/15 to-cyan-400/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-8 left-8 w-[320px] h-[320px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none -z-10" />

      <div className="w-full max-w-[1550px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10 flex flex-col justify-center h-full">
        
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-4 items-center">
          
          {/* Left Column: Typography, Badges & CTAs */}
          <div className="lg:col-span-6 flex flex-col text-center lg:text-left items-center lg:items-start my-auto">
            
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[34px] sm:text-[44px] lg:text-[48px] xl:text-[54px] font-black text-[#0B132B] leading-[1.08] tracking-tight mb-3 sm:mb-4"
            >
              Stop Sharing Patients.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
                Build a Premium Clinic.
              </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base text-slate-600 mb-5 max-w-lg leading-relaxed font-medium"
            >
              Deliver a 5-star digital experience that keeps your practice independent. Get your branded patient app, zero-chaos queue management, and automated WhatsApp follow-ups.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-5"
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="relative overflow-hidden w-full sm:w-auto bg-[#00B7A8] hover:bg-[#00998c] text-white h-12 sm:h-13 px-8 text-sm sm:text-base font-bold rounded-full transition-all flex items-center justify-center gap-2 group shadow-[0_6px_20px_rgba(0,183,168,0.3)] hover:shadow-[0_10px_30px_rgba(0,183,168,0.45)] hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  <Star className="w-4 h-4 fill-current relative z-10" />
                  <span className="relative z-10">Start 14-Day Free Trial</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform relative z-10" />
                </Button>
              </Link>

              <Link href="/demo" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-white/90 backdrop-blur-md border-slate-200 text-[#0B132B] hover:bg-white h-12 sm:h-13 px-7 text-sm sm:text-base font-bold rounded-full transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
                >
                  <div className="bg-[#0B132B]/5 rounded-full p-1.5 group-hover:scale-110 transition-transform">
                    <Play className="w-3 h-3 fill-[#0B132B]" />
                  </div>
                  Watch 2-min Demo
                </Button>
              </Link>
            </motion.div>

            {/* Micro Benefits Line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-y-1.5 gap-x-5 text-xs font-bold text-slate-600 mb-5"
            >
              <div className="flex items-center gap-1.5">
                <div className="bg-emerald-500/10 p-0.5 rounded-full text-emerald-600">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span>Zero Patient Sharing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-emerald-500/10 p-0.5 rounded-full text-emerald-600">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span>No Credit Card Needed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-emerald-500/10 p-0.5 rounded-full text-emerald-600">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span>5-Min Instant Setup</span>
              </div>
            </motion.div>

            {/* Avatar Trust Pile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-200/80 w-full justify-center lg:justify-start"
            >
              <div className="flex -space-x-2.5">
                <Image src="https://i.pravatar.cc/100?img=11" alt="Doctor" width={32} height={32} unoptimized className="rounded-full border-2 border-white shadow-sm z-30" />
                <Image src="https://i.pravatar.cc/100?img=32" alt="Doctor" width={32} height={32} unoptimized className="rounded-full border-2 border-white shadow-sm z-20" />
                <Image src="https://i.pravatar.cc/100?img=12" alt="Doctor" width={32} height={32} unoptimized className="rounded-full border-2 border-white shadow-sm z-10" />
                <Image src="https://i.pravatar.cc/100?img=47" alt="Doctor" width={32} height={32} unoptimized className="rounded-full border-2 border-white shadow-sm z-0" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-xs font-black text-[#0B132B] ml-1">4.9/5</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-500">
                  Trusted by <strong>1,200+ Premium Clinics</strong> across India
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Doctor Cutout with Floating Badges */}
          <div className="lg:col-span-6 relative flex items-center justify-center h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[520px]">
            
            {/* The Transparent Doctor Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-[380px] sm:h-[460px] lg:h-[520px] xl:h-[560px] flex items-center justify-center z-20"
            >
              <Image
                src="/assets/images/clinic-hero-exact.png"
                alt="Doctor Diary Premium Clinic Specialists"
                fill
                priority
                unoptimized
                className="object-contain object-center scale-110 sm:scale-115 lg:scale-115 drop-shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>

            {/* 4 Floating Frosted Glass Micro-Widgets */}

            {/* Widget 1: Top Left */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute left-[0%] lg:left-[2%] top-[8%] lg:top-[10%] bg-white/95 backdrop-blur-xl border border-emerald-500/30 p-2.5 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] z-30 max-w-[160px] sm:max-w-[180px]"
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold text-[#0B132B] uppercase tracking-wider">Live App Sync</span>
              </div>
              <div className="text-[11px] font-bold text-slate-800">Queue: 3 Waiting</div>
              <div className="text-[9px] text-slate-500 font-medium">Auto WhatsApp confirmation</div>
            </motion.div>

            {/* Widget 2: Bottom Left */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute -left-[2%] lg:left-[0%] bottom-[10%] lg:bottom-[12%] bg-white/95 backdrop-blur-xl border border-blue-500/20 p-2.5 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] z-30 max-w-[170px] sm:max-w-[190px]"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className="bg-blue-500 rounded-full p-1 text-white">
                  <Calendar className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold text-slate-900">New Booking</span>
              </div>
              <p className="text-[9px] text-slate-600 leading-snug font-medium">
                Patient Rohan booked via clinic QR code.
              </p>
            </motion.div>

            {/* Widget 3: Top Right */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute right-[0%] lg:right-[2%] top-[10%] lg:top-[12%] bg-white/95 backdrop-blur-xl border border-emerald-500/30 p-2.5 rounded-2xl shadow-[0_10px_25px_rgba(0,183,168,0.1)] z-30 max-w-[160px] sm:max-w-[180px]"
            >
              <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-[10px] uppercase tracking-wider mb-0.5">
                <Shield className="w-3 h-3" />
                <span>Direct Payments</span>
              </div>
              <div className="text-[11px] font-bold text-slate-900">100% Direct Revenue</div>
              <div className="text-[9px] text-slate-500 font-medium">Instant bank settlement</div>
            </motion.div>

            {/* Widget 4: Bottom Right */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="absolute -right-[2%] lg:right-[0%] bottom-[8%] lg:bottom-[10%] bg-white/95 backdrop-blur-xl border border-amber-500/20 p-2.5 rounded-2xl shadow-[0_10px_25px_rgba(245,158,11,0.1)] z-30 max-w-[170px] sm:max-w-[190px]"
            >
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <div className="text-[10px] font-bold text-slate-900">"Highly recommended!"</div>
              <div className="text-[9px] text-slate-500 font-medium">Google Verified Review</div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
}
