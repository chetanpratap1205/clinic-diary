"use client";

import Image from "next/image";
import { CheckCircle2, Download, Smartphone, Sparkles, Zap } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { DICTIONARY } from "@/lib/i18n";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PWAInstallGuideModal } from "@/components/pwa-install-guide-modal";

interface InstallAppSectionProps {
  clinicName: string;
  logoUrl?: string | null;
  themeColor?: string;
  lang?: Language;
}

export function InstallAppSection({
  clinicName,
  logoUrl,
  themeColor = "#0ea5e9",
  lang = "en",
}: InstallAppSectionProps) {
  const t = DICTIONARY[lang];
  const {
    platform,
    isInstalling,
    isInstalled,
    triggerInstall,
    isGuideOpen,
    closeGuide,
    canNativeInstall,
  } = usePWAInstall();

  const isHindi = lang === "hi";
  const installCopy = canNativeInstall
    ? isHindi
      ? "Chrome me one-tap install ready hai. Home screen se booking aur live token tracking turant khulega."
      : "One-tap install is ready in this browser. Open booking and live token tracking directly from the home screen."
    : isHindi
      ? "Is device ke liye best install steps dikhayenge. iPhone par Safari share sheet use hoti hai."
      : "Add this clinic app to your home screen with the best steps for this device.";
  const ctaLabel = canNativeInstall
    ? isHindi
      ? "Clinic App Install Karein"
      : "Install Clinic App"
    : isHindi
      ? "Clinic App Add Karein"
      : "Add Clinic App";

  if (isInstalled) {
    return (
      <div className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold shadow-2xs">
        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{t.installAlreadyDone || "Clinic App is Installed on Your Device"}</span>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] p-6 sm:p-8 text-center"
        style={{
          background: `linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, ${themeColor}08 100%)`,
        }}
      >
        <div
          className="absolute top-0 inset-x-0 h-[3px] rounded-t-[2rem]"
          style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}80)` }}
        />

        <div className="flex justify-center mb-4">
          <div
            className="w-14 h-14 rounded-2xl shadow-lg ring-2 ring-white overflow-hidden flex items-center justify-center text-white font-black text-xl"
            style={{ backgroundColor: logoUrl ? "white" : themeColor }}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={clinicName}
                width={56}
                height={56}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{clinicName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200/60 mb-2.5">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Official Clinic Web App</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">
          {isHindi ? `${clinicName} App Add Karein` : `Add ${clinicName} App`}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto mb-6 leading-relaxed">
          {installCopy}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-lg mx-auto text-[11px] font-bold text-slate-600">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{canNativeInstall ? "One-tap ready" : "Fast booking"}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <Smartphone className="w-3.5 h-3.5 text-sky-500" />
            <span>Live queue tracker</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>No Play Store</span>
          </div>
        </div>

        <button
          id="pwa-install-section-button"
          type="button"
          onClick={triggerInstall}
          disabled={isInstalling}
          aria-label={ctaLabel}
          data-pwa-install="true"
          className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-black text-sm shadow-lg active:scale-[0.98] transition-all duration-150 disabled:opacity-70 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
            boxShadow: `0 8px 24px -6px ${themeColor}60`,
          }}
        >
          {isInstalling ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>{isHindi ? "Opening..." : "Opening..."}</span>
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4" />
              <span>{ctaLabel}</span>
            </>
          )}
        </button>
      </div>

      <PWAInstallGuideModal
        isOpen={isGuideOpen}
        onClose={closeGuide}
        clinicName={clinicName}
        logoUrl={logoUrl}
        themeColor={themeColor}
        platform={platform}
        lang={lang}
      />
    </>
  );
}
