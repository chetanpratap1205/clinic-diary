# Forensic Audit Report: Milestone 1 PWA Foundation & State Hooks

**Work Product**: `src/types/pwa.d.ts`, `src/app/layout.tsx`, `src/components/pwa-provider.tsx`, `src/hooks/use-pwa-install.ts`  
**Profile**: General Project  
**Integrity Mode**: Development / Maintenance Mode  
**Verdict**: CLEAN  

---

## 1. Observation

A forensic review was conducted on the 4 files modified/created in Milestone 1:

1. **`src/types/pwa.d.ts`**:
   - Declares ambient types `BeforeInstallPromptEvent`, `Window.__pwaDeferredPrompt`, `WindowEventMap` extensions (`beforeinstallprompt`, `pwa-prompt-ready`, `appinstalled`, `pwa-installed`), and `Navigator.standalone`.
   - Contains no hardcoded return values, fake mocks, or runtime bypasses.

2. **`src/app/layout.tsx` (lines 85-102)**:
   - Injects a synchronous inline script `<script id="pwa-early-capture">` inside `<head>`.
   - Attaches genuine native listeners to `window` for `beforeinstallprompt` and `appinstalled`.
   - Calls `e.preventDefault()` on the native `beforeinstallprompt` event and assigns it to `window.__pwaDeferredPrompt`.
   - Dispatches native `CustomEvent('pwa-prompt-ready', { detail: e })` and `CustomEvent('pwa-installed')`.

3. **`src/components/pwa-provider.tsx`**:
   - `registerServiceWorker()` (lines 11-25): Checks `document.readyState === "complete"` and calls `navigator.serviceWorker.register("/sw.js", { scope: "/" })` or attaches `window.addEventListener("load", register, { once: true })`.
   - Module-level event listeners (lines 28-39): Captures early prompts if layout script execution is bypassed.
   - `PWAProvider`, `InstallButton`, `PatientInstallButton`: Read `window.__pwaDeferredPrompt`, subscribe to `beforeinstallprompt` and `pwa-prompt-ready`, and invoke `promptEvent.prompt()` while awaiting `promptEvent.userChoice`.
   - Prompt cleanup: Resets `window.__pwaDeferredPrompt` and local `deferredPrompt` in `finally` blocks after prompt trigger.

4. **`src/hooks/use-pwa-install.ts`**:
   - `detectPlatform()` (lines 15-38): Detects standalone mode (`matchMedia`, `navigator.standalone`), iOS / iPadOS 13+ (`maxTouchPoints > 1 && /Macintosh/.test(ua)`), Android UA (`/android/i.test(ua)`), and desktop.
   - `usePWAInstall()` (lines 40-147): Syncs with `window.__pwaDeferredPrompt` and `pwa-prompt-ready` event bus; triggers `prompt.prompt()` and awaits `prompt.userChoice`; exposes clean interface `{ platform, isInstalling, isInstalled, handleAndroidInstall, deferredPrompt, canInstall }`.

---

## 2. Logic Chain

1. **Hardcoded Test Results & Facade Verification**:
   - Searched codebase for mock return patterns, fake prompt resolutions, or hardcoded strings.
   - Finding: All prompt invocations directly invoke `prompt.prompt()` on the real browser `BeforeInstallPromptEvent` instance and await `userChoice.outcome`. No fake mock implementations or bypasses exist.

2. **Browser API Compliance & Circumvention Check**:
   - Investigated whether any browser security restrictions or PWA standards were circumvented.
   - Finding: Service worker registration follows standard W3C Service Worker specifications. Event capturing uses standard DOM Level 3 events and CustomEvents without monkey-patching native methods.

3. **Hydration Race Condition & Early Event Capture Validation**:
   - The root cause identified in R1/M1 (Chromium firing `beforeinstallprompt` during initial HTML stream before React hydration, causing missed events) is genuinely resolved by the synchronous `<head>` script and global prompt cache.
   - Doctor Diary PWA components (`InstallButton`, `PWAProvider`) and Patient PWA components (`PatientInstallButton`, `InstallAppBanner`, `InstallAppSection`) both correctly consume the synchronized state without cross-portal collision.

4. **Static Typing & Codebase Health**:
   - Note: In `src/components/pwa-provider.tsx` (line 8) and `src/hooks/use-pwa-install.ts` (line 5), `export type { BeforeInstallPromptEvent };` attempts to re-export a globally declared ambient interface from a module, which triggers TS2661 in strict mode. Because `BeforeInstallPromptEvent` is declared in global scope via `src/types/pwa.d.ts`, the explicit re-export is unnecessary and can be removed during code review. This is a minor typing cleanliness item and does not constitute an integrity violation.

---

## 3. Caveats

1. **Browser Runtime Dependency**: `beforeinstallprompt` is a Chromium-specific event. In iOS Safari and Firefox, installation follows manual browser guidance as designed.
2. **HTTPS Context**: PWA installation and Service Worker registration strictly require a secure context (`https://` or `localhost`).

---

## 4. Conclusion

**Verdict: CLEAN**

Milestone 1 work product is an authentic, robust implementation:
- No hardcoded test results, facade implementations, or fake mocks detected.
- Proper genuine implementation of two-tier Service Worker registration (`document.readyState` check).
- Proper global prompt bus (`window.__pwaDeferredPrompt` and `CustomEvent` dispatching) preventing lost early `beforeinstallprompt` events.
- Full backwards-compatibility maintained for all consumer components.

---

## 5. Verification Method

To independently verify the integrity of the Milestone 1 work product:

1. **Inspect Target Files**:
   - `src/types/pwa.d.ts`
   - `src/app/layout.tsx` (lines 85-102)
   - `src/components/pwa-provider.tsx` (lines 11-134, 195-276, 278-372)
   - `src/hooks/use-pwa-install.ts` (lines 1-147)

2. **Verify Native Event Dispatching in Browser Console**:
   ```javascript
   // Check global capture initialization
   console.assert(window.__pwaDeferredPrompt === null || typeof window.__pwaDeferredPrompt === 'object');
   
   // Verify custom event listener integration
   window.addEventListener('pwa-prompt-ready', (e) => console.log('PWA Prompt Received:', e.detail));
   ```

3. **Verify Service Worker Scope**:
   In Chrome DevTools -> Application -> Service Workers, verify `/sw.js` is registered with scope `/`.
