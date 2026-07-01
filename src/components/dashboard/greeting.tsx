"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

import { Stethoscope } from "lucide-react";

export function Greeting({ displayName }: { displayName: string }) {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    // Update every minute to catch hour changes and day changes
    const interval = setInterval(() => {
      setDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const hour = date.getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight transition-all flex items-center gap-3">
        Good {greeting}, {displayName}
        <div className="bg-sky-50 p-1.5 rounded-xl border border-sky-100/60 shadow-sm flex-shrink-0">
          <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-sky-600" strokeWidth={2} />
        </div>
      </h1>
      <p className="text-slate-500 mt-1.5 text-sm sm:text-base font-medium transition-all flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        {format(date, "EEEE, MMMM d, yyyy")}
      </p>
    </div>
  );
}
