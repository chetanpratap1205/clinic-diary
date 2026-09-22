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

export interface ExperienceEngineProps {
  className?: string;
}

export function ExperienceEngine({ className = "" }: ExperienceEngineProps) {
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
    <section className={`py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#FAFBFC] relative border-t border-slate-200/80 overflow-hidden ${className}`}>
      
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center mb-10 sm:mb-14">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-4 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-[#00B7A8]" />
          Autonomous Clinical Infrastructure
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B132B] mb-4 tracking-tight leading-snug"
        >
          Stop Acting Like a Waiting Room.
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B] mt-1">
            Start Operating Like a Premium Brand.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ delay: 0.2 }}
          className="text-slate-600 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium"
        >
          Doctor Diary provides the infrastructure to eliminate reception chaos, eliminate aggregators, and elevate your practice—without forcing you to change how you practice medicine.
        </motion.p>
      </div>

      {/* Infinite Horizontal Marquee: 42 Specialties */}
      <div className="w-full overflow-hidden mb-16 sm:mb-20 relative flex items-center group">
        {/* Left & Right Gradient Masks */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-36 bg-gradient-to-r from-[#FAFBFC] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-36 bg-gradient-to-l from-[#FAFBFC] to-transparent z-20 pointer-events-none" />
        
        {/* Specialty Label Pill */}
        <div className="flex items-center shrink-0 ml-4 sm:ml-8 z-30 relative bg-[#FAFBFC] pr-4 sm:pr-6 border-r-2 border-slate-200 py-2">
          <span className="text-xs sm:text-sm font-black text-[#00B7A8] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00B7A8]" />
            42 Medical Specialties
          </span>
        </div>

        {/* Animated Marquee Strip */}
        <motion.div
          className="flex items-center gap-4 sm:gap-6 pl-4 sm:pl-6 shrink-0 will-change-transform"
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
          {/* Card 1: Physical Rx Pad with Instant WhatsApp Dispatch (7 Cols)   */}
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
                You shouldn&apos;t have to stare at a computer typing medication dropdowns while speaking with a patient. Write on your traditional prescription pad—we digitize it in 1 second and dispatch a branded PDF straight to their WhatsApp.
              </p>
            </div>

            {/* Semantic SVG UI: Physical Prescription Clipboard + WhatsApp Dispatch Badge */}
            <div className="relative w-full min-h-[220px] sm:min-h-[240px] bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Prescription Pad Mockup */}
              <div className="w-full sm:w-[58%] bg-white rounded-xl border border-slate-200 shadow-md p-3 relative transform -rotate-1 group-hover:rotate-0 transition-transform duration-500">
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
              <div className="w-full sm:w-[38%] flex flex-col gap-2 relative z-10">
                <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-3 shadow-sm flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <MessageCircle className="w-4 h-4 fill-[#25D366] text-[#25D366]" />
                    <span>WhatsApp Bot</span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800">
                    PDF Dispatched
                  </div>
                  <div className="text-[9px] text-emerald-700/80 font-mono truncate">
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
                  <div className="text-xs text-slate-400">Direct to Doctor&apos;s Current A/C</div>
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
                    <span className="text-emerald-700 font-bold">✓✓ Sent</span>
                  </div>
                  <div className="font-bold text-slate-800">&ldquo;Token #14 confirmed for 5:30 PM&rdquo;</div>
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
                    <span className="text-emerald-700 font-bold">✓✓ Read</span>
                  </div>
                  <div className="font-bold text-emerald-950">&ldquo;Dr. Sharma at Token #8. Est arrival: 5:15 PM&rdquo;</div>
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
                  <div className="font-bold text-[#0B132B]">&ldquo;You are next! Please enter Cabin 2&rdquo;</div>
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
          {/* Card 4: Patient Database Vault & 100% Sovereignty (7 Cols - Light)*/}
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
                Your patients belong to you—not an aggregator&apos;s ad engine. Your medical history records and contact lists are encrypted with AES-256 and exportable to CSV anytime in 1 click.
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
