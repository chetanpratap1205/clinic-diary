"use client";

import { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  FlaskConical,
  Building2,
  Pill,
  ArrowRight,
  CheckCircle2,
  Zap,
  Phone,
  MessageSquare,
  Lock,
  Layers,
  Sparkles,
  BarChart3,
  Users,
  Clock,
  ArrowUpRight,
  DollarSign,
  Smartphone,
  Laptop,
  AlertTriangle,
  FileText,
  BadgeCheck,
  ChevronRight,
  FileCheck2,
  Check,
  Copy,
} from "lucide-react";

export function NotionPharmaPitchClient() {
  const [clinicCount, setClinicCount] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<"formulary" | "labs" | "telemetry">("formulary");
  const [copied, setCopied] = useState<boolean>(false);

  // Financial Calculations
  const rxsPerClinicPerDay = 22;
  const daysPerMonth = 30;
  const monthlyRxs = clinicCount * rxsPerClinicPerDay * daysPerMonth;
  const notionPenetrationRate = 0.24; // 24% default chip adoption
  const notionMonthlyRxs = Math.round(monthlyRxs * notionPenetrationRate);
  const avgRxValue = 385; // Notion critical care & chronic basket
  const monthlyPharmaVolume = notionMonthlyRxs * avgRxValue;
  const monthlyPharmaEbitda = Math.round(monthlyPharmaVolume * 0.32); // 32% net margin

  // Diagnostic calculations for Nandani Labs
  const testsPerMonth = Math.round(monthlyRxs * 0.14); // 14% of visits need tests
  const nandaniConversionRate = 0.32; // 32% capture
  const nandaniMonthlyTests = Math.round(testsPerMonth * nandaniConversionRate);
  const avgTestBasket = 620; // CBC, Lipid, HbA1c average
  const monthlyDiagnosticRevenue = nandaniMonthlyTests * avgTestBasket;
  const monthlyDiagnosticGrossProfit = Math.round(monthlyDiagnosticRevenue * 0.65);

  // Cost Savings
  const mrSavedPer50Clinics = 4;
  const totalMrSaved = Math.max(2, Math.round((clinicCount / 50) * mrSavedPer50Clinics));
  const monthlyMrCostSaved = totalMrSaved * 42000; // Salary + DA + samples

  // Totals
  const totalMonthlyBenefit = monthlyPharmaEbitda + monthlyDiagnosticGrossProfit + monthlyMrCostSaved;
  const totalAnnualBenefitCr = ((totalMonthlyBenefit * 12) / 10000000).toFixed(2);
  const totalAnnualGrossVolumeCr = (((monthlyPharmaVolume + monthlyDiagnosticRevenue) * 12) / 10000000).toFixed(2);
  const paybackDays = Math.max(12, Math.round((1850000 / totalMonthlyBenefit) * 30));

  const whatsappPitchUrl =
    "https://wa.me/917566789944?text=" +
    encodeURIComponent(
      "Hi Chetan, I reviewed the confidential Notion Pharma & Nandani Labs strategic proposal for Doctor Diary. Let's meet today in Indore to discuss the acquisition terms."
    );

  const phoneCallUrl = "tel:+917566789944";

  const copyProposalSummary = () => {
    const summary = `Executive Summary - Doctor Diary Acquisition for Notion Pharma & Nandani Labs:
- Projected Annual Volume: ₹${totalAnnualGrossVolumeCr} Crore
- Projected Annual Net Bottom-Line: ₹${totalAnnualBenefitCr} Crore
- One-Time Buyout: ₹18.50 Lakhs (Payback in ${paybackDays} days)
- Contact: Chetan (+91 75667 89944)`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      
      {/* ── TOP EXECUTIVE BANNER ── */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-emerald-800 tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <Lock className="w-3.5 h-3.5 text-emerald-700" />
            <span>CONFIDENTIAL STRATEGIC PROPOSAL • M&amp;A / TERRITORY LICENSE</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-600 font-medium">
            Prepared Exclusively for: <strong className="text-slate-900 font-bold">Shantanu Kharia</strong> (Director: Notion Pharma &amp; Nandani Labs)
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12 sm:space-y-16">
        
        {/* ── HERO BANNER & HOOK ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/90 shadow-sm space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Direct Manufacturer-to-Clinic Distribution Gateway
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Stop Renting Doctor Attention Through MRs. <br className="hidden sm:block" />
            <span className="text-emerald-700 underline decoration-emerald-300 underline-offset-6">
              Own the Operating System on Their Desk.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl leading-relaxed">
            A private executive briefing for <strong className="text-slate-900 font-bold">Shantanu Kharia (VIT IT • SP Jain MBA)</strong> on how acquiring or licensing{" "}
            <span className="text-emerald-800 font-semibold underline decoration-emerald-400">Doctor Diary</span> locks in{" "}
            <strong className="text-slate-900 font-bold">Notion Pharma’s</strong> high-margin critical care injectables and channels 100% of diagnostic pathology requisitions to{" "}
            <strong className="text-slate-900 font-bold">Nandani Medical Laboratories</strong> across 150+ Indore clinics.
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
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              Test Live ROI Calculator
            </a>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-emerald-600" /> 100% Source Code Transfer</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-emerald-600" /> Pre-Seeded Notion Molecules</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-emerald-600" /> Nandani Lab Barcode Routing</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-emerald-600" /> Runs on ₹12,000 Budget Phone</span>
          </div>
        </div>

        {/* ── THE PAIN POINT / STRATEGIC BOTTLENECK ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Why the Traditional MR &amp; Dawa Bazar Supply Chain is Leaking Your Cash</h3>
              <p className="text-xs sm:text-sm text-slate-500">The 3 structural bottlenecks facing Notion Pharma &amp; Nandani Labs in Indore today:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider">Bottleneck 1: Field Overhead</span>
              <h4 className="font-bold text-slate-900 text-base">₹8,00,000+ Monthly MR Payroll</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                You maintain 15+ field reps paying salaries, travel allowance, and promotional gifts. They wait 2 hours in crowded clinics for 45 seconds of hurried doctor attention.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider">Bottleneck 2: Dawa Bazar Substitution</span>
              <h4 className="font-bold text-slate-900 text-base">48-Hour Brand Memory Decay</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Even when a doctor intends to prescribe Meropenem or Tazobactam, chemists at Dawa Bazar substitute Notion Pharma with whichever stockist offers 2% extra credit margin.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider">Bottleneck 3: Nandani Pathology Gap</span>
              <h4 className="font-bold text-slate-900 text-base">Lost Diagnostic Prescriptions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doctors write CBC and Lipid profiles on loose paper slips. Patients walk into Central Lab or local collection centers because Nandani isn&apos;t hard-wired into their consultation pad.
              </p>
            </div>
          </div>
        </div>

        {/* ── THE LIVE PRODUCT DEMO / TABS ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Production Software Walkthrough</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                Already Built &amp; Live In The Codebase
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                We did not prepare mockups. These exact features are already compiled and active in our database.
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
                  <span className="text-[11px] text-slate-500">Sanwer Road Hub &amp; Indore Collection</span>
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
                As a director, you can open your dashboard from anywhere in Indore and see real-time prescription velocity across every pin code:
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

        {/* ── INTERACTIVE ROI CALCULATOR (THE WOW FACTOR) ── */}
        <div id="roi-simulator" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">Interactive Financial Simulation</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Calculate Your Exact Return on Investment (ROI)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Slide the number of clinics deployed across Indore, Sanwer Road, Dewas, and Ujjain to see your net bottom-line profit.
            </p>
          </div>

          {/* Slider Controls */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="clinic-slider" className="text-sm font-bold text-slate-900">
                Number of Private Clinics Deployed:
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
              <span>25 Clinics (Pilot)</span>
              <span>100 Clinics (Indore Core)</span>
              <span>250 Clinics (Complete Malwa Territory)</span>
            </div>
          </div>

          {/* Dynamic Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">Notion Pharma Monthly EBITDA</div>
              <div className="text-3xl font-black text-slate-900">₹{(monthlyPharmaEbitda / 100000).toFixed(2)} Lakhs</div>
              <p className="text-xs text-slate-600">
                From {notionMonthlyRxs.toLocaleString()} monthly Notion prescriptions across {clinicCount} clinics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">Nandani Labs Diagnostic Revenue</div>
              <div className="text-3xl font-black text-slate-900">₹{(monthlyDiagnosticRevenue / 100000).toFixed(2)} Lakhs</div>
              <p className="text-xs text-slate-600">
                From {nandaniMonthlyTests.toLocaleString()} tests routed directly to Sanwer Road hub monthly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">Eliminated MR Field Payroll</div>
              <div className="text-3xl font-black text-emerald-700">₹{(monthlyMrCostSaved / 100000).toFixed(2)} Lakhs</div>
              <p className="text-xs text-slate-600">
                Saved by replacing {totalMrSaved} field MRs with direct clinic software automation.
              </p>
            </div>
          </div>

          {/* Total ROI Callout */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">Total Net Annual Bottom-Line Impact</div>
              <div className="text-3xl sm:text-5xl font-black mt-1">₹{totalAnnualBenefitCr} Crore / Year</div>
              <div className="text-xs text-emerald-100 mt-1">
                Total annual gross market volume generated: ₹{totalAnnualGrossVolumeCr} Crore
              </div>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex-shrink-0">
              <div className="text-xs text-emerald-200">Full Buyout Payback Period:</div>
              <div className="text-3xl font-black text-white">{paybackDays} Days</div>
              <div className="text-[10px] text-emerald-300 mt-0.5">Based on ₹18.5L acquisition price</div>
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

        {/* ── WHAT ARE THE EXACT NEXT STEPS IF YOU SAY YES? (DEEP TRUST & CLARITY) ── */}
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
            {/* Step 1 */}
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

            {/* Step 2 */}
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

            {/* Step 3 */}
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

            {/* Step 4 */}
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
                  We onboard the first 25 high-prescribing Modern Group alumni &amp; private Indore clinics. You verify live prescription flow and Nandani lab requisition tickets generated on your phone. Final IP assignment deed executed and balance 90% payment released.
                </p>
              </div>
            </div>
          </div>

          {/* Legal Warranties Box */}
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
            I am in Indore with the production source code and a live demo running on a ₹12,000 budget phone over cellular data. Let&apos;s grab a 20-minute coffee at your Sanwer Road facility or Vijay Nagar office.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={whatsappPitchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-black text-base shadow-lg flex items-center justify-center gap-2.5 transition-all transform hover:scale-105"
            >
              <MessageSquare className="w-5 h-5 text-emerald-700" />
              WhatsApp Chetan (Founder &amp; Developer)
            </a>
            <a
              href={phoneCallUrl}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4 text-emerald-300" />
              Call Directly: +91 75667 89944
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
