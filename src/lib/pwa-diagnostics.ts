"use client";

export interface PWADiagnosticResult {
  isHttps: boolean;
  swSupported: boolean;
  swRegistered: boolean;
  swControlling: boolean;
  hasPromptCaptured: boolean;
  displayMode: "standalone" | "browser";
  platform: string;
  userAgent: string;
  manifestLinkFound: boolean;
  manifestHref: string | null;
  timestamp: string;
}

export async function checkPWADiagnostics(): Promise<PWADiagnosticResult> {
  if (typeof window === "undefined") {
    return {
      isHttps: false,
      swSupported: false,
      swRegistered: false,
      swControlling: false,
      hasPromptCaptured: false,
      displayMode: "browser",
      platform: "unknown",
      userAgent: "",
      manifestLinkFound: false,
      manifestHref: null,
      timestamp: new Date().toISOString(),
    };
  }

  const isHttps =
    window.location.protocol === "https:" ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const swSupported = "serviceWorker" in navigator;
  let swRegistered = false;
  let swControlling = false;

  if (swSupported) {
    swControlling = Boolean(navigator.serviceWorker.controller);
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      swRegistered = registrations.length > 0;
    } catch {
      swRegistered = false;
    }
  }

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  const manifestEl = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');

  const result: PWADiagnosticResult = {
    isHttps,
    swSupported,
    swRegistered,
    swControlling,
    hasPromptCaptured: Boolean(window.__pwaDeferredPrompt),
    displayMode: isStandalone ? "standalone" : "browser",
    platform: navigator.platform || "unknown",
    userAgent: navigator.userAgent || "",
    manifestLinkFound: Boolean(manifestEl),
    manifestHref: manifestEl?.href || null,
    timestamp: new Date().toISOString(),
  };

  // Expose on window for easy developer inspection in console
  (window as Window & { __PWA_DIAGNOSTICS__?: PWADiagnosticResult }).__PWA_DIAGNOSTICS__ = result;

  return result;
}
