import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, clinics, followUps, patients } from "@/db/schema";
import { eq, and, gte, lte, count, lt } from "drizzle-orm";
import { format } from "date-fns";
import { getClinicTodayDate, getClinicWeekStart, getClinicWeekEnd } from "@/lib/timezone";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentActions } from "@/components/dashboard/appointment-actions";
import { Calendar, Phone, Clock, TrendingUp, AlertCircle, Check } from "lucide-react";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { PremiumIcon } from "@/components/ui/premium-icon";
import { FollowUpCard } from "@/components/dashboard/follow-ups/follow-up-card";
import Link from "next/link";
import {
  StaggerContainer,
  FadeInUp,
  FadeIn,
} from "@/components/dashboard/dashboard-animations";
import { Greeting } from "@/components/dashboard/greeting";
import { NowServingBanner } from "@/components/dashboard/now-serving-banner";
import { formatTimeDisplay } from "@/lib/format";

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    confirmed: {
      label: "Confirmed",
      className: "bg-primary-50 text-primary-700 border border-primary-200/50 shadow-sm hover:bg-primary-100",
    },
    checked_in: {
      label: "Checked In",
      className: "bg-indigo-50 text-indigo-700 border border-indigo-200/50 shadow-sm hover:bg-indigo-100",
    },
    in_consultation: {
      label: "In Consult",
      className: "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/50 shadow-sm hover:bg-fuchsia-100",
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm hover:bg-emerald-100",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-700 border border-red-200/50 shadow-sm hover:bg-red-100",
    },
    no_show: {
      label: "No Show",
      className: "bg-amber-50 text-amber-700 border border-amber-200/50 shadow-sm hover:bg-amber-100",
    },
  };

  const config = map[status];
  if (!config) return <Badge variant="secondary">{status}</Badge>;

  return (
    <Badge
      className={`${config.className} border-none text-[11px] px-2 py-0.5`}
    >
      {config.label}
    </Badge>
  );
}


