import { notFound } from "next/navigation";
import { db } from "@/db";
import { appointments, clinics, patients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { CheckCircle2, Building2, MapPin, Calendar, Receipt, CalendarPlus, Activity, FlaskConical, ShieldCheck, Pill } from "lucide-react";
import Link from "next/link";
import { formatTimeDisplay } from "@/lib/format";
import { PrintButton } from "./print-button";
import { formatDoctorName } from "@/lib/utils";

export const metadata = {
  title: "Digital Receipt | Doctor Diary",
  description: "Your official consultation receipt.",
};

export default async function ReceiptPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  if (!id || id.length < 32) return notFound();

  const result = await db
    .select({
      appointment: appointments,
      clinic: clinics,
      patient: patients,
    })
    .from(appointments)
    .innerJoin(clinics, eq(appointments.clinicId, clinics.id))
    .leftJoin(patients, eq(appointments.patientId, patients.id))
    .where(eq(appointments.id, id))
    .limit(1);

  if (!result || result.length === 0) {
    return notFound();
  }

  const { appointment, clinic } = result[0];
  const patient = result[0].patient || {
    id: appointment.patientId || "",
    name: appointment.patientName || "Patient",
    phone: appointment.patientPhone || "",
  };

  const receiptDate = appointment.consultationEndTime 
    ? new Date(appointment.consultationEndTime) 
    : new Date();

  const { visitNotes } = await import("@/db/schema");
  const [note] = await db
    .select()
    .from(visitNotes)
    .where(eq(visitNotes.appointmentId, id))
    .limit(1);

  const hasClinicalSummary = Boolean(
    note && (
      note.diagnosis || 
      note.treatment || 
      note.complaint || 
      note.vitals || 
      (note.labInvestigations && note.labInvestigations.length > 0) || 
      note.referral
    )
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-200 print:bg-white print:py-0 print:px-0">
      <div className="max-w-xl mx-auto">
        
        {/* Top actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <div className="text-slate-400 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Secure E-Receipt
          </div>
          <PrintButton appointmentId={appointment.id} />
        </div>

        {/* The Receipt Card */}
        <div 
          className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none"
          style={{ borderTop: `6px solid ${clinic.themeColor || '#0ea5e9'}` }}
        >
          {/* Header */}
          <div className="p-6 sm:p-8 pb-6 border-b border-slate-100 print:px-0">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{clinic.name}</h1>
                <p className="text-slate-600 font-medium flex items-center gap-1.5 text-sm">
                  <Building2 className="w-4 h-4 text-slate-400" /> {formatDoctorName(clinic.doctorName)}
                </p>
                {clinic.address && (
                  <p className="text-slate-500 flex items-start gap-1.5 text-sm mt-2 max-w-[250px]">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> 
                    <span className="leading-relaxed">{clinic.address}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 text-slate-300 mb-2 print:hidden">
                  <Receipt className="w-8 h-8" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Receipt No</p>
                <p className="font-mono font-bold text-slate-700 text-sm">{appointment.id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Patient Details */}
          <div className="p-6 sm:p-8 py-6 bg-slate-50/50 flex flex-wrap gap-6 sm:gap-8 print:bg-white print:px-0 print:border-b print:border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
              <p className="font-bold text-slate-900">{patient.name}</p>
              {(patient as any).abhaId && (
                <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> ABHA: {(patient as any).abhaId}
                </p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400 print:hidden" />
                {format(receiptDate, "dd MMM yyyy")} <span className="text-slate-300 mx-1">|</span> {formatTimeDisplay(appointment.appointmentTime)}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className="p-6 sm:p-8 print:px-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-slate-50">
                  <td className="py-5 font-semibold text-slate-800">
                    Clinic Consultation
                    <div className="text-xs text-slate-400 font-normal mt-1">Token: #{appointment.tokenNumber || "Walk-in"}</div>
                  </td>
                  <td className="py-5 font-black text-slate-900 text-right text-lg">
                    ₹{appointment.feeCollected ?? (clinic.consultationFee || 0)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Total */}
            <div className="mt-6 flex justify-between items-center bg-slate-900 text-white p-5 rounded-2xl print:bg-white print:text-slate-900 print:border-t-2 print:border-slate-900 print:rounded-none print:px-0">
              <span className="font-bold tracking-wide">Total Paid</span>
              <span className="text-2xl font-black">₹{appointment.feeCollected ?? (clinic.consultationFee || 0)}</span>
            </div>

            {/* Optional Clinical Summary Annexure (Mode B for Digital Doctors) */}
            {hasClinicalSummary && (
              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clinical Summary &amp; Digital Rx</h4>
                
                {note.vitals && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-0.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" /> Recorded Clinical Vitals
                    </p>
                    <p className="text-xs font-semibold text-slate-800">{note.vitals}</p>
                  </div>
                )}

                {note.diagnosis && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Clinical Diagnosis</p>
                    <p className="text-sm font-semibold text-slate-800">{note.diagnosis}</p>
                  </div>
                )}

                {note.treatment && (
                  <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/60">
                    <p className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 mb-1">
                      <Pill className="w-3.5 h-3.5" /> Prescription &amp; Medication Formulary
                    </p>
                    <div className="text-xs font-semibold text-blue-950 font-mono whitespace-pre-wrap leading-relaxed">
                      {note.treatment}
                    </div>
                  </div>
                )}

                {note.labInvestigations && note.labInvestigations.length > 0 && (
                  <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/60">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase flex items-center gap-1 mb-1">
                      <FlaskConical className="w-3.5 h-3.5" /> Advised Diagnostic Tests ({clinic.partnerLabName || "Partner Laboratory"})
                    </p>
                    <ul className="list-disc list-inside text-xs font-semibold text-emerald-950 space-y-0.5">
                      {note.labInvestigations.map((test: string) => (
                        <li key={test}>{test}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {note.referral && (note.referral as any).referredHospital && (
                  <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200">
                    <p className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1 mb-0.5">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" /> Hospital Referral Notice ({((note.referral as any).priority || "Priority").toUpperCase()})
                    </p>
                    <p className="text-xs font-bold text-amber-950">
                      Referred to: {(note.referral as any).referredHospital} ({((note.referral as any).specialty || "Specialist Department")})
                    </p>
                    {((note.referral as any).reason) && (
                      <p className="text-xs text-amber-900 mt-0.5 font-medium">
                        Notes: {(note.referral as any).reason}
                      </p>
                    )}
                  </div>
                )}

                {note.complaint && (
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Chief Complaint</p>
                    <p className="text-sm text-slate-700">{note.complaint}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 text-center print:bg-white print:mt-12 print:border-t-0">
            <p className="text-xs font-medium text-slate-500 mb-1">Thank you for your visit. We wish you a speedy recovery!</p>
            <p className="text-[10px] text-slate-400">This is a computer-generated receipt.</p>
          </div>
        </div>

        {/* CTA / Next Steps (Hidden on Print) */}
        <div className="mt-8 print:hidden">
          <Link href={`/clinic/${clinic.slug}`} className="block w-full">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between hover:border-slate-300 hover:shadow-md transition-all group active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  <CalendarPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Need a Follow-up?</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Book your next visit online instantly.</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg group-hover:bg-indigo-600 transition-colors">
                Book Now
              </div>
            </div>
          </Link>
        </div>

        {/* Brand Watermark */}
        <div className="mt-12 text-center print:mt-16">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
            Powered by <span className="text-slate-600 font-black">Doctor Diary</span>
          </p>
        </div>

      </div>
    </div>
  );
}
