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
}

export function BottomActionBar({ clinic, workingDays, closedDates, lexicon, lang }: BottomActionBarProps) {
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
          <Link href={`/status/${clinic.slug}?lang=${lang}`} passHref legacyBehavior>
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 w-[32%] max-w-[140px] h-14 rounded-full flex flex-col items-center justify-center gap-0.5 border shadow-sm transition-all relative overflow-hidden group"
              style={{ 
                backgroundColor: `${themeColor}0a`, 
                borderColor: `${themeColor}25`,
                color: themeColor 
              }}
              aria-label="Live Status"
            >
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <Activity className="w-4 h-4" strokeWidth={2.5} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest leading-none mt-0.5">{t.statusWait || "Status"}</span>
            </motion.a>
          </Link>

          {/* Book Appointment Pulsing Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsModalOpen(true)}
            className="flex-1 h-14 rounded-full text-white flex items-center justify-center gap-2.5 sm:gap-3 shadow-xl relative overflow-hidden group"
            style={{ 
              background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, 
              boxShadow: `0 12px 30px -6px ${themeColor}70` 
            }}
            aria-label="Book Free Appointment"
          >
            {/* Soft Ambient Pulse Ring */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]" />
            
            <CalendarCheck className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" strokeWidth={2.5} />
            <div className="flex flex-col items-start text-left">
              <span className="text-[14px] sm:text-[15px] font-black leading-tight tracking-tight drop-shadow-sm">{t.bookAppointment}</span>
              <span className="text-[9.5px] font-bold text-white/90 leading-tight uppercase tracking-wider">Pay at Clinic · Free Token</span>
            </div>
          </motion.button>
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
              <div className="bg-slate-50 rounded-t-[2rem] sm:rounded-none border-t sm:border-l sm:border-t-0 border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-screen sm:h-full">
                
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-white sticky top-0 z-10 shrink-0 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                        {clinic.name} • Live OPD Token
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">{t.bookAppointment}</h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">{t.trustNote(clinic.consultationFee)}</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:-rotate-90 flex items-center justify-center transition-all flex-shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
                
                {/* Scrollable Form Content */}
                <div className="overflow-y-auto overflow-x-hidden flex-1 w-full bg-white relative hide-scrollbar p-2 sm:p-4">
                  <BookingClient clinic={clinic} workingDays={workingDays} closedDates={closedDates} lexicon={lexicon} lang={lang} />
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
