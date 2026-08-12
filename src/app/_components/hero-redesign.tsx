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
    <section className="relative w-full bg-[#F8FAFC] overflow-hidden lg:h-[calc(100vh-10px)] lg:min-h-[600px] lg:max-h-[820px] flex flex-col justify-center pt-24 lg:pt-[100px] pb-6 lg:pb-8 group/section">
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
              className="text-[26px] min-[375px]:text-[30px] sm:text-[44px] lg:text-[48px] xl:text-[54px] font-black text-[#0B132B] leading-[1.1] tracking-tight mb-3 sm:mb-4"
            >
              <span className="block">Your clinic,</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B] whitespace-nowrap">
                exactly as you envisioned it.
              </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base text-slate-600 mb-5 max-w-lg leading-relaxed font-medium"
            >
              Doctor Diary is the digital front desk for independent clinics. Booking. Live queue. WhatsApp. Follow-ups. All under your clinic's name.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mb-5"
            >
              <Link href="/demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="relative overflow-hidden w-full sm:w-auto bg-[#00B7A8] hover:bg-[#00998c] text-white h-12 sm:h-13 px-8 text-sm sm:text-base font-bold rounded-full transition-all flex items-center justify-center gap-2 group shadow-[0_6px_20px_rgba(0,183,168,0.3)] hover:shadow-[0_10px_30px_rgba(0,183,168,0.45)] hover:-translate-y-0.5"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  <span className="relative z-10">See Doctor Diary in Action</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform relative z-10" />
                </Button>
              </Link>

              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-white/90 backdrop-blur-md border-slate-200 text-[#0B132B] hover:bg-white h-12 sm:h-13 px-7 text-sm sm:text-base font-bold rounded-full transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
                >
                  Start Free — No Card Needed
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
                <span>Your patients. Your clinic.</span>
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
                <span>Quick Clinic Setup</span>
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

            {/* 3 Floating Frosted Glass Micro-Widgets */}

            {/* Widget 1: Top Left - Zero Chaos */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute left-[0%] lg:left-[2%] top-[12%] lg:top-[15%] bg-white/95 backdrop-blur-xl border border-emerald-500/30 p-3 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] z-30 max-w-[160px] sm:max-w-[180px]"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-extrabold text-[#0B132B] uppercase tracking-wider">Zero Chaos</span>
              </div>
              <div className="text-xs font-bold text-slate-800">Queue: 3 Patients</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">Live updates on their phone</div>
            </motion.div>

            {/* Widget 2: Bottom Right - New Booking */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute right-[0%] lg:right-[2%] bottom-[15%] lg:bottom-[20%] bg-white/95 backdrop-blur-xl border border-blue-500/20 p-3 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] z-30 max-w-[170px] sm:max-w-[190px]"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className="bg-blue-500 rounded-full p-1 text-white">
                  <Calendar className="w-3 h-3" />
                </div>
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">New Booking</span>
              </div>
              <p className="text-[10px] text-slate-600 leading-snug font-medium">
                Patient booked via clinic QR
              </p>
            </motion.div>

            {/* Widget 3: Center near Phone - Phone UI Simulation */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="absolute left-[50%] -translate-x-1/2 bottom-[35%] lg:bottom-[40%] bg-white/95 backdrop-blur-xl border border-slate-200/50 p-4 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.12)] z-30 w-48 text-center"
            >
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">Today's Clinic</div>
              <div className="text-2xl font-black text-[#0B132B] mb-3">24 <span className="text-sm font-semibold text-slate-500">patients</span></div>
              
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl py-2 px-3 mb-2 flex items-center justify-center gap-2 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[13px] font-extrabold text-emerald-800">Now serving #18</span>
              </div>
              
              <div className="text-[11px] font-bold text-slate-600">6 waiting</div>
            </motion.div>


          </div>

        </div>

      </div>
    </section>
  );
}
