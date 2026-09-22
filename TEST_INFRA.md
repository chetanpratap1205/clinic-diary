# E2E Test Infra: Clinic Diary Enterprise SaaS Landing Page Overhaul

## Test Philosophy
- Opaque-box, requirement-driven. Derived strictly from `ORIGINAL_REQUEST.md` and design specifications.
- Comprehensive 4-tier methodology: Category-Partition, Boundary Value Analysis (BVA), Pairwise Combinatorial, and Real-World Workloads.

## Feature Inventory
| # | Feature | Source (requirement) | Tier 1 | Tier 2 | Tier 3 |
|---|---------|---------------------|:------:|:------:|:------:|
| 1 | `TheMirror` (Empathy & Chaos vs Autonomous Clinic) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 2 | `ZeroFrictionGuarantee` (4 Core Guarantees) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 3 | `DigitalClinicOwnership` (Sovereignty & Browser Mockup) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 4 | `ExperienceEngine` (Specialties & Bento Box) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 5 | `PatientJourneyTimeline` (6-Stage Cycle & Day/Night QR) | ORIGINAL_REQUEST §R1, §R2 | 5 | 5 | ✓ |
| 6 | `DoctorDashboard` (Interactive SVG Mockup & Daily Flow) | ORIGINAL_REQUEST §R1, §R2 | 5 | 5 | ✓ |
| 7 | `EnterpriseSecurityGrid` (Security, SLA & Compliance) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 8 | `TerritoryChecker` (Search, States & Scarcity) | ORIGINAL_REQUEST §R1, §R2 | 5 | 5 | ✓ |
| 9 | `DoctorStories` (Testimonials & Metrics) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 10 | `HomeRoiCalculator` (Sliders, Indian Currency & Recovery) | ORIGINAL_REQUEST §R1, §R2 | 5 | 5 | ✓ |
| 11 | `HomePricingSection` (Tiers, Billing Toggle & Modal) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 12 | `LeadMagnetSection` (3D Book, Form & Download) | ORIGINAL_REQUEST §R1 | 5 | 5 | ✓ |
| 13 | Build & TypeScript Integrity (`npm run build`) | ORIGINAL_REQUEST §R3 | 5 | 5 | ✓ |

## Test Architecture
- Test runner: Automated Node/TypeScript test harnesses and Playwright/Puppeteer/E2E test scripts executing against rendered DOM, component exports, and build outputs.
- Build integrity check: `npm run build` & `npm run typecheck`.
- Responsive viewport validation: 360px (mobile), 768px (tablet), 1280px (desktop), 1920px (ultrawide).

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Doctor evaluates problem, calculates custom clinic ROI with sliders, and clicks CTA to signup with recovery state preserved. | TheMirror, HomeRoiCalculator, Signup CTA | High |
| 2 | Clinic owner checks territory availability for Pediatrician in PIN 560001, observes radar sweep, receives Available state, and locks territory. | TerritoryChecker, Signup CTA | High |
| 3 | Prospective doctor explores Patient Journey Timeline, pauses on hover, toggles Night Door QR, and verifies WhatsApp chat preview. | PatientJourneyTimeline | High |
| 4 | Practice manager reviews Doctor Dashboard workflow stages (7:45 AM to End of Day), switches interactive tabs, and checks Enterprise Security Grid. | DoctorDashboard, EnterpriseSecurityGrid | High |
| 5 | Hesitant visitor unboxes the Starter Kit in Pricing, toggles Annual billing, and downloads the 5-Step Lead Magnet playbook. | HomePricingSection, LeadMagnetSection | High |

## Coverage Thresholds
- Tier 1 (Feature Isolation): >=65 test cases (5 × 13 features)
- Tier 2 (Boundary & Corner Cases): >=65 test cases
- Tier 3 (Cross-Feature Pairwise): >=13 interaction test cases
- Tier 4 (Real-World Scenarios): >=5 comprehensive end-to-end scenarios
- Total Target: >=150 test cases
