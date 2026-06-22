import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq, and, gte, lte, count } from "drizzle-orm";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentActions } from "@/components/dashboard/appointment-actions";
import { Calendar, Phone, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { StaggerContainer, FadeInUp, FadeIn } from "@/components/dashboard/dashboard-animations";

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed": return <Badge variant="default" className="bg-sky-100 text-sky-700 hover:bg-sky-100 border-none">Confirmed</Badge>;
    case "completed": return <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Completed</Badge>;
    case "cancelled": return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Cancelled</Badge>;
    case "no_show": return <Badge variant="warning" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">No Show</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatTimeDisplay(time: string): string {
  const t = time.slice(0, 5);
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export default async function DashboardPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const todayAppts = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, authUser.clinicId),
        eq(appointments.appointmentDate, today)
      )
    )
    .orderBy(appointments.appointmentTime);

  const weekAppts = await db
    .select({ count: count() })
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, authUser.clinicId),
        gte(appointments.appointmentDate, weekStart),
        lte(appointments.appointmentDate, weekEnd)
      )
    );

  const weekNoShows = await db
    .select({ count: count() })
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, authUser.clinicId),
        gte(appointments.appointmentDate, weekStart),
        lte(appointments.appointmentDate, weekEnd),
        eq(appointments.status, "no_show")
      )
    );

  const todayConfirmed = todayAppts.filter((a) => a.status === "confirmed").length;
  
  const clinic = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);

  const clinicData = clinic[0];
  const bookingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://doctordiary.in"}/${clinicData?.slug}`;

  return (
    <StaggerContainer className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {authUser.name.split(" ")[0]} 👋
            </h1>
            <p className="text-slate-500 mt-1.5">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
        </div>
      </FadeInUp>

      {/* Booking Link Banner */}
      <FadeInUp>
        <div className="bg-gradient-to-r from-sky-50 to-blue-50/50 border border-sky-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-sky-900">Your Patient Booking Link</p>
            <p className="text-sm text-sky-600/80 mt-0.5 font-mono">{bookingUrl}</p>
          </div>
          <CopyLinkButton url={bookingUrl} />
        </div>
      </FadeInUp>

      {/* Stats */}
      <FadeInUp>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Today's Bookings", value: todayAppts.length, icon: Calendar, color: "sky" },
            { label: "Confirmed", value: todayConfirmed, icon: Clock, color: "emerald" },
            { label: "This Week", value: weekAppts[0]?.count ?? 0, icon: TrendingUp, color: "violet" },
            { label: "No-Shows (Week)", value: weekNoShows[0]?.count ?? 0, icon: AlertCircle, color: "amber" },
          ].map((stat) => (
            <Card key={stat.label} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeInUp>

      {/* Today's Appointments */}
      <FadeInUp>
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="bg-white border-b border-slate-50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">Today&apos;s Appointments</CardTitle>
              <span className="text-sm font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">{format(new Date(), "MMM d")}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {todayAppts.length === 0 ? (
              <FadeIn className="text-center py-16">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-slate-600 font-medium text-lg">No appointments today</p>
                <p className="text-slate-400 text-sm mt-1">Share your booking link to get started</p>
              </FadeIn>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayAppts.map((appt) => (
                  <div key={appt.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-5">
                      {/* Time */}
                      <div className="w-20 flex-shrink-0 text-right">
                        <p className="text-sm font-bold text-slate-900">{formatTimeDisplay(appt.appointmentTime as string)}</p>
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-sky-100">
                        <span className="text-sky-700 font-bold text-sm">
                          {appt.patientName[0]?.toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{appt.patientName}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <p className="text-xs text-slate-500 font-medium">{appt.patientPhone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block">
                        {getStatusBadge(appt.status)}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <AppointmentActions
                          appointmentId={appt.id}
                          currentStatus={appt.status}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInUp>
    </StaggerContainer>
  );
}
