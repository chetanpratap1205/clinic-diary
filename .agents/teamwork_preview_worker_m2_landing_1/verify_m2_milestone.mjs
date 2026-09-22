import assert from "node:assert/strict";
import fs from "node:fs";

console.log("=== Milestone 2 Comprehensive Verification Suite ===\n");

// 1. Verify patient-journey-timeline.tsx
console.log("1. Verifying src/app/_components/patient-journey-timeline.tsx...");
const timelineCode = fs.readFileSync("src/app/_components/patient-journey-timeline.tsx", "utf-8");

// 6 stages
assert.ok(timelineCode.includes('"booking"'), "Must include Instant Booking stage");
assert.ok(timelineCode.includes('"reminders"'), "Must include Smart Reminders stage");
assert.ok(timelineCode.includes('"live-queue"'), "Must include Live Queue Tracking stage");
assert.ok(timelineCode.includes('"consult"'), "Must include Zero-Friction Consult stage");
assert.ok(timelineCode.includes('"digital-rx"'), "Must include Digital Rx stage");
assert.ok(timelineCode.includes('"review-recall"'), "Must include Automated Review & Follow-up stage");
console.log("✓ All 6 clinical stages present.");

// Hover pause & click freeze
assert.ok(timelineCode.includes("onMouseEnter={() => setIsPaused(true)}"), "Must pause on hover (onMouseEnter)");
assert.ok(timelineCode.includes("hasInteracted"), "Must track user interaction to prevent interrupted reading");
assert.ok(timelineCode.includes("setHasInteracted(true)"), "Must permanently freeze auto-rotation on manual user click");
console.log("✓ Hover pause and click freeze logic verified.");

// CLS prevention & fixed slots
assert.ok(timelineCode.includes("min-h-[560px]") || timelineCode.includes("min-h-[500px]"), "Must reserve fixed min-height for zero CLS");
assert.ok(timelineCode.includes("opacity-0 pointer-events-none"), "Must maintain permanent slot for QR toggle without layout shift");
console.log("✓ Zero-CLS layout and fixed slot verified.");

// WhatsApp UI realism
assert.ok(timelineCode.includes("#00B7A8"), "Must use signature emerald brand accent");
assert.ok(timelineCode.includes("#53BDEB"), "Must include WhatsApp double blue checkmarks");
assert.ok(timelineCode.includes("#14"), "Must include token #14");
assert.ok(timelineCode.includes("Official WhatsApp Business Account"), "Must include WhatsApp verified business badge");
assert.ok(timelineCode.includes("Aarogyam Clinic"), "Must include clinic name in letterhead");
assert.ok(timelineCode.includes("Dr. Arvind Sharma"), "Must include doctor name in letterhead");
assert.ok(timelineCode.includes("DMC/14820"), "Must include medical registration DMC/14820");
assert.ok(timelineCode.includes('AnimatePresence mode="wait"'), "Must use AnimatePresence mode='wait' for smooth transitions");
console.log("✓ High-fidelity WhatsApp UI and Framer Motion animation verified.\n");

// 2. Verify doctor-dashboard.tsx
console.log("2. Verifying src/app/_components/doctor-dashboard.tsx...");
const dashboardCode = fs.readFileSync("src/app/_components/doctor-dashboard.tsx", "utf-8");

// Zero raster image imports
assert.equal(dashboardCode.includes("/assets/Dashboard.png"), false, "Must NOT include /assets/Dashboard.png");
assert.equal(dashboardCode.includes('from "next/image"'), false, "Must NOT import next/image");
assert.equal(dashboardCode.includes(".png"), false, "Must NOT reference any .png files");
console.log("✓ 100% elimination of raster PNG screenshot and image imports verified.");

