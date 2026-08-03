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
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAFBFC] relative border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0B132B] mb-6 tracking-tight leading-[1.1]">
            Stop Acting Like a Waiting Room.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
              Start Operating Like a Premium Brand.
            </span>
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
            Doctor Diary is an end-to-end practice engine designed to eliminate front-desk chaos, dazzle your patients, and elevate your practice.
          </p>
        </div>

        {/* Specialty Selector Tabs */}
        <div className="flex justify-center mb-12 relative z-20">
          <div 
            className="flex items-center gap-2 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar"
            role="tablist"
            aria-label="Select Specialty"
          >
            {specialties.map((specialty, index) => {
              const isSelected = index === activeIndex;

              return (
                <button
                  key={specialty.id}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleTabClick(index)}
                  className={`
                    relative px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex-shrink-0 border
                    ${isSelected ? 'bg-[#0B132B] text-white border-[#0B132B] shadow-md scale-[1.02]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span 
                        className="w-2 h-2 rounded-full bg-[#00B7A8]" 
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
          <div className="md:col-span-2 bg-white border border-slate-200/90 rounded-[32px] p-6 sm:p-12 relative overflow-hidden group shadow-md hover:shadow-xl transition-all">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center">
                <Star className="w-6 h-6 fill-current" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#0B132B] mb-4">The "Wow" Patient Experience.</h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 font-medium">
                  Give patients a frictionless, digital-first journey. From beautiful online booking pages to live queue tracking, deliver a modern experience that screams "Top-Tier Clinic".
                </p>
                <ul className="space-y-3">
                  {["No app downloads required", "Beautiful clinic profile page", "Instant WhatsApp updates"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-700 text-sm font-semibold">
                      <CheckCircle className="w-4 h-4 text-[#00B7A8] flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Mock UI */}
              <div className="relative h-auto md:h-full min-h-[300px] w-full rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col items-center justify-center overflow-hidden group">
                <div className="absolute inset-0 z-0">
                  <Image src="/assets/images/experience_dermatologist.png" alt="Dermatologist with a patient in a modern consultation room" fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 w-64 shadow-2xl z-10 mt-16 text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-full flex-shrink-0 bg-[#00B7A8]"
                    ></div>
                    <div>
                      <div className="text-[#0B132B] font-bold text-sm">{currentSpecialty.clinicName}</div>
                      <div className="text-slate-500 text-xs">{currentSpecialty.clinicTagline}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div 
                      className="h-10 rounded-lg flex items-center justify-center px-3 bg-[#00B7A8] text-white font-bold text-xs"
                    >
                      <span>Book Appointment</span>
                    </div>
                    <div className="h-10 bg-slate-100 rounded-lg flex items-center justify-center px-3 border border-slate-200 text-slate-700 text-xs font-semibold">
                      <span>Track Live Queue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Eradicate No-Shows */}
          <div className="bg-white border border-slate-200/90 rounded-[32px] p-6 sm:p-10 relative overflow-hidden group flex flex-col justify-between min-h-[400px] shadow-md hover:shadow-xl transition-all">
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0B132B] mb-3">Patient Reactivation Engine.</h3>
              <p className="text-slate-600 text-base mb-8 font-medium">
                Automate WhatsApp reminders and follow-up sequences so patient no-shows drop to near zero.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-inner relative mt-auto">
              <div 
                className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-[#00B7A8] text-white shadow-md flex items-center justify-center z-20"
              >
                <Zap className="w-4 h-4" />
              </div>
              <div 
                className="bg-white border border-slate-200 rounded-xl p-4 relative z-10 shadow-sm"
              >
                <p className="text-xs text-slate-700 leading-relaxed min-h-[72px] font-medium">
                  <strong className="block mb-1 text-[#00B7A8]">{currentSpecialty.clinicName}</strong>
                  {currentSpecialty.reactivationMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3: 24/7 Acquisition */}
          <div className="bg-white border border-slate-200/90 rounded-[32px] p-6 sm:p-10 relative overflow-hidden group flex flex-col justify-between shadow-md hover:shadow-xl transition-all">
            <div>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[#0B132B] mb-3">24/7 Acquisition: Inside & Out.</h3>
              <p className="text-slate-600 text-base mb-8 font-medium">
                Turn every physical touchpoint into a booking engine with physical QR stands and shutter QR decals.
              </p>
            </div>
            
            {/* Situational UI Mockup */}
            <div className="aspect-[3/2] w-full rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-5 relative overflow-hidden shadow-inner">
               <div className="flex flex-col items-center z-10 w-full max-w-[240px]">
                 <div className="bg-white border border-slate-200 rounded-full px-4 py-1.5 mb-4 flex items-center gap-2 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-xs text-slate-700 font-bold">Clinic Closed • 2:14 AM</span>
                 </div>
                 
                 <div className="bg-white border border-emerald-500/30 rounded-xl p-4 w-full shadow-md text-left">
                   <div className="flex justify-between items-start mb-2">
                     <div>
                       <p className="text-[10px] text-[#00B7A8] font-black uppercase tracking-wider mb-1">New Booking</p>
                       <p className="text-[#0B132B] font-bold text-sm">Tomorrow, 10:30 AM</p>
                     </div>
                     <div className="bg-emerald-50 text-[#00B7A8] p-1.5 rounded-lg border border-emerald-200">
                       <Zap className="w-3.5 h-3.5" />
                     </div>
                   </div>
                   <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                     <span className="text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">Via Storefront QR</span>
                     <span className="text-[10px] text-[#00B7A8] font-bold flex items-center gap-1">
                       <CheckCircle className="w-3 h-3" /> Secured
                     </span>
                   </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Feature 4: Zero Chaos */}
          <div className="md:col-span-2 bg-white border border-slate-200/90 rounded-[32px] p-6 sm:p-12 relative overflow-hidden group flex flex-col md:flex-row items-center gap-10 shadow-md hover:shadow-xl transition-all">
            <div className="flex-1 z-10">
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0B132B] mb-4">Flawless Operations.<br/>Zero Double-Bookings.</h3>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                Our enterprise-grade calendar ensures absolute precision. When your calendar is flawless and your front desk is calm, your clinic radiates absolute professionalism.
              </p>
            </div>

            {/* Mock Calendar UI */}
            <div className="w-full md:w-72 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-lg flex-shrink-0 z-10 relative">
              <div className="absolute -right-3 -top-3 w-10 h-10 bg-[#00B7A8] text-white rounded-xl shadow-md flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                <div>
                  <span className="text-[#0B132B] font-bold block text-sm">10:00 AM</span>
                  <span className="text-slate-500 text-xs">{currentSpecialty.doctorName}</span>
                </div>
                <Badge className="bg-emerald-50 text-[#00B7A8] border border-emerald-200 px-3 py-1">Secured</Badge>
              </div>
              <div className="flex items-center justify-between opacity-60">
                <div>
                  <span className="text-slate-700 font-bold block text-sm">10:15 AM</span>
                  <span className="text-slate-500 text-xs">{currentSpecialty.doctorName}</span>
                </div>
                <Badge className="bg-slate-200 text-slate-600 px-3 py-1">Locked</Badge>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
