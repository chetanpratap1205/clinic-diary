"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { PWASplashScreen } from "./pwa-splash-screen";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAProvider() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch((err) => console.warn("SW registration failed:", err));
      });
    }

    // Check if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user dismissed it recently
      const lastDismissed = localStorage.getItem("pwa_install_dismissed");
      if (lastDismissed) {
        const dismissedAt = parseInt(lastDismissed, 10);
        const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
        if (daysSince < 3) return; // Hide for 3 days if dismissed
      }
      
      // Show install banner after 45 seconds of usage
      setTimeout(() => setShowBanner(true), 45000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
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

// Standalone install button for use in nav/pages
export function InstallButton({ className = "" }: { className?: string }) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsInstalled(true);
      return;
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isInstalled || !deferredPrompt) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
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

// Subtle, patient-facing install button specifically for clinic booking pages
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
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }
    const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iosCheck);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isInstalled || (!deferredPrompt && !isIOS)) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const displayName = clinicName.length > 18 ? `${clinicName.slice(0, 16)}...` : clinicName;

  return (
    <>
      <button
        onClick={handleInstall}
        className={`group relative flex items-center gap-2.5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-slate-800 shadow-md transition-all hover:border-slate-300 hover:bg-white hover:shadow-lg active:scale-95 ${className}`}
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
          <Download className="h-3 w-3 mr-1" />
          Install
        </div>
      </button>

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

