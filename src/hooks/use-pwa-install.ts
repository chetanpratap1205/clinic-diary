"use client";

import { useEffect, useState, useCallback } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type Platform = "android" | "android_manual" | "ios" | "desktop" | "installed" | "unknown";

export function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";

  // Already running as PWA
  if (window.matchMedia("(display-mode: standalone)").matches) return "installed";

  const ua = navigator.userAgent;

  // iOS detection (iPhone, iPad, iPod — Safari doesn't fire beforeinstallprompt)
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
  if (isIOS) return "ios";

  // Android detection (if beforeinstallprompt doesn't fire, we'll fall back to android_manual)
  const isAndroid = /android/i.test(ua);
  if (isAndroid) return "android_manual";

  return "desktop"; // Will upgrade to "android" when beforeinstallprompt fires
}

export function usePWAInstall() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const detected = detectPlatform();
    // eslint-disable-next-line
    setPlatform(detected);
    if (detected === "installed") {
      // eslint-disable-next-line
      setIsInstalled(true);
    }

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

  return { platform, isInstalling, isInstalled, handleAndroidInstall };
}
