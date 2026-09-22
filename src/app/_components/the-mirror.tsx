"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PhoneCall,
  PhoneOff,
  BookOpen,
  CheckCircle2,
  Users,
  UserCheck,
  AlertTriangle,
  Sparkles,
  CalendarX,
  CalendarCheck,
  Smile,
  Frown,
  Activity,
  History,
  ShieldCheck,
  Clock,
  ArrowRight
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
        staggerChildren: 0.08,
        delayChildren: 0.1
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
      icon: <PhoneCall className="w-4 h-4 text-rose-600" />,
      title: "Ringing Desk Phones",
      description: "40+ calls daily interrupting consultations with 'Doctor kab aayenge?'",
      badge: "~42 calls/day",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200"
    },
    {
      icon: <BookOpen className="w-4 h-4 text-amber-600" />,
      title: "Paper Register Bottlenecks",
      description: "Handwritten ledgers with crossed-out names, lost records, and unreadable clinical notes.",
      badge: "Lost History",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
    },
    {
      icon: <Users className="w-4 h-4 text-orange-600" />,
      title: "Agitated Waiting Room",
      description: "15+ restless patients crowded in reception with zero queue transparency or real-time ETAs.",
      badge: "High Stress",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200"
    },
    {
      icon: <CalendarX className="w-4 h-4 text-rose-600" />,
      title: "No-Show Slot Leakage",
      description: "Patients miss or delay visits without notice, leaving costly idle gaps during prime hours.",
      badge: "18-25% Lost Slots",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200"
    },
    {
      icon: <Frown className="w-4 h-4 text-amber-600" />,
      title: "Receptionist Exhaustion",
      description: "Staff spends 80% of their shift answering phone queries instead of welcoming patients.",
      badge: "High Turnover",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200"
    },
    {
      icon: <History className="w-4 h-4 text-rose-600" />,
      title: "Forgotten Follow-Ups",
      description: "Chronic patients and post-op reviews slip through the cracks without structured tracking.",
      badge: "Care Disconnect",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200"
    }
  ];

  const autonomousPoints = [
    {
      icon: <PhoneOff className="w-4 h-4 text-teal-700" />,
      title: "Zero Queue Phone Calls",
      description: "Live token tracking & doctor ETA sent directly to patient's WhatsApp in real time.",
      badge: "0 Queue Inquiries",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200"
    },
    {
      icon: <Sparkles className="w-4 h-4 text-teal-700" />,
      title: "1-Click Digital Continuity",
      description: "Walk-ins added in 5 seconds; complete past prescriptions and history retrieved instantly.",
      badge: "Instant Lookup",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
    },
    {
      icon: <UserCheck className="w-4 h-4 text-teal-700" />,
      title: "Quiet, Staggered Arrivals",
      description: "Patients arrive 10 mins before their token; waiting room stays calm and dignified.",
      badge: "Calm & Order",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200"
    },
    {
      icon: <CalendarCheck className="w-4 h-4 text-teal-700" />,
      title: "Autonomous Slot Recovery",
      description: "Smart WhatsApp confirmations with 1-tap rebooking automatically refill cancelled slots.",
      badge: "<3% No-Shows",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
    },
    {
      icon: <Smile className="w-4 h-4 text-teal-700" />,
      title: "Hospitality-First Staff",
      description: "Receptionist welcomes patients with clinical hospitality rather than fielding ringtones.",
      badge: "5-Star Experience",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200"
    },
    {
      icon: <Activity className="w-4 h-4 text-teal-700" />,
      title: "Automated Care Continuity",
      description: "Scheduled WhatsApp follow-up prompts ensure diabetic, cardiac, and chronic adherence.",
      badge: "92% Adherence",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
    }
  ];

  return (
    <section className={`py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC] text-slate-900 relative overflow-hidden ${className}`}>
      {/* Background Ambient Radial Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-400/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-[350px] h-[350px] bg-rose-400/8 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Subtle Dot Matrix Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0B132B 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            className="inline-flex items-center gap-2 bg-[#00B7A8]/10 border border-[#00B7A8]/20 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#00B7A8] animate-pulse" />
            Friction-Free Practice
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.18] text-[#0B132B]"
          >
            Your clinic is a temple of healing, not a call center.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B] mt-2">
              Doctor Diary takes the friction so you can focus on the patient.
            </span>
          </motion.h2>

          {/* Mobile Tab Switcher (Screens < sm) */}
          <div className="flex sm:hidden justify-center items-center gap-2 mt-8 p-1.5 bg-slate-200/60 border border-slate-300/80 rounded-full max-w-[290px] mx-auto">
            <button
              onClick={() => setMobileTab("chaos")}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
                mobileTab === "chaos"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Old Chaos
            </button>
            <button
              onClick={() => setMobileTab("autonomous")}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all ${
                mobileTab === "autonomous"
                  ? "bg-[#00B7A8] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Autonomous Engine
            </button>
          </div>
        </div>

        {/* Dual Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* ============================================================= */}
          {/* LEFT: The Friction Trap (Old Chaotic Front Desk)              */}
          {/* ============================================================= */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className={`relative rounded-[32px] bg-rose-50/50 backdrop-blur-xl border border-rose-200/80 shadow-[0_10px_30px_rgba(244,63,94,0.06)] p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-all hover:border-rose-300 overflow-hidden pointer-events-auto ${
              mobileTab === "autonomous" ? "hidden sm:flex" : "flex"
            }`}
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-rose-200/70 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-wider mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    The Friction Trap
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Old Chaotic Front Desk
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                </div>
              </div>

              {/* 6 Friction Points */}
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="space-y-3.5 relative z-10"
              >
                {chaosPoints.map((pt, idx) => (
                  <motion.li
                    key={idx}
                    variants={itemVariants}
                    className="p-3.5 rounded-2xl bg-white border border-rose-100/80 shadow-sm hover:border-rose-300 transition-all flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0 mt-0.5">
                      {pt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900 tracking-tight">{pt.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pt.badgeColor} shrink-0`}>
                          {pt.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {pt.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>

              {/* Doctor Kab Aayenge Kicker */}
              <div className="mt-5 p-4 rounded-2xl bg-rose-100/70 border border-rose-200/80 flex items-start gap-3 relative z-10">
                <div className="p-1.5 rounded-xl bg-rose-200/80 text-rose-700 shrink-0 mt-0.5">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-rose-800 uppercase tracking-wider">
                    The Chronic Reception Interruption:
                  </div>
                  <div className="text-sm font-black text-slate-900 italic mt-0.5">
                    &ldquo;Doctor kab aayenge? Kitna time lagega?&rdquo;
                  </div>
                  <div className="text-xs text-rose-700 mt-1">
                    Echoed 40+ times daily, draining clinic staff and fraying patient patience.
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Contrast Metric */}
            <div className="mt-8 pt-6 border-t border-rose-200/80 bg-rose-100/50 -mx-6 sm:-mx-8 lg:-mx-10 -mb-6 sm:-mb-8 lg:-mb-10 p-6 sm:p-8 rounded-b-[32px] flex items-center justify-between relative z-10">
              <div>
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                  The Daily Drain
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  2.5+ hours lost daily to administrative friction
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-rose-600">
                -18% Revenue
              </span>
            </div>
          </motion.div>

          {/* ============================================================= */}
          {/* RIGHT: Autonomous Clinic Engine (Doctor Diary)                */}
          {/* ============================================================= */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className={`relative rounded-[32px] bg-white border-2 border-[#00B7A8]/40 shadow-[0_15px_40px_rgba(0,183,168,0.12)] p-6 sm:p-8 lg:p-10 flex flex-col justify-between transition-all hover:border-[#00B7A8]/70 overflow-hidden pointer-events-auto ${
              mobileTab === "chaos" ? "hidden sm:flex" : "flex"
            }`}
          >
            {/* Top Emerald Glow Accent */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100 relative z-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00B7A8]/10 border border-[#00B7A8]/20 text-[#00B7A8] text-xs font-black uppercase tracking-wider mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#00B7A8] animate-ping" />
                    Doctor Diary Architecture
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0B132B] tracking-tight">
                    Autonomous Clinic Engine
                  </h3>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#00B7A8]/10 border border-[#00B7A8]/20 flex items-center justify-center text-[#00B7A8] shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              {/* 6 Autonomous Solutions */}
              <motion.ul
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                className="space-y-3.5 relative z-10"
              >
                {autonomousPoints.map((pt, idx) => (
                  <motion.li
                    key={idx}
                    variants={itemVariants}
                    className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:bg-white hover:border-[#00B7A8]/40 shadow-sm transition-all flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0 mt-0.5">
                      {pt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-900 tracking-tight">{pt.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pt.badgeColor} shrink-0`}>
                          {pt.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {pt.description}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>

              {/* The Autonomous Solution Kicker */}
              <div className="mt-5 p-4 rounded-2xl bg-teal-50 border border-teal-200/80 flex items-start gap-3 relative z-10">
                <div className="p-1.5 rounded-xl bg-teal-100 text-[#00B7A8] shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#00B7A8] uppercase tracking-wider">
                    Autonomous Patient Notification:
                  </div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    &ldquo;Dr. Sharma is seeing Token #12. Your Token #14 ETA: 12 Mins.&rdquo;
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Sent automatically via WhatsApp. Patients relax at home and arrive right on time.
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Contrast Metric */}
            <div className="mt-8 pt-6 border-t border-slate-100 bg-[#00B7A8]/10 -mx-6 sm:-mx-8 lg:-mx-10 -mb-6 sm:-mb-8 lg:-mb-10 p-6 sm:p-8 rounded-b-[32px] flex items-center justify-between relative z-10">
              <div>
                <span className="text-[11px] font-bold text-[#00B7A8] uppercase tracking-wider block">
                  The Clinical Serenity
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  Zero phone noise. Finish consultations on time every night.
                </span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-[#00B7A8]">
                100% Peace
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
