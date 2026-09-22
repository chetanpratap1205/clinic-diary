"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall,
  PhoneOff,
  BookOpen,
  CheckCircle2,
  Clock,
  Users,
  UserCheck,
  AlertTriangle,
  Sparkles,
  CalendarX,
  CalendarCheck,
  Smile,
  Frown,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export interface TheMirrorProps {
  className?: string;
}

export function TheMirror({ className = "" }: TheMirrorProps) {
  const [mobileTab, setMobileTab] = useState<"chaos" | "autonomous">("autonomous");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
    }
  } as const;

  const chaosPoints = [
    {
      icon: <PhoneCall className="w-4 h-4 text-rose-400" />,
      title: "Ringing Desk Phones",
      description: "40+ calls daily interrupting consultations with 'Doctor kab aayenge?'",
      badge: "~42 calls/day",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20"
    },
    {
      icon: <BookOpen className="w-4 h-4 text-amber-400" />,
      title: "Paper Register Confusion",
      description: "Handwritten ledgers with crossed-out names, lost records, and unreadable notes.",
      badge: "Lost History",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    },
    {
      icon: <Users className="w-4 h-4 text-orange-400" />,
      title: "Waiting Room Friction",
      description: "15+ restless patients crowded in reception, creating constant pressure and complaints.",
      badge: "High Stress",
      badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/20"
    },
    {
      icon: <CalendarX className="w-4 h-4 text-rose-500" />,
      title: "No-Show Slot Leakage",
      description: "Patients abandon appointments without notice, leaving costly idle gaps.",
      badge: "18-25% Lost Slots",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20"
    },
    {
      icon: <Frown className="w-4 h-4 text-amber-500" />,
      title: "Receptionist Burnout",
      description: "Staff spends 80% of their shift fielding phone calls instead of patient hospitality.",
      badge: "High Turnover",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    }
  ];

  const autonomousPoints = [
    {
      icon: <PhoneOff className="w-4 h-4 text-emerald-400" />,
      title: "Zero Queue Phone Calls",
      description: "Live token tracking & doctor ETA sent directly to patient's WhatsApp in real time.",
      badge: "0 Queue Inquiries",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    {
      icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
      title: "1-Click Digital Continuity",
      description: "Walk-ins added in 5 seconds; past history and prescriptions retrieved instantly.",
      badge: "Instant Lookup",
      badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
    },
    {
      icon: <UserCheck className="w-4 h-4 text-teal-400" />,
      title: "Quiet, Staggered Arrivals",
      description: "Patients arrive 10 mins before their token; waiting room stays calm and dignified.",
      badge: "Calm & Order",
      badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20"
    },
    {
      icon: <CalendarCheck className="w-4 h-4 text-emerald-400" />,
      title: "Autonomous Slot Recovery",
      description: "Smart WhatsApp confirmations with 1-tap rebooking automatically backfill gaps.",
      badge: "<3% No-Shows",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    {
      icon: <Smile className="w-4 h-4 text-teal-300" />,
      title: "Empowered Front Desk",
      description: "Staff delivers warm hospitality and clinical support rather than answering ringtones.",
      badge: "5-Star Experience",
      badgeColor: "bg-teal-500/10 text-teal-300 border-teal-500/20"
    }
  ];

  return (
    <section className={`py-24 px-4 sm:px-6 bg-[#040D21] text-white relative overflow-hidden ${className}`}>
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[#00B7A8]/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/3 w-[350px] h-[350px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Subtle Dot Matrix Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.1] text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#00B7A8] animate-pulse" />
            The Operational Reality
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 tracking-tight leading-[1.15]"
          >
            You spent a decade learning medicine.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-teal-300 to-cyan-400">
              Not running a front-desk call center.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base sm:text-lg font-medium leading-relaxed"
          >
            Compare the daily friction of traditional clinic operations against the serenity of an autonomous clinic engine.
          </motion.p>

          {/* Mobile Switcher (Visible on small screens) */}
          <div className="flex sm:hidden justify-center items-center gap-2 mt-8 p-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full max-w-[280px] mx-auto">
            <button
              onClick={() => setMobileTab("chaos")}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
                mobileTab === "chaos"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Old Chaos
            </button>
            <button
              onClick={() => setMobileTab("autonomous")}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
                mobileTab === "autonomous"
                  ? "bg-[#00B7A8]/20 text-[#00B7A8] border border-[#00B7A8]/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Autonomous Engine
            </button>
          </div>
        </div>

        {/* Dual Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-8 items-stretch">
          
          {/* LEFT: Old Chaotic Front Desk */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`bg-[#0B132B]/60 backdrop-blur-xl border border-rose-500/20 rounded-[32px] p-6 sm:p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all hover:border-rose-500/30 ${
              mobileTab === "autonomous" ? "hidden sm:flex" : "flex"
            }`}
          >
            {/* Top Red Glow Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-wider mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    The Friction Trap
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Old Chaotic Front Desk</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              {/* Items */}
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4 sm:space-y-5"
              >
                {chaosPoints.map((pt, idx) => (
                  <motion.li
                    key={idx}
                    variants={itemVariants}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-rose-500/20 transition-all flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      {pt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-white tracking-tight">{pt.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pt.badgeColor} shrink-0`}>
                          {pt.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                        {pt.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            {/* Bottom Highlight */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] bg-rose-950/20 -mx-6 sm:-mx-8 lg:-mx-10 -mb-6 sm:-mb-8 lg:-mb-10 p-6 sm:p-8 rounded-b-[32px] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                  The Daily Drain
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-200">
                  2.5+ hours lost every evening to chaos
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-rose-400">
                -18% ROI
              </span>
            </div>
          </motion.div>

          {/* RIGHT: Autonomous Clinic Engine */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`bg-[#0B132B]/90 backdrop-blur-xl border-2 border-[#00B7A8]/40 rounded-[32px] p-6 sm:p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between shadow-[0_0_50px_rgba(0,183,168,0.15)] transition-all hover:border-[#00B7A8]/60 ${
              mobileTab === "chaos" ? "hidden sm:flex" : "flex"
            }`}
          >
            {/* Top Emerald Glow Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B7A8]/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B7A8]/15 border border-[#00B7A8]/30 text-[#00B7A8] text-xs font-black uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#00B7A8] animate-ping" />
                    Doctor Diary Architecture
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Autonomous Clinic Engine</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#00B7A8]/15 border border-[#00B7A8]/30 flex items-center justify-center text-[#00B7A8]">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              {/* Items */}
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4 sm:space-y-5"
              >
                {autonomousPoints.map((pt, idx) => (
                  <motion.li
                    key={idx}
                    variants={itemVariants}
                    className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-[#00B7A8]/30 transition-all flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#00B7A8]/15 border border-[#00B7A8]/30 flex items-center justify-center shrink-0 mt-0.5">
                      {pt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-white tracking-tight">{pt.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pt.badgeColor} shrink-0`}>
                          {pt.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                        {pt.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </div>

            {/* Bottom Highlight */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] bg-[#00B7A8]/10 -mx-6 sm:-mx-8 lg:-mx-10 -mb-6 sm:-mb-8 lg:-mb-10 p-6 sm:p-8 rounded-b-[32px] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-[#00B7A8] uppercase tracking-wider block">
                  The Clinical Serenity
                </span>
                <span className="text-sm sm:text-base font-bold text-white">
                  Zero phone noise. Leave clinic on time.
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-[#00B7A8]">
                100% Peace
              </span>
            </div>
          </motion.div>

        </div>

        {/* Doctor Voice Quote Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md max-w-4xl mx-auto text-center"
        >
          <div className="text-xs font-black uppercase tracking-widest text-[#00B7A8] mb-2">
            The Practitioner's Standard
          </div>
          <p className="text-base sm:text-xl font-bold text-slate-200 italic leading-relaxed">
            "Your clinic is a temple of healing, not a call center. Doctor Diary takes care of the front-desk friction so you can focus 100% on patient care."
          </p>
        </motion.div>

      </div>
    </section>
  );
}
