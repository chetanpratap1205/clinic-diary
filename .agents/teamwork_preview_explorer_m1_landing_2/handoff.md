# Handoff Report: Milestone 1 Sovereignty & Bento Components Blueprint

**Specialist**: Explorer M1.2 (Sovereignty & Bento Specialist)  
**Target Components**:
1. `src/app/_components/digital-clinic-ownership.tsx` (Feature #3: Practice Sovereignty & Vector Browser Mockup)
2. `src/app/_components/experience-engine.tsx` (Feature #4: 40+ Specialties Marquee & 4 Rich Bento Cards)  
**Parent / Caller**: `03c73ab4-4f06-4888-b15b-5dc01b29defb` (parent)  
**Date**: 2026-09-21  

---

## 1. Observation

Direct examination of the existing codebase revealed critical gaps between current placeholder code and the enterprise Linear/Stripe design standards specified in `ORIGINAL_REQUEST.md` and `PROJECT.md`:

### A. `src/app/_components/digital-clinic-ownership.tsx`
1. **Static Raster Screenshots**:
   Lines 77 & 91 directly embed raster PNG screenshots:
   ```tsx
   // Line 77:
   <Image src="/assets/settings.PNG" alt="App Settings" fill className="object-contain object-top p-2" sizes="(max-width: 768px) 50vw, 30vw" quality={80} />
   // Line 91:
   <Image src="/assets/booking_app.PNG" alt="Clinic Profile" fill className="object-contain object-top p-1.5" sizes="(max-width: 768px) 60vw, 40vw" quality={95} />
   ```
   *Impact*: Blurry on high-DPI/Retina screens, un-themed, static (zero interactivity), rigid aspect ratio (`aspectRatio: "9/19.5"`) causing viewport clipping and awkward empty letterboxing.
2. **Missing Sovereign Interactive SVG Frame**:
   The component lacks the requested vector browser frame with doctor custom URL bar (`clinic.doctordiary.in/dr-sharma` with SSL lock icon), live queue token status pill ("OPD Active • 12 Waiting • Est: 14 mins"), verified doctor trust badge ("MBBS, MD • Verified Specialist"), and direct WhatsApp booking button ("Book in 15 seconds").
3. **Under-leveraged Storytelling Contrast**:
   The narrative mentions practice sovereignty but lacks visual or structural contrast demonstrating *why* aggregators (Practo, 1mg) destroy clinic value by selling patients to rival clinics.

### B. `src/app/_components/experience-engine.tsx`
1. **Specialties Count Deficit**:
   Lines 6–9 define only 11 specialties:
   ```tsx
   const specialtyList = [
     "General Physician", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", 
     "Psychiatry", "Dental", "Neurology", "Gynecology", "Ophthalmology", "ENT"
   ];
   ```
   *Requirement*: Expand to 40+ medical specialties across modern, surgical, allied, and traditional medical practices.
2. **Wireframe Placeholder Gray Bars**:
   Lines 74–80 in Card 1 (Rx Pad):
   ```tsx
   <div className="bg-white w-full h-20 sm:h-24 rounded-2xl border border-slate-200 shadow-sm p-4 transform -rotate-3 flex items-center justify-center">
     <div className="w-full space-y-3 opacity-30">
       <div className="h-2 bg-slate-400 rounded w-1/3"></div>
       <div className="h-2 bg-slate-400 rounded w-2/3"></div>
       <div className="h-2 bg-slate-400 rounded w-1/2"></div>
     </div>
   </div>
   ```
   Lines 143–146 in Card 3 (Phone Mockup Snippet):
   ```tsx
   <div className="space-y-1 w-full">
     <div className="h-2 bg-slate-200 rounded w-2/3" />
     <div className="h-2 bg-slate-200 rounded w-1/3" />
   </div>
   ```
   Lines 166–182 in Card 4 (Sovereignty Visual):
   ```tsx
   <div className="flex gap-3 mb-3 opacity-60">
     <div className="w-8 h-8 rounded-full bg-slate-200" />
     <div className="flex-1 space-y-2"><div className="h-2 bg-slate-300 w-full rounded" /><div className="h-2 bg-slate-200 w-1/2 rounded" /></div>
   </div>
   ```
   *Impact*: Wireframe gray bars degrade perceived quality to an unfinished prototype rather than an enterprise SaaS product.
3. **Missing Semantic SVG UI Representations**:
   - Card 1 lacks a physical prescription clipboard with instant WhatsApp dispatch badge.
   - Card 2 lacks a realistic direct-settlement financial breakdown (100% fee, ₹0 platform cut, direct UPI/NEFT).
   - Card 3 lacks an automated WhatsApp timeline schedule with status checkmarks.
   - Card 4 lacks a patient database vault with AES-256 encryption lock and export action suite.

### C. Design Tokens & Environment
- Next.js 16.2.6, React 19.2.6, Tailwind CSS v4, Framer Motion v12.40.0, Lucide React v1.21.0.
- Colors: Emerald brand `#00B7A8`, Executive Navy `#0B132B`, Surface `#FAFBFC`/`#F8FAFC`.

---

## 2. Logic Chain

1. **Eliminating Raster Bottlenecks**:
   By replacing `/assets/settings.PNG` and `/assets/booking_app.PNG` with a pure SVG/Tailwind CSS browser window and floating mobile card:
   - Asset loading network requests drop to zero (faster LCP and 0 CLS).
   - Vector sharpness is preserved from 360px mobile viewports up to 4K ultra-wide screens.
   - Dynamic micro-states (pulsing live beacon, copyable URL, slot selection) become interactive and realistic.

2. **Practice Sovereignty Framing**:
   The landing page sequence in `src/app/page.tsx` places `DigitalClinicOwnership` immediately after `TheMirror` (pain empathy) and `ZeroFrictionGuarantee` (friction removal). Therefore, this section must establish the core *commercial sovereignty thesis*:
   - Aggregators treat doctors as inventory and sell patient attention to competing clinics.
   - Doctor Diary gives clinics an independent digital headquarters: custom branded URL, direct WhatsApp engagement, 0% commission, and 100% patient data sovereignty.

3. **Experience Engine & Specialties Marquee**:
   - Expanding the specialty list from 11 to 42 comprehensive medical disciplines signals universal clinical readiness (from super-specialties like Interventional Cardiology to allied practices like Physiotherapy and Dietetics).
   - An infinite ticker with gradient edge masks creates continuous visual rhythm while preserving performance via CSS composite transitions and Framer Motion.

4. **Bento Box Overhaul to Semantic SVG UIs**:
   - Replacing wireframe gray bars with pixel-crisp SVG illustrations elevates the page to Linear/Stripe design standards.
   - Each card represents a distinct operational superpower:
     - **Card 1 (Rx Pad)**: Physical prescription clip with cursive handwriting strokes, clinic seal, and instant WhatsApp dispatch badge ("Dispatched in 0.8s").
     - **Card 2 (0% Commission)**: Executive Navy ledger showing `₹800` fee, `₹0` marketplace cut, `₹0` platform fee, and direct bank settlement.
     - **Card 3 (24/7 Smart Manager)**: Automated WhatsApp reminder schedule with blue double-ticks and live queue updates.
     - **Card 4 (Practice Sovereignty)**: Patient directory vault with AES-256 encryption lock, obfuscated patient records, and instant CSV/EMR export controls.

---

## 3. Concrete Implementation Blueprints for Worker

Below are the complete, production-ready architectures, JSX code, and Tailwind v4 classes for both components.

### Blueprint A: `src/app/_components/digital-clinic-ownership.tsx`

```tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Lock,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Zap,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Star,
  Users,
  MessageCircle,
  Sparkles,
  ArrowRight,
  TrendingUp
} from "lucide-react";

export function DigitalClinicOwnership() {
  const [copied, setCopied] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState("Today, 5:30 PM");

  const handleCopy = () => {
    navigator.clipboard?.writeText?.("https://clinic.doctordiary.in/dr-sharma");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  } as const;

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFBFC] border-t border-slate-200/80 relative overflow-hidden">
      {/* Soft emerald radial glow backdrop */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-500/10 via-[#00B7A8]/5 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center"
        >
          {/* Left Column: Narrative & Sovereignty Proof */}
          <div className="lg:col-span-6 text-left flex flex-col items-start">
            {/* Eyebrow Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/90 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-5 shadow-xs"
            >
              <Shield className="w-4 h-4 text-[#00B7A8]" />
              100% Practice Sovereignty
            </motion.div>

            {/* Headline */}
            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0B132B] mb-6 tracking-tight leading-[1.12]"
            >
              Your clinic is your brand.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
                Never let an aggregator sell your patients.
              </span>
            </motion.h2>

            {/* Narrative Prose */}
            <motion.div
              variants={itemVariants}
              className="space-y-4 text-slate-600 text-base sm:text-lg font-medium leading-relaxed mb-8"
            >
              <p>
                When patients search for your name, aggregator apps place ads over your clinic and display competing doctors right next to your profile—charging you up to 35% commission just to see your own patients.
              </p>
              <p>
                With Doctor Diary, your practice gets a high-speed, private digital portal. Zero competitor listings. Zero commissions. Patients book directly with you in 15 seconds, receive automated WhatsApp updates under your name, and pay directly into your bank account.
              </p>
            </motion.div>

            {/* Contrast Feature Comparison Grid */}
            <motion.div
              variants={itemVariants}
              className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8"
            >
              <div className="bg-red-50/60 border border-red-200/70 rounded-2xl p-4 text-left">
                <div className="text-xs font-black text-red-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Aggregator Model
                </div>
                <ul className="text-xs font-semibold text-red-900/80 space-y-1">
                  <li>• Sells search traffic to highest bidder</li>
                  <li>• 20% to 35% commission cuts</li>
                  <li>• Locks your patient data in their silo</li>
                </ul>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 text-left shadow-xs">
                <div className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00B7A8]" /> Doctor Diary Model
                </div>
                <ul className="text-xs font-semibold text-emerald-950 space-y-1">
                  <li>• 100% exclusive: Zero competitor ads</li>
                  <li>• 0% commission on consultations</li>
                  <li>• 100% patient data ownership & export</li>
                </ul>
              </div>
            </motion.div>

            {/* Signature Sovereignty Quote Callout */}
            <motion.div
              variants={itemVariants}
              className="w-full p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00B7A8] shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[#00B7A8] font-black text-lg tracking-tight leading-snug">
                  "Your clinic. Your patients. 100% your revenue."
                </div>
                <div className="text-slate-500 text-xs font-semibold">
                  Contractually guaranteed: We never cross-sell or monetize your patient list.
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: High-Impact Vector Browser & Mobile UI Mockup */}
          <div className="lg:col-span-6 relative w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto w-full max-w-[540px]"
            >
              {/* Desktop Browser Mock Frame */}
              <div className="w-full bg-white rounded-[28px] border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(0,183,168,0.15),0_12px_24px_-8px_rgba(11,19,43,0.06)] overflow-hidden">
                
                {/* Browser Top Navigation Bar */}
                <div className="px-4 py-3 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between gap-3">
                  {/* Window Action Dots */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10" />
                    <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10" />
                  </div>

                  {/* Doctor Custom URL Bar */}
                  <div className="flex-1 max-w-[340px] bg-white border border-slate-200/90 rounded-full px-3.5 py-1.5 flex items-center justify-between text-xs font-semibold text-slate-700 shadow-2xs">
                    <div className="flex items-center gap-2 truncate">
                      <Lock className="w-3.5 h-3.5 text-[#00B7A8] shrink-0" />
                      <span className="text-slate-400 font-mono text-[11px]">https://</span>
                      <span className="text-[#0B132B] font-bold truncate">clinic.doctordiary.in/dr-sharma</span>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="text-slate-400 hover:text-[#00B7A8] transition-colors p-0.5 ml-1 shrink-0 cursor-pointer"
                      title="Copy Clinic Link"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Live Status Beacon */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 hidden sm:inline">LIVE</span>
                  </div>
                </div>

                {/* Inside Clinic Web Portal */}
                <div className="p-5 sm:p-7 space-y-5">
                  
                  {/* Doctor Header Profile */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {/* Doctor Avatar with Emerald Crest */}
                      <div className="relative">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#0B132B] to-slate-800 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                          DS
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-[#00B7A8] text-white p-1 rounded-full shadow-sm">
                          <BadgeCheck className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Doctor Details */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-lg sm:text-xl font-black text-[#0B132B] tracking-tight">
                            Dr. Rajesh Sharma
                          </h3>
                        </div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5 border border-emerald-200/60">
                          <BadgeCheck className="w-3 h-3 text-[#00B7A8]" />
                          MBBS, MD • Verified Specialist
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          Apex Heart & Health Clinic • Indiranagar
                        </div>
                      </div>
                    </div>

                    {/* Rating Pill */}
                    <div className="bg-amber-50 border border-amber-200/80 rounded-xl px-2.5 py-1 text-center shrink-0">
                      <div className="flex items-center gap-1 text-amber-700 font-black text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> 4.9
                      </div>
                      <div className="text-[9px] text-amber-800/80 font-bold">840+ Reviews</div>
                    </div>
                  </div>

                  {/* Live Queue Token Status Pill */}
                  <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 border border-emerald-200 rounded-2xl p-4 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live OPD Queue Status
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                        Token #14 In Cabin
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div className="bg-white/90 rounded-xl p-2 border border-emerald-100 shadow-2xs">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Now Serving</div>
                        <div className="text-base font-black text-[#0B132B]">#14</div>
                      </div>
                      <div className="bg-white/90 rounded-xl p-2 border border-emerald-100 shadow-2xs">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Waiting</div>
                        <div className="text-base font-black text-[#00B7A8]">12 Patients</div>
                      </div>
                      <div className="bg-white/90 rounded-xl p-2 border border-emerald-100 shadow-2xs">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Est. Wait</div>
                        <div className="text-base font-black text-slate-700">~14 mins</div>
                      </div>
                    </div>
                  </div>

                  {/* Fast Slot Selector */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span>Select Appointment Window:</span>
                      <span className="text-emerald-600 text-[11px] font-bold">Walk-ins also welcome</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["Today, 5:30 PM", "Today, 6:00 PM", "Tomorrow, 10:30 AM"].map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            selectedSlot === slot
                              ? "bg-[#0B132B] text-white border-[#0B132B] shadow-sm"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:border-[#00B7A8]"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Direct WhatsApp Instant Booking CTA */}
                  <div className="pt-1">
                    <button className="w-full h-12 rounded-2xl bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold text-sm shadow-[0_8px_20px_rgba(0,183,168,0.3)] hover:shadow-[0_12px_28px_rgba(0,183,168,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer group">
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>Book in 15 seconds via WhatsApp</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="text-center text-[10px] font-semibold text-slate-400 mt-2 flex items-center justify-center gap-2">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      No app download required • Zero platform fees
                    </div>
                  </div>

                </div>

                {/* Bottom Sovereign Guarantee Banner */}
                <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between text-[11px] font-semibold border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">100% Sovereign:</span>
                    <span className="text-slate-300">No competitor ads shown to your patients.</span>
                  </div>
                  <span className="text-[#00B7A8] font-bold">₹0 Commission</span>
                </div>

              </div>

              {/* Floating Mobile Companion Card: WhatsApp Confirmation Simulation */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: 20 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -bottom-6 -right-3 sm:-right-6 w-[260px] sm:w-[280px] bg-white rounded-2xl border border-slate-200/90 shadow-xl p-3.5 z-20"
              >
                <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white">
                    <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-900">Dr. Sharma's Clinic Bot</div>
                  <span className="ml-auto text-[9px] text-slate-400 font-medium">Just now</span>
                </div>
                <div className="bg-emerald-50/80 rounded-xl p-2.5 text-[11px] text-slate-700 leading-tight border border-emerald-100">
                  <p className="font-bold text-emerald-950 mb-1">Appointment Confirmed! ✓✓</p>
                  <p>Token <strong className="text-[#0B132B]">#19</strong> reserved for Rahul V. at 5:30 PM.</p>
                  <div className="mt-1.5 text-[10px] text-[#00B7A8] font-bold flex items-center gap-1">
                    <span>Live Tracker: clinic.doctordiary.in/track</span>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

---

### Blueprint B: `src/app/_components/experience-engine.tsx`

```tsx
"use client";

import { motion } from "framer-motion";
import {
  PenTool,
  Receipt,
  Smartphone,
  Shield,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Lock,
  MessageCircle,
  QrCode,
  Check,
  ShieldCheck,
  Database,
  Building2,
  FileSpreadsheet
} from "lucide-react";

// 42 Medical Specialties across all primary, surgical, allied, and traditional practices
const SPECIALTY_LIST = [
  "General Physician & Internal Medicine",
  "Cardiology & Interventional Care",
  "Dermatology & Cosmetology",
  "Pediatrics & Neonatology",
  "Orthopedics & Joint Replacement",
  "Obstetrics & Gynecology",
  "ENT & Head-Neck Care",
  "Ophthalmology & Eye Surgery",
  "Dental Surgery & Orthodontics",
  "Neurology & Neuro-surgery",
  "Gastroenterology & Hepatology",
  "Pulmonology & Chest Medicine",
  "Psychiatry & Behavioral Health",
  "Endocrinology & Diabetology",
  "Nephrology & Renal Care",
  "Urology & Andrology",
  "Oncology & Surgical Oncology",
  "Rheumatology & Immunology",
  "General & Laparoscopic Surgery",
  "Ayurveda & Integrative Medicine",
  "Homeopathy & Holistic Care",
  "Physiotherapy & Rehabilitation",
  "Dietetics & Clinical Nutrition",
  "Radiology & Diagnostics",
  "Pathology & Lab Medicine",
  "Plastic & Aesthetic Surgery",
  "Vascular & Endovascular Surgery",
  "Pediatric Surgery",
  "Geriatric Medicine",
  "Allergy & Immunology",
  "Pain & Spine Management",
  "Anesthesiology & Critical Care",
  "Podiatry & Foot Care",
  "Infectious Disease Specialists",
  "Occupational & Preventive Care",
  "Speech & Audiology Therapy",
  "Trichology & Hair Restoration",
  "IVF & Reproductive Medicine",
  "Sports Medicine",
  "Emergency Medicine",
  "Family Practice",
  "Preventive Health & Longevity"
];

// Double list for continuous seamless infinite loop
const MARQUEE_SPECIALTIES = [...SPECIALTY_LIST, ...SPECIALTY_LIST];

export function ExperienceEngine() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1
      }
    }
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  } as const;

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAFBFC] relative border-t border-slate-200/80 overflow-hidden">
      
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-12 sm:mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-4 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-[#00B7A8]" />
          Autonomous Clinical Infrastructure
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl font-black text-[#0B132B] mb-6 tracking-tight leading-[1.12]"
        >
          Stop Acting Like a Waiting Room.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
            Start Operating Like a Premium Brand.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium"
        >
          Doctor Diary provides the infrastructure to eliminate reception chaos, eliminate aggregators, and elevate your practice—without forcing you to change how you practice medicine.
        </motion.p>
      </div>

      {/* Infinite Horizontal Marquee: 40+ Specialties */}
      <div className="w-full overflow-hidden mb-16 sm:mb-20 relative flex items-center group">
        {/* Left & Right Gradient Masks */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-36 bg-gradient-to-r from-[#FAFBFC] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-36 bg-gradient-to-l from-[#FAFBFC] to-transparent z-20 pointer-events-none" />
        
        {/* Specialty Label Pill */}
        <div className="flex items-center shrink-0 ml-4 sm:ml-8 z-30 relative bg-[#FAFBFC] pr-4 sm:pr-6 border-r-2 border-slate-200 py-2">
          <span className="text-xs sm:text-sm font-black text-[#00B7A8] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00B7A8]" />
            40+ Medical Specialties
          </span>
        </div>

        {/* Animated Marquee Strip */}
        <motion.div
          className="flex items-center gap-4 sm:gap-6 pl-4 sm:pl-6 shrink-0"
          animate={{ x: [0, "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 65 }}
        >
          {MARQUEE_SPECIALTIES.map((specialty, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs hover:border-[#00B7A8]/60 transition-colors shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-700 whitespace-nowrap">
                {specialty}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bento Box Layout: 4 Deep Semantic SVG Cards */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >

          {/* ================================================================= */}
          {/* Card 1: Physical Rx Pad with Instant WhatsApp Dispatch (7 Cols) */}
          {/* ================================================================= */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-7 bg-white border border-slate-200/90 rounded-[32px] p-6 sm:p-10 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative z-10 max-w-md mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-5 shadow-xs">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0B132B] mb-3 tracking-tight">
                Keep Your Physical Rx Pad.<br />
                <span className="text-[#00B7A8]">Instant Digital Dispatch.</span>
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                You shouldn't have to stare at a computer typing medication dropdowns while speaking with a patient. Write on your traditional prescription pad—we digitize it in 1 second and dispatch a branded PDF straight to their WhatsApp.
              </p>
            </div>

            {/* Semantic SVG UI: Physical Prescription Clipboard + WhatsApp Dispatch Badge */}
            <div className="relative w-full h-[220px] sm:h-[240px] bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 overflow-hidden flex items-center justify-between">
              
              {/* Prescription Pad Mockup */}
              <div className="w-[60%] sm:w-[55%] bg-white rounded-xl border border-slate-200 shadow-md p-3 relative transform -rotate-1 group-hover:rotate-0 transition-transform duration-500">
                {/* Metallic Clip at Top */}
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-3.5 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-xs shadow-xs border border-slate-400/40 flex items-center justify-center">
                  <div className="w-6 h-1 bg-slate-500 rounded-full" />
                </div>

                {/* Prescription Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2 mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-[#0B132B]">DR. R. SHARMA</span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono">REG: 78421</span>
                  </div>
                  <span className="text-[11px] font-serif font-black text-[#00B7A8]">℞</span>
                </div>

                {/* Realistic Medical Handwritten Notes SVG */}
                <svg viewBox="0 0 200 80" className="w-full h-14" fill="none" stroke="currentColor">
                  {/* Handwritten Rx Line 1 */}
                  <path
                    d="M 5,12 Q 25,8 45,14 Q 70,10 95,13 Q 120,16 150,11 Q 170,12 190,14"
                    stroke="#1E293B"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  {/* Handwritten Dosage Line 1 */}
                  <path
                    d="M 20,24 Q 45,21 70,25 Q 100,23 130,24"
                    stroke="#0284C7"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  {/* Handwritten Rx Line 2 */}
                  <path
                    d="M 5,42 Q 35,38 65,44 Q 105,40 145,43 Q 165,41 185,44"
                    stroke="#1E293B"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity="0.85"
                  />
                  {/* Handwritten Signature & Official Stamp */}
                  <path
                    d="M 120,68 Q 135,55 150,68 T 170,62"
                    stroke="#00B7A8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Official Stamp */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] font-bold text-emerald-800">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#00B7A8]" />
                    Signed & Verified
                  </span>
                  <span className="text-slate-400">1-Sec Camera OCR</span>
                </div>
              </div>

              {/* Instant WhatsApp Dispatch Badge */}
              <div className="w-[36%] sm:w-[40%] flex flex-col gap-2 relative z-10">
                <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-3 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                    <span>WhatsApp Bot</span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800">
                    PDF Dispatched
                  </div>
                  <div className="text-[9px] text-emerald-700/80 font-mono">
                    Rx_Sharma_0921.pdf
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold text-emerald-900 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span>Delivered in 0.8s</span>
                    <Check className="w-3 h-3 text-[#25D366]" />
                  </div>
                </div>

                <div className="bg-white border border-slate-200/90 rounded-xl p-2 text-center text-[10px] font-bold text-slate-700 shadow-2xs">
                  Zero Forced Typing
                </div>
              </div>

            </div>
          </motion.div>

          {/* ================================================================= */}
          {/* Card 2: 100% Consultation Fees / 0% Commission (5 Cols - Dark)    */}
          {/* ================================================================= */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-5 bg-[#0B132B] text-white rounded-[32px] p-6 sm:p-10 relative overflow-hidden group shadow-md hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            {/* Ambient emerald radial glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#00B7A8] rounded-full blur-[110px] opacity-20 group-hover:opacity-35 transition-opacity" />

            <div className="relative z-10 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#00B7A8] flex items-center justify-center mb-5 shadow-xs">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">
                100% of Your Fees.<br />
                <span className="text-[#00B7A8]">Zero Commission.</span>
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
                Aggregators pocket 20% to 35% of every consultation. Doctor Diary takes ₹0. Patients pay directly at your desk or via your clinic UPI QR.
              </p>
            </div>

            {/* Semantic SVG UI: Direct Settlement Financial Ledger */}
            <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-slate-400 font-medium">Patient Consultation Fee</span>
                <span className="text-white font-bold text-sm">₹800.00</span>
              </div>
              
              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-slate-400 font-medium">Aggregator Deductions</span>
                <div className="flex items-center gap-1.5">
                  <span className="line-through text-slate-500">₹240.00</span>
                  <span className="text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">
                    ₹0 with Us
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-slate-400 font-medium">Platform Commission</span>
                <span className="text-emerald-400 font-bold">0.0% (₹0.00)</span>
              </div>

              {/* Net Deposit Highlight */}
              <div className="pt-1 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Net Direct Bank Deposit
                  </div>
                  <div className="text-xs text-slate-400">Direct to Doctor's Current A/C</div>
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#00B7A8]">
                  ₹800.00
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>Instant Settlement</span>
                <span className="text-emerald-400">UPI • PhonePe • GPay • Cash</span>
              </div>
            </div>
          </motion.div>

          {/* ================================================================= */}
          {/* Card 3: 24/7 Smart Clinic Manager (5 Cols - Light Emerald)        */}
          {/* ================================================================= */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-5 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white border border-emerald-200/80 rounded-[32px] p-6 sm:p-10 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative z-10 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-5 shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0B132B] mb-3 tracking-tight">
                The 24/7 Smart<br />
                <span className="text-[#00B7A8]">Clinic Manager.</span>
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                When your shutters close at 8 PM, your digital front desk stays open. Patients book online or scan your clinic door QR, while automated WhatsApp reminders slash no-shows by 73%.
              </p>
            </div>

            {/* Semantic SVG UI: Automated WhatsApp Reminder Schedule Timeline */}
            <div className="relative z-10 bg-white rounded-2xl border border-emerald-200/90 p-4 shadow-sm space-y-2.5">
              
              {/* Timeline Event 1: Booking Confirmation */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-300 text-[#00B7A8] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-2 text-xs border border-slate-100">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mb-0.5">
                    <span>Instant WhatsApp Confirmation</span>
                    <span className="text-emerald-700">✓✓ Sent</span>
                  </div>
                  <div className="font-bold text-slate-800">"Token #14 confirmed for 5:30 PM"</div>
                </div>
              </div>

              {/* Timeline Event 2: 2-Hour Autonomous Queue Update */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 border border-teal-300 text-teal-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1 bg-emerald-50/80 rounded-xl p-2 text-xs border border-emerald-100">
                  <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold mb-0.5">
                    <span>T - 2h Smart Queue Update</span>
                    <span className="text-emerald-700">✓✓ Read</span>
                  </div>
                  <div className="font-bold text-emerald-950">"Dr. Sharma at Token #8. Est arrival: 5:15 PM"</div>
                </div>
              </div>

              {/* Timeline Event 3: Next Patient Callout */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#00B7A8] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1 bg-white rounded-xl p-2 text-xs border border-[#00B7A8]/40 shadow-xs">
                  <div className="flex items-center justify-between text-[10px] text-[#00B7A8] font-bold mb-0.5">
                    <span>Live Cabin Alert</span>
                    <span className="animate-pulse font-mono">● Active</span>
                  </div>
                  <div className="font-bold text-[#0B132B]">"You are next! Please enter Cabin 2"</div>
                </div>
              </div>

              {/* Metric Pill */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500">
                <span>Front Desk Phone Inquiries</span>
                <span className="text-emerald-600 font-black">Reduced by 85%</span>
              </div>
            </div>
          </motion.div>

          {/* ================================================================= */}
          {/* Card 4: Patient Database Vault & 100% Sovereignty (7 Cols - Light) */}
          {/* ================================================================= */}
          <motion.div
            variants={cardVariants}
            className="md:col-span-7 bg-white border border-slate-200/90 rounded-[32px] p-6 sm:p-10 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative z-10 max-w-md mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-5 shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0B132B] mb-3 tracking-tight">
                Patient Database Vault.<br />
                <span className="text-[#00B7A8]">Zero Marketplace Leaks.</span>
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                Your patients belong to you—not an aggregator's ad engine. Your medical history records and contact lists are encrypted with AES-256 and exportable to CSV anytime in 1 click.
              </p>
            </div>

            {/* Semantic SVG UI: Enterprise Vault & Obfuscated Patient Directory */}
            <div className="relative w-full bg-slate-50 rounded-2xl border border-slate-200/90 p-4 sm:p-5 overflow-hidden space-y-3">
              
              {/* Vault Security Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-emerald-100 text-[#00B7A8]">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    Patient Directory Vault (AES-256)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-700">HIPAA & DISHA Compliant</span>
                </div>
              </div>

              {/* Data Table Representation */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="grid grid-cols-12 bg-slate-100/80 px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span className="col-span-3">Patient ID</span>
                  <span className="col-span-4">Patient Name</span>
                  <span className="col-span-3">Phone</span>
                  <span className="col-span-2 text-right">Status</span>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  <div className="grid grid-cols-12 px-3 py-2 items-center font-medium">
                    <span className="col-span-3 font-mono text-[11px] text-slate-500">P-9481</span>
                    <span className="col-span-4 font-bold text-slate-800 truncate">Rahul Varma</span>
                    <span className="col-span-3 font-mono text-[11px] text-slate-400">+91 9845••••</span>
                    <span className="col-span-2 text-right text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-12 px-3 py-2 items-center font-medium">
                    <span className="col-span-3 font-mono text-[11px] text-slate-500">P-9482</span>
                    <span className="col-span-4 font-bold text-slate-800 truncate">Meera Nambiar</span>
                    <span className="col-span-3 font-mono text-[11px] text-slate-400">+91 9900••••</span>
                    <span className="col-span-2 text-right text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded ml-auto">
                      Rx Sent
                    </span>
                  </div>

                  <div className="grid grid-cols-12 px-3 py-2 items-center font-medium">
                    <span className="col-span-3 font-mono text-[11px] text-slate-500">P-9483</span>
                    <span className="col-span-4 font-bold text-slate-800 truncate">Anil Deshmukh</span>
                    <span className="col-span-3 font-mono text-[11px] text-slate-400">+91 9741••••</span>
                    <span className="col-span-2 text-right text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded ml-auto">
                      Follow-up
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Portability Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:border-[#00B7A8] hover:text-[#00B7A8] transition-colors cursor-pointer shadow-2xs">
                    <Download className="w-3.5 h-3.5 text-[#00B7A8]" />
                    <span>Export CSV</span>
                  </button>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:border-[#00B7A8] transition-colors cursor-pointer shadow-2xs">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                    <span>Excel Backup</span>
                  </button>
                </div>
                <span className="text-[11px] font-bold text-emerald-700">
                  100% Data Portability • No Lock-in
                </span>
              </div>

            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
```

---

## 4. Caveats

1. **Browser Image Assets (`/assets/settings.PNG` and `/assets/booking_app.PNG`)**:
   - They will no longer be referenced in `digital-clinic-ownership.tsx`. They can remain in the `/public/assets` directory without harm or be purged later in an asset cleanup pass.
2. **Animation Performance on Low-End Mobile Devices**:
   - The infinite marquee uses standard composite CSS/Framer Motion transforms (`x: [0, "-50%"]`), which GPU-accelerates cleanly. Ensure `willChange: "transform"` is maintained.
3. **Copyable URL Interaction**:
   - The browser URL copy button checks `navigator.clipboard?.writeText`. An optional fallback or safe check is included in the blueprint to prevent errors in non-HTTPS local testing environments.
4. **Tailwind v4 Setup**:
   - All classes use native Tailwind CSS v4 syntax (`shadow-2xs`, `shadow-xs`, `@theme` emerald palette, arbitrary spacing).

---

## 5. Conclusion

- **`digital-clinic-ownership.tsx`**: Completely replaces low-fidelity raster screenshots (`settings.PNG`, `booking_app.PNG`) with a retina-sharp, interactive vector browser mockup featuring an active SSL custom URL bar (`clinic.doctordiary.in/dr-sharma`), live queue token pill, verified specialist badge, and 15-second WhatsApp booking button, framed by an emphatic sovereignty vs aggregator storytelling narrative.
- **`experience-engine.tsx`**: Expands the specialty marquee from 11 to 42 medical specialties in an infinite horizontal ticker, and replaces wireframe gray bars across all 4 Bento cards with semantic SVG UI illustrations (Prescription clip with handwritten notes + WhatsApp badge, Executive Navy direct settlement ledger with ₹0 platform cut, WhatsApp reminder schedule with checkmarks, and AES-256 patient database vault with CSV export).

---

## 6. Verification Method

Once implemented by the Worker, verify independently using:

1. **Build & Typecheck**:
   ```bash
   npm run typecheck
   npm run build
   ```
   *Expected result*: Exit code 0, zero compilation errors, zero TypeScript errors.

2. **File Inspection**:
   - Inspect `src/app/_components/digital-clinic-ownership.tsx`: verify no occurrences of `/assets/settings.PNG` or `/assets/booking_app.PNG`.
   - Inspect `src/app/_components/experience-engine.tsx`: verify array length of `SPECIALTY_LIST` is >= 40, and no occurrences of dummy gray bars (`h-2 bg-slate-400 rounded w-1/3`).

3. **Visual & Responsive Inspection**:
   - Verify layout on 375px (mobile), 768px (tablet), 1280px (laptop), and 1920px (ultrawide).
   - Verify hover states on the URL copy button, slot selector chips, and export buttons.
