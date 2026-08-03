"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Sparkles } from "lucide-react";

export function PWASplashScreen() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if splash has already been shown in this browser session
    const hasSeenSplash = sessionStorage.getItem("dd_splash_shown");
    if (!hasSeenSplash) {
      setShowSplash(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("dd_splash_shown", "true");
      }, 1600); // Display for 1.6 seconds for royal entrance

      return () => clearTimeout(timer);
    }
  }, []);

  if (!showSplash) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05, filter: "blur(12px)" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-between bg-slate-950 text-white p-8 overflow-hidden select-none"
      >
        {/* Ambient Royal Background Lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Top Spacer */}
        <div className="h-10" />

        {/* Center Royal Branding Box */}
        <div className="flex flex-col items-center text-center relative z-10 my-auto">
          {/* Animated Logo Emblem with Pulse Rings */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-8"
          >
            {/* Outer Pulse Rings */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-teal-500/30 via-amber-400/20 to-teal-500/30 blur-md animate-pulse" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900 border-2 border-teal-500/40 p-4 shadow-[0_0_50px_rgba(20,184,166,0.3)] flex items-center justify-center overflow-hidden">
              <Image
                src="/icon-192.png"
                alt="Doctor Diary Emblem"
                width={80}
                height={80}
                className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                priority
              />
            </div>
          </motion.div>

          {/* Royal Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2"
          >
            <span className="bg-gradient-to-r from-white via-slate-100 to-teal-200 bg-clip-text text-transparent drop-shadow-sm">
              DOCTOR DIARY
            </span>
          </motion.h1>

          {/* Sub-Branding: Powered by NatureXpress */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col items-center gap-2"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 border border-teal-500/30 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">Powered by</span>
              <span className="text-teal-400 font-extrabold tracking-wide uppercase">NatureXpress</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mt-2 tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Healthcare OS • Enterprise Grade</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom Shimmer Loading Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="w-full max-w-xs mb-6 relative z-10 flex flex-col items-center gap-2"
        >
          <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(20,184,166,0.8)]"
            />
          </div>
          <span className="text-[10px] font-medium text-slate-500 tracking-widest uppercase">
            Securing Workspace...
          </span>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
