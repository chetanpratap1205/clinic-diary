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
  const [showIOSModal, setShowIOSModal] = useState(false);

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
      setShowIOSModal(true);
    } else if (platform === "android") {
      handleAndroidInstall();
    } else {
      toast.info(
        lang === "hi" 
          ? "ऐप इंस्टॉल करने के लिए कृपया अपने मोबाइल पर क्रोम (Chrome) या सफारी (Safari) ब्राउज़र का उपयोग करें।" 
          : "Please open this page in Chrome (Android) or Safari (iOS) on your mobile device to install the app.",
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

      {/* Premium iOS Instructions Bottom Sheet */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowIOSModal(false)}
          />
          <div className="relative bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            {/* Handle bar for mobile */}
            <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            <div className="p-6 pt-4 sm:pt-6 space-y-6">
              {/* App Icon Preview Area */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={clinicName}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-lg border border-slate-100"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl text-white shadow-lg font-black text-3xl"
                      style={{ backgroundColor: themeColor }}
                    >
                      {clinicName.charAt(0)}
                    </div>
                  )}
                  {/* Fake iOS notification badge just for premium feel */}
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full border-2 border-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{displayName}</h3>
                  <p className="text-sm font-semibold text-slate-500 mt-0.5">Official Clinic App</p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-slate-600 text-lg border border-slate-200">
                    <span className="mb-1">📤</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">1. Tap Share</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">Tap the share button in Safari's bottom menu bar.</p>
                  </div>
                </div>
                
                <div className="h-px bg-slate-200/60 w-full" />
                
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-slate-600 text-lg border border-slate-200">
                    <span className="mb-0.5">➕</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">2. Add to Home Screen</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">Scroll down the menu and tap 'Add to Home Screen'.</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-4 rounded-xl text-white font-bold text-sm shadow-md active:scale-95 transition-transform"
                style={{ backgroundColor: themeColor }}
              >
                I understand, let's do it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

