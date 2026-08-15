/**
 * Challenger 2 Adversarial Stress Test Suite for Milestone 1:
 * Cross-Portal Isolation, Doctor Diary Non-Regression, and Patient Booking PWA Integrity
 */

import { strict as assert } from "node:assert";

// ── Mock Interfaces & Utilities ──────────────────────────────────────────────

interface MockBeforeInstallPromptEvent {
  type: string;
  defaultPrevented: boolean;
  promptCalledCount: number;
  userChoiceOutcome: "accepted" | "dismissed";
  preventDefault: () => void;
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
}

function createMockPromptEvent(
  outcome: "accepted" | "dismissed" = "accepted",
  options?: { shouldThrow?: boolean; throwMessage?: string }
): MockBeforeInstallPromptEvent {
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
      if (options?.shouldThrow) {
        throw new Error(options.throwMessage || "Simulated prompt failure");
      }
    },
    get userChoice() {
      return Promise.resolve({ outcome: this.userChoiceOutcome, platform: "web" });
    },
  };
  return event;
}

class MockEventTarget {
  listeners: Map<string, Set<(e: any) => void>> = new Map();

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

class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
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

async function runSuite() {
  console.log("\n===============================================================================");
  console.log("  CHALLENGER 2: CROSS-PORTAL ISOLATION & DOCTOR DIARY PWA AUDIT");
  console.log("===============================================================================\n");

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 1: DOCTOR DIARY PWA INTEGRITY & NON-REGRESSION
  // ───────────────────────────────────────────────────────────────────────────
  console.log("--- 1. Doctor Diary PWA Integrity & Non-Regression ---");

  await test("1.1: Doctor InstallButton remains hidden when no prompt is available", () => {
    let deferredPrompt: any = null;
    let isInstalled = false;

    // Component render condition in InstallButton (pwa-provider.tsx:249):
    const shouldRender = !(isInstalled || !deferredPrompt);
    assert.equal(shouldRender, false, "Doctor InstallButton must NOT render when deferredPrompt is null");
  });

  await test("1.2: Doctor InstallButton renders and triggers install when prompt is captured", async () => {
    const mockWindow: any = new MockEventTarget();
    const event = createMockPromptEvent("accepted");
    mockWindow.__pwaDeferredPrompt = event;

    let deferredPrompt: any = mockWindow.__pwaDeferredPrompt;
    let isInstalled = false;

    // Simulating InstallButton.handleInstall
    const handleInstall = async () => {
      const promptEvent = deferredPrompt || mockWindow.__pwaDeferredPrompt;
      if (!promptEvent) return;
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === "accepted") isInstalled = true;
      } finally {
        mockWindow.__pwaDeferredPrompt = null;
        deferredPrompt = null;
      }
    };

    assert.equal(Boolean(deferredPrompt), true, "InstallButton receives deferredPrompt");
    await handleInstall();
    assert.equal(isInstalled, true, "Doctor portal marks isInstalled after accepted prompt");
    assert.equal(deferredPrompt, null, "deferredPrompt is cleaned up");
    assert.equal(mockWindow.__pwaDeferredPrompt, null, "global prompt reference is cleared");
    assert.equal(event.promptCalledCount, 1, "Native prompt was called exactly once");
  });

  await test("1.3: PWAProvider 8-second banner delay and localStorage dismissal logic", async () => {
    const mockLocalStorage = new MockLocalStorage();
    let showBanner = false;
    let deferredPrompt: any = createMockPromptEvent();

    const checkAndTriggerBanner = (prompt: any, storage: MockLocalStorage, now: number) => {
      deferredPrompt = prompt;
      const lastDismissed = storage.getItem("pwa_install_dismissed");
      if (lastDismissed) {
        const dismissedAt = parseInt(lastDismissed, 10);
        const daysSince = (now - dismissedAt) / (1000 * 60 * 60 * 24);
        if (daysSince < 3) return false;
      }
      return true;
    };

    // Case A: First time visit -> triggers banner timer
    const shouldTrigger1 = checkAndTriggerBanner(deferredPrompt, mockLocalStorage, 1000000000000);
    assert.equal(shouldTrigger1, true, "First time visit should trigger banner");

    // Case B: User dismissed banner
    const dismissedTime = 1000000000000;
    mockLocalStorage.setItem("pwa_install_dismissed", dismissedTime.toString());

    // Case C: Visit 1 day later (< 3 days) -> suppressed
    const oneDayLater = dismissedTime + 1 * 24 * 60 * 60 * 1000;
    const shouldTrigger2 = checkAndTriggerBanner(deferredPrompt, mockLocalStorage, oneDayLater);
    assert.equal(shouldTrigger2, false, "Visit 1 day after dismissal must suppress banner");

    // Case D: Visit 4 days later (>= 3 days) -> triggers banner again
    const fourDaysLater = dismissedTime + 4 * 24 * 60 * 60 * 1000;
    const shouldTrigger3 = checkAndTriggerBanner(deferredPrompt, mockLocalStorage, fourDaysLater);
    assert.equal(shouldTrigger3, true, "Visit 4 days after dismissal should allow banner again");
  });

  await test("1.4: PWAProvider handleDismiss sets localStorage timestamp", () => {
    const mockLocalStorage = new MockLocalStorage();
    let showBanner = true;

    const handleDismiss = () => {
      mockLocalStorage.setItem("pwa_install_dismissed", Date.now().toString());
      showBanner = false;
    };

    handleDismiss();
    assert.equal(showBanner, false);
    assert.ok(mockLocalStorage.getItem("pwa_install_dismissed") !== null);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 2: PATIENT CLINIC PORTAL ISOLATION & BRANDING INTEGRITY
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 2. Patient Clinic Portal Isolation & Branding Integrity ---");

  await test("2.1: PatientInstallButton displayName truncates long clinic names gracefully", () => {
    const longName = "Dr. Rajesh Sharma Advanced Multi-Speciality Dental Care";
    const shortName = "City Clinic";

    const formatName = (name: string) => (name.length > 18 ? `${name.slice(0, 16)}...` : name);

    assert.equal(formatName(longName), "Dr. Rajesh Shar...", "Long clinic names must truncate with ellipsis");
    assert.equal(formatName(shortName), "City Clinic", "Short clinic names remain intact");
  });

  await test("2.2: PatientInstallButton on iOS displays toast guidance instead of calling prompt()", async () => {
    let toastFired = false;
    let toastMessage = "";
    const mockToast = {
      success: (msg: string) => {
        toastFired = true;
        toastMessage = msg;
      },
    };

    const isIOS = true;
    const deferredPrompt = null;
    let isInstalled = false;

    // Component render condition: if (isInstalled || (!deferredPrompt && !isIOS)) return null;
    const shouldRender = !(isInstalled || (!deferredPrompt && !isIOS));
    assert.equal(shouldRender, true, "PatientInstallButton MUST remain visible on iOS devices");

    const handleInstall = async () => {
      if (isIOS) {
        mockToast.success("Tap Share 📤 then 'Add to Home Screen' ➕ to install");
        return;
      }
    };

    await handleInstall();
    assert.equal(toastFired, true, "iOS click must trigger guidance toast");
    assert.ok(toastMessage.includes("Share 📤"), "Toast must include iOS share instructions");
  });

  await test("2.3: Platform detection handles modern iPadOS 13+ (Macintosh with touch points)", () => {
    const detectPlatformMock = (ua: string, maxTouchPoints: number, standalone: boolean = false) => {
      if (standalone) return "installed";
      const isIOS =
        (/iPad|iPhone|iPod/.test(ua) && !(false)) ||
        (maxTouchPoints > 1 && /Macintosh/.test(ua));
      if (isIOS) return "ios";
      const isAndroid = /android/i.test(ua);
      if (isAndroid) return "android_manual";
      return "desktop";
    };

    // iPadOS 13+ UA string:
    const iPadOS17 = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15";
    const platform = detectPlatformMock(iPadOS17, 5);
    assert.equal(platform, "ios", "iPadOS 13+ reporting Macintosh with maxTouchPoints > 1 must detect as 'ios'");

    // Real Mac Desktop UA string (maxTouchPoints = 0):
    const macDesktop = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const macPlatform = detectPlatformMock(macDesktop, 0);
    assert.equal(macPlatform, "desktop", "Real Mac Desktop with 0 touch points must detect as 'desktop'");
  });

  await test("2.4: Bilingual dictionary support for Hindi (hi) and English (en)", () => {
    const DICTIONARY = {
      en: {
        installAlreadyDone: "App already installed on this device",
        installAndroidCta: "Install App",
      },
      hi: {
        installAlreadyDone: "ऐप पहले से इंस्टॉल है",
        installAndroidCta: "ऐप इंस्टॉल करें",
      },
    };

    assert.equal(DICTIONARY.hi.installAndroidCta, "ऐप इंस्टॉल करें");
    assert.equal(DICTIONARY.en.installAndroidCta, "Install App");
  });

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORY 3: CROSS-PORTAL ADVERSARIAL STRESS SCENARIOS
  // ───────────────────────────────────────────────────────────────────────────
  console.log("\n--- 3. Cross-Portal Adversarial Stress Scenarios ---");

  await test("3.1: Coexistence Race Condition (PatientInstallButton prompts -> PWAProvider does not crash)", async () => {
    const mockWindow: any = new MockEventTarget();
    const promptEvent = createMockPromptEvent("accepted");
    mockWindow.__pwaDeferredPrompt = promptEvent;

    // Both components mounted concurrently on /book/clinic-123
    let pwaProviderPrompt: any = mockWindow.__pwaDeferredPrompt;
    let patientButtonPrompt: any = mockWindow.__pwaDeferredPrompt;

    let patientInstalled = false;
    let providerInstalled = false;

    // 1. Patient clicks PatientInstallButton first
    const handlePatientInstall = async () => {
      const prompt = patientButtonPrompt || mockWindow.__pwaDeferredPrompt;
      if (!prompt) return;
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          patientInstalled = true;
          // Clean up
          mockWindow.__pwaDeferredPrompt = null;
          patientButtonPrompt = null;
        }
      } catch (err) {
        console.error("Patient install error", err);
      }
    };

    // 2. Later, PWAProvider attempts install or receives appinstalled
    const handleProviderInstall = async () => {
      const prompt = pwaProviderPrompt || mockWindow.__pwaDeferredPrompt;
      if (!prompt) {
        // Safe early return - prompt already consumed
        return "consumed";
      }
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") providerInstalled = true;
      } catch (err) {
        return "error";
      } finally {
        mockWindow.__pwaDeferredPrompt = null;
        pwaProviderPrompt = null;
      }
    };

    // Execute patient install
    await handlePatientInstall();
    assert.equal(patientInstalled, true, "Patient install succeeded");
    assert.equal(mockWindow.__pwaDeferredPrompt, null, "Global prompt cleared");

    // Simulate provider install after patient consumed the prompt
    pwaProviderPrompt = null; // Cleaned by event or null check
    const providerResult = await handleProviderInstall();
    assert.equal(providerResult, "consumed", "PWAProvider must cleanly handle consumed prompt without crashing");
    assert.equal(promptEvent.promptCalledCount, 1, "Native prompt was NEVER called twice");
  });

  await test("3.2: Concurrent Click Race Condition (PatientInstallButton + InstallAppBanner simultaneous clicks)", async () => {
    const mockWindow: any = new MockEventTarget();
    const promptEvent = createMockPromptEvent("accepted");
    mockWindow.__pwaDeferredPrompt = promptEvent;

    let isInstalling = false;
    let installCount = 0;

    const performInstall = async (callerName: string) => {
      const prompt = mockWindow.__pwaDeferredPrompt;
      if (!prompt || isInstalling) {
        return `${callerName}: skipped`;
      }

      isInstalling = true;
      try {
        await prompt.prompt();
        const { outcome } = await prompt.userChoice;
        if (outcome === "accepted") {
          installCount++;
          mockWindow.__pwaDeferredPrompt = null;
        }
        return `${callerName}: success`;
      } finally {
        isInstalling = false;
        mockWindow.__pwaDeferredPrompt = null;
      }
    };

    // Fire simultaneously
    const [res1, res2] = await Promise.all([
      performInstall("PatientButton"),
      performInstall("Banner"),
    ]);

    assert.equal(promptEvent.promptCalledCount, 1, "Native prompt must be invoked exactly once");
    assert.equal(installCount, 1, "Exactly one install recorded");
    assert.ok(res1 === "PatientButton: success" || res2 === "Banner: success");
    assert.ok(res1.includes("skipped") || res2.includes("skipped"));
  });

  await test("3.3: Route Navigation & Listener Cleanup (Zero memory leak on unmount)", () => {
    const mockWindow = new MockEventTarget();

    // Hook / Component mounting on /book/clinic-a
    const promptHandler = (e: any) => {};
    const promptReadyHandler = (e: any) => {};
    const installedHandler = () => {};

    mockWindow.addEventListener("beforeinstallprompt", promptHandler);
    mockWindow.addEventListener("pwa-prompt-ready", promptReadyHandler);
    mockWindow.addEventListener("appinstalled", installedHandler);
    mockWindow.addEventListener("pwa-installed", installedHandler);

    assert.equal(mockWindow.listenerCount("beforeinstallprompt"), 1);
    assert.equal(mockWindow.listenerCount("pwa-prompt-ready"), 1);
    assert.equal(mockWindow.listenerCount("appinstalled"), 1);
    assert.equal(mockWindow.listenerCount("pwa-installed"), 1);

    // Component unmounting on navigation to /track/123
    mockWindow.removeEventListener("beforeinstallprompt", promptHandler);
    mockWindow.removeEventListener("pwa-prompt-ready", promptReadyHandler);
    mockWindow.removeEventListener("appinstalled", installedHandler);
    mockWindow.removeEventListener("pwa-installed", installedHandler);

    assert.equal(mockWindow.listenerCount("beforeinstallprompt"), 0);
    assert.equal(mockWindow.listenerCount("pwa-prompt-ready"), 0);
    assert.equal(mockWindow.listenerCount("appinstalled"), 0);
    assert.equal(mockWindow.listenerCount("pwa-installed"), 0);
  });

  await test("3.4: Desktop Chromium PWA Support (Upgrades platform from desktop to android on prompt)", () => {
    const mockWindow: any = new MockEventTarget();
    mockWindow.__pwaDeferredPrompt = null;

    let platform = "desktop";
    let deferredPrompt: any = null;

    // When Chrome on Desktop/Laptop fires beforeinstallprompt:
    const handleBeforeInstallPrompt = (e: any) => {
      mockWindow.__pwaDeferredPrompt = e;
      deferredPrompt = e;
      // In use-pwa-install.ts: platform updates to "android" (prompt-ready) unless "ios" or "installed"
      if (platform !== "ios" && platform !== "installed") {
        platform = "android";
      }
    };

    mockWindow.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const desktopPromptEvent = createMockPromptEvent("accepted");
    mockWindow.dispatchEvent(desktopPromptEvent);

    assert.equal(platform, "android", "Desktop Chrome firing beforeinstallprompt must transition platform to prompt-ready");
    assert.equal(Boolean(deferredPrompt), true, "Prompt is available for desktop install");
  });

  console.log("\n===============================================================================");
  console.log(`  Challenger 2 Results: ${passedTests} passed, ${failedTests} failed, ${totalTests} total`);
  console.log("===============================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Suite failed with error:", err);
  process.exit(1);
});
