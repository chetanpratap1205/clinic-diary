"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Smartphone, CheckCircle, MessageSquare, Clock, Calendar, ArrowRight, Eye } from "lucide-react";

export function PatientJourneyTimeline() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      time: "8:30 AM",
      title: "Walk-in & Online seamlessly merge",
      desc: "Priya (walk-in) scans the QR code at your desk. Rahul (online) books from home via your Google profile. Both join the exact same smart queue.",
      tag: "Unified Queue",
      badge: "No app needed"
    },
    {
      time: "8:32 AM",
      title: "Instant confirmation on WhatsApp",
      desc: "Both patients get a WhatsApp message with their queue number and estimated waiting time immediately. No phone calls to the receptionist.",
      tag: "WhatsApp Confirmed",
      badge: "You are #24"
    },
    {
      time: "10:15 AM",
      title: "Live queue tracking from home",
      desc: "Priya tracks the queue on her phone. She sees the doctor is serving #18 and her turn is in 25 minutes. She leaves home now.",
      tag: "Live Queue",
      badge: "Now serving #18"
    },
    {
      time: "10:40 AM",
      title: "Consultation right on time",
      desc: "She walks into the clinic and gets called in. Zero waiting room anxiety, zero receptionist arguments, zero queue jumping.",
      tag: "On-Time Consult",
      badge: "Zero Waiting"
    },
    {
      time: "11:05 AM",
      title: "Automated care follow-up",
      desc: "After leaving, Priya receives a automated follow-up. The message contains a direct booking link to schedule her next visit in 2 weeks.",
      tag: "Auto Follow-up",
      badge: "Continue Care"
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="text-[#00B7A8] font-bold text-xs uppercase tracking-widest bg-teal-500/10 px-4 py-1.5 rounded-full border border-teal-500/20 shadow-inner">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Interactive Story Steps */}
          <div className="lg:col-span-7 space-y-6">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`
                    cursor-pointer p-6 rounded-3xl border transition-all duration-300 text-left relative overflow-hidden
                    ${isActive 
                      ? "bg-white/10 border-[#00B7A8] shadow-[0_10px_30px_rgba(0,183,168,0.15)] scale-[1.01]" 
                      : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10"
                    }
                  `}
                >
                  {/* Decorative indicator lines */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00B7A8]" />
                  )}

                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${isActive ? "bg-[#00B7A8] text-white" : "bg-white/10 text-slate-300"}`}>
                        {step.time}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {step.tag}
                      </span>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${isActive ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-white/5 border-white/5 text-slate-400"}`}>
                      {step.badge}
                    </span>
                  </div>

                  <h3 className={`text-lg sm:text-xl font-bold mb-2 transition-colors ${isActive ? "text-white" : "text-slate-300"}`}>
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Mockup Phone Screen */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[9/19] bg-slate-950 border-[8px] border-slate-800 rounded-[3rem] p-3 shadow-2xl flex flex-col justify-between overflow-hidden">
              {/* Speaker camera cutout */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-full flex items-center justify-center z-50">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 mr-2" />
                <div className="w-10 h-1 bg-slate-900 rounded-full" />
              </div>

              {/* Phone Header Mockup */}
              <div className="pt-5 pb-3 px-2 border-b border-white/5 flex items-center justify-between text-slate-400 text-[10px] font-semibold">
                <span>8:30 AM</span>
                <span className="text-emerald-400 font-bold uppercase">Dr. Sharma's Clinic</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <div className="w-4 h-2.5 border border-slate-400 rounded-sm p-0.5"><div className="bg-emerald-400 h-full w-[80%]" /></div>
                </div>
              </div>

              {/* Dynamic Phone Content Frame */}
              <div className="flex-1 relative overflow-hidden flex flex-col justify-start rounded-b-3xl mt-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, filter: "blur(4px)", scale: 1.02 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={{ opacity: 0, filter: "blur(4px)", scale: 0.98 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <Image
                      src={[
                        "/assets/booking_app.PNG",
                        "/assets/token.PNG",
                        "/assets/live_queue.PNG",
                        "/assets/tracking.PNG",
                        "/assets/calender.PNG"
                      ][activeStep]}
                      alt={`Patient Journey Step ${activeStep + 1}`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 320px"
                      quality={95}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Phone Footer Mockup */}
              <div className="pb-2 pt-1 border-t border-white/5 text-center flex justify-center items-center">
                <div className="w-24 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>
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
