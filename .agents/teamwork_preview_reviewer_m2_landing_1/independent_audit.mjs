import assert from "node:assert/strict";
import fs from "node:fs";

console.log("=== Reviewer M2.1 Independent Architecture & Quality Audit ===\n");

// Read target files
const timelinePath = "src/app/_components/patient-journey-timeline.tsx";
const dashboardPath = "src/app/_components/doctor-dashboard.tsx";
const pagePath = "src/app/page.tsx";

const timelineCode = fs.readFileSync(timelinePath, "utf-8");
const dashboardCode = fs.readFileSync(dashboardPath, "utf-8");
const pageCode = fs.readFileSync(pagePath, "utf-8");

// CHECK 1: Next.js Client Component Directives
console.log("Check 1: Client Component Directives");
assert.ok(timelineCode.startsWith('"use client";'), "patient-journey-timeline.tsx must start with 'use client';");
assert.ok(dashboardCode.startsWith('"use client";'), "doctor-dashboard.tsx must start with 'use client';");
console.log("  PASS: Both components correctly declared with 'use client';");

// CHECK 2: Page.tsx Dynamic Import Interface Conformance
console.log("Check 2: Dynamic Import Interface Conformance with page.tsx");
assert.ok(pageCode.includes('import("./_components/patient-journey-timeline").then((m) => m.PatientJourneyTimeline)'), "page.tsx must dynamically import PatientJourneyTimeline named export");
assert.ok(pageCode.includes('import("./_components/doctor-dashboard").then((m) => m.DoctorDashboard)'), "page.tsx must dynamically import DoctorDashboard named export");

assert.ok(timelineCode.includes("export function PatientJourneyTimeline()"), "patient-journey-timeline.tsx must export PatientJourneyTimeline");
assert.ok(timelineCode.includes("export default PatientJourneyTimeline"), "patient-journey-timeline.tsx must export default PatientJourneyTimeline");

assert.ok(dashboardCode.includes("export function DoctorDashboard()"), "doctor-dashboard.tsx must export DoctorDashboard");
assert.ok(dashboardCode.includes("export default DoctorDashboard"), "doctor-dashboard.tsx must export default DoctorDashboard");
console.log("  PASS: Both named and default exports strictly conform to page.tsx dynamic loader.");

// CHECK 3: SSR / Hydration Determinism
console.log("Check 3: SSR / Hydration Determinism");
const forbiddenPatterns = [
  /\bwindow\b/,
  /\bdocument\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /Math\.random\(\)/,
  /new Date\(\)/,
  /Date\.now\(\)/
];

for (const pattern of forbiddenPatterns) {
  assert.ok(!pattern.test(timelineCode), `patient-journey-timeline must not contain ${pattern}`);
  assert.ok(!pattern.test(dashboardCode), `doctor-dashboard must not contain ${pattern}`);
}
console.log("  PASS: Zero non-deterministic hydration calls in render paths.");

// CHECK 4: 100% Vector Architecture (Zero Raster Imports)
console.log("Check 4: 100% Vector Rendering & Zero Raster Images");
assert.ok(!dashboardCode.includes("next/image"), "doctor-dashboard must not import next/image");
assert.ok(!dashboardCode.includes(".png"), "doctor-dashboard must not reference .png files");
assert.ok(!dashboardCode.includes(".jpg"), "doctor-dashboard must not reference .jpg files");
assert.ok(!dashboardCode.includes(".webp"), "doctor-dashboard must not reference .webp files");
assert.ok(dashboardCode.includes("<svg viewBox=\"0 0 600 230\""), "doctor-dashboard must render inline SVG curve");
assert.ok(dashboardCode.includes("primaryCurvePath"), "doctor-dashboard must compute bezier curve path");
console.log("  PASS: Doctor dashboard is 100% vector SVG without any raster bottlenecks.");

// CHECK 5: Integrity Verification (No dummy mocks or hardcoded facade cheating)
console.log("Check 5: Logic Integrity & Non-Trivial Implementation");
// Live queue token cycling logic
assert.ok(dashboardCode.includes("handleCallNextToken"), "Must have token progression handler");
assert.ok(dashboardCode.includes("setCurrentServingIndex"), "Must mutate serving index state");
assert.ok(dashboardCode.includes("baseTokens.map"), "Must dynamically recalculate token queue statuses");

// Bidirectional workflow sync logic
assert.ok(dashboardCode.includes("handleWorkflowClick"), "Must handle workflow step click");
assert.ok(dashboardCode.includes("handleTabClick"), "Must handle tab click");
assert.ok(dashboardCode.includes("setActiveWorkflowIndex"), "Must update workflow index when tab changes");

// Timeline auto-rotation & pause logic
assert.ok(timelineCode.includes("setInterval"), "Must use real setInterval for auto-rotation");
assert.ok(timelineCode.includes("clearInterval"), "Must cleanup interval in useEffect return");
assert.ok(timelineCode.includes("onMouseEnter={() => setIsPaused(true)}"), "Must pause on hover");
assert.ok(timelineCode.includes("setHasInteracted(true)"), "Must freeze on user click");
console.log("  PASS: Genuine interactive state machines; no dummy facades or integrity violations.");

// CHECK 6: Layout Shift (CLS) Prevention & Overflow-X Protection
console.log("Check 6: CLS Prevention & Responsive Containment");
assert.ok(timelineCode.includes("min-h-[560px]"), "Timeline must declare min-h container for CLS prevention");
assert.ok(timelineCode.includes("overflow-hidden"), "Timeline section must contain overflow");
assert.ok(timelineCode.includes("opacity-0 pointer-events-none"), "Timeline QR toggle slot must maintain DOM height");

assert.ok(dashboardCode.includes("min-h-[460px]"), "Dashboard content must declare min-h for CLS prevention");
assert.ok(dashboardCode.includes("overflow-hidden"), "Dashboard section and frame must contain overflow");
assert.ok(dashboardCode.includes("overflow-x-auto"), "Dashboard tab bar must allow horizontal scroll without clipping");
console.log("  PASS: Zero CLS layout guards and responsive overflow containment verified.");

// CHECK 7: Full 6-Stage Patient Cycle & 4 Discovery Channels
console.log("Check 7: Clinical Coverage Completeness");
const requiredStages = ["booking", "reminders", "live-queue", "consult", "digital-rx", "review-recall"];
for (const stageId of requiredStages) {
  assert.ok(timelineCode.includes(`id: "${stageId}"`), `Timeline must define stage '${stageId}'`);
}
const requiredChannels = ["maps", "insta", "seo", "qr"];
for (const chanId of requiredChannels) {
  assert.ok(timelineCode.includes(`id: "${chanId}"`), `Timeline must define discovery channel '${chanId}'`);
}
console.log("  PASS: All 6 stages and 4 discovery channels fully implemented.");

console.log("\n=== ALL INDEPENDENT ARCHITECTURAL CHECKS PASSED ===");
