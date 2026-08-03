import { Loader2, Activity } from "lucide-react";

export default function BookingLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
      
      {/* Background Mesh (Subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full opacity-10 blur-[100px] mix-blend-multiply bg-emerald-500 animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full opacity-10 blur-[100px] mix-blend-multiply bg-blue-500 animate-[pulse_5s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] p-8 sm:p-12 w-full max-w-md mx-auto flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Shimmer overlay */}
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12" />

        <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm mb-6 relative">
          <Activity className="w-8 h-8 text-slate-400 animate-pulse" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center">
            <Loader2 className="w-3 h-3 text-emerald-500 animate-spin" />
          </div>
        </div>

        <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">
          Loading Clinic Experience...
        </h2>
        
        <p className="text-sm font-medium text-slate-500 mb-8 max-w-[250px]">
          Connecting to live queue system and fetching availability slots.
        </p>

        {/* Skeleton lines */}
        <div className="w-full space-y-3 opacity-60">
          <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse delay-75" />
          <div className="h-12 w-full bg-slate-100 rounded-xl animate-pulse delay-150" />
        </div>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs font-bold text-slate-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Powered by Doctor Diary
      </div>
    </div>
  );
}
