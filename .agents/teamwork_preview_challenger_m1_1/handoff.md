# Milestone 1 Challenger Report: SW Registration & Early Prompt Global Capture

**Agent**: Challenger 1 (`teamwork_preview_challenger_m1_1`)  
**Role**: Empirical Challenger (critic / specialist)  
**Milestone**: M1 (Service Worker Registration & Early Prompt Global Capture)  
**Parent Agent**: `f8cc414e-09ae-44ee-b115-ffb537a1e7a2`  
**Verdict**: **APPROVE**  

---

## 1. Observation

### 1.1 Empirical Verification Test Execution
An automated empirical challenge and stress-test suite was authored and executed at `scripts/empirical-challenge-m1.ts`.

**Command**:
```powershell
node scripts/empirical-challenge-m1.ts
```
**Output**:
```
=======================================================
  M1 Empirical Challenge & Stress Test Suite
=======================================================

--- Suite 1: Service Worker Registration & readyState ---
  ✓ PASS: 1.1: Registers SW immediately when document.readyState === 'complete'
  ✓ PASS: 1.2: Defers SW registration until 'load' when document.readyState === 'loading'
  ✓ PASS: 1.3: Defers SW registration until 'load' when document.readyState === 'interactive'
  ✓ PASS: 1.4: Handles SSR environment without window safely
  ✓ PASS: 1.5: Gracefully skips registration in unsupported browsers without crash
  ✓ PASS: 1.6: Handles SW registration rejection without uncaught exception

--- Suite 2: Early Prompt Capture (Pre-Hydration) ---
  ✓ PASS: 2.1: Inline head script sets window.__pwaDeferredPrompt and dispatches pwa-prompt-ready
  ✓ PASS: 2.2: Late-hydrating React hook initializes with pre-captured prompt

--- Suite 3: Late Prompt Capture (Post-Hydration) ---
  ✓ PASS: 3.1: Component mounted before event updates correctly when beforeinstallprompt fires later
  ✓ PASS: 3.2: Decoupled buttons receive 'pwa-prompt-ready' custom event

--- Suite 4: Multiple & Idempotent prompt() Invocation Stress Test ---
  ✓ PASS: 4.1: Single install execution handles accepted outcome and clears global state
  ✓ PASS: 4.2: Single install execution handles dismissed outcome and clears global state
  ✓ PASS: 4.3: Concurrency / Double-Click Stress Test (5 rapid calls)
  ✓ PASS: 4.4: Handles prompt() failure without crashing and cleans up state

--- Suite 5: appinstalled & Standalone Lifecycle ---
  ✓ PASS: 5.1: 'appinstalled' clears window.__pwaDeferredPrompt and fires 'pwa-installed'
  ✓ PASS: 5.2: Hook transitions platform to 'installed' on 'appinstalled'
  ✓ PASS: 5.3: Standalone display mode is recognized on mount
  ✓ PASS: 5.4: iOS standalone mode (navigator.standalone) is recognized on mount

=======================================================
  Results: 18 passed, 0 failed, 18 total
=======================================================
```

### 1.2 Review of Implementation Files
1. **`src/app/layout.tsx` (Lines 86-102)**:
   Synchronously captures `beforeinstallprompt` and `appinstalled` inside `<head>` before any React chunks or third-party scripts execute. Stores `e` on `window.__pwaDeferredPrompt` and dispatches `pwa-prompt-ready`.
2. **`src/components/pwa-provider.tsx` (Lines 10-25)**:
   Implements two-tier `registerServiceWorker()` which checks `document.readyState === "complete"`; if complete, registers immediately; otherwise registers on `window.addEventListener("load", register, { once: true })`.
3. **`src/hooks/use-pwa-install.ts` (Lines 40-147)**:
   Integrates pre-hydration capture check (`window.__pwaDeferredPrompt`), attaches listeners for both native `beforeinstallprompt` and custom `pwa-prompt-ready`, handles `appinstalled` / `pwa-installed`, and guarantees cleanup in `finally`.
