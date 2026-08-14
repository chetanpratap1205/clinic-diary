"use client";

import { useState } from "react";
import { Users, Edit3, QrCode, MapPin, Camera, Sparkles, MoveRight, Settings, Lock } from "lucide-react";
import { expressLeadInterest } from "@/app/admin/leads/actions-interest";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

export function LeadFomoBanner({ clinicName, doctorName, slug }: { clinicName: string, doctorName: string, slug: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleInterest = async () => {
    setIsLoading(true);
    // Fire the intent tracker
    await expressLeadInterest(slug);
    
    // Redirect instantly to WhatsApp (Founder's specific number)
    const waUrl = "https://wa.me/918077170715?text=" + encodeURIComponent(`Hi Doctor Diary, I am ${doctorName}. I want to claim ${clinicName} and see what I can get.`);
    window.location.href = waUrl;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 mt-6 relative z-10">
      <div className="relative rounded-[2rem] p-6 sm:p-8 overflow-hidden shadow-2xl border border-teal-700/50 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900">
        
        {/* Abstract Tech Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
          
          <div className="flex-1 text-center lg:text-left space-y-5">
            {/* Top Label */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-widest uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Exclusive Preview For {doctorName}
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-slate-300 text-[10px] font-bold tracking-widest uppercase shadow-sm">
                <Lock className="w-3 h-3 text-slate-400" /> Hidden from patients
              </div>
            </div>

            {/* Headline */}
            <h3 className="text-2xl sm:text-4xl font-black text-white leading-[1.15] tracking-tight drop-shadow-sm">
              Your clinic deserves more than <br className="hidden xl:block" /> a simple booking link.
            </h3>

            {/* Territorial Exclusivity FOMO */}
            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Get booked online <strong className="text-white">24/7/365</strong> while effortlessly managing your scheduled offline walk-ins. We're onboarding select clinics in your area. Don't let another clinic claim the local advantage first. 
            </p>

            {/* B2B USPs Flex Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-2">
               <div className="flex items-center gap-1.5 bg-teal-950/50 border border-teal-700/50 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-50 backdrop-blur-sm">
                 <Users className="w-3.5 h-3.5 text-blue-300" /> Walk-in + Online Bookings
               </div>
               <div className="flex items-center gap-1.5 bg-teal-950/50 border border-teal-700/50 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-50 backdrop-blur-sm">
                 <Edit3 className="w-3.5 h-3.5 text-amber-300" /> Keep your classic Rx Pad
               </div>
               <div className="flex items-center gap-1.5 bg-teal-950/50 border border-teal-700/50 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-50 backdrop-blur-sm">
                 <Settings className="w-3.5 h-3.5 text-sky-300" /> Fully Editable (Photo, Fee, Timings)
               </div>
               <div className="flex items-center gap-1.5 bg-teal-950/50 border border-teal-700/50 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-50 backdrop-blur-sm">
                 <QrCode className="w-3.5 h-3.5 text-purple-300" /> QR Standees
               </div>
               <div className="flex items-center gap-1.5 bg-teal-950/50 border border-teal-700/50 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-50 backdrop-blur-sm">
                 <MapPin className="w-3.5 h-3.5 text-emerald-300" /> Google Maps Boost
               </div>
               <div className="flex items-center gap-1.5 bg-teal-950/50 border border-teal-700/50 px-3 py-1.5 rounded-xl text-xs font-bold text-teal-50 backdrop-blur-sm">
                 <Camera className="w-3.5 h-3.5 text-pink-400" /> Insta Integration
               </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex-shrink-0 w-full lg:w-[360px] flex flex-col items-center gap-4 bg-teal-950/60 p-6 rounded-3xl border border-teal-600/30 backdrop-blur-md relative overflow-hidden shadow-2xl">
             
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/10 blur-[40px] pointer-events-none" />

             <h4 className="text-lg font-black text-white text-center leading-tight">
               See what <span className="text-[#25D366]">{clinicName}</span> could get.
             </h4>
             
             <button 
               onClick={handleInterest}
               disabled={isLoading}
               className="group relative flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-[#25D366] text-teal-950 rounded-2xl font-black text-[15px] shadow-[0_0_30px_-5px_rgba(37,211,102,0.4)] hover:bg-[#22c35e] hover:shadow-[0_0_40px_-5px_rgba(37,211,102,0.6)] active:scale-[0.98] transition-all duration-300 disabled:opacity-80"
             >
               {isLoading ? (
                 <>
                   <span className="w-5 h-5 border-2 border-teal-950/40 border-t-teal-950 rounded-full animate-spin" />
                   Connecting...
                 </>
               ) : (
                 <>
                   <WhatsAppIcon className="w-5 h-5" />
                   WhatsApp Founder
                   <MoveRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-70" />
                 </>
               )}
             </button>

             <p className="text-[11px] text-teal-100/70 font-medium text-center px-4 leading-relaxed">
               Skip the queue. Chat directly with the founder to claim your local advantage.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
