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
    const waUrl = "https://wa.me/918077170715?text=" + encodeURIComponent(`Hi Doctor Diary, I am ${doctorName}. I want to claim the free QR Kit and booking page for ${clinicName}. Let's talk.`);
    window.location.href = waUrl;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 mt-6 relative z-10">
      <div className="relative rounded-[2rem] p-6 sm:p-8 overflow-hidden shadow-2xl border border-teal-700/50 bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900">
        
        {/* Abstract Tech Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-[80px] pointer-events-none translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
               <img src="/icon-192.png" alt="Doctor Diary" className="w-8 h-8 rounded-lg shadow-md" />
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black tracking-widest uppercase shadow-sm">
                 <Lock className="w-3 h-3" /> Private Preview
               </div>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
              Claim this booking page &<br className="hidden lg:block" /> your free Smart QR Kit.
            </h3>

            <div className="mt-6 space-y-4 max-w-xl mx-auto md:mx-0 text-left">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-teal-800/50 p-2 rounded-xl border border-teal-700/50 shrink-0"><MapPin className="w-4 h-4 text-emerald-400" /></div>
                <p className="text-teal-50 text-sm leading-relaxed font-medium"><strong className="text-white">Grow Everywhere:</strong> Place this link on Google Maps, social media, and share it with your existing patients.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-teal-800/50 p-2 rounded-xl border border-teal-700/50 shrink-0"><QrCode className="w-4 h-4 text-emerald-400" /></div>
                <p className="text-teal-50 text-sm leading-relaxed font-medium"><strong className="text-white">Free QR Standees:</strong> Display inside and outside your clinic. Walk-in and online patients book 24x7 based strictly on your timings.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-teal-800/50 p-2 rounded-xl border border-teal-700/50 shrink-0"><Settings className="w-4 h-4 text-emerald-400" /></div>
                <p className="text-teal-50 text-sm leading-relaxed font-medium"><strong className="text-white">100% Customizable:</strong> Your profile, your timings, your consultation fees—you control absolutely everything.</p>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center gap-3">
             <button 
               onClick={handleInterest}
               disabled={isLoading}
               className="group relative flex items-center justify-center gap-3 w-full md:w-64 py-4 px-6 bg-[#25D366] text-slate-950 rounded-2xl font-black text-[16px] shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:bg-[#22c35e] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 disabled:opacity-80"
             >
               {isLoading ? (
                 <>
                   <span className="w-5 h-5 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin" />
                   Connecting...
                 </>
               ) : (
                 <>
                   <WhatsAppIcon className="w-6 h-6 shrink-0 text-slate-950" />
                   <span>Claim QR Kit & Talk to Expert</span>
                 </>
               )}
             </button>
             <p className="text-xs text-teal-200/60 font-semibold text-center">
               Connect directly with our team.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
