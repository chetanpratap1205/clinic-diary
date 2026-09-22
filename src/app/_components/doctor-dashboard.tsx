"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Clock,
  FileText,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Zap,
  Layout,
  ArrowUpRight,
  Send,
  Sparkles,
  Phone,
  ShieldCheck,
  Check,
  ChevronRight,
  RefreshCw,
  Plus,
  Play,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";

// Tab type definitions
type DashboardTab = "queue" | "analytics" | "rx" | "recall";

interface PatientToken {
  token: string;
  name: string;
  ageGender: string;
  type: string;
  time: string;
  eta: string;
  status: "in-cabin" | "next-up" | "waiting" | "completed";
}

export function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("queue");
  const [activeWorkflowIndex, setActiveWorkflowIndex] = useState<number>(1); // Defaults to "During Clinic"
  const [currentServingIndex, setCurrentServingIndex] = useState<number>(0); // Token progression
  const [rxDispatched, setRxDispatched] = useState<boolean>(false);
  const [activeRxTemplate, setActiveRxTemplate] = useState<string>("rhinitis");
  const [chartHoverIndex, setChartHoverIndex] = useState<number>(4); // Default to Day 30

  // 5 Step Workflow with mapped dashboard tabs for bidirectional sync
  const workflowSteps = [
    {
      stepIndex: 0,
      targetTab: "queue" as DashboardTab,
      time: "7:45 AM",
      title: "Morning Schedule Loaded",
      desc: "26 patients confirmed via automated WhatsApp. 3 slots rescheduled automatically, filling your entire calendar before you step into the clinic.",
      icon: Calendar,
      accentColor: "text-emerald-500",
      accentBg: "bg-emerald-500/10 border-emerald-500/20"
    },
    {
      stepIndex: 1,
      targetTab: "queue" as DashboardTab,
      time: "During Clinic",
      title: "No-Interruption Queue",
      desc: "Reception views the live board on their monitor. Patients wait in their cars or nearby cafes, knowing their exact wait time. Zero lobby chaos.",
      icon: Users,
      accentColor: "text-cyan-500",
      accentBg: "bg-cyan-500/10 border-cyan-500/20"
    },
    {
      stepIndex: 2,
      targetTab: "rx" as DashboardTab,
      time: "During Consult",
      title: "Keep Your Rx Pad",
      desc: "Tap once to see previous consult details, allergies, and Rx history. Write prescriptions by hand exactly as you do today — zero forced typing.",
      icon: FileText,
      accentColor: "text-purple-500",
      accentBg: "bg-purple-500/10 border-purple-500/20"
    },
    {
      stepIndex: 3,
      targetTab: "recall" as DashboardTab,
      time: "Post Consultation",
      title: "Auto-Scheduled Follow-ups",
      desc: "As soon as you finalize the visit, Doctor Diary queues up a personalized care message and follow-up trigger for that patient.",
      icon: Zap,
      accentColor: "text-amber-500",
      accentBg: "bg-amber-500/10 border-amber-500/20"
    },
    {
      stepIndex: 4,
      targetTab: "analytics" as DashboardTab,
      time: "End of Day",
      title: "Practice Insights Dashboard",
      desc: "Analyze no-shows prevented, patient feedback, and direct clinic growth metrics. Everything compiled automatically with 0% commissions.",
      icon: TrendingUp,
      accentColor: "text-teal-500",
      accentBg: "bg-teal-500/10 border-teal-500/20"
    }
  ];

  // Handler for clicking workflow step: switches tab and highlights step
  const handleWorkflowClick = (stepIndex: number, targetTab: DashboardTab) => {
    setActiveWorkflowIndex(stepIndex);
    setActiveTab(targetTab);
  };

  // Handler for clicking dashboard tab: updates active workflow step link
  const handleTabClick = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (tab === "queue") setActiveWorkflowIndex(1);
    else if (tab === "analytics") setActiveWorkflowIndex(4);
    else if (tab === "rx") setActiveWorkflowIndex(2);
    else if (tab === "recall") setActiveWorkflowIndex(3);
  };

  // Live Queue mock data
  const baseTokens: PatientToken[] = [
    {
      token: "#12",
      name: "Vikram Joshi",
      ageGender: "42M",
      type: "Follow-up",
      time: "10:15 AM",
      eta: "In Cabin",
      status: "in-cabin"
    },
    {
      token: "#13",
      name: "Priya Nair",
      ageGender: "28F",
      type: "Acute Cough",
      time: "10:30 AM",
      eta: "3 mins",
      status: "next-up"
    },
    {
      token: "#14",
      name: "Ananya Roy",
      ageGender: "34F",
      type: "Consultation",
      time: "10:45 AM",
      eta: "11 mins",
      status: "waiting"
    },
    {
      token: "#15",
      name: "Rohan Mehta",
      ageGender: "19M",
      type: "General Checkup",
      time: "11:00 AM",
      eta: "19 mins",
      status: "waiting"
    },
    {
      token: "#16",
      name: "Meera Kapoor",
      ageGender: "51F",
      type: "Hypertension Review",
      time: "11:15 AM",
      eta: "27 mins",
      status: "waiting"
    }
  ];

  // Dynamic tokens reflecting "Call Next" interaction
  const dynamicTokens: PatientToken[] = baseTokens.map((t, idx) => {
    if (idx < currentServingIndex) {
      return { ...t, status: "completed", eta: "Completed" };
    }
    if (idx === currentServingIndex) {
      return { ...t, status: "in-cabin", eta: "In Cabin" };
    }
    if (idx === currentServingIndex + 1) {
      return { ...t, status: "next-up", eta: "Next Up" };
    }
    return { ...t, status: "waiting" };
  });

  // Call Next Token handler
  const handleCallNextToken = () => {
    if (currentServingIndex < baseTokens.length - 1) {
      setCurrentServingIndex((prev) => prev + 1);
    } else {
      setCurrentServingIndex(0); // Loop back
    }
  };

  // Analytics Chart Data Points
  const analyticsData = [
    { day: "Day 1", x: 50, y: 160, consults: 18, revenue: "₹9,000", noShows: "18.5%" },
    { day: "Day 7", x: 170, y: 110, consults: 32, revenue: "₹16,000", noShows: "11.2%" },
    { day: "Day 14", x: 300, y: 85, consults: 44, revenue: "₹22,000", noShows: "5.8%" },
    { day: "Day 21", x: 430, y: 55, consults: 51, revenue: "₹25,500", noShows: "3.1%" },
    { day: "Day 30", x: 550, y: 35, consults: 58, revenue: "₹29,000", noShows: "2.1%" }
  ];

  const primaryCurvePath =
    "M 50 160 C 110 150, 130 115, 170 110 C 230 105, 260 90, 300 85 C 360 80, 390 60, 430 55 C 490 50, 520 40, 550 35";
  const primaryAreaFillPath = `${primaryCurvePath} L 550 190 L 50 190 Z`;
  const noShowDropCurve = "M 50 45 C 150 55, 220 120, 300 150 C 380 170, 470 178, 550 182";

  const activeDataPoint = analyticsData[chartHoverIndex] ?? analyticsData[4];

  // Rx templates
  const rxTemplates: Record<string, { title: string; medicines: string[] }> = {
    rhinitis: {
      title: "Allergic Rhinitis & Cough",
      medicines: [
        "Tab. Montelukast (10mg) + Levocetirizine (5mg) — 1-0-1 (5 Days, After Food)",
        "Fluticasone Furoate Nasal Spray 27.5mcg — 1 puff OD each nostril (14 Days)",
        "Steam Inhalation TDS with Karvol Plus (3 Days)"
      ]
    },
    bronchitis: {
      title: "Acute Bronchitis & Fever",
      medicines: [
        "Tab. Amoxicillin + Clavulanic Acid (625mg) — 1-0-1 (5 Days, Post Meal)",
        "Syp. Ambroxol + Levosalbutamol — 5ml TDS (5 Days)",
        "Tab. Paracetamol (650mg) — SOS if temp > 100°F"
      ]
    },
    diabetes: {
      title: "Type 2 Diabetes Review",
      medicines: [
        "Tab. Metformin HCl (500mg SR) — 1-0-1 (Before Breakfast & Dinner)",
        "Tab. Glimepiride (1mg) — 1-0-0 (Morning with first bite of meal)",
        "HbA1c & Fasting Lipid Profile scheduled in 60 Days"
      ]
    }
  };

  const currentTemplate = rxTemplates[activeRxTemplate] ?? rxTemplates.rhinitis;

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-50 border-t border-b border-slate-200 relative overflow-hidden font-sans">
      {/* Subtle ambient medical glow */}
      <div className="absolute top-1/2 right-0 w-[550px] h-[550px] bg-[#00B7A8]/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
            <Layout className="w-4 h-4" /> The Doctor&apos;s Workspace
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B132B] mb-4 tracking-tight">
            Behind the patient experience — a calmer clinic.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg font-medium leading-relaxed">
            Eliminate receptionist burnout, eliminate double-bookings, and track operations effortlessly. Experience your clinic&apos;s live backend dashboard.
          </p>
        </div>

        {/* 2-Column Dashboard & Workflow Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column (7 cols): High-Fidelity macOS/Browser Chrome Frame */}
          <div className="lg:col-span-7">
            <div className="relative w-full rounded-2xl sm:rounded-3xl bg-slate-950 border-4 sm:border-8 border-slate-800 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.35),0_0_50px_rgba(0,183,168,0.1)] overflow-hidden">
              
              {/* macOS Window Chrome Header */}
              <div className="bg-slate-900/95 px-3 sm:px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-2">
                {/* Traffic lights */}
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10" />
                  <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10" />
                </div>

                {/* Clinic Identifier / Address Pill */}
                <div className="h-6 px-3 bg-slate-950/80 border border-white/5 rounded-full flex items-center gap-2 max-w-[280px] sm:max-w-[340px] truncate text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] sm:text-[11px] font-mono font-medium truncate">
                    Aarogyam Clinic • Dr. Arvind Sharma
                  </span>
                </div>

                {/* Live OPD Status Pill */}
                <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-400 shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">OPD ACTIVE</span>
                  <span className="sm:hidden">LIVE</span>
                </div>
              </div>

              {/* 4 Interactive Dashboard Tabs Header */}
              <div className="bg-slate-900/60 px-3 sm:px-4 py-2 border-b border-slate-800/80 flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs font-semibold">
                <button
                  onClick={() => handleTabClick("queue")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "queue"
                      ? "bg-[#00B7A8] text-slate-950 font-bold shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Live Queue</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/40 text-current font-mono">
                    5
                  </span>
                </button>

                <button
                  onClick={() => handleTabClick("analytics")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "analytics"
                      ? "bg-[#00B7A8] text-slate-950 font-bold shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Daily Analytics</span>
                </button>

                <button
                  onClick={() => handleTabClick("rx")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "rx"
                      ? "bg-[#00B7A8] text-slate-950 font-bold shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Digital Rx</span>
                </button>

                <button
                  onClick={() => handleTabClick("recall")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === "recall"
                      ? "bg-[#00B7A8] text-slate-950 font-bold shadow-md"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Auto-Recall</span>
                </button>
              </div>

              {/* Workspace Content Area (Fixed min-height to guarantee zero CLS) */}
              <div className="p-4 sm:p-6 min-h-[460px] bg-slate-950/90 text-white">
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: Live Queue */}
                  {activeTab === "queue" && (
                    <motion.div
                      key="tab-queue"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Queue Action & Summary Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Registered</span>
                            <span className="font-mono font-bold text-white text-base">28</span>
                          </div>
                          <div className="w-px h-6 bg-slate-800" />
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Seen Today</span>
                            <span className="font-mono font-bold text-emerald-400 text-base">
                              {11 + currentServingIndex}
                            </span>
                          </div>
                          <div className="w-px h-6 bg-slate-800" />
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Waiting</span>
                            <span className="font-mono font-bold text-amber-400 text-base">
                              {Math.max(5 - currentServingIndex, 1)}
                            </span>
                          </div>
                        </div>

                        {/* Call Next Token Action Button */}
                        <button
                          onClick={handleCallNextToken}
                          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Call Next Token</span>
                        </button>
                      </div>

                      {/* Token List */}
                      <div className="space-y-2">
                        {dynamicTokens.map((item, idx) => {
                          const isInCabin = item.status === "in-cabin";
                          const isNextUp = item.status === "next-up";
                          const isCompleted = item.status === "completed";

                          return (
                            <div
                              key={item.token}
                              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                                isInCabin
                                  ? "bg-slate-900 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                                  : isNextUp
                                  ? "bg-slate-900/60 border-cyan-500/30"
                                  : isCompleted
                                  ? "bg-slate-950/60 border-slate-800/60 opacity-60"
                                  : "bg-slate-900/40 border-slate-800/80"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Token Chip */}
                                <div
                                  className={`w-12 h-10 rounded-lg flex flex-col items-center justify-center font-mono font-black border ${
                                    isInCabin
                                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                      : isNextUp
                                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                                      : isCompleted
                                      ? "bg-slate-800 text-slate-400 border-slate-700"
                                      : "bg-slate-900 text-slate-300 border-slate-800"
                                  }`}
                                >
                                  <span className="text-[8px] font-sans font-semibold uppercase text-slate-400">TKN</span>
                                  <span className="text-sm leading-none">{item.token}</span>
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-xs sm:text-sm">{item.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">({item.ageGender})</span>
                                  </div>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                    <span>{item.type}</span>
                                    <span>•</span>
                                    <span className="font-mono text-slate-300">{item.time}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Status Badge & ETA */}
                              <div className="text-right">
                                {isInCabin && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                    </span>
                                    <span>In Cabin</span>
                                  </span>
                                )}
                                {isNextUp && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                    <span>Next Up ({item.eta})</span>
                                  </span>
                                )}
                                {isCompleted && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span>Completed</span>
                                  </span>
                                )}
                                {!isInCabin && !isNextUp && !isCompleted && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    <Clock className="w-3 h-3 text-amber-400" />
                                    <span>Waiting ({item.eta})</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer Tip */}
                      <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized with Reception Display &amp; WhatsApp Bot
                        </span>
                        <span className="font-mono text-slate-500">Live Socket v2.4</span>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: Daily Analytics (Interactive SVG Bezier Curve) */}
                  {activeTab === "analytics" && (
                    <motion.div
                      key="tab-analytics"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Metric Stat Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400">Total Consults</span>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded flex items-center">
                              <ArrowUpRight className="w-2.5 h-2.5" /> +24%
                            </span>
                          </div>
                          <span className="text-lg sm:text-xl font-black font-mono text-white">842</span>
                        </div>

                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400">Monthly Revenue</span>
                            <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded">0% Cut</span>
                          </div>
                          <span className="text-lg sm:text-xl font-black font-mono text-emerald-400">₹3,36,800</span>
                        </div>

                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400">No-Show Drop</span>
                            <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1 rounded">-88%</span>
                          </div>
                          <span className="text-lg sm:text-xl font-black font-mono text-cyan-300">18% → 2.1%</span>
                        </div>

                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-400">Avg Wait Time</span>
                            <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1 rounded">-40 min</span>
                          </div>
                          <span className="text-lg sm:text-xl font-black font-mono text-white">7.5 mins</span>
                        </div>
                      </div>

                      {/* SVG Bezier Curve Canvas */}
                      <div className="relative w-full aspect-[600/230] min-h-[190px] bg-slate-900/40 rounded-xl p-2 border border-slate-800/80">
                        <svg viewBox="0 0 600 230" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id="chartEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00B7A8" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#00B7A8" stopOpacity="0.0" />
                            </linearGradient>

                            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3.5" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>

                          {/* Horizontal Grid lines */}
                          {[40, 90, 140, 190].map((yVal, i) => (
                            <g key={i}>
                              <line
                                x1="45"
                                y1={yVal}
                                x2="560"
                                y2={yVal}
                                stroke="#334155"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                                opacity="0.35"
                              />
                              <text x="35" y={yVal + 3} fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="end">
                                {100 - i * 25}
                              </text>
                            </g>
                          ))}

                          {/* Gradient Area Fill */}
                          <path d={primaryAreaFillPath} fill="url(#chartEmeraldGrad)" />

                          {/* Secondary Dashed No-Show Drop Curve */}
                          <path
                            d={noShowDropCurve}
                            fill="none"
                            stroke="#F43F5E"
                            strokeWidth="2"
                            strokeDasharray="5 4"
                            opacity="0.8"
                          />

                          {/* Primary Consult Volume Curve */}
                          <path
                            d={primaryCurvePath}
                            fill="none"
                            stroke="#00B7A8"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            filter="url(#glowEffect)"
                          />

                          {/* Vertical Guide Line */}
                          {activeDataPoint && (
                            <line
                              x1={activeDataPoint.x}
                              y1="25"
                              x2={activeDataPoint.x}
                              y2="190"
                              stroke="#00B7A8"
                              strokeWidth="1"
                              strokeDasharray="3 3"
                              opacity="0.75"
                            />
                          )}

                          {/* Interactive Data Nodes */}
                          {analyticsData.map((pt, idx) => {
                            const isHovered = chartHoverIndex === idx;
                            return (
                              <g
                                key={idx}
                                className="cursor-pointer"
                                onMouseEnter={() => setChartHoverIndex(idx)}
                                onClick={() => setChartHoverIndex(idx)}
                              >
                                <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                                {isHovered && (
                                  <circle cx={pt.x} cy={pt.y} r="8" fill="#00B7A8" opacity="0.35" className="animate-ping" />
                                )}

                                <circle
                                  cx={pt.x}
                                  cy={pt.y}
                                  r={isHovered ? "5.5" : "4"}
                                  fill={isHovered ? "#FFFFFF" : "#00B7A8"}
                                  stroke="#00B7A8"
                                  strokeWidth="2"
                                  className="transition-all duration-200"
                                />

                                <text
                                  x={pt.x}
                                  y="208"
                                  fill={isHovered ? "#FFFFFF" : "#94A3B8"}
                                  fontSize="9.5"
                                  fontWeight={isHovered ? "700" : "500"}
                                  textAnchor="middle"
                                >
                                  {pt.day}
                                </text>
                              </g>
                            );
                          })}

                          {/* Dynamic SVG Tooltip */}
                          {activeDataPoint && (
                            <g
                              transform={`translate(${Math.min(Math.max(activeDataPoint.x - 70, 45), 450)}, ${Math.max(
                                activeDataPoint.y - 65,
                                10
                              )})`}
                            >
                              <rect
                                width="140"
                                height="48"
                                rx="7"
                                fill="#0B132B"
                                stroke="#00B7A8"
                                strokeWidth="1.2"
                                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                              />
                              <text x="10" y="16" fill="#94A3B8" fontSize="9" fontWeight="600">
                                {activeDataPoint.day} • {activeDataPoint.consults} Consults
                              </text>
                              <text x="10" y="32" fill="#34D399" fontSize="11" fontWeight="800" fontFamily="monospace">
                                {activeDataPoint.revenue}
                              </text>
                              <text x="75" y="32" fill="#F43F5E" fontSize="9.5" fontWeight="700">
                                No-Show: {activeDataPoint.noShows}
                              </text>
                            </g>
                          )}
                        </svg>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-1 bg-[#00B7A8] rounded-full" />
                            <span className="font-semibold text-slate-300">OPD Patient Consults</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 border-b border-dashed border-[#F43F5E]" />
                            <span className="font-semibold text-slate-300">No-Show Rate (%)</span>
                          </div>
                        </div>
                        <span className="font-mono text-emerald-400">Zero Commission Retained</span>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 3: Digital Rx */}
                  {activeTab === "rx" && (
                    <motion.div
                      key="tab-rx"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Patient Context Banner */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-white text-sm">Ananya Roy (34F)</span>
                          <span className="text-slate-400 text-[11px] block">Token #14 • Complaint: Allergic Rhinitis</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                            DMC Reg: 14820
                          </span>
                        </div>
                      </div>

                      {/* 1-Click Template Selector */}
                      <div className="flex items-center gap-2 overflow-x-auto text-[11px]">
                        <span className="text-slate-400 font-bold shrink-0">1-Click Presets:</span>
                        <button
                          onClick={() => setActiveRxTemplate("rhinitis")}
                          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            activeRxTemplate === "rhinitis"
                              ? "bg-slate-800 border-[#00B7A8] text-white font-bold"
                              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          Allergic Rhinitis
                        </button>
                        <button
                          onClick={() => setActiveRxTemplate("bronchitis")}
                          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            activeRxTemplate === "bronchitis"
                              ? "bg-slate-800 border-[#00B7A8] text-white font-bold"
                              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          Acute Bronchitis
                        </button>
                        <button
                          onClick={() => setActiveRxTemplate("diabetes")}
                          className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            activeRxTemplate === "diabetes"
                              ? "bg-slate-800 border-[#00B7A8] text-white font-bold"
                              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          Type 2 Diabetes
                        </button>
                      </div>

                      {/* Prescribed Items Card */}
                      <div className="bg-slate-900/60 rounded-xl p-3.5 border border-slate-800 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[11px]">
                          <span className="font-bold text-emerald-400 uppercase tracking-wider">
                            Active Prescriptions ({currentTemplate.title})
                          </span>
                          <span className="text-slate-400 text-[10px]">Or keep paper pad with 5s photo scan</span>
                        </div>

                        <div className="space-y-2">
                          {currentTemplate.medicines.map((med, mIdx) => (
                            <div
                              key={mIdx}
                              className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-start gap-2"
                            >
                              <span className="text-emerald-400 font-bold font-mono mt-0.5">{mIdx + 1}.</span>
                              <span className="text-slate-200 font-medium leading-relaxed">{med}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* WhatsApp Dispatch Action */}
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                        <div className="text-xs">
                          <span className="font-bold text-white block">WhatsApp PDF Dispatch</span>
                          <span className="text-slate-400 text-[10px]">
                            {rxDispatched
                              ? "✓ Dispatched to Ananya Roy (+91 98765 43210)"
                              : "Delivers branded PDF with dosage & invoice before patient exits"}
                          </span>
                        </div>

                        <button
                          onClick={() => setRxDispatched(!rxDispatched)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            rxDispatched
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-[#00B7A8] hover:bg-teal-400 text-slate-950 shadow-md"
                          }`}
                        >
                          {rxDispatched ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Dispatched</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Send via WhatsApp</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 4: Auto-Recall */}
                  {activeTab === "recall" && (
                    <motion.div
                      key="tab-recall"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
                        <div>
                          <span className="font-bold text-white block">Automated Patient Recall Engine</span>
                          <span className="text-slate-400 text-[10px]">Chronic condition care nudges sent via WhatsApp</span>
                        </div>
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold text-[10px]">
                          +34% Retention
                        </span>
                      </div>

                      {/* Recall Queue Table */}
                      <div className="space-y-2 text-xs">
                        {[
                          {
                            name: "Suresh Gupta",
                            condition: "HbA1c & Fasting Glucose Review",
                            due: "Today",
                            status: "Sent • Confirmed",
                            statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          },
                          {
                            name: "Sunita Sen",
                            condition: "Hypertension BP Titration",
                            due: "In 2 Days",
                            status: "Scheduled",
                            statusColor: "text-cyan-300 bg-cyan-500/10 border-cyan-500/20"
                          },
                          {
                            name: "Rajesh Kumar",
                            condition: "Post-Op Cardiology Follow-up",
                            due: "In 5 Days",
                            status: "Scheduled",
                            statusColor: "text-amber-300 bg-amber-500/10 border-amber-500/20"
                          },
                          {
                            name: "Meera Kapoor",
                            condition: "Thyroid TSH Level Retest",
                            due: "In 7 Days",
                            status: "Pending Auto-Trigger",
                            statusColor: "text-slate-300 bg-slate-800 border-slate-700"
                          }
                        ].map((rc, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-white text-xs sm:text-sm block">{rc.name}</span>
                              <span className="text-slate-400 text-[11px]">{rc.condition}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block font-mono">Due: {rc.due}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-0.5 ${rc.statusColor}`}>
                                {rc.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00B7A8]" />
                          Complies with Medical Council recall guidelines
                        </span>
                        <span className="text-emerald-400 font-mono font-bold">Zero Staff Labor</span>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Right Column (5 cols): Bidirectional Synchronized 5-Step Daily Workflow */}
          <div className="lg:col-span-5 space-y-3">
            <div className="mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#00B7A8] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Interactive Daily Clinic Rhythm
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any step to inspect the corresponding live dashboard screen:
              </p>
            </div>

            {workflowSteps.map((step) => {
              const IconComponent = step.icon;
              const isActive = activeWorkflowIndex === step.stepIndex;

              return (
                <div
                  key={step.stepIndex}
                  onClick={() => handleWorkflowClick(step.stepIndex, step.targetTab)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex gap-3.5 items-start ${
                    isActive
                      ? "bg-white border-[#00B7A8] shadow-lg shadow-emerald-500/10 scale-[1.02] ring-1 ring-[#00B7A8]"
                      : "bg-white/70 hover:bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isActive
                        ? "bg-[#00B7A8] text-slate-950 font-bold border-[#00B7A8]"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-[#00B7A8] uppercase tracking-wider font-mono">
                        {step.time}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active View
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-[#0B132B] mb-1 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform mt-2 ${
                      isActive ? "text-[#00B7A8] translate-x-1" : "text-slate-400"
                    }`}
                  />
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}

export default DoctorDashboard;