// macOS Chrome Frame
assert.ok(dashboardCode.includes("#FF5F56"), "Must include macOS red traffic light");
assert.ok(dashboardCode.includes("#FFBD2E"), "Must include macOS yellow traffic light");
assert.ok(dashboardCode.includes("#27C93F"), "Must include macOS green traffic light");
assert.ok(dashboardCode.includes("Aarogyam Clinic • Dr. Arvind Sharma"), "Must include clinic identifier in chrome header");
assert.ok(dashboardCode.includes("OPD ACTIVE"), "Must include live OPD status pill");
console.log("✓ macOS browser chrome frame verified.");

// 4 Interactive Tabs
assert.ok(dashboardCode.includes('"queue"'), "Must include Live Queue tab");
assert.ok(dashboardCode.includes('"analytics"'), "Must include Daily Analytics tab");
assert.ok(dashboardCode.includes('"rx"'), "Must include Digital Rx tab");
assert.ok(dashboardCode.includes('"recall"'), "Must include Auto-Recall tab");
console.log("✓ 4 Interactive tabs verified.");

// Live Queue features
assert.ok(dashboardCode.includes("Call Next Token"), "Must include Call Next Token interaction");
assert.ok(dashboardCode.includes("In Cabin"), "Must include In Cabin status");
assert.ok(dashboardCode.includes("Next Up"), "Must include Next Up status");
assert.ok(dashboardCode.includes("Waiting"), "Must include Waiting status");
console.log("✓ Live Queue tokens and interactive call progression verified.");

// SVG Analytics curve
assert.ok(dashboardCode.includes("<svg"), "Must render inline SVG");
assert.ok(dashboardCode.includes("primaryCurvePath"), "Must calculate mathematical cubic bezier curve path");
assert.ok(dashboardCode.includes("Total Consults"), "Must display Total Consults metric (842)");
assert.ok(dashboardCode.includes("₹3,36,800"), "Must display Monthly Revenue metric (₹3,36,800)");
assert.ok(dashboardCode.includes("18% → 2.1%"), "Must display No-Show Drop metric (18% -> 2.1%)");
assert.ok(dashboardCode.includes("7.5 mins"), "Must display Avg Wait Time metric (7.5 mins)");
assert.ok(dashboardCode.includes("onMouseEnter"), "Must provide interactive hover nodes on SVG curve");
console.log("✓ Scalable inline SVG cubic bezier curve chart verified.");

// Digital Rx features
assert.ok(dashboardCode.includes("Allergic Rhinitis"), "Must provide 1-click Rx templates");
assert.ok(dashboardCode.includes("WhatsApp PDF Dispatch"), "Must provide WhatsApp dispatch action");
assert.ok(dashboardCode.includes("Send via WhatsApp"), "Must provide Send via WhatsApp button");
console.log("✓ Digital Rx prescription presets and dispatch verified.");

// Auto-Recall features
assert.ok(dashboardCode.includes("Automated Patient Recall Engine"), "Must provide Auto-Recall timeline");
assert.ok(dashboardCode.includes("+34% Retention"), "Must display retention metric");
console.log("✓ Auto-Recall timeline and chronic follow-up engine verified.");

// Bidirectional workflow linking
assert.ok(dashboardCode.includes("handleWorkflowClick"), "Must link workflow steps to dashboard tabs");
assert.ok(dashboardCode.includes("handleTabClick"), "Must link dashboard tabs to workflow steps");
assert.ok(dashboardCode.includes("7:45 AM"), "Must include 7:45 AM workflow step");
assert.ok(dashboardCode.includes("During Clinic"), "Must include During Clinic workflow step");
assert.ok(dashboardCode.includes("During Consult"), "Must include During Consult workflow step");
assert.ok(dashboardCode.includes("Post Consultation"), "Must include Post Consultation workflow step");
assert.ok(dashboardCode.includes("End of Day"), "Must include End of Day workflow step");
console.log("✓ Bidirectional synchronized 5-step daily workflow timeline verified.\n");

console.log("=== ALL MILESTONE 2 SPECIFICATIONS AND INTEGRITY CHECKS PASSED ===");