4. **`src/types/pwa.d.ts` (Lines 1-40)**:
   Ambient definitions for `BeforeInstallPromptEvent`, `Window.__pwaDeferredPrompt`, `WindowEventMap`, and `Navigator.standalone`.

---

## 2. Logic Chain

1. **Early `beforeinstallprompt` Pre-Hydration**:
   - Because the inline `<script id="pwa-early-capture">` is in `<head>`, browser HTML streaming executes it before React hydration.
   - When `beforeinstallprompt` fires early, `e.preventDefault()` prevents unwanted native UI and stores `e` on `window.__pwaDeferredPrompt`.
   - When `usePWAInstall` or `PWAProvider` mounts later, step 2 of their `useEffect` directly reads `window.__pwaDeferredPrompt`, upgrading `platform` from `"android_manual"` to `"android"` and enabling `canInstall: true`.
   - *Empirically confirmed in Tests 2.1 & 2.2.*

2. **Late `beforeinstallprompt` Post-Hydration**:
   - If hydration occurs before Chromium fires `beforeinstallprompt`, the active event listeners in `usePWAInstall` and `pwa-provider.tsx` capture the event, populate state, and update UI.
   - *Empirically confirmed in Tests 3.1 & 3.2.*

3. **Multiple / Repeated `prompt()` Invocations**:
   - Calling `prompt()` on an already-prompted event throws `InvalidStateError`.
   - In `usePWAInstall`, `InstallButton`, `PatientInstallButton`, and `PWAProvider`, the `handleAndroidInstall` / `handleInstall` functions reset `deferredPrompt` and `window.__pwaDeferredPrompt` to `null` inside `finally`.
   - Under rapid concurrent spam (5 concurrent calls), only the first executes `prompt()`, while subsequent calls find `prompt === null` and safely return early without throwing.
   - *Empirically confirmed in Tests 4.1, 4.2, 4.3, & 4.4.*

4. **`appinstalled` Lifecycle**:
   - When the user installs the PWA, `appinstalled` clears `window.__pwaDeferredPrompt`, dispatches `pwa-installed`, and updates hook/component state to `isInstalled: true` / `platform: "installed"`.
   - Install buttons return `null` and disappear.
   - *Empirically confirmed in Tests 5.1 & 5.2.*

5. **`document.readyState` Service Worker Registration**:
   - On Next.js client navigation or late hydration, `document.readyState` is `"complete"`, so `registerServiceWorker()` registers immediately without waiting for a `"load"` event that already passed.
   - On fast initial load where `document.readyState` is `"loading"` or `"interactive"`, registration attaches `{ once: true }` on `"load"`.
   - *Empirically confirmed in Tests 1.1, 1.2, & 1.3.*

---

## 3. Caveats & Minor Observations

1. **Ambient Type Re-export Warning**:
   - In `src/components/pwa-provider.tsx` (line 8) and `src/hooks/use-pwa-install.ts` (line 5), `export type { BeforeInstallPromptEvent };` is present. Because `BeforeInstallPromptEvent` is declared as ambient global in `src/types/pwa.d.ts`, attempting to re-export it in some standalone TS configurations can emit `TS2661`. It is recommended to simply omit the redundant re-export lines in subsequent milestones.
2. **Unrelated Pre-existing Error in Track Client**:
   - A syntax error exists in `src/app/track/[appointmentId]/tracking-client.tsx` (lines 756-781). This is out of M1 scope and falls under M2/M3 tracking layout updates.

---

## 4. Conclusion

**Verdict: APPROVE**

The Milestone 1 implementation is robust, correct, and completely eliminates the Service Worker registration race condition and early install prompt loss. All 5 critical edge-case scenarios passed empirical verification across 18 automated tests with 0 failures.

---

## 5. Verification Method

To independently verify the test suite:
```powershell
node scripts/empirical-challenge-m1.ts
```
Expected output: 18 passed, 0 failed.
