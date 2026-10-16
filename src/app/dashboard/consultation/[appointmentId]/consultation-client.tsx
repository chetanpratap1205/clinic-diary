"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  History,
  Stethoscope,
  Loader2,
  Pill,
  Activity,
  Printer,
  User,
  Phone,
  CalendarClock,
  ClipboardList,
  Sparkles,
  AlertCircle,
  Video,
  ShieldCheck,
  Building2,
  FlaskConical,
  HeartPulse,
  Thermometer,
  Weight,
  Droplet,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackConsultationCompleted } from "@/lib/gtag";
import Link from "next/link";
import type { Appointment, Patient, VisitNote } from "@/db/schema";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

import { formatWhatsAppPhone } from "@/lib/phone-utils";
import { formatDoctorName } from "@/lib/utils";

interface ConsultationClientProps {
  appointment: Appointment;
  patient: Patient & { abhaId?: string | null; isAbhaVerified?: boolean | null };
  pastVisits: { note: VisitNote; date: string }[];
  clinic: any;
}

type MobileTab = "patient" | "consult";

// Core formulary presets (including Notion Pharma flagship molecules for enterprise demo)
const DEFAULT_FORMULARY_PRESETS = [
  { name: "Meromicron 1g Inj (Meropenem)", form: "IV Injection", dose: "1 vial TDS x 3 days", tag: "Notion Critical Care" },
  { name: "Tazomicron 4.5g Inj (Pip-Tazo)", form: "IV Injection", dose: "1 vial BD x 5 days", tag: "Notion Critical Care" },
  { name: "Pantamac-DSR Cap", form: "Capsule", dose: "1 cap OD before breakfast x 7 days", tag: "Notion Gastro" },
  { name: "Megafenac-SP Tab", form: "Tablet", dose: "1 tab BD after meals x 3 days", tag: "Notion Pain/SP" },
  { name: "Montemicron-LC Tab", form: "Tablet", dose: "1 tab HS x 10 days", tag: "Notion Allergy" },
  { name: "Amoxy-Clav 625mg Tab", form: "Tablet", dose: "1 tab BD after food x 5 days", tag: "Antibiotic" },
  { name: "Paracetamol 650mg Tab", form: "Tablet", dose: "1 tab TDS SOS x 3 days", tag: "Analgesic" },
  { name: "Telmisartan 40mg Tab", form: "Tablet", dose: "1 tab OD morning x 30 days", tag: "Cardio" },
];

const STANDARD_LAB_TESTS = [
  "CBC (Complete Blood Count)",
  "Lipid Profile (Full)",
  "HbA1c (Glycated Hemoglobin)",
  "KFT / Serum Creatinine & Urea",
  "LFT (Liver Function Tests)",
  "Thyroid Profile (TSH, T3, T4)",
  "Urine Routine & Microscopic",
  "Blood Sugar (Fasting & PP)",
  "Chest X-Ray (PA View)",
  "USG Whole Abdomen",
];

const REFERRAL_HOSPITAL_OPTIONS = [
  "Vishesh Jupiter Hospital, Ring Road, Indore",
  "Sri Aurobindo Institute of Medical Sciences (SAIMS), Indore",
  "Bhandari Hospital & Research Centre (BHRC), Vijay Nagar, Indore",
  "Care CHL Hospital, AB Road, Indore",
  "Medanta Super Speciality Hospital, Indore",
  "Government District Civil Hospital / M.Y. Hospital",
];

const REFERRAL_SPECIALTIES = [
  "Cardiology & Cath Lab",
  "Robotic Surgery & Bariatrics",
  "General & Laparoscopic Surgery",
  "Orthopedics & Joint Replacement",
  "Nephrology & Dialysis",
  "Neurology & Neurosurgery",
  "Trauma & Critical Care (ICU)",
  "Pediatrics & Neonatology",
];

