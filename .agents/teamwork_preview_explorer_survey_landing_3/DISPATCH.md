# Survey Subagent 3: Design & Specification Miner
Task: Analyze design system, Linear/Stripe requirements, narrative arc, and build constraints.
Workspace: e:\doctor-appointment-saas-platform
Output: .agents/teamwork_preview_explorer_survey_landing_3/handoff.md

## 2026-09-20T22:44:46Z
You are Survey Explorer 3 (Design & Specification Miner) for the Clinic Diary landing page overhaul.
Your working directory is: e:\doctor-appointment-saas-platform\.agents\teamwork_preview_explorer_survey_landing_3

MANDATORY FIRST STEP:
Read the user request at: e:\doctor-appointment-saas-platform\.agents\ORIGINAL_REQUEST.md

YOUR MISSION:
Analyze the design system, Linear & Stripe design standards, enterprise storytelling narrative arc, and technical constraints:
1. Enterprise Storytelling Arc:
   Analyze the required flow:
   - Problem (`TheMirror`, `ZeroFrictionGuarantee`)
   - Solution & Ownership (`DigitalClinicOwnership`, `ExperienceEngine`)
   - Interactive Product Showcase (`PatientJourneyTimeline`, `DoctorDashboard`)
   - Enterprise Trust & Proof (`EnterpriseSecurityGrid`, `TerritoryChecker`, `DoctorStories`)
   - High-Converting Conversion (`HomeRoiCalculator`, `HomePricingSection`, `LeadMagnetSection`)
   Map how each section transitions visually and narratively to the next.
2. Linear & Stripe Design Language:
   - Identify specific design motifs needed: dark/light luxury contrast, subtle radial/conic gradient glow effects, micro-borders with subtle opacity (`border-white/[0.08]` or similar), backdrop-blur glassmorphism, crisp SVG UI representations (mock browser frames, patient queue cards, prescription previews), smooth micro-interactions.
   - Contrast this with the existing implementation to highlight what needs replacing/upgrading.
3. Motion & Performance Guidelines:
   - Framer Motion scroll triggers (`whileInView`, `viewport={{ once: true }}`), stagger transitions, spring physics, hover elevation.
   - Guidelines for maintaining 60fps and avoiding layout shifts (CLS).
4. Cross-Portal Isolation & Doctor Diary PWA Preservation:
   - Check how the landing page connects to or shares code with `/dashboard`, `/clinic/[slug]`, etc.
   - Ensure zero risk of regression to existing Doctor Diary PWA features and patient booking routes.
5. Build & Type Safety Constraints:
   - Next.js 15 / React 19 App Router conventions, client vs server component boundaries (`"use client"`), image optimization, SVG best practices.
6. Write your comprehensive analysis and recommendations to:
`e:\doctor-appointment-saas-platform\.agents\teamwork_preview_explorer_survey_landing_3\handoff.md`
Notify the caller via send_message when done.
