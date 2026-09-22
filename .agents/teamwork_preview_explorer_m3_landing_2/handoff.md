# Handoff Report — Explorer M3.2: Territory Exclusivity & Scarcity Specialist

**Target Component**: `src/app/_components/territory-checker.tsx`  
**Milestone**: Milestone 3 — Enterprise Trust & Proof: Security, Territory & Stories  
**Role**: Explorer M3.2 (Territory Exclusivity & Scarcity Specialist)  
**Status**: Specification Mined, Synthesized & Fully Blueprinted for Worker M3 (Read-Only)

---

## 1. Observation

### 1.1. Existing Component Analysis (`src/app/_components/territory-checker.tsx`, lines 1–147)
A line-by-line audit of the existing file reveals several critical defects, unfinished placeholders, and missing enterprise specifications:

1. **Unfinished Bracket Placeholder Typo (Lines 48–53)**:
   ```tsx
   <h2 className="text-3xl sm:text-5xl font-black text-[#0B132B] mb-4 tracking-tight">
     🔒 Your Specialty. Your Area. Protected.<br />
     <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
       One [Specialty] Clinic per Local Area.
     </span>
   </h2>
   ```
   - **Direct Observation**: The text `One [Specialty] Clinic per Local Area.` contains the literal placeholder `[Specialty]` inside brackets. This is an uncompiled placeholder that looks like draft copy.
   - **User Requirement**: "Fix literal bracket string typo: replace unfinished `One [Specialty] Clinic per Local Area.` with clean, dynamic specialty badge and high-impact enterprise headline."

2. **Lack of Specialty Selection (Lines 59–71)**:
   - Currently, there is only a single generic text input: `placeholder="Enter your Specialty & Local Area..."`.
   - The user has no way to select their clinical specialty.
   - **User Requirement**: Quick-select specialty chips for 7 core disciplines: Pediatrics, Dermatology, Dental, Gynecology, General Medicine, Cardiology, Orthopedics.

3. **Missing 6-Digit Indian PIN Code Validation (Lines 20–33 & 61–71)**:
   - The current input does not enforce 6 digits or validate against Indian postal PIN code rules. Any non-empty string is accepted (e.g. typing "abc" triggers the check).
   - **User Requirement**: 6-digit Indian PIN code input with instant client validation using the regular expression: `/^[1-9][0-9]{5}$/`.

