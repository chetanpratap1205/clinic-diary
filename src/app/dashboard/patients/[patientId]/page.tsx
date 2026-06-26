import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { patients, appointments, followUps } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Phone, CalendarDays, ArrowLeft, History, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerContainer, FadeInUp } from "@/components/dashboard/dashboard-animations";
import { NewFollowUpButton } from "@/components/dashboard/patients/new-follow-up-button";

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    confirmed: { label: "Confirmed", className: "bg-sky-100 text-sky-700" },
    completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
    no_show: { label: "No Show", className: "bg-amber-100 text-amber-700" },
  };
  const config = map[status] || { label: status, className: "bg-slate-100 text-slate-700" };
  return (
    <Badge className={`${config.className} border-none text-[10px] px-2 py-0.5`}>
      {config.label}
    </Badge>
  );
}

function getFollowUpBadge(status: string) {
  if (status === "pending") return <Badge className="bg-amber-100 text-amber-700 border-none">Pending</Badge>;
  if (status === "completed") return <Badge className="bg-emerald-100 text-emerald-700 border-none">Completed</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
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

  const visitHistory = await db
    .select()
    .from(appointments)
    .where(eq(appointments.patientId, patient.id))
    .orderBy(desc(appointments.appointmentDate), desc(appointments.appointmentTime));

  const followUpHistory = await db
    .select()
    .from(followUps)
    .where(eq(followUps.patientId, patient.id))
    .orderBy(desc(followUps.dueDate));

  return (
    <StaggerContainer className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 sm:space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      {/* Header */}
      <FadeInUp>
        <Link
          href="/dashboard/patients"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Patients
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-sky-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100/50">
              <span className="text-indigo-700 font-bold text-2xl">
                {patient.name[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {patient.name}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {patient.phone}
                </span>
                {patient.age && <span>{patient.age} yrs</span>}
                {patient.gender && <span className="capitalize">{patient.gender}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NewFollowUpButton patientId={patient.id} />
          </div>
        </div>
      </FadeInUp>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Visit History */}
        <FadeInUp>
          <Card className="border-slate-100 shadow-sm h-full">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-5">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" />
                Visit History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {visitHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No previous visits recorded.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {visitHistory.map((appt) => (
                    <div key={appt.id} className="p-4 sm:p-5 flex flex-col gap-2 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {format(new Date(appt.appointmentDate), "MMM d, yyyy")}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {appt.appointmentTime.slice(0, 5)}
                          </p>
                        </div>
                        {getStatusBadge(appt.status)}
                      </div>
                      {appt.notes && (
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm mt-1">
                          {appt.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Follow-up History */}
        <FadeInUp>
          <Card className="border-slate-100 shadow-sm h-full">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-5">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Follow-ups
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {followUpHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No follow-ups scheduled yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {followUpHistory.map((fu) => (
                    <div key={fu.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 text-sm">
                            Due: {format(new Date(fu.dueDate), "MMM d, yyyy")}
                          </p>
                          {getFollowUpBadge(fu.status)}
                        </div>
                        {fu.notes && (
                          <p className="text-xs text-slate-500 mt-1.5 bg-white p-2 rounded-md border border-slate-100">
                            {fu.notes}
                          </p>
                        )}
                      </div>
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
