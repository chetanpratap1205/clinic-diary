# BRIEFING — 2026-08-15T04:52:00+05:30

## Mission
Investigate frontend PWA installation flow, hooks (`use-pwa-install.ts`), `beforeinstallprompt` event lifecycle, platform detection logic, UI components, and fallback toast trigger causes.

## 🔒 My Identity
- Archetype: explorer
- Roles: read-only investigation, synthesis
- Working directory: e:\doctor-appointment-saas-platform\.agents\teamwork_preview_explorer_survey_1
- Original parent: f8cc414e-09ae-44ee-b115-ffb537a1e7a2
- Milestone: survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement changes in source code
- Focus on frontend PWA installation flow, detection logic, event lifecycle, and UI components
- Compare patient booking/tracking pages vs Doctor Diary portal
- Document exact code paths, line numbers, and potential fix strategies in handoff.md

## Current Parent
- Conversation ID: f8cc414e-09ae-44ee-b115-ffb537a1e7a2
- Updated: 2026-08-15T04:52:00+05:30

## Investigation State
- **Explored paths**:
  - `src/hooks/use-pwa-install.ts`
  - `src/components/install-app-banner.tsx`
  - `src/components/install-app-section.tsx`
  - `src/components/pwa-provider.tsx`
  - `src/components/push-opt-in.tsx`
  - `src/app/layout.tsx`
  - `src/app/book/[slug]/layout.tsx`, `src/app/book/[slug]/page.tsx`, `src/app/book/[slug]/booking-client.tsx`
  - `src/app/track/[appointmentId]/layout.tsx`, `src/app/track/[appointmentId]/tracking-client.tsx`
  - `src/app/api/manifest/[slug]/route.ts`, `src/app/api/manifest/[slug]/icon/route.ts`
  - `public/manifest.json`, `public/sw.js`
- **Key findings**:
  1. Root cause of fallback toast: `InstallAppSection` triggers generic toast when `platform === "desktop"` (which happens on Desktop Chrome, Android Desktop Mode, modern iPadOS, or before `beforeinstallprompt` elevates the state).
  2. Service Worker registration race condition: `PWAProvider` uses `window.addEventListener("load")` in `useEffect`, which never runs if `document.readyState === "complete"` upon hydration. Without SW, Chrome suppresses `beforeinstallprompt`.
  3. `beforeinstallprompt` event listener fragmentation and race conditions: Each component attaches its own `beforeinstallprompt` listener only in `useEffect` with local `useState`, missing any event fired prior to component mount.
  4. Platform detection bugs: iPadOS 13+ misdetected as desktop; Desktop Chrome mislabeled as "android" on prompt; `InstallAppBanner` renders empty for `android_manual`.
  5. Patient manifest issues: `/api/manifest/[slug]/route.ts` has malformed icon sizes (`sizes: "192x192 512x512"`), and `/track/[appointmentId]` lacks a dynamic manifest entirely.
- **Unexplored areas**: None within scope.

## Key Decisions Made
- Fully analyzed all code paths, lifecycle events, and component interactions.
- Formulated clear fix strategies for the implementation phase.

## Artifact Index
- handoff.md — Comprehensive 5-component handoff report
- progress.md — Liveness heartbeat and step tracking
- DISPATCH.md — Received instructions
