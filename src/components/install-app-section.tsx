"use client";

import { useState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { DICTIONARY } from "@/lib/i18n";
import { toast } from "sonner";

import { usePWAInstall } from "@/hooks/use-pwa-install";

interface InstallAppSectionProps {
  clinicName: string;
  logoUrl?: string | null;
  themeColor?: string;
  lang: Language;
}

export function InstallAppSection({
  clinicName,
  logoUrl,
  themeColor = "#0ea5e9",
  lang,
}: InstallAppSectionProps) {
  const t = DICTIONARY[lang];
  const { platform, isInstalling, isInstalled, handleAndroidInstall } = usePWAInstall();

  // If already installed — show a small success badge
  if (isInstalled) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        {t.installAlreadyDone}
      </div>
    );
  }

  const handleInstallClick = () => {
    if (platform === "ios") {
      toast.success(
        lang === "hi" 
          ? "शेयर (Share) 📤 पर टैप करें और 'Add to Home Screen' ➕ चुनें" 
          : "Tap Share 📤 then 'Add to Home Screen' ➕ to install",
        {
          duration: 6000,
          position: "top-center",
        }
      );
    } else if (platform === "android_manual") {
      toast.success(
        lang === "hi" 
          ? "मेनू (⋮) पर टैप करें और 'Install app' 📱 चुनें" 
          : "Tap Menu (⋮) then 'Install app' 📱 to install",
        {
          duration: 6000,
          position: "top-center",
        }
      );
    } else if (platform === "android") {
      handleAndroidInstall();
    } else if (platform === "desktop") {
      toast.info(
        lang === "hi" 
          ? "एड्रेस बार (URL) में दिख रहे 'Install' (↓) आइकन पर क्लिक करके ऐप डाउनलोड करें।" 
          : "Click the Install icon (↓) in your browser's address bar to download.",
        {
          duration: 6000,
          position: "top-center",
        }
      );
    } else {
      toast.info(
        lang === "hi" 
          ? "इंस्टॉल प्रॉम्प्ट उपलब्ध नहीं है। कृपया सफारी या क्रोम का उपयोग करें और सुनिश्चित करें कि आप 'Private' या 'Incognito' मोड में नहीं हैं।" 
          : "Install prompt not available. Ensure you're not in Incognito/Private mode, or try using Chrome/Safari.",
        {
          duration: 5000,
          position: "top-center",
        }
      );
    }
  };

  const displayName = clinicName.length > 18 ? `${clinicName.slice(0, 16)}...` : clinicName;

  return (
    <>
      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] animate-in fade-in slide-in-from-bottom-4 duration-700 p-6 sm:p-8 text-center"
        style={{
          background: `linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, ${themeColor}08 100%)`,
        }}
      >
        <div
          className="absolute top-0 inset-x-0 h-[3px] rounded-t-[2rem]"
          style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}80)` }}
        />
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">
          {lang === "hi" ? "क्लिनिक ऐप डाउनलोड करें" : "Download Clinic App"}
        </h2>
        <p className="text-sm text-slate-500 font-medium mb-6">
          {lang === "hi" 
            ? "तेज़ बुकिंग और लाइव कतार ट्रैकिंग के लिए 1-टैप में ऐप इंस्टॉल करें।" 
            : "Get 1-tap fast booking and live queue tracking on your phone."}
        </p>

        <button
          onClick={handleInstallClick}
          disabled={isInstalling || platform === "unknown"}
          className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg active:scale-[0.98] transition-all duration-150 disabled:opacity-70"
          style={{
            background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
            boxShadow: `0 8px 24px -6px ${themeColor}60`,
          }}
        >
          {isInstalling ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {lang === "hi" ? "डाउनलोड हो रहा है..." : "Downloading..."}
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              {lang === "hi" ? "डाउनलोड क्लिनिक" : "Download Clinic"}
            </>
          )}
        </button>
      </div>
    </>
  );
}

