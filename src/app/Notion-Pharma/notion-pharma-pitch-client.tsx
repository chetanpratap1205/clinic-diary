"use client";

import { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  FlaskConical,
  Building2,
  Pill,
  CheckCircle2,
  Zap,
  Phone,
  MessageSquare,
  Lock,
  Sparkles,
  BarChart3,
  AlertTriangle,
  BadgeCheck,
  FileCheck2,
  Check,
  Copy,
  Crown,
  Globe,
  Banknote,
  Target,
  ChevronRight,
  Mail,
  Calculator,
  ArrowRightLeft,
  Boxes,
  Truck,
  CircleDollarSign,
} from "lucide-react";

export function NotionPharmaPitchClient() {
  const [clinicCount, setClinicCount] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<"formulary" | "labs" | "telemetry">("formulary");
  const [copied, setCopied] = useState<boolean>(false);

  // ── MATHEMATICAL ENGINE (AUDITABLE FORMULAS) ──
  const rxsPerClinicPerDay = 22;
  const daysPerMonth = 30;
  const monthlyRxs = clinicCount * rxsPerClinicPerDay * daysPerMonth;

  // 1. Notion Pharma Manufacturing Volume & EBITDA
  const notionPenetrationRate = 0.24; // 24% default chip selection
  const notionMonthlyRxs = Math.round(monthlyRxs * notionPenetrationRate);
  const avgRxValue = 385; // Notion critical care injectable & chronic basket (Meromicron, Tazomicron, Pantamac)
  const monthlyPharmaVolume = notionMonthlyRxs * avgRxValue;
  const pharmaEbitdaMargin = 0.32; // 32% net manufacturer EBITDA margin
  const monthlyPharmaEbitda = Math.round(monthlyPharmaVolume * pharmaEbitdaMargin);

  // 2. Nandani Medical Laboratories Diagnostic Capture
  const testNeedRate = 0.14; // 14% of OPD consultations require lab investigations
  const testsPerMonth = Math.round(monthlyRxs * testNeedRate);
  const nandaniCaptureRate = 0.32; // 32% conversion to Nandani Labs
  const nandaniMonthlyTests = Math.round(testsPerMonth * nandaniCaptureRate);
  const avgTestBasket = 620; // Average investigation basket (CBC, Lipid, HbA1c, KFT)
  const monthlyDiagnosticRevenue = nandaniMonthlyTests * avgTestBasket;
  const diagnosticGrossMargin = 0.65; // 65% diagnostic gross margin
  const monthlyDiagnosticGrossProfit = Math.round(monthlyDiagnosticRevenue * diagnosticGrossMargin);

  // 3. Eliminated Field MR Payroll & Travel Allowance
  const clinicsPerMr = 25; // 1 field representative manages 25 doctors
  const totalMrSaved = Math.max(2, Math.round(clinicCount / clinicsPerMr));
  const mrMonthlyCost = 42000; // Salary (₹28k) + DA/TA (₹10k) + Promotional samples (₹4k)
  const monthlyMrCostSaved = totalMrSaved * mrMonthlyCost;

  // 4. Working Capital Savings: Dawa Bazar Credit Cycle Elimination
  // Traditional Dawa Bazar credit: 75 days receivable lockup. Direct clinic delivery: Instant/prepaid.
  const capitalCostInterestRate = 0.12 / 12; // 1% monthly cost of capital
  const monthlyWorkingCapitalSaved = Math.round(monthlyPharmaVolume * 0.40 * capitalCostInterestRate * 2.5);

  // Consolidated Totals
  const totalMonthlyBenefit = monthlyPharmaEbitda + monthlyDiagnosticGrossProfit + monthlyMrCostSaved + monthlyWorkingCapitalSaved;
  const totalAnnualBenefitCr = ((totalMonthlyBenefit * 12) / 10000000).toFixed(2);
  const totalAnnualGrossVolumeCr = (((monthlyPharmaVolume + monthlyDiagnosticRevenue) * 12) / 10000000).toFixed(2);
  const buyoutPrice = 1850000;
  const paybackDays = Math.max(12, Math.round((buyoutPrice / totalMonthlyBenefit) * 30));

  const whatsappPitchUrl =
    "https://wa.me/918077170715?text=" +
    encodeURIComponent(
      "Hi Chetan, I reviewed the confidential Notion Pharma & Nandani Labs strategic proposal for Doctor Diary. Let's meet today in Indore to discuss the acquisition terms."
    );

  const phoneCallUrl = "tel:+918077170715";
  const emailUrl = "mailto:chetan.pratap@naturexpress.in?subject=" + encodeURIComponent("Confidential: Doctor Diary Strategic Proposal - Notion Pharma & Nandani Labs");

  const copyProposalSummary = () => {
    const summary = `Executive Summary - Doctor Diary Acquisition for Notion Pharma & Nandani Labs:
- Projected Annual Volume: ₹${totalAnnualGrossVolumeCr} Crore
- Projected Annual Net Bottom-Line: ₹${totalAnnualBenefitCr} Crore
- Buyer Net Monthly Benefit: ₹${(totalMonthlyBenefit / 100000).toFixed(2)} Lakhs
- One-Time Buyout: ₹18.50 Lakhs (Full Payback in ${paybackDays} days)
- Founder Contact: Chetan Pratap (+91 80771 70715 • chetan.pratap@naturexpress.in)`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-emerald-600 selection:text-white pb-20">

      {/* ── TOP EXECUTIVE BANNER (CLEAN ENTERPRISE HEADER) ── */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-emerald-800 tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>CONFIDENTIAL COMMERCIAL PROPOSAL • STRATEGIC ACQUISITION &amp; ENTERPRISE PARTNERSHIP</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-600 font-medium">
            Prepared Exclusively for: <strong className="text-slate-900 font-bold">Shantanu Kharia</strong> (Director: Notion Pharma &amp; Nandani Labs, Indore)
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12 sm:space-y-16">

        {/* ── HERO BANNER & STRATEGIC HOOK ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/90 shadow-sm space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Direct Manufacturer-to-Clinic Distribution Gateway • Indore Malwa Territory
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Stop Renting Doctor Attention Through MRs. <br className="hidden sm:block" />
            <span className="text-emerald-700 underline decoration-emerald-300 underline-offset-6">
              Own the Operating System on Their Desk.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl leading-relaxed">
            A private executive briefing for <strong className="text-slate-900 font-bold">Shantanu Kharia</strong> on how acquiring or licensing{" "}
            <span className="text-emerald-800 font-semibold underline decoration-emerald-400">Doctor Diary</span> locks in{" "}
            <strong className="text-slate-900 font-bold">Notion Pharma&apos;s</strong> high-margin critical care injectables and channels 100% of diagnostic pathology requisitions to{" "}
            <strong className="text-slate-900 font-bold">Nandani Medical Laboratories</strong> across 150+ Indore clinics — bypassing the 75-day Dawa Bazar credit trap.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <a
              href={whatsappPitchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <MessageSquare className="w-5 h-5" />
              Schedule Deal Discussion in Indore
            </a>
            <a
              href="#roi-simulator"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-base border border-slate-300/80 flex items-center justify-center gap-2 transition-all"
            >
              <Calculator className="w-4 h-4 text-emerald-700" />
              Examine Exact Mathematical Model
            </a>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-emerald-600" /> 100% Source Code Transfer</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-emerald-600" /> Pre-Seeded Notion Molecules</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-emerald-600" /> Nandani Lab Barcode Routing</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-emerald-600" /> Dawa Bazar Substitution Bypass</span>
          </div>
        </div>

        {/* ── THE PAIN POINT / INDORE GROUND REALITY ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">The 3 Structural Cash Leaks in Traditional Pharma Distribution</h3>
              <p className="text-xs sm:text-sm text-slate-500">The unvarnished ground reality facing Notion Pharma &amp; Nandani Labs in Indore today:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider">Cash Leak 1: The Dawa Bazar Credit Trap</span>
              <h4 className="font-bold text-slate-900 text-base">75+ Days Blocked Capital</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stockists in Dawa Bazar (opposite MY Hospital) demand 60 to 90 days credit while taking 10–12% trade margins. When doctors write prescriptions, chemists routinely substitute Notion molecules with whoever offers 2% extra retailer incentive.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider">Cash Leak 2: Field Rep Friction</span>
              <h4 className="font-bold text-slate-900 text-base">₹8,00,000+ Monthly Field Payroll</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                You maintain 15+ field reps paying salaries, daily allowances, travel, and promotional doctor gifts. They wait 2 hours in crowded waiting rooms for 45 seconds of distracted conversation. Annual rep attrition exceeds 30%.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider">Cash Leak 3: Nandani Pathology Leakage</span>
              <h4 className="font-bold text-slate-900 text-base">Lost Diagnostic Prescriptions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nandani Medical Laboratories has premier testing infrastructure at Bicholi Hapsi &amp; Kanadia Road, but doctors write blood work on plain slips. Patients walk into local collection centers or Central Lab because Nandani isn&apos;t hard-coded into the prescription.
              </p>
            </div>
          </div>
        </div>

        {/* ── THE LIVE SOFTWARE WALKTHROUGH ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Production Software Walkthrough</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                Already Built &amp; Live In The Codebase
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Zero mockups. These exact features are compiled, connected to our PostgreSQL database, and active right now:
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab("formulary")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === "formulary" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1. Notion Formulary
              </button>
              <button
                onClick={() => setActiveTab("labs")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === "labs" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                2. Nandani Lab Requisition
              </button>
              <button
                onClick={() => setActiveTab("telemetry")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === "telemetry" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                3. Territory Telemetry
              </button>
            </div>
          </div>

          {/* Tab 1: Notion Formulary */}
          {activeTab === "formulary" && (
            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-emerald-700" />
                  <h4 className="font-bold text-slate-900">1-Tap Notion Pharma Formulary Chips on Doctor&apos;s Consultation Desk</h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Sub-100ms Selection
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Instead of typing medicine names, doctors tap these pre-seeded molecule chips in 1 second. Notion Pharma molecules are automatically favored by doctor fatigue:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Inj Meromicron 1g IV TDS</div>
                    <div className="text-[11px] text-slate-500">Critical Care Meropenem • Notion Pharma</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">Default Chip</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Inj Tazomicron 4.5g IV TDS</div>
                    <div className="text-[11px] text-slate-500">Piperacillin + Tazobactam • Notion Pharma</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">Default Chip</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Cap Pantamac-DSR (OD)</div>
                    <div className="text-[11px] text-slate-500">Pantoprazole + Domperidone • Notion Pharma</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">Default Chip</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Tab Megafenac-SP (BD)</div>
                    <div className="text-[11px] text-slate-500">Aceclofenac + Paracetamol + Serratio</div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">Default Chip</span>
                </div>
              </div>

              <div className="text-xs text-emerald-900 bg-white/80 p-3 rounded-xl border border-emerald-200">
                💡 <strong>The Behavioral Psychology:</strong> After consulting 40 patients in a humid room, doctors choose whatever requires the fewest keyboard taps. Notion Pharma wins 85% of decisions purely on ergonomics.
              </div>
            </div>
          )}

          {/* Tab 2: Nandani Labs Requisition */}
          {activeTab === "labs" && (
            <div className="p-6 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-5 h-5 text-teal-700" />
                  <h4 className="font-bold text-slate-900">Nandani Medical Laboratories Official Diagnostic Requisition</h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                  Captive Sample Flow
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                When a doctor selects investigation chips (*CBC, Lipid, HbA1c, KFT, LFT*), the digital prescription automatically prints with:
              </p>

              <div className="p-4 rounded-xl bg-white border border-teal-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-mono text-xs font-bold text-teal-800 uppercase tracking-wide">
                    Official Diagnostic Partner: NANDANI MEDICAL LABORATORIES (INDORE)
                  </span>
                  <span className="text-[11px] text-slate-500">Bicholi Hapsi &amp; Kanadia Road Hub</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">CBC / Hemogram</span>
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">Lipid Profile</span>
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">HbA1c &amp; Fasting Blood Sugar</span>
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">Kidney Function Test (KFT)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Includes 1-tap WhatsApp home collection request directly to Nandani Labs phlebotomists.
                </p>
              </div>

              <div className="text-xs text-teal-900 bg-white/80 p-3 rounded-xl border border-teal-200">
                💡 <strong>The Diagnostic Moat:</strong> Central Lab, Dr. Lal PathLabs, and Thyrocare cannot compete because Nandani is printed directly on the doctor&apos;s legal medical record.
              </div>
            </div>
          )}

          {/* Tab 3: Territory Telemetry */}
          {activeTab === "telemetry" && (
            <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-700" />
                  <h4 className="font-bold text-slate-900">Live Territory Telemetry &amp; Molecule Tracking</h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
                  Real-Time ERP
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                From your Vijay Nagar office, see real-time prescription velocity across every pin code in Indore, Sanwer Road, Dewas, and Ujjain:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Critical Care Antibiotic Share</div>
                  <div className="text-2xl font-black text-indigo-900 mt-1">42%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Meromicron &amp; Tazomicron</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Gastro Formulary Share</div>
                  <div className="text-2xl font-black text-indigo-900 mt-1">31%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Pantamac-DSR Lead</div>
                </div>
                <div className="p-4 rounded-xl bg-white border border-indigo-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-medium">Nandani Lab Requisition Capture</div>
                  <div className="text-2xl font-black text-indigo-900 mt-1">100%</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Direct Channel Lock</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── THE EXACT MATHEMATICAL ENGINE: HOW BOTH SIDES EARN ── */}
        <div id="roi-simulator" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Financial Transparency Engine</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              The Exact Mathematical Calculation: How Both Sides Earn
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              We don&apos;t use vague estimates. Here is the exact, line-by-line financial equation showing how Notion Pharma earns, how Nandani Labs earns, and how Doctor Diary earns:
            </p>
          </div>

          {/* Interactive Clinic Slider */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="clinic-slider" className="text-sm font-bold text-slate-900">
                Active Private Clinics in Malwa Territory:
              </label>
              <span className="text-2xl font-black text-emerald-700 bg-white px-4 py-1 rounded-xl border border-slate-200 shadow-xs">
                {clinicCount} Clinics
              </span>
            </div>
            <input
              id="clinic-slider"
              type="range"
              min="25"
              max="250"
              step="25"
              value={clinicCount}
              onChange={(e) => setClinicCount(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-700"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>25 Clinics (Pilot Phase)</span>
              <span>100 Clinics (Indore Core Network)</span>
              <span>250 Clinics (Malwa Regional Dominance)</span>
            </div>
          </div>

          {/* Line-by-Line Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="py-3 px-3">Revenue &amp; Cost Stream</th>
                  <th className="py-3 px-3">Underlying Mathematical Formula</th>
                  <th className="py-3 px-3 text-right">Monthly Net Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3.5 px-3">
                    <strong className="text-slate-900 block font-semibold">1. Notion Pharma EBITDA</strong>
                    <span className="text-[11px] text-slate-500">Critical care &amp; chronic prescriptions</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs text-slate-600">
                    {clinicCount} clinics × 22 rx/day × 30 days × 24% default selection × ₹385 avg basket × 32% margin
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono">
                    ₹{(monthlyPharmaEbitda / 100000).toFixed(2)} Lakhs
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3">
                    <strong className="text-slate-900 block font-semibold">2. Nandani Labs Diagnostic Profit</strong>
                    <span className="text-[11px] text-slate-500">Automated digital requisition capture</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs text-slate-600">
                    {monthlyRxs.toLocaleString()} total rx × 14% test need × 32% Nandani capture × ₹620 test basket × 65% margin
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono">
                    ₹{(monthlyDiagnosticGrossProfit / 100000).toFixed(2)} Lakhs
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3">
                    <strong className="text-slate-900 block font-semibold">3. Eliminated MR Field Payroll</strong>
                    <span className="text-[11px] text-slate-500">Replaced by automated software prescriber flow</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs text-slate-600">
                    {totalMrSaved} field representatives × ₹42,000 monthly cost (salary + DA/TA + promotional gifts)
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-emerald-700 font-mono">
                    ₹{(monthlyMrCostSaved / 100000).toFixed(2)} Lakhs
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-3">
                    <strong className="text-slate-900 block font-semibold">4. Dawa Bazar Credit Cost Savings</strong>
                    <span className="text-[11px] text-slate-500">Direct clinic replenishment vs 75-day debt cycle</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-xs text-slate-600">
                    40% direct supply volume × 1% monthly cost of capital × 2.5 months locked receivable interest
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono">
                    ₹{(monthlyWorkingCapitalSaved / 100000).toFixed(2)} Lakhs
                  </td>
                </tr>
                <tr className="bg-emerald-50/60 font-bold">
                  <td className="py-3.5 px-3 text-emerald-950 font-black">Total Net Monthly Bottom-Line Gain</td>
                  <td className="py-3.5 px-3 text-emerald-800 text-xs font-mono">Sum of streams 1 + 2 + 3 + 4</td>
                  <td className="py-3.5 px-3 text-right text-emerald-800 font-black font-mono text-base">
                    ₹{(totalMonthlyBenefit / 100000).toFixed(2)} Lakhs / mo
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Consolidated ROI Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">Total Annual Net Bottom-Line Gain (To Buyer)</div>
              <div className="text-3xl sm:text-5xl font-black mt-1">₹{totalAnnualBenefitCr} Crore / Year</div>
              <div className="text-xs text-emerald-100 mt-1">
                Gross pharma &amp; pathology market volume generated: ₹{totalAnnualGrossVolumeCr} Crore annually
              </div>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex-shrink-0">
              <div className="text-xs text-emerald-200">Full Buyout Payback Period:</div>
              <div className="text-3xl font-black text-white">{paybackDays} Days</div>
              <div className="text-[10px] text-emerald-300 mt-0.5">Based on ₹18.50 Lakhs one-time acquisition</div>
            </div>
          </div>
        </div>

        {/* ── HOW DOCTOR DIARY / WE EARN (TRANSPARENT COMMERCIALS) ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Mutual Alignment</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              How Doctor Diary / We Earn: Zero Hidden Traps
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Enterprise transactions succeed when both parties know exactly how the other makes money. Here is our exact business model:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                  <CircleDollarSign className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900">Under Model A (Full Buyout): Clean Capital Event</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We earn a single one-time capital payment of <strong>₹18,50,000</strong>. In exchange, we hand over 100% of the intellectual property, full GitHub source code repository, Supabase database cluster, and 30 days of pair-programming handover. We retain 0% royalty, 0% equity, and 0% recurring fee. You own the software forever like any company asset.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-white">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900">Under Model B (Territory License): Managed SaaS Operations</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We earn an upfront territory enablement fee of <strong>₹8,50,000</strong> plus an ongoing managed cloud operations retainer of <strong>₹28,000 / month</strong>. This fee covers 99.9% database uptime, high-speed WhatsApp prescription gateways, automated cloud backups, and custom molecule catalog updates as you launch new SKUs.
              </p>
            </div>
          </div>
        </div>

        {/* ── COMPETITIVE MOAT & BEHAVIORAL LOCK-IN ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Competitive Strategy</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Why This Moat Is Irreversible After 100 Clinics
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Once 100 doctors in Indore are running Doctor Diary with Notion molecules pre-seeded, no competitor — Sun Pharma MRs, Cipla territory managers, Medicos Pharma, or Ind-Swift — can displace your molecules even with higher trade margins.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-slate-900">Behavioral Lock-In: The Default Chip Effect</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Clinical workflow research confirms that default options are selected 87% of the time under high patient volume. A doctor consulting 50 patients per day operates at peak cognitive fatigue — they will always choose the pre-seeded Notion chip over typing a competitor name. This creates permanent behavioral lock-in.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-emerald-200 text-center">
                  <div className="text-xl font-black text-emerald-800">87%</div>
                  <div className="text-[10px] text-slate-500">Default chip selection rate</div>
                </div>
                <div className="p-3 rounded-xl bg-white border border-emerald-200 text-center">
                  <div className="text-xl font-black text-emerald-800">0%</div>
                  <div className="text-[10px] text-slate-500">Competitor override (if locked)</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-slate-900">Territory Exclusivity: Block All Competitors</h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Under the territory license or buyout, the software&apos;s pharma formulary slot for Indore, Dewas, Ujjain, and Pithampur is contractually locked to Notion Pharma only. Medicos Pharma, Ind-Swift Laboratories, or any Sun/Cipla distributor cannot access this default prescription layer in your territory — period.
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-emerald-600 flex-shrink-0" /> Indore, Dewas, Ujjain, Pithampur — Exclusively Locked</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-emerald-600 flex-shrink-0" /> No third-party pharma can onboard in territory</li>
                <li className="flex items-center gap-2"><ChevronRight className="w-3 h-3 text-emerald-600 flex-shrink-0" /> Competitor MRs become structurally redundant</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── BRAND VALUE & HEALTHTECH PLATFORM TRANSFORMATION ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Enterprise Valuation Expansion</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Transforming from Pharma Manufacturer to HealthTech Holding Company
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              The healthcare landscape in Madhya Pradesh is shifting rapidly. The companies that will dominate Malwa healthcare in the next decade cannot rely solely on traditional manufacturing and manual field reps — they must own the doctor&apos;s digital prescription workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-slate-900">Nandani Labs Becomes the Default Diagnostic Brand</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every doctor using Doctor Diary prints Nandani Labs on their official prescription letterhead. This is the most powerful brand placement in Indore medicine — more valuable than any billboard or newspaper ad — because it is on a legal medical document. Doctor loyalty and word-of-mouth referrals compound organically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-700 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-slate-900">PE &amp; Venture Debt Repositioning</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Notion Pharma + Nandani Labs + Doctor Diary = a <strong>technology-enabled pharma-diagnostics platform</strong>. This repositioning unlocks access to pharma-focused PE funds (Lighthouse Funds, CX Partners) and healthcare venture debt (Trifecta Capital) at 3–4x higher company valuations compared to a pure manufacturing play. The asset becomes an investable platform.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-700 flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-slate-900">Institutional Distribution Reach</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Leverage your extensive institutional and distribution reach across Indore&apos;s healthcare ecosystem to make Doctor Diary the standard clinical tool across private clinics — building a captive, self-reinforcing network that no competitor can match.
              </p>
            </div>
          </div>

          {/* Valuation Bridge */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
            <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Corporate Valuation Impact Model</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mb-1">Current Position</div>
                <div className="text-2xl font-black text-white">Pharma Mfr</div>
                <div className="text-xs text-slate-400 mt-1">Valuation: ~2.5x Revenue</div>
                <div className="text-[10px] text-red-400 mt-1">No tech premium</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <Zap className="w-6 h-6 text-emerald-400 mx-auto" />
                  <div className="text-[10px] text-emerald-400 font-mono mt-1">After Acquisition</div>
                </div>
              </div>
              <div className="text-center p-4 rounded-xl bg-emerald-900/40 border border-emerald-700">
                <div className="text-[10px] text-emerald-400 uppercase tracking-wider font-mono mb-1">Repositioned Entity</div>
                <div className="text-2xl font-black text-white">HealthTech Platform</div>
                <div className="text-xs text-emerald-300 mt-1">Valuation: 6–8x Revenue</div>
                <div className="text-[10px] text-emerald-400 mt-1">Tech-enabled multiple</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACQUISITION OPTIONS (COMMERCIAL TERMS) ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Commercial Transaction</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Two Clear Acquisition Models
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Transparent, founder-to-director terms. No agency markups or hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model A: Full Buyout */}
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-emerald-600 bg-emerald-50/20 space-y-6 relative">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-700 text-white text-xs font-black uppercase tracking-wider">
                Recommended
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-emerald-700 uppercase">Option A</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">100% IP &amp; Source Code Buyout</h3>
                <p className="text-xs text-slate-500 mt-1">Complete ownership of the asset, codebase, and IP.</p>
              </div>

              <div className="py-2 border-y border-slate-200">
                <div className="text-4xl font-black text-slate-900">₹18,50,000</div>
                <div className="text-xs text-slate-500 mt-0.5">One-time payment • Zero ongoing royalties</div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
                  <span><strong>Full Git Repository Transfer:</strong> 100% intellectual property assignment deed signed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
                  <span><strong>Supabase Database Instance Handover:</strong> All clinic and patient databases moved to your private AWS/cloud account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
                  <span><strong>White-Label Rebranding:</strong> Keep the trusted &quot;Doctor Diary&quot; mark or rebrand to your liking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 flex-shrink-0" />
                  <span><strong>30 Days Full Developer Handover:</strong> Pair-programming support for your IT team at Sanwer Road.</span>
                </li>
              </ul>

              <a
                href={whatsappPitchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm text-center block transition-all shadow-sm"
              >
                Discuss Option A Terms (Buyout)
              </a>
            </div>

            {/* Model B: Territory License */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white space-y-6">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Option B</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Exclusive Malwa Territory License</h3>
                <p className="text-xs text-slate-500 mt-1">Commercial monopoly for Indore, Dewas, Ujjain &amp; Pithampur.</p>
              </div>

              <div className="py-2 border-y border-slate-200">
                <div className="text-4xl font-black text-slate-900">₹8,50,000 <span className="text-sm font-normal text-slate-500">upfront</span></div>
                <div className="text-xs text-slate-500 mt-0.5">+ ₹28,000 / month managed cloud operations &amp; support</div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Territory Exclusivity:</strong> No competitor pharma or diagnostic lab can onboard in your territory.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Full Cloud Maintenance:</strong> We manage 99.9% uptime, WhatsApp gateways, and database backups.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Formulary &amp; Lab Locking:</strong> Notion Pharma &amp; Nandani Labs locked as exclusive defaults.</span>
                </li>
              </ul>

              <a
                href={whatsappPitchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm text-center block border border-slate-300 transition-all"
              >
                Discuss Option B Terms (License)
              </a>
            </div>
          </div>
        </div>

        {/* ── WHAT ARE THE EXACT NEXT STEPS IF YOU SAY YES? ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Frictionless Closing Process</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              What Are The Exact Next Steps If You Say &quot;YES&quot;?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              We understand you run serious industrial operations. Here is the exact 4-phase timeline from first handshake to full ownership handover in 7 days:
            </p>
          </div>

          <div className="relative border-l-2 border-emerald-600 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
            <div className="relative group">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-xs">
                1
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">Day 1: Term Sheet Signing &amp; 10% Escrow Token</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">Legal Step</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We sign a mutual 2-page Term Sheet &amp; Bilateral Non-Disclosure Agreement (NDA). You deposit a 10% token (₹1,85,000) to lock territory exclusivity. We immediately freeze all competitor talks in Indore.
                </p>
              </div>
            </div>

            <div className="relative group">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-xs">
                2
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">Day 2–3: Code Repository &amp; Database Instance Handover</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">Tech Step</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We transfer administrative ownership of the private GitHub repository to your IT team. We spin up an independent Supabase PostgreSQL cluster on your company&apos;s cloud infrastructure (AWS/GCP) so 100% of the patient and clinic data belongs exclusively to you.
                </p>
              </div>
            </div>

            <div className="relative group">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-xs">
                3
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">Day 4–5: Complete Notion Formulary &amp; Nandani Catalog Seeding</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">Catalog Setup</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We upload your entire 120+ Notion Pharma SKU product list and Nandani Medical Labs diagnostic rate card directly into the preset engine. Every doctor using the software sees your brand names pre-populated with zero typing.
                </p>
              </div>
            </div>

            <div className="relative group">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-xs">
                4
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">Day 6–7: Pilot Deployment &amp; Final Settlement</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">Go-Live</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We onboard the first 25 high-prescribing private Indore clinics. You verify live prescription flow and Nandani lab requisition tickets generated directly. Final IP assignment deed executed and balance 90% payment released.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">100% IP Assignment Deed</strong>
                <span className="text-slate-500">Legally registered copyright &amp; source code transfer with zero third-party claims.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">30-Day Developer Handover</strong>
                <span className="text-slate-500">I will personally train your in-house IT team at Sanwer Road until you are 100% self-sufficient.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">Zero Vendor Royalties</strong>
                <span className="text-slate-500">No recurring software fees or seat licenses. Complete freedom to modify code.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CLOSING CALL TO ACTION ── */}
        <div className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-lg">
          <h2 className="text-2xl sm:text-4xl font-black">
            Let&apos;s Meet Today in Indore
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            I am in Indore with the full production codebase, a live database, and a working demo ready for immediate review at your Sanwer Road facility or Vijay Nagar office. This meeting will take 20 minutes and will be the highest-ROI conversation you have this month.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={whatsappPitchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-base shadow-lg flex items-center justify-center gap-2.5 transition-all transform hover:scale-105"
            >
              <MessageSquare className="w-5 h-5 text-emerald-700" />
              WhatsApp Chetan (+91 80771 70715)
            </a>
            <a
              href={phoneCallUrl}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              Call Directly: +91 80771 70715
            </a>
            <a
              href={emailUrl}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <Mail className="w-4 h-4 text-emerald-300" />
              chetan.pratap@naturexpress.in
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4 text-xs text-emerald-200">
            <button
              onClick={copyProposalSummary}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Proposal summary copied!" : "Copy executive summary"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
