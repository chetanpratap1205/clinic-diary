import { db } from "@/db";
import { paymentLogs, clinics, subscriptions } from "@/db/schema";
import { desc, eq, sum, count, gte, lt, and, or, ilike, sql } from "drizzle-orm";
import { format, subMonths, startOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import { BillingTable, type PaymentRow } from "./_components/billing-table";
import { ExportBillingButton } from "./_components/export-billing-button";
import { RecordOfflinePaymentModal } from "./_components/record-offline-payment-modal";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing & Payment Ledger | Admin Console" };

export default async function BillingPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const statusFilter = typeof searchParams?.status === "string" ? searchParams.status : "all";

  const PAGE_SIZE = 50;
  const offset = (page - 1) * PAGE_SIZE;

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));

  // Dynamic condition building
  let condition = undefined;

  if (search) {
    condition = or(
      ilike(clinics.name, `%${search}%`),
      ilike(paymentLogs.planName, `%${search}%`),
      ilike(paymentLogs.razorpayOrderId, `%${search}%`),
      ilike(paymentLogs.razorpayPaymentId, `%${search}%`)
    );
  }

  if (statusFilter && statusFilter !== "all") {
    condition = condition
      ? and(condition, eq(paymentLogs.status, statusFilter))
      : eq(paymentLogs.status, statusFilter);
  }

  // 1. Revenue KPIs
  const [
    [thisMonthResult],
    [lastMonthResult],
    [allTimeResult],
    [activeSubsResult],
  ] = await Promise.all([
    db.select({ value: sum(paymentLogs.amountPaise) }).from(paymentLogs)
      .where(and(gte(paymentLogs.paidAt, thisMonthStart), eq(paymentLogs.status, "paid"))),
    db.select({ value: sum(paymentLogs.amountPaise) }).from(paymentLogs)
      .where(and(
        gte(paymentLogs.paidAt, lastMonthStart),
        lt(paymentLogs.paidAt, thisMonthStart),
        eq(paymentLogs.status, "paid")
      )),
    db.select({ value: sum(paymentLogs.amountPaise) }).from(paymentLogs)
      .where(eq(paymentLogs.status, "paid")),
    db.select({ value: count() }).from(subscriptions).where(eq(subscriptions.status, "active")),
  ]);

  const thisMonth = (Number(thisMonthResult?.value) || 0) / 100;
  const lastMonth = (Number(lastMonthResult?.value) || 0) / 100;
  const allTime = (Number(allTimeResult?.value) || 0) / 100;
  const monthChange = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;

  // 2. Fetch all clinics for offline payment modal
  const allClinics = await db
    .select({
      id: clinics.id,
      name: clinics.name,
      doctorName: clinics.doctorName,
    })
    .from(clinics)
    .orderBy(clinics.name);

  // 3. Plan breakdown
  const planBreakdownResult = await db.execute(sql`
    SELECT
      plan_id         AS "planId",
      plan_name       AS "planName",
      COUNT(*)::int   AS payments,
      SUM(amount_paise)::bigint AS "totalPaise"
    FROM payment_logs
    WHERE status = 'paid'
    GROUP BY plan_id, plan_name
    ORDER BY "totalPaise" DESC
  `);
  const planBreakdown = planBreakdownResult.rows as Array<{
    planId: string;
    planName: string;
    payments: number;
    totalPaise: string;
  }>;

  // 4. Status counts for tabs
  const countsResult = await db.execute(sql`
    SELECT
      COUNT(*)::int as all,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END)::int as paid,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int as pending,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)::int as failed
    FROM payment_logs
  `);
  const counts = countsResult.rows[0] as { all: number; paid: number; pending: number; failed: number };

  // 5. Paginated payments query
  const recentPayments = await db
    .select({
      id: paymentLogs.id,
      amountPaise: paymentLogs.amountPaise,
      status: paymentLogs.status,
      paidAt: paymentLogs.paidAt,
      planName: paymentLogs.planName,
      planId: paymentLogs.planId,
      razorpayOrderId: paymentLogs.razorpayOrderId,
      razorpayPaymentId: paymentLogs.razorpayPaymentId,
      clinicName: clinics.name,
    })
    .from(paymentLogs)
    .leftJoin(clinics, eq(paymentLogs.clinicId, clinics.id))
    .where(condition)
    .orderBy(desc(paymentLogs.paidAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  // 6. Total count for pagination
  const totalCountResult = await db
    .select({ count: count() })
    .from(paymentLogs)
    .leftJoin(clinics, eq(paymentLogs.clinicId, clinics.id))
    .where(condition);
  const totalCount = totalCountResult[0]?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const planColors: Record<string, string> = {
    monthly: "bg-sky-50 text-sky-700 border-sky-200",
    quarterly: "bg-violet-50 text-violet-700 border-violet-200",
    yearly: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Quick Action Suite */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Payment Ledger</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Platform-wide revenue tracking, offline cash ingestion, and transaction audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <RecordOfflinePaymentModal clinics={allClinics} />
          <ExportBillingButton payments={recentPayments as PaymentRow[]} />
        </div>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-black text-slate-900">
                ₹{thisMonth.toLocaleString("en-IN")}
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-teal-600" />
              </div>
            </div>
            {monthChange !== null && (
              <div
                className={`flex items-center gap-1 mt-2 text-xs font-semibold ${
                  monthChange >= 0 ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {monthChange >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {Math.abs(monthChange).toFixed(1)}% vs last month
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Last Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-black text-slate-900">
                ₹{lastMonth.toLocaleString("en-IN")}
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">
              {format(lastMonthStart, "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              All-Time Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-black text-slate-900">
                ₹{allTime.toLocaleString("en-IN")}
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">Total collected ever</p>
          </CardContent>
        </Card>

        <Card className="shadow-xs border-slate-200/80">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-black text-slate-900">
                {activeSubsResult.value}
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-2">Currently paying clinics</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Revenue Distribution Cards */}
      {planBreakdown.length > 0 && (
        <Card className="shadow-xs border-slate-200/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-800">
              Revenue Breakdown by Subscription Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
              {planBreakdown.map((plan) => {
                const revenue = Number(plan.totalPaise) / 100;
                const share = allTime > 0 ? (revenue / allTime) * 100 : 0;
                return (
                  <div
                    key={plan.planId}
                    className="bg-slate-50 rounded-xl p-4 border border-slate-100"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="outline"
                        className={planColors[plan.planId] ?? "bg-slate-50 text-slate-600"}
                      >
                        {plan.planName}
                      </Badge>
                      <span className="text-xs text-slate-500 font-semibold">
                        {plan.payments} payment(s)
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      ₹{revenue.toLocaleString("en-IN")}
                    </p>
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${share.toFixed(1)}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      {share.toFixed(1)}% of all-time platform revenue
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Searchable, Filterable Payment Ledger Table */}
      <BillingTable
        payments={recentPayments as PaymentRow[]}
        totalPages={totalPages}
        totalCount={totalCount}
        currentPage={page}
        currentSearch={search}
        currentStatus={statusFilter}
        counts={{
          all: counts.all || 0,
          paid: counts.paid || 0,
          pending: counts.pending || 0,
          failed: counts.failed || 0,
        }}
      />
    </div>
  );
}
