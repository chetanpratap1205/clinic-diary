/**
 * Challenger M1.1 Adversarial Stress Test Suite
 * Milestone 1: Storytelling Arc Foundation (Clinic Diary Landing Page Overhaul)
 */

import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";

// Import target components
import { TheMirror } from "../src/app/_components/the-mirror";
import { ZeroFrictionGuarantee } from "../src/app/_components/zero-friction-guarantee";
import { DigitalClinicOwnership } from "../src/app/_components/digital-clinic-ownership";
import { ExperienceEngine } from "../src/app/_components/experience-engine";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

let passCount = 0;
let failCount = 0;

function assertTest(name: string, condition: boolean, details?: string) {
  if (condition) {
    passCount++;
    console.log(`  ${GREEN}✓ PASS${RESET}: ${name}`);
  } else {
    failCount++;
    console.error(`  ${RED}✗ FAIL${RESET}: ${name}`);
    if (details) console.error(`    ${RED}${details}${RESET}`);
  }
}

console.log(`\n${BOLD}=== ADVERSARIAL STRESS TEST: Milestone 1 Components ===${RESET}\n`);

// 1. SSR Renderability Test without props
try {
  const htmlMirror = renderToString(React.createElement(TheMirror));
  assertTest("TheMirror renders to string via SSR without crashing", htmlMirror.length > 0);
  assertTest("TheMirror SSR output contains 'The Operational Mirror'", htmlMirror.includes("The Operational Mirror"));
  assertTest("TheMirror SSR output contains 'Doctor kab aayenge'", htmlMirror.includes("Doctor kab aayenge"));
} catch (e: any) {
  assertTest("TheMirror SSR render", false, e.message);
}

try {
  const htmlZeroFriction = renderToString(React.createElement(ZeroFrictionGuarantee));
  assertTest("ZeroFrictionGuarantee renders to string via SSR without crashing", htmlZeroFriction.length > 0);
  assertTest("ZeroFrictionGuarantee SSR output contains 'Zero Clinical Friction Guarantee'", htmlZeroFriction.includes("Zero Clinical Friction Guarantee"));
  assertTest("ZeroFrictionGuarantee SSR contains all 4 guarantees", 
    htmlZeroFriction.includes("Walk-ins") && 
    htmlZeroFriction.includes("Rx Pad") && 
    htmlZeroFriction.includes("48h") && 
    htmlZeroFriction.includes("24/7")
  );
} catch (e: any) {
  assertTest("ZeroFrictionGuarantee SSR render", false, e.message);
}

try {
  const htmlDigitalClinic = renderToString(React.createElement(DigitalClinicOwnership));
  assertTest("DigitalClinicOwnership renders to string via SSR without crashing", htmlDigitalClinic.length > 0);
  assertTest("DigitalClinicOwnership SSR output contains doctor URL bar", htmlDigitalClinic.includes("clinic.doctordiary.in/dr-sharma"));
  assertTest("DigitalClinicOwnership SSR contains live queue status pill", htmlDigitalClinic.includes("Live OPD Queue Status"));
  assertTest("DigitalClinicOwnership SSR contains 0% commission proof", htmlDigitalClinic.includes("0% commission") || htmlDigitalClinic.includes("0% Commission") || htmlDigitalClinic.includes("₹0 Commission"));
} catch (e: any) {
  assertTest("DigitalClinicOwnership SSR render", false, e.message);
}

try {
  const htmlExperienceEngine = renderToString(React.createElement(ExperienceEngine));
  assertTest("ExperienceEngine renders to string via SSR without crashing", htmlExperienceEngine.length > 0);
  assertTest("ExperienceEngine SSR output contains '42 Medical Specialties'", htmlExperienceEngine.includes("42 Medical Specialties"));
  assertTest("ExperienceEngine SSR contains Latin Rx ℞ symbol", htmlExperienceEngine.includes("℞"));
  assertTest("ExperienceEngine SSR contains direct settlement ledger (₹800)", htmlExperienceEngine.includes("800"));
  assertTest("ExperienceEngine SSR contains Patient Directory Vault (AES-256)", htmlExperienceEngine.includes("AES-256"));
} catch (e: any) {
  assertTest("ExperienceEngine SSR render", false, e.message);
}

// 2. Custom className injection stress test
try {
  const customClass = "custom-test-class-xyz123";
  const htmlCustom = renderToString(React.createElement(TheMirror, { className: customClass }));
  assertTest("TheMirror properly merges custom className prop into root element", htmlCustom.includes(customClass));

  const htmlCustomZF = renderToString(React.createElement(ZeroFrictionGuarantee, { className: customClass }));
  assertTest("ZeroFrictionGuarantee properly merges custom className prop", htmlCustomZF.includes(customClass));

  const htmlCustomDCO = renderToString(React.createElement(DigitalClinicOwnership, { className: customClass }));
  assertTest("DigitalClinicOwnership properly merges custom className prop", htmlCustomDCO.includes(customClass));

  const htmlCustomEE = renderToString(React.createElement(ExperienceEngine, { className: customClass }));
  assertTest("ExperienceEngine properly merges custom className prop", htmlCustomEE.includes(customClass));
} catch (e: any) {
  assertTest("Custom className prop injection", false, e.message);
}

// 3. SVG Path Syntax Validator
const svgPathRegex = /^[mzlhvcsqtaz0-9\s,\.\-]+$/i;
const components = [
  { name: "zero-friction-guarantee.tsx", file: path.join(__dirname, "../src/app/_components/zero-friction-guarantee.tsx") },
  { name: "experience-engine.tsx", file: path.join(__dirname, "../src/app/_components/experience-engine.tsx") }
];

for (const comp of components) {
  const content = fs.readFileSync(comp.file, "utf-8");
  const pathMatches = content.matchAll(/d=["']([^"']+)["']/g);
  let allPathsValid = true;
  let count = 0;
  for (const match of pathMatches) {
    count++;
    const pathD = match[1].trim();
    if (!svgPathRegex.test(pathD)) {
      allPathsValid = false;
      console.error(`Invalid SVG path in ${comp.name}: ${pathD}`);
    }
  }
  assertTest(
    `All inline SVG paths in ${comp.name} are syntactically valid (Found: ${count})`,
    allPathsValid && count > 0
  );
}

// 4. Memory / Array Allocation Stress Test for Specialties Marquee
const eeFileContent = fs.readFileSync(path.join(__dirname, "../src/app/_components/experience-engine.tsx"), "utf-8");
const specialtyMatches = eeFileContent.match(/SPECIALTY_LIST\s*=\s*\[([\s\S]*?)\];/);
if (specialtyMatches) {
  const items = specialtyMatches[1]
    .split(",")
    .map(s => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
  
  assertTest("Specialty list has no whitespace-only or empty items", items.every(i => i.length > 2));
  assertTest("Specialty list contains key clinical branches: Cardiology, Pediatrics, Oncology, Ayurveda", 
    items.some(i => i.includes("Cardiology")) &&
    items.some(i => i.includes("Pediatrics")) &&
    items.some(i => i.includes("Oncology")) &&
    items.some(i => i.includes("Ayurveda"))
  );
}

console.log(`\n======================================================`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
if (failCount > 0) {
  process.exit(1);
} else {
  console.log(`\n${GREEN}${BOLD}STRESS TEST VERDICT: ALL TESTS PASSED${RESET}\n`);
  process.exit(0);
}
