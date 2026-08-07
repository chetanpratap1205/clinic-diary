"use client";

import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { buttonVariants } from "@/components/ui/button";
import { Settings, CalendarClock, ExternalLink, CalendarDays } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  bookingUrl: string;
}

export function QuickActions({ bookingUrl }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {/* Booking Link Pill */}
      <div className="flex items-center bg-white/60 border border-slate-200/80 p-1 rounded-xl shadow-sm backdrop-blur-md max-w-full overflow-hidden">
        <span className="text-xs font-semibold text-slate-500 px-3 truncate shrink" title={bookingUrl}>
          Booking Link
        </span>
        <CopyLinkButton url={bookingUrl} className="h-8 text-xs bg-white hover:bg-slate-50 border-slate-200 shadow-sm shrink-0 rounded-lg" />
      </div>

      <div className="h-8 w-[1px] bg-slate-200/60 hidden sm:block mx-1" />

      {/* Quick Links */}
      <Link 
        href="/dashboard/settings/availability"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10 rounded-xl bg-white/60 backdrop-blur-md border-slate-200/80 shadow-sm hover:bg-white text-slate-700 font-semibold gap-1.5 hidden sm:flex")}
      >
        <CalendarClock className="w-4 h-4 text-emerald-500" />
        Edit Timings
      </Link>
      
      <Link 
        href="/dashboard/settings/clinic"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-10 rounded-xl bg-white/60 backdrop-blur-md border-slate-200/80 shadow-sm hover:bg-white text-slate-700 font-semibold gap-1.5 hidden sm:flex")}
      >
        <Settings className="w-4 h-4 text-indigo-500" />
        Settings
      </Link>

      <a 
        href={bookingUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={cn(buttonVariants({ size: "sm" }), "h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-1.5 shadow-md hidden lg:flex")}
      >
        View App <ExternalLink className="w-4 h-4 opacity-80" />
      </a>
    </div>
  );
}
