import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, clinics, followUps, patients } from "@/db/schema";
import { eq, and, gte, lte, count, lt } from "drizzle-orm";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentActions } from "@/components/dashboard/appointment-actions";
import { Calendar, Phone, Clock, TrendingUp, AlertCircle, Check } from "lucide-react";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { FollowUpCard } from "@/components/dashboard/follow-ups/follow-up-card";
import Link from "next/link";
import {
  StaggerContainer,
  FadeInUp,
  FadeIn,
} from "@/components/dashboard/dashboard-animations";
import { Greeting } from "@/components/dashboard/greeting";

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    confirmed: {
      label: "Confirmed",
      className: "bg-sky-100 text-sky-700 hover:bg-sky-100",
    },
    checked_in: {
      label: "Checked In",
      className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
    },
    in_consultation: {
      label: "In Consult",
      className: "bg-fuchsia-100 text-fuchsia-700 hover:bg-fuchsia-100",
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-700 hover:bg-red-100",
    },
    no_show: {
      label: "No Show",
      className: "bg-amber-100 text-amber-700 hover:bg-amber-100",
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
  const weekStart = format(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd"
  );
  const weekEnd = format(
    endOfWeek(new Date(), { weekStartsOn: 1 }),
    "yyyy-MM-dd"
  );

  // ✅ Parallelized — all 4 queries run simultaneously
  const [todayAppts, weekApptsResult, weekNoShowsResult, clinicResult] =
    await Promise.all([
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
    ]);

  const overdueFollowUpsResult = await db
    .select({ count: count() })
    .from(followUps)
    .where(
      and(
        eq(followUps.clinicId, authUser.clinicId),
        eq(followUps.status, "pending"),
        lt(followUps.dueDate, today)
      )
    );

  const dueTodayFollowUps = await db
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
    .limit(3);

  const dueTodayCountResult = await db
    .select({ count: count() })
    .from(followUps)
    .where(
      and(
        eq(followUps.clinicId, authUser.clinicId),
        eq(followUps.status, "pending"),
        eq(followUps.dueDate, today)
      )
    );

  const overdueCount = overdueFollowUpsResult[0]?.count ?? 0;
  const dueTodayCount = dueTodayCountResult[0]?.count ?? 0;

  const todayConfirmed = todayAppts.filter(
    (a) => a.status === "confirmed"
  ).length;
  const todayCompleted = todayAppts.filter(
    (a) => a.status === "completed"
  ).length;

  const clinicData = clinicResult[0];
  const todayRevenue = todayCompleted * (clinicData.consultationFee || 0);
  const bookingUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in"
  }/${clinicData?.slug}`;


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

      {/* Booking Link Banner */}
      <FadeInUp>
        <div className="bg-gradient-to-r from-sky-50 to-blue-50/50 border border-sky-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sky-900">
              Your Patient Booking Link
            </p>
            <p className="text-xs sm:text-sm text-sky-600/80 mt-0.5 font-mono truncate">
              {bookingUrl}
            </p>
          </div>
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
              bg: "bg-fuchsia-100",
              text: "text-fuchsia-600",
            },
            {
              label: "Today's Appointments",
              value: todayAppts.length,
              icon: Calendar,
              bg: "bg-sky-100",
              text: "text-sky-600",
            },
            {
              label: "Completed Today",
              value: todayCompleted,
              icon: Check,
              bg: "bg-emerald-100",
              text: "text-emerald-600",
            },
            {
              label: "Follow-ups Due",
              value: dueTodayCount,
              icon: Clock,
              bg: "bg-amber-100",
              text: "text-amber-600",
            },
            {
              label: "Overdue Follow-ups",
              value: overdueCount,
              icon: AlertCircle,
              bg: "bg-red-100",
              text: "text-red-600",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className={`border-slate-100 shadow-sm hover:shadow-md transition-shadow ${
                stat.label.includes("Overdue") ? "col-span-2 md:col-span-1 lg:col-span-1" : ""
              } ${
                stat.label.includes("Overdue") && overdueCount > 0
                  ? "ring-2 ring-red-500/20"
                  : ""
              }`}
            >
              <CardContent className="p-4 sm:p-5">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 sm:mb-4`}
                >
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.text}`} />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </FadeInUp>

      {/* Today's Appointments */}
      <FadeInUp>
        <Card className="border-slate-100 shadow-sm">
          <CardHeader className="bg-white border-b border-slate-50 py-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">
                Today&apos;s Appointments
              </CardTitle>
              <span className="text-xs sm:text-sm font-medium text-slate-400 bg-slate-50 px-2 sm:px-2.5 py-1 rounded-md">
                {format(new Date(), "MMM d")}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {todayAppts.length === 0 ? (
              <FadeIn className="text-center py-12 sm:py-16">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300" />
                </div>
                <p className="text-slate-600 font-medium text-base sm:text-lg">
                  No appointments today
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Share your booking link to get started
                </p>
              </FadeIn>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayAppts.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors last:rounded-b-2xl"
                  >
                    {/* Left: Avatar + Info */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Avatar */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-sky-100">
                        <span className="text-sky-700 font-bold text-xs sm:text-sm">
                          {appt.patientName[0]?.toUpperCase()}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900 text-sm truncate">
                            {appt.patientName}
                          </p>
                          {getStatusBadge(appt.status)}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <p className="text-xs text-slate-500 font-semibold">
                              {formatTimeDisplay(appt.appointmentTime as string)}
                            </p>
                          </div>
                          <div className="hidden sm:flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <p className="text-xs text-slate-500 font-medium">
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
        <Card className="border-slate-100 shadow-sm overflow-hidden bg-gradient-to-br from-amber-50/30 to-white">
          <CardHeader className="bg-transparent border-b border-slate-100/50 py-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-amber-700" />
                </div>
                Follow-ups Due Today
              </CardTitle>
              <Link href="/dashboard/follow-ups" className="text-xs sm:text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors">
                View all ({dueTodayCount}) →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {dueTodayFollowUps.length === 0 ? (
              <div className="text-center py-6">
                <Check className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium text-sm">No follow-ups due today</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dueTodayFollowUps.map((fu) => (
                  <FollowUpCard key={fu.id} followUp={fu} variant="today" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInUp>
    </StaggerContainer>
  );
}
