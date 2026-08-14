"use client";

import { CopyLinkButton } from "@/components/dashboard/copy-link-button";

interface QuickActionsProps {
  bookingUrl: string;
}

export function QuickActions({ bookingUrl }: QuickActionsProps) {
  return (
    <div className="flex items-center justify-end">
      {/* Booking Link Pill */}
      <div className="flex items-center bg-white/60 border border-slate-200/80 p-1 rounded-xl shadow-sm backdrop-blur-md max-w-full overflow-hidden">
        <span className="text-xs font-semibold text-slate-500 px-3 truncate shrink hidden sm:inline-block" title={bookingUrl}>
          Booking Link
        </span>
        <CopyLinkButton url={bookingUrl} />
      </div>
    </div>
  );
}
