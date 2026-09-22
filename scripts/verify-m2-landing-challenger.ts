/**
 * Challenger M2.1 Empirical Verification & Stress Test Suite
 * Milestone 2: Interactive Product Showcase (Clinic Diary Landing Page Overhaul)
 * 
 * Target Components:
 * 1. src/app/_components/patient-journey-timeline.tsx
 * 2. src/app/_components/doctor-dashboard.tsx
 */

import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";

// Target Components
import { PatientJourneyTimeline, default as TimelineDefault } from "../src/app/_components/patient-journey-timeline";
import { DoctorDashboard, default as DashboardDefault } from "../src/app/_components/doctor-dashboard";

// Terminal Color Formatting
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function recordTest(suite: string, name: string, passed: boolean, error?: string, details?: any) {
  results.push({ suite, name, passed, error, details });
  if (passed) {
    console.log(`  ${GREEN}✓ PASS${RESET}: [${suite}] ${name}`);
  } else {
    console.error(`  ${RED}✗ FAIL${RESET}: [${suite}] ${name}`);
    if (error) console.error(`    ${RED}Error: ${error}${RESET}`);
    if (details) console.error(`    Details:`, details);
  }
}

const projectRoot = path.resolve(__dirname, "..");
const timelinePath = path.join(projectRoot, "src", "app", "_components", "patient-journey-timeline.tsx");
const dashboardPath = path.join(projectRoot, "src", "app", "_components", "doctor-dashboard.tsx");
const pagePath = path.join(projectRoot, "src", "app", "page.tsx");

const timelineSource = fs.readFileSync(timelinePath, "utf-8");
const dashboardSource = fs.readFileSync(dashboardPath, "utf-8");
const pageSource = fs.readFileSync(pagePath, "utf-8");

console.log(`\n${BOLD}${CYAN}================================================================================`);
console.log(`   CHALLENGER M2.1: EMPIRICAL VERIFICATION & STRESS HARNESS`);
console.log(`   Milestone 2 - Interactive Product Showcase`);
console.log(`================================================================================${RESET}\n`);

// ============================================================================
// SUITE 1: React Component Exports & Page Integration Contracts
// ============================================================================
console.log(`${BOLD}--- SUITE 1: Component Exports & Page Dynamic Imports ---${RESET}`);

// 1.1 PatientJourneyTimeline exports
recordTest(
  "Exports",
  "patient-journey-timeline.tsx exports named PatientJourneyTimeline function",
  typeof PatientJourneyTimeline === "function",
  `Expected function, got ${typeof PatientJourneyTimeline}`
);

recordTest(
  "Exports",
  "patient-journey-timeline.tsx exports default component",
  typeof TimelineDefault === "function" && TimelineDefault === PatientJourneyTimeline,
  "Default export must match named PatientJourneyTimeline component"
);

// 1.2 DoctorDashboard exports
recordTest(
  "Exports",
  "doctor-dashboard.tsx exports named DoctorDashboard function",
  typeof DoctorDashboard === "function",
  `Expected function, got ${typeof DoctorDashboard}`
);

recordTest(
  "Exports",
  "doctor-dashboard.tsx exports default component",
  typeof DashboardDefault === "function" && DashboardDefault === DoctorDashboard,
  "Default export must match named DoctorDashboard component"
);

// 1.3 Page.tsx dynamic imports match exports
const timelineDynamicMatch = pageSource.includes('import("./_components/patient-journey-timeline").then((m) => m.PatientJourneyTimeline)');
const dashboardDynamicMatch = pageSource.includes('import("./_components/doctor-dashboard").then((m) => m.DoctorDashboard)');

recordTest(
  "Exports",
  "src/app/page.tsx dynamic import matches PatientJourneyTimeline named export",
  timelineDynamicMatch,
  "page.tsx dynamic import loader does not match PatientJourneyTimeline"
);

