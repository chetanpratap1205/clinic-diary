import { QrCode } from "lucide-react";

export default function QrComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Animated QR icon */}
        <div className="relative inline-flex mb-8">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative w-24 h-24 bg-indigo-900/60 border border-indigo-500/30 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-xl">
            <QrCode className="w-12 h-12 text-indigo-300" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-white mb-3 leading-tight">
          Almost Ready!
        </h1>
        <p className="text-slate-400 text-base leading-relaxed mb-8">
          This booking portal is being set up. Check back soon!
        </p>

        <div className="flex items-center justify-center gap-2 text-slate-500">
          <QrCode className="w-4 h-4" />
          <p className="text-xs">Powered by <span className="font-bold text-slate-400">ClinicDiary</span></p>
        </div>
      </div>
    </div>
  );
}
