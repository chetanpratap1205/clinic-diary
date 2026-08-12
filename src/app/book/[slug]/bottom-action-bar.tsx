"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Activity, X } from "lucide-react";
import Link from "next/link";
import { BookingClient } from "./booking-client";
import type { Clinic } from "@/db/schema";
import { DICTIONARY, Language } from "@/lib/i18n";

interface BottomActionBarProps {
  clinic: Clinic;
  workingDays: number[];
  closedDates: string[];
  lexicon: {
    doctorTitle: string;
    patientTitle: string;
    consultationTerm: string;
    clinicType: string;
  };
  lang: Language;
  isLead?: boolean;
  leadTimings?: string;
}

export function BottomActionBar({ clinic, workingDays, closedDates, lexicon, lang, isLead, leadTimings }: BottomActionBarProps) {
  const t = DICTIONARY[lang];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const themeColor = clinic.themeColor ?? "#0ea5e9";
  const [isDesktop, setIsDesktop] = useState(false);

  // Sync screen size for modal animations (matches Next.js lg breakpoint 1024px)
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 1024);
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* 10/10 Floating Dynamic Island */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-0 pointer-events-none flex justify-center pb-safe">
        <div 
          className="pointer-events-auto w-full max-w-[390px] sm:max-w-[430px] bg-white/80 backdrop-blur-2xl rounded-full border border-white/90 p-2 flex gap-2.5 items-center justify-between shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.9)_inset] ring-1 ring-black/5"
        >
          {/* Live Status Widget Button */}
          <Link
            href={`/status/${clinic.slug}?lang=${lang}`}
            className="flex-shrink-0 w-[28%] max-w-[120px] h-14 rounded-full flex flex-col items-center justify-center gap-0.5 transition-all relative overflow-hidden group cursor-pointer hover:scale-[1.03] active:scale-[0.95]"
            style={{ 
              backgroundColor: `${themeColor}10`, 
              color: themeColor 
            }}
            aria-label="Live Status"
          >
            <div className="flex items-center gap-1.5 opacity-80">
              <Activity className="w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest leading-none mt-0.5 opacity-80">{t.liveQueue || "Live Queue"}</span>
          </Link>

          {/* Book Appointment Pulsing Button */}
          <div className="flex-1 relative">
            <div 
              className="absolute -inset-1 rounded-full opacity-40 blur-md animate-pulse"
              style={{ backgroundColor: themeColor }}
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsModalOpen(true)}
              className="w-full h-14 rounded-full text-white flex items-center justify-center gap-2.5 sm:gap-3 shadow-2xl relative overflow-hidden group"
              style={{ 
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}e6)`, 
                boxShadow: `0 15px 35px -5px ${themeColor}80` 
              }}
              aria-label="Book Free Appointment"
            >
              {/* Soft Ambient Pulse Ring */}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]" />
              
              <CalendarCheck className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
              <div className="flex flex-col items-start text-left">
                <span className="text-[15px] sm:text-[16px] font-black leading-tight tracking-tight drop-shadow-md">{t.bookAppointment}</span>
                <span className="text-[9.5px] font-bold text-white/90 leading-tight uppercase tracking-wider">{lang === "hi" ? "क्लिनिक में भुगतान · मुफ्त टोकन" : "Pay at Clinic · Free Token"}</span>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Booking Modal / Bottom Sheet */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            />
            
            {/* Sheet / Drawer Container */}
            <motion.div
              initial={isDesktop ? { opacity: 0, x: "100%" } : { opacity: 0, y: "100%" }}
              animate={isDesktop ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 }}
              exit={isDesktop ? { opacity: 0, x: "100%" } : { opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed z-[60] bottom-0 inset-x-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-full sm:max-w-md flex flex-col"
            >
              <div className="bg-white rounded-t-[2.5rem] sm:rounded-none border-t sm:border-l sm:border-t-0 border-slate-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-screen sm:h-full">
                
                {/* Mobile Sheet Drag Handle */}
                <div className="pt-2.5 pb-1 bg-white flex justify-center sm:hidden shrink-0">
                  <div className="w-12 h-1.5 bg-slate-300/80 rounded-full" />
                </div>

                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0 shadow-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">{t.bookAppointment}</h2>
                      <p className="text-[11px] text-slate-500 font-bold line-clamp-1">{clinic.name} · {lang === "hi" ? "परामर्श टोकन" : "Consultation Token"}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/60 hover:bg-slate-200 hover:rotate-90 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                    aria-label="Close modal"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                
                {/* Scrollable Form Content */}
                <div className="overflow-y-auto overflow-x-hidden flex-1 w-full bg-white relative hide-scrollbar p-3 sm:p-5">
                  <BookingClient clinic={clinic} workingDays={workingDays} closedDates={closedDates} lexicon={lexicon} lang={lang} isLead={isLead} leadTimings={leadTimings} />
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
