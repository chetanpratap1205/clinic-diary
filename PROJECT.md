# Project: PWA Installability & Cross-Portal Isolation Fix

## Architecture
- **Framework**: Next.js (App Router, React 19 SSR + Client components)
- **Portals**:
  1. **Doctor Diary Portal**: Doctor-facing dashboard (`/dashboard`, `/login`, etc.) using static `public/manifest.json` (`id: "doctor-diary-app"`, `start_url: "/dashboard"`, `scope: "/"`).
  2. **Patient Clinic Portal**: Individual clinic booking and tracking pages (`/clinic/[slug]`, `/clinic/[slug]/track/[appointmentId]`) using dynamic manifests (`/api/manifest/[slug]`, `id: "/clinic/[slug]"`, `start_url: "/clinic/[slug]?utm_source=pwa"`, `scope: "/clinic/[slug]"`).
- **Service Worker Architecture**: Shared `public/sw.js` with root scope (`scope: "/"`), providing network-first strategies for dynamic routes, stale-while-revalidate for patient pages, static asset caching, and web push notifications.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Reliable Service Worker Registration | Fix `document.readyState` race condition in `PWAProvider` to ensure `/sw.js` registers reliably on initial load and fast hydration. | M1 | Survey |
| 2 | Early `beforeinstallprompt` Capture | Implement window-level global event capture (`window.__pwaDeferredPrompt`) so early browser install events are not lost before React hydration. | M1 | Survey |
| 3 | Dynamic Manifest Icon & Metadata Standards | Fix icon size declarations, split `"any"` and `"maskable"` purpose entries, and route dynamic icons via same-origin icon proxy. | M2 | Survey |
| 4 | Patient Tracking & Status Page Manifest Routing | Ensure `/track/[appointmentId]` and `/status/[slug]` link to the clinic-specific dynamic manifest rather than falling back to Doctor Diary's manifest. | M2 | Survey |
| 5 | Robust Platform Detection | Upgrade `detectPlatform` in `use-pwa-install.ts` to support modern iPads (iPadOS 13+), desktop PWA capability, and separate platform identity from prompt readiness. | M3 | Survey |
| 6 | Accurate UI Fallbacks & Install Guidance | Update `install-app-section.tsx`, `install-app-banner.tsx`, and `PatientInstallButton` to handle `android_manual`, desktop PWA, and eliminate misleading mobile fallback toasts on Android Chrome. | M3 | Survey |
| 7 | Doctor Diary Non-Regression & E2E Validation | Verify full Doctor Diary PWA integrity and validate all patient PWA install flows across Android Chrome, iOS Safari, and Desktop Chrome. | M4 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | SW Registration & Global Event Capture | `src/components/pwa-provider.tsx`, `src/hooks/use-pwa-install.ts` | none | DONE |
| M2 | Manifest Generation & Route Metadata | `src/app/api/manifest/[slug]/route.ts`, `src/app/track/[appointmentId]/layout.tsx`, `src/app/status/[slug]/page.tsx` | none | DONE |
| M3 | Platform Detection & UI Component Fallbacks | `src/hooks/use-pwa-install.ts`, `src/components/install-app-section.tsx`, `src/components/install-app-banner.tsx`, `src/components/pwa-provider.tsx` | M1, M2 | IN_PROGRESS |
| M4 | E2E Testing, Build Validation & Doctor PWA Non-Regression | Project-wide build, lint, TypeScript checks, and multi-portal PWA audit | M1, M2, M3 | PLANNED |

## Code Layout
- `src/components/pwa-provider.tsx` — Root PWA provider, service worker registration, global prompt bridge, Doctor vs Patient install buttons.
- `src/hooks/use-pwa-install.ts` — Platform detection and PWA install trigger hook.
- `src/components/install-app-section.tsx` — In-page clinic PWA download section with action buttons and guidance toasts.
- `src/components/install-app-banner.tsx` — Sticky top banner for patient booking and tracking.
- `src/app/api/manifest/[slug]/route.ts` — Dynamic Web App Manifest generator for individual clinics.
- `src/app/api/manifest/[slug]/icon/route.ts` — Dynamic clinic icon generator & proxy.
- `src/app/track/[appointmentId]/layout.tsx` & `page.tsx` — Patient appointment live queue tracking with dynamic manifest link.
- `public/manifest.json` — Immutable Doctor Diary PWA manifest.
- `public/sw.js` — Core service worker for caching, offline, and push notifications.
