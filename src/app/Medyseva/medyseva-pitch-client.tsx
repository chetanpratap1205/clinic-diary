"use client";

import { useState } from "react";
import {
  ShieldCheck,
  TrendingUp,
  Building2,
  Stethoscope,
  Video,
  CheckCircle2,
  Zap,
  Phone,
  MessageSquare,
  Lock,
  Sparkles,
  BarChart3,
  AlertTriangle,
  BadgeCheck,
  HeartPulse,
  FileCheck2,
  Check,
  Copy,
  Crown,
  Banknote,
  Globe,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";

export function MedysevaPitchClient() {
  const [kendraCount, setKendraCount] = useState<number>(500);
  const [activeTab, setActiveTab] = useState<"triage" | "hospital" | "abdm">("hospital");
  const [copied, setCopied] = useState<boolean>(false);

  // Financial Calculations
  const consultsPerKendraPerDay = 8;
  const daysPerMonth = 30;
  const monthlyConsults = kendraCount * consultsPerKendraPerDay * daysPerMonth;

  const surgicalEscalationRate = 0.012;
  const escalationCandidates = Math.round(monthlyConsults * surgicalEscalationRate);
  const visheshConversionRate = 0.10;
  const monthlyVisheshAdmissions = Math.round(escalationCandidates * visheshConversionRate);
  const avgTertiaryTicket = 65000;
  const monthlyHospitalRevenue = monthlyVisheshAdmissions * avgTertiaryTicket;
  const monthlyHospitalEbitda = Math.round(monthlyHospitalRevenue * 0.45);

  const minutesSavedPerConsult = 5.2;
  const monthlyHoursSaved = Math.round((monthlyConsults * minutesSavedPerConsult) / 60);
  const doctorHourlyRate = 350;
  const monthlyDoctorPayrollCut = Math.min(1250000, Math.round(monthlyHoursSaved * doctorHourlyRate * 0.5));

  const totalMonthlyBenefit = monthlyHospitalEbitda + monthlyDoctorPayrollCut;
  const totalAnnualBenefitCr = ((totalMonthlyBenefit * 12) / 10000000).toFixed(2);
  const totalAnnualHospitalRevenueCr = ((monthlyHospitalRevenue * 12) / 10000000).toFixed(2);
  const paybackDays = Math.max(10, Math.round((1650000 / totalMonthlyBenefit) * 30));

  // Valuation calc (approx ARR at ₹200/month per Kendra)
  const annualArr = kendraCount * 200 * 12;
  const currentValuationMultiple = 2.5;
  const newValuationMultiple = 8.5;
  const valuationLiftCr = ((annualArr * (newValuationMultiple - currentValuationMultiple)) / 10000000).toFixed(1);

  const whatsappPitchUrl =
    "https://wa.me/917566789944?text=" +
    encodeURIComponent(
      "Hi Chetan, I reviewed the confidential Medyseva & Vishesh Hospital strategic proposal for Doctor Diary. Let's meet today in Indore to discuss the acquisition terms."
    );

  const phoneCallUrl = "tel:+917566789944";

  const copyProposalSummary = () => {
    const summary = `Executive Summary - Doctor Diary Acquisition for Medyseva & Vishesh Hospital:
- Projected Annual Hospital IPD Inflow: ₹${totalAnnualHospitalRevenueCr} Crore
- Projected Annual Operational EBITDA: ₹${totalAnnualBenefitCr} Crore
- Estimated Series A Valuation Lift: ₹${valuationLiftCr}+ Crore
- One-Time Buyout: ₹16.50 Lakhs (Payback in ${paybackDays} days)
- Contact: Chetan (+91 75667 89944)`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-blue-600 selection:text-white pb-20">

      {/* ── TOP EXECUTIVE BANNER ── */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-mono font-bold text-blue-900 tracking-wide">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <Lock className="w-3.5 h-3.5 text-blue-700" />
            <span>CONFIDENTIAL STRATEGIC PROPOSAL • HEALTH-TECH M&amp;A BRIEFING</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-slate-600 font-medium">
            Prepared Exclusively for: <strong className="text-slate-900 font-bold">Dr. Vishesh Kasliwal</strong> (MBBS, MHA UK • Founder &amp; CEO, Medyseva)
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-12 sm:space-y-16">

        {/* ── HERO BANNER & HOOK ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/90 shadow-sm space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold">
            <HeartPulse className="w-4 h-4 text-blue-600" />
            Proprietary ABDM EMR Engine &amp; Tertiary IPD Hospital Funnel
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            ₹150 Rural Teleconsults Won&apos;t Build Your Empire. <br className="hidden sm:block" />
            <span className="text-blue-700 underline decoration-blue-300 underline-offset-6">
              Capturing ₹85,000 Tertiary IPD Admissions Will.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 max-w-3xl leading-relaxed">
            A private executive briefing for <strong className="text-slate-900 font-bold">Dr. Vishesh Kasliwal (MBBS, MHA UK)</strong> on how acquiring{" "}
            <span className="text-blue-800 font-semibold underline decoration-blue-400">Doctor Diary</span> replaces Medyseva&apos;s outsourced agency technology with a proprietary ABDM-compliant clinical EMR — and channels acute surgical transfers straight into{" "}
            <strong className="text-slate-900 font-bold">Vishesh Jupiter Hospital (Ring Road, Indore)</strong>, while dramatically lifting Medyseva&apos;s institutional valuation.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <a
              href={whatsappPitchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-base shadow-md shadow-blue-700/20 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5"
            >
              <MessageSquare className="w-5 h-5" />
              Schedule In-Person Deal Review
            </a>
            <a
              href="#ipd-simulator"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-base border border-slate-300/80 flex items-center justify-center gap-2 transition-all"
            >
              <Building2 className="w-4 h-4 text-blue-700" />
              Simulate Hospital IPD Revenue
            </a>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-blue-600" /> 100% In-House Git Ownership</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-blue-600" /> Sub-100ms Kendra Triage</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-blue-600" /> Vishesh Hospital Referral Drawer</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-blue-600" /> ABDM Milestone 1 &amp; 2 Ready</span>
          </div>
        </div>

        {/* ── THE PAIN POINT / VC DUE DILIGENCE AUDIT ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">The 3 Structural Roadblocks Capping Medyseva&apos;s Valuation</h3>
              <p className="text-xs sm:text-sm text-slate-500">What institutional healthcare funds and NABH auditors identify during due diligence:</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider">Roadblock 1: Outsourced Stack</span>
              <h4 className="font-bold text-slate-900 text-base">Agency Backend Dependency</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Medyseva&apos;s current web portal relies on an outsourced vendor endpoint (<code className="text-red-700 font-mono text-[11px] bg-red-50 px-1 py-0.5 rounded">api-medyseva-com.tejpage.com</code>). In institutional Series A due diligence, unowned tech stacks attract severe valuation haircuts — VCs classify this as a single point of failure and a business continuity risk.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider">Roadblock 2: Flat Image Prescriptions</span>
              <h4 className="font-bold text-slate-900 text-base">Zero Structured Clinical Vitals</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Doctors spend 7+ minutes hand-writing prescriptions on paper and uploading JPG files. There is no structured vitals entry (BP, Pulse, SpO2, RBS) or automated triage to flag high-risk transfers. This makes NABH and insurance TPA audit trails impossible to generate.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-red-600 uppercase tracking-wider">Roadblock 3: Lost IPD Patient Flow</span>
              <h4 className="font-bold text-slate-900 text-base">Vishesh Hospital Receives 0% Flow</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When a rural Kendra detects acute appendicitis, cardiac ischemia, or high-risk obstetrics, the patient wanders off to local practitioners instead of being booked into Vishesh Jupiter Hospital&apos;s 350 beds — a direct revenue leak of lakhs every month.
              </p>
            </div>
          </div>
        </div>

        {/* ── THE LIVE PRODUCT DEMO / TABS ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">Production Software Walkthrough</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                Already Built &amp; Live In Doctor Diary
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Engineered specifically for low-bandwidth rural Kendras and seamless hospital escalation:
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setActiveTab("hospital")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === "hospital" ? "bg-white text-blue-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                1. Vishesh Referral
              </button>
              <button
                onClick={() => setActiveTab("triage")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === "triage" ? "bg-white text-blue-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                2. 6-Box Vitals Station
              </button>
              <button
                onClick={() => setActiveTab("abdm")}
                className={`px-3 py-2 rounded-lg transition-all ${
                  activeTab === "abdm" ? "bg-white text-blue-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                3. ABHA &amp; Video Consult
              </button>
            </div>
          </div>

          {/* Tab 1: Vishesh Hospital Referral */}
          {activeTab === "hospital" && (
            <div className="p-6 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-700" />
                  <h4 className="font-bold text-slate-900">Tertiary Escalation Drawer: Channeled to Vishesh Jupiter Hospital</h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                  IPD Patient Feeder
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                When a remote Kendra identifies a patient needing surgery or ICU monitoring, the doctor clicks the tertiary referral drawer in 2 seconds:
              </p>

              <div className="p-4 rounded-xl bg-white border border-purple-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-purple-800 uppercase">
                      Designated Referral Destination:
                    </span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      Vishesh Jupiter Hospital, Ring Road, Indore
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
                    Priority Escalation
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong>Clinical Specialty:</strong> Cardiology &amp; Critical Care / General Surgery</div>
                  <div><strong>Transfer Reason:</strong> Comprehensive cardiac telemetry &amp; IPD bed stabilization</div>
                </div>
                <div className="pt-1 text-[11px] text-purple-700 font-medium">
                  ✓ Automatically generates an NABH-compliant A4 transfer letterhead with patient vitals and dispatches an alert to Vishesh Hospital&apos;s admission desk.
                </div>
              </div>

              <div className="text-xs text-purple-900 bg-white/80 p-3 rounded-xl border border-purple-200">
                💡 <strong>The Strategic Value:</strong> Vishesh Hospital&apos;s 350 beds are continuously filled with high-value surgical cases originating from rural MP, generating crores in institutional hospital billing that currently goes to competitors.
              </div>
            </div>
          )}

          {/* Tab 2: 6-Box Vitals Station */}
          {activeTab === "triage" && (
            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-700" />
                  <h4 className="font-bold text-slate-900">Sub-100ms 6-Box Numeric Vitals Triage Station</h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                  15-Second Entry
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Built with native numeric keypads so Kendra operators can record vital clinical markers with zero keyboard lag, even on entry-level Android smartphones — no proprietary hardware required:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1">
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">BP Systolic</span>
                  <span className="text-lg font-black text-slate-900 font-mono">120</span>
                  <span className="text-[9px] text-slate-400 block">mmHg</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">BP Diastolic</span>
                  <span className="text-lg font-black text-slate-900 font-mono">80</span>
                  <span className="text-[9px] text-slate-400 block">mmHg</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Pulse</span>
                  <span className="text-lg font-black text-slate-900 font-mono">72</span>
                  <span className="text-[9px] text-slate-400 block">bpm</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">SpO2</span>
                  <span className="text-lg font-black text-emerald-600 font-mono">99%</span>
                  <span className="text-[9px] text-slate-400 block">Pulse Oximetry</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Blood Sugar</span>
                  <span className="text-lg font-black text-slate-900 font-mono">105</span>
                  <span className="text-[9px] text-slate-400 block">mg/dL (RBS)</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Temp</span>
                  <span className="text-lg font-black text-slate-900 font-mono">98.4</span>
                  <span className="text-[9px] text-slate-400 block">°F</span>
                </div>
              </div>

              <div className="text-xs text-blue-900 bg-white/80 p-3 rounded-xl border border-blue-200">
                💡 <strong>Clinical Rigor:</strong> Eliminates manual paper transcription errors. Patient histories are permanently archived with structured data ready for AI triage, NABH accreditation audit trails, and insurance pre-authorization.
              </div>
            </div>
          )}

          {/* Tab 3: ABHA & Video Consult */}
          {activeTab === "abdm" && (
            <div className="p-6 rounded-2xl bg-teal-50/50 border border-teal-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-teal-700" />
                  <h4 className="font-bold text-slate-900">ABHA Digital Identity &amp; 1-Click Encrypted WebRTC Video</h4>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300">
                  ABDM Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Meets Government of India Ayushman Bharat Digital Mission (ABDM) guidelines natively — unlocking NHA milestone reimbursements and PM-ABHIM grant eligibility:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white border border-teal-200 shadow-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-900 text-xs">Ayushman Bharat ABHA ID Linkage</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-slate-800">91-8842-1902-7714</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 inline-block">
                    Verified Digital Identity
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-teal-200 shadow-xs space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-teal-600" />
                    <span className="font-bold text-slate-900 text-xs">1-Tap Rural Teleconsult Room</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate font-mono">https://meet.jit.si/DoctorDiary-Indore</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-teal-700 rounded border border-teal-200 inline-block">
                    Encrypted WebRTC HD
                  </span>
                </div>
              </div>

              <div className="text-xs text-teal-900 bg-white/80 p-3 rounded-xl border border-teal-200">
                💡 <strong>Govt Revenue Unlock:</strong> NHA pays ₹20–₹50 per verified ABHA transaction under ABDM Milestone reimbursements. With 500 Kendras conducting 8 consults/day, this is a meaningful recurring grant income stream — on top of consultation fees.
              </div>
            </div>
          )}
        </div>

        {/* ── INTERACTIVE ROI CALCULATOR (HOSPITAL IPD FUNNEL) ── */}
        <div id="ipd-simulator" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">Financial Simulation Model</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Calculate Vishesh Hospital&apos;s IPD Revenue Funnel
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Slide the number of active Medyseva Kendras across rural MP to simulate tertiary IPD bed admissions and operational savings:
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="kendra-slider" className="text-sm font-bold text-slate-900">
                Active Rural Medyseva Kendras:
              </label>
              <span className="text-2xl font-black text-blue-700 bg-white px-4 py-1 rounded-xl border border-slate-200 shadow-xs">
                {kendraCount} Kendras
              </span>
            </div>
            <input
              id="kendra-slider"
              type="range"
              min="100"
              max="1000"
              step="50"
              value={kendraCount}
              onChange={(e) => setKendraCount(Number(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
            />
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>100 Kendras (Pilot Cluster)</span>
              <span>500 Kendras (Current Network)</span>
              <span>1,000 Kendras (State Expansion)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">Monthly Tertiary Admissions</div>
              <div className="text-3xl font-black text-slate-900">{monthlyVisheshAdmissions} IPD Patients</div>
              <p className="text-xs text-slate-600">
                Pre-screened surgical &amp; ICU admissions channeled to Vishesh Jupiter Hospital monthly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">Monthly Hospital Revenue</div>
              <div className="text-3xl font-black text-blue-800">₹{(monthlyHospitalRevenue / 100000).toFixed(2)} Lakhs</div>
              <p className="text-xs text-slate-600">
                At ₹65,000 average tertiary surgical/cardiac admission ticket size.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-500 uppercase">Doctor Panel Hours Saved</div>
              <div className="text-3xl font-black text-emerald-700">{monthlyHoursSaved.toLocaleString()} Hours</div>
              <p className="text-xs text-slate-600">
                Saves ₹{(monthlyDoctorPayrollCut / 100000).toFixed(2)} Lakhs monthly by cutting visit duration from 7.5 to 2.3 mins.
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
            <div>
              <div className="text-xs font-mono font-bold text-blue-300 uppercase tracking-wider">Total Annual Vishesh Hospital Impact</div>
              <div className="text-3xl sm:text-5xl font-black mt-1">₹{totalAnnualHospitalRevenueCr} Crore / Year</div>
              <div className="text-xs text-blue-200 mt-1">
                Net operational EBITDA value unlocked: ₹{totalAnnualBenefitCr} Crore annually
              </div>
            </div>
            <div className="text-right bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex-shrink-0">
              <div className="text-xs text-blue-200">Full Buyout Payback Period:</div>
              <div className="text-3xl font-black text-white">{paybackDays} Days</div>
              <div className="text-[10px] text-blue-300 mt-0.5">Based on ₹16.5L acquisition price</div>
            </div>
          </div>
        </div>

        {/* ── SERIES A VALUATION LIFT ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">Institutional Funding &amp; Valuation Strategy</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Why This Is the Highest-ROI Move Before Your Series A
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              You trained at Apollo, ran emergency protocols in the UK, and built Medyseva from zero. You understand better than anyone that the difference between a Series A at ₹20 Crore valuation and one at ₹80 Crore is not scale — it is <strong>proprietary technology ownership</strong>.
            </p>
          </div>

          {/* Valuation Bridge Visual */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-5">
            <div className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">Institutional Valuation Bridge — Medyseva</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="text-center p-5 rounded-xl bg-red-900/30 border border-red-800">
                <div className="text-[10px] text-red-400 uppercase tracking-wider font-mono mb-2">Current State</div>
                <div className="text-xl font-black text-white">Outsourced Stack</div>
                <div className="text-2xl font-black text-red-400 mt-2">~2.5x ARR</div>
                <div className="text-[10px] text-red-300 mt-1">VC red flag: vendor dependency</div>
              </div>
              <div className="flex items-center justify-center py-4">
                <div className="text-center">
                  <ArrowUpRight className="w-8 h-8 text-blue-400 mx-auto" />
                  <div className="text-xs text-blue-400 font-bold mt-2">Doctor Diary<br />Acquisition</div>
                  <div className="text-[10px] text-slate-400 mt-1">Est. +₹{valuationLiftCr} Cr<br />equity value lift</div>
                </div>
              </div>
              <div className="text-center p-5 rounded-xl bg-blue-900/40 border border-blue-700">
                <div className="text-[10px] text-blue-400 uppercase tracking-wider font-mono mb-2">Post-Acquisition</div>
                <div className="text-xl font-black text-white">Proprietary EMR + ABDM</div>
                <div className="text-2xl font-black text-blue-400 mt-2">8.5x ARR</div>
                <div className="text-[10px] text-blue-300 mt-1">VC grade: fully owned tech</div>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-center">
              Industry benchmark: healthtech SaaS with proprietary ABDM-compliant EMR and hospital integration trades at 7–10x ARR at Series A. Outsourced platforms trade at 2–3x. This single acquisition closes that gap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center">
                <Banknote className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-bold text-slate-900">VC Due Diligence — Pass, Not Fail</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When institutional investors (Omidyar Network, Gaja Capital, India Health Fund) open Medyseva&apos;s tech review and see <code className="text-red-600 font-mono text-[10px]">tejpage.com</code> as the backend, it is an automatic red flag. Replacing it with a fully owned, battle-tested Next.js + Supabase stack removes the single biggest blocker to closing a Series A term sheet.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-bold text-slate-900">Government Grant &amp; Scheme Revenue</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                ABDM Milestone reimbursements: NHA pays ₹20–₹50 per verified ABHA transaction. PM-ABHIM digital health grants. NHM state digitisation incentives. With Doctor Diary as the ABDM-compliant engine, Medyseva qualifies for crores in non-dilutive government grant funding — money that arrives without giving up equity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-bold text-slate-900">NABH Accreditation &amp; TPA Empanelment</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vishesh Jupiter Hospital&apos;s NABH and JCI accreditation processes require structured digital EMR records — exactly what Doctor Diary generates. NABH accreditation unlocks CGHS empanelment, ECHS, and major insurance TPA tie-ups (Star Health, New India Assurance) — a direct cashless billing revenue stream of crores annually.
              </p>
            </div>
          </div>
        </div>

        {/* ── COMPETITIVE ADVANTAGE: ONLY RURAL TELEHEALTH WITH HOSPITAL FUNNEL ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">Market Positioning &amp; Competitive Moat</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Medyseva + Doctor Diary = MP&apos;s Only Rural Telehealth Network With a Real Hospital Funnel
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              No competitor can replicate this combination in Madhya Pradesh in less than 3 years:
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="py-3 px-3">Platform</th>
                  <th className="py-3 px-3">Structured EMR</th>
                  <th className="py-3 px-3">ABDM Compliant</th>
                  <th className="py-3 px-3">Captive Hospital</th>
                  <th className="py-3 px-3">Rural Kendra Network</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="bg-blue-50/40">
                  <td className="py-3 px-3 font-black text-blue-900">Medyseva + Doctor Diary</td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">✓ Yes</td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">✓ Yes</td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">✓ Vishesh Jupiter</td>
                  <td className="py-3 px-3 text-emerald-700 font-bold">✓ 500+ Kendras</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-700">eSanjeevani (NHM)</td>
                  <td className="py-3 px-3 text-red-500">✗ No</td>
                  <td className="py-3 px-3 text-amber-600">Partial</td>
                  <td className="py-3 px-3 text-red-500">✗ No hospital</td>
                  <td className="py-3 px-3 text-amber-600">Government only</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-700">mFine / MFast</td>
                  <td className="py-3 px-3 text-amber-600">Partial</td>
                  <td className="py-3 px-3 text-red-500">✗ No</td>
                  <td className="py-3 px-3 text-red-500">✗ No</td>
                  <td className="py-3 px-3 text-red-500">✗ Urban-only</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-700">Practo / 1mg</td>
                  <td className="py-3 px-3 text-amber-600">Partial</td>
                  <td className="py-3 px-3 text-red-500">✗ No</td>
                  <td className="py-3 px-3 text-red-500">✗ No</td>
                  <td className="py-3 px-3 text-red-500">✗ No rural ops</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-indigo-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-900">The Irreversible First-Mover Advantage</p>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  Medyseva&apos;s 500+ physical Kendra network is an asset that took 5+ years to build. Overlaying Doctor Diary&apos;s structured EMR onto this network creates an operational moat that eSanjeevani, mFine, or any urban telehealth startup cannot replicate without physically building Kendras — which takes years and hundreds of crores. You get this competitive moat for ₹16.5 Lakhs.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── TECHNICAL AUDIT TABLE ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">Technical Diligence</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Comparison: Medyseva Current Stack vs. Doctor Diary
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Why acquiring Doctor Diary turns Medyseva into a venture-grade healthtech asset:
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="py-3 px-3">Evaluation Parameter</th>
                  <th className="py-3 px-3 text-red-600">Current Medyseva Stack (Tejpage)</th>
                  <th className="py-3 px-3 text-emerald-700">Doctor Diary EMR Architecture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">Clinical Data Structure</td>
                  <td className="py-3 px-3 text-red-600">Flat JPG image uploads</td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">6-box numeric triage + SNOMED/ICD structured fields</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">Consultation Duration</td>
                  <td className="py-3 px-3 text-red-600">7 to 8 minutes per patient</td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">Sub-2.5 minutes with 1-tap presets</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">Tertiary Hospital Integration</td>
                  <td className="py-3 px-3 text-red-600">Zero automated referral tracking</td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">1-Tap Vishesh Hospital escalation with priority triage</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">VC Diligence Score</td>
                  <td className="py-3 px-3 text-red-600">Vendor dependency → valuation haircut</td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">100% in-house codebase → institutional-grade asset</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">Source Code &amp; IP Ownership</td>
                  <td className="py-3 px-3 text-red-600">Outsourced to third-party agency</td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">100% Medyseva In-House Git Repository Ownership</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-900">NABH / Accreditation Ready</td>
                  <td className="py-3 px-3 text-red-600">No structured audit trail</td>
                  <td className="py-3 px-3 text-emerald-700 font-medium">Structured vitals + A4 PDF records = NABH audit ready</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ACQUISITION OPTIONS (COMMERCIAL TERMS) ── */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">Commercial Transaction</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Two Clear Acquisition Pathways
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Clean founder-to-founder transaction. Immediate deployment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model A: Full Buyout */}
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-blue-600 bg-blue-50/20 space-y-6 relative">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-blue-700 text-white text-xs font-black uppercase tracking-wider">
                Recommended
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-blue-700 uppercase">Option A</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">100% IP &amp; Source Code Buyout</h3>
                <p className="text-xs text-slate-500 mt-1">Complete ownership of the asset, codebase, and IP.</p>
              </div>

              <div className="py-2 border-y border-slate-200">
                <div className="text-4xl font-black text-slate-900">₹16,50,000</div>
                <div className="text-xs text-slate-500 mt-0.5">One-time payment • Zero ongoing royalties</div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span><strong>Full Git Repository Transfer:</strong> 100% intellectual property assignment deed signed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span><strong>Supabase Database Migration:</strong> Standalone database cluster deployed on Medyseva&apos;s cloud account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span><strong>ABDM / ABHA Architecture:</strong> Ayushman Bharat digital identity compliance ready for VC audit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" />
                  <span><strong>30 Days Full Developer Handover:</strong> Hands-on technical integration with Medyseva engineers.</span>
                </li>
              </ul>

              <a
                href={whatsappPitchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm text-center block transition-all shadow-sm"
              >
                Discuss Option A Terms (Buyout)
              </a>
            </div>

            {/* Model B: Kendra Enterprise License */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white space-y-6">
              <div>
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Option B</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">Enterprise Kendra Network License</h3>
                <p className="text-xs text-slate-500 mt-1">Managed deployment across all 500+ rural Kendras.</p>
              </div>

              <div className="py-2 border-y border-slate-200">
                <div className="text-4xl font-black text-slate-900">₹7,50,000 <span className="text-sm font-normal text-slate-500">upfront</span></div>
                <div className="text-xs text-slate-500 mt-0.5">+ ₹32,000 / month managed cloud operations &amp; support</div>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Unlimited Kendra Terminals:</strong> Deploy across all active and upcoming Medyseva Kendras.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Vishesh Hospital Routing:</strong> Real-time patient transfer notifications to Vishesh Hospital reception.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Full SLA &amp; Uptime:</strong> 99.9% uptime, WebRTC video scaling, and automated backups managed.</span>
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
            <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">Frictionless Closing Process</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              What Are The Exact Next Steps If You Say &quot;YES&quot;?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              We respect your clinical schedule and corporate responsibilities. Here is the exact 4-phase transition timeline from signing to network go-live in 7 days:
            </p>
          </div>

          <div className="relative border-l-2 border-blue-600 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
            <div className="relative group">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-xs">
                1
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">Day 1: Term Sheet Execution &amp; 10% Token Deposit</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">Legal Step</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We sign a mutual 2-page Term Sheet &amp; Bilateral NDA. You deposit a 10% token (₹1,65,000) to confirm deal exclusivity. We immediately freeze all competitor healthcare discussions in Madhya Pradesh.
                </p>
              </div>
            </div>

            <div className="relative group">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-xs">
                2
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">Day 2–3: Code Repository &amp; Database Instance Migration</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200">Tech Step</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We transfer administrative ownership of the private GitHub repository to Medyseva&apos;s engineering lead. We deploy an isolated Supabase PostgreSQL cluster on your company&apos;s cloud infrastructure (AWS/GCP) so 100% of patient data remains sovereign — eliminating the tejpage.com dependency permanently.
                </p>
              </div>
            </div>

            <div className="relative group">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-xs">
                3
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">Day 4–5: Vishesh Jupiter Hospital IPD Routing Integration</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">Hospital Link</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We configure Vishesh Jupiter Hospital&apos;s admission desk WhatsApp/email webhooks into the tertiary referral drawer. When a rural Kendra flags a priority surgical or cardiac case, admission staff at Ring Road receive immediate notification with full vitals telemetry.
                </p>
              </div>
            </div>

            <div className="relative group">
              <span className="absolute -left-[35px] sm:-left-[43px] top-0.5 w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center ring-4 ring-white shadow-xs">
                4
              </span>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900">Day 6–7: Pilot Kendra Deployment &amp; Final Settlement</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">Go-Live</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We roll out the workstation to the first 25 high-volume Kendras in Dewas and Dhar. You verify live video consults and hospital transfer tickets generated on your personal phone. Final IP assignment deed executed and balance 90% payment released.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-start gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">100% IP Assignment Deed</strong>
                <span className="text-slate-500">Legally registered copyright &amp; source code transfer with zero third-party claims.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">30-Day Developer Handover</strong>
                <span className="text-slate-500">I will personally train your in-house IT team in Indore until you are 100% self-sufficient.</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lock className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block font-semibold">Zero Vendor Royalties</strong>
                <span className="text-slate-500">No recurring software fees or seat licenses. Complete freedom to modify code.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── CLOSING CALL TO ACTION ── */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-center text-white space-y-6 shadow-lg">
          <h2 className="text-2xl sm:text-4xl font-black">
            Let&apos;s Meet Today in Indore
          </h2>
          <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            I am in Indore with the full production codebase, a live database, and a working demo ready for immediate review. This is a 20-minute meeting that could reposition Medyseva&apos;s institutional valuation by crores and eliminate your biggest VC due diligence risk in one transaction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={whatsappPitchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-blue-950 hover:bg-blue-50 font-black text-base shadow-lg flex items-center justify-center gap-2.5 transition-all transform hover:scale-105"
            >
              <MessageSquare className="w-5 h-5 text-blue-700" />
              WhatsApp Chetan (Founder &amp; Developer)
            </a>
            <a
              href={phoneCallUrl}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <Phone className="w-4 h-4 text-blue-300" />
              Call Directly: +91 75667 89944
            </a>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4 text-xs text-blue-200">
            <button
              onClick={copyProposalSummary}
              className="hover:underline flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-blue-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Proposal summary copied!" : "Copy executive summary"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
