"use client";

import { useState } from "react";

interface ClinicLogoProps {
  logoUrl?: string | null;
  clinicName: string;
  themeColor: string;
  /** hero = large circle; widget = small rounded square */
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
  const [hasError, setHasError] = useState(false);

  const initial = clinicName?.[0]?.toUpperCase() || "C";
  const showImage = logoUrl && !hasError;

  if (variant === "hero") {
    return (
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white/30 shadow-2xl flex items-center justify-center font-black text-white text-3xl sm:text-4xl flex-shrink-0 overflow-hidden ${className}`}
        style={{ backgroundColor: `${themeColor}99` }}
      >
        {showImage ? (
          <img
            src={logoUrl!}
            alt={clinicName}
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    );
  }

  // widget variant — small rounded square for the booking card header strip
  return (
    <div
      className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-black overflow-hidden ${className}`}
      style={{ backgroundColor: themeColor }}
    >
      {showImage ? (
        <img
          src={logoUrl!}
          alt={clinicName}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
