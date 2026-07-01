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

  if (logoUrl && !hasError) {
    return (
      <Image
        src={logoUrl}
        alt={clinicName}
        fill
        sizes="(max-width: 640px) 80px, 96px"
        className="object-cover"
        onError={() => setHasError(true)}
      />
    );
  }

  return <span>{initial}</span>;
}
