"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";
import { PWASplashScreen } from "./pwa-splash-screen";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PWAInstallGuideModal } from "@/components/pwa-install-guide-modal";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getCapturedPrompt() {
  if (typeof window === "undefined") return null;
  return window.__pwaDeferredPrompt || null;
}

function clearCapturedPrompt() {
  if (typeof window === "undefined") return;
  window.__pwaDeferredPrompt = null;
  window.dispatchEvent(new CustomEvent("pwa-prompt-consumed"));
}

export function registerServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const register = () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => console.warn("SW registration failed:", err));
  };

  if (document.readyState === "complete") {
    register();
  } else {
    window.addEventListener("load", register, { once: true });
  }
}

export function PWAProvider() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(() => getCapturedPrompt());
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());

  useEffect(() => {
    registerServiceWorker();

    if (isInstalled) {
      return;
    }

    const checkAndTriggerBanner = (prompt: BeforeInstallPromptEvent) => {
      setDeferredPrompt(prompt);

      const lastDismissed = localStorage.getItem("pwa_install_dismissed");
      if (lastDismissed) {
        const dismissedAt = parseInt(lastDismissed, 10);
        const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
        if (daysSince < 3) return;
      }

      window.setTimeout(() => setShowBanner(true), 5000);
    };

    const existingPrompt = getCapturedPrompt();
    if (existingPrompt) {
      checkAndTriggerBanner(existingPrompt);
    }

    const promptReadyHandler = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent | undefined>;
      const prompt = customEvent.detail || getCapturedPrompt();
      if (prompt) {
        checkAndTriggerBanner(prompt);
      }
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      clearCapturedPrompt();
    };

    const promptConsumedHandler = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("pwa-prompt-ready", promptReadyHandler);
    window.addEventListener("appinstalled", installedHandler);
    window.addEventListener("pwa-installed", installedHandler);
    window.addEventListener("pwa-prompt-consumed", promptConsumedHandler);

    return () => {
      window.removeEventListener("pwa-prompt-ready", promptReadyHandler);
      window.removeEventListener("appinstalled", installedHandler);
      window.removeEventListener("pwa-installed", installedHandler);
      window.removeEventListener("pwa-prompt-consumed", promptConsumedHandler);
    };
  }, [isInstalled]);

  const handleInstall = () => {
    const promptEvent = deferredPrompt || getCapturedPrompt();
    if (!promptEvent) return;

    promptEvent
      .prompt()
      .then(() => promptEvent.userChoice)
      .then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          setIsInstalled(true);
          setShowBanner(false);
        }
      })
      .catch((err) => {
        console.warn("PWA install error:", err);
      })
      .finally(() => {
        setDeferredPrompt(null);
        clearCapturedPrompt();
      });
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
    setShowBanner(false);
  };

  const isClinicRoute = pathname?.startsWith("/clinic/");

  return (
    <>
      <PWASplashScreen />
      {!isInstalled && showBanner && deferredPrompt && !isClinicRoute && (
        <div
          className="fixed bottom-20 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[340px] z-50 animate-slide-up"
          role="dialog"
          aria-label="Install Doctor Diary app"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/15 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-500 to-indigo-500" />
            <div className="p-4 flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md border border-slate-200">
                <Image
                  src="/icon-192.png"
                  alt="Doctor Diary"
                  width={44}
                  height={44}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">
                  Install Doctor Diary
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Add to your device for instant access and real-time updates.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0 -mt-0.5 -mr-0.5 cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button
                type="button"
                onClick={handleDismiss}
                className="flex-1 h-9 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={handleInstall}
                className="flex-1 h-9 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Install Free
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function InstallButton({ className = "" }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(() => getCapturedPrompt());
  const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode());

  useEffect(() => {
    if (isInstalled) {
      return;
    }

    const promptReadyHandler = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent | undefined>;
      const prompt = customEvent.detail || getCapturedPrompt();
      if (prompt) {
        setDeferredPrompt(prompt);
      }
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      clearCapturedPrompt();
    };

    const promptConsumedHandler = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener("pwa-prompt-ready", promptReadyHandler);
    window.addEventListener("appinstalled", installedHandler);
    window.addEventListener("pwa-installed", installedHandler);
    window.addEventListener("pwa-prompt-consumed", promptConsumedHandler);

    return () => {
      window.removeEventListener("pwa-prompt-ready", promptReadyHandler);
      window.removeEventListener("appinstalled", installedHandler);
      window.removeEventListener("pwa-installed", installedHandler);
      window.removeEventListener("pwa-prompt-consumed", promptConsumedHandler);
    };
  }, [isInstalled]);

  if (isInstalled || !deferredPrompt) return null;

  const handleInstall = () => {
    const promptEvent = deferredPrompt || getCapturedPrompt();
    if (!promptEvent) return;

    promptEvent
      .prompt()
      .then(() => promptEvent.userChoice)
      .then((choiceResult) => {
        if (choiceResult.outcome === "accepted") setIsInstalled(true);
      })
      .catch((err) => {
        console.warn("Install error:", err);
      })
      .finally(() => {
        setDeferredPrompt(null);
        clearCapturedPrompt();
      });
  };

  return (
    <button
      type="button"
      onClick={handleInstall}
      className={`flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${className}`}
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Install App</span>
      <span className="sm:hidden">Install</span>
    </button>
  );
}

export function PatientInstallButton({
  clinicName,
  logoUrl,
  themeColor = "#0ea5e9",
  className = "",
}: {
  clinicName: string;
  logoUrl?: string | null;
  themeColor?: string;
  className?: string;
}) {
  const {
    platform,
    isInstalling,
    isInstalled,
    triggerInstall,
    isGuideOpen,
    closeGuide,
    canNativeInstall,
  } = usePWAInstall();

  if (isInstalled || platform === "unknown") return null;

  const displayName =
    clinicName.length > 18 ? `${clinicName.slice(0, 16)}...` : clinicName;

  return (
    <>
      <button
        type="button"
        onClick={triggerInstall}
        disabled={isInstalling}
        className={`group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs transition-all hover:border-slate-300 hover:bg-white hover:shadow-md active:scale-95 disabled:opacity-70 cursor-pointer max-[360px]:gap-1.5 max-[360px]:px-2 ${className}`}
        title={`${canNativeInstall ? "Install" : "Add"} ${clinicName} App`}
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-100/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={clinicName}
            width={24}
            height={24}
            unoptimized
            className="h-6 w-6 rounded-lg object-cover ring-1 ring-slate-900/10 shadow-2xs shrink-0"
          />
        ) : (
          <div
            className="relative flex h-6 w-6 items-center justify-center rounded-lg text-white shadow-2xs font-black text-[10px] shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            {clinicName.charAt(0)}
          </div>
        )}

        <div className="relative flex flex-col items-start leading-tight text-left max-[360px]:hidden">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">
            Official App
          </span>
          <span className="truncate max-w-[120px] sm:max-w-none">
            {displayName}
          </span>
        </div>

        <div
          className="relative ml-1 flex h-6 px-2.5 items-center justify-center rounded-xl text-white text-[11px] font-extrabold shadow-2xs transition-transform group-hover:scale-105"
          style={{ backgroundColor: themeColor }}
        >
          {isInstalling ? (
            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />
          ) : (
            <Download className="h-3 w-3 mr-1" />
          )}
          <span>{isInstalling ? "..." : canNativeInstall ? "Install" : "Guide"}</span>
        </div>
      </button>

      <PWAInstallGuideModal
        isOpen={isGuideOpen}
        onClose={closeGuide}
        clinicName={clinicName}
        logoUrl={logoUrl}
        themeColor={themeColor}
        platform={platform}
      />
    </>
  );
}
