# BRIEFING — 2026-08-15T04:53:00+05:30

## Mission
Investigate Web App Manifest generation, metadata, and routing in Next.js codebase for patient vs doctor PWAs to diagnose Android Chrome installability issues.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigation, synthesis
- Working directory: e:\doctor-appointment-saas-platform\.agents\teamwork_preview_explorer_survey_2
- Original parent: f8cc414e-09ae-44ee-b115-ffb537a1e7a2
- Milestone: codebase survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Verify all findings with file paths, line numbers, exact code
- Focus on manifest generation, metadata, routing, and installability criteria for patient vs doctor PWAs

## Current Parent
- Conversation ID: f8cc414e-09ae-44ee-b115-ffb537a1e7a2
- Updated: 2026-08-15T04:53:00+05:30

## Investigation State
- **Explored paths**:
  - `public/manifest.json`, `public/field-portal-manifest.json`, `public/sw.js`
  - `src/app/api/manifest/[slug]/route.ts`, `src/app/api/manifest/[slug]/icon/route.ts`
  - `src/app/layout.tsx`, `src/app/book/[slug]/layout.tsx`, `src/app/book/[slug]/page.tsx`
  - `src/app/track/[appointmentId]/layout.tsx`, `src/app/track/[appointmentId]/page.tsx`, `src/app/track/[appointmentId]/tracking-client.tsx`
  - `src/app/dashboard/layout.tsx`, `src/app/status/[slug]/page.tsx`, `src/app/review/[appointmentId]/page.tsx`, `src/app/receipt/[id]/page.tsx`
  - `src/components/pwa-provider.tsx`, `src/components/install-app-banner.tsx`, `src/components/install-app-section.tsx`
  - `src/hooks/use-pwa-install.ts`, `next.config.ts`
- **Key findings**:
  1. Patient dynamic manifest in `src/app/api/manifest/[slug]/route.ts` has icon issues (`purpose: "any maskable"`, `sizes: "192x192 512x512"`, raw unproxied `clinic.logoUrl` without CORS headers).
  2. `src/components/pwa-provider.tsx` registers SW in `window.addEventListener("load")`, which fails to fire if React hydrates after window load.
  3. Timing race condition between early Chrome `beforeinstallprompt` event and late React listener registration.
  4. Platform detection in `use-pwa-install.ts` drops to `"desktop"` on desktop-mode UA / uncaptured event, leading to the "Please open on Android/Safari" fallback toast in `install-app-section.tsx`.
  5. Patient tracking page `/track/[appointmentId]` lacks `manifest` in metadata and mistakenly inherits Doctor Diary `/manifest.json`.
- **Unexplored areas**: None for this survey scope.

## Key Decisions Made
- Fully documented all 5 components of the handoff report in `handoff.md`.

## Artifact Index
- `handoff.md` — Comprehensive survey and analysis of manifests, metadata, routing, and PWA criteria.
- `progress.md` — Heartbeat log.
- `DISPATCH.md` — Dispatch record.
