"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, Monitor, CheckCircle2 } from "lucide-react";
import type { Language } from "@/lib/i18n";
import { DICTIONARY } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios" | "desktop" | "installed" | "unknown";

interface InstallAppSectionProps {
  clinicName: string;
  logoUrl?: string | null;
  themeColor?: string;
  lang: Language;
}

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";

  // Already running as PWA
  if (window.matchMedia("(display-mode: standalone)").matches) return "installed";

  // iOS detection (iPhone, iPad, iPod — Safari doesn't fire beforeinstallprompt)
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
  if (isIOS) return "ios";

  return "desktop"; // Will upgrade to "android" when beforeinstallprompt fires
}

export function InstallAppSection({
  clinicName,
  logoUrl,
  themeColor = "#0ea5e9",
  lang,
}: InstallAppSectionProps) {
  const t = DICTIONARY[lang];
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    if (detected === "installed") setIsInstalled(true);

    // Listen for the Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install (any platform)
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setPlatform("installed");
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleAndroidInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setPlatform("installed");
      }
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // If already installed — show a small success badge instead of nothing (useful UX for doctors)
  if (isInstalled) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        {t.installAlreadyDone}
      </div>
    );
  }

  // Don't render anything during SSR or before detection
  if (platform === "unknown") return null;

  const displayName = clinicName.length > 22 ? `${clinicName.slice(0, 20)}…` : clinicName;

  return (
    <>
      {/* ─── Main Install Card ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.07)] animate-in fade-in slide-in-from-bottom-4 duration-700"
        style={{
          background: `linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, ${themeColor}08 100%)`,
        }}
      >
        {/* Decorative top border in theme color */}
        <div
          className="absolute top-0 inset-x-0 h-[3px] rounded-t-[2rem]"
          style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}80)` }}
        />

        {/* Subtle background glow */}
        <div
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ backgroundColor: themeColor }}
        />

        <div className="relative p-6 sm:p-8">
          {/* Header Row */}
          <div className="flex items-start gap-4">
            {/* App Icon */}
            <div className="relative flex-shrink-0">
              <div
                className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 flex items-center justify-center text-white font-black text-xl"
                style={{ backgroundColor: logoUrl ? "transparent" : themeColor }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={clinicName} className="w-full h-full object-cover" />
                ) : (
                  <span>{clinicName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              {/* Small platform badge */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center ring-1 ring-slate-100">
                {platform === "ios" ? (
                  <span className="text-[9px]"></span>
                ) : platform === "android" ? (
                  <span className="text-[9px]">🤖</span>
                ) : (
                  <Monitor className="w-2.5 h-2.5 text-slate-500" />
                )}
              </div>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                  {t.installHeading}
                </h2>
                {/* Size pill */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-extrabold text-emerald-700 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t.installSizeBadge}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {t.installSubheading}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1 uppercase tracking-wider">
                {displayName} · {t.installOfficialBadge}
              </p>
            </div>
          </div>

          {/* ─── Platform-specific content ─────────────────────────────── */}
          <div className="mt-6">

            {/* ANDROID: 1-tap native install */}
            {platform === "android" && (
              <button
                onClick={handleAndroidInstall}
                disabled={isInstalling}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg active:scale-[0.98] transition-all duration-150 disabled:opacity-70"
                style={{
                  background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`,
                  boxShadow: `0 8px 24px -6px ${themeColor}60`,
                }}
              >
                {isInstalling ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Installing…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    {t.installAndroidCta}
                  </>
                )}
              </button>
            )}

            {/* iOS: Visual step-by-step guide inline */}
            {platform === "ios" && (
              <div className="space-y-3">
                {/* Steps inline (always visible — no modal on iOS, they need to SEE it) */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: themeColor }}
                    >
                      1
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-base">📤</span>
                        {t.installIOSStep1Title}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                        {t.installIOSStep1Sub}
                      </p>
                    </div>
                  </div>

                  {/* Connector arrow */}
                  <div className="flex justify-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-300">
                      <path d="M8 2L8 14M8 14L4 10M8 14L12 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: themeColor }}
                    >
                      2
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-base">➕</span>
                        {t.installIOSStep2Title}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                        {t.installIOSStep2Sub}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Helpful note */}
                <p className="text-[11px] text-slate-400 font-medium text-center leading-relaxed">
                  {lang === "hi"
                    ? "यह एक वेब ऐप है — App Store की जरूरत नहीं, सीधे Safari से इंस्टॉल करें।"
                    : "This is a web app — no App Store needed. Install directly from Safari."}
                </p>
              </div>
            )}

            {/* DESKTOP: Address bar hint */}
            {platform === "desktop" && (
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {t.installDesktopHint}{" "}
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-200 rounded border border-slate-300 text-slate-600 align-middle mx-0.5" style={{ fontSize: "11px", fontWeight: 900 }}>
                      +
                    </span>{" "}
                    {t.installDesktopHint2}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    {lang === "hi"
                      ? "Chrome, Edge, और Brave पर काम करता है।"
                      : "Works on Chrome, Edge, and Brave."}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
