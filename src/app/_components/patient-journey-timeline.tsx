"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Search,
  QrCode,
  Clock,
  Utensils,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Smartphone,
  Users,
  Sun,
  Moon,
  Calendar,
  TrendingUp,
  MessageCircle,
  Zap,
  ShieldCheck,
  FileText,
  Star,
  Check,
  ExternalLink,
  Lock,
  Download,
  Bell,
  ThumbsUp,
  Share2,
  RefreshCw
} from "lucide-react";

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

// 6 Stages of the Clinical Cycle
interface JourneyStage {
  id: string;
  stepNumber: string;
  title: string;
  tagline: string;
  badge: string;
  metric: string;
  metricLabel: string;
  description: string;
  points: string[];
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "booking",
    stepNumber: "01",
    title: "Instant Booking",
    tagline: "15s WhatsApp Booking • Zero App Download",
    badge: "Discovery & Intake",
    metric: "15 Sec",
    metricLabel: "Average Booking Time",
    description: "Patients book in 15 seconds via WhatsApp, Google Maps, or desk QR code — with zero app download or password fatigue required.",
    points: [
      "Zero app installation or password fatigue",
      "Seamless integration with Google Maps, Website, and QR posters",
      "Automatic slot pacing that matches your consultation speed"
    ]
  },
  {
    id: "reminders",
    stepNumber: "02",
    title: "Smart Reminders",
    tagline: "24h & 2h Alerts • Slashing No-Shows by 88%",
    badge: "Attendance Guarantee",
    metric: "2.1%",
    metricLabel: "No-Show Rate (Down from 18%)",
    description: "Automated two-way WhatsApp alerts sent 24h & 2h prior allow patients to confirm or reschedule in 1 tap, eliminating empty idle slots.",
    points: [
      "Two-way interactive [Confirm] or [Reschedule] quick buttons",
      "Automated WhatsApp message with directions and parking guide",
      "Auto-fill cancellations from the digital standby waitlist"
    ]
  },
  {
    id: "live-queue",
    stepNumber: "03",
    title: "Live Queue Tracking",
    tagline: "Real-Time Tokens • Zero Lobby Congestion",
    badge: "OPD Flow Management",
    metric: "-40 Min",
    metricLabel: "Waiting Room Congestion Drop",
    description: "Patients track their live token status from home or their car, eliminating reception chaos and crowded waiting rooms.",
    points: [
      "Real-time token counter: Now In Cabin vs Your Token",
      "Dynamic ETA countdown adapting to doctor's current pace",
      "Automated SMS/WhatsApp nudge: 'You are next, please proceed to cabin'"
    ]
  },
  {
    id: "consult",
    stepNumber: "04",
    title: "Zero-Friction Consult",
    tagline: "Keep Your Traditional Rx Pad • Zero Forced Typing",
    badge: "Clinical Freedom",
    metric: "100%",
    metricLabel: "Handwriting & Speed Preserved",
    description: "Write naturally on your paper Rx pad without typing on a screen during consultation. Reception snaps a 5-second photo to auto-index records.",
    points: [
      "Zero eye contact lost with patient — no awkward keyboard typing",
      "Receptionist 5-second camera scan automatically archives PDF",
      "Complete historical Rx timeline accessible on doctor tablet in 1 tap"
    ]
  },
  {
    id: "digital-rx",
    stepNumber: "05",
    title: "Digital Rx & Bill on WhatsApp",
    tagline: "Instant Branded PDF Delivered Before Patient Exits",
    badge: "Discharge & Compliance",
    metric: "< 3 Sec",
    metricLabel: "WhatsApp PDF Delivery Time",
    description: "A crisp, branded PDF prescription and bill arrive on the patient's WhatsApp before they leave your clinic, ensuring zero lost medical notes.",
    points: [
      "High-resolution digital prescription with clinic letterhead & DMC registration",
      "Automated GST invoice and digital payment receipt",
      "One-click pharmacy re-order and lab test appointment links"
    ]
  },
  {
    id: "review-recall",
    stepNumber: "06",
    title: "Automated Review & Follow-up",
    tagline: "5-Star Google Reviews • Chronic Patient Recall",
    badge: "Reputation & Retention",
    metric: "+34%",
    metricLabel: "Repeat Consultation Increase",
    description: "Automated follow-up reminders and review prompts bring chronic patients back on time and steadily build your 5-star Google reputation.",
    points: [
      "Automated WhatsApp review prompts sent 2 hours after visit",
      "Chronic care recall engine for 30/60/90 day follow-up reviews",
      "1-tap Google Maps review link boosting local practice ranking"
    ]
  }
];

