"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface PatientHeaderActionsProps {
  themeColor: string;
  clinicName: string;
}

export function PatientHeaderActions({ themeColor, clinicName }: PatientHeaderActionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLang = searchParams.get("lang") === "hi" ? "hi" : "en";

  // On first load: if no ?lang param in URL, apply the stored preference from localStorage.
  // This means once a patient switches to Hindi, they stay in Hindi on future visits.
  useEffect(() => {
    if (searchParams.get("lang")) return; // URL already has an explicit lang — respect it
    try {
      const stored = localStorage.getItem("preferred_lang");
      if (stored === "hi") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lang", "hi");
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    } catch {
      // localStorage not available (private browsing, etc.) — silently ignore
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "hi" : "en";
    const params = new URLSearchParams(searchParams.toString());
    params.set("lang", newLang);
    try {
      localStorage.setItem("preferred_lang", newLang);
    } catch {
      // localStorage not available — toggle still works for the current session
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleLanguage}
        aria-label="Toggle language between Hindi and English"
        className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1.5 rounded-full transition-all hover:bg-slate-100 active:scale-95 border border-slate-200/80 bg-white text-slate-700 shadow-2xs"
      >
        {currentLang === "en" ? "हिंदी में देखें" : "See in English"}
      </button>
    </>
  );
}
