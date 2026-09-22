"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Lock,
  BadgeCheck,
  CheckCircle2,
  Clock,
  MapPin,
  Copy,
  Check,
  Star,
  Users,
  MessageCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Share2,
  ChevronLeft,
  ChevronRight,
  RotateCw
} from "lucide-react";

export interface DigitalClinicOwnershipProps {
  className?: string;
}

export function DigitalClinicOwnership({ className = "" }: DigitalClinicOwnershipProps) {
  const [copied, setCopied] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("Today, 5:30 PM");

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText("https://clinic.doctordiary.in/dr-sharma");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  } as const;

  return (
    <section className={`py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#FAFBFC] border-t border-slate-200/80 relative overflow-hidden ${className}`}>
      {/* Soft emerald radial glow backdrop */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 via-[#00B7A8]/5 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center"
        >
          {/* Left Column: Narrative & Sovereignty Proof */}
          <div className="lg:col-span-6 text-left flex flex-col items-start">
            {/* Eyebrow Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/90 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-5 shadow-xs"
            >
              <Shield className="w-4 h-4 text-[#00B7A8]" />
              100% Practice Sovereignty
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B132B] mb-6 tracking-tight leading-snug"
            >
              Your clinic is your brand.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
                Collect 100% of your fees directly.
              </span>
            </motion.h2>

            {/* Narrative Prose */}
            <motion.div
              variants={itemVariants}
              className="space-y-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed mb-8"
            >
              <p>
                We never interfere in your consultation payments. Patients pay you directly at your clinic desk—via Cash, UPI QR, or Card—exactly as they do now.
              </p>
              <p>
                Booking appointments is 100% free for patients. Doctor Diary operates purely as your software infrastructure with zero platform commissions or per-patient cuts.
              </p>
            </motion.div>

            {/* Contrast Feature Comparison Grid */}
            <motion.div
              variants={itemVariants}
              className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            >
              <div className="bg-red-50/60 border border-red-200/70 rounded-2xl p-4 text-left">
                <div className="text-xs font-black text-red-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Aggregator Apps
                </div>
                <ul className="text-xs font-semibold text-red-900/80 space-y-1">
                  <li>• Cuts 20% to 35% of consult fees</li>
                  <li>• Holds your money in gateway delays</li>
                  <li>• Displays competitor ads over your name</li>
                </ul>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 text-left shadow-xs">
                <div className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00B7A8]" /> Doctor Diary Model
                </div>
                <ul className="text-xs font-semibold text-emerald-950 space-y-1">
                  <li>• 0% commission on consultations</li>
                  <li>• Direct collection (Cash, Desk UPI, Card)</li>
                  <li>• 100% free booking for patients</li>
                </ul>
              </div>
            </motion.div>

            {/* Signature Sovereignty Quote Callout */}
            <motion.div
              variants={itemVariants}
              className="w-full p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00B7A8] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[#00B7A8] font-black text-lg tracking-tight leading-snug">
                  &ldquo;Your clinic. Your patients. 100% your revenue.&rdquo;
                </div>
                <div className="text-slate-500 text-xs font-semibold">
                  Contractually guaranteed: We never cross-sell or monetize your patient list.
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: High-Impact Vector Browser & Mobile UI Mockup */}
          <div className="lg:col-span-6 relative w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto w-full max-w-[540px]"
            >
              {/* Desktop Browser Mock Frame */}
              <div className="w-full bg-white rounded-[28px] border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,183,168,0.15),0_12px_24px_-8px_rgba(11,19,43,0.06)] overflow-hidden">
                
                {/* Browser Top Navigation Bar */}
                <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
                  {/* Window Action Dots */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10" />
                    
                    <div className="hidden sm:flex items-center gap-1 ml-2 text-slate-400">
                      <ChevronLeft className="w-3 h-3" />
                      <ChevronRight className="w-3 h-3" />
                      <RotateCw className="w-2.5 h-2.5 ml-0.5" />
                    </div>
                  </div>

                  {/* Doctor Custom URL Bar */}
                  <div className="flex-1 max-w-[340px] bg-white border border-slate-200/90 rounded-full px-3.5 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-700 shadow-2xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <Lock className="w-3.5 h-3.5 text-[#00B7A8] shrink-0" />
                      <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">https://</span>
                      <span className="text-[#0B132B] font-bold font-mono text-[11px] truncate">clinic.doctordiary.in/dr-sharma</span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="text-slate-400 hover:text-[#00B7A8] transition-colors p-0.5 ml-1 shrink-0 cursor-pointer"
                      title="Copy Clinic Link"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Live Status Beacon */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 hidden sm:inline">LIVE</span>
                  </div>
                </div>

                {/* Inside Clinic Web Portal */}
                <div className="p-5 sm:p-7 space-y-5">
                  
                  {/* Doctor Header Profile */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {/* Doctor Avatar with Emerald Crest */}
                      <div className="relative">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#0B132B] to-slate-800 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                          DS
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-[#00B7A8] text-white p-1 rounded-full shadow-sm">
                          <BadgeCheck className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Doctor Details */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-lg sm:text-xl font-black text-[#0B132B] tracking-tight">
                            Dr. Rajesh Sharma
                          </h3>
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5 border border-emerald-200/60">
                          <BadgeCheck className="w-3 h-3 text-[#00B7A8]" />
                          MBBS, MD • Verified Specialist
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          Apex Heart & Health Clinic • Indiranagar
                        </div>
                      </div>
                    </div>

                    {/* Rating Pill */}
                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1 text-center shrink-0">
                      <div className="flex items-center gap-1 text-amber-700 font-black text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> 4.9
                      </div>
                      <div className="text-[9px] text-amber-800/80 font-bold">840+ Reviews</div>
                    </div>
                  </div>

                  {/* Live Queue Token Status Pill */}
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live OPD Queue Status
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                        Token #14 In Cabin
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-white/90 rounded-xl p-2 border border-emerald-100 shadow-2xs">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Now Serving</div>
                        <div className="text-base font-black text-[#0B132B]">#14</div>
                      </div>
                      <div className="bg-white/90 rounded-xl p-2 border border-emerald-100 shadow-2xs">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Waiting</div>
                        <div className="text-base font-black text-[#00B7A8]">12 Patients</div>
                      </div>
                      <div className="bg-white/90 rounded-xl p-2 border border-emerald-100 shadow-2xs">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Est. Wait</div>
                        <div className="text-base font-black text-slate-700">~14 mins</div>
                      </div>
                    </div>
                  </div>

                  {/* Fast Slot Selector */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span>Select Appointment Window:</span>
                      <span className="text-emerald-600 text-[11px] font-bold">Walk-ins also welcome</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["Today, 5:30 PM", "Today, 6:00 PM", "Tomorrow, 10:30 AM"].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            selectedSlot === slot
                              ? "bg-[#0B132B] text-white border-[#0B132B] shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-[#00B7A8]"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct WhatsApp Instant Booking CTA */}
                  <div className="pt-1">
                    <button className="w-full h-12 rounded-2xl bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,183,168,0.3)] hover:shadow-[0_12px_28px_rgba(0,183,168,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer group">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Book in 15 seconds via WhatsApp</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="text-center text-[10px] font-semibold text-slate-400 mt-2 flex items-center justify-center gap-2">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      No app download required • Zero platform fees
                    </div>
                  </div>

                </div>

                {/* Bottom Sovereign Guarantee Banner */}
                <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between text-[11px] font-semibold border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">100% Sovereign:</span>
                    <span className="text-slate-300">No competitor ads shown to your patients.</span>
                  </div>
                  <span className="text-[#00B7A8] font-bold">₹0 Commission</span>
                </div>

              </div>

              {/* Floating Mobile Companion Card: WhatsApp Confirmation Simulation */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -bottom-6 -right-2 sm:-right-6 w-[260px] sm:w-[280px] bg-white rounded-2xl border border-slate-200/90 shadow-xl p-3.5 z-20"
              >
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-900">Dr. Sharma&apos;s Clinic Bot</div>
                  <span className="ml-auto text-[9px] text-slate-400 font-medium">Just now</span>
                </div>
                <div className="bg-emerald-50/80 rounded-xl p-2.5 text-[11px] text-slate-700 leading-tight border border-emerald-100">
                  <p className="font-bold text-emerald-950 mb-1">Appointment Confirmed! ✓✓</p>
                  <p>Token <strong className="text-[#0B132B]">#19</strong> reserved for Rahul V. at 5:30 PM.</p>
                  <div className="mt-1.5 text-[10px] text-[#00B7A8] font-bold flex items-center gap-1">
                    <span>Live Tracker: clinic.doctordiary.in/track</span>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
