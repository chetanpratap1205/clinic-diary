"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface AnimatedLogoProps {
  /** "dark" = white text (for use on dark panels), "light" = dark text (for use on white panels) */
  theme?: "dark" | "light";
  /** Optional sub-label below the name, e.g. "Field Partner Portal" */
  subLabel?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Whether to link to / */
  linked?: boolean;
  /** Disable animation */
  noAnimation?: boolean;
}

const sizeMap = {
  sm: { icon: "w-9 h-9",   name: "text-lg",  sub: "text-[9px]"  },
  md: { icon: "w-11 h-11", name: "text-xl",  sub: "text-[10px]" },
  lg: { icon: "w-14 h-14", name: "text-2xl", sub: "text-[11px]" },
};

function LogoInner({
  theme = "light",
  subLabel,
  size = "md",
  noAnimation = false,
}: Omit<AnimatedLogoProps, "linked">) {
  const s = sizeMap[size];
  const nameColor = theme === "dark" ? "text-white" : "text-slate-900";
  const subColor  = theme === "dark" ? "text-teal-300" : "text-teal-600";

  return (
    <div className="inline-flex items-center gap-2.5">
      {/* Icon — no background wrapper, the icon PNG carries its own shape */}
      {noAnimation ? (
        <div className={`${s.icon} relative shrink-0`}>
          <span
            className="absolute inset-0 rounded-[22%] opacity-30 blur-[6px]"
            style={{ background: "linear-gradient(135deg, #14b8a6, #6366f1)" }}
            aria-hidden
          />
          <img
            src="/icon-192.png"
            alt="Doctor Diary logo"
            className="relative w-full h-full object-contain drop-shadow-md"
            draggable={false}
          />
        </div>
      ) : (
        <motion.div
          className={`${s.icon} relative shrink-0`}
          initial={{ opacity: 0, scale: 0.7, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring" as const, stiffness: 350, damping: 22, delay: 0.05 }}
        >
          <span
            className="absolute inset-0 rounded-[22%] opacity-30 blur-[6px]"
            style={{ background: "linear-gradient(135deg, #14b8a6, #6366f1)" }}
            aria-hidden
          />
          <img
            src="/icon-192.png"
            alt="Doctor Diary logo"
            className="relative w-full h-full object-contain drop-shadow-md"
            draggable={false}
          />
        </motion.div>
      )}

      {/* Text */}
      {noAnimation ? (
        <div className="flex flex-col leading-none">
          <span className={`font-black tracking-tight ${nameColor} ${s.name}`}>
            Doctor Diary
          </span>
          {subLabel && (
            <span className={`font-bold uppercase tracking-[0.18em] mt-0.5 ${subColor} ${s.sub}`}>
              {subLabel}
            </span>
          )}
        </div>
      ) : (
        <motion.div
          className="flex flex-col leading-none"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" as const, delay: 0.18 }}
        >
          <span className={`font-black tracking-tight ${nameColor} ${s.name}`}>
            Doctor Diary
          </span>
          {subLabel && (
            <span className={`font-bold uppercase tracking-[0.18em] mt-0.5 ${subColor} ${s.sub}`}>
              {subLabel}
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}

export function AnimatedLogo({ linked = true, ...props }: AnimatedLogoProps) {
  if (!linked) {
    return <LogoInner {...props} />;
  }
  return (
    <Link href="/" className="inline-flex items-center w-fit focus-visible:outline-none">
      <LogoInner {...props} />
    </Link>
  );
}