export function ConsultationClient({
  appointment,
  patient,
  pastVisits,
  clinic,
}: ConsultationClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ── Standard Clinical States ──────────────────────────────────────────────
  const [complaint, setComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [vitals, setVitals] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [followUpDays, setFollowUpDays] = useState(7);
  const [feeCollected, setFeeCollected] = useState<number>(
    appointment.feeCollected ?? clinic.consultationFee ?? 0
  );
  const [isCompleted, setIsCompleted] = useState(false);

  // ── Phase 2: Enterprise Structured Clinical States ────────────────────────
  // 1. Triage Vitals
  const [bpSystolic, setBpSystolic] = useState("");
  const [bpDiastolic, setBpDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [spo2, setSpo2] = useState("");
  const [bloodSugar, setBloodSugar] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");

  // 2. Patient ABHA Health ID
  const [abhaId, setAbhaId] = useState(patient.abhaId || "");
  const [isAbhaVerified, setIsAbhaVerified] = useState(
    Boolean(patient.isAbhaVerified || patient.abhaId)
  );

  // 3. Advise Lab Investigations
  const [selectedLabTests, setSelectedLabTests] = useState<string[]>([]);
  const [customLabTest, setCustomLabTest] = useState("");

  // 4. Tertiary Hospital Escalation / Referral
  const [enableReferral, setEnableReferral] = useState(false);
  const [referralHospital, setReferralHospital] = useState(
    clinic.preferredHospital || "Vishesh Jupiter Hospital, Ring Road, Indore"
  );
  const [referralSpecialty, setReferralSpecialty] = useState(
    "Cardiology & Cath Lab"
  );
  const [referralPriority, setReferralPriority] = useState<
    "routine" | "priority" | "emergency"
  >("priority");
  const [referralReason, setReferralReason] = useState("");

  // Mobile tab state: "patient" = left panel, "consult" = right panel
  const [mobileTab, setMobileTab] = useState<MobileTab>("consult");

  // Synchronize structured vitals to legacy string format for backward compatibility
  const buildVitalsSummary = () => {
    const parts: string[] = [];
    if (bpSystolic && bpDiastolic) parts.push(`BP ${bpSystolic}/${bpDiastolic} mmHg`);
    else if (bpSystolic) parts.push(`BP ${bpSystolic} mmHg`);
    if (pulse) parts.push(`Pulse ${pulse} bpm`);
    if (spo2) parts.push(`SpO2 ${spo2}%`);
    if (bloodSugar) parts.push(`RBS ${bloodSugar} mg/dL`);
    if (temperature) parts.push(`Temp ${temperature}°F`);
    if (weight) parts.push(`Wt ${weight} kg`);
    if (vitals && !parts.some((p) => vitals.includes(p))) {
      parts.push(vitals);
    }
    return parts.join(", ");
  };

  const handleComplete = async () => {
    startTransition(async () => {
      try {
        const vitalsSummary = buildVitalsSummary();
        const structuredVitalsPayload = {
          bpSystolic: bpSystolic || null,
          bpDiastolic: bpDiastolic || null,
          pulse: pulse || null,
          spo2: spo2 || null,
          bloodSugar: bloodSugar || null,
          temperature: temperature || null,
          weight: weight || null,
        };

        const referralPayload = enableReferral
          ? {
              referredHospital: referralHospital,
              specialty: referralSpecialty,
              priority: referralPriority,
              reason: referralReason || "Specialist tertiary evaluation & management",
              referredAt: new Date().toISOString(),
            }
          : null;

        const payload = {
          vitals: vitalsSummary || vitals || null,
          structuredVitals: structuredVitalsPayload,
          complaint,
          diagnosis,
          treatment,
          labInvestigations: selectedLabTests,
          referral: referralPayload,
          abhaId: abhaId.trim() || null,
          followUpRequired: followUp,
          followUpDays,
          feeCollected,
        };

        const res = await fetch(
          `/api/appointments/${appointment.id}/complete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) throw new Error("Failed to complete consultation");

        toast.success("Visit & Clinical Notes Completed!");
        trackConsultationCompleted({ appointmentId: appointment.id });
        setIsCompleted(true);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const addMedicationToRx = (med: { name: string; dose: string }) => {
    const formattedLine = `• ${med.name} — ${med.dose}`;
    setTreatment((prev) => (prev ? `${prev}\n${formattedLine}` : formattedLine));
    toast.success(`Added ${med.name} to Rx`);
  };

  const toggleLabTest = (testName: string) => {
    setSelectedLabTests((prev) =>
      prev.includes(testName)
        ? prev.filter((t) => t !== testName)
        : [...prev, testName]
    );
  };

  const addCustomLabTest = () => {
    if (!customLabTest.trim()) return;
    if (!selectedLabTests.includes(customLabTest.trim())) {
      setSelectedLabTests((prev) => [...prev, customLabTest.trim()]);
    }
    setCustomLabTest("");
  };

  /* ─────────────── COMPLETED STATE MODAL ───────────────────────── */
  if (isCompleted) {
    const vitalsSummary = buildVitalsSummary();
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-30" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-1 tracking-tight">
          Consultation Completed!
        </h2>
        <p className="text-slate-500 mb-1 max-w-sm text-sm leading-relaxed">
          Clinical record logged for{" "}
          <span className="font-bold text-slate-800">{patient.name}</span>.
        </p>
        <p className="text-xs font-bold text-emerald-600 mb-6">
          Consultation Fee: ₹{feeCollected} &bull; Official Digital Prescription Ready
        </p>

        {/* Live Clinical Summary Badges */}
        <div className="w-full max-w-md bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 text-left space-y-2.5 text-xs">
          {vitalsSummary && (
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-600" /> Vitals:
              </span>
              <span className="font-semibold text-slate-800">{vitalsSummary}</span>
            </div>
          )}
          {selectedLabTests.length > 0 && (
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-bold text-slate-500 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-blue-600" /> Lab Tests:
              </span>
              <span className="font-semibold text-blue-700">
                {selectedLabTests.length} tests ({clinic.partnerLabName || "Preferred Lab"})
              </span>
            </div>
          )}
          {enableReferral && (
            <div className="flex items-center justify-between text-slate-700 bg-amber-50/80 p-2 rounded-xl border border-amber-200">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" /> Referral:
              </span>
              <span className="font-bold text-amber-800">{referralHospital}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="w-full max-w-sm space-y-3">
          <button
            onClick={() => {
              let text = `*DIGITAL PRESCRIPTION & CLINIC RECEIPT* 🏥\n\nDear ${patient.name},\nThank you for consulting with *${clinic.name}* (${formatDoctorName(clinic.doctorName)}).\n\n*Date:* ${format(new Date(), "dd MMM yyyy")}\n*Fee Paid:* ₹${feeCollected}\n`;

              if (vitalsSummary) {
                text += `\n*Recorded Vitals:* ${vitalsSummary}`;
              }
              if (selectedLabTests.length > 0) {
                text += `\n*Advised Diagnostic Tests (${clinic.partnerLabName || "Partner Lab"}):*\n• ${selectedLabTests.join("\n• ")}`;
              }
              if (enableReferral) {
                text += `\n\n🚨 *Hospital Referral Notice:*\nPatient referred to *${referralHospital}* (${referralSpecialty}) with priority: *${referralPriority.toUpperCase()}*.`;
              }

              text += `\n\n📄 *View & Download Official Digital Prescription:*\n${window.location.origin}/receipt/${appointment.id}\n\n🌿 Wishing you a speedy recovery!`;

              const formattedPhone = formatWhatsAppPhone(patient.phone);
              const url = formattedPhone
                ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
                : `https://wa.me/?text=${encodeURIComponent(text)}`;
              window.open(url, "_blank");
            }}
            className="w-full h-12 rounded-2xl bg-[#25D366] text-white hover:bg-[#20bd5a] font-bold shadow-md shadow-[#25D366]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.82 9.82 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.81 11.81 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.88 11.88 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.82 11.82 0 0 0-3.48-8.413Z" />
            </svg>
            Send WhatsApp Rx &amp; Receipt
          </button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="w-full h-12 rounded-2xl border-slate-200 font-semibold gap-2 text-slate-700"
          >
            <Printer className="w-4 h-4" />
            Print Full Clinical Rx
          </Button>
          <Button
            onClick={() => {
              router.refresh();
              router.push("/dashboard/queue");
            }}
            className="w-full h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-semibold"
          >
            Back to Queue
          </Button>
        </div>
      </div>
    );
  }

  /* ─────────────── PATIENT INFO PANEL ───────────────────────── */
  const renderPatientPanel = () => (
    <div className="flex flex-col gap-5 h-full">
      {/* Back link — desktop only */}
      <Link
        href="/dashboard/queue"
        className="hidden lg:inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Queue
      </Link>

      {/* Patient card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Avatar row */}
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center flex-shrink-0 border border-indigo-100 shadow-inner">
            <span className="font-black text-indigo-700 text-xl">
              {patient.name[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
              {patient.name}
            </h2>
            <p className="text-xs text-slate-500">
              {patient.age ? `${patient.age} yrs` : "Age N/A"} &bull;{" "}
              {patient.gender || "Gender N/A"}
            </p>
          </div>
          {appointment.tokenNumber && (
            <div className="ml-auto flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200">
              <span className="font-black text-white text-sm">
                #{appointment.tokenNumber}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2.5 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-semibold">{patient.phone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-600">
            <CalendarClock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              Date:{" "}
              <span className="font-bold text-slate-700">
                {format(new Date(appointment.appointmentDate as string), "d MMM yyyy")}
              </span>
            </span>
          </div>
        </div>

        {/* Phase 2: ABHA ID Section (Government Digital Health) */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ABHA ID (Ayushman Bharat)
            </span>
            {isAbhaVerified ? (
              <span className="text-[10px] font-black bg-emerald-200/80 text-emerald-800 px-2 py-0.5 rounded-full">
                VERIFIED
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400">Optional</span>
            )}
          </div>
          <div className="flex gap-1.5">
            <input
              type="text"
              placeholder="e.g. 91-4589-2341-9012"
              value={abhaId}
              onChange={(e) => {
                setAbhaId(e.target.value);
                if (e.target.value.length > 10) setIsAbhaVerified(true);
              }}
              className="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Phase 2: Tele-Consult Video Room Trigger (For Medyseva / Rural Kendras) */}
        <a
          href={
            clinic.teleconsultUrl ||
            `https://meet.jit.si/DoctorDiary-${clinic.slug || "indore"}-${appointment.id.slice(0, 8)}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95"
        >
          <Video className="w-4 h-4 text-indigo-600" />
          Launch Rural Tele-Consult
          <ExternalLink className="w-3 h-3 text-indigo-400 ml-auto mr-1" />
        </a>
      </div>

      {/* Past Visits History */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex items-center gap-2 text-slate-700 font-bold mb-3 text-xs uppercase tracking-wider">
          <History className="w-3.5 h-3.5 text-slate-400" />
          Patient History
          {pastVisits.length > 0 && (
            <span className="ml-auto text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {pastVisits.length} visits
            </span>
          )}
        </div>

        {pastVisits.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center border border-slate-100 shadow-sm">
            <User className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-medium">
              First consultation — no prior records
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastVisits.map((visit, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">
                    {format(new Date(visit.date), "dd MMM yyyy")}
                  </p>
                  {visit.note.vitals && (
                    <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {visit.note.vitals}
                    </span>
                  )}
                </div>
                {visit.note.diagnosis && (
                  <p className="text-slate-800 font-semibold">
                    <span className="text-slate-400 font-normal">Dx:</span>{" "}
                    {visit.note.diagnosis}
                  </p>
                )}
                {visit.note.treatment && (
                  <div className="bg-slate-50 rounded-xl p-2.5 font-mono text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {visit.note.treatment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ─────────────── CONSULTATION FORM (CENTRAL WORKSTATION) ──── */
  const renderConsultForm = () => (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight">
              Clinical Workstation &bull; Doctor Diary
            </h3>
            <p className="text-[11px] text-slate-500">
              Offline-ready clinical EMR &bull; Digital prescription engine
            </p>
          </div>
        </div>

        {/* Teleconsult & Partner Indicator */}
        <div className="hidden sm:flex items-center gap-2">
          {clinic.partnerLabName && (
            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <FlaskConical className="w-3 h-3 text-blue-600" />
              {clinic.partnerLabName}
            </span>
          )}
          {clinic.preferredHospital && (
            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <Building2 className="w-3 h-3 text-amber-600" />
              {clinic.preferredHospital}
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Form Fields */}
      <div className="flex-1 overflow-y-auto space-y-5 min-h-0 pr-1 pb-4">
        
        {/* ── 1. Structured Clinical Vitals Triage Bar ────────────────── */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              Clinical Vitals Triage
            </label>
            <span className="text-[11px] font-semibold text-slate-400">
              {buildVitalsSummary() || "Awaiting entry"}
            </span>
          </div>

          {/* 6-box Triage Grid (Optimized for Android ₹12k phones & tablets) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* BP Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <HeartPulse className="w-3 h-3 text-rose-500" /> BP (mmHg)
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="120"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  className="w-1/2 text-xs font-bold text-slate-800 focus:outline-none"
                />
                <span className="text-slate-300">/</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="80"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  className="w-1/2 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Pulse Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Pulse (bpm)
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="72"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>

            {/* SpO2 Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                SpO2 (%)
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="98"
                value={spo2}
                onChange={(e) => setSpo2(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Blood Sugar Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Droplet className="w-3 h-3 text-red-500" /> RBS (mg/dL)
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="110"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Temp Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-amber-500" /> Temp (°F)
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="98.4"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>

            {/* Weight Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                <Weight className="w-3 h-3 text-indigo-500" /> Wt (kg)
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="68"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full text-xs font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ── 2. Chief Complaints ────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
            Chief Complaints / Symptoms
          </label>
          <textarea
            placeholder="e.g. Acute high-grade fever x 3 days, dry cough, body aches..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            rows={2}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white transition-all resize-none placeholder:text-slate-300"
          />
          {clinic.complaintPresets?.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide no-scrollbar -mx-1 px-1">
              {clinic.complaintPresets.map((preset: string) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setComplaint((prev) => (prev ? `${prev}, ${preset}` : preset))
                  }
                  className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── 3. Primary Diagnosis ───────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            Clinical Diagnosis
          </label>
          <input
            type="text"
            placeholder="e.g. Acute Viral Bronchitis / Type-2 Diabetes Mellitus"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white transition-all placeholder:text-slate-300 font-medium"
          />
        </div>

        {/* ── 4. Smart Rx Prescription Builder (Formulary Autocomplete) ─── */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Pill className="w-3.5 h-3.5 text-emerald-600" />
              Rx &amp; Medication Formulary
            </label>
            <span className="text-[11px] font-semibold text-slate-400">
              Tap chips below to auto-fill
            </span>
          </div>

          {/* Quick-add Formulary Chips (Pre-seeded with Notion molecules & essentials) */}
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
              <span>Smart Prescription Chips:</span>
              <span className="text-emerald-600">1-Tap Formulation Insert</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_FORMULARY_PRESETS.map((med, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addMedicationToRx(med)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/60 hover:text-emerald-800 text-xs font-semibold shadow-2xs transition-all active:scale-95 flex items-center gap-1"
                >
                  <Plus className="w-3 h-3 text-emerald-600" />
                  {med.name}
                </button>
              ))}
            </div>
          </div>

          <textarea
            placeholder="Detailed medicines, dosage, route, frequency, and instructions..."
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            rows={5}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white transition-all resize-none placeholder:text-slate-300 leading-relaxed font-mono"
          />
        </div>

        {/* ── 5. Advise Diagnostic Lab Investigations (Nandani / Central) ─ */}
        <div className="bg-blue-50/40 border border-blue-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
              Advise Diagnostic Tests
            </label>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-lg">
              {clinic.partnerLabName || "Preferred Pathology Network"}
            </span>
          </div>

          {/* Diagnostic test chips */}
          <div className="flex flex-wrap gap-1.5">
            {STANDARD_LAB_TESTS.map((test) => {
              const isSelected = selectedLabTests.includes(test);
              return (
                <button
                  key={test}
                  type="button"
                  onClick={() => toggleLabTest(test)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 border",
                    isSelected
                      ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                      : "bg-white border-blue-200/80 text-blue-800 hover:bg-blue-50"
                  )}
                >
                  {isSelected ? "✓ " : "+ "}
                  {test}
                </button>
              );
            })}
          </div>

          {/* Custom Lab Test Add */}
          <div className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add other test (e.g. Vitamin D3, Serum Ferritin)..."
              value={customLabTest}
              onChange={(e) => setCustomLabTest(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomLabTest())}
              className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button
              type="button"
              onClick={addCustomLabTest}
              size="sm"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold"
            >
              Add Test
            </Button>
          </div>
        </div>

        {/* ── 6. Tertiary Hospital Escalation / Referral Engine ─────────── */}
        <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Tertiary Hospital Referral Slip
                </p>
                <p className="text-[11px] text-amber-700">
                  Auto-funnel complex patients to super-specialty hospitals
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => setEnableReferral(!enableReferral)}
              className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                enableReferral ? "bg-amber-600" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  enableReferral ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <AnimatePresence>
            {enableReferral && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pt-2 overflow-hidden"
              >
                {/* Target Hospital */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-amber-800 uppercase">
                    Destination Hospital Facility:
                  </label>
                  <select
                    value={referralHospital}
                    onChange={(e) => setReferralHospital(e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    {REFERRAL_HOSPITAL_OPTIONS.map((hosp) => (
                      <option key={hosp} value={hosp}>
                        {hosp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specialty & Priority Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-800 uppercase">
                      Department / Specialty:
                    </label>
                    <select
                      value={referralSpecialty}
                      onChange={(e) => setReferralSpecialty(e.target.value)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    >
                      {REFERRAL_SPECIALTIES.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-800 uppercase">
                      Clinical Urgency Level:
                    </label>
                    <div className="flex gap-1">
                      {(["routine", "priority", "emergency"] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setReferralPriority(lvl)}
                          className={cn(
                            "flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all",
                            referralPriority === lvl
                              ? lvl === "emergency"
                                ? "bg-red-600 text-white shadow-xs"
                                : "bg-amber-600 text-white shadow-xs"
                              : "bg-white border border-amber-200 text-amber-800"
                          )}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Referral Clinical Notes */}
                <input
                  type="text"
                  placeholder="Reason for referral (e.g. Unstable angina, needs Cath Lab / Surgical consult)..."
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── 7. Follow-Up Scheduler ─────────────────────────────────────── */}
        <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100 space-y-2.5">
          <button
            type="button"
            onClick={() => setFollowUp(!followUp)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <CalendarClock
                className={cn(
                  "w-4 h-4",
                  followUp ? "text-amber-500" : "text-slate-400"
                )}
              />
              <span
                className={cn(
                  "text-xs font-bold",
                  followUp ? "text-amber-800" : "text-slate-600"
                )}
              >
                Schedule Follow-up Visit
              </span>
            </div>
            <div
              className={cn(
                "w-9 h-5 rounded-full transition-colors relative",
                followUp ? "bg-amber-400" : "bg-slate-300"
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-xs transition-transform",
                  followUp ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </div>
          </button>

          {followUp && (
            <div className="flex gap-1.5 pt-1">
              {[3, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setFollowUpDays(days)}
                  className={cn(
                    "flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all",
                    followUpDays === days
                      ? "bg-amber-100 border-amber-300 text-amber-800"
                      : "bg-white border-slate-200 text-slate-500"
                  )}
                >
                  {days} Days
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Sticky Complete Button ─────────────────────────────────────── */}
      <div className="pt-3 border-t border-slate-100 mt-auto flex-shrink-0">
        <Button
          onClick={handleComplete}
          disabled={isPending}
          className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm gap-2 shadow-lg shadow-emerald-200/60 active:scale-[0.98] transition-transform"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving Clinical Notes...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Complete Consultation &amp; Generate Rx
            </>
          )}
        </Button>
      </div>
    </div>
  );

  /* ─────────────── MAIN RENDER ───────────────────────────────── */
  return (
    <>
      {/* ── MOBILE LAYOUT (< lg) ─────────────────────────────── */}
      <div className="lg:hidden flex flex-col h-full min-h-0">
        {/* Mobile sticky header */}
        <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
          <Link
            href="/dashboard/queue"
            className="p-2 -ml-1 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="Back to Queue"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-slate-900 text-sm truncate">
              {patient.name}
            </p>
            <p className="text-xs text-slate-500">
              {patient.age ? `${patient.age}y` : ""} {patient.gender ? `• ${patient.gender}` : ""}
              {appointment.tokenNumber ? ` • #${appointment.tokenNumber}` : ""}
            </p>
          </div>
          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg">
            Doctor Diary
          </span>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex-shrink-0 px-4 pt-3 pb-0">
          <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setMobileTab("consult")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                mobileTab === "consult"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500"
              )}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Consultation &amp; Rx
            </button>
            <button
              onClick={() => setMobileTab("patient")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                mobileTab === "patient"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500"
              )}
            >
              <History className="w-3.5 h-3.5" />
              Patient &amp; ABHA
              {pastVisits.length > 0 && (
                <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {pastVisits.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile tab content */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-4">
          {mobileTab === "consult" ? renderConsultForm() : renderPatientPanel()}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (>= lg) ────────────────────────────── */}
      <div className="hidden lg:flex gap-6 h-full overflow-hidden">
        {/* Left: Patient history & ABHA */}
        <div className="w-[320px] flex-shrink-0 bg-slate-50 rounded-3xl border border-slate-200 p-6 overflow-y-auto">
          {renderPatientPanel()}
        </div>

        {/* Right: Consultation Workstation */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden">
          {renderConsultForm()}
        </div>
      </div>

      {/* ── Printable Prescription Layout ─────────────────────── */}
      <div className="hidden print:block p-8 max-w-2xl mx-auto bg-white text-black font-sans">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black mb-1">
              {clinic.name || "Doctor Diary Clinic"}
            </h1>
            <p className="text-sm font-semibold">
              {formatDoctorName(clinic.doctorName)} &bull; {clinic.specialty}
            </p>
            {clinic.phone && <p className="text-xs">Ph: {clinic.phone}</p>}
          </div>
          <div className="text-right">
            <p className="font-bold">{format(new Date(), "dd MMM yyyy")}</p>
            <p className="text-xs font-semibold">Token: #{appointment.tokenNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Patient Name</p>
            <p className="font-bold text-base">{patient.name}</p>
            {abhaId && <p className="text-xs text-gray-600">ABHA: {abhaId}</p>}
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-500 uppercase">Age / Gender</p>
            <p className="font-bold text-base">
              {patient.age ? `${patient.age}y` : "-"} / {patient.gender || "-"}
            </p>
            <p className="text-xs text-gray-600">Phone: {patient.phone}</p>
          </div>
        </div>

        {buildVitalsSummary() && (
          <div className="mb-6 p-2 bg-gray-50 rounded border border-gray-200 text-xs">
            <p className="font-bold uppercase text-gray-500 mb-1">Clinical Vitals</p>
            <p className="font-semibold">{buildVitalsSummary()}</p>
          </div>
        )}

        {diagnosis && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-2">
              Clinical Diagnosis
            </p>
            <p className="font-semibold text-sm">{diagnosis}</p>
          </div>
        )}

        <div className="mb-6">
          <p className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-2 flex items-center gap-1">
            <Pill className="w-4 h-4" /> Rx (Treatment &amp; Formulary)
          </p>
          <div className="whitespace-pre-wrap mt-2 font-mono text-sm leading-relaxed">
            {treatment}
          </div>
        </div>

        {selectedLabTests.length > 0 && (
          <div className="mb-6 p-3 bg-gray-50 rounded border border-gray-200 text-xs">
            <p className="font-bold uppercase text-gray-500 mb-1">
              Advised Diagnostic Investigations ({clinic.partnerLabName || "Preferred Laboratory"})
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              {selectedLabTests.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {enableReferral && (
          <div className="mb-6 p-3 bg-amber-50 rounded border border-amber-300 text-xs">
            <p className="font-bold uppercase text-amber-900 mb-1">
              Hospital Referral Notice ({referralPriority.toUpperCase()})
            </p>
            <p className="font-bold text-sm text-amber-950">
              Referred to: {referralHospital} ({referralSpecialty})
            </p>
            {referralReason && <p className="text-amber-800 mt-1">Reason: {referralReason}</p>}
          </div>
        )}

        <div className="mt-12 pt-4 border-t border-gray-300 flex justify-between items-end text-xs">
          <div>
            <p className="text-gray-500">Generated securely via Doctor Diary</p>
          </div>
          <div className="text-center">
            <div className="w-32 border-b border-black mb-1" />
            <p className="font-bold">Authorized Doctor Signature</p>
          </div>
        </div>
      </div>
    </>
  );
}
