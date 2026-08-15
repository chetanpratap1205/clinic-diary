# Milestone 1 Blueprint & Investigation Report: Service Worker Registration & Early Prompt Global Capture

**Target Directory**: `e:\doctor-appointment-saas-platform\.agents\teamwork_preview_explorer_m1_1\`  
**Milestone**: M1 (SW Registration & Early Prompt Global Capture)  
**Author**: Explorer 1  
**Status**: Ready for Implementation  

---

## 1. Observation

### Observation 1.1: Flawed Service Worker Registration in `pwa-provider.tsx`
In `src/components/pwa-provider.tsx` (lines 19-27):
```typescript
19:   useEffect(() => {
20:     // Register service worker
21:     if ("serviceWorker" in navigator) {
22:       window.addEventListener("load", () => {
23:         navigator.serviceWorker
24:           .register("/sw.js", { scope: "/" })
25:           .catch((err) => console.warn("SW registration failed:", err));
26:       });
27:     }
```
- `useEffect` executes **after** React hydrates and mounts the component.
- In Next.js client-side navigations and fast hydration scenarios where `document.readyState === "complete"` by the time `useEffect` executes, the window `"load"` event has **already fired**.
- Attaching `window.addEventListener("load", ...)` after `"load"` has occurred results in the callback **never executing**.
- As a consequence, `/sw.js` is never registered on the page. Chromium requires an active Service Worker with a fetch handler covering the start_url/scope as a mandatory criterion for PWA installability. Without it, the browser never dispatches `beforeinstallprompt`.

### Observation 1.2: Uncoordinated `beforeinstallprompt` Listeners Across Components
In `src/components/pwa-provider.tsx` and `src/hooks/use-pwa-install.ts`:
- Multiple independent components register local `beforeinstallprompt` listeners in their own isolated `useEffect` hooks:
  - `PWAProvider` (`src/components/pwa-provider.tsx:53`)
  - `InstallButton` (`src/components/pwa-provider.tsx:153`)
  - `PatientInstallButton` (`src/components/pwa-provider.tsx:209`)
  - `usePWAInstall` hook (`src/hooks/use-pwa-install.ts:53`)
- If the browser dispatches `beforeinstallprompt` before a specific component mounts (or before React hydrates), or if one component calls `e.preventDefault()`, other components mounting later find `deferredPrompt` as `null`.
- There is currently no shared global storage (e.g. `window.__pwaDeferredPrompt`) or broadcast bus (e.g. `CustomEvent("pwa-prompt-ready")`) to synchronize prompt state across components.

### Observation 1.3: Downstream Impact on Push Notifications
In `src/components/push-opt-in.tsx` (lines 60-62):
```typescript
60:     navigator.serviceWorker.ready
61:       .then((reg) => reg.pushManager.getSubscription())
```
- When Service Worker registration fails or is missed due to the `"load"` event race condition, `navigator.serviceWorker.ready` hangs or fails, silently breaking push notification opt-in for appointment turn alerts.

---

## 2. Logic Chain

1. **Root Cause 1 (SW Race Condition)**:
   - Observation 1.1 proves that `pwa-provider.tsx` unconditionally waits for `window.addEventListener("load")`.
   - When Next.js loads the page or transitions between routes, `document.readyState` is frequently `"complete"`.
   - Adding a listener for an event that has already occurred ensures the Service Worker registration promise is never triggered.
   - Therefore, replacing this with an immediate call when `document.readyState === "complete"` and falling back to `{ once: true }` on `"load"` when `document.readyState !== "complete"` guarantees 100% reliable Service Worker registration under all hydration conditions.

2. **Root Cause 2 (Event Interception Timing)**:
   - Observation 1.2 proves that `beforeinstallprompt` events can fire prior to React component mount or before individual hook instances attach their listeners.
   - By creating a global property `window.__pwaDeferredPrompt` attached at module evaluation time as well as within `useEffect`, the earliest possible `beforeinstallprompt` event is captured, `e.preventDefault()` is invoked to prevent the default browser mini-bar, and a custom event `CustomEvent("pwa-prompt-ready")` is dispatched.
   - When any consumer (`PWAProvider`, `InstallButton`, `PatientInstallButton`, `usePWAInstall`) mounts, it immediately checks `if (window.__pwaDeferredPrompt)` to initialize state without waiting for a new event, and subscribes to `pwa-prompt-ready`.
   - When an install is accepted or `appinstalled` fires, `window.__pwaDeferredPrompt` is cleaned up and `pwa-installed` is broadcast.

3. **Portal Non-Regression & Type Safety**:
   - Both Doctor Diary (`public/manifest.json`, `/dashboard`, `/login`) and Patient Clinic portals (`/book/[slug]`, `/track/[appointmentId]`) use the unified root-level `/sw.js` and `PWAProvider`.
   - Adding global TypeScript typing `declare global { interface Window { __pwaDeferredPrompt?: BeforeInstallPromptEvent | null; } }` ensures full type safety across both portals with zero compilation errors.

---

## 3. Caveats

1. **Browser Engine Differences**: `beforeinstallprompt` is a Chromium-specific standard (Chrome for Android, Edge, Desktop Chrome, Samsung Internet, Brave). Safari (iOS/macOS) and Firefox do not fire `beforeinstallprompt`. For iOS, manual Share sheet instructions remain the designated flow.
2. **Localhost vs HTTPS**: Service Workers and PWA installability require a secure context (`https://` or `localhost`/`127.0.0.1`). In local testing, standard HTTP non-localhost addresses will not register Service Workers.
3. **Engagement Heuristics**: In Chrome on Android, installability criteria also depend on manifest validity (name, icons, start_url, display mode). Milestone 2 ensures dynamic manifest icons & routes meet these criteria.

---

## 4. Conclusion & Implementation Blueprint

### Blueprint Part 1: `src/components/pwa-provider.tsx`

#### Exact Code Replacement for `src/components/pwa-provider.tsx`
```typescript
"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { PWASplashScreen } from "./pwa-splash-screen";
import { toast } from "sonner";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

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
    window.dispatchEvent(new CustomEvent("pwa-prompt-ready"));
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

    const promptReadyHandler = () => {
      if (window.__pwaDeferredPrompt) {
        checkAndTriggerBanner(window.__pwaDeferredPrompt);
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

  const handleInstall = async () => {
    const promptEvent = deferredPrompt || window.__pwaDeferredPrompt;
    if (!promptEvent) return;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setShowBanner(false);
      }
    } catch (err) {
      console.warn("PWA install error:", err);
    } finally {
      window.__pwaDeferredPrompt = null;
      setDeferredPrompt(null);
    }
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

    const promptReadyHandler = () => {
      if (window.__pwaDeferredPrompt) {
        setDeferredPrompt(window.__pwaDeferredPrompt);
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

  const handleInstall = async () => {
    const promptEvent = deferredPrompt || window.__pwaDeferredPrompt;
    if (!promptEvent) return;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
    } catch (err) {
      console.warn("Install error:", err);
    } finally {
      window.__pwaDeferredPrompt = null;
      setDeferredPrompt(null);
    }
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
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const ua = navigator.userAgent;
    const iosCheck =
      (/iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(iosCheck);

    if (window.__pwaDeferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
    };

    const promptReadyHandler = () => {
      if (window.__pwaDeferredPrompt) {
        setDeferredPrompt(window.__pwaDeferredPrompt);
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

  if (isInstalled || (!deferredPrompt && !isIOS)) return null;

  const handleInstall = async () => {
    if (isIOS) {
      toast.success("Tap Share 📤 then 'Add to Home Screen' ➕ to install", {
        duration: 6000,
        position: "top-center",
      });
      return;
    }
    const promptEvent = deferredPrompt || window.__pwaDeferredPrompt;
    if (!promptEvent) return;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
    } catch (err) {
      console.warn("Patient PWA install error:", err);
    } finally {
      window.__pwaDeferredPrompt = null;
      setDeferredPrompt(null);
    }
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
    </>
  );
}
```

---

### Blueprint Part 2: `src/hooks/use-pwa-install.ts` Integration

#### Synchronized Global Prompt Capture in `usePWAInstall` Hook
In `src/hooks/use-pwa-install.ts`:
```typescript
  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    if (detected === "installed") {
      setIsInstalled(true);
    }

    // Pick up globally captured prompt if already present on mount
    if (typeof window !== "undefined" && window.__pwaDeferredPrompt) {
      setDeferredPrompt(window.__pwaDeferredPrompt);
      setPlatform("android");
    }

    // Listen for the Android/Chrome install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setPlatform("android");
    };

    const promptReadyHandler = () => {
      if (window.__pwaDeferredPrompt) {
        setDeferredPrompt(window.__pwaDeferredPrompt);
        setPlatform("android");
      }
    };

    // Listen for successful install (any platform)
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaDeferredPrompt = null;
      setPlatform("installed");
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
```

---

## 5. Verification Method

### 1. Static Verification & Type Checks
Run Next.js build and TypeScript typechecking:
```powershell
npm run build
```
Verify that:
- `declare global { interface Window { __pwaDeferredPrompt?: BeforeInstallPromptEvent | null; } }` compiles cleanly with zero TypeScript errors.
- `registerServiceWorker()` compiles without SSR hydration errors.

### 2. Runtime Verification of SW Registration
1. Start dev or preview server: `npm run dev`
2. Open Chrome DevTools -> Application -> Service Workers.
3. Reload `/book/demo-clinic` or `/dashboard`.
4. Verify `/sw.js` with scope `/` shows **Activated and running** immediately, even when navigating or reloading with DevTools open (where `document.readyState === "complete"` occurs before React hydration).

### 3. Runtime Verification of `beforeinstallprompt` Global Capture
1. In Chrome DevTools Console, dispatch simulated prompt event:
   ```javascript
   window.dispatchEvent(new Event('beforeinstallprompt'));
   ```
2. Verify `window.__pwaDeferredPrompt` is populated.
3. Verify all active install buttons update state instantaneously via `"pwa-prompt-ready"`.

---
*Report complete. Explorer 1 handing off to Orchestrator.*
