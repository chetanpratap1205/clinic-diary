"use client";

import { useState } from "react";

interface ClinicLogoProps {
  logoUrl?: string | null;
  clinicName: string;
  themeColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 rounded-xl text-sm",
  md: "w-14 h-14 rounded-2xl text-xl",
  lg: "w-24 h-24 sm:w-28 sm:h-28 rounded-3xl text-3xl sm:text-4xl",
};

export function ClinicLogo({
  logoUrl,
  clinicName,
  themeColor,
  size = "lg",
  className = "",
}: ClinicLogoProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClass = sizeMap[size];
  const initial = clinicName?.[0]?.toUpperCase() || "C";

  const showImage = logoUrl && !hasError;

  return (
    <div
      className={`${sizeClass} flex-shrink-0 flex items-center justify-center font-black text-white shadow-2xl border-4 border-white/30 overflow-hidden ${className}`}
      style={{ backgroundColor: themeColor }}
    >
      {showImage ? (
        <img
          src={logoUrl}
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
