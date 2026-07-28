import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { patients, appointments, followUps, clinics } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Phone, ArrowLeft, History, FileText, Clock, Mail, ShieldAlert, HeartPulse, UserCheck, AlertTriangle, CalendarClock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerContainer, FadeInUp } from "@/components/dashboard/dashboard-animations";
import { NewFollowUpButton } from "@/components/dashboard/patients/new-follow-up-button";
import { CheckInWalkInButton } from "@/components/dashboard/patients/check-in-walk-in-button";
import { WhatsAppShareButton } from "@/components/dashboard/patients/whatsapp-share-button";
import { MedicalNotes } from "@/components/dashboard/patients/medical-notes";
import { EditPatientSheet } from "@/components/dashboard/patients/edit-patient-sheet";
import { parsePatientExtendedData } from "@/lib/patient-helpers";

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50 border border-sky-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Confirmed</Badge>;
    case "completed":
      return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Completed</Badge>;
    case "cancelled":
      return <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Cancelled</Badge>;
    case "no_show":
      return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">No Show</Badge>;
    case "checked_in":
      return <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Checked In</Badge>;
    case "in_consultation":
      return <Badge className="bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-50 border border-fuchsia-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">In Session</Badge>;
    default:
      return <Badge variant="secondary" className="rounded-full shadow-sm text-[10px] px-2 py-0.5 capitalize">{status.replace('_', ' ')}</Badge>;
  }
}

function getFollowUpBadge(status: string) {
  if (status === "pending") return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Pending</Badge>;
  if (status === "completed") return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Completed ✓</Badge>;
  if (status === "missed") return <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Missed</Badge>;
  if (status === "cancelled") return <Badge className="bg-slate-50 text-slate-500 hover:bg-slate-50 border border-slate-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Cancelled</Badge>;
  return <Badge variant="secondary" className="rounded-full shadow-sm text-[10px] px-2 py-0.5 capitalize">{status}</Badge>;
}

