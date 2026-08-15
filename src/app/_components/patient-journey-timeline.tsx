"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export function PatientJourneyTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      time: "8:30 AM",
      title: "Walk-in & Online seamlessly merge",
      desc: "Priya (walk-in) scans the QR code at your desk. Rahul (online) books from home via your Google profile. Both join the exact same smart queue.",
      tag: "Unified Queue",
      badge: "No app needed",
      phoneImg: "/assets/token.PNG",
      dashboardFocus: false,
      showWhatsApp: false
    },
    {
      time: "8:32 AM",
      title: "Instant confirmation on WhatsApp",
      desc: "Both patients get a WhatsApp message with their queue number and estimated waiting time immediately. No phone calls to the receptionist.",
      tag: "WhatsApp Confirmed",
      badge: "You are #24",
      phoneImg: "/assets/token.PNG",
      dashboardFocus: false,
      showWhatsApp: true
    },
    {
      time: "10:15 AM",
      title: "Live queue tracking from home",
      desc: "Priya tracks the queue on her phone. She sees the doctor is serving #18 and her turn is in 25 minutes. She leaves home now.",
      tag: "Live Queue",
      badge: "Now serving #18",
      phoneImg: "/assets/live_queue.PNG",
      dashboardFocus: false,
      showWhatsApp: false
    },
    {
      time: "10:40 AM",
      title: "Consultation right on time",
      desc: "She walks into the clinic and gets called in. Zero waiting room anxiety, zero receptionist arguments, zero queue jumping.",
      tag: "On-Time Consult",
      badge: "Zero Waiting",
      phoneImg: "/assets/live_queue.PNG",
      dashboardFocus: true, // Highlights the clinic dashboard running perfectly
      showWhatsApp: false
    },
    {
      time: "11:05 AM",
      title: "Automated care follow-up",
      desc: "After leaving, Priya receives an automated follow-up. The message contains a direct booking link to schedule her next visit.",
      tag: "Auto Follow-up",
      badge: "Continue Care",
      phoneImg: "/assets/tracking.PNG",
      dashboardFocus: false,
      showWhatsApp: false
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-[#040D21] text-white relative overflow-hidden">
      {/* Premium Glow decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00B7A8]/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[#00B7A8] font-bold text-xs uppercase tracking-widest bg-[#00B7A8]/10 px-4 py-1.5 rounded-full border border-[#00B7A8]/20 shadow-inner">
            Signature Feature
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-6 tracking-tight">
            No more "Doctor, mera number kab aayega?"
          </h2>
          <p className="text-slate-300 text-lg sm:text-xl font-medium leading-relaxed">
            Walk-ins and online bookings merged into one smart queue. Show patients a clinic experience that matches the tier of your medical expertise.
          </p>
        </div>

        {/* 2-Column Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          
          {/* Left Column: Interactive Story Steps */}
          <div className="lg:col-span-6 xl:col-span-5 space-y-4">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`
                    cursor-pointer p-6 rounded-2xl border transition-all duration-300 text-left relative overflow-hidden group
                    ${isActive 
                      ? "bg-white/10 border-[#00B7A8] shadow-[0_10px_30px_rgba(0,183,168,0.15)] scale-[1.02] z-10" 
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                    }
                  `}
                >
                  {/* Glowing active indicator line */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-step-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#00B7A8] shadow-[0_0_15px_rgba(0,183,168,0.8)]" 
                    />
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider transition-colors ${isActive ? "bg-[#00B7A8] text-white" : "bg-white/10 text-slate-300 group-hover:bg-white/20"}`}>
                        {step.time}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {step.tag}
                      </span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border transition-colors ${isActive ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-white/5 border-white/10 text-slate-500"}`}>
                      {step.badge}
                    </span>
                  </div>

                  <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors ${isActive ? "text-white" : "text-slate-300"}`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm sm:text-base font-medium leading-relaxed transition-colors ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Masterclass Layered Diorama */}
          <div className="lg:col-span-6 xl:col-span-7 lg:sticky lg:top-24 h-[500px] sm:h-[600px] flex items-center justify-center relative perspective-1000">
            
            {/* BACKGROUND LAYER: The Clinic's Dashboard */}
            <motion.div 
              className="absolute w-[95%] sm:w-[85%] right-0 top-8 sm:top-12 bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-700 overflow-hidden shadow-2xl"
              initial={false}
              animate={{ 
                scale: steps[activeStep].dashboardFocus ? 1.05 : 0.9,
                opacity: steps[activeStep].dashboardFocus ? 1 : 0.4,
                x: steps[activeStep].dashboardFocus ? "-10%" : "5%",
                y: steps[activeStep].dashboardFocus ? "5%" : "-5%",
                rotateY: steps[activeStep].dashboardFocus ? -5 : -15,
                filter: steps[activeStep].dashboardFocus ? "blur(0px)" : "blur(4px)"
              }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Mac Window Controls */}
              <div className="h-6 sm:h-8 bg-slate-800/80 border-b border-slate-700 flex items-center px-3 sm:px-4 gap-1.5 sm:gap-2 backdrop-blur-sm">
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-red-400/80" />
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-400/80" />
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-green-400/80" />
              </div>
              <div className="relative aspect-video w-full bg-slate-950">
                <Image 
                  src="/assets/Dashboard.png" 
                  alt="Doctor Diary Dashboard" 
                  fill 
                  className="object-cover object-left-top"
                  quality={90}
                />
                {/* Glow overlay when focused */}
                <div className={`absolute inset-0 bg-[#00B7A8]/5 transition-opacity duration-1000 ${steps[activeStep].dashboardFocus ? "opacity-100" : "opacity-0"}`} />
              </div>
            </motion.div>

            {/* FOREGROUND LAYER: The Patient's Phone */}
            <motion.div 
              className="absolute left-4 sm:left-12 bottom-12 sm:bottom-16 w-[180px] sm:w-[240px] bg-slate-950 border-[6px] sm:border-[8px] border-slate-800 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden"
              initial={false}
              animate={{ 
                scale: steps[activeStep].dashboardFocus ? 0.8 : 1.05,
                opacity: steps[activeStep].dashboardFocus ? 0.3 : 1,
                x: steps[activeStep].dashboardFocus ? "-15%" : "0%",
                y: steps[activeStep].dashboardFocus ? "10%" : "0%",
                rotateY: steps[activeStep].dashboardFocus ? 15 : 5,
                filter: steps[activeStep].showWhatsApp ? "blur(2px) brightness(0.6)" : "blur(0px) brightness(1)"
              }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
              style={{ transformStyle: "preserve-3d", aspectRatio: "9/19" }}
            >
              {/* Dynamic Screen Content */}
              <div className="flex-1 relative bg-slate-900 w-full h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={steps[activeStep].phoneImg}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={steps[activeStep].phoneImg}
                      alt="Patient Mobile View"
                      fill
                      className="object-cover object-top"
                      quality={95}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* MAGIC LAYER: Floating WhatsApp Notification (Step 2) */}
            <AnimatePresence>
              {steps[activeStep].showWhatsApp && (
                <motion.div
                  initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: 20 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
                  className="absolute z-50 bottom-32 sm:bottom-40 left-8 sm:left-24 bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-5 shadow-2xl w-[260px] sm:w-[320px] border border-white/20"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0 shadow-md">
                      {/* Simple WhatsApp-like icon */}
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.571-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800">Doctor Diary</div>
                      <div className="text-[10px] sm:text-xs text-green-600 font-semibold">Just now</div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs sm:text-sm text-slate-700 font-medium">
                      Hi Priya, your appointment is confirmed! Your queue number is <strong className="text-black bg-yellow-200 px-1 rounded">#24</strong>. We will notify you when it's your turn.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        </div>

        {/* Section CTA */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-base font-medium">
            That's a clinic patients remember. And return to.
          </p>
        </div>

      </div>
    </section>
  );
}
