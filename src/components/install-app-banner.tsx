"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, Sparkles, X } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PWAInstallGuideModal } from "@/components/pwa-install-guide-modal";

interface InstallAppBannerProps {
  clinicName: string;
  logoUrl?: string | null;
  themeColor?: string;
  lang?: Language;
}

export function InstallAppBanner({
  clinicName,
  logoUrl,
  themeColor = "#0ea5e9",
  lang = "en",
}: InstallAppBannerProps) {
  const {
    platform,
    isInstalling,
    isInstalled,
    triggerInstall,
    isGuideOpen,
    closeGuide,
    canNativeInstall,
  } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);
  const isHindi = lang === "hi";

  if (isInstalled || platform === "unknown" || isDismissed) {
    return (
      <PWAInstallGuideModal
        isOpen={isGuideOpen}
        onClose={closeGuide}
        clinicName={clinicName}
        logoUrl={logoUrl}
        themeColor={themeColor}
        platform={platform}
        lang={lang}
      />
    );
  }

  return (
    <>
      <div
        className="w-full bg-white/95 backdrop-blur-md border-b shadow-xs relative z-30 transition-all duration-300"
        style={{ borderColor: `${themeColor}25` }}
      >
        <div
          className="h-[2px] w-full"
          style={{
            background: `linear-gradient(90deg, ${themeColor}, ${themeColor}60)`,
          }}
        />

        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-2 sm:py-2.5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shrink-0 shadow-2xs ring-1 ring-black/5 flex items-center justify-center text-white font-extrabold text-xs sm:text-sm"
                style={{ backgroundColor: logoUrl ? "white" : themeColor }}
              >
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={clinicName}
                    width={36}
                    height={36}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{clinicName.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs sm:text-sm font-black text-slate-900 truncate">
                    {clinicName} App
                  </p>
                  <span
                    className="hidden xs:inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider text-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    Free
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {isHindi
                    ? canNativeInstall
                      ? "One-tap install ready"
                      : "Home screen steps available"
                    : canNativeInstall
                    ? "One-tap install ready"
                    : "Home screen steps available"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={triggerInstall}
                disabled={isInstalling}
                className="px-3.5 sm:px-4 py-1.5 rounded-full text-white text-[11px] sm:text-xs font-black shadow-xs active:scale-95 transition-all disabled:opacity-70 flex items-center gap-1.5 cursor-pointer hover:opacity-95"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}e6)`,
                }}
              >
                {isInstalling ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>
                  {isInstalling
                    ? "Opening..."
                    : canNativeInstall
                    ? "Install App"
                    : "Steps"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Dismiss banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
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
