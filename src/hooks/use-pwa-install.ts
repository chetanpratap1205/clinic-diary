"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectDevicePlatformFromSignals,
  type DevicePlatform,
} from "@/lib/pwa-platform";

export type { DevicePlatform } from "@/lib/pwa-platform";

export type PromptStatus = "IDLE" | "CAPTURED" | "INSTALLED";

export function detectPlatform(): DevicePlatform {
  if (typeof window === "undefined") return "unknown";

  return detectDevicePlatformFromSignals({
    userAgent: navigator.userAgent || "",
    maxTouchPoints: navigator.maxTouchPoints || 0,
    isStandalone: isStandaloneMode(),
  });
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
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

function canWaitForNativePrompt(platform: DevicePlatform) {
  return platform === "android" || platform === "desktop";
}

export function usePWAInstall() {
  const [platform, setPlatform] = useState<DevicePlatform>("unknown");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    const detected = detectPlatform();
    const alreadyInstalled = detected === "installed";

    setPlatform(detected);
    setIsInstalled(alreadyInstalled);

    if (alreadyInstalled) {
      return;
    }

    const existingPrompt = getCapturedPrompt();
    if (existingPrompt) {
      setDeferredPrompt(existingPrompt);
    }

    const updateDiagnostics = (fields: Record<string, unknown>) => {
      if (typeof window === "undefined") return;
      const diagWin = window as Window & { __PWA_DIAGNOSTICS__?: Record<string, unknown> };
      diagWin.__PWA_DIAGNOSTICS__ = {
        ...(diagWin.__PWA_DIAGNOSTICS__ || {}),
        ...fields,
      };
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      console.log("[PWA] 🔥 BEFOREINSTALLPROMPT FIRED", promptEvent);
      if (typeof window !== "undefined") {
        window.__pwaDeferredPrompt = promptEvent;
      }
      updateDiagnostics({
        beforeInstallPromptFired: true,
        beforeInstallPromptAt: new Date().toISOString(),
        promptAvailable: true,
        hasPromptCaptured: true,
      });
      setDeferredPrompt(promptEvent);
    };

    const handlePromptReady = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent | undefined>;
      const promptEvent =
        customEvent.detail || (window.__pwaDeferredPrompt as BeforeInstallPromptEvent | null);

      if (promptEvent) {
        setDeferredPrompt(promptEvent);
        updateDiagnostics({ promptAvailable: true, hasPromptCaptured: true });
      }
    };

    const handleAppInstalled = () => {
      console.log("[PWA] 🔥 APPINSTALLED FIRED");
      setIsInstalled(true);
      setDeferredPrompt(null);
      setPlatform("installed");
      setIsGuideOpen(false);
      clearCapturedPrompt();
      updateDiagnostics({
        appInstalled: true,
        appInstalledAt: new Date().toISOString(),
        promptAvailable: false,
      });
    };

    const handlePromptConsumed = () => {
      setDeferredPrompt(null);
      updateDiagnostics({ promptAvailable: false });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-prompt-ready", handlePromptReady);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("pwa-installed", handleAppInstalled);
    window.addEventListener("pwa-prompt-consumed", handlePromptConsumed);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa-prompt-ready", handlePromptReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("pwa-installed", handleAppInstalled);
      window.removeEventListener("pwa-prompt-consumed", handlePromptConsumed);
    };
  }, []);

  const runNativePrompt = useCallback(async (prompt: BeforeInstallPromptEvent) => {
    setIsInstalling(true);
    if (typeof window !== "undefined") {
      const diagWin = window as Window & { __PWA_DIAGNOSTICS__?: Record<string, unknown> };
      diagWin.__PWA_DIAGNOSTICS__ = {
        ...(diagWin.__PWA_DIAGNOSTICS__ || {}),
        promptCalled: true,
        promptCalledAt: new Date().toISOString(),
      };
    }

    try {
      const activePrompt = prompt || (typeof window !== "undefined" ? window.__pwaDeferredPrompt : null);
      if (activePrompt && typeof activePrompt.prompt === "function") {
        await activePrompt.prompt();
        const choice = await activePrompt.userChoice;
        if (typeof window !== "undefined") {
          const diagWin = window as Window & { __PWA_DIAGNOSTICS__?: Record<string, unknown> };
          diagWin.__PWA_DIAGNOSTICS__ = {
            ...(diagWin.__PWA_DIAGNOSTICS__ || {}),
            userChoice: choice?.outcome || "unknown",
            userChoiceAt: new Date().toISOString(),
          };
        }
        if (choice && choice.outcome === "accepted") {
          setIsInstalled(true);
          setPlatform("installed");
        }
      } else if (typeof window !== "undefined" && window.__pwaTriggerInstall) {
        const choice = await window.__pwaTriggerInstall();
        if (choice && choice.outcome === "accepted") {
          setIsInstalled(true);
          setPlatform("installed");
        }
      }
    } catch (err) {
      console.error("[usePWAInstall] Failed to trigger native PWA prompt:", err);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      clearCapturedPrompt();
    }
  }, []);

  const triggerInstall = useCallback(async () => {
    const prompt = deferredPrompt || getCapturedPrompt();

    if (prompt) {
      await runNativePrompt(prompt);
      return;
    }

    if (canWaitForNativePrompt(platform)) {
      setIsInstalling(true);
      const promptArrived = await new Promise<BeforeInstallPromptEvent | null>((resolve) => {
        if (typeof window === "undefined") {
          resolve(null);
          return;
        }

        const checkPrompt = () => {
          return deferredPrompt || getCapturedPrompt();
        };

        const existingPrompt = checkPrompt();
        if (existingPrompt) {
          resolve(existingPrompt);
          return;
        }

        const nativeListener = (e: Event) => {
          e.preventDefault();
          cleanup();
          const p = e as BeforeInstallPromptEvent;
          window.__pwaDeferredPrompt = p;
          setDeferredPrompt(p);
          resolve(p);
        };

        const customListener = (e: Event) => {
          cleanup();
          const customEvent = e as CustomEvent<BeforeInstallPromptEvent | undefined>;
          const p = customEvent.detail || checkPrompt();
          resolve(p);
        };

        const interval = window.setInterval(() => {
          const found = checkPrompt();
          if (found) {
            cleanup();
            resolve(found);
          }
        }, 100);

        const timer = window.setTimeout(() => {
          cleanup();
          resolve(checkPrompt());
        }, 1500);

        const cleanup = () => {
          window.clearInterval(interval);
          window.clearTimeout(timer);
          window.removeEventListener("beforeinstallprompt", nativeListener);
          window.removeEventListener("pwa-prompt-ready", customListener);
        };

        window.addEventListener("beforeinstallprompt", nativeListener, { once: true });
        window.addEventListener("pwa-prompt-ready", customListener, { once: true });
      });
      setIsInstalling(false);

      if (promptArrived) {
        await runNativePrompt(promptArrived);
        return;
      }
    }

    setIsGuideOpen(true);
  }, [deferredPrompt, platform, runNativePrompt]);

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
    canNativeInstall: Boolean(deferredPrompt || (typeof window !== "undefined" && window.__pwaDeferredPrompt)),
  };
}
