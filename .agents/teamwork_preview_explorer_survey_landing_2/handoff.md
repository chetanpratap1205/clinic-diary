# Interactive State & Feature Audit: Below-Hero Landing Page

**Date**: 2026-09-21  
**Auditor**: Survey Explorer 2 (Interactive State & Feature Auditor)  
**Target Directory**: `e:\doctor-appointment-saas-platform\src\app\_components\`  
**Target Scope**: `HomeRoiCalculator`, `TerritoryChecker`, `PatientJourneyTimeline`, `DoctorDashboard`, `LeadMagnetSection`, `HomePricingSection`

---

## 1. Observation

### 1.1 `HomeRoiCalculator` (`src/app/_components/home-roi-calculator.tsx`)
- **State Hooks & Inputs** (lines 10-11):
  ```tsx
  const [fee, setFee] = useState(800);
  const [patientsPerDay, setPatientsPerDay] = useState(30);
  ```
- **Assumptions & Formulas** (lines 13-24):
  ```tsx
  const workingDays = 26; // per month
  const averageNoShowRate = 0.15; // 15% industry average without automated reminders
  const recoveredRate = 0.85; // We recover 85% of those no-shows

  const totalPatientsMonth = patientsPerDay * workingDays;
  const lostPatientsMonth = Math.round(totalPatientsMonth * averageNoShowRate);
  const lostRevenueMonth = lostPatientsMonth * fee;
  
  const recoveredPatients = Math.round(lostPatientsMonth * recoveredRate);
  const recoveredRevenue = recoveredPatients * fee;
  ```
- **Slider Configuration** (lines 49-72):
  - `fee`: `min={200}`, `max={5000}`, `step={100}`
  - `patientsPerDay`: `min={5}`, `max={150}`, `step={1}`
- **Formatting**:
  - `₹{fee.toLocaleString()}` and `₹{recoveredRevenue.toLocaleString()}` (lines 47, 92) use default locale without explicit `"en-IN"`.
- **CTA**:
  - Line 99: `<Link href="/signup" className="block pt-2">` — Plain route navigation without query parameters conveying calculated recovery, volume, or fee.
- **Slider Styling & Theme Conflict**:
  - `src/components/ui/slider.tsx` (lines 20-21) defines the track as `bg-slate-800` (dark) and range as `bg-slate-50` (white). In `HomeRoiCalculator` (line 55, 70), only the thumb is overridden (`[&_[role=slider]]:bg-[#00B7A8]`), leaving a dark track and white filled range inside a white card.

### 1.2 `TerritoryChecker` (`src/app/_components/territory-checker.tsx`)
- **State & Search Logic** (lines 10-33):
  ```tsx
  const [pinCode, setPinCode] = useState("");
  const [result, setResult] = useState<{
    searched: boolean;
    available: boolean;
    locationName?: string;
    pin?: string;
  }>({ searched: false, available: true });
  const [isSearching, setIsSearching] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim()) return;

    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setResult({
        searched: true,
        available: true,
        locationName: pinCode.length === 6 ? `Area PIN ${pinCode}` : pinCode,
        pin: pinCode
      });
    }, 600);
  };
  ```
- **Input Mismatch**:
  - Input placeholder (line 66): `"Enter your Specialty & Local Area..."`.
  - State variable is named `pinCode`. It performs no separation between specialty and location, no pincode format validation (`^[1-9][0-9]{5}$`), and no specialty selection dropdown.
- **Hardcoded Availability & Missing Feedback States**:
  - `available: true` is unconditionally hardcoded (line 28).
  - The UI (lines 91-125) renders only an `AVAILABLE` state.
  - States for `reserved` (e.g., "Hold by another clinic expiring in 48h") and `taken` (e.g., "Slot occupied — join waitlist") are completely absent.
- **Unfinished Copy Template**:
  - Line 51 verbatim: `One [Specialty] Clinic per Local Area.` contains raw un-interpolated bracket placeholder `[Specialty]`.
- **CTA Behavior**:
  - Line 116: `<Link href="/signup">` — Passes no `pinCode` or `specialty` query params into the signup funnel.

### 1.3 `PatientJourneyTimeline` (`src/app/_components/patient-journey-timeline.tsx`)
- **Displayed Journey vs Clinical Stages**:
  - The component renders 4 acquisition channels: "Google Maps", "Instagram & Social", "Google Search (SEO)", "Walk-in QR Code" (lines 42-117), followed by an Enterprise Doctor Peace of Mind section (lines 355-425) and a 3-month adoption selector (lines 428-468).
  - The 6 clinical journey stages requested (`Booking -> Reminder -> Live Queue -> Consult -> Digital Rx -> Review`) are not presented as an interactive step progression.
- **Auto-Rotation Bug** (lines 120-125):
  ```tsx
  useEffect(() => {
    const timer = setInterval(() => {
      setSelectedChannel((prev) => (prev + 1) % channels.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [channels.length]);
  ```
  - The 6-second interval runs continuously without pausing on user hover or resetting when a user clicks a tab.
- **Layout Shift on QR Toggle**:
  - Lines 216-243: When `currentChannel.id === "qr"`, a Day/Night toggle button group renders at the top of the storyteller box, changing the height of the container abruptly.

### 1.4 `DoctorDashboard` (`src/app/_components/doctor-dashboard.tsx`)
- **Static Mockup Dependency**:
  - Lines 109-120:
    ```tsx
    <div className="relative w-full aspect-video rounded-b-xl overflow-hidden shadow-inner border-t border-white/10 bg-slate-950">
      <Image 
        src="/assets/Dashboard.png" 
        alt="Doctor Diary Comprehensive Dashboard"
        fill
        className="object-contain object-top"
        sizes="(max-width: 768px) 100vw, 50vw"
        quality={95}
      />
    </div>
    ```
- **Interactivity Absence**:
  - There are NO state hooks (`useState`), NO interactive tabs (Queue, Analytics, Patients, Follow-ups), and NO SVG/code-driven charts.
  - The 5 workflow items on the right (lines 24-55) are static display list items with no click handlers or connection to the preview.
- **Mobile Viewport**:
  - On a 360px–420px mobile screen, the raster image in `aspect-video` shrinks to ~320px wide by 180px high, rendering dense dashboard metrics unreadable.

### 1.5 `LeadMagnetSection` (`src/app/_components/lead-magnet.tsx`)
- **Form Fields & State** (lines 9-33):
  - Only `const [email, setEmail] = useState("")` exists.
  - Phone and Clinic/Doctor Name fields are missing from the UI.
- **Backend Capability vs Frontend Omission**:
  - In `src/app/actions/lead-magnet.ts` (lines 9-11):
    ```ts
    const email = formData.get("email")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim() || "";
    const doctorName = formData.get("doctorName")?.toString().trim() || "Doctor";
    ```
    The server action is already coded to capture `phone` and `doctorName`, but `lead-magnet.tsx` (line 22) only appends `formData.append("email", email)`.
- **Download Mechanism & The "Fake PDF" Bug**:
  - Line 137: UI badge proclaims `FREE PDF`.
  - Lines 35-122: `handleDownload` generates a raw HTML blob and triggers a browser download of `Doctor_Diary_Playbook.html`.
  - The server action returns `downloadUrl: "/assets/docs/5-step-noshow-elimination-guide.pdf"` (line 39), but no such file exists in `public/assets/docs/`.
- **Post-Submission Drop-off**:
  - Once submitted (lines 172-191), only the download button is shown; there is no secondary conversion path (e.g., Free Trial or Live Demo CTA).

### 1.6 `HomePricingSection` (`src/app/_components/home-pricing-section.tsx`)
- **Tiers Displayed** (lines 57-187):
  - Quarterly (₹2,999 / 3 mo), Annual (₹9,999 / yr), Enterprise (Custom, starting ₹14,999/yr).
- **Missing Billing Toggle**:
  - No Monthly / Annual toggle switch exists. (Note: `src/app/actions/billing.ts` lines 54-56 already supports monthly calculation).
- **Missing Comparison Matrix**:
  - Only 5–6 bullet points per tier card; no expandable full-feature comparison table.
- **CTA Link Parameter Loss**:
  - Lines 91, 136: `<Link href="/signup">` navigates to `/signup` with zero plan identifiers or billing parameters.
- **Invalid HTML Nesting**:
  - `<Link href="/signup"><Button ...>Start 14-Day Free Trial</Button></Link>` nests `<button>` inside `<a>` without `asChild`.

---

## 2. Logic Chain

1. **ROI Calculator Value Realization**:
   - *Premise*: Doctors evaluate SaaS software on net financial return and administrative time saved.
   - *Gap*: The current calculator hardcodes no-show rate (15%) and working days (26), omits staff hours saved, omits the net ROI multiple (e.g. 48x return), uses Western currency formatting (`₹100,000` vs `₹1,00,000`), and has an inverted Radix slider track color scheme inside a light card.
   - *Impact*: Reduced credibility and missed conversion trigger since the user cannot model their specific clinic dynamics.

2. **Territory Checker Authenticity**:
   - *Premise*: An exclusivity guarantee ("One clinic per specialty per area") is a primary high-ticket conversion driver.
   - *Gap*: The single input mixes specialty and location, has no PIN validation, contains a raw template bug `[Specialty]` in the headline, and unconditionally outputs `available: true` in 100% of cases without `reserved` or `taken` states.
   - *Impact*: Savvy doctors testing the tool quickly realize the check is simulated, undermining the exclusivity claim.

3. **Patient Journey Storytelling**:
   - *Premise*: R1 requires guiding buyers from problem to solution through an interactive product showcase spanning the entire patient lifecycle.
   - *Gap*: The component focuses on 4 traffic acquisition channels (Maps, Social, SEO, QR) rather than the 6-stage clinical continuum (`Booking -> WhatsApp Reminders -> Live Queue Tracking -> Consultation -> Digital Rx/Bill -> Automated Reviews & Follow-ups`). Furthermore, the 6-second auto-timer interrupts user reading because it lacks hover-pause or click-reset handlers.

4. **Doctor Dashboard Immersion**:
   - *Premise*: Doctors need to see how the software feels in practice across key daily workflows (queue management, revenue analytics, clinical records).
   - *Gap*: The current component embeds a static PNG screenshot (`/assets/Dashboard.png`) inside a generic browser frame. It has no interactive tabs, no dynamic SVG/glassmorphism UI widgets, and is unreadable on mobile devices.

5. **Lead Magnet Capture & Delivery**:
   - *Premise*: A practice growth playbook must capture qualified leads (doctor name, clinic name, WhatsApp number) and deliver high-perceived-value collateral.
   - *Gap*: The form only captures email, missing high-value WhatsApp phone and clinic name (even though the server action already supports them). When submitted, it downloads a raw HTML file (`Doctor_Diary_Playbook.html`) despite advertising a "FREE PDF", and provides no post-download conversion path.

6. **Pricing Clarity & Funnel Continuity**:
   - *Premise*: Pricing should offer flexible commitments (Monthly vs Annual with discount badge) and pass selected plan context into the registration funnel.
   - *Gap*: Missing billing toggle, missing full-feature checklist, and CTAs route to `/signup` without `?plan=...` query parameters, forcing the user to re-select or lose their chosen tier.

---

## 3. Caveats

1. **Backend Exclusivity Records**: The current database (`src/db/schema.ts`) tracks clinics and subscriptions, but does not yet maintain a dedicated `territory_exclusivity` table with geo-fenced pincodes per specialty. A mock territory dictionary or deterministic hashing system is appropriate for marketing preview until live geolocation licensing is finalized.
2. **Physical PDF Asset**: `/assets/docs/5-step-noshow-elimination-guide.pdf` is currently not present in `public/`. If an SVG or PDF download is desired, the asset must be added or a high-quality in-browser modal/printable viewer should be rendered.
3. **App Router Hydration**: Any animated sliders or interactive tab switchers must preserve `"use client"` directives and avoid window-dependent initial states that trigger SSR/hydration mismatches.

---

## 4. Conclusion

The below-hero interactive sections have strong core concepts but exhibit significant gaps in state management, input validation, micro-interactions, and conversion funnel continuity.

### Key Remediation Recommendations:

| Component | Priority | Recommended Action |
|---|---|---|
| `HomeRoiCalculator` | **High** | 1. Add adjustable No-Show slider (5%–35%) or preset pills.<br>2. Add Staff Hours Saved calculation (e.g. ~2.5 hrs/day).<br>3. Display Net ROI Multiple (e.g. "48x Return on Investment").<br>4. Fix slider track contrast (light slate track with emerald range).<br>5. Format currency as Indian locale (`en-IN`).<br>6. Pass parameters into `/signup?plan=annual&recovered=...`. |
| `TerritoryChecker` | **High** | 1. Fix template string typo `[Specialty]` in headline.<br>2. Split into dual inputs: Specialty dropdown + 6-digit PIN/Area input.<br>3. Add Indian PIN regex validation (`^[1-9][0-9]{5}$`).<br>4. Implement 3 realistic visual feedback states: `available` (green), `reserved` (amber countdown), and `taken` (red with waitlist opt-in).<br>5. Pass specialty and PIN as query params to `/signup`. |
| `PatientJourneyTimeline` | **High** | 1. Reframe or augment channels into the 6-stage clinical cycle: `Booking → Reminders → Live Queue → Consult → Digital Rx → Review`.<br>2. Fix auto-rotation timer: pause on hover, reset on manual tab click.<br>3. Add smooth `AnimatePresence` cross-fade between active stages.<br>4. Optimize mobile tab grid for 360px viewports. |
| `DoctorDashboard` | **High** | 1. Replace static PNG screenshot with interactive SVG/Glassmorphism dashboard preview.<br>2. Add 4 interactive view tabs: `Live Queue`, `Revenue Analytics`, `Smart Rx Pad`, `Automated Follow-ups`.<br>3. Connect right-side workflow steps to toggle active dashboard views on click.<br>4. Ensure mobile card adapts gracefully without illegible scaling. |
| `LeadMagnetSection` | **Medium** | 1. Add Doctor Name and WhatsApp Phone fields alongside Email.<br>2. Add client-side validation for email and 10-digit Indian mobile number.<br>3. Replace `.html` download with an elegant interactive in-app reading drawer or actual PDF asset.<br>4. Add post-download secondary CTA: "Start 14-Day Free Trial". |
| `HomePricingSection` | **Medium** | 1. Add Monthly / Annual interactive toggle switch with "Save 20%" badge.<br>2. Add expandable Full Feature Comparison Matrix.<br>3. Append `?plan=quarterly` or `?plan=annual` to `/signup` links.<br>4. Fix `<Link><Button>` invalid HTML nesting via `asChild`. |

---

## 5. Verification Method

### 5.1 Compilation & TypeScript Verification
Execute project build command to verify zero compilation or typing regressions:
```bash
npm run build
```
**Execution Result (2026-09-20T23:01:12Z)**:
- Command: `npm run build`
- Exit code: `0` (Success)
- Turbopack / Next.js 16.2.6 compiled all 56 routes successfully with zero TypeScript or compilation errors.
- Confirmed baseline build integrity is intact.

### 5.2 Component Inspection
1. Verify `src/app/_components/home-roi-calculator.tsx`: Inspect slider track classes, calculation state, currency formatting with `toLocaleString("en-IN")`.
2. Verify `src/app/_components/territory-checker.tsx`: Check for elimination of `[Specialty]` bracket typo, presence of `reserved`/`taken` state handlers, and PIN regex validation.
3. Verify `src/app/_components/patient-journey-timeline.tsx`: Verify timer pause on hover (`onMouseEnter`/`onMouseLeave`) and test tab switching across screen widths down to 360px.
4. Verify `src/app/_components/doctor-dashboard.tsx`: Inspect interactive tab state and glassmorphic SVG mockups.
5. Verify `src/app/_components/lead-magnet.tsx`: Validate FormData submission to `submitLeadMagnetAction` with email, phone, and name.
6. Verify `src/app/_components/home-pricing-section.tsx`: Verify toggle state switching, query parameter generation (`/signup?plan=...`), and `asChild` button nesting.