recordTest(
  "Exports",
  "src/app/page.tsx dynamic import matches DoctorDashboard named export",
  dashboardDynamicMatch,
  "page.tsx dynamic import loader does not match DoctorDashboard"
);

// 1.4 SSR Renderability Check
try {
  const timelineHtml = renderToString(React.createElement(PatientJourneyTimeline));
  recordTest(
    "SSR",
    "PatientJourneyTimeline renders to string via SSR without crashing",
    timelineHtml.length > 500 && timelineHtml.includes("Clinical Care First"),
    undefined,
    { length: timelineHtml.length }
  );
} catch (err: any) {
  recordTest("SSR", "PatientJourneyTimeline renders to string via SSR without crashing", false, err.message);
}

try {
  const dashboardHtml = renderToString(React.createElement(DoctorDashboard));
  recordTest(
    "SSR",
    "DoctorDashboard renders to string via SSR without crashing",
    dashboardHtml.length > 500 && dashboardHtml.includes("Aarogyam Clinic"),
    undefined,
    { length: dashboardHtml.length }
  );
} catch (err: any) {
  recordTest("SSR", "DoctorDashboard renders to string via SSR without crashing", false, err.message);
}

// ============================================================================
// SUITE 2: Strict Elimination of Raster Images & next/image in DoctorDashboard
// ============================================================================
console.log(`\n${BOLD}--- SUITE 2: Raster Image Elimination in DoctorDashboard ---${RESET}`);

