import { db } from "@/db";
import {
  clinics,
  patients,
  appointments,
  subscriptions,
  paymentLogs,
  reviews,
} from "@/db/schema";
import { count, sum, eq, gte, desc, sql } from "drizzle-orm";
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
} from "lucide-react";
import { format, subMonths } from "date-fns";
import Link from "next/link";
import { DashboardCharts } from "./_components/dashboard-charts";

export const dynamic = "force-dynamic";

function KpiCard({
  title,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className="text-xs text-slate-500 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = subMonths(startOfThisMonth, 1);
  const today = format(now, "yyyy-MM-dd");

  // ── KPI queries ────────────────────────────────────────────────────────────
  const [
    [totalClinics],
    [totalPatients],
    [totalAppointments],
    [activeSubscriptions],
    [totalReviewsResult],
    [monthlyRevenueResult],
    [allTimeRevenueResult],
    [todayApptsResult],
  ] = await Promise.all([
    db.select({ value: count() }).from(clinics),
    db.select({ value: count() }).from(patients),
    db.select({ value: count() }).from(appointments),
    db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.status, "active")),
    db.select({ value: count() }).from(reviews),
    db.select({ value: sum(paymentLogs.amountPaise) }).from(paymentLogs)
      .where(gte(paymentLogs.paidAt, startOfThisMonth)),
    db.select({ value: sum(paymentLogs.amountPaise) }).from(paymentLogs),
    db.select({ value: count() }).from(appointments)
      .where(eq(appointments.appointmentDate, today)),
  ]);

  const monthlyRevenue = (Number(monthlyRevenueResult?.value) || 0) / 100;
  const allTimeRevenue = (Number(allTimeRevenueResult?.value) || 0) / 100;

  // ── Chart data ─────────────────────────────────────────────────────────────
  const sixMonthsAgo = subMonths(startOfThisMonth, 5);

  const [growthResult, revenueResult] = await Promise.all([
    db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at AT TIME ZONE 'UTC'), 'Mon ''YY') AS month,
        COUNT(*)::int AS clinics,
        DATE_TRUNC('month', created_at AT TIME ZONE 'UTC') AS sort_key
      FROM clinics
      WHERE created_at >= ${sixMonthsAgo.toISOString()}
      GROUP BY DATE_TRUNC('month', created_at AT TIME ZONE 'UTC')
      ORDER BY sort_key ASC
    `),
    db.execute(sql`
      SELECT
        TO_CHAR(DATE_TRUNC('month', paid_at AT TIME ZONE 'UTC'), 'Mon ''YY') AS month,
        (SUM(amount_paise) / 100)::int AS revenue,
        DATE_TRUNC('month', paid_at AT TIME ZONE 'UTC') AS sort_key
      FROM payment_logs
      WHERE paid_at >= ${sixMonthsAgo.toISOString()} AND status = 'paid'
      GROUP BY DATE_TRUNC('month', paid_at AT TIME ZONE 'UTC')
      ORDER BY sort_key ASC
    `),
  ]);

  const growthData = (growthResult.rows as Array<{ month: string; clinics: number }>).map(
    (r) => ({ month: r.month, clinics: Number(r.clinics) })
  );
  const revenueData = (revenueResult.rows as Array<{ month: string; revenue: number }>).map(
    (r) => ({ month: r.month, revenue: Number(r.revenue) })
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

  const kpis = [
    {
      title: "Total Clinics",
      value: totalClinics.value.toLocaleString(),
      sub: "Registered on platform",
      icon: Building2,
      accent: "bg-teal-50 text-teal-600",
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions.value.toLocaleString(),
      sub: `of ${totalClinics.value} total clinics`,
      icon: TrendingUp,
      accent: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Total Patients",
      value: totalPatients.value.toLocaleString(),
      sub: "Across all clinics",
      icon: Users,
      accent: "bg-sky-50 text-sky-600",
    },
    {
      title: "All-Time Appointments",
      value: totalAppointments.value.toLocaleString(),
      sub: `${todayApptsResult.value} today`,
      icon: CalendarCheck,
      accent: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "Revenue This Month",
      value: `₹${monthlyRevenue.toLocaleString("en-IN")}`,
      sub: "Current calendar month",
      icon: IndianRupee,
      accent: "bg-amber-50 text-amber-600",
    },
    {
      title: "Revenue All-Time",
      value: `₹${allTimeRevenue.toLocaleString("en-IN")}`,
      sub: "Total collected on platform",
      icon: IndianRupee,
      accent: "bg-rose-50 text-rose-600",
    },
    {
      title: "Today's Appointments",
      value: todayApptsResult.value.toLocaleString(),
      sub: format(now, "EEEE, MMM d"),
      icon: CalendarDays,
      accent: "bg-violet-50 text-violet-600",
    },
    {
      title: "Patient Reviews",
      value: totalReviewsResult.value.toLocaleString(),
      sub: "Submitted platform-wide",
      icon: Star,
      accent: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Platform snapshot as of {format(now, "EEEE, MMMM d, yyyy · h:mm a")}
        </p>
      </div>

      {/* KPI Grid — 4 across on desktop */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts growthData={growthData} revenueData={revenueData} />

      {/* Recent feeds */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Signups */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Recent Signups
            </CardTitle>
            <Link
              href="/admin/clinics"
              className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentSignups.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No clinics yet.</p>
            ) : (
              <div className="space-y-3">
                {recentSignups.map((clinic) => (
                  <div key={clinic.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {clinic.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {clinic.doctorName} · {clinic.specialty}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
                      {format(new Date(clinic.createdAt), "MMM d")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Recent Payments
            </CardTitle>
            <Link
              href="/admin/billing"
              className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No payments yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <IndianRupee className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {payment.clinicName ?? "Unknown Clinic"}
                      </p>
                      <p className="text-xs text-slate-500">{payment.planName}</p>
                    </div>
                    <span className="text-sm font-bold text-emerald-700 flex-shrink-0">
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
  );
}
