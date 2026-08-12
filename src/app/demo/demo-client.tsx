"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Star,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Sparkles,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Brain,
  Stethoscope,
  HeartPulse,
  Eye,
  Smile,
  Users,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Smartphone
} from "lucide-react";

// Compact, sleek timeline chapters for 2-min demo
const CHAPTERS = [
  { time: 0, timestampText: "0:00", label: "🔥 No-Show Shield" },
  { time: 25, timestampText: "0:25", label: "⚡ WhatsApp Booking" },
  { time: 55, timestampText: "0:55", label: "🤖 10-Sec AI Rx" },
  { time: 85, timestampText: "1:25", label: "⭐ Google Reviews" },
  { time: 110, timestampText: "1:50", label: "🚀 Smart Growth" },
];

// Universal Specialties - Clean and simple for all doctors
const SPECIALTIES = [
  { id: "all", name: "All Specialties & Polyclinics", icon: Stethoscope },
  { id: "psychiatry", name: "Psychiatry & Mental Health", icon: Brain },
  { id: "dental", name: "Dentistry & Orthodontics", icon: Smile },
  { id: "dermatology", name: "Dermatology & Aesthetics", icon: Sparkles },
  { id: "pediatrics", name: "Pediatrics & Child Care", icon: Users },
  { id: "general", name: "General OPD & Internal Med", icon: Activity },
  { id: "cardio_neuro", name: "Cardiology & Neurology", icon: HeartPulse },
  { id: "eye_ent", name: "Ophthalmology & ENT", icon: Eye },
];

// Comparison: Old Software / Manual vs Doctor Diary
const COMPARISONS = [
  {
    painPoint: "Patient No-Shows",
    oldWay: "20-30% missed appointments causing massive monthly revenue loss",
    newWay: "85% reduction in no-shows via automated 2-way WhatsApp reminders",
  },
  {
    painPoint: "Patient Booking Friction",
    oldWay: "Forcing patients to download bulky apps or make phone calls during OPD hours",
    newWay: "Zero app download — patients book in 3 taps natively inside WhatsApp",
  },
  {
    painPoint: "Prescription Writing Speed",
    oldWay: "Handwriting paper slips or slow desktop entry taking 4-5 mins per patient",
    newWay: "10-second voice & tap Rx on smartphone, iPad, or any laptop browser",
  },
  {
    painPoint: "Google Clinic Reputation",
    oldWay: "Satisfied patients leave without reviewing; negative reviews hurt clinic ranking",
    newWay: "Automated post-visit WhatsApp review requests magnetizing 5-star Google ratings",
  },
  {
    painPoint: "Local Clinic Growth",
    oldWay: "Relying purely on word-of-mouth or expensive agency ads",
    newWay: "Organic growth engine — turn every happy consultation into local 5-star search dominance",
  },
];

// FAQ Data
const FAQS = [
  {
    q: "Is Doctor Diary built for my specific domain (Psychiatry, Dental, Skin, General OPD, etc.)?",
    a: "Yes, 100%! Doctor Diary is built universally for all medical and healthcare practices. Whether you manage confidential therapy sessions, dental procedures, pediatric vaccinations, skin treatments, or general consultations, the platform adapts seamlessly to your workflow.",
  },
  {
    q: "Why is the video muted by default?",
    a: "All modern web browsers (Chrome, Safari, Edge) automatically mute videos on page load to comply with autoplay privacy policies. Tap the floating '🔊 Click to Enable Sound' button on the video to turn on audio instantly!",
  },
  {
    q: "How fast is setup in my clinic?",
    a: "Under 5 minutes with zero software installation. Doctor Diary runs instantly on your existing mobile phone, tablet, or PC.",
  },
  {
    q: "How does Doctor Diary help my clinic grow organically?",
    a: "Doctor Diary automatically sends polite post-consultation WhatsApp messages to your satisfied patients, prompting them to leave 5-star Google reviews. This boosts your local search ranking and brings in a steady stream of new patients.",
  },
];

