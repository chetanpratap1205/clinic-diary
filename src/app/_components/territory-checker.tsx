"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, MapPin, Search, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function TerritoryChecker() {
  const [pinCode, setPinCode] = useState("");
  const [result, setResult] = useState<{
    searched: boolean;
    available: boolean;
    locationName?: string;
    pin?: string;
  }>({ searched: false, available: true });
  const [isSearching, setIsSearching] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setResult({
        searched: true,
        available: true,
        locationName: pinCode.length === 6 ? `Area PIN ${pinCode}` : pinCode,
        pin: pinCode
      });
    }, 600);
  };

  return (
    <section className="py-20 px-4 sm:px-6 bg-[#F1F5F9] border-t border-b border-slate-200/80 relative overflow-hidden">
      {/* Subtle Background Mesh Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        
        {/* Top Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#00B7A8] text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-[#00B7A8]" />
          <span>Area Exclusivity License</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-[#0B132B] mb-4 tracking-tight">
          Secure Your Area's Exclusive Presence.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
            One Clinic Per PIN Code Area.
          </span>
        </h2>

        <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          To keep patient booking direct and localized, we license our digital front desk exclusively to <strong>one clinic per PIN code area</strong>. Check availability for your location.
        </p>

        {/* PIN Code Search Form */}
        <div className="max-w-xl mx-auto bg-white border border-slate-200 p-3 rounded-3xl shadow-xl mb-8">
          <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00B7A8]" />
              <input
                type="text"
                placeholder="Enter your 6-Digit PIN Code or City..."
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-slate-50 text-[#0B132B] rounded-2xl border border-slate-200 focus:border-[#00B7A8] focus:bg-white focus:outline-none text-base font-semibold placeholder:text-slate-400 transition-all"
              />
            </div>
            <Button
              type="submit"
              disabled={isSearching}
              size="lg"
              className="h-14 px-8 bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold rounded-2xl shadow-[0_4px_16px_rgba(0,183,168,0.3)] transition-all flex items-center justify-center gap-2 shrink-0"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Check Territory</span>
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Realtime Result Card */}
        <AnimatePresence>
          {result.searched && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto bg-white border border-emerald-500/40 p-6 rounded-3xl shadow-[0_15px_40px_rgba(0,183,168,0.12)] text-left"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[#00B7A8] shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-[#00B7A8] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      TERRITORY AVAILABLE
                    </span>
                    <span className="text-xs font-bold text-slate-500">{result.locationName}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0B132B] mb-2">
                    Founding License Open in Your Area
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4 font-medium">
                    Your area's exclusive slot is currently available. Register your clinic today to secure your digital front desk and rate-lock your founding rate.
                  </p>
                  <Link href="/signup">
                    <Button size="sm" className="bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold rounded-xl px-5 h-10 text-xs shadow-md flex items-center gap-2">
                      <span>Lock Your Territory Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
