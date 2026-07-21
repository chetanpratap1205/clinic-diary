"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Search, CalendarCheck, MessageSquare, CheckCircle2 } from "lucide-react";

export function HeroSpotlight() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Cinematic Spotlight Effect */}
      <motion.div
        initial={{ opacity: 0, x: -100, y: -100 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[130px] mix-blend-screen"
      />

      <motion.div
        initial={{ opacity: 0, x: 100, y: -100 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute -top-40 -right-40 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-cyan-500/10 rounded-full blur-[100px] sm:blur-[130px] mix-blend-screen"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
        transition={{ 
          opacity: { duration: 1.5, ease: "easeOut", delay: 0.5 },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          default: { duration: 8, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-400/10 rounded-full blur-[120px] mix-blend-screen"
      />
      
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)]" />
    </div>
  );
}

const steps = [
  { id: 1, icon: Search, label: "Patient Search", detail: "Finds clinic online" },
  { id: 2, icon: CalendarCheck, label: "24/7 Booking", detail: "Slot instantly reserved" },
  { id: 3, icon: MessageSquare, label: "WhatsApp Alert", detail: "Automated reminder" },
  { id: 4, icon: CheckCircle2, label: "Zero No-Shows", detail: "Patient checks in" },
];

export function LiveAutomationPipeline() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 2500); // 2.5s per step
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto mt-20 relative z-20 px-4">
      {/* Label */}
      <div className="text-center mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-[#111] px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
          Live Automation Engine
        </span>
      </div>

      {/* The Glassmorphic Pipeline Container */}
      <div className="relative bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-10 shadow-[0_0_50px_rgba(16,185,129,0.05)] overflow-hidden">
        
        {/* Subtle background glow that follows the active step */}
        <motion.div
          animate={{
            x: `${activeStep * 100}%`,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute top-0 bottom-0 left-0 w-1/4 bg-emerald-500/5 blur-[50px] pointer-events-none"
        />

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 sm:gap-4">
          
          {/* The connecting line (Desktop) */}
          <div className="absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-white/5 hidden sm:block z-0" />
          
          {/* Active Progress Line (Desktop) */}
          <motion.div 
            className="absolute top-[28px] left-[10%] h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-400 hidden sm:block z-0"
            initial={{ width: "0%" }}
            animate={{ width: `${(activeStep / (steps.length - 1)) * 80}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            return (
              <div key={step.id} className="relative z-10 flex flex-row sm:flex-col items-center gap-4 sm:gap-4 w-full sm:w-1/4">
                
                {/* Node */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    backgroundColor: isActive || isCompleted ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.02)",
                    borderColor: isActive ? "rgba(16, 185, 129, 0.5)" : isCompleted ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  }}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-xl backdrop-blur-md relative overflow-hidden transition-colors duration-500`}
                >
                  {isActive && (
                     <motion.div 
                       layoutId="node-pulse"
                       className="absolute inset-0 bg-emerald-400/20 animate-pulse"
                     />
                  )}
                  <Icon 
                    className={`w-6 h-6 transition-colors duration-500 relative z-10 ${isActive ? "text-emerald-400" : isCompleted ? "text-emerald-500/70" : "text-slate-500"}`} 
                  />
                </motion.div>

                {/* Text */}
                <div className="flex flex-col sm:items-center text-left sm:text-center">
                  <motion.h4 
                    animate={{ color: isActive || isCompleted ? "#fff" : "#94a3b8" }}
                    className="text-sm font-bold transition-colors duration-500"
                  >
                    {step.label}
                  </motion.h4>
                  <motion.span 
                    animate={{ color: isActive ? "#34d399" : "#64748b" }}
                    className="text-[11px] sm:text-xs font-medium mt-1 transition-colors duration-500"
                  >
                    {step.detail}
                  </motion.span>
                </div>

                {/* Connecting Line (Mobile Vertical) */}
                {index < steps.length - 1 && (
                  <div className="absolute left-7 top-14 bottom-[-2rem] w-0.5 bg-white/5 sm:hidden z-0">
                    {isCompleted && (
                       <motion.div 
                         className="absolute top-0 left-0 w-full bg-gradient-to-b from-emerald-500 to-cyan-400"
                         initial={{ height: "0%" }}
                         animate={{ height: "100%" }}
                         transition={{ duration: 0.5 }}
                       />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
