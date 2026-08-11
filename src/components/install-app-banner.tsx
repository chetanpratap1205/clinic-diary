"use client";

import { useState } from "react";
import { Download, Monitor, X, ChevronDown, ChevronUp } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { DICTIONARY } from "@/lib/i18n";
import { usePWAInstall } from "@/hooks/use-pwa-install";

interface InstallAppBannerProps {
  clinicName: string;
  logoUrl?: string | null;
  themeColor?: string;
  lang: Language;
}

export function InstallAppBanner({
  clinicName,
  logoUrl,
  themeColor = "#0ea5e9",
  lang,
}: InstallAppBannerProps) {
  const t = DICTIONARY[lang];
  const { platform, isInstalling, isInstalled, handleAndroidInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpandedIOS, setIsExpandedIOS] = useState(false);

  // If already installed, don't show the intrusive banner at the top
  if (isInstalled || platform === "unknown" || isDismissed) return null;

  return (
    <div 
      className="w-full bg-white border-b shadow-sm sticky top-0 z-[100] animate-in slide-in-from-top-4 duration-500"
      style={{ borderColor: `${themeColor}20` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: App Icon & Text */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-sm ring-1 ring-black/5 flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: logoUrl ? "transparent" : themeColor }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt={clinicName} className="w-full h-full object-cover" />
              ) : (
                <span>{clinicName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-black text-slate-900 truncate">
                {clinicName} App
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                {lang === "hi" ? "तेज़ बुकिंग के लिए इंस्टॉल करें" : "Install for faster booking"}
              </p>
            </div>
          </div>

          {/* Right: Install Action & Dismiss */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {platform === "android" && (
              <button
                onClick={handleAndroidInstall}
                disabled={isInstalling}
                className="px-4 py-1.5 rounded-full text-white text-[11px] sm:text-xs font-black shadow-md active:scale-95 transition-all disabled:opacity-70 flex items-center gap-1.5"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                }}
              >
                {isInstalling ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {t.installAndroidCta}
              </button>
            )}

            {platform === "ios" && (
              <button
                onClick={() => setIsExpandedIOS(!isExpandedIOS)}
                className="px-3 py-1.5 rounded-full text-white text-[11px] sm:text-xs font-black shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                }}
              >
                {t.installAndroidCta} {/* "Install App" generic text */}
                {isExpandedIOS ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}

            {platform === "desktop" && (
              <div className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-bold flex items-center gap-1.5">
                <Monitor className="w-3 h-3" />
                {lang === "hi" ? "डेस्कटॉप ऐप" : "Desktop App"}
              </div>
            )}

            <button
              onClick={() => setIsDismissed(true)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors ml-1"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Expanded iOS Instructions Dropdown */}
        {platform === "ios" && isExpandedIOS && (
          <div className="mt-3 pt-3 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-slate-50 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-lg shadow-sm">📤</div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-700">
                  <span className="font-black text-slate-900">1.</span> {t.installIOSStep1Title}
                </p>
              </div>
              <div className="hidden sm:block text-slate-300">→</div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-lg shadow-sm">➕</div>
                <p className="text-[11px] sm:text-xs font-semibold text-slate-700">
                  <span className="font-black text-slate-900">2.</span> {t.installIOSStep2Title}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
