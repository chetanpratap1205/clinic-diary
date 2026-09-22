# Project: Clinic Diary Enterprise SaaS Landing Page Overhaul

## Architecture
- **Framework**: Next.js 16 (App Router, React 19 SSR + Client Components)
- **Styling & Design System**: Tailwind CSS v4 (`@tailwindcss/postcss`), `@theme` medical emerald palette (`#00B7A8`), deep executive navy (`#0B132B`, `#040D21`), off-white canvas (`#FAFBFC`, `#F8FAFC`).
- **Motion Engine**: Framer Motion v12 (`whileInView`, `viewport={{ once: true, margin: "-80px" }}`, spring physics, 60fps composite animations).
- **Entry Point**: `src/app/page.tsx` sequentially loading below-hero sections from `src/app/_components/*` via `next/dynamic` with `contentVisibility: "auto"`.
- **Cross-Portal Isolation Guarantee**: The landing page components in `src/app/_components/*` are strictly self-contained and exclusively imported by `src/app/page.tsx`. Zero shared runtime state or modification to doctor dashboard (`/dashboard`), patient clinic portals (`/clinic/[slug]`), or Doctor Diary PWA configurations.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | `TheMirror` Redesign | Problem empathy framing, contrasting Old Chaotic Clinic vs Autonomous Clinic, dark luxury theme with gradient glow. | M1 | Survey |
| 2 | `ZeroFrictionGuarantee` Redesign | 4 core friction removal guarantees (walk-ins preserved, paper Rx unchanged, 48h free historical register migration, 24/7 autonomous visibility), elevated micro-badges, physical paper vs digital ticket visual. | M1 | Survey |
| 3 | `DigitalClinicOwnership` Redesign | Sovereignty & 0% commission narrative against aggregator marketplaces, vector SVG mock browser frame with doctor URL pill (`clinic.doctordiary.in/dr-sharma`), live queue badge, and instant booking card. | M1 | Survey |
| 4 | `ExperienceEngine` Redesign | 40+ specialties ticker marquee + 4 Bento Box cards (Keep Rx Pad, 0% Commission, 24/7 Smart Clinic Manager, 100% Practice Sovereignty) with crisp SVG UI illustrations replacing wireframe rectangles. | M1 | Survey |
| 5 | `PatientJourneyTimeline` Redesign | 6-stage clinical cycle (`Booking -> Reminder -> Live Queue -> Consult -> Digital Rx -> Review`), 4 discovery channel tabs, hover-pause on 6s auto-rotation, Day/Night QR toggle without CLS, realistic WhatsApp chat bubble UI. | M2 | Survey |
| 6 | `DoctorDashboard` Redesign | Replace static raster screenshot (`/assets/Dashboard.png`) with interactive SVG/Glassmorphic dashboard mockup with interactive tabs (Live Queue, Daily Analytics, Rx Pad, Follow-ups) and synchronized timeline workflow steps. | M2 | Survey |
| 7 | `EnterpriseSecurityGrid` Redesign | Framer Motion scroll reveals, 4 enterprise trust cards (100% Patient Data Ownership, 256-bit AES Encryption, 99.99% Uptime SLA, Contractual 0% Cut), compliance badges, trust ribbon. | M3 | Survey |
| 8 | `TerritoryChecker` Redesign | Fix typo `[Specialty]`, structured search (specialty chips + PIN code input with validation), 3 visual feedback states (Available, Reserved/Locked, Waitlist), radar sweep animation, preserve query params on CTA (`/signup?specialty=...&pin=...`). | M3 | Survey |
| 9 | `DoctorStories` Redesign | Verified doctor testimonial cards, clinic badges, metric pills, subtle hover elevation, social proof quotes. | M3 | Survey |
| 10 | `HomeRoiCalculator` Redesign | Full-bleed section container, slider inputs with doctor-friendly presets, Indian currency formatting (`₹1,00,000`), Staff Hours Saved metric, Net ROI multiple (e.g. 48x), CTA with query params. | M4 | Survey |
| 11 | `HomePricingSection` Redesign | Billing toggle (Monthly vs Annual with discount badge), clear feature matrix, Starter Kit Unboxing block, valid HTML tags, plan pass-through to signup. | M4 | Survey |
| 12 | `LeadMagnetSection` Redesign | 3D isometric playbook cover, WhatsApp phone + name inputs alongside email, genuine PDF download fallback or rich interactive summary, smooth conversion CTA. | M4 | Survey |
| 13 | Landing Page Assembly & Storytelling Polish | Cohesive section transitions, dark/light contrast rhythm, global scroll reveal consistency, zero CLS, mobile-to-ultrawide responsiveness. | M4 | Survey |
| 14 | E2E Testing Suite & Production Build Verification | Opaque-box testing (Tiers 1-4), adversarial test hardening (Tier 5), zero TypeScript errors, passing `npm run build`. | M5 | Survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Storytelling Arc Foundation: Problem & Sovereignty | `src/app/_components/the-mirror.tsx`, `src/app/_components/zero-friction-guarantee.tsx`, `src/app/_components/digital-clinic-ownership.tsx`, `src/app/_components/experience-engine.tsx` | none | DONE (Gate 1 Passed) |
| M2 | Interactive Product Showcase: Clinical Flow & Dashboard | `src/app/_components/patient-journey-timeline.tsx`, `src/app/_components/doctor-dashboard.tsx` | M1 | DONE (Gate 2 Passed) |
| M3 | Enterprise Trust & Proof: Security, Territory & Stories | `src/app/_components/enterprise-security-grid.tsx`, `src/app/_components/territory-checker.tsx`, `src/app/_components/doctor-stories.tsx` | M1 | IN_PROGRESS |
| M4 | High-Converting Financial Engine & Page Assembly | `src/app/_components/home-roi-calculator.tsx`, `src/app/_components/home-pricing-section.tsx`, `src/app/_components/lead-magnet.tsx`, `src/app/page.tsx` | M2, M3 | PLANNED |
| M5 | E2E Test Pass, Hardening & Build Verification | Full project build verification (`npm run build`, `npm run typecheck`), E2E Tiers 1-4 test pass, Tier 5 adversarial hardening | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Section Integration (`src/app/page.tsx` ↔ `src/app/_components/*`)
- Every section component must export a React component as `default` (or named export matching `page.tsx` dynamic loader).
- Props: Sections must be self-contained or receive standard optional `className?: string`.
- State Isolation: No section may leak uncontained timers, event listeners, or global DOM mutations.
- Interactive CTAs:
  - `TerritoryChecker`: navigates to `/signup?specialty=${encodeURIComponent(specialty)}&pin=${pin}`.
  - `HomeRoiCalculator`: navigates to `/signup?recovery=${monthlyRecovery}&patients=${patients}`.
  - `HomePricingSection`: navigates to `/signup?plan=${billingCycle}` (e.g. `quarterly`, `annual`).
  - `LeadMagnetSection`: invokes server action `submitLeadMagnetAction` and provides verified download.

