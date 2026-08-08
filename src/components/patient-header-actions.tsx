"use client";

import { Languages } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PatientHeaderActionsProps {
  themeColor: string;
  clinicName: string;
}

export function PatientHeaderActions({ themeColor, clinicName }: PatientHeaderActionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams.get("lang") === "hi" ? "hi" : "en";

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "hi" : "en";
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", newLang);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label="Toggle language"
        className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1.5 rounded-full transition-all hover:bg-slate-100 active:scale-95 border border-slate-200/80 bg-white text-slate-700 shadow-2xs"
      >
        <Languages className="w-3.5 h-3.5 text-slate-500" />
        <span className="uppercase">{currentLang === "en" ? "EN" : "HI"}</span>
      </button>
    </>
  );
}