export default async function PatientProfilePage(props: { params: Promise<{ patientId: string }> }) {
  const params = await props.params;
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const [patient] = await db
    .select()
    .from(patients)
    .where(and(eq(patients.id, params.patientId), eq(patients.clinicId, authUser.clinicId)))
    .limit(1);

  if (!patient) redirect("/dashboard/patients");

  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);

  const { visitNotes } = await import("@/db/schema");
  
  const visitHistoryRaw = await db
    .select({
      appt: appointments,
      note: visitNotes,
    })
    .from(appointments)
    .leftJoin(visitNotes, eq(appointments.id, visitNotes.appointmentId))
    .where(eq(appointments.patientId, patient.id))
    .orderBy(desc(appointments.appointmentDate), desc(appointments.appointmentTime));

  const visitHistory = visitHistoryRaw.map(row => ({
    ...row.appt,
    visitNote: row.note,
  }));

  const followUpHistory = await db
    .select({
      id: followUps.id,
      dueDate: followUps.dueDate,
      status: followUps.status,
      notes: followUps.notes,
      completedAt: followUps.completedAt,
      isFree: followUps.isFree,
      feeOverride: followUps.feeOverride,
      sourceType: followUps.sourceType,
      followUpAppointmentId: followUps.followUpAppointmentId,
      // linked appointment date/time (if patient has booked for this follow-up)
      linkedApptDate: appointments.appointmentDate,
      linkedApptTime: appointments.appointmentTime,
      linkedApptStatus: appointments.status,
    })
    .from(followUps)
    .leftJoin(appointments, eq(followUps.followUpAppointmentId, appointments.id))
    .where(eq(followUps.patientId, patient.id))
    .orderBy(desc(followUps.dueDate));

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayAppointment = visitHistory.find(appt => appt.appointmentDate === todayStr);

  // Extended Patient Attributes (Blood group, allergies, emergency contact, email)
  const extData = parsePatientExtendedData(patient.medicalNotes);

  return (
    <StaggerContainer className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      {/* Header */}
      <FadeInUp>
        <Link
          href="/dashboard/patients"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-500 hover:text-sky-600 mb-4 sm:mb-5 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Patient Directory
        </Link>

        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-100/50 to-indigo-100/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 z-10 w-full lg:w-auto">
            {/* Squircle Avatar */}
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-[1.2rem] sm:rounded-[1.5rem] bg-gradient-to-br from-indigo-100 to-sky-50 flex items-center justify-center flex-shrink-0 shadow-inner border border-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20"></div>
              <span className="text-indigo-700 font-black text-2xl sm:text-4xl relative z-10">
                {patient.name[0]?.toUpperCase()}
              </span>
            </div>
            
            <div className="pt-1 sm:pt-2 w-full">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {patient.name}
                </h1>
                {extData.bloodGroup && (
                  <span className="bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black px-2.5 py-0.5 rounded-full shadow-sm">
                    🩸 {extData.bloodGroup}
                  </span>
                )}
              </div>

              {/* Demographics & Contact Chips */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3 text-xs sm:text-sm text-slate-600">
                <a
                  href={`tel:${patient.phone}`}
                  className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100/80 hover:bg-sky-50 hover:text-sky-700 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-500" />
                  {patient.phone}
                </a>

                {extData.email && (
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm truncate max-w-[200px] sm:max-w-none">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {extData.email}
                  </span>
                )}

                {patient.age && (
                  <span className="font-semibold text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
                    {patient.age} yrs
                  </span>
                )}

                {patient.gender && (
                  <span className="capitalize font-semibold text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
                    {patient.gender}
                  </span>
                )}

                {patient.address && (
                  <span className="font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/40 truncate max-w-[200px]">
                    📍 {patient.address}
                  </span>
                )}
              </div>

              {/* Emergency Contact & Allergies Callout Banner */}
              {(extData.emergencyContact || extData.allergies || extData.chronicConditions) && (
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {extData.allergies && (
                    <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 flex items-center gap-2 text-amber-900">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold">Allergies: </span>
                        <span>{extData.allergies}</span>
                      </div>
                    </div>
                  )}

                  {extData.emergencyContact && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2 text-slate-800">
                      <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold">Emergency: </span>
                        <span>{extData.emergencyContact}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap z-10 w-full lg:w-auto justify-start lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
            {todayAppointment ? (
              <WhatsAppShareButton 
                patientName={patient.name} 
                patientPhone={patient.phone}
                clinicName={clinic.name}
                doctorName={clinic.doctorName}
                trackingUrl={`/track/${todayAppointment.id}`} 
              />
            ) : (
              <CheckInWalkInButton patientId={patient.id} />
            )}
            <NewFollowUpButton patientId={patient.id} />
            <EditPatientSheet patient={{
              id: patient.id,
              name: patient.name,
              phone: patient.phone,
              age: patient.age,
              gender: patient.gender,
              address: patient.address,
              medicalNotes: patient.medicalNotes,
            }} />
          </div>
        </div>
      </FadeInUp>

      {/* Universal Clinical Notes & Allergies */}
      <FadeInUp>
        <MedicalNotes patientId={patient.id} initialNotes={patient.medicalNotes as string | null} />
      </FadeInUp>

      {/* Clinical Timeline & Follow-up Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-2">
        {/* Visit & Session Timeline */}
        <FadeInUp>
          <Card className="border-slate-200/60 shadow-sm h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4 px-5 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-800">
                <History className="w-4 h-4 sm:w-5 sm:h-5 text-sky-500" />
                Clinical & Session Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {visitHistory.length === 0 ? (
                <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                     <History className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No previous visits or sessions recorded.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200/80 ml-6 sm:ml-8 my-6 space-y-6">
                  {visitHistory.map((appt) => (
                    <div key={appt.id} className="relative pl-6 sm:pl-8 pr-4 sm:pr-6 group">
                      {/* Timeline Node */}
                      <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-[4px] border-sky-400 shadow-sm group-hover:scale-110 group-hover:border-sky-500 transition-transform" />
                      
                      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm group-hover:shadow-md group-hover:border-sky-100 transition-all">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              {format(new Date(appt.appointmentDate), "MMMM d, yyyy")}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-sky-500" />
                              {appt.appointmentTime.slice(0, 5)}
                            </p>
                          </div>
                          {getStatusBadge(appt.status)}
                        </div>
                        {appt.notes && (
                          <div className="mt-3 relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-200 rounded-l-md"></div>
                            <p className="text-xs sm:text-[13px] text-slate-600 bg-slate-50/80 pl-3.5 pr-3 py-2 rounded-md border border-slate-100/50 leading-relaxed italic">
                              "{appt.notes}"
                            </p>
                          </div>
                        )}
                        {appt.visitNote && (
                          <div className="mt-3 space-y-1.5 text-xs sm:text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {appt.visitNote.vitals && (
                              <p><span className="font-semibold text-slate-700">Observations / Vitals:</span> {appt.visitNote.vitals}</p>
                            )}
                            {appt.visitNote.complaint && (
                              <p><span className="font-semibold text-slate-700">Chief Complaint:</span> {appt.visitNote.complaint}</p>
                            )}
                            {appt.visitNote.diagnosis && (
                              <p><span className="font-semibold text-slate-700">Assessment / Diagnosis:</span> {appt.visitNote.diagnosis}</p>
                            )}
                            {appt.visitNote.treatment && (
                              <p><span className="font-semibold text-slate-700">Treatment Plan / Advice:</span> {appt.visitNote.treatment}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Follow-up Tasks */}
        <FadeInUp>
          <Card className="border-slate-200/60 shadow-sm h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4 px-5 sm:px-6">
              <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2 text-slate-800">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />
                Follow-up & Recall Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {followUpHistory.length === 0 ? (
                <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                     <FileText className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No follow-ups scheduled yet.</p>
                </div>
              ) : (
                <div className="p-4 sm:p-5 space-y-3.5">
                  {followUpHistory.map((fu) => {
                    const today = new Date().toISOString().split('T')[0];
                    const isOverdue = fu.status === 'pending' && fu.dueDate < today;
                    const isBooked = !!fu.followUpAppointmentId;

                    return (
                    <div
                      key={fu.id}
                      className={`bg-white border rounded-xl p-4 shadow-sm transition-all ${
                        isOverdue
                          ? 'border-red-200 bg-red-50/30 hover:shadow-red-100'
                          : isBooked && fu.status === 'pending'
                          ? 'border-sky-200 bg-sky-50/30 hover:shadow-sky-100'
                          : fu.status === 'completed'
                          ? 'border-emerald-100 bg-emerald-50/20 hover:shadow-md'
                          : 'border-slate-200/80 hover:shadow-md hover:border-indigo-200'
                      }`}
                    >
                      {/* Row 1: Due date + status */}
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isOverdue ? 'text-red-500' : 'text-indigo-500'}`} />
                          <p className={`font-bold text-xs sm:text-sm ${isOverdue ? 'text-red-700' : 'text-slate-900'}`}>
                            {isOverdue ? '⚠️ Overdue — ' : 'Due: '}{format(new Date(fu.dueDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                        {getFollowUpBadge(fu.status)}
                      </div>

                      {/* Row 2: Free/Paid + Source badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {fu.isFree ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ₹0 Free Visit
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Paid Visit
                          </span>
                        )}
                        {fu.sourceType === 'auto' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                            From Consultation
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-100">
                            Manual
                          </span>
                        )}
                        {/* Linked appointment status */}
                        {isBooked && fu.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-700 border border-sky-200">
                            Appt. Booked ✓
                          </span>
                        )}
                      </div>

                      {/* Row 3: Linked appointment info */}
                      {isBooked && fu.linkedApptDate && (
                        <div className="bg-sky-50/80 border border-sky-100 rounded-lg px-3 py-2 mt-2 flex items-center gap-2">
                          <CalendarClock className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                          <p className="text-[11px] font-semibold text-sky-800">
                            Appointment: {format(new Date(fu.linkedApptDate as string), 'MMM d, yyyy')}
                            {fu.linkedApptTime ? ` at ${(fu.linkedApptTime as string).slice(0,5)}` : ''}
                            {fu.linkedApptStatus ? (
                              <span className="ml-1.5 text-sky-600">— {fu.linkedApptStatus.replace('_', ' ')}</span>
                            ) : null}
                          </p>
                        </div>
                      )}

                      {/* Row 4: Notes */}
                      {fu.notes && (
                        <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                          {fu.notes}
                        </p>
                      )}

                      {/* Row 5: Completed info */}
                      {fu.status === 'completed' && fu.completedAt && (
                        <p className="text-[11px] text-emerald-700 font-semibold mt-2">
                          ✓ Completed on {format(new Date(fu.completedAt), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeInUp>
      </div>
    </StaggerContainer>
  );
}
