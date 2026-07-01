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
  ChevronRight,
  Sparkles,
  AlertCircle,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WhatsAppShareButton } from "@/components/dashboard/patients/whatsapp-share-button";
import type { Appointment, Patient, VisitNote } from "@/db/schema";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface ConsultationClientProps {
  appointment: Appointment;
  patient: Patient;
  pastVisits: { note: VisitNote; date: string }[];
  clinic: any;
}

type MobileTab = "patient" | "consult";

export function ConsultationClient({
  appointment,
  patient,
  pastVisits,
  clinic,
}: ConsultationClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [vitals, setVitals] = useState("");
  const [complaint, setComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [followUpDays, setFollowUpDays] = useState(7);
  const [isCompleted, setIsCompleted] = useState(false);

  // Mobile tab state: "patient" = left panel, "consult" = right panel
  const [mobileTab, setMobileTab] = useState<MobileTab>("consult");

  const handleComplete = async () => {
    startTransition(async () => {
      try {
        const payload = {
          vitals,
          complaint,
          diagnosis,
          treatment,
          followUpRequired: followUp,
          followUpDays,
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

        toast.success("Visit Completed!");
        setIsCompleted(true);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  /* ─────────────── COMPLETED STATE ─────────────────────────── */
  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
        {/* Success animation ring */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-30" />
        </div>

        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
          Visit Completed!
        </h2>
        <p className="text-slate-500 mb-1 max-w-xs text-sm leading-relaxed">
          Notes & prescription logged for{" "}
          <span className="font-semibold text-slate-700">{patient.name}</span>.
        </p>
        <p className="text-xs text-slate-400 mb-8">
          {format(new Date(), "MMMM d, yyyy • h:mm a")}
        </p>

        {/* Action buttons */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="w-full h-12 rounded-2xl border-slate-200 font-semibold gap-2 text-slate-700"
          >
            <Printer className="w-4 h-4" />
            Print Prescription
          </Button>
          <Button
            onClick={() => {
              const url = `${window.location.origin}/review/${appointment.id}`;
              navigator.clipboard.writeText(url);
              toast.success("Review link copied to clipboard");
            }}
            variant="outline"
            className="w-full h-12 rounded-2xl border-slate-200 font-semibold gap-2 text-slate-700"
          >
            <Star className="w-4 h-4 text-amber-500" />
            Copy Review Link
          </Button>
          <WhatsAppShareButton
            patientName={patient.name}
            patientPhone={patient.phone}
            clinicName={clinic.name}
            doctorName={clinic.doctorName}
            trackingUrl={`/track/${appointment.id}`}
          />
          <Button
            onClick={() => router.push("/dashboard/queue")}
            className="w-full h-12 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-semibold"
          >
            Back to Queue
          </Button>
        </div>
      </div>
    );
  }

  /* ─────────────── PATIENT INFO PANEL (reused on both layouts) ─ */
  const PatientPanel = () => (
    <div className="flex flex-col gap-5 h-full">
      {/* Back link — desktop only (mobile has its own header) */}
      <Link
        href="/dashboard/queue"
        className="hidden lg:inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Queue
      </Link>

      {/* Patient card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-50 flex items-center justify-center flex-shrink-0 border border-indigo-100 shadow-inner">
            <span className="font-black text-indigo-700 text-xl">
              {patient.name[0]?.toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">
              {patient.name}
            </h2>
            <p className="text-sm text-slate-500">
              {patient.age ? `${patient.age} yrs` : "Age N/A"} &bull;{" "}
              {patient.gender || "N/A"}
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
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-medium">{patient.phone}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-slate-600">
            <CalendarClock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              Appt:{" "}
              <span className="font-semibold">
                {format(new Date(appointment.appointmentDate as string), "d MMM")} &bull;{" "}
                {appointment.appointmentTime
                  ? (() => {
                      const [h, m] = (appointment.appointmentTime as string)
                        .split(":")
                        .map(Number);
                      const ampm = h >= 12 ? "PM" : "AM";
                      return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
                    })()
                  : "—"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Past Visits */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex items-center gap-2 text-slate-700 font-bold mb-3 text-sm">
          <History className="w-4 h-4 text-slate-500" />
          Past Visits
          {pastVisits.length > 0 && (
            <span className="ml-auto text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              {pastVisits.length}
            </span>
          )}
        </div>

        {pastVisits.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center border border-slate-100 shadow-sm">
            <User className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">
              First visit — no history
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastVisits.map((visit, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2.5"
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {format(new Date(visit.date), "MMM d, yyyy")}
                </p>
                {visit.note.diagnosis && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mb-0.5">
                      Diagnosis
                    </p>
                    <p className="text-sm text-slate-800 font-medium">
                      {visit.note.diagnosis}
                    </p>
                  </div>
                )}
                {visit.note.treatment && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1 mb-0.5">
                      <Pill className="w-3 h-3" /> Prescription
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {visit.note.treatment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ─────────────── CONSULTATION FORM (reused on both layouts) ── */
  const ConsultForm = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-sm">
            Current Consultation
          </h3>
          <p className="text-xs text-slate-500">
            Log vitals, diagnosis & prescription
          </p>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex-1 overflow-y-auto space-y-5 min-h-0 pb-4">
        {/* Vitals */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Activity className="w-3 h-3 text-slate-400" />
            Vitals
          </label>
          <input
            type="text"
            placeholder="e.g. BP 120/80, WT 75kg, Temp 98.6°F"
            value={vitals}
            onChange={(e) => setVitals(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Complaint */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <ClipboardList className="w-3 h-3 text-slate-400" />
            Chief Complaint / Symptoms
          </label>
          <textarea
            placeholder="What brings the patient in today?"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white transition-all resize-none placeholder:text-slate-300 leading-relaxed"
          />
        </div>

        {/* Diagnosis */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            Diagnosis
          </label>
          <input
            type="text"
            placeholder="Primary diagnosis..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white transition-all placeholder:text-slate-300"
          />
        </div>

        {/* Treatment */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <Pill className="w-3 h-3 text-slate-400" />
            Treatment &amp; Prescription
          </label>
          <textarea
            placeholder="Medicines, dosage, duration, and instructions..."
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            rows={5}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 focus:bg-white transition-all resize-none placeholder:text-slate-300 leading-relaxed"
          />
        </div>

        {/* Follow-up toggle */}
        <button
          type="button"
          onClick={() => setFollowUp(!followUp)}
          className={cn(
            "w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all text-left",
            followUp
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
          )}
        >
          <div className="flex items-center gap-2.5">
            <CalendarClock
              className={cn(
                "w-4 h-4 flex-shrink-0",
                followUp ? "text-amber-500" : "text-slate-400"
              )}
            />
            <span className="text-sm font-semibold">Follow-up Required</span>
          </div>
          {/* Toggle pill */}
          <div
            className={cn(
              "w-10 h-5.5 rounded-full transition-all duration-200 relative flex-shrink-0",
              followUp ? "bg-amber-400" : "bg-slate-300"
            )}
            style={{ height: "22px", width: "40px" }}
          >
            <div
              className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                followUp ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </div>
        </button>

        {/* Follow-up Days Selector */}
        <AnimatePresence>
          {followUp && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 overflow-hidden"
            >
              {[3, 7, 14, 30].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setFollowUpDays(days)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all active:scale-95",
                    followUpDays === days
                      ? "bg-amber-100 border-amber-300 text-amber-800 shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                  )}
                >
                  {days} Days
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Complete button — sticky at bottom of form */}
      <div className="pt-4 border-t border-slate-100 mt-auto">
        <Button
          onClick={handleComplete}
          disabled={isPending}
          className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base gap-2.5 shadow-lg shadow-emerald-200/60 active:scale-[0.98] transition-transform"
          style={{ height: "52px" }}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Complete Visit
            </>
          )}
        </Button>
      </div>
    </div>
  );

  /* ─────────────── MAIN RENDER ──────────────────────────────── */
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
              {patient.age ? `${patient.age} yrs` : ""}{" "}
              {patient.gender ? `• ${patient.gender}` : ""}
              {appointment.tokenNumber
                ? ` • Token #${appointment.tokenNumber}`
                : ""}
            </p>
          </div>
          {/* Quick phone badge */}
          <div className="flex-shrink-0 text-right">
            <p className="text-[10px] text-slate-400 font-medium">
              {patient.phone}
            </p>
          </div>
        </div>

        {/* Mobile tab switcher */}
        <div className="flex-shrink-0 px-4 pt-3 pb-0">
          <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
            <button
              onClick={() => setMobileTab("consult")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                mobileTab === "consult"
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-slate-500"
              )}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Consultation
            </button>
            <button
              onClick={() => setMobileTab("patient")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                mobileTab === "patient"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-slate-500"
              )}
            >
              <History className="w-3.5 h-3.5" />
              History
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
          {mobileTab === "consult" ? <ConsultForm /> : <PatientPanel />}
        </div>
      </div>

      {/* ── DESKTOP LAYOUT (>= lg) ────────────────────────────── */}
      <div className="hidden lg:flex gap-6 h-full overflow-hidden">
        {/* Left: Patient history */}
        <div className="w-[320px] flex-shrink-0 bg-slate-50 rounded-3xl border border-slate-200 p-6 overflow-y-auto">
          <PatientPanel />
        </div>

        {/* Right: Consultation form */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-xl shadow-slate-200/40 flex flex-col overflow-hidden">
          <ConsultForm />
        </div>
      </div>

      {/* ── Printable Prescription ───────────────────────────── */}
      <div className="hidden print:block p-8 max-w-2xl mx-auto bg-white text-black font-sans">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black mb-1">Prescription</h1>
            <p className="text-sm font-semibold">
              Token: #{appointment.tokenNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">{format(new Date(), "MMM d, yyyy")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              Patient Name
            </p>
            <p className="font-bold text-lg">{patient.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-500 uppercase">
              Age / Gender
            </p>
            <p className="font-bold text-lg">
              {patient.age ? `${patient.age}y` : "-"} /{" "}
              {patient.gender || "-"}
            </p>
          </div>
        </div>

        {vitals && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-2">
              Vitals
            </p>
            <p>{vitals}</p>
          </div>
        )}

        {diagnosis && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-2">
              Diagnosis
            </p>
            <p className="font-semibold">{diagnosis}</p>
          </div>
        )}

        <div className="mb-8">
          <p className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-2 flex items-center gap-1">
            <Pill className="w-4 h-4" /> Rx (Treatment)
          </p>
          <div className="whitespace-pre-wrap mt-2">{treatment}</div>
        </div>

        {followUp && (
          <div className="mt-8 border-t border-dashed border-gray-400 pt-4">
            <p className="font-bold">* Follow-up required.</p>
          </div>
        )}
      </div>
    </>
  );
}
