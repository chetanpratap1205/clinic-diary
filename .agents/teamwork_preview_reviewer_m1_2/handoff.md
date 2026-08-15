# Milestone 1 Review Handoff Report: SW Registration & Early Prompt Global Capture

**Agent**: Reviewer 2 (`teamwork_preview_reviewer_m1_2`)  
**Roles**: Reviewer, Adversarial Critic  
**Milestone**: M1 (Service Worker Registration & Early Prompt Global Capture)  
**Parent Agent**: `f8cc414e-09ae-44ee-b115-ffb537a1e7a2`  
**Verdict**: **REQUEST_CHANGES**  

---

## 1. Observation

### 1.1 TypeScript Compilation Error TS2661 in Milestone 1 Files
Running strict TypeScript verification (`npx tsc --project tsconfig.json --noEmit`) revealed a compilation failure in the files modified in Milestone 1:

```
src/components/pwa-provider.tsx(8,15): error TS2661: Cannot export 'BeforeInstallPromptEvent'. Only local declarations can be exported from a module.
src/hooks/use-pwa-install.ts(5,15): error TS2661: Cannot export 'BeforeInstallPromptEvent'. Only local declarations can be exported from a module.
```

- **File `src/components/pwa-provider.tsx` line 8**:
  ```typescript
  export type { BeforeInstallPromptEvent };
  ```
- **File `src/hooks/use-pwa-install.ts` line 5**:
  ```typescript
  export type { BeforeInstallPromptEvent };
  ```

---

## 2. Logic Chain

1. In `src/types/pwa.d.ts`, `interface BeforeInstallPromptEvent` is declared as an ambient top-level declaration in the global namespace (because `pwa.d.ts` does not contain top-level `import` or `export` statements).
2. In `src/components/pwa-provider.tsx` and `src/hooks/use-pwa-install.ts`, attempting to re-export an ambient global declaration via `export type { BeforeInstallPromptEvent };` violates TypeScript's module isolation rules (`TS2661: Only local declarations can be exported from a module`).
3. Because `BeforeInstallPromptEvent` is declared in `src/types/pwa.d.ts` and included by `tsconfig.json` (`"include": ["**/*.ts", "**/*.tsx"]`), `BeforeInstallPromptEvent` is **already available globally in all files** without needing to be imported or re-exported.
4. Removing the illegal re-export statements (`export type { BeforeInstallPromptEvent };`) from `src/components/pwa-provider.tsx` and `src/hooks/use-pwa-install.ts` completely resolves the TS2661 errors.

---

## 3. Review Dimensions & Architecture Evaluation

### 3.1 Event Listener Cleanup & Memory Safety (PASSED)
- `PWAProvider`: Attaches named handlers (`promptHandler`, `promptReadyHandler`, `installedHandler`) and unregisters all 4 in the cleanup callback (`useEffect` return).
- `InstallButton`: Attaches named handlers (`handler`, `promptReadyHandler`, `installedHandler`) and unregisters all 4 in the cleanup callback.
- `PatientInstallButton`: Attaches named handlers (`handler`, `promptReadyHandler`, `installedHandler`) and unregisters all 4 in the cleanup callback.
- `usePWAInstall`: Attaches named handlers (`handleBeforeInstallPrompt`, `handleCustomPromptReady`, `handleAppInstalled`) and unregisters all 4 in the cleanup callback.
- No memory leaks or listener accumulation across Next.js client-side navigations.

### 3.2 Next.js App Router (React 19) Compatibility (PASSED)
- Inlined `<script id="pwa-early-capture">` inside `<head>` in `src/app/layout.tsx` is server-rendered directly into initial HTML, reliably capturing `beforeinstallprompt` from millisecond zero.
- Client components correctly use `"use client"` and guard window/navigator access.

### 3.3 Adversarial Stress Testing (PASSED)
- Single-use prompt lifecycle is protected via `isInstalling` state and cleanup in `finally` blocks.
- `matchMedia("(display-mode: standalone)")` and `navigator.standalone` prevent duplicate install prompts when running installed.

---

## 4. Caveats

1. **Unrelated tracking-client.tsx Syntax Errors**: `src/app/track/[appointmentId]/tracking-client.tsx` has pre-existing JSX syntax errors (extra `</div>` / missing fragment) which are outside Milestone 1 and part of Milestone 2.
2. **Non-Chromium Browsers**: Safari (iOS/macOS) and Firefox do not fire `beforeinstallprompt`. iOS relies on manual Share sheet instructions as designed.

---

## 5. Conclusion & Action Items

The logic and architecture of Milestone 1 are sound, but the work product cannot be approved until the TypeScript TS2661 compilation errors are fixed.

**Action Required for Worker 1**:
1. In `src/components/pwa-provider.tsx`, remove line 8: `export type { BeforeInstallPromptEvent };`
2. In `src/hooks/use-pwa-install.ts`, remove line 5: `export type { BeforeInstallPromptEvent };`
3. Re-run `npx tsc --project tsconfig.json --noEmit` to verify that `pwa-provider.tsx` and `use-pwa-install.ts` emit 0 errors.

**Verdict**: **REQUEST_CHANGES**

---

## 6. Verification Method

To verify the fix:
```powershell
npx tsc src/types/pwa.d.ts src/app/layout.tsx src/components/pwa-provider.tsx src/hooks/use-pwa-install.ts --noEmit --skipLibCheck --jsx react-jsx
```
Expected output: Exit code 0 with zero errors.
