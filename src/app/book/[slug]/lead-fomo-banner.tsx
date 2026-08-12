"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { expressLeadInterest } from "@/app/admin/leads/actions-interest";

export function LeadFomoBanner({ clinicName, doctorName, slug }: { clinicName: string, doctorName: string, slug: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleInterest = async () => {
    setIsLoading(true);
    // Fire the intent tracker
    await expressLeadInterest(slug);
    
    // Redirect instantly to WhatsApp (User's specific number)
    const waUrl = "https://wa.me/918077170715?text=" + encodeURIComponent("Hi Doctor Diary, I am interested in taking my clinic live.");
    window.location.href = waUrl;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 -mt-4 relative z-10">
      <div className="relative rounded-[2rem] p-6 sm:p-8 overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 justify-between text-center lg:text-left">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulse" />
              Exclusive Preview For {doctorName}
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-white leading-tight tracking-tight mb-3 drop-shadow-sm">
              Experience the booking page custom-built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">{clinicName}</span>
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Join the top 1% of doctors modernizing their practice. <strong className="text-white">100% Customizable:</strong> add your real profile photo, exact clinic timings, custom services, and consultation fees.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-5">
               <p className="text-[10px] sm:text-xs text-amber-200/80 font-bold uppercase tracking-wider flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                 <span className="text-amber-400 text-sm">🔥</span> Only 2 priority onboarding slots left in your city this month
               </p>
            </div>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto mt-4 lg:mt-0 flex flex-col items-center gap-3">
            <button 
              onClick={handleInterest}
              disabled={isLoading}
              className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-white text-slate-900 rounded-full font-black text-sm shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105 hover:shadow-[0_0_50px_-10px_rgba(255,255,255,0.5)] active:scale-95 transition-all duration-300 disabled:opacity-80 disabled:scale-95"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-900/40 border-t-slate-900 rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Go Live With Doctor Diary
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
