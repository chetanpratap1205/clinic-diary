import { getAuthUser } from "@/lib/auth";
import { formatDoctorName } from "@/lib/utils";
import { db } from "@/db";
import { appointments, clinics, followUps, patients, subscriptions } from "@/db/schema";
import { eq, and, gte, lte, count, lt } from "drizzle-orm";
import { getClinicTodayDate, getClinicWeekStart, getClinicWeekEnd } from "@/lib/timezone";
import { redirect } from "next/navigation";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { StaggerContainer, FadeInUp } from "@/components/dashboard/dashboard-animations";
import { Greeting } from "@/components/dashboard/greeting";
import { NowServingBanner } from "@/components/dashboard/now-serving-banner";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { getDashboardInsight } from "@/lib/dashboard-engine";
import { SmartInsightBanner } from "@/components/dashboard/smart-insight-banner";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TodayAppointmentsList } from "@/components/dashboard/today-appointments-list";
import { FollowUpsWidget } from "@/components/dashboard/follow-ups-widget";

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
    lifetimeApptsResult,
    subscriptionResult,
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
        .where(eq(appointments.clinicId, authUser.clinicId)),

      db
        .select()
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.clinicId, authUser.clinicId),
            eq(subscriptions.status, "active")
          )
        )
        .limit(1),

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
  const lifetimeApptsCount = lifetimeApptsResult[0]?.count ?? 0;

  const todayCompleted = todayAppts.filter(
    (a) => a.status === "completed"
  ).length;

  const clinicData = clinicResult[0];

  const todayRevenue = todayAppts
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (a.feeCollected ?? clinicData?.consultationFee ?? 0), 0);
    
  const bookingUrl = `${
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in"
  }/clinic/${clinicData?.slug}`;

  const nameStr = authUser.name || "Doctor";
  const displayName = formatDoctorName(nameStr.split(" ")[0]);

  // Engine State Prep
  const sub = subscriptionResult[0];
  let subscriptionDaysLeft = null;
  let isSubscriptionActive = false;
  if (sub && sub.currentPeriodEnd) {
    isSubscriptionActive = true;
    const diffTime = new Date(sub.currentPeriodEnd).getTime() - new Date().getTime();
    subscriptionDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Create Date object in IST timezone for current hour check
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istDate = new Date(utc + (3600000 * +5.5));
  const currentHour = istDate.getHours();

  const insight = getDashboardInsight({
    lifetimeAppointments: lifetimeApptsCount,
    todayAppointments: todayAppts.length,
    weekAppointments: weekApptsCount,
    overdueFollowUps: overdueCount,
    subscriptionDaysLeft,
    isSubscriptionActive,
    currentHour,
    doctorName: displayName,
    clinicSlug: clinicData?.slug || "",
  });

  return (
    <StaggerContainer className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-5 sm:space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Greeting displayName={displayName} />
          
          <QuickActions bookingUrl={bookingUrl} />
        </div>
      </FadeInUp>

      {/* The Smart Insight Engine Banner (Absolute top priority) */}
      <FadeInUp>
        <SmartInsightBanner insight={insight} />
      </FadeInUp>

      {/* Stats Grid */}
      <StatsGrid
        todayRevenue={todayRevenue}
        todayAppointmentsCount={todayAppts.length}
        completedTodayCount={todayCompleted}
        dueTodayCount={dueTodayCount}
        overdueCount={overdueCount}
      />

      {/* Main Content Split */}
      <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
        
        {/* Left Column: Today's Appointments & Current Status */}
        <div className="flex-1 flex flex-col gap-5 sm:gap-8 min-w-0">
          <FadeInUp>
            <NowServingBanner clinicId={authUser.clinicId} initialAppointments={todayAppts} themeColor={clinicData?.themeColor || "#0ea5e9"} />
          </FadeInUp>
          <TodayAppointmentsList appointments={todayAppts} bookingUrl={bookingUrl} />
        </div>

        {/* Right Column: Follow-ups */}
        <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0">
          <FollowUpsWidget 
            dueTodayFollowUps={dueTodayFollowUps} 
            dueTodayCount={dueTodayCount} 
            clinicData={{ name: clinicData?.name || "", slug: clinicData?.slug || "" }} 
          />
        </div>
      </div>
    </StaggerContainer>
  );
}
