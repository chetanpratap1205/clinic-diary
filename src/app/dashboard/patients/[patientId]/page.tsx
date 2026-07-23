import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { patients, appointments, followUps, clinics } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Phone, CalendarDays, ArrowLeft, History, FileText, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerContainer, FadeInUp } from "@/components/dashboard/dashboard-animations";
import { NewFollowUpButton } from "@/components/dashboard/patients/new-follow-up-button";
import { CheckInWalkInButton } from "@/components/dashboard/patients/check-in-walk-in-button";
import { WhatsAppShareButton } from "@/components/dashboard/patients/whatsapp-share-button";
import { MedicalNotes } from "@/components/dashboard/patients/medical-notes";
import { EditPatientSheet } from "@/components/dashboard/patients/edit-patient-sheet";

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
      return <Badge className="bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-50 border border-fuchsia-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">In Consult</Badge>;
    default:
      return <Badge variant="secondary" className="rounded-full shadow-sm text-[10px] px-2 py-0.5 capitalize">{status.replace('_', ' ')}</Badge>;
  }
}

function getFollowUpBadge(status: string) {
  if (status === "pending") return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Pending</Badge>;
  if (status === "completed") return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Completed</Badge>;
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
    .select()
    .from(followUps)
    .where(eq(followUps.patientId, patient.id))
    .orderBy(desc(followUps.dueDate));

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayAppointment = visitHistory.find(appt => appt.appointmentDate === todayStr);

  return (
    <StaggerContainer className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      {/* Header */}
      <FadeInUp>
        <Link
          href="/dashboard/patients"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-sky-600 mb-5 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-100/50 to-indigo-100/30 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="flex items-start gap-5 sm:gap-6 z-10">
            {/* Ultra Premium Squircle Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] bg-gradient-to-br from-indigo-100 to-sky-50 flex items-center justify-center flex-shrink-0 shadow-inner border border-white relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20"></div>
              <span className="text-indigo-700 font-bold text-3xl sm:text-4xl relative z-10">
                {patient.name[0]?.toUpperCase()}
              </span>
            </div>
            
            <div className="pt-1 sm:pt-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {patient.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3 text-sm text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200/50 shadow-sm">
                  <Phone className="w-4 h-4 text-sky-500" />
                  {patient.phone}
                </span>
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
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap z-10 mt-2 sm:mt-0">
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
            }} />
          </div>
        </div>
      </FadeInUp>

      <FadeInUp>
        <MedicalNotes patientId={patient.id} initialNotes={patient.medicalNotes as string | null} />
      </FadeInUp>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-2">
        {/* Visit Timeline */}
        <FadeInUp>
          <Card className="border-slate-200/60 shadow-sm h-full rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <History className="w-5 h-5 text-sky-500" />
                Medical Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {visitHistory.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                     <History className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No previous visits recorded.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-200/80 ml-8 mt-8 mb-8 space-y-8">
                  {visitHistory.map((appt) => (
                    <div key={appt.id} className="relative pl-8 pr-6 group">
                      {/* Timeline Node */}
                      <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-[4px] border-sky-400 shadow-sm group-hover:scale-110 group-hover:border-sky-500 transition-transform" />
                      
                      <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm group-hover:shadow-md group-hover:border-sky-100 transition-all">
                        <div className="flex items-start justify-between gap-4 mb-2">
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
                            <p className="text-[13px] text-slate-600 bg-slate-50/80 pl-4 pr-3 py-2.5 rounded-md border border-slate-100/50 leading-relaxed italic">
                              "{appt.notes}"
                            </p>
                          </div>
                        )}
                        {appt.visitNote && (
                          <div className="mt-3 space-y-2 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                            {appt.visitNote.vitals && (
                              <p><span className="font-semibold text-slate-700">Vitals:</span> {appt.visitNote.vitals}</p>
                            )}
                            {appt.visitNote.complaint && (
                              <p><span className="font-semibold text-slate-700">Complaint:</span> {appt.visitNote.complaint}</p>
                            )}
                            {appt.visitNote.diagnosis && (
                              <p><span className="font-semibold text-slate-700">Diagnosis:</span> {appt.visitNote.diagnosis}</p>
                            )}
                            {appt.visitNote.treatment && (
                              <p><span className="font-semibold text-slate-700">Treatment:</span> {appt.visitNote.treatment}</p>
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
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4 px-6">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800">
                <FileText className="w-5 h-5 text-indigo-500" />
                Follow-up Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {followUpHistory.length === 0 ? (
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                     <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium text-sm">No follow-ups scheduled yet.</p>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  {followUpHistory.map((fu) => (
                    <div key={fu.id} className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-200 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <CalendarDays className="w-4 h-4 text-indigo-400" />
                           <p className="font-bold text-slate-900 text-sm">
                             Due: {format(new Date(fu.dueDate), "MMM d, yyyy")}
                           </p>
                        </div>
                        {getFollowUpBadge(fu.status)}
                      </div>
                      {fu.notes && (
                        <p className="text-[13px] text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                          {fu.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeInUp>
      </div>
    </StaggerContainer>
  );
}
