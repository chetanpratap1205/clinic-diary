"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

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
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight transition-all">
        Good {greeting}, {displayName} 👋
      </h1>
      <p className="text-slate-500 mt-1 text-sm sm:text-base transition-all">
        {format(date, "EEEE, MMMM d, yyyy")}
      </p>
    </div>
  );
}