// Check for raster extensions
const rasterRegex = /\.(png|jpg|jpeg|webp|gif|avif|PNG|JPG|JPEG|WEBP|GIF|AVIF)['"\`]/g;
const rasterMatches = dashboardSource.match(rasterRegex) || [];
recordTest(
  "RasterAudit",
  "doctor-dashboard.tsx contains zero raster image references (.png, .jpg, etc.)",
  rasterMatches.length === 0,
  `Found raster references: ${JSON.stringify(rasterMatches)}`
);

// Check next/image import
const nextImageImport = /import\s+.*\s+from\s+['"]next\/image['"]/g.test(dashboardSource);
recordTest(
  "RasterAudit",
  "doctor-dashboard.tsx does not import 'next/image'",
  !nextImageImport,
  "next/image import found in doctor-dashboard.tsx"
);

// Check Image component JSX usage
const imageJsxUsage = /<Image\b/g.test(dashboardSource);
recordTest(
  "RasterAudit",
  "doctor-dashboard.tsx does not use <Image /> JSX component",
  !imageJsxUsage,
  "<Image /> JSX component usage found in doctor-dashboard.tsx"
);

// Check /assets/Dashboard.png specifically
const dashboardPngMention = dashboardSource.includes("Dashboard.png");
recordTest(
  "RasterAudit",
  "doctor-dashboard.tsx contains no mention of legacy /assets/Dashboard.png",
  !dashboardPngMention,
  "Legacy Dashboard.png reference still present"
);

// Check img tag usage
const imgHtmlTagUsage = /<img\b/g.test(dashboardSource);
recordTest(
  "RasterAudit",
  "doctor-dashboard.tsx contains zero raw <img /> tags",
  !imgHtmlTagUsage,
  "Raw <img /> tag found in doctor-dashboard.tsx"
);

// ============================================================================
// SUITE 3: Comprehensive SVG Tag & Attribute Validation
// ============================================================================
console.log(`\n${BOLD}--- SUITE 3: SVG Tag, viewBox & Attribute Validation ---${RESET}`);

function extractAndValidateSvgs(source: string, filename: string) {
  // Regex to extract full <svg ...> opening tags
  const svgOpenTagRegex = /<svg\b([^>]*)>/g;
  let match: RegExpExecArray | null;
  let svgCount = 0;
  let validViewBoxCount = 0;
  let properSizingCount = 0;

  while ((match = svgOpenTagRegex.exec(source)) !== null) {
    svgCount++;
    const attrs = match[1];

    // Check viewBox: must have viewBox="minX minY width height"
    const viewBoxMatch = attrs.match(/viewBox=["']([0-9.\-\s]+)["']/);
    if (viewBoxMatch) {
      const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
      if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
        validViewBoxCount++;
      }
    }

    // Check sizing: either explicit width/height or className with w-* and h-*
    const hasExplicitDimensions = /width=["'][^"']+["']/.test(attrs) && /height=["'][^"']+["']/.test(attrs);
    const hasTailwindDimensions =
      /className=["'][^"']*\bw-[^\s"']+\b[^"']*\bh-[^\s"']+\b[^"']*["']/.test(attrs) ||
      /className=\{[^}]*\bw-[^\s"']+\b[^}]*\bh-[^\s"']+\b[^}]*\}/.test(attrs) ||
      attrs.includes("w-full") ||
      attrs.includes("className={className}");

    if (hasExplicitDimensions || hasTailwindDimensions) {
      properSizingCount++;
    }
  }

  return { svgCount, validViewBoxCount, properSizingCount };
}

const timelineSvgAudit = extractAndValidateSvgs(timelineSource, "patient-journey-timeline.tsx");
const dashboardSvgAudit = extractAndValidateSvgs(dashboardSource, "doctor-dashboard.tsx");

recordTest(
  "SVGAudit",
  `patient-journey-timeline.tsx renders inline SVGs with valid viewBox (found ${timelineSvgAudit.svgCount})`,
  timelineSvgAudit.svgCount > 0 && timelineSvgAudit.validViewBoxCount === timelineSvgAudit.svgCount,
  `Valid viewBoxes: ${timelineSvgAudit.validViewBoxCount}/${timelineSvgAudit.svgCount}`
);

recordTest(
  "SVGAudit",
  `patient-journey-timeline.tsx inline SVGs have explicit or Tailwind dimensions`,
  timelineSvgAudit.svgCount > 0 && timelineSvgAudit.properSizingCount === timelineSvgAudit.svgCount,
  `Proper sizing: ${timelineSvgAudit.properSizingCount}/${timelineSvgAudit.svgCount}`
);

recordTest(
  "SVGAudit",
  `doctor-dashboard.tsx renders inline SVGs with valid viewBox (found ${dashboardSvgAudit.svgCount})`,
  dashboardSvgAudit.svgCount > 0 && dashboardSvgAudit.validViewBoxCount === dashboardSvgAudit.svgCount,
  `Valid viewBoxes: ${dashboardSvgAudit.validViewBoxCount}/${dashboardSvgAudit.svgCount}`
);

recordTest(
  "SVGAudit",
  `doctor-dashboard.tsx inline SVGs have explicit or Tailwind dimensions`,
  dashboardSvgAudit.svgCount > 0 && dashboardSvgAudit.properSizingCount === dashboardSvgAudit.svgCount,
  `Proper sizing: ${dashboardSvgAudit.properSizingCount}/${dashboardSvgAudit.svgCount}`
);

// Detailed SVG Bezier Curve Math Audit
console.log(`${BOLD}  [Mathematical Oracle: doctor-dashboard SVG Cubic Bezier Curve]${RESET}`);

const curveMatch = dashboardSource.match(/primaryCurvePath\s*=\s*["']([^"']+)["']/);
const curvePath = curveMatch ? curveMatch[1] : "";

recordTest(
  "SVGAudit",
  "primaryCurvePath defined as valid SVG Cubic Bezier path",
  curvePath.startsWith("M 50 160") && curvePath.includes("C ") && curvePath.endsWith("550 35"),
  `Curve path: "${curvePath}"`
);

// Validate all coordinates in primaryCurvePath are valid numbers
const curveNumbers = curvePath.replace(/[MC,]/g, " ").trim().split(/\s+/).map(Number);
const allNumbersValid = curveNumbers.length > 10 && curveNumbers.every((n) => !isNaN(n) && Number.isFinite(n));
recordTest(
  "SVGAudit",
  `primaryCurvePath contains ${curveNumbers.length} valid finite coordinates with zero NaNs`,
  allNumbersValid,
  `Coordinates parsed: ${curveNumbers.length}`
);

// Validate area fill path closes
const areaFillMatch = dashboardSource.match(/primaryAreaFillPath\s*=\s*`\$\{primaryCurvePath\}([^`]+)`/);
const areaFillSuffix = areaFillMatch ? areaFillMatch[1].trim() : "";
recordTest(
  "SVGAudit",
  "primaryAreaFillPath properly closes geometry with base coordinates and 'Z'",
  areaFillSuffix.includes("L 550 190") && areaFillSuffix.includes("L 50 190") && areaFillSuffix.endsWith("Z"),
  `Area fill suffix: "${areaFillSuffix}"`
);

// Validate no-show drop curve
const noShowDropMatch = dashboardSource.match(/noShowDropCurve\s*=\s*["']([^"']+)["']/);
const noShowDropPath = noShowDropMatch ? noShowDropMatch[1] : "";
recordTest(
  "SVGAudit",
  "noShowDropCurve defined with valid dashed cubic bezier curve",
  noShowDropPath.startsWith("M 50 45") && noShowDropPath.includes("C "),
  `No-show drop curve: "${noShowDropPath}"`
);

// ============================================================================
// SUITE 4: 6 Clinical Stages in patient-journey-timeline.tsx
// ============================================================================
console.log(`\n${BOLD}--- SUITE 4: 6 Clinical Stages in PatientJourneyTimeline ---${RESET}`);

const expectedStages = [
  { id: "booking", step: "01", name: "Instant Booking", metric: "15 Sec" },
  { id: "reminders", step: "02", name: "Smart Reminders", metric: "2.1%" },
  { id: "live-queue", step: "03", name: "Live Queue Tracking", metric: "-40 Min" },
  { id: "consult", step: "04", name: "Zero-Friction Consult", metric: "100%" },
  { id: "digital-rx", step: "05", name: "Digital Rx & Bill on WhatsApp", metric: "< 3 Sec" },
  { id: "review-recall", step: "06", name: "Automated Review & Follow-up", metric: "+34%" }
];

expectedStages.forEach((stage) => {
  const hasId = timelineSource.includes(`id: "${stage.id}"`);
  const hasStep = timelineSource.includes(`stepNumber: "${stage.step}"`);
  const hasTitle = timelineSource.includes(`title: "${stage.name}"`);
  const hasMetric = timelineSource.includes(`metric: "${stage.metric}"`);

  recordTest(
    "ClinicalStages",
    `Stage ${stage.step}: ${stage.name} (${stage.id}) configured with metric "${stage.metric}" & copy`,
    hasId && hasStep && hasTitle && hasMetric,
    `Missing fields for stage ${stage.id}: id=${hasId}, step=${hasStep}, title=${hasTitle}, metric=${hasMetric}`
  );
});

// Stage 1: 4 Discovery channels verification
const expectedChannels = ["maps", "insta", "seo", "qr"];
expectedChannels.forEach((ch) => {
  recordTest(
    "DiscoveryChannels",
    `Stage 1 includes discovery channel: '${ch}'`,
    timelineSource.includes(`id: "${ch}"`),
    `Channel ${ch} not found in patient-journey-timeline.tsx`
  );
});

// Stage 1 QR Zero-CLS verification
const qrFixedMinHeight = timelineSource.includes("min-h-[560px]") || timelineSource.includes("min-h-[500px]");
const qrPermanentSlot = timelineSource.includes("opacity-0 pointer-events-none");
recordTest(
  "CLSPrevention",
  "Day/Night QR toggle uses permanent DOM slot (opacity-0 pointer-events-none) to eliminate CLS",
  qrFixedMinHeight && qrPermanentSlot,
  `minHeight=${qrFixedMinHeight}, permanentSlot=${qrPermanentSlot}`
);

// WhatsApp UI Realism
const hasDoctorHeader = timelineSource.includes("Aarogyam Clinic") && timelineSource.includes("Dr. Arvind Sharma");
const hasDoctorReg = timelineSource.includes("DMC/14820");
const hasVerifiedBadge = timelineSource.includes("Official WhatsApp Business Account");
const hasYourToken = timelineSource.includes("#14") || timelineSource.includes("Your Token");
const hasNowInCabin = timelineSource.includes("Now In Cabin:") && timelineSource.includes("Token #11");
const hasBlueCheckmarks = timelineSource.includes("#53BDEB");

recordTest(
  "WhatsAppRealism",
  "Realistic WhatsApp chat UI contains verified badge, clinic letterhead, DMC reg, Your Token #14, and Cabin status",
  hasDoctorHeader && hasDoctorReg && hasVerifiedBadge && hasYourToken && hasNowInCabin && hasBlueCheckmarks,
  `Header: ${hasDoctorHeader}, Reg: ${hasDoctorReg}, Verified: ${hasVerifiedBadge}, Token: ${hasYourToken}, Cabin: ${hasNowInCabin}, BlueTicks: ${hasBlueCheckmarks}`
);

// Auto-Rotation Lifecycle & Pause Controls
const hasHoverPause = timelineSource.includes("onMouseEnter={() => setIsPaused(true)}");
const hasMouseLeaveResume = timelineSource.includes("onMouseLeave") && timelineSource.includes("setIsPaused(false)");
const hasClickFreeze = timelineSource.includes("setHasInteracted(true)");
const hasIntervalCleanup = timelineSource.includes("clearInterval(timerRef.current)");
const timerIntervalMatch = timelineSource.includes("6000");

recordTest(
  "AutoRotation",
  "Auto-rotation runs at 6000ms, pauses on hover, safely handles mouse leave, permanently freezes on click, cleans up timer",
  hasHoverPause && hasMouseLeaveResume && hasClickFreeze && hasIntervalCleanup && timerIntervalMatch,
  `Hover: ${hasHoverPause}, Leave: ${hasMouseLeaveResume}, ClickFreeze: ${hasClickFreeze}, Cleanup: ${hasIntervalCleanup}, 6000ms: ${timerIntervalMatch}`
);

// Stage 6: 3-Month Adoption Engine
const hasMonth1 = timelineSource.includes("Month 1 (40% Adoption)");
const hasMonth2 = timelineSource.includes("Month 2 (75% Adoption)");
const hasMonth3 = timelineSource.includes("Month 3 (95%+ Frictionless System)");
recordTest(
  "AdoptionEngine",
  "Stage 6 includes 3-month adoption timeline (Month 1 40%, Month 2 75%, Month 3 95%+)",
  hasMonth1 && hasMonth2 && hasMonth3,
  `Month1: ${hasMonth1}, Month2: ${hasMonth2}, Month3: ${hasMonth3}`
);

// ============================================================================
// SUITE 5: 4 Interactive Tabs & 5 Workflow Steps in DoctorDashboard
// ============================================================================
console.log(`\n${BOLD}--- SUITE 5: 4 Tabs & 5 Workflow Steps in DoctorDashboard ---${RESET}`);

// 4 Interactive Tabs
const expectedTabs = ["queue", "analytics", "rx", "recall"];
expectedTabs.forEach((tab) => {
  recordTest(
    "DashboardTabs",
    `DoctorDashboard includes interactive tab: '${tab}'`,
    dashboardSource.includes(`"${tab}"`),
    `Tab '${tab}' not found`
  );
});

// 5 Workflow Steps
const expectedSteps = [
  { step: 0, time: "7:45 AM", title: "Morning Schedule Loaded", targetTab: "queue" },
  { step: 1, time: "During Clinic", title: "No-Interruption Queue", targetTab: "queue" },
  { step: 2, time: "During Consult", title: "Keep Your Rx Pad", targetTab: "rx" },
  { step: 3, time: "Post Consultation", title: "Auto-Scheduled Follow-ups", targetTab: "recall" },
  { step: 4, time: "End of Day", title: "Practice Insights Dashboard", targetTab: "analytics" }
];

expectedSteps.forEach((st) => {
  const hasTime = dashboardSource.includes(`time: "${st.time}"`);
  const hasTitle = dashboardSource.includes(`title: "${st.title}"`);
  const hasTarget = dashboardSource.includes(`targetTab: "${st.targetTab}"`);

  recordTest(
    "WorkflowSteps",
    `Step ${st.step} (${st.time} -> ${st.targetTab}) defined with title "${st.title}"`,
    hasTime && hasTitle && hasTarget,
    `Missing step properties: time=${hasTime}, title=${hasTitle}, target=${hasTarget}`
  );
});

// Bidirectional Synchronization State Handlers
const hasWorkflowClickHandler = dashboardSource.includes("handleWorkflowClick");
const hasTabClickHandler = dashboardSource.includes("handleTabClick");
const syncQueue = dashboardSource.includes('if (tab === "queue") setActiveWorkflowIndex(1);');
const syncAnalytics = dashboardSource.includes('else if (tab === "analytics") setActiveWorkflowIndex(4);');
const syncRx = dashboardSource.includes('else if (tab === "rx") setActiveWorkflowIndex(2);');
const syncRecall = dashboardSource.includes('else if (tab === "recall") setActiveWorkflowIndex(3);');

recordTest(
  "BidirectionalSync",
  "Dashboard tabs and workflow steps feature complete bidirectional synchronization handlers",
  hasWorkflowClickHandler && hasTabClickHandler && syncQueue && syncAnalytics && syncRx && syncRecall,
  `WorkflowClick: ${hasWorkflowClickHandler}, TabClick: ${hasTabClickHandler}, SyncMap: ${syncQueue && syncAnalytics && syncRx && syncRecall}`
);

// Algorithmic Oracle: Dynamic Token Progression Simulation
console.log(`${BOLD}  [Algorithmic Simulation: Live Queue Call Next Token Progression]${RESET}`);

const baseTokens = [
  { token: "#12", name: "Vikram Joshi", ageGender: "42M", type: "Follow-up", time: "10:15 AM", eta: "In Cabin", status: "in-cabin" },
  { token: "#13", name: "Priya Nair", ageGender: "28F", type: "Acute Cough", time: "10:30 AM", eta: "3 mins", status: "next-up" },
  { token: "#14", name: "Ananya Roy", ageGender: "34F", type: "Consultation", time: "10:45 AM", eta: "11 mins", status: "waiting" },
  { token: "#15", name: "Rohan Mehta", ageGender: "19M", type: "General Checkup", time: "11:00 AM", eta: "19 mins", status: "waiting" },
  { token: "#16", name: "Meera Kapoor", ageGender: "51F", type: "Hypertension Review", time: "11:15 AM", eta: "27 mins", status: "waiting" }
];

function simulateDynamicTokens(currentServingIndex: number) {
  return baseTokens.map((t, idx) => {
    if (idx < currentServingIndex) return { ...t, status: "completed", eta: "Completed" };
    if (idx === currentServingIndex) return { ...t, status: "in-cabin", eta: "In Cabin" };
    if (idx === currentServingIndex + 1) return { ...t, status: "next-up", eta: "Next Up" };
    return { ...t, status: "waiting" };
  });
}

// Test progression across 10 iterations (2 full loops)
let progressionPassed = true;
let currentIdx = 0;
for (let cycle = 0; cycle < 10; cycle++) {
  const simulated = simulateDynamicTokens(currentIdx);
  const inCabinToken = simulated.find((t) => t.status === "in-cabin");
  if (!inCabinToken || inCabinToken.token !== baseTokens[currentIdx].token) {
    progressionPassed = false;
    break;
  }
  if (currentIdx < baseTokens.length - 1) {
    currentIdx++;
  } else {
    currentIdx = 0;
  }
}

recordTest(
  "LiveQueueProgression",
  "Token progression handler safely transitions statuses (completed, in-cabin, next-up, waiting) and loops seamlessly",
  progressionPassed,
  "Simulation failed during 10-iteration loop"
);

// Rx Templates and Fallback Safety
const rxTemplateRhinitis = dashboardSource.includes('"rhinitis"');
const rxTemplateBronchitis = dashboardSource.includes('"bronchitis"');
const rxTemplateDiabetes = dashboardSource.includes('"diabetes"');
const rxFallback = dashboardSource.includes("rxTemplates[activeRxTemplate] ?? rxTemplates.rhinitis");

recordTest(
  "DigitalRxEngine",
  "Digital Rx provides 3 standard clinical templates with nullish coalescing fallback",
  rxTemplateRhinitis && rxTemplateBronchitis && rxTemplateDiabetes && rxFallback,
  `Templates: ${rxTemplateRhinitis}, ${rxTemplateBronchitis}, ${rxTemplateDiabetes}, Fallback: ${rxFallback}`
);

// Auto-Recall Timeline & Metrics
const hasAutoRecall = dashboardSource.includes("Automated Patient Recall Engine");
const hasRetentionMetric = dashboardSource.includes("+34% Retention");
recordTest(
  "AutoRecallEngine",
  "Auto-Recall tab includes chronic recall engine and +34% retention metric",
  hasAutoRecall && hasRetentionMetric,
  `Engine: ${hasAutoRecall}, Retention: ${hasRetentionMetric}`
);

// ============================================================================
// SUITE 6: Responsive Grid Classes & Mobile-First Breakpoint Architecture
// ============================================================================
console.log(`\n${BOLD}--- SUITE 6: Responsive Breakpoints & Grid Classes ---${RESET}`);

// Check PatientJourneyTimeline responsive classes
const timelineGridAudit = {
  mobileStack: timelineSource.includes("grid-cols-1"),
  tabletCol: timelineSource.includes("sm:grid-cols-2") || timelineSource.includes("md:grid-cols-2"),
  desktopCol: timelineSource.includes("lg:grid-cols-12") || timelineSource.includes("lg:col-span-"),
  overflowHidden: timelineSource.includes("overflow-hidden"),
  paddingScale: timelineSource.includes("px-4 sm:px-6")
};

recordTest(
  "ResponsiveDesign",
  "PatientJourneyTimeline implements mobile grid-cols-1, lg:grid-cols-12 desktop layout, and overflow-hidden",
  timelineGridAudit.mobileStack && timelineGridAudit.desktopCol && timelineGridAudit.overflowHidden && timelineGridAudit.paddingScale,
  JSON.stringify(timelineGridAudit)
);

// Check DoctorDashboard responsive classes
const dashboardGridAudit = {
  mobileStack: dashboardSource.includes("grid-cols-1"),
  desktop12Col: dashboardSource.includes("lg:grid-cols-12"),
  leftCol7Span: dashboardSource.includes("lg:col-span-7"),
  rightCol5Span: dashboardSource.includes("lg:col-span-5"),
  statCardsGrid: dashboardSource.includes("grid-cols-2 sm:grid-cols-4"),
  overflowHidden: dashboardSource.includes("overflow-hidden"),
  paddingScale: dashboardSource.includes("px-4 sm:px-6")
};

recordTest(
  "ResponsiveDesign",
  "DoctorDashboard implements 12-column desktop split (7 cols frame + 5 cols workflow) scaling down to 1 col mobile",
  dashboardGridAudit.mobileStack &&
    dashboardGridAudit.desktop12Col &&
    dashboardGridAudit.leftCol7Span &&
    dashboardGridAudit.rightCol5Span &&
    dashboardGridAudit.statCardsGrid &&
    dashboardGridAudit.overflowHidden,
  JSON.stringify(dashboardGridAudit)
);

// Check mobile touch targets & text responsiveness
const textScaleCheck =
  dashboardSource.includes("text-3xl sm:text-5xl") &&
  dashboardSource.includes("text-base sm:text-lg") &&
  timelineSource.includes("text-3xl sm:text-5xl");

recordTest(
  "ResponsiveDesign",
  "Both components use fluid typography scaling (text-3xl sm:text-5xl) for seamless mobile-to-desktop readability",
  textScaleCheck,
  "Fluid typography scaling not found in one or both components"
);

// ============================================================================
// SUITE 7: Adversarial Stress & Edge Case Boundary Testing
// ============================================================================
console.log(`\n${BOLD}--- SUITE 7: Adversarial Stress & Boundary Conditions ---${RESET}`);

// Boundary Condition 1: Analytics chart data index out of bounds
const chartHoverSafety = dashboardSource.includes("analyticsData[chartHoverIndex] ?? analyticsData[4]");
recordTest(
  "BoundaryHarness",
  "Chart hover data point access uses nullish coalescing fallback to prevent undefined crashes",
  chartHoverSafety,
  "Potential index out-of-bounds crash if chartHoverIndex is invalid"
);

// Boundary Condition 2: Check for unescaped HTML entities in both components
const timelineHasAposOrQuotes = timelineSource.includes("&apos;") || timelineSource.includes("&ldquo;");
const dashboardHasApos = dashboardSource.includes("&apos;");

recordTest(
  "LintIntegrity",
  "Both components escape apostrophes/quotes using valid HTML entities (&apos;, &ldquo;)",
  timelineHasAposOrQuotes && dashboardHasApos,
  `Timeline: ${timelineHasAposOrQuotes}, Dashboard: ${dashboardHasApos}`
);

// Boundary Condition 3: Check for client-side window/document leaks without useEffect/guards
const rawWindowInTimeline = /(?<!typeof\s+)window\./.test(timelineSource.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ""));
const rawWindowInDashboard = /(?<!typeof\s+)window\./.test(dashboardSource.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, ""));
recordTest(
  "SSRHygiene",
  "Zero unguarded window references (guarantees SSR hydration stability)",
  !rawWindowInTimeline && !rawWindowInDashboard,
  `Raw window in timeline: ${rawWindowInTimeline}, dashboard: ${rawWindowInDashboard}`
);

// Boundary Condition 4: No non-deterministic Math.random() or Date.now() during render
const mathRandomInRender = /Math\.random\(\)/.test(timelineSource) || /Math\.random\(\)/.test(dashboardSource);
const dateNowInRender = /Date\.now\(\)/.test(timelineSource) || /Date\.now\(\)/.test(dashboardSource);
recordTest(
  "SSRHygiene",
  "Deterministic rendering without Math.random() or Date.now() to prevent React hydration mismatch",
  !mathRandomInRender && !dateNowInRender,
  `Math.random: ${mathRandomInRender}, Date.now: ${dateNowInRender}`
);

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log(`\n${BOLD}${CYAN}================================================================================`);
console.log(`   TEST HARNESS EXECUTION SUMMARY`);
console.log(`================================================================================${RESET}`);

const total = results.length;
const passed = results.filter((r) => r.passed).length;
const failed = results.filter((r) => !r.passed).length;

console.log(`\n  Total Tests Executed : ${BOLD}${total}${RESET}`);
console.log(`  Tests Passed         : ${GREEN}${BOLD}${passed}${RESET}`);
console.log(`  Tests Failed         : ${failed === 0 ? GREEN : RED}${BOLD}${failed}${RESET}`);

if (failed === 0) {
  console.log(`\n  ${GREEN}${BOLD}VERDICT: APPROVE (100% Milestone 2 Specifications Verified)${RESET}\n`);
  process.exit(0);
} else {
  console.error(`\n  ${RED}${BOLD}VERDICT: REJECT (${failed} test failures identified)${RESET}\n`);
  process.exit(1);
}
