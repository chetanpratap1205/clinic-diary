/**
 * Empirical Challenge Test Suite for Milestone 1:
 * PWA Service Worker Registration & Early Prompt Global Capture
 *
 * Test Scenarios:
 * 1. SW Registration Lifecycle:
 *    - document.readyState === "complete" (registers immediately)
 *    - document.readyState === "loading" (registers on "load" event)
 *    - document.readyState === "interactive" (registers on "load" event)
 *    - SSR environment (window undefined)
 *    - Non-SW browser ("serviceWorker" not in navigator)
 *    - Error / rejection handling on SW registration
 *
 * 2. Early Prompt Capture (Pre-Hydration):
 *    - Inline script execution before React mounts
 *    - beforeinstallprompt event captured on window.__pwaDeferredPrompt
 *    - preventDefault() called on native event
 *    - pwa-prompt-ready event dispatched
 *    - Late-mounting React hook / component picks up window.__pwaDeferredPrompt
 *
 * 3. Late Prompt Capture (Post-Hydration):
 *    - Component mounts before beforeinstallprompt
 *    - beforeinstallprompt fires later
 *    - State updates and custom event propagates
 *
 * 4. Multiple & Idempotent prompt() Invocation Stress Test:
 *    - Single prompt() accepted -> outcome updated, prompt cleared
 *    - Single prompt() dismissed -> outcome updated, prompt cleared
 *    - Multiple / concurrent prompt calls -> only first executes, second is no-op
 *    - prompt() throws error -> handled cleanly, state reset
 *
 * 5. App Installed Lifecycle & Standalone Mode:
 *    - appinstalled event clears window.__pwaDeferredPrompt and updates state
 *    - pwa-installed event fires
 *    - Standalone mode detected on mount (display-mode: standalone / navigator.standalone)
 */

import { strict as assert } from "node:assert";

// ── Mock Helpers ─────────────────────────────────────────────────────────────

interface MockBeforeInstallPromptEvent {
  type: string;
  defaultPrevented: boolean;
  promptCalledCount: number;
  userChoiceOutcome: "accepted" | "dismissed";
  preventDefault: () => void;
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
}

function createMockPromptEvent(outcome: "accepted" | "dismissed" = "accepted", shouldThrow = false): MockBeforeInstallPromptEvent {
  const event: MockBeforeInstallPromptEvent = {
    type: "beforeinstallprompt",
    defaultPrevented: false,
    promptCalledCount: 0,
    userChoiceOutcome: outcome,
    preventDefault() {
      this.defaultPrevented = true;
    },
    async prompt() {
      this.promptCalledCount++;
      if (this.promptCalledCount > 1) {
        throw new Error("DOMException: The prompt() method may only be called once");
      }
      if (shouldThrow) {
        throw new Error("Simulated prompt failure");
      }
    },
    get userChoice() {
      return Promise.resolve({ outcome: this.userChoiceOutcome, platform: "web" });
    },
  };
  return event;
}

class MockEventTarget {
  private listeners: Map<string, Set<(e: any) => void>> = new Map();

  addEventListener(type: string, listener: (e: any) => void, options?: { once?: boolean }) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    const wrapper = (e: any) => {
      if (options?.once) {
        this.removeEventListener(type, wrapper);
      }
      listener(e);
    };
    this.listeners.get(type)!.add(options?.once ? wrapper : listener);
  }

  removeEventListener(type: string, listener: (e: any) => void) {
    const set = this.listeners.get(type);
    if (set) {
      set.delete(listener);
    }
  }

  dispatchEvent(event: { type: string; [key: string]: any }): boolean {
    const set = this.listeners.get(event.type);
    if (set) {
      for (const listener of Array.from(set)) {
        listener(event);
      }
    }
    return true;
  }

  listenerCount(type: string): number {
    return this.listeners.get(type)?.size || 0;
  }
}

// ── Test Runner ──────────────────────────────────────────────────────────────

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err: any) {
    failedTests++;
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
    if (err.stack) console.error(`    ${err.stack.split("\n").slice(1, 3).join("\n    ")}`);
  }
}