export interface PatientJourneyTimelineProps {
  className?: string;
}

export function PatientJourneyTimeline({ className = "" }: PatientJourneyTimelineProps) {
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Secondary interactive state for Stage 1 discovery channels
  const [selectedChannel, setSelectedChannel] = useState<number>(0);
  const [activeQrTab, setActiveQrTab] = useState<"day" | "night">("day");

  // Secondary state for Stage 6 chronic recall
  const [activeMonth, setActiveMonth] = useState<number>(3);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotation every 6s, pauses on hover, freezes on user manual interaction
  useEffect(() => {
    if (isPaused || hasInteracted) return;

    timerRef.current = setInterval(() => {
      setActiveStageIndex((prev) => (prev + 1) % JOURNEY_STAGES.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, hasInteracted]);

  const handleSelectStage = useCallback((index: number) => {
    setActiveStageIndex(index);
    setHasInteracted(true); // Freezes auto-rotation permanently so reading is never disrupted
    setIsPaused(true);
  }, []);

  const activeStage = JOURNEY_STAGES[activeStageIndex];

  // 4 Patient Discovery Channels for Stage 1
  const channels = [
    {
      id: "maps",
      title: "Google Maps",
      subtitle: "Local Search & Directions",
      icon: MapPin,
      badge: "24/7 Channel",
      accent: "text-blue-400 bg-blue-500/10 border-blue-500/30",
      patient: "Priya Sharma (2 km away)",
      action: "Tapped 'Book Live Token' directly from your Google Business profile",
      token: "#12",
      time: "10:15 AM Slot"
    },
    {
      id: "insta",
      title: "Instagram / Social",
      subtitle: "Link in Bio & Stories",
      icon: InstagramIcon,
      badge: "24/7 Channel",
      accent: "text-pink-400 bg-pink-500/10 border-pink-500/30",
      patient: "Rohan Mehta (Link in Bio)",
      action: "Reserved a confirmed slot after seeing clinic timing update",
      token: "#13",
      time: "10:30 AM Slot"
    },
    {
      id: "seo",
      title: "Google Search (SEO)",
      subtitle: "24/7 Clinic Website",
      icon: Search,
      badge: "24/7 Channel",
      accent: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      patient: "Ananya Roy (Night Search)",
      action: "Booked next morning OPD at 11:30 PM while clinic was closed",
      token: "#14",
      time: "10:45 AM Slot"
    },
    {
      id: "qr",
      title: "Walk-in Desk & Door QR",
      subtitle: "Open Desk & Night Poster",
      icon: QrCode,
      badge: "Zero Lobby Queue",
      accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      patient: activeQrTab === "day" ? "Vikram Patel (Front Desk QR)" : "Karan Verma (After-Hours Door QR)",
      action: activeQrTab === "day" ? "Scanned desk QR, received WhatsApp token #15 immediately" : "Scanned door QR at 10 PM to lock 9:30 AM morning token #1",
      token: activeQrTab === "day" ? "#15" : "#01",
      time: activeQrTab === "day" ? "11:00 AM Slot" : "Tomorrow 09:30 AM"
    }
  ];

  const currentChannel = channels[selectedChannel];

  return (
    <section
      className="py-20 lg:py-28 px-4 sm:px-6 bg-[#040D21] text-white relative overflow-hidden selection:bg-[#00B7A8]/30 selection:text-[#00B7A8]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!hasInteracted) setIsPaused(false);
      }}
      onFocus={() => setIsPaused(true)}
      onBlur={() => {
        if (!hasInteracted) setIsPaused(false);
      }}
    >
      {/* High-performance subtle ambient glow backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#00B7A8]/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[#00B7A8] font-bold text-xs uppercase tracking-widest bg-[#00B7A8]/10 px-4 py-1.5 rounded-full border border-[#00B7A8]/20 shadow-inner mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Feature • 6-Stage Autonomous Clinical Flow</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            No More <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">&ldquo;Doctor, Mera Number Kab Aayega?&rdquo;</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed mt-4">
            From initial WhatsApp booking to live queue tracking, paperless consultation, and automated 5-star follow-ups — every step runs smoothly on autopilot.
          </p>
        </div>

        {/* 6-Stage Clinical Cycle Tabs */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 max-w-5xl mx-auto px-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00B7A8]" /> The Complete 6-Stage Patient Experience
            </span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400">
                {hasInteracted ? "Manual Mode (Paused)" : isPaused ? "Paused on Hover" : "Auto-Pacing 6s"}
              </span>
            </div>
          </div>

          {/* 6 Stage Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 max-w-5xl mx-auto">
            {JOURNEY_STAGES.map((stage, idx) => {
              const isSelected = activeStageIndex === idx;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleSelectStage(idx)}
                  className={`relative p-3 rounded-xl border text-left transition-all duration-200 group flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isSelected
                      ? "bg-slate-800/90 border-[#00B7A8] shadow-[0_0_20px_rgba(0,183,168,0.25)] scale-[1.02] z-10"
                      : "bg-slate-900/50 border-white/5 hover:bg-slate-800/60 hover:border-white/15"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="journey-tab-active-indicator"
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00B7A8] to-cyan-400"
                    />
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-[#00B7A8] text-slate-950 font-bold" : "bg-white/10 text-slate-400"
                      }`}>
                        {stage.stepNumber}
                      </span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold truncate max-w-[70px]">
                        {stage.metric}
                      </span>
                    </div>
                    <h3 className={`font-bold text-xs sm:text-sm leading-snug line-clamp-1 ${isSelected ? "text-white" : "text-slate-300"}`}>
                      {stage.title}
                    </h3>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-slate-200">
                    <span className="truncate">{stage.badge}</span>
                    <ArrowRight className={`w-3 h-3 shrink-0 transition-transform ${isSelected ? "text-[#00B7A8] translate-x-0.5" : ""}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Interactive Stage Viewer (Zero CLS with fixed min-height container) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-8 lg:p-10 backdrop-blur-xl shadow-2xl relative mb-16 overflow-hidden min-h-[560px]">
          
          {/* Subtle grid background texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeStage.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              
              {/* Left Column: Stage Explanation & Operational Impact */}
              <div className="lg:col-span-6 flex flex-col justify-between h-full space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-[#00B7A8]/15 border border-[#00B7A8]/30 text-[#00B7A8] text-[11px] font-mono font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Stage {activeStage.stepNumber} • {activeStage.badge}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-slate-700">
                      Autonomous
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                    {activeStage.title}
                  </h3>
                  <p className="text-sm sm:text-base font-bold text-[#00B7A8] mb-4">
                    {activeStage.tagline}
                  </p>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium mb-6">
                    {activeStage.description}
                  </p>

                  {/* Bullet points */}
                  <div className="space-y-2.5 mb-6">
                    {activeStage.points.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Metric Callout Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block uppercase tracking-wider">
                      {activeStage.metricLabel}
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                      {activeStage.metric}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#00B7A8]/15 text-emerald-300 border border-[#00B7A8]/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#00B7A8]" /> Verified Metric
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Realistic Interactive Stage Artifact */}
              <div className="lg:col-span-6">
                
                {/* STAGE 1: Instant Booking + 4 Intake Channels */}
                {activeStage.id === "booking" && (
                  <div className="space-y-4">
                    {/* 4 Multi-Channel Intake Switcher */}
                    <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 shadow-xl">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Choose Intake Channel
                        </span>
                        {/* Day / Night QR Toggle (Fixed slot to avoid CLS) */}
                        <div className={`transition-opacity duration-200 ${currentChannel.id === "qr" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                          <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex items-center gap-1 text-[10px]">
                            <button
                              onClick={() => setActiveQrTab("day")}
                              className={`px-2 py-0.5 rounded font-bold transition-all ${
                                activeQrTab === "day" ? "bg-[#00B7A8] text-slate-950" : "text-slate-400"
                              }`}
                            >
                              <Sun className="w-3 h-3 inline mr-1" /> Open
                            </button>
                            <button
                              onClick={() => setActiveQrTab("night")}
                              className={`px-2 py-0.5 rounded font-bold transition-all ${
                                activeQrTab === "night" ? "bg-indigo-600 text-white" : "text-slate-400"
                              }`}
                            >
                              <Moon className="w-3 h-3 inline mr-1" /> Closed
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 4 Channel Chips */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        {channels.map((ch, cIdx) => {
                          const IconC = ch.icon;
                          const isChanActive = selectedChannel === cIdx;
                          return (
                            <button
                              key={ch.id}
                              onClick={() => setSelectedChannel(cIdx)}
                              className={`p-2.5 rounded-xl border text-left transition-all ${
                                isChanActive
                                  ? "bg-slate-800 border-[#00B7A8] text-white"
                                  : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              <IconC className={`w-4 h-4 mb-1 ${isChanActive ? "text-[#00B7A8]" : "text-slate-400"}`} />
                              <div className="text-[11px] font-bold truncate">{ch.title}</div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Channel Intake Card */}
                      <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-[#00B7A8]" />
                            {currentChannel.patient}
                          </span>
                          <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            Token {currentChannel.token}
                          </span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed mb-2">
                          &ldquo;{currentChannel.action}&rdquo;
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-800">
                          <span className="text-emerald-400 font-semibold">✓ Zero manual receptionist typing</span>
                          <span className="font-mono text-slate-300">{currentChannel.time}</span>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Mini Confirmation Snapshot */}
                    <div className="bg-[#0B141A] rounded-2xl p-4 border border-slate-800 shadow-xl font-sans text-slate-100 text-xs">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#00B7A8] flex items-center justify-center font-bold text-slate-950 text-xs">
                            AC
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">Aarogyam Clinic</div>
                            <div className="text-[10px] text-emerald-400">Official WhatsApp Business</div>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400">Just now</span>
                      </div>
                      <div className="bg-[#1F2C34] rounded-xl p-3 border border-white/5">
                        <p className="text-slate-200 text-xs mb-2">
                          Namaste! Your appointment with <strong className="text-white">Dr. Arvind Sharma</strong> is confirmed.
                        </p>
                        <div className="bg-[#111B21] p-2 rounded-lg border border-emerald-500/30 flex items-center justify-between font-mono">
                          <span className="text-emerald-400 font-bold">Confirmed Token: {currentChannel.token}</span>
                          <span className="text-slate-300 text-[11px]">{currentChannel.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 2: Smart Reminders */}
                {activeStage.id === "reminders" && (
                  <div className="w-full max-w-md mx-auto bg-[#0B141A] rounded-2xl p-4 border border-slate-800 shadow-2xl font-sans text-slate-100">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00B7A8] to-teal-700 flex items-center justify-center text-white font-black text-sm shadow">
                            AC
                          </div>
                          <svg className="w-3.5 h-3.5 absolute -bottom-0.5 -right-0.5 text-white" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" fill="#00B7A8" />
                            <path d="M5 8.2L6.8 10L11 5.8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-bold text-white text-sm block">Aarogyam Clinic</span>
                          <span className="text-[10px] text-emerald-400 font-medium">Automated 2-Hour Appointment Reminder</span>
                        </div>
                      </div>
                      <Bell className="w-4 h-4 text-emerald-400 animate-bounce" />
                    </div>

                    <div className="bg-[#182229] rounded-lg p-2 mb-3 text-center border border-amber-500/15 flex items-center justify-center gap-1.5 text-[10px] text-amber-200/80">
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Two-way verified clinical reminder • Sent at 8:45 AM</span>
                    </div>

                    <div className="bg-[#1F2C34] rounded-2xl p-4 text-xs border border-white/5 space-y-3">
                      <div className="border-b border-white/10 pb-2">
                        <span className="text-[11px] font-bold text-[#00B7A8] uppercase tracking-wider block">
                          Reminder: Today&apos;s OPD Visit
                        </span>
                        <p className="text-slate-300 text-xs mt-1">
                          Dear Ananya Roy, your consult with <strong className="text-white">Dr. Arvind Sharma</strong> is scheduled today at <strong className="text-white">10:45 AM (Token #14)</strong>.
                        </p>
                      </div>

                      <div className="bg-[#111B21] p-3 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Clinic Status:</span>
                          <span className="text-emerald-400 font-semibold">Running on Schedule</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Current Serving:</span>
                          <span className="font-mono text-white font-bold">Token #11 (Pediatrics Cabin 1)</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Clinic Location:</span>
                          <span className="text-cyan-300 font-medium">B-42, Sector 14, Ring Road</span>
                        </div>
                      </div>

                      {/* Interactive Buttons in WhatsApp */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 rounded-xl p-2 text-center text-emerald-300 font-bold cursor-pointer transition-colors text-xs flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Confirm Visit
                        </div>
                        <div className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl p-2 text-center text-slate-300 font-bold cursor-pointer transition-colors text-xs flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> Reschedule
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                        <span>08:45 AM</span>
                        <svg className="w-4 h-4 text-[#53BDEB]" viewBox="0 0 18 18" fill="none">
                          <path d="M3 9.5L6.5 13L15 4.5M6 9.5L9.5 13L18 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 3: Live Queue Tracking (Realistic WhatsApp Card) */}
                {activeStage.id === "live-queue" && (
                  <div className="w-full max-w-md mx-auto bg-[#0B141A] rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-2xl font-sans text-slate-100">
                    {/* WhatsApp Header Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00B7A8] to-teal-700 flex items-center justify-center text-white font-black text-sm shadow">
                            AC
                          </div>
                          <svg className="w-3.5 h-3.5 absolute -bottom-0.5 -right-0.5 text-white" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="8" r="7" fill="#00B7A8" />
                            <path d="M5 8.2L6.8 10L11 5.8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs sm:text-sm truncate max-w-[180px] block">
                            Aarogyam Clinic &amp; Child Care
                          </span>
                          <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                            Official WhatsApp Business Account
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">Live Bot</span>
                    </div>

                    {/* Encryption Disclaimer */}
                    <div className="bg-[#182229] rounded-lg p-2 mb-3 text-center border border-amber-500/15 flex items-center justify-center gap-1.5 text-[10px] text-amber-200/80">
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Messages are end-to-end encrypted. No one outside can read them.</span>
                    </div>

                    {/* Incoming Message Bubble */}
                    <div className="relative bg-[#1F2C34] rounded-2xl p-4 text-xs border border-white/5 shadow-md">
                      {/* Doctor Letterhead Header */}
                      <div className="border-b border-white/10 pb-2 mb-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-white">
                          <span className="tracking-wider uppercase text-[#00B7A8]">Aarogyam Clinic</span>
                          <span className="text-[10px] text-slate-400">Reg: DMC/14820</span>
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium">
                          Dr. Arvind Sharma • MBBS, MD (Pediatrics)
                        </p>
                      </div>

                      {/* Greeting */}
                      <p className="text-slate-200 font-medium mb-3">
                        Namaste <strong className="text-white font-bold">Ananya Roy</strong>! Your consultation is confirmed.
                      </p>

                      {/* High-Contrast Clinical Token Card */}
                      <div className="bg-[#111B21] border border-emerald-500/30 rounded-xl p-3 mb-3 shadow-inner">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                            Confirmed OPD Token
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live Queue
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between mb-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Your Token</span>
                            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                              #14
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">Slot Time</span>
                            <span className="text-xs sm:text-sm font-bold text-white font-mono">
                              10:45 AM Slot
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Doctor Status:</span>
                            <span className="font-semibold text-emerald-300">Consulting Now (On Schedule)</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Now In Cabin:</span>
                            <span className="font-mono font-bold text-white">Token #11</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span className="text-slate-400">Est. Wait Time:</span>
                            <span className="font-bold text-amber-300">12 mins</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Action Button Pill */}
                      <div className="bg-[#00B7A8]/15 hover:bg-[#00B7A8]/25 border border-[#00B7A8]/40 rounded-xl p-2.5 text-center transition-colors cursor-pointer group flex items-center justify-center gap-1.5 mb-2">
                        <ExternalLink className="w-3.5 h-3.5 text-[#00B7A8] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-emerald-300">
                          Tap for Live Queue &amp; Directions
                        </span>
                      </div>

                      {/* Message Meta: Timestamp + Double Read Receipt */}
                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                        <span>10:14 AM</span>
                        <svg className="w-4 h-4 text-[#53BDEB]" viewBox="0 0 18 18" fill="none">
                          <path d="M3 9.5L6.5 13L15 4.5M6 9.5L9.5 13L18 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 4: Zero-Friction Consult (Doctor Keeps Physical Rx Pad) */}
                {activeStage.id === "consult" && (
                  <div className="bg-slate-950/90 rounded-2xl p-5 border border-slate-800 shadow-2xl text-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="font-bold text-white text-sm">Physical Rx Pad Kept Intact</div>
                          <div className="text-[10px] text-slate-400">Zero screen barrier during consultation</div>
                        </div>
                      </div>
                      <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        Preserve Pen &amp; Paper
                      </span>
                    </div>

                    {/* Paper Rx Simulation Card */}
                    <div className="bg-[#FFFDF7] text-slate-900 p-4 rounded-xl shadow-inner border border-amber-200/60 font-serif">
                      <div className="border-b border-slate-300 pb-2 mb-2 flex justify-between items-baseline text-[11px]">
                        <div>
                          <strong className="font-bold text-slate-900 text-xs">Dr. Arvind Sharma</strong>
                          <span className="text-slate-600 block text-[10px]">MD (Pediatrics) • Reg DMC/14820</span>
                        </div>
                        <span className="text-slate-500 text-[10px] font-mono">Date: Today • Token #14</span>
                      </div>
                      <div className="text-[11px] mb-2 font-mono">
                        Pt: Ananya Roy (34F) • BP: 120/80 • Wt: 58kg
                      </div>
                      <div className="font-sans text-slate-800 space-y-1.5 text-[11px] italic bg-amber-50/50 p-2.5 rounded border border-amber-200/40">
                        <div>1. Tab Montair-LC (10mg) — 1 tab HS x 5 days</div>
                        <div>2. Nasivion Adult Spray — 2 puffs BD x 3 days</div>
                        <div>3. Steam Inhalation BD x 3 days</div>
                      </div>
                    </div>

                    {/* 5-Second Reception Photo Scan Process */}
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#00B7A8]/20 flex items-center justify-center text-[#00B7A8]">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-white font-bold block text-xs">5-Second Reception Camera Scan</span>
                          <span className="text-slate-400 text-[10px]">Indexed into encrypted patient timeline automatically</span>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-mono font-bold text-xs">Ready</span>
                    </div>
                  </div>
                )}

                {/* STAGE 5: Digital Rx & Bill on WhatsApp */}
                {activeStage.id === "digital-rx" && (
                  <div className="w-full max-w-md mx-auto bg-[#0B141A] rounded-2xl p-4 border border-slate-800 shadow-2xl font-sans text-slate-100 text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#00B7A8] flex items-center justify-center font-bold text-slate-950 text-xs">
                          AC
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs block">Aarogyam Clinic</span>
                          <span className="text-[10px] text-emerald-400">Prescription &amp; Invoice Dispatched</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">11:02 AM</span>
                    </div>

                    <div className="bg-[#1F2C34] rounded-2xl p-3.5 border border-white/5 space-y-3">
                      <p className="text-slate-200">
                        Namaste Ananya Roy! Here is your digital prescription and payment receipt from today&apos;s visit with <strong className="text-white">Dr. Arvind Sharma</strong>.
                      </p>

                      {/* PDF Attachment Card */}
                      <div className="bg-[#111B21] hover:bg-slate-900 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                            PDF
                          </div>
                          <div>
                            <span className="text-white font-bold block text-xs">Rx_Dr_Sharma_Token14.pdf</span>
                            <span className="text-slate-400 text-[10px]">184 KB • Official Digital Prescription</span>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-[#00B7A8]" />
                      </div>

                      {/* GST Invoice Breakdown */}
                      <div className="bg-[#111B21] rounded-xl p-3 border border-slate-800 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-400">
                          <span>Consultation Fee:</span>
                          <span className="font-mono text-white font-semibold">₹600</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Payment Mode:</span>
                          <span className="text-emerald-400 font-semibold">UPI (Paid at Desk)</span>
                        </div>
                        <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                          <span>Bill Status:</span>
                          <span className="text-emerald-300 font-bold">Receipt #AC-2026-8492</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                        <span>11:02 AM</span>
                        <svg className="w-4 h-4 text-[#53BDEB]" viewBox="0 0 18 18" fill="none">
                          <path d="M3 9.5L6.5 13L15 4.5M6 9.5L9.5 13L18 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* STAGE 6: Automated Review & Recall */}
                {activeStage.id === "review-recall" && (
                  <div className="w-full max-w-md mx-auto bg-[#0B141A] rounded-2xl p-4 border border-slate-800 shadow-2xl font-sans text-slate-100 text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
                          ★
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs block">Care Follow-up &amp; Review</span>
                          <span className="text-[10px] text-amber-400">Triggered 3 Hours Post-Visit</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">02:15 PM</span>
                    </div>

                    <div className="bg-[#1F2C34] rounded-2xl p-3.5 border border-white/5 space-y-3">
                      <p className="text-slate-200">
                        &ldquo;Hi Ananya! We hope you are feeling better. Dr. Arvind Sharma and the team at Aarogyam Clinic would love your feedback.&rdquo;
                      </p>

                      {/* 5-Star Rating Card */}
                      <div className="bg-[#111B21] border border-amber-500/30 rounded-xl p-3 text-center space-y-2">
                        <span className="text-[11px] font-bold text-amber-300 block">Rate Your Experience</span>
                        <div className="flex justify-center gap-2 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-5 h-5 fill-amber-400 cursor-pointer hover:scale-110 transition-transform" />
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Tap to post verified 5★ review directly on Google Maps
                        </span>
                      </div>

                      {/* Scheduled Chronic Recall Notice */}
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 text-purple-300">
                          <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                          <span>30-Day Follow-up Scheduled</span>
                        </div>
                        <span className="text-white font-mono font-bold">21 Oct</span>
                      </div>

                      <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                        <span>02:15 PM</span>
                        <svg className="w-4 h-4 text-[#53BDEB]" viewBox="0 0 18 18" fill="none">
                          <path d="M3 9.5L6.5 13L15 4.5M6 9.5L9.5 13L18 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </motion.div>
          </AnimatePresence>

        </div>

        {/* Enterprise Doctor Peace of Mind Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0A1A3B] border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#00B7A8]/10 rounded-full blur-[90px] pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center mb-10 relative z-10">
            <span className="text-[#00B7A8] font-extrabold text-xs uppercase tracking-widest bg-[#00B7A8]/10 px-4 py-1.5 rounded-full border border-[#00B7A8]/20 inline-block mb-3">
              ENTERPRISE PRACTICE PROTECTION • DESIGNED FOR DOCTORS
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              You dedicate your expertise to healing patients. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-400">
                We protect your time, schedule, and peace of mind.
              </span>
            </h3>
            <p className="text-slate-300 text-sm sm:text-base font-medium mt-3 leading-relaxed max-w-2xl mx-auto">
              No more cold meals, receptionist strain, or late-night OPD overruns. In 60–90 days, your practice transitions into a predictable, dignified clockwork system.
            </p>
          </div>

          {/* Before vs After (60-90 Days Transformation) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 relative z-10">
            
            {/* The Unmanaged Practice */}
            <div className="bg-slate-950/80 rounded-2xl p-6 border border-red-500/20 relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold flex items-center justify-center text-xs border border-red-500/30">
                  ✕
                </span>
                <h4 className="font-bold text-white text-base">Unmanaged Queue Friction</h4>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span>Meal schedules delayed to 4:30 PM due to unscheduled walk-in rushes overflowing waiting areas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span>Front desk overwhelmed by continuous patient inquiry calls regarding queue status.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold mt-0.5">•</span>
                  <span>Overcrowded waiting rooms creating patient anxiety and impacting clinical experience.</span>
                </li>
              </ul>
            </div>

            {/* The Enterprise Standard */}
            <div className="bg-slate-950/80 rounded-2xl p-6 border border-emerald-500/30 relative">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs border border-emerald-500/40">
                  ✓
                </span>
                <h4 className="font-bold text-white text-base">Enterprise Doctor Diary System</h4>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>Protected 1:30 PM lunch buffers &amp; predictable evening OPD closures on schedule.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>95%+ of patients track real-time queue tokens via automated WhatsApp updates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold mt-0.5">•</span>
                  <span>A calm, dignified waiting environment matching the premium tier of your medical practice.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* 3-Month Adoption Timeline Selector */}
          <div className="bg-slate-950/90 rounded-2xl p-6 border border-slate-800 relative z-10 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#00B7A8]" /> Enterprise Adoption Timeline
              </span>
              <div className="flex gap-2">
                {[1, 2, 3].map((m) => (
                  <button
                    key={m}
                    onClick={() => setActiveMonth(m)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeMonth === m
                        ? "bg-[#00B7A8] text-slate-950 font-black shadow-md"
                        : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    Month {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-xs sm:text-sm text-slate-200">
              {activeMonth === 1 && (
                <p className="leading-relaxed">
                  <strong className="text-[#00B7A8]">Month 1 (40% Adoption):</strong> Reception introduces digital QR tokens. Walk-in patients scan &amp; immediately appreciate real-time WhatsApp queue tracking.
                </p>
              )}
              {activeMonth === 2 && (
                <p className="leading-relaxed">
                  <strong className="text-[#00B7A8]">Month 2 (75% Adoption):</strong> Returning patients pre-check live queue status from home via Google Maps or WhatsApp before traveling. Waiting area density drops significantly.
                </p>
              )}
              {activeMonth === 3 && (
                <p className="leading-relaxed">
                  <strong className="text-[#00B7A8]">Month 3 (95%+ Frictionless System):</strong> Patients in your area rely on your automated token schedule. Your OPD operates with high efficiency, protected breaks, and total peace of mind.
                </p>
              )}
            </div>

            {/* Enterprise Trust & Faith Motto */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <span className="text-slate-300 font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-[#00B7A8] shrink-0" />
                &ldquo;Dedicated to your clinical excellence. Engineered to safeguard your practice&apos;s time &amp; dignity.&rdquo;
              </span>
              <span className="bg-[#00B7A8]/10 text-[#00B7A8] border border-[#00B7A8]/30 px-3 py-1 rounded-full font-bold text-xs shrink-0">
                Clinical Care First • Operational Trust Always
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default PatientJourneyTimeline;
