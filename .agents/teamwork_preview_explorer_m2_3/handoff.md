# Milestone 2 — Explorer 3 Handoff Report: Strict TypeScript Compliance & Route Isolation Blueprint

## 1. Observation

### 1.1 TypeScript Compilation Status (`npx tsc --project tsconfig.json --noEmit`)
Running `npx tsc --project tsconfig.json --noEmit` yielded the following compiler diagnostics:
```text
src/app/track/[appointmentId]/tracking-client.tsx(756,7): error TS1005: ')' expected.
src/app/track/[appointmentId]/tracking-client.tsx(780,5): error TS1128: Declaration or statement expected.
src/app/track/[appointmentId]/tracking-client.tsx(781,3): error TS1109: Expression expected.
```

### 1.2 PWA Type Export Analysis
1. **`src/types/pwa.d.ts` (Lines 11–18)**:
   ```ts
   interface BeforeInstallPromptEvent extends Event {
     readonly platforms?: string[];
     readonly userChoice: Promise<{
       outcome: "accepted" | "dismissed";
       platform?: string;
     }>;
     prompt: () => Promise<void>;
   }
   ```
   `src/types/pwa.d.ts` contains no top-level `import` or `export` statement. Under TypeScript's compilation model (included via `tsconfig.json` `"include": ["**/*.ts"]`), it acts as an ambient declaration script, placing `BeforeInstallPromptEvent`, `Window.__pwaDeferredPrompt`, and `WindowEventMap` extensions into the global ambient namespace.

2. **`src/components/pwa-provider.tsx` (Line 8)**:
   ```ts
   export type { BeforeInstallPromptEvent };
   ```
   Because `pwa-provider.tsx` is an ES module (has top-level imports/exports), exporting an ambient global type that is neither declared locally nor imported from another module triggers `TS2661` (`Cannot export 'BeforeInstallPromptEvent'. Only referable names can be exported...`).

3. **`src/hooks/use-pwa-install.ts` (Line 5)**:
   ```ts
   export type { BeforeInstallPromptEvent };
   ```
   Similarly, exporting the ambient global type triggers `TS2661`.

4. **Consumer Import Audit**:
   Grep search across `src/` for `BeforeInstallPromptEvent` returned:
   - `src/types/pwa.d.ts` (Ambient declaration)
   - `src/components/pwa-provider.tsx` (Internal type usage + rogue export on line 8)
   - `src/hooks/use-pwa-install.ts` (Internal type usage + rogue export on line 5)
   **Zero** external components or consumers import `BeforeInstallPromptEvent` from `pwa-provider.tsx` or `use-pwa-install.ts`. All consumers and internal hooks access `BeforeInstallPromptEvent` directly via the global ambient declaration.

5. **Consumer Components Import Verification**:
   - `src/components/install-app-section.tsx` (Line 9):
     `import { usePWAInstall } from "@/hooks/use-pwa-install";` — Valid and cleanly typed.
   - `src/components/install-app-banner.tsx` (Line 7):
     `import { usePWAInstall } from "@/hooks/use-pwa-install";` — Valid and cleanly typed.
   - `src/app/_components/home-nav.tsx` (Line 9):
     `import { InstallButton } from "@/components/pwa-provider";` — Valid.
   - `src/app/book/[slug]/layout.tsx` (Line 10):
     `import { PatientInstallButton } from "@/components/pwa-provider";` — Valid.
   - `src/app/book/[slug]/booking-client.tsx` (Line 23):
     `import { PatientInstallButton } from "@/components/pwa-provider";` — Valid.
   - `src/app/track/[appointmentId]/tracking-client.tsx` (Line 37):
     `import { PatientInstallButton } from "@/components/pwa-provider";` — Valid.
   - `src/app/page.tsx` (Line 24):
     `import { InstallButton } from "@/components/pwa-provider";` — Valid.
   - `src/app/layout.tsx` (Line 6):
     `import { PWAProvider } from "@/components/pwa-provider";` — Valid.

### 1.3 JSX Nesting Error in `src/app/track/[appointmentId]/tracking-client.tsx`
- **Lines 331–332**: Component main return starts with `<div className="space-y-6">`.
- **Line 754**: An un-nested `</div>` prematurely closes the container before the modal.
- **Lines 757–779**: `<AnimatePresence>` containing the confirmation modal is rendered as an orphaned sibling.
- **Line 780**: An extra trailing `</div>` attempts to close an already-closed element, producing `TS1005`, `TS1128`, and `TS1109`.

