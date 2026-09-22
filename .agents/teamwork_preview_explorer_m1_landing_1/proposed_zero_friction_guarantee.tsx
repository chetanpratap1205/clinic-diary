"use client";

import { motion } from "framer-motion";
import {
  Users,
  PenTool,
  Database,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Smartphone,
  FileSpreadsheet,
  Lock,
  Sparkles
} from "lucide-react";

export interface ZeroFrictionGuaranteeProps {
  className?: string;
}

export function ZeroFrictionGuarantee({ className = "" }: ZeroFrictionGuaranteeProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  } as const;

  return (
    <section className={`py-24 px-4 sm:px-6 bg-[#FAFBFC] border-t border-slate-200/80 relative overflow-hidden ${className}`}>
      {/* Background Subtle Highlights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Grid line accents */}
      <div
        className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0B132B 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-4 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#00B7A8]" />
            Zero Clinical Friction Guarantee
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B132B] mb-6 tracking-tight leading-[1.12]"
          >
            Modernize your clinic.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
              Without changing how you practice.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed"
          >
            Enterprise hospital software forces doctors to type and receptionists to take training courses. Doctor Diary wraps seamlessly around your existing habits with zero workflow friction.
          </motion.p>
        </div>

        {/* 4 Elevated Guarantee Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6"
        >
          
          {/* Card 1: Walk-ins Stay Walk-ins */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
            className="bg-white border border-slate-200/90 rounded-[32px] p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 group"
          >
            <div>
              {/* Micro-Badge & Icon Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#00B7A8] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  No Forced Apps
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-bold text-[#0B132B] mb-2 tracking-tight leading-snug">
                Your Walk-ins?<br />
                <span className="text-[#00B7A8]">They Still Come.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Never force elderly patients or sudden walk-ins to download an app. Receptionist adds them in 1 tap, or they scan a desk QR. Both walk-ins and online bookings merge into one unified queue.
              </p>

              {/* High-Craft SVG Micro-Mockup: 1-Click Walk-in & QR Plaque */}
              <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-6 shadow-inner">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 text-[10px] font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-[#00B7A8]" /> Desk QR Token Stand
                  </span>
                  <span className="text-emerald-600 font-black">Live Token #14</span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-[#0B132B]">Ramesh Patel (Walk-in)</div>
                    <div className="text-[9px] font-semibold text-slate-400">Added via Front Desk • 2m ago</div>
                  </div>
                  <div className="px-2 py-1 bg-emerald-50 text-[#00B7A8] border border-emerald-200 rounded-lg text-[10px] font-black">
                    Token #14
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    1-Tap Entry • No Login Required
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Patient Friction:</span>
              <span className="text-emerald-600 font-extrabold">0% Required</span>
            </div>
          </motion.div>

          {/* Card 2: Keep Your Paper Rx Pad */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
            className="bg-white border border-slate-200/90 rounded-[32px] p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 group"
          >
            <div>
              {/* Micro-Badge & Icon Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 border border-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <PenTool className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/60">
                  Zero Forced Typing
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-bold text-[#0B132B] mb-2 tracking-tight leading-snug">
                Your Rx Pad?<br />
                <span className="text-[#00B7A8]">We Don't Touch It.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Spend consultations looking at your patient, not typing on a screen. Write on your trusted letterhead. Snap a 1-second photo, and we deliver a verified digital PDF straight to WhatsApp.
              </p>

              {/* High-Craft SVG Micro-Mockup: Rx Pad to WhatsApp */}
              <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-6 shadow-inner">
                <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                    <span className="text-[10px] font-black text-slate-700">Rx Clinic Letterhead</span>
                    <span className="text-[9px] font-bold text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded">Handwritten</span>
                  </div>
                  {/* Handwritten lines simulation */}
                  <div className="space-y-1.5 opacity-60">
                    <div className="h-1.5 bg-slate-300 rounded w-4/5" />
                    <div className="h-1.5 bg-slate-300 rounded w-3/5" />
                    <div className="h-1.5 bg-slate-300 rounded w-2/3" />
                  </div>
                  {/* Morph arrow overlay */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-emerald-700 bg-emerald-50/70 -mx-2.5 -mb-2.5 p-2 rounded-b-xl">
                    <span className="flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-emerald-600" />
                      Auto-WhatsApp PDF
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Keyboard Typing:</span>
              <span className="text-emerald-600 font-extrabold">0 Words Required</span>
            </div>
          </motion.div>

          {/* Card 3: 48-Hour Historical Register Migration */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
            className="bg-white border border-slate-200/90 rounded-[32px] p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 group"
          >
            <div>
              {/* Micro-Badge & Icon Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                  White-Glove Service
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-bold text-[#0B132B] mb-2 tracking-tight leading-snug">
                Your Old Registers?<br />
                <span className="text-[#00B7A8]">Migrated Free in 48h.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Have paper registers, spiral diaries, or scattered Excel sheets? Hand them to us. Our dedicated data engineers digitize, index, and verify your historical patient files in 48 hours—100% free.
              </p>

              {/* High-Craft SVG Micro-Mockup: Paper/Excel -> Cloud Database */}
              <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-6 shadow-inner">
                <div className="flex items-center justify-between mb-2 text-[10px] font-bold text-slate-600">
                  <span className="flex items-center gap-1">
                    <FileSpreadsheet className="w-3 h-3 text-teal-600" /> Past Patient Books
                  </span>
                  <span className="text-teal-600 font-black">48h SLA</span>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#0B132B]">
                    <span>Digitization Pipeline</span>
                    <span className="text-emerald-600">100% Verified</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full w-full" />
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-semibold text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-slate-400" /> 256-bit Encrypted
                    </span>
                    <span className="text-slate-600">Zero Lost Records</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Migration Cost:</span>
              <span className="text-emerald-600 font-extrabold">₹0 (Included Free)</span>
            </div>
          </motion.div>

          {/* Card 4: 24/7 Autonomous Visibility */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
            className="bg-[#0B132B] border border-slate-800 rounded-[32px] p-6 flex flex-col justify-between shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
          >
            {/* Ambient Cyan/Teal Glow Backdrop */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#00B7A8]/20 rounded-full blur-3xl group-hover:bg-[#00B7A8]/30 transition-all pointer-events-none" />

            <div className="relative z-10">
              {/* Micro-Badge & Icon Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Always Active
                </span>
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-xl font-bold text-white mb-2 tracking-tight leading-snug">
                Your Clinic Closes?<br />
                <span className="text-[#00B7A8]">Visibility Stays 24/7.</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed mb-6">
                When your shutters pull down at 8:30 PM, your digital front desk stays open. Patients book tomorrow's appointments at midnight and track their live queue token from home.
              </p>

              {/* High-Craft SVG Micro-Mockup: Night Live Queue Status */}
              <div className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3.5 mb-6 backdrop-blur-md">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] text-[10px] font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Queue Tracker
                  </span>
                  <span className="text-[#00B7A8] font-bold">11:15 PM Active</span>
                </div>
                <div className="bg-white/[0.06] rounded-xl border border-white/[0.08] p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-white">
                    <span>Tomorrow: 09:30 AM Slot</span>
                    <span className="text-emerald-400">Confirmed</span>
                  </div>
                  <div className="text-[9px] font-medium text-slate-400">
                    Patient self-booked via WhatsApp token link
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <div className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                    Zero Staff Phone Calls Needed
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Tag */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] font-bold text-slate-400 relative z-10">
              <span>Midnight Phone Inquiries:</span>
              <span className="text-emerald-400 font-extrabold">0 Calls</span>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