export default async function DashboardPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const today = getClinicTodayDate();
  const weekStart = getClinicWeekStart();
  const weekEnd = getClinicWeekEnd();

  // ✅ Parallelized — all queries run simultaneously
  const [
    todayAppts, 
    weekApptsResult, 
    weekNoShowsResult, 
    clinicResult,
    overdueFollowUpsResult,
    dueTodayFollowUps,
    dueTodayCountResult
  ] = await Promise.all([
      db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, authUser.clinicId),
            eq(appointments.appointmentDate, today)
          )
        )
        .orderBy(appointments.appointmentTime),

      db
        .select({ count: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, authUser.clinicId),
            gte(appointments.appointmentDate, weekStart),
            lte(appointments.appointmentDate, weekEnd)
          )
        ),

      db
        .select({ count: count() })
        .from(appointments)
        .where(
          and(
            eq(appointments.clinicId, authUser.clinicId),
            gte(appointments.appointmentDate, weekStart),
            lte(appointments.appointmentDate, weekEnd),
            eq(appointments.status, "no_show")
          )
        ),

      db
        .select()
        .from(clinics)
        .where(eq(clinics.id, authUser.clinicId))
        .limit(1),

      db
        .select({ count: count() })
        .from(followUps)
        .where(
          and(
            eq(followUps.clinicId, authUser.clinicId),
            eq(followUps.status, "pending"),
            lt(followUps.dueDate, today)
          )
        ),

      db
        .select({
          id: followUps.id,
          dueDate: followUps.dueDate,
          status: followUps.status,
          notes: followUps.notes,
          patient: {
            id: patients.id,
            name: patients.name,
            phone: patients.phone,
          }
        })
        .from(followUps)
        .innerJoin(patients, eq(followUps.patientId, patients.id))
        .where(
          and(
            eq(followUps.clinicId, authUser.clinicId),
            eq(followUps.status, "pending"),
            eq(followUps.dueDate, today)
          )
        )
        .limit(3),

      db
        .select({ count: count() })
        .from(followUps)
        .where(
          and(
            eq(followUps.clinicId, authUser.clinicId),
            eq(followUps.status, "pending"),
            eq(followUps.dueDate, today)
          )
        )
    ]);

  const overdueCount = overdueFollowUpsResult[0]?.count ?? 0;
  const dueTodayCount = dueTodayCountResult[0]?.count ?? 0;
  const weekApptsCount = weekApptsResult[0]?.count ?? 0;
  const minutesSaved = weekApptsCount * 3;
  const hoursSaved = Math.floor(minutesSaved / 60);
  const remainingMinutes = minutesSaved % 60;
  const timeSavedString = hoursSaved > 0 
    ? `${hoursSaved} hr ${remainingMinutes > 0 ? `${remainingMinutes} min` : ''}`.trim()
    : `${remainingMinutes} min`;

  const todayConfirmed = todayAppts.filter(
    (a) => a.status === "confirmed"
  ).length;
  const todayCompleted = todayAppts.filter(
    (a) => a.status === "completed"
  ).length;

  const validRevenueAppts = todayAppts.filter(
    (a) => a.status === "completed"
  ).length;

  const clinicData = clinicResult[0];
  const todayRevenue = validRevenueAppts * (clinicData?.consultationFee || 0);
  const bookingUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in"
  }/book/${clinicData?.slug}`;


  const displayName = authUser.name.startsWith("Dr.") || authUser.name.startsWith("Dr ")
    ? authUser.name
    : authUser.name.split(" ")[0];

  return (
    <StaggerContainer className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <Greeting displayName={displayName} />
        </div>
      </FadeInUp>

      {weekApptsCount > 0 && (
        <FadeInUp>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex items-start sm:items-center gap-5 relative overflow-hidden group">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px] group-hover:bg-emerald-500/20 transition-colors duration-700 pointer-events-none" />
            
            <div className="bg-emerald-500/20 p-3 rounded-2xl border border-emerald-500/30 shrink-0 relative z-10">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 relative z-10">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Value Report
              </p>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
                Doctor Diary managed <strong className="text-white bg-white/10 px-1.5 py-0.5 rounded">{weekApptsCount}</strong> bookings this week, saving your clinic approximately <strong className="text-emerald-400 font-bold">{timeSavedString}</strong> of reception work.
              </p>
            </div>
          </div>
        </FadeInUp>
      )}

      <FadeInUp>
        <NowServingBanner clinicId={authUser.clinicId} initialAppointments={todayAppts} themeColor={clinicData?.themeColor || "#0ea5e9"} />
      </FadeInUp>

      {/* Booking Link Banner */}
      <FadeInUp>
        <div className="bg-gradient-to-r from-surface-50 to-surface-100/50 border border-surface-200 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <p className="text-sm font-semibold text-surface-900 mb-1">
            Your Patient Booking Link
          </p>
          <p className="text-xs text-surface-500 font-mono truncate leading-relaxed mb-3" title={bookingUrl}>
            {bookingUrl}
          </p>
          <CopyLinkButton url={bookingUrl} />
        </div>
      </FadeInUp>

      {/* Stats */}
      <FadeInUp>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            {
              label: "Today's Revenue",
              value: `₹${todayRevenue}`,
              icon: TrendingUp,
              variant: "purple",
            },
            {
              label: "Today's Appointments",
              value: todayAppts.length,
              icon: Calendar,
              variant: "default",
            },
            {
              label: "Completed Today",
              value: todayCompleted,
              icon: Check,
              variant: "success",
            },
            {
              label: "Follow-ups Due",
              value: dueTodayCount,
              icon: Clock,
              variant: "warning",
            },
            {
              label: "Overdue Follow-ups",
              value: overdueCount,
              icon: AlertCircle,
              variant: "destructive",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className={`border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white group ${
                stat.label.includes("Overdue") ? "col-span-2 md:col-span-2 lg:col-span-1" : ""
              } ${
                stat.label.includes("Overdue") && overdueCount > 0
                  ? "ring-2 ring-red-500/20"
                  : ""
              }`}
            >
              <CardContent className="p-4 sm:p-5 relative overflow-hidden h-full flex flex-col justify-between">
                {stat.label.includes("Revenue") && (
                   <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[30px] group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
                )}
                <div className="mb-3 sm:mb-4 relative z-10">
                  <PremiumIcon Icon={stat.icon} variant={stat.variant as any} size="md" />
                </div>
                <div className="relative z-10">
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                    {stat.value}
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeInUp>

      {/* Today's Appointments */}
      <FadeInUp>
        <Card className="border-surface-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white">
          <CardHeader className="bg-white border-b border-surface-100/50 py-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-surface-950">
                Today&apos;s Appointments
              </CardTitle>
              <span className="text-xs sm:text-sm font-medium text-surface-500 bg-surface-50 border border-surface-100 px-2 sm:px-2.5 py-1 rounded-md">
                {format(new Date(), "MMM d")}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {todayAppts.length === 0 ? (
              <FadeIn className="text-center py-12 sm:py-16">
                <div className="mb-4">
                  <PremiumIcon Icon={Calendar} variant="glass" size="xl" className="mx-auto" />
                </div>
                <p className="text-surface-600 font-medium text-base sm:text-lg">
                  No appointments today
                </p>
                <p className="text-surface-400 text-sm mt-1">
                  Share your booking link to get started
                </p>
              </FadeIn>
            ) : (
              <div className="divide-y divide-surface-100">
                {todayAppts.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors group cursor-default border-l-2 border-transparent hover:border-indigo-500 last:rounded-b-2xl"
                  >
                    {/* Left: Avatar + Info */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 shadow-inner text-slate-500 font-black text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {appt.patientName[0]?.toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm truncate">
                            {appt.patientName}
                          </p>
                          {getStatusBadge(appt.status)}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1.5">
                            <Clock strokeWidth={2} className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                            <p className="text-[13px] text-slate-600 font-semibold group-hover:text-slate-900 transition-colors">
                              {formatTimeDisplay(appt.appointmentTime as string)}
                            </p>
                          </div>
                          <div className="hidden sm:flex items-center gap-1.5">
                            <Phone strokeWidth={2} className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                            <p className="text-[13px] text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                              {appt.patientPhone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex-shrink-0">
                      <AppointmentActions
                        appointmentId={appt.id}
                        patientId={appt.patientId}
                        currentStatus={appt.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInUp>

      {/* Follow-ups Due Today */}
      <FadeInUp>
        <Card className="border-surface-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden bg-gradient-to-br from-amber-50/20 to-white">
          <CardHeader className="bg-transparent border-b border-surface-100/50 py-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-surface-950 flex items-center gap-3">
                <PremiumIcon Icon={Calendar} variant="warning" size="sm" />
                Follow-ups Due Today
              </CardTitle>
              <Link href="/dashboard/follow-ups" className="text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                View all ({dueTodayCount}) →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {dueTodayFollowUps.length === 0 ? (
              <div className="text-center py-6">
                <Check strokeWidth={1.5} className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium text-sm">No follow-ups due today</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueTodayFollowUps.map((fu) => (
                  <FollowUpCard key={fu.id} followUp={fu} variant="today" clinic={{ name: clinicData?.name || "", slug: clinicData?.slug || "" }} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInUp>
    </StaggerContainer>
  );
}
