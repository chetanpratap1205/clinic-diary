"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Booking boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-slate-50 px-4 text-center">
      <div className="bg-white p-8 sm:p-12 rounded-[2rem] shadow-xl max-w-md w-full border border-slate-100">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Oops! Something went wrong.
        </h2>
        <p className="text-slate-500 text-sm mb-8 leading-relaxed">
          We couldn't load this booking page. Please try refreshing or check back in a few minutes.
        </p>
        
        <Button 
          onClick={reset} 
          className="w-full rounded-xl h-12 font-bold flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all active:scale-95"
        >
          <RefreshCcw className="w-4 h-4" />
          Refresh Page
        </Button>

        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-3 bg-slate-100 rounded-xl text-left overflow-auto w-full text-[10px] font-mono text-slate-700">
            <p className="font-bold mb-1">Developer details:</p>
            <p>{error.message}</p>
          </div>
        )}
      </div>
      <p className="text-center text-xs font-semibold text-slate-400 mt-8">
        Powered by Doctor Diary by NatureXpress
      </p>
    </div>
  );
}
