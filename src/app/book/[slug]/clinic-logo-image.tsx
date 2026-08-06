"use client";

import { useState } from "react";

import Image from "next/image";

interface ClinicLogoImageProps {
  logoUrl?: string | null;
  clinicName: string;
  initial: string;
}

/** Thin client wrapper — only handles onError for the <img> tag. */
export function ClinicLogoImage({ logoUrl, clinicName, initial }: ClinicLogoImageProps) {
  const [hasError, setHasError] = useState(false);

  // Do not display platform default logo on white-labeled tenant pages (Point 13)
  const isPlatformDefault = logoUrl && (logoUrl.includes("naturexpress") || logoUrl.includes("doctor-diary-default"));
  const isValidLogo = logoUrl && !isPlatformDefault && !hasError;

  if (isValidLogo) {
    return (
      <Image
        src={logoUrl}
        alt={clinicName}
        fill
        sizes="(max-width: 640px) 80px, 96px"
        className="object-contain p-0.5 rounded-lg overflow-hidden"
        unoptimized
        onError={() => setHasError(true)}
      />
    );
  }

  return <span className="font-black drop-shadow-sm select-none">{initial}</span>;
}