### 1.4 Doctor Diary Manifest (`public/manifest.json`) Verification
- **File**: `public/manifest.json` (68 lines)
- **ID**: `"doctor-diary-app"`
- **Name**: `"Doctor Diary — by NatureXpress"`
- **Start URL**: `"/dashboard"`
- **Scope**: `"/"`
- **Display**: `"standalone"`
- **Theme Color**: `"#0f766e"`
- **Icons**:
  - `192x192`: Separate entries for `"any"` and `"maskable"`, referencing `/icon-192.png` (present on disk, 192x192 PNG).
  - `512x512`: Separate entries for `"any"` and `"maskable"`, referencing `/icon-512.png` (present on disk, 512x512 PNG).
- **Shortcuts & Screenshots**: Fully present and correctly mapped to `/dashboard` endpoints.
- **Assessment**: Static Doctor Diary manifest is 100% compliant with W3C and Chromium PWA installability requirements.

### 1.5 Route Isolation Audit Across Portals
- **Root Layout (`src/app/layout.tsx:37`)**:
  Specifies `manifest: "/manifest.json"`. Applies to `/`, `/login`, `/dashboard/*`.
- **Patient Booking (`src/app/book/[slug]/layout.tsx:21` & `page.tsx:174`)**:
  Overrides manifest via `generateMetadata` returning `manifest: `/api/manifest/${slug}``.
- **Patient Tracking (`src/app/track/[appointmentId]/layout.tsx` & `page.tsx`)**:
  **Gap Found**: Currently does NOT define `manifest` in metadata. Consequently, Next.js falls back to root `manifest: "/manifest.json"`, which would attempt to install the Doctor Diary app instead of the patient's clinic app when visiting tracking links.
- **Patient Status Check (`src/app/status/[slug]/page.tsx`)**:
  **Gap Found**: `generateMetadata` in `status/[slug]/page.tsx` returns title and description but omits `manifest: `/api/manifest/${slug}``.

---

## 2. Logic Chain

1. **Premise 1 (TypeScript ambient types)**: `src/types/pwa.d.ts` declares `BeforeInstallPromptEvent` in the global namespace.
2. **Premise 2 (Module export semantics)**: When an ES module attempts to re-export a name from the global scope without declaring or importing it, TypeScript flags TS2661.
3. **Premise 3 (Consumer independence)**: No consumer file in the repository imports `BeforeInstallPromptEvent` from `pwa-provider.tsx` or `use-pwa-install.ts`; they rely on the global ambient declaration.
4. **Deduction 1**: Removing `export type { BeforeInstallPromptEvent };` from `src/components/pwa-provider.tsx` and `src/hooks/use-pwa-install.ts` completely eliminates the TS2661 error without breaking any existing imports.
5. **Premise 4 (JSX structure)**: In `src/app/track/[appointmentId]/tracking-client.tsx`, line 754 has an extraneous `</div>` that closes the outer container before `<AnimatePresence>`.
6. **Deduction 2**: Removing the extra `</div>` at line 754 ensures `<AnimatePresence>` remains cleanly nested inside `<div className="space-y-6">` that closes at line 780, resolving TS1005, TS1128, and TS1109.
7. **Premise 5 (Next.js Metadata Inheritance)**: If a child route layout/page does not specify `manifest`, Next.js inherits `manifest: "/manifest.json"` from `src/app/layout.tsx`.
8. **Premise 6 (Portal Isolation Requirement)**: Doctor Diary (`/dashboard`, `start_url: "/dashboard"`, `scope: "/"`) and Patient Clinic Apps (`/book/[slug]`, `/track/[appointmentId]`, `start_url: "/book/[slug]?utm_source=pwa"`, `scope: "/book/[slug]"`) must be strictly isolated.
9. **Deduction 3**: Adding `generateMetadata` with `manifest: `/api/manifest/${clinicSlug}`` to `/track/[appointmentId]/layout.tsx` (or `page.tsx`) and `/status/[slug]/page.tsx` guarantees that patients on tracking and status pages install the clinic-specific PWA with `start_url: /book/[slug]?utm_source=pwa` and never the Doctor Diary app.

---

## 3. Caveats

1. **Demo Patient Tracking**: For tracking routes with `appointmentId` starting with `"demo-"` (e.g., `"demo-ayurveda-care"`), the clinic slug must be extracted via `appointmentId.replace("demo-", "")` without requiring a database lookup.
2. **Database Query Resiliency in Metadata**: In `src/app/track/[appointmentId]/layout.tsx`, if the appointment ID is invalid or not found in the database, `generateMetadata` must gracefully fall back without throwing an unhandled rejection (returning default metadata or empty object).
3. **Pre-Hydration Event Bridge**: The global capture script in `src/app/layout.tsx` (`id="pwa-early-capture"`) handles `window.__pwaDeferredPrompt` before React hydration. This script is route-agnostic and functions properly across all portals.

