"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, History, Stethoscope, Loader2, Pill, Activity, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WhatsAppShareButton } from "@/components/dashboard/patients/whatsapp-share-button";
import type { Appointment, Patient, VisitNote } from "@/db/schema";

interface ConsultationClientProps {
  appointment: Appointment;
  patient: Patient;
  pastVisits: { note: VisitNote; date: string }[];
}

export function ConsultationClient({ appointment, patient, pastVisits }: ConsultationClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [vitals, setVitals] = useState("");
  const [complaint, setComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleComplete = async () => {
    startTransition(async () => {
      try {
        const payload = { vitals, complaint, diagnosis, treatment, followUpRequired: followUp };
        
        const res = await fetch(`/api/appointments/${appointment.id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to complete consultation");

        toast.success("Visit Completed!");
        setIsCompleted(true);
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <>
      <div className="flex-1 flex gap-6 overflow-hidden print:hidden">
      {/* Left Panel: Patient History */}
      <div className="w-1/3 bg-slate-50 rounded-3xl border border-slate-200 p-6 overflow-y-auto flex flex-col gap-6">
        <div>
          <Link href="/dashboard/queue" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Queue
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{patient.name}</h2>
              <p className="text-sm text-slate-500 font-medium">
                {patient.age ? `${patient.age} yrs` : "Age not specified"} • {patient.gender || "Gender not specified"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0 border border-indigo-200">
              <span className="font-black text-indigo-900">{appointment.tokenNumber || "-"}</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2">{patient.phone}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 text-slate-700 font-bold mb-4">
            <History className="w-4 h-4" /> Past Visits
          </div>
          {pastVisits.length === 0 ? (
            <div className="bg-white rounded-2xl p-4 text-center border border-slate-100 shadow-sm text-sm text-slate-400">
              No previous visits found.
            </div>
          ) : (
            <div className="space-y-4">
              {pastVisits.map((visit, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>{format(new Date(visit.date), "MMM d, yyyy")}</span>
                  </div>
                  {visit.note.diagnosis && (
                    <div>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Diagnosis</p>
                      <p className="text-sm text-slate-800">{visit.note.diagnosis}</p>
                    </div>
                  )}
                  {visit.note.treatment && (
                    <div className="bg-slate-50 p-2 rounded-xl mt-1">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                        <Pill className="w-3 h-3" /> Prescription
                      </p>
                      <p className="text-sm text-slate-700">{visit.note.treatment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Current Consultation */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col h-full shadow-xl shadow-slate-200/40 relative">
        {isCompleted ? (
          <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center p-8 rounded-3xl text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Consultation Completed</h2>
            <p className="text-slate-500 mb-8 max-w-sm">The visit notes and prescription have been securely logged for {patient.name}.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <Button 
                onClick={() => window.print()}
                className="flex-1 h-12 rounded-xl bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 gap-2 font-bold"
              >
                <Printer className="w-4 h-4" /> Print Prescription
              </Button>
              <WhatsAppShareButton patientName={patient.name} trackingUrl={`/track/${appointment.id}`} />
            </div>
            
            <Button 
              onClick={() => router.push("/dashboard/queue")}
              variant="ghost"
              className="mt-8 text-slate-500 hover:text-slate-900"
            >
              Return to Queue Dashboard
            </Button>
          </div>
        ) : null}

        <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Current Consultation</h3>
              <p className="text-xs text-slate-500 font-medium">Log vitals, diagnosis, and prescription</p>
            </div>
          </div>
          <Button 
            onClick={handleComplete} 
            disabled={isPending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 h-11 px-6 shadow-sm shadow-emerald-200"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Complete Visit
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Vitals */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3" /> Vitals
            </label>
            <input
              type="text"
              placeholder="e.g. BP 120/80, WT 75kg"
              value={vitals}
              onChange={(e) => setVitals(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-colors"
            />
          </div>

          {/* Complaint */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chief Complaint / Symptoms</label>
            <textarea
              placeholder="What brings the patient in today?"
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* Diagnosis */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Diagnosis</label>
            <input
              type="text"
              placeholder="Primary diagnosis..."
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-colors"
            />
          </div>

          {/* Treatment / Prescription */}
          <div className="space-y-2 flex-1 flex flex-col">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Pill className="w-3 h-3" /> Treatment & Prescription
            </label>
            <textarea
              placeholder="Medicines, dosage, duration, and instructions..."
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              rows={6}
              className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-colors resize-none"
            />
          </div>
          
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={followUp}
                onChange={(e) => setFollowUp(e.target.checked)}
                className="w-5 h-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500/20"
              />
              <span className="text-sm font-semibold text-slate-700">Follow-up Required</span>
            </label>
          </div>
        </div>
      </div>
      </div>

      {/* Printable Prescription Layout */}
      <div className="hidden print:block p-8 max-w-2xl mx-auto bg-white text-black font-sans">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black mb-1">Prescription</h1>
            <p className="text-sm font-semibold">Token: #{appointment.tokenNumber}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{format(new Date(), "MMM d, yyyy")}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">Patient Name</p>
            <p className="font-bold text-lg">{patient.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-500 uppercase">Age / Gender</p>
            <p className="font-bold text-lg">{patient.age ? `${patient.age}y` : "-"} / {patient.gender || "-"}</p>
          </div>
        </div>

        {vitals && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-2">Vitals</p>
            <p>{vitals}</p>
          </div>
        )}

        {diagnosis && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase border-b border-gray-200 pb-1 mb-2">Diagnosis</p>
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
