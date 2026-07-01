"use client";

import { useState } from "react";

interface ClinicLogoImageProps {
  logoUrl?: string | null;
  clinicName: string;
  initial: string;
}

/** Thin client wrapper — only handles onError for the <img> tag. */
export function ClinicLogoImage({ logoUrl, clinicName, initial }: ClinicLogoImageProps) {
  const [hasError, setHasError] = useState(false);

  if (logoUrl && !hasError) {
    return (
      <img
        src={logoUrl}
        alt={clinicName}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
      />
    );
  }

  return <span>{initial}</span>;
}
