# Implementation Blueprint: `src/hooks/use-pwa-install.ts` & TypeScript Window Declarations

## 1. Observation

### 1.1 Existing Source Code & References
The PWA install hook and its consumers were directly observed at the following locations:

1. **`src/hooks/use-pwa-install.ts` (Lines 1–87)**:
   - Lines 5–8: Local `BeforeInstallPromptEvent` interface definition (missing `platforms` and full `userChoice` schema).
   - Lines 12–29: `detectPlatform()` function checking standalone mode, user agent, and defaulting to `"desktop"` or `"android_manual"`.
   - Lines 37–67: `useEffect` hook listening exclusively to native `"beforeinstallprompt"` and `"appinstalled"` events attached after React hydration. Does **not** read from any global cache or window property.
   - Lines 69–83: `handleAndroidInstall` triggering `deferredPrompt.prompt()`.
   - Lines 85: Hook return signature `{ platform, isInstalling, isInstalled, handleAndroidInstall }`.

2. **`src/components/install-app-section.tsx` (Lines 25, 37–71)**:
   - Line 25: Consumes `usePWAInstall()`: `const { platform, isInstalling, isInstalled, handleAndroidInstall } = usePWAInstall();`.
   - Line 58–60: Calls `handleAndroidInstall()` when `platform === "android"`.

3. **`src/components/install-app-banner.tsx` (Lines 24, 64–80)**:
   - Line 24: Consumes `usePWAInstall()`: `const { platform, isInstalling, isInstalled, handleAndroidInstall } = usePWAInstall();`.
   - Line 66: Binds `onClick={handleAndroidInstall}` when `platform === "android"`.

4. **`tsconfig.json` (Lines 32–38)**:
   - Includes `"**/*.ts"`, `"**/*.tsx"`, `"next-env.d.ts"`. Any `.d.ts` file placed under `src/types/` is automatically included in compilation and global type resolution.

---

## 2. Logic Chain

1. **The Hydration Race Condition (Observation 1.1 item 1 vs item 4)**:
   - In Chromium browsers, when a page meets PWA criteria, the browser fires `beforeinstallprompt` very early during HTML parsing and initial resource loading.
   - If `beforeinstallprompt` fires before Next.js client bundles finish hydrating and executing `useEffect`, the event listener in `use-pwa-install.ts` is not yet attached.
   - Consequently, the native event is lost forever for that page session.
   - `deferredPrompt` remains `null`, and `platform` stays `"android_manual"` or `"desktop"`.
   - When the user taps the install CTA on `/book/[slug]`, the hook has no deferred prompt to execute, leading directly to the fallback toast or manual instructions.

2. **The Global Early Capture Bridge (Requirement 1 & 2)**:
   - By capturing `beforeinstallprompt` at the global window level as soon as it occurs (`window.__pwaDeferredPrompt = event`) and notifying via `window.dispatchEvent(new CustomEvent("pwa-prompt-ready", { detail: event }))`, the event is preserved.
   - When `usePWAInstall()` mounts:
     a. It checks if `window.__pwaDeferredPrompt` is already populated. If so, it immediately sets `deferredPrompt` and upgrades `platform` to `"android"`.
     b. It registers a listener for custom event `"pwa-prompt-ready"`. If the global capturer catches the event after component mount, the hook receives it immediately.
     c. It maintains a direct listener for `"beforeinstallprompt"` as a fallback if the global capturer did not intercept it first.

3. **Lifecycle & Cleanup via `appinstalled`**:
   - Once an app is installed (either via `deferredPrompt.prompt()` or through browser chrome menu (⋮)), the browser fires `appinstalled`.
   - The hook must listen for `appinstalled`, clear `deferredPrompt` (`setDeferredPrompt(null)`), clear the global cache (`window.__pwaDeferredPrompt = null`), and transition `isInstalled` to `true` and `platform` to `"installed"`.

4. **TypeScript Safety & Clean Type Augmentation**:
   - `window.__pwaDeferredPrompt` requires safe TypeScript declarations so that all components and hooks can access it without resorting to `(window as any)`.
   - By declaring `BeforeInstallPromptEvent`, `window.__pwaDeferredPrompt`, `WindowEventMap` extensions (`beforeinstallprompt`, `pwa-prompt-ready`, `appinstalled`), and `Navigator.standalone` inside `src/types/pwa.d.ts` and exporting them from `src/hooks/use-pwa-install.ts`, the entire codebase gains compile-time type safety.

---

## 3. Caveats

1. **`BeforeInstallPromptEvent` Single-Use Constraint**:
   - A `BeforeInstallPromptEvent` can only be prompted once via `event.prompt()`. After `prompt()` resolves, the browser invalidates the event. The hook must clear both `deferredPrompt` and `window.__pwaDeferredPrompt` in `finally` blocks to prevent stale re-invocation.
2. **SSR / Hydration Consistency**:
   - Next.js SSR executes the component function on the server where `window` is `undefined`. To prevent hydration mismatch warnings, `platform` initializes to `"unknown"` and `deferredPrompt` initializes to `null`, with the sync from `window.__pwaDeferredPrompt` occurring in `useEffect`.
