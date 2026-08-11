"use client";

import { useState, useRef, useEffect } from "react";
import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  label: string;
  tooltip: string;
  variant?: "pill" | "pill-sm" | "icon-only";
}

/**
 * VerifiedBadge — tap/click to reveal a tooltip explaining what "verified" means.
 * Closes on outside click/tap. Works on mobile and desktop.
 *
 * Variants:
 *  - "pill"      → white pill with icon + label text (desktop portrait card)
 *  - "pill-sm"   → smaller pill (mobile hero image overlay)
 *  - "icon-only" → bare icon circle (mobile avatar fallback)
 */
export function VerifiedBadge({ label, tooltip, variant = "pill" }: VerifiedBadgeProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onOutside = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [open]);

  const Tooltip = () =>
    open ? (
      <div className="absolute right-0 top-full mt-2 z-[100] w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3.5 pointer-events-auto">
        <div className="flex items-start gap-2.5">
          <BadgeCheck className="w-4 h-4 text-white fill-[#1d9bf0] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{tooltip}</p>
        </div>
      </div>
    ) : null;

  if (variant === "icon-only") {
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="bg-white p-0.5 rounded-full shadow-md cursor-pointer hover:bg-slate-50 transition-colors"
          aria-label="Verified Doctor — tap to learn more"
        >
          <BadgeCheck className="w-7 h-7 text-white fill-[#1d9bf0]" />
        </button>
        <Tooltip />
      </div>
    );
  }

  if (variant === "pill-sm") {
    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
          aria-label="Verified Doctor — tap to learn more"
        >
          <BadgeCheck className="w-3.5 h-3.5 text-white fill-[#1d9bf0]" />
          <span className="text-[9px] font-black text-slate-800">{label}</span>
        </button>
        <Tooltip />
      </div>
    );
  }

  // Default: "pill"
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer hover:bg-white transition-colors"
        aria-label="Verified Doctor — tap to learn more"
      >
        <BadgeCheck className="w-4 h-4 text-white fill-[#1d9bf0]" />
        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{label}</span>
      </button>
      <Tooltip />
    </div>
  );
}
