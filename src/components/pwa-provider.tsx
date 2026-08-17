"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, X } from "lucide-react";
import { PWASplashScreen } from "./pwa-splash-screen";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { PWAInstallGuideModal } from "@/components/pwa-install-guide-modal";

// ─── Reliable Service Worker Registration Helper ─────────────────────────────
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

// ─── Early Window-Level Event Capture ─────────────────────────────────────────
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    window.__pwaDeferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(
      new CustomEvent("pwa-prompt-ready", {
        detail: e as BeforeInstallPromptEvent,
      })
    );
  });

  window.addEventListener("appinstalled", () => {
    window.__pwaDeferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa-installed"));
  });
}

// ─── Root PWA Provider Component ─────────────────────────────────────────────
export function PWAProvider() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Register service worker reliably
    registerServiceWorker();

    // 2. Check if already running in standalone mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const checkAndTriggerBanner = (prompt: BeforeInstallPromptEvent) => {
      setDeferredPrompt(prompt);

      // Check if user dismissed it recently (< 3 days)
      const lastDismissed = localStorage.getItem("pwa_install_dismissed");
      if (lastDismissed) {
        const dismissedAt = parseInt(lastDismissed, 10);
        const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
        if (daysSince < 3) return;
      }

      // Show install banner after 5 seconds on dashboard/root
      setTimeout(() => setShowBanner(true), 5000);
    };

    // 3. Pick up prompt if already captured early at window level
    if (window.__pwaDeferredPrompt) {
      checkAndTriggerBanner(window.__pwaDeferredPrompt);
    }

    // 4. Event listeners for prompt ready & app installed
    const promptHandler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvent;
      checkAndTriggerBanner(promptEvent);
    };

    const promptReadyHandler = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent | undefined>;
      const prompt = customEvent.detail || window.__pwaDeferredPrompt;
      if (prompt) {
        checkAndTriggerBanner(prompt);
      }
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      window.__pwaDeferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", promptHandler);
    window.addEventListener("pwa-prompt-ready", promptReadyHandler);
    window.addEventListener("appinstalled", installedHandler);
    window.addEventListener("pwa-installed", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", promptHandler);
      window.removeEventListener("pwa-prompt-ready", promptReadyHandler);
      window.removeEventListener("appinstalled", installedHandler);
      window.removeEventListener("pwa-installed", installedHandler);
    };
  }, []);

  const handleInstall = () => {
    const promptEvent = deferredPrompt || window.__pwaDeferredPrompt;
    if (!promptEvent) return;

    promptEvent
      .prompt()
      .then(() => {
        return promptEvent.userChoice;
      })
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
        window.__pwaDeferredPrompt = null;
        setDeferredPrompt(null);
      });
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
    setShowBanner(false);
  };

  // Suppress generic root banner on clinic pages (which have their own clinic-branded install)
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
            {/* Gradient top bar */}
            <div className="h-1 bg-gradient-to-r from-teal-500 to-indigo-500" />
            <div className="p-4 flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md border border-slate-200">
                <img
                  src="/icon-192.png"
                  alt="Doctor Diary"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">
                  Install Doctor Diary
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Add to your device for instant access & real-time updates.
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

// ─── Standalone Install Button (Doctor Portal / General) ───────────────────────
export function InstallButton({ className = "" }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    if (window.__pwaDeferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const promptReadyHandler = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent | undefined>;
      const prompt = customEvent.detail || window.__pwaDeferredPrompt;
      if (prompt) {
        setDeferredPrompt(prompt);
      }
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaDeferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("pwa-prompt-ready", promptReadyHandler);
    window.addEventListener("appinstalled", installedHandler);
    window.addEventListener("pwa-installed", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("pwa-prompt-ready", promptReadyHandler);
      window.removeEventListener("appinstalled", installedHandler);
      window.removeEventListener("pwa-installed", installedHandler);
    };
  }, []);

  if (isInstalled || !deferredPrompt) return null;

  const handleInstall = () => {
    const promptEvent = deferredPrompt || window.__pwaDeferredPrompt;
    if (!promptEvent) return;

    promptEvent
      .prompt()
      .then(() => {
        return promptEvent.userChoice;
      })
      .then((choiceResult) => {
        if (choiceResult.outcome === "accepted") setIsInstalled(true);
      })
      .catch((err) => {
        console.warn("Install error:", err);
      })
      .finally(() => {
        window.__pwaDeferredPrompt = null;
        setDeferredPrompt(null);
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

// ─── Patient Clinic Install Button ────────────────────────────────────────────
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
        className={`group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs transition-all hover:border-slate-300 hover:bg-white hover:shadow-md active:scale-95 disabled:opacity-70 cursor-pointer ${className}`}
        title={`Install ${clinicName} App (< 1MB)`}
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-100/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

        {logoUrl ? (
          <img
            src={logoUrl}
            alt={clinicName}
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

        <div className="relative flex flex-col items-start leading-tight text-left">
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
          <span>{isInstalling ? "..." : "Install"}</span>
        </div>
      </button>

      {/* Guide Modal for iOS / in-app / desktop */}
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
