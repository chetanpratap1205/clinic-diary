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

  // Sync screen size for modal animations
  useEffect(() => {
    setIsDesktop(window.innerWidth >= 640);
    const handleResize = () => setIsDesktop(window.innerWidth >= 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Floating Dynamic Island */}
      <div className="fixed bottom-6 left-0 right-0 z-40 px-4 sm:px-0 pointer-events-none flex justify-center pb-safe">
        <div className="pointer-events-auto w-full max-w-[380px] sm:max-w-[420px] bg-white/70 backdrop-blur-2xl rounded-full border border-white/80 p-2 flex gap-2 items-center justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.5)_inset]">
          
          {/* Track Button */}
          <Link href={`/status/${clinic.slug}?lang=${lang}`} passHref legacyBehavior>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="flex-shrink-0 w-[30%] max-w-[140px] h-14 rounded-2xl flex flex-col items-center justify-center gap-0.5 border shadow-sm transition-colors"
              style={{ 
                backgroundColor: `${themeColor}08`, 
                borderColor: `${themeColor}20`,
                color: themeColor 
              }}
              aria-label="Live Status"
            >
              <Activity className="w-5 h-5 mb-0.5" strokeWidth={2.5} />
              <span className="text-[9px] font-black uppercase tracking-widest">{t.statusWait || "Status"}</span>
            </motion.a>
          </Link>

          {/* Book Button (Primary) */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsModalOpen(true)}
            className="flex-1 h-14 rounded-[20px] text-white flex items-center justify-center gap-2 sm:gap-3 shadow-lg relative overflow-hidden group"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, boxShadow: `0 10px 25px -5px ${themeColor}60` }}
            aria-label="Book Free Appointment"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]" />
            
            <CalendarCheck className="w-[22px] h-[22px]" strokeWidth={2.5} />
            <div className="flex flex-col items-start text-left">
              <span className="text-[14px] sm:text-[15px] font-black leading-tight tracking-tight drop-shadow-sm">{t.bookAppointment}</span>
              <span className="text-[10px] font-bold text-white/90 leading-tight uppercase tracking-wider">{t.trustNote(0).split(" · ")[0]} • Instant Token</span>
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
