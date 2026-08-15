## 2026-08-14T23:26:39Z

You are Worker 1 for Milestone 1 (SW Registration & Early Prompt Global Capture).
Your working directory is: e:\doctor-appointment-saas-platform\.agents\teamwork_preview_worker_m1_1\
Please read:
- Original Request: e:\doctor-appointment-saas-platform\.agents\ORIGINAL_REQUEST.md
- Project Scope: e:\doctor-appointment-saas-platform\PROJECT.md
- Explorer 1 Report: e:\doctor-appointment-saas-platform\.agents\teamwork_preview_explorer_m1_1\handoff.md
- Explorer 2 Report: e:\doctor-appointment-saas-platform\.agents\teamwork_preview_explorer_m1_2\handoff.md
- Explorer 3 Report: e:\doctor-appointment-saas-platform\.agents\teamwork_preview_explorer_m1_3\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You have exclusive write ownership over:
- `src/types/pwa.d.ts`
- `src/app/layout.tsx`
- `src/components/pwa-provider.tsx`
- `src/hooks/use-pwa-install.ts`

Your Implementation Tasks:
1. Create `src/types/pwa.d.ts` with global type definitions for `BeforeInstallPromptEvent`, `window.__pwaDeferredPrompt`, `WindowEventMap` extensions (`beforeinstallprompt`, `pwa-prompt-ready`, `appinstalled`, `pwa-installed`), and `Navigator.standalone`.
2. Update `src/app/layout.tsx`: Add the synchronous inline `<script id="pwa-early-capture">` inside `<head>` to capture `beforeinstallprompt` from millisecond zero into `window.__pwaDeferredPrompt` and dispatch `pwa-prompt-ready`.
3. Update `src/components/pwa-provider.tsx`:
   - Implement `registerServiceWorker()` with immediate execution if `document.readyState === "complete"` and `{ once: true }` on `"load"` if loading.
   - Sync `PWAProvider`, `InstallButton`, and `PatientInstallButton` with `window.__pwaDeferredPrompt` and `pwa-prompt-ready` / `appinstalled` / `pwa-installed` events.
4. Update `src/hooks/use-pwa-install.ts`:
   - Pick up `window.__pwaDeferredPrompt` on mount.
   - Listen to `pwa-prompt-ready`, `beforeinstallprompt`, and `appinstalled` events.
   - Maintain backwards-compatible return values while ensuring `canInstall` / `handleAndroidInstall` work seamlessly.
5. Verify your changes by running typecheck (`npx tsc --noEmit` or build) and check for any syntax/compilation issues.
6. Write your handoff report to `e:\doctor-appointment-saas-platform\.agents\teamwork_preview_worker_m1_1\handoff.md` and message parent when complete.
