"use client";

import Link from "next/link";
import { Activity, WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ minHeight: "100dvh" }}
    >
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-slate-200/30 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-slate-300/20 blur-[100px] -z-10" />

      <div className="text-center max-w-sm w-full">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            Doctor Diary
          </span>
        </Link>

        {/* Offline icon */}
        <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-slate-400" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
          You&apos;re offline
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8">
          Please check your internet connection and try again. Your data is safe
          and will sync when you&apos;re back online.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md shadow-teal-700/20 transition-all active:scale-[0.98]"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
