"use client";

import { useState, useEffect } from "react";
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
  Heart,
  Zap,
  ShieldCheck
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

export function PatientJourneyTimeline() {
  const [selectedChannel, setSelectedChannel] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"day" | "night">("day");
  const [activeMonth, setActiveMonth] = useState<number>(3); // 1, 2, or 3 months

  // 4 Patient Discovery & Entry Channels
  const channels = [
    {
      id: "maps",
      title: "Google Maps",
      subtitle: "Local Search & Directions",
      icon: MapPin,
      color: "from-blue-500 to-emerald-400",
      accentBg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      iconBg: "bg-blue-500/20 text-blue-400",
      patient: {
        name: "Priya Sharma",
        location: "Found on Google Maps (2 km away)",
        action: "Clicked 'Book Live Token' on your Google Profile",
        token: "#12",
        time: "10:15 AM Slot",
        avatar: "👩‍💼"
      },
      desc: "Patients searching 'Cardiologist near me' or opening your Google Maps listing tap 'Book Token' directly without opening any app."
    },
    {
      id: "insta",
      title: "Instagram & Social",
      subtitle: "Link in Bio & Stories",
      icon: InstagramIcon,
      color: "from-pink-500 via-purple-500 to-amber-400",
      accentBg: "bg-pink-500/10 border-pink-500/30 text-pink-400",
      iconBg: "bg-pink-500/20 text-pink-400",
      patient: {
        name: "Rohan Mehta",
        location: "Via Instagram Link in Bio",
        action: "Reserved token from story post in 1 tap",
        token: "#13",
        time: "10:30 AM Slot",
        avatar: "👨‍💻"
      },
      desc: "Followers or patients coming from your social posts click the link in bio to check live queue status & reserve a confirmed slot instantly."
    },
    {
      id: "seo",
      title: "Google Search (SEO)",
      subtitle: "24/7 Web Discovery",
      icon: Search,
      color: "from-amber-400 to-orange-500",
      accentBg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      iconBg: "bg-amber-500/20 text-amber-400",
      patient: {
        name: "Ananya Roy",
        location: "Searched website at 11:30 PM",
        action: "Booked tomorrow's morning OPD slot late at night",
        token: "#14",
        time: "10:45 AM Slot",
        avatar: "👩‍⚕️"
      },
      desc: "When patients search late at night with health anxiety, your website books them into your schedule automatically — even while you sleep."
    },
    {
      id: "qr",
      title: "Walk-in QR Code",
      subtitle: "Open Desk & After-Hours Door QR",
      icon: QrCode,
      color: "from-emerald-400 to-teal-500",
      accentBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      iconBg: "bg-emerald-500/20 text-emerald-400",
      patient: {
        name: "Vikram Patel",
        location: activeTab === "day" ? "Scanned Front Desk QR" : "Scanned Night Door QR at 10 PM",
        action: activeTab === "day" ? "Got instant WhatsApp token #15" : "Locked tomorrow's morning #1 token while clinic is closed",
        token: "#15",
        time: activeTab === "day" ? "11:00 AM Slot" : "Tomorrow 09:30 AM",
        avatar: "👨‍💼"
      },
      desc: activeTab === "day" 
        ? "Walk-in patients scan your desk QR code, get a digital token on WhatsApp, and wait comfortably nearby without receptionist arguments."
        : "When your clinic is closed at night, patients scan the QR poster on your door/shutter to book tomorrow's morning slots automatically."
    }
  ];

  // Auto rotate selected channel every 5s if user hasn't manually clicked recently
  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedChannel((prev) => (prev + 1) % channels.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [channels.length]);

  const currentChannel = channels[selectedChannel];

  return (
    <section className="py-20 lg:py-28 px-4 sm:px-6 bg-[#040D21] text-white relative overflow-hidden selection:bg-[#00B7A8]/30 selection:text-[#00B7A8]">
      {/* High performance subtle ambient glow backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#00B7A8]/10 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[#00B7A8] font-bold text-xs uppercase tracking-widest bg-[#00B7A8]/10 px-4 py-1.5 rounded-full border border-[#00B7A8]/20 shadow-inner mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Feature • 24/7 Patient Acquisition & Queue Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            No More <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">"Doctor, Mera Number Kab Aayega?"</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg font-medium leading-relaxed mt-4">
            Offline walk-ins & 24/7 online channels flow into one smart queue — automatically matching your doctor consulting schedule & break times.
          </p>
        </div>

        {/* 4-Channel Traffic Hub Showcase */}
        <div className="mb-16">
          <div className="text-center mb-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              4 Channels • 1 Unified Smart Queue System
            </span>
          </div>

          {/* Channels Selector Tabs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
            {channels.map((ch, idx) => {
              const IconComp = ch.icon;
              const isSelected = selectedChannel === idx;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(idx)}
                  className={`
                    relative p-4 rounded-2xl border text-left transition-all duration-300 group flex flex-col justify-between overflow-hidden
                    ${isSelected 
                      ? "bg-white/10 border-[#00B7A8] shadow-[0_0_25px_rgba(0,183,168,0.2)] scale-[1.02] z-10" 
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    }
                  `}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="channel-tab-active"
                      className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00B7A8] to-cyan-400"
                    />
                  )}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ch.iconBg} font-bold`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${ch.accentBg}`}>
                        24/7 Channel
                      </span>
                    </div>
                    <h3 className={`font-bold text-sm sm:text-base mb-1 ${isSelected ? "text-white" : "text-slate-300"}`}>
                      {ch.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-1">
                      {ch.subtitle}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-semibold group-hover:text-white transition-colors">
                    <span>See Flow</span>
                    <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? "translate-x-1 text-[#00B7A8]" : ""}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Storyteller Box: Incoming Channel -> Unified Queue -> Doctor Schedule */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 backdrop-blur-xl shadow-2xl relative mb-16 overflow-hidden">
          
          {/* Subtle grid lines background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Walk-in QR Day / Night toggle if QR channel is active */}
          {currentChannel.id === "qr" && (
            <div className="flex justify-end mb-4 relative z-20">
              <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
                <button
                  onClick={() => setActiveTab("day")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "day"
                      ? "bg-[#00B7A8] text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Clinic Open (Desk QR)</span>
                </button>
                <button
                  onClick={() => setActiveTab("night")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "night"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Clinic Closed (Door QR)</span>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Box: Incoming Patient Entry */}
            <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentChannel.patient.avatar}</span>
                    <div>
                      <h4 className="font-bold text-white text-base sm:text-lg">
                        {currentChannel.patient.name}
                      </h4>
                      <span className="text-xs text-[#00B7A8] font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {currentChannel.patient.location}
                      </span>
                    </div>
                  </div>
                  <span className="bg-[#00B7A8]/20 text-[#00B7A8] border border-[#00B7A8]/40 font-black text-xs px-3 py-1 rounded-full">
                    Token {currentChannel.patient.token}
                  </span>
                </div>

                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-4">
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    "{currentChannel.patient.action}"
                  </p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  {currentChannel.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> Auto-allocated Slot
                </span>
                <span className="text-white bg-slate-800 px-2.5 py-1 rounded-md">
                  {currentChannel.patient.time}
                </span>
              </div>
            </div>

            {/* Middle Connecting Arrow / Engine Icon */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center gap-2 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-[#00B7A8]/20 border border-[#00B7A8]/40 flex items-center justify-center text-[#00B7A8] shadow-[0_0_20px_rgba(0,183,168,0.3)] animate-pulse">
                <ArrowRight className="w-6 h-6 rotate-90 lg:rotate-0" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                Doctor Schedule Engine
              </span>
            </div>

            {/* Right Box: Doctor's Protected Schedule & WhatsApp Token */}
            <div className="lg:col-span-5 bg-slate-950/90 rounded-2xl p-6 border border-slate-800 shadow-xl">
              
              {/* Doctor Schedule Visual */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#00B7A8]" /> Doctor's Master Schedule
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Protected OPD
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300 font-semibold">Morning OPD (10:00 AM - 1:30 PM)</span>
                    <span className="text-emerald-400 font-bold text-[11px]">Filling Smoothly</span>
                  </div>

                  {/* Protected Lunch Buffer - Key Indian Doctor Request */}
                  <div className="flex items-center justify-between text-xs bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/30 text-amber-300">
                    <span className="font-bold flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5" /> 1:30 PM - 2:30 PM: Lunch Break
                    </span>
                    <span className="font-black text-[10px] uppercase bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded text-amber-400">
                      0 Queue Overflow
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-300 font-semibold">Evening OPD (5:00 PM - 8:30 PM)</span>
                    <span className="text-cyan-400 font-bold text-[11px]">Protected Pacing</span>
                  </div>
                </div>
              </div>

              {/* Simulated Live WhatsApp Confirmation */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 relative overflow-hidden">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs shadow">
                    <MessageCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-emerald-400">
                    Automated WhatsApp Message Sent
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-medium leading-relaxed">
                  "Namaste {currentChannel.patient.name}! Your token <strong className="text-emerald-300 bg-emerald-900/60 px-1 rounded">{currentChannel.patient.token}</strong> is confirmed for {currentChannel.patient.time}. Current serving #10. Estimated turn at {currentChannel.patient.time}."
                </p>
              </div>

            </div>

          </div>
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
                No more cold, delayed meals, receptionist strain, or late-night OPD overruns. In 60–90 days, your practice transitions into a seamless, predictable clockwork system.
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
                    <span>Front desk desk overwhelmed by continuous patient inquiry calls regarding queue status.</span>
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
                    <span>Protected 1:30 PM lunch buffers & predictable evening OPD closures on schedule.</span>
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
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeMonth === m
                          ? "bg-[#00B7A8] text-white shadow-md"
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
                    <strong className="text-[#00B7A8]">Month 1 (40% Adoption):</strong> Reception introduces digital QR tokens. Walk-in patients scan & immediately appreciate real-time WhatsApp queue tracking.
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
                  "Dedicated to your clinical excellence. Engineered to safeguard your practice's time & dignity."
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
