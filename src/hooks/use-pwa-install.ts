"use client";

import { useEffect, useState, useCallback } from "react";

export type Platform =
  | "android"
  | "android_manual"
  | "ios"
  | "in_app"
  | "desktop"
  | "installed"
  | "unknown";

export function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";

  // Already running as PWA (standalone display mode or iOS standalone)
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (isStandalone) return "installed";

  const ua = navigator.userAgent || "";

  // In-app browsers (WhatsApp, Instagram, FB, LinkedIn, Twitter/X, Telegram, WeChat, etc.)
  const isInApp = /(FBAN|FBAV|Instagram|WhatsApp|Line|Twitter|Telegram|Snapchat|MicroMessenger|GSA|musical_ly)/i.test(
    ua
  );
  if (isInApp) return "in_app";

  // iOS detection (iPhone, iPad, iPod — Safari doesn't fire beforeinstallprompt)
  // Supports iPadOS 13+ which reports Macintosh with touch points
  const isIOS =
    (/iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream) ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  if (isIOS) return "ios";

  // Android detection
  const isAndroid = /android/i.test(ua);
  if (isAndroid) return "android_manual";

  return "desktop";
}

export function usePWAInstall() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    // 1. Initial platform detection
    const detected = detectPlatform();
    setPlatform(detected);

    if (detected === "installed") {
      setIsInstalled(true);
      return;
    }

    // 2. Check if prompt was already captured globally before component mount
    if (typeof window !== "undefined" && window.__pwaDeferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
      if (detected !== "ios" && detected !== "in_app") {
        setPlatform("android");
      }
    }

    // 3. Native 'beforeinstallprompt' listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setPlatform((prev) =>
        prev === "ios" || prev === "in_app" || prev === "installed" ? prev : "android"
      );
    };

    // 4. Custom 'pwa-prompt-ready' listener (dispatched when captured globally)
    const handleCustomPromptReady = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent | undefined>;
      const promptEvent =
        customEvent.detail || (window.__pwaDeferredPrompt as BeforeInstallPromptEvent | null);
      if (promptEvent) {
        setDeferredPrompt(promptEvent);
        setPlatform((prev) =>
          prev === "ios" || prev === "in_app" || prev === "installed" ? prev : "android"
        );
      }
    };

    // 5. 'appinstalled' / 'pwa-installed' listener
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== "undefined") {
        window.__pwaDeferredPrompt = null;
      }
      setPlatform("installed");
      setIsGuideOpen(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-prompt-ready", handleCustomPromptReady);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("pwa-installed", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa-prompt-ready", handleCustomPromptReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("pwa-installed", handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    // Check state first, then window object
    let prompt =
      deferredPrompt ||
      (typeof window !== "undefined" ? window.__pwaDeferredPrompt : null);

    // If native prompt is available, execute immediately (1-TAP!)
    if (prompt) {
      setIsInstalling(true);
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          setIsInstalled(true);
          setPlatform("installed");
          if (typeof window !== "undefined") {
            window.__pwaDeferredPrompt = null;
          }
        }
      } catch (err) {
        console.error("[usePWAInstall] Failed to prompt PWA install:", err);
      } finally {
        setIsInstalling(false);
        setDeferredPrompt(null);
        if (typeof window !== "undefined") {
          window.__pwaDeferredPrompt = null;
        }
      }
      return;
    }

    // On Android/Desktop Chromium: Wait up to 600ms in case beforeinstallprompt is in-flight
    if (typeof window !== "undefined" && (platform === "android" || platform === "android_manual" || platform === "desktop")) {
      setIsInstalling(true);
      const promptArrived = await new Promise<BeforeInstallPromptEvent | null>((resolve) => {
        const timer = setTimeout(() => resolve(null), 600);
        const handler = (e: Event) => {
          clearTimeout(timer);
          window.removeEventListener("pwa-prompt-ready", handler);
          resolve(window.__pwaDeferredPrompt || null);
        };
        window.addEventListener("pwa-prompt-ready", handler, { once: true });
        
        // Re-check window immediately
        if (window.__pwaDeferredPrompt) {
          clearTimeout(timer);
          window.removeEventListener("pwa-prompt-ready", handler);
          resolve(window.__pwaDeferredPrompt || null);
        }
      });
      setIsInstalling(false);

      if (promptArrived) {
        try {
          await promptArrived.prompt();
          const { outcome } = await promptArrived.userChoice;
          if (outcome === "accepted") {
            setIsInstalled(true);
            setPlatform("installed");
            window.__pwaDeferredPrompt = null;
          }
        } catch (err) {
          console.error("[usePWAInstall] Deferred prompt execution error:", err);
        } finally {
          setDeferredPrompt(null);
          window.__pwaDeferredPrompt = null;
        }
        return;
      }
    }

    // Fallback for iOS, in-app browsers, or browsers with disabled prompts
    setIsGuideOpen(true);
  }, [deferredPrompt, platform]);

  return {
    platform,
    isInstalling,
    isInstalled,
    isGuideOpen,
    openGuide: () => setIsGuideOpen(true),
    closeGuide: () => setIsGuideOpen(false),
    handleAndroidInstall: triggerInstall,
    triggerInstall,
    deferredPrompt,
    canInstall: Boolean(
      deferredPrompt ||
        (typeof window !== "undefined" && window.__pwaDeferredPrompt)
    ),
  };
}