---

## 4. Conclusion & Implementation Blueprint

### Step 1: Fix `src/components/pwa-provider.tsx`
Remove `export type { BeforeInstallPromptEvent };` on line 8.

```diff
--- a/src/components/pwa-provider.tsx
+++ b/src/components/pwa-provider.tsx
@@ -5,7 +5,6 @@
 import { PWASplashScreen } from "./pwa-splash-screen";
 import { toast } from "sonner";
 
-export type { BeforeInstallPromptEvent };
 
 // ─── Reliable Service Worker Registration Helper ─────────────────────────────
```

### Step 2: Fix `src/hooks/use-pwa-install.ts`
Remove `export type { BeforeInstallPromptEvent };` on line 5.

```diff
--- a/src/hooks/use-pwa-install.ts
+++ b/src/hooks/use-pwa-install.ts
@@ -2,7 +2,6 @@
 
 import { useEffect, useState, useCallback } from "react";
 
-export type { BeforeInstallPromptEvent };
 
 export type Platform =
```

### Step 3: Fix JSX Nesting in `src/app/track/[appointmentId]/tracking-client.tsx`
Remove the extra `</div>` at line 754.

```diff
--- a/src/app/track/[appointmentId]/tracking-client.tsx
+++ b/src/app/track/[appointmentId]/tracking-client.tsx
@@ -751,7 +751,6 @@
             <button onClick={() => setShowCancelModal(true)} className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors py-2 underline-offset-4 hover:underline">{t.cancelThisAppt}</button>
           </motion.div>
         )}
-      </div>
 
       {/* ──── Cancel Confirmation Modal ──── */}
       <AnimatePresence>
```

### Step 4: Add Dynamic Manifest Metadata to `src/app/track/[appointmentId]/layout.tsx`
Add `generateMetadata` to fetch the clinic slug and link `/api/manifest/${clinicSlug}`:

```tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}): Promise<Metadata> {
  const { appointmentId } = await params;

  if (appointmentId.startsWith("demo-")) {
    const slug = appointmentId.replace("demo-", "");
    return {
      manifest: `/api/manifest/${slug}`,
    };
  }

  try {
    const appt = await db
      .select({ clinicId: appointments.clinicId })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (appt.length > 0) {
      const clinic = await db
        .select({ slug: clinics.slug })
        .from(clinics)
        .where(eq(clinics.id, appt[0].clinicId))
        .limit(1);

      if (clinic.length > 0 && clinic[0].slug) {
        return {
          manifest: `/api/manifest/${clinic[0].slug}`,
        };
      }
    }
  } catch (e) {
    // Fail gracefully
  }

  return {};
}
```

### Step 5: Add Manifest Link to `src/app/status/[slug]/page.tsx`
Update `generateMetadata` in `src/app/status/[slug]/page.tsx`:

```diff
--- a/src/app/status/[slug]/page.tsx
+++ b/src/app/status/[slug]/page.tsx
@@ -26,6 +26,7 @@
   return {
     title: `Check Status | ${clinic.name}`,
     description: `Check your live queue status at ${clinic.name}.`,
+    manifest: `/api/manifest/${slug}`,
   };
 }
```

---

## 5. Verification Method

### 5.1 Verification Commands
1. **TypeScript Type Check**:
   ```powershell
   npx tsc --project tsconfig.json --noEmit
   ```
   **Expected Outcome**: Zero errors (`exit code 0`).

2. **Full Next.js Build**:
   ```powershell
   npm run build
   ```
   **Expected Outcome**: Successful build, all routes statically/dynamically generated without manifest or type export errors.

3. **Manifest Link HTML Verification**:
   - Check rendered `<link rel="manifest">` for `/dashboard`: points to `/manifest.json`.
   - Check rendered `<link rel="manifest">` for `/book/test-clinic`: points to `/api/manifest/test-clinic`.
   - Check rendered `<link rel="manifest">` for `/track/<appointment-id>`: points to `/api/manifest/<clinic-slug>`.
   - Check rendered `<link rel="manifest">` for `/status/<clinic-slug>`: points to `/api/manifest/<clinic-slug>`.

### 5.2 Invalidation Conditions
- If any consumer component fails to compile without `import type { BeforeInstallPromptEvent }`, verify that `src/types/pwa.d.ts` is present in `tsconfig.json`'s include paths.
- If `/track/[appointmentId]` fails to load manifest, verify that database query returns the clinic slug or handles `demo-*` prefixes.
