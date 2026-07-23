"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Star, CheckCircle, MessageSquare, Zap, Smartphone, Shield, Lock } from "lucide-react";
import { PremiumIcon } from "@/components/ui/premium-icon";
import { specialties } from "@/data/specialties";

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

export function ExperienceEngine() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const currentSpecialty = specialties[activeIndex];

  // Auto-rotate logic
  useEffect(() => {
    if (userInteracted) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveIndex((current) => (current + 1) % specialties.length);
        setIsFading(false);
      }, 200);
    }, 4500);

    return () => clearInterval(interval);
  }, [userInteracted]);

  const handleTabClick = (index: number) => {
    if (index === activeIndex) return;
    setUserInteracted(true);
    setIsFading(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsFading(false);
    }, 200);
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#050505] relative border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-[1.1]">
            Stop Acting Like a Waiting Room.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Start Operating Like a Premium Brand.
            </span>
          </h2>
          <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
            Doctor Diary isn’t just booking software. It’s an end-to-end growth engine designed to eliminate front-desk chaos, dazzle your patients, and effortlessly multiply your revenue.
          </p>
        </div>

        {/* Specialty Selector Tabs */}
        <div className="flex justify-center mb-16 relative z-20">
          <div 
            className="flex items-center gap-2 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar"
            role="tablist"
            aria-label="Select Specialty"
          >
            {specialties.map((specialty, index) => {
              const isSelected = index === activeIndex;
              // Only pulse the first tab if no interaction yet
              const shouldPulse = !userInteracted && index === 0;

              return (
                <button
                  key={specialty.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleTabClick(index)}
                  className={`
                    relative px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex-shrink-0
                    ${isSelected ? 'bg-white/10 text-white shadow-lg scale-[1.03]' : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'}
                    ${shouldPulse ? 'animate-pulse-slow' : ''}
                  `}
                  style={{
                    ...(isSelected ? { boxShadow: `0 0 20px ${specialty.accentColor}30`, border: `1px solid ${specialty.accentColor}50` } : { border: '1px solid transparent' })
                  }}
                >
                  {/* Subtle pulsing background for the first tab initially */}
                  {shouldPulse && (
                    <span className="absolute inset-0 rounded-full bg-emerald-500/20 blur-sm -z-10 animate-ping opacity-70"></span>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: specialty.accentColor, boxShadow: `0 0 10px ${specialty.accentColor}` }} 
                      />
                    )}
                    {specialty.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-200 ease-out"
          style={{ opacity: isFading ? 0.3 : 1 }}
          aria-live="polite"
        >
          {/* Feature 1: The "Wow" Patient Experience */}
          <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-12 relative overflow-hidden group">
            <div 
              className="absolute -right-20 -top-20 w-[500px] h-[500px] rounded-full blur-[100px] -z-10 transition-colors duration-700" 
              style={{ backgroundColor: `${currentSpecialty.accentColor}15` }}
            />
            <div className="mb-6">
              <PremiumIcon Icon={Star} variant="glass" size="xl" />
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl font-bold text-white mb-4">The "Wow" Patient Experience.</h3>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Give patients a frictionless, digital-first journey. From beautiful online booking pages to live queue tracking, deliver a modern experience that screams "Top-Tier Clinic" and guarantees 5-star reviews.
                </p>
                <ul className="space-y-3">
                  {["No app downloads required", "Beautiful clinic profile page", "Instant WhatsApp updates"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-emerald-100/70 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Mock UI */}
              <div className="relative h-auto md:h-full min-h-[300px] w-full rounded-[2rem] bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 shadow-2xl flex flex-col items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 z-0">
                  <Image src="/assets/images/experience_dermatologist.png" alt="Dermatologist with a patient in a modern consultation room" fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />
                </div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0"></div>
                <div className="bg-[#151515] border border-white/10 rounded-2xl p-5 w-64 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-2 group-hover:rotate-0 transition-all duration-500 z-10 mt-20">
                  <div className="flex items-center gap-3 mb-5">
                    <div 
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      style={{ background: `linear-gradient(to top right, ${currentSpecialty.accentColor}, #ffffff)` }}
                    ></div>
                    <div>
                      <div className="text-white font-bold text-sm transition-colors">{currentSpecialty.clinicName}</div>
                      <div className="text-slate-500 text-xs transition-colors">{currentSpecialty.clinicTagline}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div 
                      className="h-10 rounded-lg flex items-center justify-center px-3 border transition-colors"
                      style={{ backgroundColor: `${currentSpecialty.accentColor}15`, borderColor: `${currentSpecialty.accentColor}50` }}
                    >
                      <span className="text-xs font-bold" style={{ color: currentSpecialty.accentColor }}>Book Appointment</span>
                    </div>
                    <div className="h-10 bg-[#222] rounded-lg flex items-center justify-center px-3 border border-white/5">
                      <span className="text-slate-300 text-xs font-semibold">Track Live Queue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Eradicate No-Shows */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-10 relative overflow-hidden group flex flex-col justify-between min-h-[400px]">
            <div 
              className="absolute left-0 bottom-0 w-[300px] h-[300px] rounded-full blur-[80px] -z-10 transition-colors duration-700" 
              style={{ backgroundColor: `${currentSpecialty.accentColor}15` }}
            />
            <div>
              <div className="mb-6">
                <PremiumIcon Icon={MessageSquare} variant="glass" size="xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">The Patient Reactivation Engine.</h3>
              <p className="text-slate-400 text-base mb-8">
                Got empty slots? With one click, launch automated WhatsApp follow-ups and reminders to past patients, and watch your calendar fill up in minutes.
              </p>
            </div>
            <div className="bg-[#111] border border-white/10 rounded-2xl p-4 shadow-2xl relative mt-auto">
              <div 
                className="absolute -left-3 -top-3 w-8 h-8 rounded-full border-4 border-[#0a0a0a] shadow-lg animate-bounce flex items-center justify-center z-20 transition-colors"
                style={{ backgroundColor: currentSpecialty.accentColor }}
              >
                <Zap className="w-4 h-4 text-[#111]" />
              </div>
              <div 
                className="border rounded-xl p-4 relative z-10 transition-colors"
                style={{ backgroundColor: `${currentSpecialty.accentColor}0a`, borderColor: `${currentSpecialty.accentColor}30` }}
              >
                <p className="text-xs text-slate-300 leading-relaxed min-h-[72px]">
                  <strong className="block mb-1 transition-colors" style={{ color: currentSpecialty.accentColor }}>{currentSpecialty.clinicName}</strong>
                  {currentSpecialty.reactivationMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3: 24/7 Acquisition */}
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-10 relative overflow-hidden group flex flex-col justify-between">
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[70px] -z-10 group-hover:bg-cyan-500/20 transition-all duration-700" />
            <div>
              <div className="mb-6">
                <PremiumIcon Icon={Smartphone} variant="glass" size="xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">24/7 Acquisition: Inside & Out.</h3>
              <p className="text-slate-400 text-base mb-8">
                Turn every physical touchpoint into a booking engine. We provide premium QR stands for your reception and weatherproof QR decals for your clinic shutter. Whether it's peak rush hour or 2 AM when you're closed, patients scan, book, and join your database instantly.
              </p>
            </div>
            
            {/* Situational UI Mockup */}
            <div className="aspect-[3/2] w-full rounded-2xl bg-[#0d0d0d] border border-white/5 flex flex-col items-center justify-center p-5 relative group-hover:scale-105 transition-transform duration-500 overflow-hidden shadow-inner">
               <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
               
               <div className="flex flex-col items-center z-10 w-full max-w-[240px]">
                 {/* Status Badge */}
                 <div className="bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-1.5 mb-5 flex items-center gap-2 shadow-lg backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                    <span className="text-xs text-slate-300 font-semibold tracking-wide">Clinic Closed • 2:14 AM</span>
                 </div>
                 
                 {/* Notification Card */}
                 <div className="bg-gradient-to-b from-[#151515] to-[#0A0A0A] border border-cyan-500/30 rounded-xl p-4 w-full shadow-[0_10px_30px_rgba(6,182,212,0.15)] relative transform group-hover:-translate-y-1 transition-transform duration-500">
                   <div className="flex justify-between items-start mb-2">
                     <div>
                       <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1">New Booking</p>
                       <p className="text-white font-bold text-sm">Tomorrow, 10:30 AM</p>
                     </div>
                     <div className="bg-cyan-500/10 text-cyan-400 p-1.5 rounded-lg border border-cyan-500/20">
                       <Zap className="w-3.5 h-3.5" />
                     </div>
                   </div>
                   <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                     <span className="text-[10px] text-slate-400 font-medium bg-white/5 px-2 py-1 rounded">Via Storefront QR</span>
                     <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                       <CheckCircle className="w-3 h-3" /> Secured
                     </span>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Feature 4: Zero Chaos */}
          <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-[32px] p-6 sm:p-12 relative overflow-hidden group flex flex-col md:flex-row items-center gap-10">
            <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 group-hover:bg-indigo-500/20 transition-all duration-700" />
            
            <div className="flex-1 z-10">
              <div className="mb-6">
                <PremiumIcon Icon={Shield} variant="glass" size="xl" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Flawless Operations.<br/>Zero Double-Bookings.</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                Your reputation hinges on reliability. Our enterprise-grade calendar ensures absolute precision. When your calendar is flawless and your front desk is silent, your clinic radiates absolute professionalism.
              </p>
            </div>

            {/* Mock Calendar UI */}
            <div className="w-full md:w-72 bg-[#111] border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex-shrink-0 z-10 relative">
              <div className="absolute -right-4 -top-4 w-12 h-12 bg-indigo-500 rounded-xl border-4 border-[#0a0a0a] shadow-lg flex items-center justify-center rotate-12 group-hover:rotate-[24deg] transition-transform duration-500">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/5">
                <div>
                  <span className="text-white font-bold block">10:00 AM</span>
                  <span className="text-slate-500 text-xs transition-colors">{currentSpecialty.doctorName}</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1">Secured</Badge>
              </div>
              <div className="flex items-center justify-between opacity-50">
                <div>
                  <span className="text-white font-bold block">10:15 AM</span>
                  <span className="text-slate-500 text-xs transition-colors">{currentSpecialty.doctorName}</span>
                </div>
                <Badge className="bg-slate-800 text-slate-400 px-3 py-1 border border-white/5">Locked</Badge>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