## Code Layout
- `src/app/page.tsx` — Landing page assembly & dynamic section loader.
- `src/app/_components/the-mirror.tsx` — Problem empathy & operational friction comparison.
- `src/app/_components/zero-friction-guarantee.tsx` — 4 core adoption guarantee cards.
- `src/app/_components/digital-clinic-ownership.tsx` — Practice sovereignty & vector browser mockup.
- `src/app/_components/experience-engine.tsx` — Specialties marquee & Bento Box architecture.
- `src/app/_components/patient-journey-timeline.tsx` — 6-stage patient journey & interactive queue simulation.
- `src/app/_components/doctor-dashboard.tsx` — Interactive SVG doctor dashboard & daily workflow tabs.
- `src/app/_components/enterprise-security-grid.tsx` — 4-card enterprise security & compliance grid.
- `src/app/_components/territory-checker.tsx` — Exclusivity search widget with radar sweep and validation.
- `src/app/_components/doctor-stories.tsx` — Verified clinician testimonials & practice metrics.
- `src/app/_components/home-roi-calculator.tsx` — Interactive Indian currency ROI calculator with sliders.
- `src/app/_components/home-pricing-section.tsx` — Transparent pricing tiers with billing toggle.
- `src/app/_components/lead-magnet.tsx` — 3D guide mockup & high-intent lead capture form.