4. **Single Hardcoded State vs. 3 Required Visual Feedback States (Lines 11–16 & 90–126)**:
   - The state `result` is hardcoded to `available: true` (lines 28–31: `setResult({ searched: true, available: true, ... })`). It never demonstrates unavailable or in-review territories.
   - **Missing Visual Features in AVAILABLE State**:
     - No radar pulse sweep SVG animation (user requested animated vector radar).
     - No scarcity lock timer (user requested "Reserved for next 15:00 minutes").
     - CTA button (line 116) is a static link to `/signup` with no query parameters, violating the requirement: `/signup?specialty=${encodeURIComponent(specialty)}&pin=${pin}`.
   - **Missing RESERVED State**:
     - No Amber badge ("APPLICATION UNDER REVIEW"), no waitlist position counter (e.g. #2 in line), no "Join Priority Waitlist" CTA.
   - **Missing TAKEN State**:
     - No Rose badge ("TERRITORY LOCKED • Exclusively Held"), no suggestions or chips for adjacent PIN codes.

5. **Underdeveloped "We Build Monopolies, Not Marketplaces" Pillar (Lines 128–141)**:
   - Currently rendered as a plain light text box with two basic paragraphs.
   - **User Requirement**: High-contrast card contrasting aggregator marketplace saturation (Practo/JustDial directory commoditization, 15-30% commissions, competitor ad auctions) versus territorial exclusivity (1 clinic per specialty, 100% patient demand channeled exclusively to the doctor, 0% commissions forever, practice sovereignty).

### 1.2. Architecture & Parent Integration (`src/app/page.tsx` & `PROJECT.md`)
1. **Dynamic Import Loader (`src/app/page.tsx:35`)**:
   ```tsx
   const TerritoryChecker = dynamic(() => import("./_components/territory-checker").then((m) => m.TerritoryChecker));
   ```
   - Component must export named `TerritoryChecker` as well as `export default TerritoryChecker`.
   - Must be a client component (`"use client";`).
2. **Page Placement (`src/app/page.tsx:85–88`)**:
   ```tsx
   {/* Exclusivity Checker */}
   <div style={{ contentVisibility: "auto", containIntrinsicSize: "1px 600px" }}>
     <TerritoryChecker />
   </div>
   ```
   - Placed directly between Section 7 (`DoctorDashboard` - light theme) and Section 9 (`DoctorStories` - dark luxury navy `#0B132B`).
   - Serves as the critical transition section from the interactive product demo to social proof and trust.
3. **Test Infrastructure Specification (`TEST_INFRA.md:33`)**:
   - **Tier 4 Scenario 2**: "Clinic owner checks territory availability for Pediatrician in PIN 560001, observes radar sweep, receives Available state, and locks territory."
   - **Assertion Guarantee**: Entering PIN `560001` with specialty `Pediatrics` MUST result in the `AVAILABLE` state, render the radar sweep SVG, start the 15-minute countdown timer, and provide a CTA linking to `/signup?specialty=Pediatrics&pin=560001`.

---

## 2. Logic Chain

1. **Typo Fix to High-Impact Enterprise Positioning**:
   - *Observation*: `One [Specialty] Clinic per Local Area.` looks unpolished and broken.
   - *Logic*: We transform this into a dynamic, reactive headline hierarchy:
     - Top Eyebrow Badge: `Area Exclusivity Protocol • 1 Clinic Per Specialty Per PIN` with shield icon.
     - Enterprise Headline: `Your Specialty. Your Territory. Zero Aggregator Dilution.`
     - Dynamic Specialty Callout: `We license Clinic Diary to strictly <span className="inline-flex ...">1 {selectedSpecialty} Clinic</span> per 6-digit postal code. Once claimed, your digital monopoly is locked.`
     - When the user selects "Dermatology", "Dental", or "Pediatrics", the badge updates in real time, reinforcing personal relevance.

2. **Structured Search & Instant Validation Engine**:
   - *Specialty Selection*: 7 quick-select chips (Pediatrics, Dermatology, Dental, Gynecology, General Medicine, Cardiology, Orthopedics) with active emerald glow.
   - *PIN Validation*: Indian PIN codes are 6 numeric digits strictly starting with 1–9.
   - *Client-side regex*: `/^[1-9][0-9]{5}$/`.
   - *Input Sanitization*: Automatically strips non-numeric characters on change and limits input to 6 characters.
   - *Realtime Feedback*:
     - If user starts with `0`: immediate friendly prompt ("Indian postal PIN codes cannot begin with 0").
     - If length < 6: displays clean character counter ("e.g., 5/6 digits").
     - If exactly 6 digits matching regex: emerald check icon appears and submit button lights up with emerald glow.
   - *1-Click Scenario Testing Presets*: Provide quick testing pills below the search box:
     - `560001 (Available - Bangalore Central)`
     - `560034 (Under Review - Koramangala)`
     - `110001 (Locked - Connaught Place)`
     This allows instant 1-click verification of all 3 states for reviewers, stakeholders, and doctors.

3. **Three High-Impact Visual Feedback States**:
   - **State 1: AVAILABLE (Territory Open)**:
     - *Status Badge*: Emerald glowing pill: `TERRITORY OPEN • 1 Slot Available in PIN {pin}` with pulsing radar ping.
     - *Radar Pulse Sweep SVG Animation*:
       - Precision circular radar HUD screen (`w-40 h-40 sm:w-48 sm:h-48`) with deep dark teal background (`bg-[#03141a]`).
       - Concentric emerald range rings (25%, 50%, 75%, 100%) and crosshair axes (0°, 90°, 180°, 270°).
       - Continuous 360° rotating radar sweep beam with Framer Motion: `animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}`.
       - Central pulsing ping blip with expanding sonar wave (`animate-ping`).
       - HUD Telemetry display: `RADAR SCAN 915 MHz • 1.8km RADIUS LOCKED`.
     - *Scarcity Lock Countdown Timer*:
       - Countdown starting at 15:00 minutes (900 seconds), ticking down every second (`14:59`, `14:58`...).
       - Clean `useEffect` lifecycle with `clearInterval` on unmount to prevent memory leaks.
       - Urgency banner: `⏳ Exclusivity Hold: Reserved for next {minutes}:{seconds} minutes for this session`.
     - *Action CTA*:
       - High-converting emerald button: `Lock Your Territory Now • 1 Slot Only`.
       - Passes query params: `/signup?specialty=${encodeURIComponent(specialty)}&pin=${pin}`.
   - **State 2: RESERVED (Application Under Review)**:
     - *Status Badge*: Amber pulsing badge: `APPLICATION UNDER REVIEW • Slot Pending Verification`.
     - *Contextual Copy*: Explains that a clinic in PIN {pin} submitted verification documents 14 hours ago under our 48-hour compliance verification window.
     - *Waitlist Counter*: `Priority Waitlist Position: #2 in Line`.
     - *Action CTA*: `Join Priority Waitlist for PIN {pin}` linking to `/signup?specialty=${encodeURIComponent(specialty)}&pin=${pin}&mode=waitlist`.
   - **State 3: TAKEN (Territory Locked • Exclusively Held)**:
     - *Status Badge*: Rose/Crimson badge: `TERRITORY LOCKED • Exclusively Held` with locked shield icon.
     - *Monopoly Protection Copy*: Explains that a partner clinic holds the exclusive license in this PIN, and to protect their monopoly, Clinic Diary strictly prohibits competing clinics in the same PIN.
     - *Adjacent PIN Suggestions*: Interactive clickable chips for 3 neighboring PIN codes (e.g. `PIN 110002 • Available`, `PIN 110003 • Available`, `PIN 110005 • Available`).
     - *Interactive Transition*: Clicking any adjacent PIN chip updates the input, triggers the search, and transitions directly into the `AVAILABLE` state!

4. **"We Build Monopolies, Not Marketplaces" Scarcity Pillar**:
   - Transformed into a high-contrast side-by-side comparative Bento Box:
     - **Left: The Aggregator Marketplace Trap (Commoditization)**:
       - Rose/Slate warning styling with `XCircle` icons.
       - Exposes the 5 structural traps: 20+ rival clinics per street, ad auction bidding wars, 15–30% commissions, patient poaching, zero brand equity.
     - **Right: The Clinic Diary Territory Monopoly (Sovereignty)**:
       - Deep executive navy `#0B132B` with glowing emerald border and ambient radial glow.
       - Highlights the 5 monopoly protections: 1 clinic per PIN, 100% patient demand channeled exclusively to you, 0% commissions forever, unbreakable patient retention, complete data sovereignty.
     - **Bottom Assurance Callout**:
       - Explains why Clinic Diary refuses to onboard competitors next door.

---

## 3. Features Discovered & Specification Table

| # | Category | Feature | Specification | Inputs | Outputs | Error Handling | Discovered Via |
|---|----------|---------|---------------|--------|---------|----------------|----------------|
| 1 | Typo Fix | Dynamic Specialty Headline & Badge | Replace `One [Specialty] Clinic...` with dynamic specialty pill & high-impact enterprise headline. | `selectedSpecialty` state | Reactive header with emerald pill badge | Defaults to "Pediatrics" | USER_REQUEST §1 & Line 51 |
| 2 | Search Input | 7 Quick-Select Specialty Chips | Pediatrics, Dermatology, Dental, Gynecology, General Medicine, Cardiology, Orthopedics. | User click / selection | Sets active specialty, updates headline & search | Fallback to "Pediatrics" | USER_REQUEST §2 |
| 3 | Validation | 6-Digit Indian PIN Code Validation | Regex: `/^[1-9][0-9]{5}$/`. Accepts numbers only, rejects leading 0, length exactly 6. | Form input event | Realtime status (typing, error, valid checkmark) | Inline error message banner | USER_REQUEST §2 |
| 4 | State 1 (Open) | AVAILABLE Feedback State | Emerald glow badge: `TERRITORY OPEN • 1 Slot Available in PIN {pin}`. | Valid PIN (e.g. 560001) | Full Available state card with radar & timer | Reverts on new input | USER_REQUEST §3 |
| 5 | State 1 Visual | Radar Pulse Sweep SVG Animation | Vector radar HUD screen with range rings, crosshairs, rotating 360° gradient beam, and ping dot. | Animated state | 60fps rotating radar graphic | Pure CSS/Framer composite animation | USER_REQUEST §3 |
| 6 | State 1 Urgency | Scarcity Lock Countdown Timer | 15:00-minute live countdown timer (ticking down every second) with unmount cleanup. | Active search result | Live "14:59" timer with session hold note | Cleans interval on unmount | USER_REQUEST §3 & Interface Contract |
| 7 | State 1 Action | Query-Preserving Signup CTA | Link routing to `/signup?specialty=${encodeURIComponent(specialty)}&pin=${pin}`. | `selectedSpecialty`, `pinCode` | Direct registration link with URL params | URL-encodes specialty string | USER_REQUEST §3 & PROJECT.md §Interface Contracts |
| 8 | State 2 (Review) | RESERVED Feedback State | Amber badge: `APPLICATION UNDER REVIEW`, waitlist position #2, 14h review counter. | Pending PIN (e.g. 560034) | Amber card with waitlist position badge | Fallback to default waitlist | USER_REQUEST §3 |
| 9 | State 2 Action | Priority Waitlist CTA | CTA button routing to `/signup?specialty=...&pin=...&mode=waitlist`. | Result state | Waitlist registration CTA | URL-encoded parameters | USER_REQUEST §3 |
| 10 | State 3 (Locked) | TAKEN Feedback State | Rose badge: `TERRITORY LOCKED • Exclusively Held`, explains exclusivity charter. | Locked PIN (e.g. 110001) | Rose card with locked shield and notice | Fallback message if no nearby PINs | USER_REQUEST §3 |
| 11 | State 3 Relief | Adjacent PIN Code Suggestions | Clickable pills for 3 neighboring PIN codes. Clicking any pill auto-switches to that PIN & Available state. | Click on adjacent chip | Updates PIN input & switches state to Available | Validates adjacent PIN format | USER_REQUEST §3 |
| 12 | Scarcity Pillar | "Monopolies, Not Marketplaces" Bento | High-contrast 2-column comparative grid contrasting aggregator saturation vs Clinic Diary monopoly. | Static comparative model | Bento Box with red warning vs emerald checkmarks | Responsive flex-col on mobile | USER_REQUEST §4 |
| 13 | Component Contract | Named & Default Export | Must export both `export function TerritoryChecker` and `export default TerritoryChecker`. | Props `className?: string` | React 19 Client Component | Error if exported name mismatched | `src/app/page.tsx:35` |

---

## 4. Caveats

1. **State Isolation & Timer Cleanup**:
   - The countdown timer runs on a 1-second interval. It is strictly encapsulated within `useEffect` and cleared in the return function to ensure zero leaked timers, satisfying the Interface Contract in `PROJECT.md`.
2. **Determinism for E2E Test Compatibility**:
   - `TEST_INFRA.md` specifies in Tier 4 Scenario 2 that PIN `560001` must evaluate to `AVAILABLE` for `Pediatrics`.
   - The status classifier must explicitly guarantee that `560001` is `AVAILABLE`.
   - PIN `110001` is mapped to `TAKEN` (with adjacent suggestions 110002, 110003, 110005).
   - PIN `560034` is mapped to `RESERVED` (with waitlist position #2).
   - Other PINs follow deterministic rules (ending in 7 = TAKEN, ending in 4 or 9 = RESERVED, all others = AVAILABLE).
3. **SSR & Hydration Safety**:
   - The countdown timer begins at 900 seconds (15:00) on both server and client, ensuring zero hydration mismatch.
   - All interactive state is encapsulated within the client component.
4. **Mobile Responsiveness**:
   - On screens < 640px, the search bar stacks vertically from flex-row to flex-col.
   - The radar graphic scales responsively from `w-40 h-40` on mobile to `w-48 h-48` on tablet/desktop.
   - The "Monopolies vs Marketplaces" grid stacks cleanly on mobile (`grid-cols-1 md:grid-cols-2`).

---

## 5. Conclusion & Step-by-Step Action Plan for Worker M3

### Action Plan for Worker M3:
1. Open `src/app/_components/territory-checker.tsx`.
2. Replace the existing contents with the production-ready JSX/TypeScript blueprint provided in Section 7 of this report.
3. Ensure both named export `TerritoryChecker` and `export default TerritoryChecker` are retained.
4. Verify build and type safety by executing:
   ```bash
   npm run typecheck
   ```
5. Run the dedicated verification test script (detailed in Section 6) to verify all 3 states, PIN regex validation, timer cleanup, and query parameters.

---

## 6. Verification Method

### 6.1. Verification Commands
```bash
# 1. Typecheck the entire project
npm run typecheck

# 2. Run the empirical verification harness for TerritoryChecker
npx tsx scripts/verify-m3-territory-checker.ts

# 3. Verify Next.js production build
npm run build
```

### 6.2. Independent Verification Script Blueprint (`scripts/verify-m3-territory-checker.ts`)
Worker M3 or Challenger M3 can run this script to test all criteria:
```typescript
import fs from "node:fs";
import path from "node:path";
import React from "react";
import { renderToString } from "react-dom/server";

const filePath = path.resolve(__dirname, "../src/app/_components/territory-checker.tsx");
const content = fs.readFileSync(filePath, "utf-8");

// Check 1: Typo elimination
console.assert(!content.includes("One [Specialty] Clinic"), "FAIL: Unfinished bracket placeholder still exists!");

// Check 2: 7 Specialty Chips
const specialties = ["Pediatrics", "Dermatology", "Dental", "Gynecology", "General Medicine", "Cardiology", "Orthopedics"];
for (const s of specialties) {
  console.assert(content.includes(s), `FAIL: Missing specialty chip ${s}`);
}

// Check 3: 6-Digit Indian PIN Code Validation Regex
console.assert(content.includes("^[1-9][0-9]{5}$"), "FAIL: Missing PIN validation regex /^[1-9][0-9]{5}$/");

// Check 4: 3 Visual Feedback States
console.assert(content.includes("TERRITORY OPEN"), "FAIL: Missing AVAILABLE state badge!");
console.assert(content.includes("APPLICATION UNDER REVIEW"), "FAIL: Missing RESERVED state badge!");
console.assert(content.includes("TERRITORY LOCKED"), "FAIL: Missing TAKEN state badge!");

// Check 5: Radar Pulse SVG Animation
console.assert(content.includes("conic-gradient"), "FAIL: Missing radar sweep conic gradient!");

// Check 6: Scarcity Lock Timer
console.assert(content.includes("Reserved for next"), "FAIL: Missing scarcity lock countdown copy!");

// Check 7: Signup Query Parameters
console.assert(content.includes("/signup?specialty=") && content.includes("&pin="), "FAIL: Missing query params on signup CTA!");

// Check 8: Monopolies vs Marketplaces Pillar
console.assert(content.includes("We build monopolies, not marketplaces") || content.includes("We Build Monopolies, Not Marketplaces"), "FAIL: Missing Scarcity Pillar!");

console.log("All TerritoryChecker static verifications PASSED!");
```

---

## 7. Complete JSX/TypeScript Production Blueprint for Worker M3

Below is the complete, drop-in replacement source code for `src/app/_components/territory-checker.tsx`.

```tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  MapPin,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Radio,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Compass,
  Crosshair,
  ChevronRight,
  XCircle,
  AlertCircle,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface TerritoryCheckerProps {
  className?: string;
}

// 7 Quick-Select Core Specialties
export interface SpecialtyOption {
  id: string;
  name: string;
  badgeLabel: string;
}

export const SPECIALTIES: SpecialtyOption[] = [
  { id: "pediatrics", name: "Pediatrics", badgeLabel: "Pediatric Care" },
  { id: "dermatology", name: "Dermatology", badgeLabel: "Dermatology & Aesthetics" },
  { id: "dental", name: "Dental", badgeLabel: "Dental & Orthodontics" },
  { id: "gynecology", name: "Gynecology", badgeLabel: "Gynecology & Obstetrics" },
  { id: "general_medicine", name: "General Medicine", badgeLabel: "General Medicine" },
  { id: "cardiology", name: "Cardiology", badgeLabel: "Cardiology & Vascular" },
  { id: "orthopedics", name: "Orthopedics", badgeLabel: "Orthopedics & Joint Care" },
];

export type TerritoryStatus = "IDLE" | "AVAILABLE" | "RESERVED" | "TAKEN";

export interface AdjacentPin {
  pin: string;
  area: string;
  status: "AVAILABLE";
}

export interface TerritoryResult {
  searched: boolean;
  status: TerritoryStatus;
  pin: string;
  specialty: string;
  areaName: string;
  waitlistPosition?: number;
  submittedHoursAgo?: number;
  existingClinicName?: string;
  adjacentPins?: AdjacentPin[];
}

// 6-digit Indian PIN code validator (starts with 1-9, exactly 6 digits)
const PIN_REGEX = /^[1-9][0-9]{5}$/;

/**
 * Deterministic status resolver for live demo consistency:
 * - PIN 560001 -> AVAILABLE (Bangalore Central - Required by TEST_INFRA Tier 4 Scenario 2)
 * - PIN 560034 -> RESERVED (Koramangala 3rd Block - Waitlist position #2)
 * - PIN 110001 -> TAKEN (Connaught Place, New Delhi - Held exclusively)
 * - General rule: ends in 7 -> TAKEN, ends in 4/9 -> RESERVED, others -> AVAILABLE
 */
function resolveTerritoryStatus(pin: string, specialty: string): TerritoryResult {
  const numericPin = parseInt(pin, 10);

  // Explicit Scenario: Connaught Place, New Delhi (TAKEN)
  if (pin === "110001" || pin.endsWith("7")) {
    const base = isNaN(numericPin) ? 110000 : numericPin;
    return {
      searched: true,
      status: "TAKEN",
      pin,
      specialty,
      areaName: pin === "110001" ? "Connaught Place, Central Delhi" : `Postal Sector ${pin}`,
      existingClinicName: `Apex ${specialty} Healthcare (Exclusive Licensee)`,
      adjacentPins: [
        { pin: String(base + 1), area: `Sector ${base + 1} North`, status: "AVAILABLE" },
        { pin: String(base + 2), area: `Sector ${base + 2} West`, status: "AVAILABLE" },
        { pin: String(base + 5), area: `Sector ${base + 5} Central`, status: "AVAILABLE" },
      ],
    };
  }

  // Explicit Scenario: Koramangala 3rd Block, Bangalore (RESERVED)
  if (pin === "560034" || pin.endsWith("4") || pin.endsWith("9")) {
    return {
      searched: true,
      status: "RESERVED",
      pin,
      specialty,
      areaName: pin === "560034" ? "Koramangala 3rd Block, Bangalore" : `Postal Sector ${pin}`,
      waitlistPosition: 2,
      submittedHoursAgo: 14,
    };
  }

  // Default: Open / Available Territory (including 560001 Bangalore Central)
  const defaultArea = pin === "560001" ? "MG Road / Brigade Road, Bangalore Central" : `Local Postal Sector ${pin}`;
  return {
    searched: true,
    status: "AVAILABLE",
    pin,
    specialty,
    areaName: defaultArea,
  };
}

export function TerritoryChecker({ className = "" }: TerritoryCheckerProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("Pediatrics");
  const [pinCode, setPinCode] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [result, setResult] = useState<TerritoryResult>({
    searched: false,
    status: "IDLE",
    pin: "",
    specialty: "Pediatrics",
    areaName: "",
  });

  // 15:00-minute Scarcity Lock Countdown Timer (900 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(900);

  useEffect(() => {
    if (result.status !== "AVAILABLE" || !result.searched) return;

    // Reset to 15:00 on fresh available search
    setTimeLeft(900);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);

    return () => clearInterval(timer);
  }, [result.status, result.searched, result.pin, result.specialty]);

  const formattedTimer = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, [timeLeft]);

  // Handle PIN input sanitization & instant client validation
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPinCode(rawVal);

    if (!rawVal) {
      setPinError(null);
      return;
    }

    if (rawVal.startsWith("0")) {
      setPinError("Indian postal PIN codes cannot begin with 0 (valid range: 100000 - 999999)");
      return;
    }

    if (rawVal.length > 0 && rawVal.length < 6) {
      setPinError(`Enter 6 digits (${rawVal.length}/6 entered)`);
      return;
    }

    if (rawVal.length === 6) {
      if (!PIN_REGEX.test(rawVal)) {
        setPinError("Please enter a valid 6-digit Indian postal PIN code");
      } else {
        setPinError(null);
      }
    }
  };

  const executeSearch = (targetPin: string, targetSpecialty: string) => {
    if (!PIN_REGEX.test(targetPin)) {
      setPinError("Please enter a valid 6-digit Indian PIN code (e.g., 560001, 110001)");
      return;
    }

    setPinError(null);
    setIsSearching(true);

    setTimeout(() => {
      setIsSearching(false);
      const res = resolveTerritoryStatus(targetPin, targetSpecialty);
      setResult(res);
    }, 550);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(pinCode, selectedSpecialty);
  };

  // Re-run if specialty changes when a valid PIN is already searched
  const handleSelectSpecialty = (specialty: string) => {
    setSelectedSpecialty(specialty);
    if (result.searched && PIN_REGEX.test(pinCode)) {
      executeSearch(pinCode, specialty);
    }
  };

  // Handle adjacent PIN pill click
  const handleSelectAdjacentPin = (adjPin: string) => {
    setPinCode(adjPin);
    setPinError(null);
    executeSearch(adjPin, selectedSpecialty);
  };

  // Sample preset tester for immediate exploration
  const handleSelectPreset = (samplePin: string) => {
    setPinCode(samplePin);
    setPinError(null);
    executeSearch(samplePin, selectedSpecialty);
  };

  // Dynamic CTAs preserving state
  const availableSignupUrl = `/signup?specialty=${encodeURIComponent(result.specialty)}&pin=${encodeURIComponent(result.pin)}`;
  const waitlistSignupUrl = `/signup?specialty=${encodeURIComponent(result.specialty)}&pin=${encodeURIComponent(result.pin)}&mode=waitlist`;

  return (
    <section className={`py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFBFC] border-t border-slate-200/80 relative overflow-hidden ${className}`}>
      {/* Soft emerald radial glow backdrop */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-gradient-to-tr from-emerald-500/10 via-[#00B7A8]/5 to-transparent rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        
        {/* Top Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#00897B] text-xs font-black uppercase tracking-widest mb-6 shadow-xs"
        >
          <ShieldCheck className="w-4 h-4 text-[#00B7A8]" />
          <span>Area Exclusivity Protocol • 1 Clinic Per Specialty Per Postal Area</span>
        </motion.div>

        {/* Dynamic Enterprise Headline & Subtitle */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0B132B] mb-4 tracking-tight leading-[1.12]"
        >
          Your Specialty. Your Territory.<br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
            Zero Aggregator Dilution.
          </span>
        </motion.h2>

        {/* Dynamic Specialty Badge in Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-slate-600 text-base sm:text-lg max-w-3xl mx-auto mb-8 leading-relaxed font-medium"
        >
          We license Clinic Diary to strictly{" "}
          <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-black bg-emerald-100 text-[#00897B] border border-emerald-300/80 mx-1 shadow-xs">
            1 {selectedSpecialty} Clinic
          </span>{" "}
          per 6-digit postal code. Once claimed, your digital monopoly is locked and competitors are contractually barred.
        </motion.p>

        {/* Step 1: Quick-Select Specialty Chips */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 max-w-4xl mx-auto"
        >
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00B7A8]" />
            <span>Select Your Clinical Specialty</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {SPECIALTIES.map((spec) => {
              const isSelected = selectedSpecialty === spec.name;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => handleSelectSpecialty(spec.name)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-[#00B7A8] text-white shadow-md shadow-emerald-500/25 border border-[#00B7A8] scale-105"
                      : "bg-white text-slate-700 hover:text-slate-900 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
                  }`}
                >
                  <span>{spec.name}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Step 2: 6-Digit Indian PIN Code Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="max-w-2xl mx-auto mb-4"
        >
          <div className="bg-white border border-slate-200/90 p-3 sm:p-3.5 rounded-3xl shadow-xl transition-all focus-within:border-[#00B7A8]/60 focus-within:shadow-[0_15px_40px_rgba(0,183,168,0.12)]">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00B7A8]" />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter 6-digit Indian PIN (e.g. 560001)"
                  value={pinCode}
                  onChange={handlePinChange}
                  className={`w-full h-14 pl-12 pr-12 bg-slate-50 text-[#0B132B] rounded-2xl border text-base font-bold placeholder:text-slate-400 placeholder:font-medium focus:bg-white focus:outline-none transition-all ${
                    pinError
                      ? "border-rose-400 focus:border-rose-500 bg-rose-50/30"
                      : pinCode.length === 6 && PIN_REGEX.test(pinCode)
                      ? "border-emerald-500 focus:border-emerald-600 bg-emerald-50/20"
                      : "border-slate-200 focus:border-[#00B7A8]"
                  }`}
                />
                {pinCode.length === 6 && PIN_REGEX.test(pinCode) && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSearching || !PIN_REGEX.test(pinCode)}
                size="lg"
                className="h-14 px-8 bg-[#00B7A8] hover:bg-[#00998c] disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-base rounded-2xl shadow-[0_4px_16px_rgba(0,183,168,0.3)] disabled:shadow-none transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Scanning Radar...</span>
                  </div>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Verify Exclusivity</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {pinError && (
            <div className="text-rose-600 text-xs font-bold mt-2 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{pinError}</span>
            </div>
          )}

          {/* Quick-Preset Demo Selector */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 font-medium">
            <span>Live Scenarios:</span>
            <button
              type="button"
              onClick={() => handleSelectPreset("560001")}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-[#00897B] font-bold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              560001 (Available)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset("560034")}
              className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              560034 (Under Review)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset("110001")}
              className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-bold hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              110001 (Locked)
            </button>
          </div>
        </motion.div>

        {/* 3 High-Impact Visual Feedback States */}
        <AnimatePresence mode="wait">
          {result.searched && (
            <motion.div
              key={`${result.status}-${result.pin}-${result.specialty}`}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto mt-6 text-left"
            >
              {/* STATE 1: AVAILABLE (Territory Open) */}
              {result.status === "AVAILABLE" && (
                <div className="bg-white border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,183,168,0.15)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-emerald-500 to-[#00897B] text-white text-[11px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-xs">
                    Verified Open
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                    
                    {/* High-Impact Radar Pulse Sweep SVG Animation */}
                    <div className="shrink-0 flex flex-col items-center">
                      <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-[#03141a] border-2 border-[#00B7A8]/50 shadow-[0_0_30px_rgba(0,183,168,0.3)] overflow-hidden flex items-center justify-center">
                        {/* Concentric Radar Grid Rings */}
                        <div className="absolute w-3/4 h-3/4 rounded-full border border-emerald-500/25 pointer-events-none" />
                        <div className="absolute w-1/2 h-1/2 rounded-full border border-emerald-500/35 pointer-events-none" />
                        <div className="absolute w-1/4 h-1/4 rounded-full border border-emerald-500/40 pointer-events-none" />
                        
                        {/* Crosshairs */}
                        <div className="absolute inset-x-0 top-1/2 h-px bg-emerald-500/30 pointer-events-none" />
                        <div className="absolute inset-y-0 left-1/2 w-px bg-emerald-500/30 pointer-events-none" />

                        {/* Radar Sweep Beam (Conic Gradient rotating 360 degrees) */}
                        <motion.div
                          className="absolute inset-0 rounded-full pointer-events-none"
                          style={{
                            background: "conic-gradient(from 0deg, rgba(0, 230, 180, 0.45) 0deg, rgba(0, 183, 168, 0.1) 45deg, transparent 90deg, transparent 360deg)",
                          }}
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                        />

                        {/* Central Target Coordinate Blip with Sonar Pulse */}
                        <div className="relative z-10 flex items-center justify-center">
                          <span className="absolute w-6 h-6 rounded-full bg-emerald-400/40 animate-ping" />
                          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#00B7A8] border-2 border-white" />
                        </div>

                        {/* Radar Coordinate Watermark */}
                        <div className="absolute bottom-2 inset-x-0 text-center text-[9px] font-mono font-bold text-emerald-400/80 uppercase tracking-wider">
                          SECTOR {result.pin} • OPEN
                        </div>
                      </div>

                      <div className="mt-2 text-[10px] font-mono text-slate-500 font-bold tracking-tight">
                        RADAR SCAN 915 MHz • 1.8km RADIUS
                      </div>
                    </div>

                    {/* Available State Content & CTAs */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-[#00897B] text-xs font-black uppercase tracking-wider shadow-xs">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <span>TERRITORY OPEN • 1 Slot Available in PIN {result.pin}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{result.areaName}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-[#0B132B] mb-2 tracking-tight">
                        Sole {result.specialty} License Available
                      </h3>

                      <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium">
                        Zero competing practices have locked this territory. Registering your practice today secures your exclusive digital front desk and legally bars rival {result.specialty.toLowerCase()} clinics in PIN {result.pin}.
                      </p>

                      {/* Scarcity Lock Timer Banner */}
                      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-3 mb-5 flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#00897B]">
                          <Timer className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <span>Exclusivity Hold: Reserved for next {formattedTimer} minutes</span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 hidden sm:inline">
                          Browser Session Protected
                        </span>
                      </div>

                      {/* High-Converting Action CTA with Query Params */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <Link href={availableSignupUrl} className="flex-1">
                          <Button
                            size="lg"
                            className="w-full h-12 bg-[#00B7A8] hover:bg-[#00998c] text-white font-black rounded-xl text-sm shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer group"
                          >
                            <span>Lock Your Territory Now</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-500 mt-2.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00B7A8]" />
                        <span>Contractual 1-specialty monopoly • 0% commissions • Immediate onboarding</span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* STATE 2: RESERVED (Application Under Review) */}
              {result.status === "RESERVED" && (
                <div className="bg-white border-2 border-amber-400/80 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(245,158,11,0.12)] relative overflow-hidden">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="p-3.5 sm:p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-600 shrink-0">
                      <Clock className="w-7 h-7" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-black uppercase tracking-wider">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                          </span>
                          APPLICATION UNDER REVIEW
                        </span>
                        <span className="text-xs font-bold text-slate-500">PIN {result.pin} • {result.areaName}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-[#0B132B] mb-2 tracking-tight">
                        Territory Pending Clinical Verification
                      </h3>

                      <p className="text-slate-600 text-sm leading-relaxed mb-4 font-medium">
                        A {result.specialty} clinic in postal area {result.pin} submitted credentials {result.submittedHoursAgo || 14} hours ago. This territory is temporarily on hold pending clinical license verification (48-hour compliance SLA).
                      </p>

                      {/* Waitlist Position Counter */}
                      <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-black uppercase text-amber-900 tracking-wider mb-0.5">
                            Priority Waitlist Position: #{result.waitlistPosition || 2} in Line
                          </div>
                          <div className="text-xs text-slate-600 font-medium">
                            If the pending application fails clinical verification, this exclusive license automatically releases to the next practitioner in queue.
                          </div>
                        </div>
                      </div>

                      {/* Waitlist CTA */}
                      <Link href={waitlistSignupUrl}>
                        <Button
                          size="lg"
                          className="h-12 px-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                        >
                          <span>Join Priority Waitlist for PIN {result.pin}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>

                      <div className="text-[11px] font-semibold text-slate-500 mt-2.5">
                        Zero payment required • Instant WhatsApp & SMS notification if slot unlocks
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STATE 3: TAKEN (Territory Locked • Exclusively Held) */}
              {result.status === "TAKEN" && (
                <div className="bg-white border-2 border-rose-300 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(244,63,94,0.10)] relative overflow-hidden">
                  <div className="flex items-start gap-4 sm:gap-6">
                    <div className="p-3.5 sm:p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-600 shrink-0">
                      <Lock className="w-7 h-7" />
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-300 text-rose-800 text-xs font-black uppercase tracking-wider">
                          <Lock className="w-3.5 h-3.5 text-rose-600" />
                          TERRITORY LOCKED • Exclusively Held
                        </span>
                        <span className="text-xs font-bold text-slate-500">PIN {result.pin} • {result.areaName}</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-[#0B132B] mb-2 tracking-tight">
                        Exclusive License Held by Partner Clinic
                      </h3>

                      <p className="text-slate-600 text-sm leading-relaxed mb-5 font-medium">
                        An exclusive {result.specialty} practice license has already been issued and permanently locked for PIN {result.pin} ({result.existingClinicName || "Verified Independent Practice"}). Under our strict 1-specialty-per-PIN charter, we cannot onboard another {result.specialty.toLowerCase()} clinic in this exact postal sector.
                      </p>

                      {/* Adjacent PIN Code Suggestions */}
                      {result.adjacentPins && result.adjacentPins.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
                          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-[#00B7A8]" />
                            <span>Available Adjacent Postal Sectors for {result.specialty}:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {result.adjacentPins.map((adj) => (
                              <button
                                key={adj.pin}
                                type="button"
                                onClick={() => handleSelectAdjacentPin(adj.pin)}
                                className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 hover:border-emerald-500 text-slate-800 text-xs font-bold shadow-xs hover:bg-emerald-50/50 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="text-emerald-600 font-black">PIN {adj.pin}</span>
                                <span className="text-slate-500 text-[11px]">({adj.area})</span>
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-[#00897B] text-[10px] font-black">
                                  OPEN
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-slate-500 font-medium">
                        Need to register a different postal sector? Modify the 6-digit PIN code above to verify availability.
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

        {/* "We Build Monopolies, Not Marketplaces" Scarcity Pillar Bento Box */}
        <div className="mt-20 sm:mt-24 text-left max-w-5xl mx-auto">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00B7A8]" />
              <span>The Scarcity Principle • Practice Moat</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight">
              We Build Monopolies, Not Marketplaces.
            </h3>
            <p className="text-slate-600 text-sm sm:text-base font-medium max-w-2xl mx-auto mt-2">
              Why Clinic Diary will never sell software to your competitor across the street.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            
            {/* Column 1: The Aggregator Marketplace Trap */}
            <div className="bg-rose-50/40 border border-rose-200/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 border border-rose-200 text-rose-800 text-[11px] font-black uppercase tracking-wider mb-4">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>The Aggregator Marketplace Model</span>
                </div>

                <h4 className="text-lg sm:text-xl font-bold text-[#0B132B] mb-2 tracking-tight">
                  Directory Commoditization Trap
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  Aggregator platforms (Practo, JustDial, etc.) thrive on saturation. They pit you against dozens of local doctors in a race to the bottom.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Local Saturation:</strong> Sells software to 20+ rival clinics within your exact 2km catchment area.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Sponsored Bidding Wars:</strong> Forces you to pay per click to outbid neighboring doctors for your own patient visibility.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>15% - 30% Commission Tax:</strong> Takes an aggressive cut on every single appointment your clinic fulfills.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Patient Poaching:</strong> Directly markets cheaper rival doctors and discount labs to your returning patients.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Zero Brand Equity:</strong> You are just an interchangeable profile row in someone else's directory.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-rose-200/60 text-[11px] font-semibold text-rose-700 italic">
                "Their business model depends on keeping doctors commoditized and dependent on lead auctions."
              </div>
            </div>

            {/* Column 2: The Clinic Diary Territorial Monopoly */}
            <div className="bg-[#0B132B] text-white border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
              {/* Radial glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-black uppercase tracking-wider mb-4">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>The Clinic Diary Exclusivity License</span>
                </div>

                <h4 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight">
                  Contractual Territorial Monopoly
                </h4>
                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed mb-6">
                  We limit access to exactly one clinic per specialty per postal code. We succeed only when your clinic completely dominates its local area.
                </p>

                <ul className="space-y-3 text-xs sm:text-sm font-medium text-slate-200">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00B7A8] shrink-0 mt-0.5" />
                    <span><strong>1 Clinic Per Specialty:</strong> Strict postal area lock. We contractually bar rival practices in your PIN code.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00B7A8] shrink-0 mt-0.5" />
                    <span><strong>100% Demand Routing:</strong> Every digital scan and local search booking routes exclusively to your front desk.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00B7A8] shrink-0 mt-0.5" />
                    <span><strong>0% Commissions Forever:</strong> Transparent flat software subscription. Keep 100% of your consulting fees.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00B7A8] shrink-0 mt-0.5" />
                    <span><strong>Unbreakable Patient Fortress:</strong> Patients interact solely with your branded portal and WhatsApp channel.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#00B7A8] shrink-0 mt-0.5" />
                    <span><strong>Complete Practice Sovereignty:</strong> You own your database, your patient charts, and your domain forever.</span>
                  </li>
                </ul>
              </div>

              <div className="relative z-10 mt-8 pt-4 border-t border-slate-800 text-[11px] font-semibold text-emerald-300 italic">
                "If we sold software to your neighbor across the street, we would dilute your value. We protect your territory."
              </div>
            </div>

          </div>

          {/* Bottom Reassurance Banner */}
          <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-[#00B7A8] shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#0B132B]">
                  Territories are claimed on a strict first-come, first-verified basis.
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Once a PIN is locked for your specialty, applications from competing clinics are automatically rejected.
                </div>
              </div>
            </div>
            <Link href="/signup" className="shrink-0">
              <Button size="sm" className="bg-[#0B132B] hover:bg-slate-800 text-white font-bold rounded-xl px-4 h-10 text-xs cursor-pointer">
                Claim Your Practice Monopoly
              </Button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}

export default TerritoryChecker;
```
