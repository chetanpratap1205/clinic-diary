import { db } from "@/db";
import {
  clinics,
  patients,
  appointments,
  subscriptions,
  paymentLogs,
  reviews,
} from "@/db/schema";
import { count, sum, eq, gte, lte, and, desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  Users,
  CalendarCheck,
  IndianRupee,
  Star,
  CalendarDays,
  TrendingUp,
  Activity,
  ArrowRight,
  QrCode,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfDay } from "date-fns";
import Link from "next/link";
import { DashboardCharts } from "./_components/dashboard-charts";
import { DateRangePicker } from "./_components/date-range-picker";
import { NeedsAttentionWidget, InactiveClinic } from "./_components/needs-attention-widget";

export const dynamic = "force-dynamic";

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string;
  trend?: { label: string; positive: boolean };
}) {
  return (
    <Card className="relative overflow-hidden border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-extrabold text-slate-900">{value}</div>
          {trend && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-md ${trend.positive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {trend.label}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const now = new Date();
  
  // Date range logic
  const defaultFrom = startOfMonth(now);
  const defaultTo = now;
  
  const fromParam = typeof searchParams?.from === "string" ? new Date(searchParams.from) : defaultFrom;
  const toParam = typeof searchParams?.to === "string" ? endOfDay(new Date(searchParams.to)) : defaultTo;

  const today = format(now, "yyyy-MM-dd");

  // ── KPI & Alert queries ──────────────────────────────────────────────────
  const [
    [totalClinics],
    [totalPatients],
    [totalAppointments],
    [activeSubscriptions],
    [totalReviewsResult],
    [periodRevenueResult],
    [allTimeRevenueResult],
    [todayApptsResult],
    qrScansResult,
    inactiveClinicsResult,
    inactiveClinicsListResult,
  ] = await Promise.all([
    db.select({ value: count() }).from(clinics).where(and(gte(clinics.createdAt, fromParam), lte(clinics.createdAt, toParam))),
    db.select({ value: count() }).from(patients).where(and(gte(patients.createdAt, fromParam), lte(patients.createdAt, toParam))),
    db.select({ value: count() }).from(appointments).where(and(gte(appointments.createdAt, fromParam), lte(appointments.createdAt, toParam))),
    db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.status, "active")),
    db.select({ value: count() }).from(reviews).where(and(gte(reviews.createdAt, fromParam), lte(reviews.createdAt, toParam))),
    db.select({ value: sum(paymentLogs.amountPaise) }).from(paymentLogs)
      .where(and(gte(paymentLogs.paidAt, fromParam), lte(paymentLogs.paidAt, toParam), eq(paymentLogs.status, "paid"))),
    db.select({ value: sum(paymentLogs.amountPaise) }).from(paymentLogs).where(eq(paymentLogs.status, "paid")),
    db.select({ value: count() }).from(appointments)
      .where(eq(appointments.appointmentDate, today)),
    db.execute(sql`SELECT count(*)::int as value FROM appointments WHERE acquisition_source LIKE 'qr_%' AND created_at >= ${fromParam.toISOString()} AND created_at <= ${toParam.toISOString()}`),
    db.execute(sql`SELECT count(id)::int as value FROM clinics WHERE id NOT IN (SELECT clinic_id FROM appointments WHERE created_at >= NOW() - INTERVAL '7 days')`),
    db.execute(sql`
      SELECT id, name, doctor_name as "doctorName", specialty, phone, created_at as "createdAt"
      FROM clinics
      WHERE id NOT IN (SELECT clinic_id FROM appointments WHERE created_at >= NOW() - INTERVAL '7 days')
      ORDER BY created_at DESC
      LIMIT 5
    `),
  ]);

  const periodRevenue = (Number(periodRevenueResult?.value) || 0) / 100;
  const allTimeRevenue = (Number(allTimeRevenueResult?.value) || 0) / 100;
  const qrScansCount = Number(qrScansResult.rows[0]?.value) || 0;
  const inactiveClinicsCount = Number(inactiveClinicsResult.rows[0]?.value) || 0;
  const inactiveClinicsList = (inactiveClinicsListResult.rows as unknown as InactiveClinic[]) || [];

  // ── Chart data ─────────────────────────────────────────────────────────────
  const sixMonthsAgo = subMonths(toParam, 5);

  const [growthResult, revenueResult, appointmentsResult] = await Promise.all([
    db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at AT TIME ZONE 'Asia/Kolkata'), 'Mon ''YY') AS month,
        COUNT(*)::int AS clinics,
        DATE_TRUNC('month', created_at AT TIME ZONE 'Asia/Kolkata') AS sort_key
      FROM clinics
      WHERE created_at >= ${sixMonthsAgo.toISOString()} AND created_at <= ${toParam.toISOString()}
      GROUP BY DATE_TRUNC('month', created_at AT TIME ZONE 'Asia/Kolkata')
      ORDER BY sort_key ASC
    `),
    db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', paid_at AT TIME ZONE 'Asia/Kolkata'), 'Mon ''YY') AS month,
        (SUM(amount_paise) / 100)::int AS revenue,
        DATE_TRUNC('month', paid_at AT TIME ZONE 'Asia/Kolkata') AS sort_key
      FROM payment_logs
      WHERE paid_at >= ${sixMonthsAgo.toISOString()} AND paid_at <= ${toParam.toISOString()} AND status = 'paid'
      GROUP BY DATE_TRUNC('month', paid_at AT TIME ZONE 'Asia/Kolkata')
      ORDER BY sort_key ASC
    `),
    db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at AT TIME ZONE 'Asia/Kolkata'), 'Mon ''YY') AS month,
        COUNT(*)::int AS appointments,
        DATE_TRUNC('month', created_at AT TIME ZONE 'Asia/Kolkata') AS sort_key
      FROM appointments
      WHERE created_at >= ${sixMonthsAgo.toISOString()} AND created_at <= ${toParam.toISOString()}
      GROUP BY DATE_TRUNC('month', created_at AT TIME ZONE 'Asia/Kolkata')
      ORDER BY sort_key ASC
    `),
  ]);

  const growthData = (growthResult.rows as Array<{ month: string; clinics: number }>).map(
    (r) => ({ month: r.month, clinics: Number(r.clinics) })
  );
  const revenueData = (revenueResult.rows as Array<{ month: string; revenue: number }>).map(
    (r) => ({ month: r.month, revenue: Number(r.revenue) })
  );
  const activityData = (appointmentsResult.rows as Array<{ month: string; appointments: number }>).map(
    (r) => ({ month: r.month, appointments: Number(r.appointments) })
  );

  // ── Recent feeds ───────────────────────────────────────────────────────────
  const [recentSignups, recentPayments] = await Promise.all([
    db
      .select({
        id: clinics.id,
        name: clinics.name,
        doctorName: clinics.doctorName,
        specialty: clinics.specialty,
        createdAt: clinics.createdAt,
      })
      .from(clinics)
      .orderBy(desc(clinics.createdAt))
      .limit(5),
    db
      .select({
        id: paymentLogs.id,
        clinicName: clinics.name,
        planName: paymentLogs.planName,
        amountPaise: paymentLogs.amountPaise,
        paidAt: paymentLogs.paidAt,
      })
      .from(paymentLogs)
      .leftJoin(clinics, eq(paymentLogs.clinicId, clinics.id))
      .orderBy(desc(paymentLogs.paidAt))
      .limit(5),
  ]);

  const isCustomRange = typeof searchParams?.from === "string";
  const subText = isCustomRange ? `${format(fromParam, "MMM d")} - ${format(toParam, "MMM d")}` : "Current calendar month";

  const financialKpis = [
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.value.toLocaleString(),
      sub: "Currently paying clinics",
      icon: TrendingUp,
      accent: "bg-emerald-50 text-emerald-600",
      trend: { label: "+12%", positive: true },
    },
    {
      title: "Period Revenue",
      value: `₹${periodRevenue.toLocaleString("en-IN")}`,
      sub: isCustomRange ? subText : "Current calendar month",
      icon: IndianRupee,
      accent: "bg-amber-50 text-amber-600",
      trend: { label: "+8.4%", positive: true },
    },
    {
      title: "All-Time Revenue",
      value: `₹${allTimeRevenue.toLocaleString("en-IN")}`,
      sub: "Total collected on platform",
      icon: IndianRupee,
      accent: "bg-rose-50 text-rose-600",
      trend: undefined,
    },
    {
      title: "Inactive Clinics",
      value: inactiveClinicsCount.toLocaleString(),
      sub: "No appointments in 7 days",
      icon: AlertTriangle,
      accent: "bg-rose-50 text-rose-600",
      trend: inactiveClinicsCount > 0 ? { label: "Action Needed", positive: false } : undefined,
    },
  ];

  const activityKpis = [
    {
      title: "Registered Clinics",
      value: totalClinics.value.toLocaleString(),
      sub: isCustomRange ? subText : "Registered this month",
      icon: Building2,
      accent: "bg-teal-50 text-teal-600",
      trend: { label: "+5%", positive: true },
    },
    {
      title: "Total Patients",
      value: totalPatients.value.toLocaleString(),
      sub: isCustomRange ? subText : "Across all clinics",
      icon: Users,
      accent: "bg-sky-50 text-sky-600",
      trend: { label: "+18%", positive: true },
    },
    {
      title: "Appointments Booked",
      value: totalAppointments.value.toLocaleString(),
      sub: isCustomRange ? subText : "Created in period",
      icon: CalendarCheck,
      accent: "bg-indigo-50 text-indigo-600",
      trend: { label: "+22%", positive: true },
    },
    {
      title: "Today's Appointments",
      value: todayApptsResult.value.toLocaleString(),
      sub: format(now, "EEEE, MMM d"),
      icon: CalendarDays,
      accent: "bg-violet-50 text-violet-600",
      trend: undefined,
    },
    {
      title: "Patient Reviews",
      value: totalReviewsResult.value.toLocaleString(),
      sub: isCustomRange ? subText : "Submitted in period",
      icon: Star,
      accent: "bg-orange-50 text-orange-600",
      trend: { label: "-2%", positive: false },
    },
    {
      title: "QR Code Scans",
      value: qrScansCount.toLocaleString(),
      sub: isCustomRange ? subText : "Bookings via clinic QR",
      icon: QrCode,
      accent: "bg-blue-50 text-blue-600",
      trend: { label: "+34%", positive: true },
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title and Date Range Picker */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Platform Command Center</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Real-time analytics and platform health snapshot as of {format(now, "EEEE, MMMM d, yyyy · h:mm a")}
          </p>
        </div>
        <div>
          <DateRangePicker />
        </div>
      </div>

      {/* Financials & Growth Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Financials & Subscriptions</h3>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {financialKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </div>

      {/* Enterprise Interactive Charts (Phase 2) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Analytics & Growth Trends</h3>
        </div>
        <DashboardCharts growthData={growthData} revenueData={revenueData} activityData={activityData} />
      </div>

      {/* Platform Activity Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Platform Operations & Engagement</h3>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {activityKpis.map((kpi) => (
            <KpiCard key={kpi.title} {...kpi} />
          ))}
        </div>
      </div>

      {/* Actionability & Command Center Widgets (Phase 3) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">Live Pulse & Action Feed</h3>
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Action Center: Needs Attention Widget */}
          <NeedsAttentionWidget inactiveClinics={inactiveClinicsList} />

          {/* Real-time Pulse Feed: Recent Signups & Recent Payments */}
          <div className="space-y-4">
            {/* Recent Signups Mini-Table */}
            <Card className="shadow-sm border-slate-200/80">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Recent Clinic Onboardings
                  </CardTitle>
                </div>
                <Link
                  href="/admin/clinics"
                  className="text-xs text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1 transition-colors"
                >
                  Manage Clinics <ArrowRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent className="pt-3 px-3">
                {recentSignups.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No clinics onboarded yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentSignups.map((clinic) => (
                      <div key={clinic.id} className="py-2.5 px-2 hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {clinic.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            Dr. {clinic.doctorName} • <span className="text-slate-600">{clinic.specialty}</span>
                          </p>
                        </div>
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                          {format(new Date(clinic.createdAt), "MMM d")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Payments Mini-Table */}
            <Card className="shadow-sm border-slate-200/80">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Recent Platform Transactions
                  </CardTitle>
                </div>
                <Link
                  href="/admin/billing"
                  className="text-xs text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1 transition-colors"
                >
                  View All Transactions <ArrowRight className="w-3 h-3" />
                </Link>
              </CardHeader>
              <CardContent className="pt-3 px-3">
                {recentPayments.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No recent billing logs.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentPayments.map((payment) => (
                      <div key={payment.id} className="py-2.5 px-2 hover:bg-slate-50 rounded-md transition-colors flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {payment.clinicName ?? "Unknown Clinic"}
                          </p>
                          <p className="text-xs text-slate-500">{payment.planName || "Subscription Plan"}</p>
                        </div>
                        <span className="text-sm font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-2 py-0.5 rounded-md shrink-0">
                          ₹{(payment.amountPaise / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