export function DemoPageClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // State
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const cur = video.currentTime;
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        if (cur >= CHAPTERS[i].time - 1) {
          setActiveChapter(i);
          break;
        }
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const jumpToChapter = (timeInSec: number, index: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = timeInSec;
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
    video.play().catch(() => {});
    setIsPlaying(true);
    setActiveChapter(index);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white py-2 px-4 text-center text-xs sm:text-sm font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
        <span>
          <strong className="text-teal-300">Smart Clinic Automation:</strong> For All Specialties • Instant 5-Min Setup • No App Download Required
        </span>
      </div>

      {/* Clean White Navigation Header */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-slate-900 shadow-sm flex items-center justify-center shrink-0 border border-slate-800">
              <Image
                src="/icon-192.png"
                alt="Doctor Diary Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-lg sm:text-xl leading-none tracking-tight group-hover:text-teal-600 transition-colors">
                  Doctor Diary
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                  2-Min Product Demo
                </span>
              </div>
              <span className="font-semibold text-teal-600 text-[9px] sm:text-[10px] uppercase tracking-widest leading-none mt-1">
                For All Medical Specialties
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 gap-2 text-xs sm:text-sm font-bold hidden md:inline-flex rounded-xl">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-[#00B7A8] hover:bg-[#00998c] text-white font-black px-4 sm:px-6 h-10 sm:h-11 rounded-xl text-xs sm:text-sm shadow-md shadow-teal-500/20 transition-all hover:scale-105">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col items-center">
        
        {/* Irresistible Magnetic Hero Title */}
        <div className="text-center max-w-4xl mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-teal-50 via-emerald-50 to-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
            </span>
            🎬 2-Minute Interactive Demo
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15]">
            See How Independent Doctors Save 2+ Hours Daily & <span className="text-[#00B7A8]">Eliminate Patient No-Shows</span>
          </h1>
          
          <p className="text-slate-600 text-sm sm:text-lg mt-3 max-w-3xl mx-auto font-medium leading-relaxed">
            Press play below to watch the 2-minute walkthrough. Scroll down to see how WhatsApp scheduling, voice Rx & Google reviews work for your specialty!
          </p>
        </div>

        {/* PROMINENT VIDEO PLAYER (ABOVE THE FOLD) */}
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mb-4 relative group">
          
          {/* Floating Sound Banner Overlay */}
          {isMuted && (
            <button
              onClick={toggleMute}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm shadow-xl backdrop-blur-md flex items-center gap-2 transition-all transform hover:scale-105 border border-teal-200 animate-bounce"
            >
              <VolumeX className="w-4 h-4 text-slate-950 animate-pulse" />
              <span>🔊 Video is Muted — Click to Enable Sound!</span>
            </button>
          )}

          {/* Video Container */}
          <div className="relative aspect-video w-full bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              muted={isMuted}
              playsInline
              preload="metadata"
              onClick={togglePlay}
              className="w-full h-full object-contain cursor-pointer"
            >
              <source src="/demo_video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Custom Overlay Controls */}
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 flex flex-col gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
              {/* Progress bar */}
              <div
                className="w-full bg-white/20 hover:bg-white/30 h-2 rounded-full cursor-pointer overflow-hidden transition-all"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  if (videoRef.current && duration) {
                    videoRef.current.currentTime = pos * duration;
                  }
                }}
              >
                <div
                  className="bg-teal-400 h-full transition-all duration-100"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 text-white hover:text-teal-400 transition-colors rounded-lg hover:bg-white/10"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1.5 text-white hover:text-teal-400 transition-colors rounded-lg hover:bg-white/10 flex items-center gap-1 text-xs font-bold"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-5 h-5 text-amber-400" />
                        <span className="text-amber-300 font-semibold text-[11px] hidden sm:inline">Unmute Sound</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold text-[11px] hidden sm:inline">Sound On</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs text-slate-300 font-mono">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, "0")} /{" "}
                    {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 text-white hover:text-teal-400 transition-colors rounded-lg hover:bg-white/10"
                  aria-label="Fullscreen"
                >
                  <Maximize className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sleek, Compact Chapter Timestamps Bar */}
        <div className="w-full max-w-4xl mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Quick Jump:</span>
            {CHAPTERS.map((ch, idx) => {
              const isActive = activeChapter === idx;
              return (
                <button
                  key={idx}
                  onClick={() => jumpToChapter(ch.time, idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-teal-600 text-white shadow-sm scale-105"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-80">{ch.timestampText}</span>
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Doctor Pain Points & "Why Doctor Diary Beats Old Software" */}
        <section className="w-full max-w-4xl mb-10 sm:mb-14">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
              The Clear Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Why Doctors Are Switching to Doctor Diary
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Compare traditional clinic methods vs. Doctor Diary's 24/7 automated platform:
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md">
            <div className="grid grid-cols-1 divide-y divide-slate-100">
              {COMPARISONS.map((comp, idx) => (
                <div key={idx} className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center hover:bg-slate-50/50 transition-colors">
                  <div className="md:col-span-3">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-teal-600 shrink-0" />
                      {comp.painPoint}
                    </span>
                  </div>
                  <div className="md:col-span-4 bg-red-50/60 border border-red-100 rounded-xl p-3 text-xs text-red-900 flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[10px] font-extrabold uppercase text-red-700">Old / Manual Way</strong>
                      <span>{comp.oldWay}</span>
                    </div>
                  </div>
                  <div className="md:col-span-5 bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-[10px] font-extrabold uppercase text-emerald-800">The Doctor Diary Way</strong>
                      <span className="font-medium">{comp.newWay}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Universal Specialty Support */}
        <section className="w-full max-w-4xl mb-10 sm:mb-14 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-xl sm:text-3xl font-black text-slate-900">
              Built Universally for All Medical Specialties
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Whether you run a single-doctor practice, therapy sessions, or a multi-specialty center:
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SPECIALTIES.map((sp) => {
              const Icon = sp.icon;
              return (
                <div
                  key={sp.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center text-center gap-2 hover:border-teal-400 hover:bg-teal-50/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-teal-600 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-xs text-slate-800">{sp.name}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Doctor FAQ Accordion */}
        <section className="w-full max-w-4xl mb-10 sm:mb-14">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-teal-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-teal-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Clean White & Teal Call-To-Action Block */}
        <div className="w-full max-w-4xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Join Verified Doctors in India
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
            Transform Your Clinic Experience Today
          </h2>

          <p className="text-slate-300 text-xs sm:text-base max-w-xl mx-auto mb-6 leading-relaxed">
            Eliminate patient no-shows, write prescriptions 5x faster, and build 5-star Google ratings on autopilot.
          </p>

          <div className="flex items-center justify-center max-w-xs mx-auto">
            <Link href="/signup" className="w-full">
              <Button size="lg" className="w-full bg-[#00B7A8] hover:bg-[#00998c] text-white font-black h-12 px-6 rounded-xl flex items-center justify-center gap-2 text-sm shadow-xl transition-all hover:scale-105">
                <Star className="w-4 h-4 fill-current" />
                Get Started Free
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-5 text-[11px] text-slate-400 flex items-center justify-center gap-3">
            <span>✓ Instant 5-Min Setup</span>
            <span>•</span>
            <span>✓ No App Download</span>
            <span>•</span>
            <span>✓ ABDM & 256-Bit Encrypted</span>
          </div>
        </div>

      </main>

      {/* Responsive Sticky Bottom CTA for Mobile */}
      <div className="sm:hidden sticky bottom-0 inset-x-0 z-40 bg-white/95 border-t border-slate-200 backdrop-blur-xl p-3 flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] text-teal-600 font-extrabold uppercase">Doctor Diary</span>
          <span className="text-xs font-bold text-slate-900">Zero No-Shows Guaranteed</span>
        </div>
        <Link href="/signup" className="flex-1">
          <Button className="w-full bg-[#00B7A8] hover:bg-[#00998c] text-white font-black text-xs h-10 rounded-xl shadow-md flex items-center justify-center gap-1">
            Get Started Free <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Clean Footer */}
      <footer className="w-full border-t border-slate-200/80 py-6 text-center text-xs text-slate-500 bg-white">
        © {new Date().getFullYear()} Doctor Diary by NatureXpress. All rights reserved. ABDM & 256-bit Security Compliant.
      </footer>
    </div>
  );
}
