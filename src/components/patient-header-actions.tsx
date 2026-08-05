"use client";

import { useState } from "react";
import { UserCircle, Languages } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { PatientLoginModal } from "./patient-login-modal";

interface PatientHeaderActionsProps {
  themeColor: string;
  clinicName: string;
}

export function PatientHeaderActions({ themeColor, clinicName }: PatientHeaderActionsProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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
        onClick={toggleLanguage}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90 active:scale-95 shadow-sm border border-slate-200/60 bg-white text-slate-700"
      >
        <Languages className="w-3.5 h-3.5 text-slate-500" />
        <span className="uppercase tracking-wider">{currentLang === "en" ? "EN" : "HI"}</span>
      </button>

      <button
        onClick={() => setIsLoginModalOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all hover:opacity-90 active:scale-95 shadow-sm border border-slate-200/60 bg-white text-slate-700"
      >
        <UserCircle className="w-3.5 h-3.5" style={{ color: themeColor }} />
        <span className="hidden sm:inline">{currentLang === "hi" ? "मेरे अपॉइंटमेंट" : "My Appointments"}</span>
        <span className="sm:hidden">{currentLang === "hi" ? "अपॉइंटमेंट" : "Appointments"}</span>
      </button>

      <PatientLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        themeColor={themeColor}
        clinicName={clinicName}
      />
    </>
  );
}
