## 2026-09-21T02:52:19Z
You are Worker M2 (Interactive Product Showcase Implementer) for Milestone 2 of the Clinic Diary landing page overhaul.
Your working directory is: e:\doctor-appointment-saas-platform\.agents\teamwork_preview_worker_m2_landing_1

MANDATORY FIRST STEP:
Read the original user request at: e:\doctor-appointment-saas-platform\.agents\ORIGINAL_REQUEST.md
Also read the project architecture at: e:\doctor-appointment-saas-platform\PROJECT.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE WRITE OWNERSHIP:
You have exclusive write ownership of these 2 files:
1. `src/app/_components/patient-journey-timeline.tsx`
2. `src/app/_components/doctor-dashboard.tsx`
DO NOT modify any other files outside your assigned scope. Do NOT touch `/dashboard`, `/clinic/[slug]`, or PWA configurations.

INPUT BLUEPRINTS & EXPLORER HANDOFF:
Read the exhaustive blueprints and ready-to-use JSX specifications prepared by the Milestone 2 Explorer at:
`e:\doctor-appointment-saas-platform\.agents\teamwork_preview_explorer_m2_landing_3\handoff.md`

YOUR MISSION:
1. Overhaul `patient-journey-timeline.tsx`:
   - Expand into the full 6-stage clinical cycle:
     1. Instant Booking (15s WhatsApp booking, zero app download)
     2. Automated Reminders (24h & 2h reminders reducing no-shows)
     3. Live Queue Tracking (real-time token & wait time updates)
     4. Zero-Friction Consult (traditional pen/paper Rx preserved)
     5. Digital Rx & Bill on WhatsApp (instant PDF delivered before exit)
     6. Automated Review & Follow-up (5-star Google review collection & recall)
   - Fix auto-rotation: MUST pause on hover (`onMouseEnter={() => setIsPaused(true)}`, `onMouseLeave={() => setIsPaused(false)}`) and pause permanently/reset when user clicks a stage tab so reading is never interrupted.
   - Eliminate layout shift (CLS): Reserve fixed container min-height and slots for Day/Night QR toggle.
   - Realistic WhatsApp UI: Include verified green checkmark badge, doctor letterhead, confirmed OPD token card (`#14`), slot time, live queue pill, and double blue checkmarks.
   - Framer Motion transitions with `AnimatePresence mode="wait"` and spring physics.
2. Overhaul `doctor-dashboard.tsx`:
   - 100% elimination of static raster PNG screenshot (`/assets/Dashboard.png`). Zero raster image imports.
   - Precision macOS/browser chrome frame with traffic lights (`#FF5F56`, `#FFBD2E`, `#27C93F`), clinic identifier ("Aarogyam Clinic • Dr. Arvind Sharma"), and live OPD status pill.
   - 4 Interactive Tabs:
     1. `Live Queue`: Token list (`#12`, `#13`, `#14`), patient names, age/gender, wait time ETA, status badges ("In Cabin", "Waiting", "Completed").
     2. `Analytics`: Scalable inline SVG cubic bezier curve chart with metrics (`Total Consults: 842`, `Monthly Revenue: ₹3,36,800`, `No-Show Drop: 18% -> 2.1%`, `Avg Wait: 7.5 mins`), hover nodes, and SVG tooltips.
     3. `Digital Rx`: One-click prescription templates, dosage tags, WhatsApp dispatch confirmation.
     4. `Auto-Recall`: Scheduled chronic patient follow-ups and recall timeline.
   - Bidirectional synchronized 5-step daily workflow timeline (7:45 AM, During Clinic, During Consult, Post Consult, End of Day) linked to dashboard tabs.
3. Verification:
   - Run type checking: `npm run typecheck` (tsc --noEmit) -> 0 errors.
   - Run linter: `npx eslint src/app/_components/patient-journey-timeline.tsx src/app/_components/doctor-dashboard.tsx` -> 0 errors.
   - Run build check: `npm run build` -> Next.js Turbopack compiles successfully with exit code 0.
   - Verify responsiveness from 360px mobile to 1920px+ desktop.
4. Document all changes, verification outputs, and diff summaries in:
`e:\doctor-appointment-saas-platform\.agents\teamwork_preview_worker_m2_landing_1\handoff.md`
Notify the caller via send_message when done.