3. **Backwards Compatibility**:
   - The return signature `{ platform, isInstalling, isInstalled, handleAndroidInstall }` must remain strictly backwards compatible with `install-app-section.tsx` and `install-app-banner.tsx`. Additional fields like `deferredPrompt` and `canInstall` are additive.

---

## 4. Conclusion & Implementation Blueprint

### Blueprint 1: `src/types/pwa.d.ts` (New File)

Create `src/types/pwa.d.ts` to provide project-wide global typing:

```ts
/**
 * Global PWA and BeforeInstallPrompt TypeScript Declarations
 *
 * Provides type definitions for:
 * 1. BeforeInstallPromptEvent (W3C Manifest Incubator Community Group)
 * 2. Window.__pwaDeferredPrompt early-capture cache
 * 3. CustomEvent<'pwa-prompt-ready'> and native window events
 * 4. Navigator.standalone (iOS Safari)
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform?: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    /**
     * Early-captured PWA install prompt event stored globally before React hydration.
     */
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    "pwa-prompt-ready": CustomEvent<BeforeInstallPromptEvent>;
    appinstalled: Event;
  }

  interface Navigator {
    /**
     * iOS Safari standalone PWA detection property.
     */
    standalone?: boolean;
  }
}
```

---

### Blueprint 2: `src/hooks/use-pwa-install.ts` (Replacement Blueprint)

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform?: string;
  }>;
  prompt: () => Promise<void>;
}

export type Platform =
  | "android"
  | "android_manual"
  | "ios"
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

  const ua = navigator.userAgent;

  // iOS detection (iPhone, iPad, iPod — Safari doesn't fire beforeinstallprompt)
  // Supports iPadOS 13+ which reports Macintosh with touch points
  const isIOS =
    (/iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream) ||
    (typeof navigator !== "undefined" && navigator.maxTouchPoints > 1 && /Macintosh/.test(ua));
  if (isIOS) return "ios";

  // Android detection (if beforeinstallprompt doesn't fire, we'll fall back to android_manual)
  const isAndroid = /android/i.test(ua);
  if (isAndroid) return "android_manual";

  return "desktop"; // Will upgrade to "android" when beforeinstallprompt fires or prompt is available
}

export function usePWAInstall() {
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

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
      if (detected !== "ios") {
        setPlatform("android");
      }
    }

    // 3. Native 'beforeinstallprompt' listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      window.__pwaDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setPlatform((prev) => (prev === "ios" || prev === "installed" ? prev : "android"));
    };

    // 4. Custom 'pwa-prompt-ready' listener (dispatched when captured globally)
    const handleCustomPromptReady = (e: Event) => {
      const customEvent = e as CustomEvent<BeforeInstallPromptEvent>;
      const promptEvent =
        customEvent.detail || (window.__pwaDeferredPrompt as BeforeInstallPromptEvent | null);
      if (promptEvent) {
        setDeferredPrompt(promptEvent);
        setPlatform((prev) => (prev === "ios" || prev === "installed" ? prev : "android"));
      }
    };

    // 5. 'appinstalled' listener (when app is successfully installed via prompt or browser menu)
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      if (typeof window !== "undefined") {
        window.__pwaDeferredPrompt = null;
      }
      setPlatform("installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa-prompt-ready", handleCustomPromptReady);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa-prompt-ready", handleCustomPromptReady);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleAndroidInstall = useCallback(async () => {
    const prompt =
      deferredPrompt ||
      (typeof window !== "undefined" ? window.__pwaDeferredPrompt : null);
    if (!prompt) return;

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
  }, [deferredPrompt]);

  return {
    platform,
    isInstalling,
    isInstalled,
    handleAndroidInstall,
    deferredPrompt,
    canInstall: Boolean(
      deferredPrompt ||
        (typeof window !== "undefined" && window.__pwaDeferredPrompt)
    ),
  };
}
```

---

## 5. Verification Method

1. **Verify Initial State from Global Cache**:
   - In browser console before React hydrates, set `window.__pwaDeferredPrompt = mockEvent`.
   - On mount, inspect `usePWAInstall`: verify `deferredPrompt` is immediately populated and `platform` is `"android"`.

2. **Verify Custom Event Dispatch**:
   - In browser console after mount, run `window.dispatchEvent(new CustomEvent("pwa-prompt-ready", { detail: mockEvent }))`.
   - Verify hook receives the event and updates state.

3. **Verify `appinstalled` Event Handling**:
   - In browser console, run `window.dispatchEvent(new Event("appinstalled"))`.
   - Verify `isInstalled` becomes `true`, `platform` becomes `"installed"`, and `window.__pwaDeferredPrompt` is `null`.

4. **Verify TypeScript Compilation**:
   - Run `npx tsc --noEmit` to ensure `window.__pwaDeferredPrompt`, `WindowEventMap`, and `use-pwa-install.ts` compile without errors or warnings.
