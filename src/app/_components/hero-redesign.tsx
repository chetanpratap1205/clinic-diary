"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Play,
  Star,
  ChevronRight,
  Shield,
  Calendar,
  Check,
  X
} from "lucide-react";

export function HeroRedesign() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
            
            {/* Eyebrow Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 bg-[#00B7A8]/10 text-[#00B7A8] border border-[#00B7A8]/20 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-widest mb-4"
            >
              For India's 10 Lakh+ Independent Doctors
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-[26px] min-[375px]:text-[30px] sm:text-[44px] lg:text-[48px] xl:text-[54px] font-black text-[#0B132B] leading-[1.1] tracking-tight mb-3 sm:mb-4"
            >
              <span className="block">Clinic Management Software</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
                for Doctors.
              </span>
            </motion.h1>

            {/* Subhead */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base text-slate-600 mb-5 max-w-lg leading-relaxed font-medium"
            >
              Manage appointments, walk-ins, patients and follow-ups in one simple system — let patients book you 24×7 through your own clinic page or scan your QR at the clinic, while you keep your own Rx pad, your patients and 100% of your consultation fees.
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
                  <span className="relative z-10">Set Up Your Clinic — It's Free</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform relative z-10" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsVideoModalOpen(true)}
                className="w-full sm:w-auto bg-white/90 backdrop-blur-md border-slate-200 text-[#0B132B] hover:bg-white h-12 sm:h-13 px-7 text-sm sm:text-base font-bold rounded-full transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
              >
                <Play className="w-4 h-4 fill-current" />
                See How It Works
              </Button>
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
                <span>No disruption to your current patients</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-emerald-500/10 p-0.5 rounded-full text-emerald-600">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span>Works for 40+ specialties</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-emerald-500/10 p-0.5 rounded-full text-emerald-600">
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
                <span>Your name, not ours</span>
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

            {/* 2 Floating Frosted Glass Micro-Widgets */}

            {/* Widget 1: Bottom Left - Keep your Rx Pad */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute left-0 sm:-left-4 lg:-left-8 bottom-[-5%] sm:bottom-[5%] lg:bottom-[5%] bg-white/95 backdrop-blur-xl border border-slate-200 p-2 sm:p-3.5 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] z-30 max-w-[140px] sm:max-w-[200px]"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
                <div className="bg-[#0B132B] rounded-full p-1 sm:p-1.5 text-white shrink-0">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </div>
                <span className="text-[9px] sm:text-[11px] font-bold text-[#0B132B] uppercase tracking-wider">Keep your Rx Pad</span>
              </div>
              <p className="text-[9px] sm:text-[11px] font-semibold text-slate-600 leading-snug">
                No typing required. Write prescriptions as you do today.
              </p>
            </motion.div>

            {/* Widget 2: Top Right - Direct Payments */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute right-0 sm:-right-4 lg:-right-8 top-[-10%] sm:top-[-5%] lg:top-[2%] bg-white/95 backdrop-blur-xl border border-emerald-500/30 p-2 sm:p-3.5 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] z-30 max-w-[140px] sm:max-w-[200px]"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5">
                <div className="bg-emerald-100 rounded-full p-1 sm:p-1.5 text-emerald-600 shrink-0">
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <span className="text-[9px] sm:text-[11px] font-extrabold text-[#0B132B] uppercase tracking-wider">No Involvement in Payment</span>
              </div>
              <p className="text-[9px] sm:text-[11px] font-semibold text-slate-600 leading-snug">
                100% payments go directly to your desk. We charge zero commission.
              </p>
            </motion.div>


          </div>

        </div>

      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <video
                src="/demo_video.mp4"
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