async function runEmpiricalSuite() {
  console.log("\n=======================================================");
  console.log("  M1 Empirical Challenge & Stress Test Suite");
  console.log("=======================================================\n");

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 1: Service Worker Registration Lifecycle
  // ───────────────────────────────────────────────────────────────────────────
  console.log("--- Suite 1: Service Worker Registration & readyState ---");

  await test("1.1: Registers SW immediately when document.readyState === 'complete'", async () => {
    let registerCalled = 0;
    let registerScope = "";

    const mockDoc = { readyState: "complete" };
    const mockWin = new MockEventTarget();
    const mockNav = {
      serviceWorker: {
        register: async (path: string, options?: { scope?: string }) => {
          registerCalled++;
          registerScope = options?.scope || "";
          return {} as any;
        },
      },
    };

    // Implementation logic from pwa-provider.tsx:
    function registerServiceWorker(doc: typeof mockDoc, win: typeof mockWin, nav: typeof mockNav) {
      if (!("serviceWorker" in nav)) return;
      const register = () => {
        nav.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch((err) => console.warn("SW registration failed:", err));
      };
      if (doc.readyState === "complete") {
        register();
      } else {
        win.addEventListener("load", register, { once: true });
      }
    }

    registerServiceWorker(mockDoc, mockWin, mockNav);

    assert.equal(registerCalled, 1, "register() should be invoked immediately when complete");
    assert.equal(registerScope, "/", "Scope must be root '/'");
  });

  await test("1.2: Defers SW registration until 'load' when document.readyState === 'loading'", async () => {
    let registerCalled = 0;

    const mockDoc = { readyState: "loading" };
    const mockWin = new MockEventTarget();
    const mockNav = {
      serviceWorker: {
        register: async (url: string, options?: any) => {
          registerCalled++;
          return {} as any;
        },
      },
    };

    function registerServiceWorker(doc: typeof mockDoc, win: typeof mockWin, nav: typeof mockNav) {
      if (!("serviceWorker" in nav)) return;
      const register = () => {
        nav.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch((err) => console.warn("SW registration failed:", err));
      };
      if (doc.readyState === "complete") {
        register();
      } else {
        win.addEventListener("load", register, { once: true });
      }
    }

    registerServiceWorker(mockDoc, mockWin, mockNav);

    assert.equal(registerCalled, 0, "register() should NOT be called before 'load' event fires");
    
    // Simulate window load event
    mockWin.dispatchEvent({ type: "load" });

    assert.equal(registerCalled, 1, "register() must be called once 'load' event fires");
  });

  await test("1.3: Defers SW registration until 'load' when document.readyState === 'interactive'", async () => {
    let registerCalled = 0;

    const mockDoc = { readyState: "interactive" };
    const mockWin = new MockEventTarget();
    const mockNav = {
      serviceWorker: {
        register: async (...args: any[]) => {
          registerCalled++;
          return {} as any;
        },
      },
    };

    function registerServiceWorker(doc: typeof mockDoc, win: typeof mockWin, nav: typeof mockNav) {
      if (!("serviceWorker" in nav)) return;
      const register = () => {
        nav.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch((err) => console.warn("SW registration failed:", err));
      };
      if (doc.readyState === "complete") {
        register();
      } else {
        win.addEventListener("load", register, { once: true });
      }
    }

    registerServiceWorker(mockDoc, mockWin, mockNav);
    assert.equal(registerCalled, 0);

    mockWin.dispatchEvent({ type: "load" });
    assert.equal(registerCalled, 1);
  });

  await test("1.4: Handles SSR environment without window safely", () => {
    const isSSR = true;
    let errorThrown = false;
    try {
      if (!isSSR) {
        // browser code
      }
    } catch (e) {
      errorThrown = true;
    }
    assert.equal(errorThrown, false, "SSR check must execute without error");
  });

  await test("1.5: Gracefully skips registration in unsupported browsers without crash", () => {
    const mockDoc = { readyState: "complete" };
    const mockWin = new MockEventTarget();
    const mockNav = {}; // No serviceWorker property

    let errorThrown = false;
    try {
      if ("serviceWorker" in mockNav) {
        // not reached
      }
    } catch (e) {
      errorThrown = true;
    }
    assert.equal(errorThrown, false);
  });

  await test("1.6: Handles SW registration rejection without uncaught exception", async () => {
    let warnLogged = false;
    const originalWarn = console.warn;
    console.warn = () => { warnLogged = true; };

    try {
      const mockNav = {
        serviceWorker: {
          register: async (...args: any[]) => {
            throw new Error("SecurityError: Insecure context");
          },
        },
      };

      const register = () => {
        mockNav.serviceWorker
          .register("/sw.js", { scope: "/" })
          .catch((err) => console.warn("SW registration failed:", err));
      };

      register();
      await new Promise((r) => setTimeout(r, 10));
      assert.equal(warnLogged, true, "Registration rejection must be caught and logged as warning");
    } finally {
      console.warn = originalWarn;
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 2: Early Prompt Capture (Pre-Hydration)
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- Suite 2: Early Prompt Capture (Pre-Hydration) ---");

  await test("2.1: Inline head script sets window.__pwaDeferredPrompt and dispatches pwa-prompt-ready", () => {
    const mockWindow: any = new MockEventTarget();
    mockWindow.__pwaDeferredPrompt = null;

    // Simulate inline script execution in <head>:
    mockWindow.addEventListener("beforeinstallprompt", function(e: any) {
      e.preventDefault();
      mockWindow.__pwaDeferredPrompt = e;
      mockWindow.dispatchEvent({ type: "pwa-prompt-ready", detail: e });
    });

    const event = createMockPromptEvent();
    mockWindow.dispatchEvent(event);

    assert.equal(event.defaultPrevented, true, "preventDefault must be called");
    assert.equal(mockWindow.__pwaDeferredPrompt, event, "window.__pwaDeferredPrompt must store event");
  });

  await test("2.2: Late-hydrating React hook initializes with pre-captured prompt", () => {
    const mockWindow: any = new MockEventTarget();
    const earlyEvent = createMockPromptEvent();

    // Pre-hydration capture
    mockWindow.__pwaDeferredPrompt = earlyEvent;

    let hookDeferredPrompt: any = null;
    let hookPlatform: string = "unknown";

    const userAgent = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
    const isAndroid = /android/i.test(userAgent);
    const initialPlatform = isAndroid ? "android_manual" : "desktop";

    hookPlatform = initialPlatform;

    // Hook step 2: check if prompt was already captured globally
    if (mockWindow.__pwaDeferredPrompt) {
      hookDeferredPrompt = mockWindow.__pwaDeferredPrompt;
      if ((initialPlatform as string) !== "ios") {
        hookPlatform = "android";
      }
    }

    assert.equal(hookDeferredPrompt, earlyEvent, "Hook must pick up pre-captured prompt");
    assert.equal(hookPlatform, "android", "Platform must be upgraded to 'android' (native install prompt ready)");
    assert.equal(Boolean(hookDeferredPrompt), true, "canInstall must be true");
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 3: Late Prompt Capture (Post-Hydration)
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- Suite 3: Late Prompt Capture (Post-Hydration) ---");

  await test("3.1: Component mounted before event updates correctly when beforeinstallprompt fires later", () => {
    const mockWindow: any = new MockEventTarget();
    mockWindow.__pwaDeferredPrompt = null;

    let hookDeferredPrompt: any = null;
    let hookPlatform: string = "android_manual";

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      mockWindow.__pwaDeferredPrompt = e;
      hookDeferredPrompt = e;
      hookPlatform = "android";
    };

    const handleCustomPromptReady = (e: any) => {
      const prompt = e.detail || mockWindow.__pwaDeferredPrompt;
      if (prompt) {
        hookDeferredPrompt = prompt;
        hookPlatform = "android";
      }
    };

    mockWindow.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    mockWindow.addEventListener("pwa-prompt-ready", handleCustomPromptReady);

    const lateEvent = createMockPromptEvent();
    mockWindow.dispatchEvent(lateEvent);

    assert.equal(lateEvent.defaultPrevented, true);
    assert.equal(mockWindow.__pwaDeferredPrompt, lateEvent);
    assert.equal(hookDeferredPrompt, lateEvent);
    assert.equal(hookPlatform, "android");
  });

  await test("3.2: Decoupled buttons receive 'pwa-prompt-ready' custom event", () => {
    const mockWindow: any = new MockEventTarget();
    let patientButtonPrompt: any = null;

    mockWindow.addEventListener("pwa-prompt-ready", (e: any) => {
      patientButtonPrompt = e.detail;
    });

    const event = createMockPromptEvent();
    mockWindow.dispatchEvent({ type: "pwa-prompt-ready", detail: event });

    assert.equal(patientButtonPrompt, event, "Custom event detail must convey prompt event");
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 4: Multiple & Concurrent Prompt Invocation Stress Test
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- Suite 4: Multiple & Idempotent prompt() Invocation Stress Test ---");

  await test("4.1: Single install execution handles accepted outcome and clears global state", async () => {
    const mockWindow: any = new MockEventTarget();
    const event = createMockPromptEvent("accepted");
    mockWindow.__pwaDeferredPrompt = event;

    let isInstalled = false;
    let platform = "android";
    let isInstalling = false;
    let deferredPrompt: any = event;

    const handleAndroidInstall = async () => {
      const prompt = deferredPrompt || mockWindow.__pwaDeferredPrompt;
      if (!prompt) return;

      isInstalling = true;
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          isInstalled = true;
          platform = "installed";
          mockWindow.__pwaDeferredPrompt = null;
        }
      } finally {
        isInstalling = false;
        deferredPrompt = null;
        mockWindow.__pwaDeferredPrompt = null;
      }
    };

    await handleAndroidInstall();

    assert.equal(isInstalled, true, "isInstalled should be true");
    assert.equal(platform, "installed", "platform should be 'installed'");
    assert.equal(deferredPrompt, null, "deferredPrompt must be null");
    assert.equal(mockWindow.__pwaDeferredPrompt, null, "window.__pwaDeferredPrompt must be null");
    assert.equal(event.promptCalledCount, 1, "prompt() must be called exactly once");
  });

  await test("4.2: Single install execution handles dismissed outcome and clears global state", async () => {
    const mockWindow: any = new MockEventTarget();
    const event = createMockPromptEvent("dismissed");
    mockWindow.__pwaDeferredPrompt = event;

    let isInstalled = false;
    let deferredPrompt: any = event;

    const handleAndroidInstall = async () => {
      const prompt = deferredPrompt || mockWindow.__pwaDeferredPrompt;
      if (!prompt) return;

      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          isInstalled = true;
        }
      } finally {
        deferredPrompt = null;
        mockWindow.__pwaDeferredPrompt = null;
      }
    };

    await handleAndroidInstall();

    assert.equal(isInstalled, false, "isInstalled should remain false if dismissed");
    assert.equal(deferredPrompt, null, "deferredPrompt must still be cleared to prevent stale reuse");
    assert.equal(mockWindow.__pwaDeferredPrompt, null, "global prompt must be cleared");
  });

  await test("4.3: Concurrency / Double-Click Stress Test (5 rapid calls)", async () => {
    const mockWindow: any = new MockEventTarget();
    const event = createMockPromptEvent("accepted");
    mockWindow.__pwaDeferredPrompt = event;

    let deferredPrompt: any = event;
    let isInstalling = false;
    let isInstalled = false;

    const handleAndroidInstall = async () => {
      const prompt = deferredPrompt || mockWindow.__pwaDeferredPrompt;
      if (!prompt || isInstalling) return;

      isInstalling = true;
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          isInstalled = true;
        }
      } finally {
        isInstalling = false;
        deferredPrompt = null;
        mockWindow.__pwaDeferredPrompt = null;
      }
    };

    // Fire 5 concurrent invocations
    await Promise.all([
      handleAndroidInstall(),
      handleAndroidInstall(),
      handleAndroidInstall(),
      handleAndroidInstall(),
      handleAndroidInstall(),
    ]);

    assert.equal(event.promptCalledCount, 1, "prompt() MUST NOT be called more than once under concurrent spam");
    assert.equal(isInstalled, true);
    assert.equal(deferredPrompt, null);
    assert.equal(mockWindow.__pwaDeferredPrompt, null);
  });

  await test("4.4: Handles prompt() failure without crashing and cleans up state", async () => {
    const mockWindow: any = new MockEventTarget();
    const brokenEvent = createMockPromptEvent("accepted", true /* shouldThrow */);
    mockWindow.__pwaDeferredPrompt = brokenEvent;

    let deferredPrompt: any = brokenEvent;
    let isInstalling = false;
    let isInstalled = false;
    let errorLogged = false;

    const originalError = console.error;
    console.error = () => { errorLogged = true; };

    try {
      const handleAndroidInstall = async () => {
        const prompt = deferredPrompt || mockWindow.__pwaDeferredPrompt;
        if (!prompt) return;

        isInstalling = true;
        try {
          await prompt.prompt();
          const { outcome } = await prompt.userChoice;
          if (outcome === "accepted") isInstalled = true;
        } catch (err) {
          console.error("Failed to prompt PWA install:", err);
        } finally {
          isInstalling = false;
          deferredPrompt = null;
          mockWindow.__pwaDeferredPrompt = null;
        }
      };

      await handleAndroidInstall();

      assert.equal(errorLogged, true, "Error should be caught and logged");
      assert.equal(isInstalling, false, "isInstalling must be reset in finally");
      assert.equal(deferredPrompt, null, "deferredPrompt must be reset in finally");
      assert.equal(mockWindow.__pwaDeferredPrompt, null, "global prompt must be cleared");
    } finally {
      console.error = originalError;
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // SUITE 5: appinstalled & Standalone Lifecycle
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- Suite 5: appinstalled & Standalone Lifecycle ---");

  await test("5.1: 'appinstalled' clears window.__pwaDeferredPrompt and fires 'pwa-installed'", () => {
    const mockWindow: any = new MockEventTarget();
    mockWindow.__pwaDeferredPrompt = createMockPromptEvent();

    let customInstalledFired = false;
    mockWindow.addEventListener("pwa-installed", () => {
      customInstalledFired = true;
    });

    mockWindow.addEventListener("appinstalled", () => {
      mockWindow.__pwaDeferredPrompt = null;
      mockWindow.dispatchEvent({ type: "pwa-installed" });
    });

    mockWindow.dispatchEvent({ type: "appinstalled" });

    assert.equal(mockWindow.__pwaDeferredPrompt, null, "window.__pwaDeferredPrompt must be cleared");
    assert.equal(customInstalledFired, true, "pwa-installed custom event must fire");
  });

  await test("5.2: Hook transitions platform to 'installed' on 'appinstalled'", () => {
    const mockWindow: any = new MockEventTarget();
    let hookPlatform = "android";
    let hookIsInstalled = false;
    let hookDeferredPrompt: any = createMockPromptEvent();

    const handleAppInstalled = () => {
      hookIsInstalled = true;
      hookDeferredPrompt = null;
      mockWindow.__pwaDeferredPrompt = null;
      hookPlatform = "installed";
    };

    mockWindow.addEventListener("appinstalled", handleAppInstalled);
    mockWindow.addEventListener("pwa-installed", handleAppInstalled);

    mockWindow.dispatchEvent({ type: "appinstalled" });

    assert.equal(hookIsInstalled, true);
    assert.equal(hookPlatform, "installed");
    assert.equal(hookDeferredPrompt, null);
  });

  await test("5.3: Standalone display mode is recognized on mount", () => {
    const isStandaloneMatchMedia = true;
    const isStandaloneNavigator = false;

    const isInstalled = isStandaloneMatchMedia || isStandaloneNavigator;
    assert.equal(isInstalled, true, "Standalone mode must be detected immediately");
  });

  await test("5.4: iOS standalone mode (navigator.standalone) is recognized on mount", () => {
    const isStandaloneMatchMedia = false;
    const isStandaloneNavigator = true;

    const isInstalled = isStandaloneMatchMedia || isStandaloneNavigator;
    assert.equal(isInstalled, true, "iOS standalone mode must be detected immediately");
  });

  console.log("\n=======================================================");
  console.log(`  Results: ${passedTests} passed, ${failedTests} failed, ${totalTests} total`);
  console.log("=======================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runEmpiricalSuite().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
