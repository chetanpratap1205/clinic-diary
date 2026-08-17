"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { PWASplashScreen } from "./pwa-splash-screen";
import { toast } from "sonner";
import { usePWAInstall } from "@/hooks/use-pwa-install";

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
    window.dispatchEvent(new CustomEvent("pwa-prompt-ready", { detail: e as BeforeInstallPromptEvent }));
  });

  window.addEventListener("appinstalled", () => {
    window.__pwaDeferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa-installed"));
  });
}

// ─── Root PWA Provider Component ─────────────────────────────────────────────
export function PWAProvider() {
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

      // Show install banner after 8 seconds
      setTimeout(() => setShowBanner(true), 8000);
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
    
    promptEvent.prompt().then(() => {
      return promptEvent.userChoice;
    }).then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
    }).catch((err) => {
      console.warn("PWA install error:", err);
    }).finally(() => {
      window.__pwaDeferredPrompt = null;
      setDeferredPrompt(null);
    });
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
    setShowBanner(false);
  };

  return (
    <>
      <PWASplashScreen />
      {!isInstalled && showBanner && deferredPrompt && (
        <div
          className="fixed bottom-20 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[340px] z-50 animate-slide-up"
          role="dialog"
          aria-label="Install Doctor Diary app"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/15 overflow-hidden">
            {/* Gradient top bar */}
            <div className="h-1 bg-gradient-to-r from-teal-500 to-indigo-500" />
            <div className="p-4 flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 shadow-md border border-slate-200">
                <img src="/icon-192.png" alt="Doctor Diary" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">
                  Install Clinic App
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Add to your phone for 1-tap booking, live turn tracking & prescriptions.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0 -mt-0.5 -mr-0.5"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 h-9 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 h-9 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-teal-700/20"
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
    
    promptEvent.prompt().then(() => {
      return promptEvent.userChoice;
    }).then((choiceResult) => {
      if (choiceResult.outcome === "accepted") setIsInstalled(true);
    }).catch((err) => {
      console.warn("Install error:", err);
    }).finally(() => {
      window.__pwaDeferredPrompt = null;
      setDeferredPrompt(null);
    });
  };

  return (
    <button
      onClick={handleInstall}
      className={`flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 px-3 py-1.5 rounded-lg transition-all ${className}`}
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
  const { platform, isInstalling, isInstalled, handleAndroidInstall } = usePWAInstall();

  if (isInstalled || platform === "unknown") return null;

  const handleInstallClick = () => {
    if (platform === "ios") {
      toast.success("Tap Share 📤 then 'Add to Home Screen' ➕ to install", {
        duration: 6000,
        position: "top-center",
      });
    } else if (platform === "android_manual") {
      const isWebView = /FBAN|FBAV|Instagram|WhatsApp|Line|Snapchat|WebView|wv/i.test(navigator.userAgent);
      if (isWebView) {
        toast.info("Open this link in Chrome to install the app.", {
          duration: 6000,
          position: "top-center",
        });
      } else {
        toast.info("Preparing 1-tap installer... Please wait a moment and tap again.", {
          duration: 4000,
          position: "top-center",
        });
      }
    } else if (platform === "android") {
      handleAndroidInstall();
    } else if (platform === "desktop") {
      toast.info("Click the Install icon (↓) in your browser's address bar to download.", {
        duration: 6000,
        position: "top-center",
      });
    } else {
      toast.info("Install prompt not available. Ensure you're not in Incognito/Private mode.", {
        duration: 5000,
        position: "top-center",
      });
    }
  };

  const displayName = clinicName.length > 18 ? `${clinicName.slice(0, 16)}...` : clinicName;

  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-slate-800 shadow-md transition-all hover:border-slate-300 hover:bg-white hover:shadow-lg active:scale-95 disabled:opacity-70 ${className}`}
        title={`Install ${clinicName} App (< 1MB)`}
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-slate-100/50 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={clinicName}
            className="h-6 w-6 rounded-lg object-cover ring-1 ring-slate-900/10 shadow-sm"
          />
        ) : (
          <div
            className="relative flex h-6 w-6 items-center justify-center rounded-lg text-white shadow-sm font-black text-[10px]"
            style={{ backgroundColor: themeColor }}
          >
            {clinicName.charAt(0)}
          </div>
        )}

        <div className="relative flex flex-col items-start leading-tight">
          <span className="text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Official App</span>
          <span className="truncate max-w-[120px] sm:max-w-none">{displayName}</span>
        </div>

        <div
          className="relative ml-1 flex h-6 px-2.5 items-center justify-center rounded-xl text-white text-[11px] font-extrabold shadow-sm transition-transform group-hover:scale-105"
          style={{ backgroundColor: themeColor }}
        >
          {isInstalling ? (
            <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin mr-1" />
          ) : (
            <Download className="h-3 w-3 mr-1" />
          )}
          {isInstalling ? "..." : "Install"}
        </div>
      </button>
    </>
  );
}
