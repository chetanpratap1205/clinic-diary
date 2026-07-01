/**
 * ClinicLogo — server component shell (no "use client").
 * The outer layout is rendered server-side so SSR and client always match.
 * The <img> with onError is delegated to ClinicLogoImage (client component).
 */

import { ClinicLogoImage } from "./clinic-logo-image";

interface ClinicLogoProps {
  logoUrl?: string | null;
  clinicName: string;
  themeColor: string;
  /** hero = large circle in page header; widget = small square in card strip */
  variant?: "hero" | "widget";
  className?: string;
}

export function ClinicLogo({
  logoUrl,
  clinicName,
  themeColor,
  variant = "hero",
  className = "",
}: ClinicLogoProps) {
  const initial = clinicName?.[0]?.toUpperCase() || "C";

  if (variant === "hero") {
    return (
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/30 shadow-2xl flex items-center justify-center font-black text-white text-3xl sm:text-4xl flex-shrink-0 overflow-hidden ${className}`}
        style={{ backgroundColor: `${themeColor}99` }}
      >
        <ClinicLogoImage logoUrl={logoUrl} clinicName={clinicName} initial={initial} />
      </div>
    );
  }

  // widget variant — small rounded square for the booking card header strip
  return (
    <div
      className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-black overflow-hidden ${className}`}
      style={{ backgroundColor: themeColor }}
    >
      <ClinicLogoImage logoUrl={logoUrl} clinicName={clinicName} initial={initial} />
    </div>
  );
}
