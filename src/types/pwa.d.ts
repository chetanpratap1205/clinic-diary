/**
 * Global PWA and BeforeInstallPrompt TypeScript Declarations
 *
 * Provides ambient type definitions for:
 * 1. BeforeInstallPromptEvent (W3C Manifest Incubator Community Group)
 * 2. Window.__pwaDeferredPrompt early-capture cache
 * 3. WindowEventMap extensions (beforeinstallprompt, pwa-prompt-ready, appinstalled, pwa-installed)
 * 4. Navigator.standalone (iOS Safari)
 */

interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform?: string;
  }>;
  prompt: () => Promise<void>;
}

interface Window {
  /**
   * Early-captured PWA install prompt event stored globally before React hydration.
   */
  __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  /**
   * Global PWA trigger helper function.
   */
  __pwaTriggerInstall?: () => Promise<{ outcome: "accepted" | "dismissed"; platform?: string } | null>;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
  "pwa-prompt-ready": CustomEvent<BeforeInstallPromptEvent | undefined>;
  appinstalled: Event;
  "pwa-installed": CustomEvent<void>;
  "pwa-prompt-consumed": CustomEvent<void>;
}

interface Navigator {
  /**
   * iOS Safari standalone PWA detection property.
   */
  standalone?: boolean;
}
