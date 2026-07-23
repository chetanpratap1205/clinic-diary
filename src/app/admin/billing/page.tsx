import { db } from "@/db";
import { paymentLogs, clinics, subscriptions } from "@/db/schema";
import { desc, eq, sum, count, gte, lt, and, sql } from "drizzle-orm";
import { format, subMonths, startOfMonth } from "date-fns";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Billing | Doctor Diary Admin" };

export default async function BillingPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;
  const PAGE_SIZE = 50;
  const offset = (page - 1) * PAGE_SIZE;

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));

  // ── Revenue KPIs ───────────────────────────────────────────────────────────
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

  // ── Plan breakdown ─────────────────────────────────────────────────────────
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

  // ── Recent payments ledger ─────────────────────────────────────────────────
  const [totalPaymentsResult] = await db.select({ count: count() }).from(paymentLogs);
  const totalCount = totalPaymentsResult.count;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const recentPayments = await db
    .select({
      id: paymentLogs.id,
      amountPaise: paymentLogs.amountPaise,
      status: paymentLogs.status,
      paidAt: paymentLogs.paidAt,
      planName: paymentLogs.planName,
      planId: paymentLogs.planId,
      razorpayOrderId: paymentLogs.razorpayOrderId,
      clinicName: clinics.name,
    })
    .from(paymentLogs)
    .leftJoin(clinics, eq(paymentLogs.clinicId, clinics.id))
    .orderBy(desc(paymentLogs.paidAt))
    .limit(PAGE_SIZE)
    .offset(offset);

  const planColors: Record<string, string> = {
    monthly: "bg-sky-50 text-sky-700 border-sky-200",
    quarterly: "bg-violet-50 text-violet-700 border-violet-200",
    yearly: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Billing & Revenue
        </h2>
        <p className="text-slate-500 mt-1 text-sm">
          Platform-wide revenue overview and payment ledger.
        </p>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-slate-900">
                ₹{thisMonth.toLocaleString("en-IN")}
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-teal-600" />
              </div>
            </div>
            {monthChange !== null && (
              <div
                className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                  monthChange >= 0 ? "text-emerald-600" : "text-red-500"
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Last Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-slate-900">
                ₹{lastMonth.toLocaleString("en-IN")}
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-slate-500" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {format(lastMonthStart, "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              All-Time Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-slate-900">
                ₹{allTime.toLocaleString("en-IN")}
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Total collected ever</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Active Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-slate-900">
                {activeSubsResult.value}
              </div>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Currently paying clinics</p>
          </CardContent>
        </Card>
      </div>

      {/* Plan Breakdown */}
      {planBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Revenue by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
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
                      <span className="text-xs text-slate-400 font-semibold">
                        {plan.payments} payments
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
                    <p className="text-xs text-slate-400 mt-1">
                      {share.toFixed(1)}% of all-time revenue
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Ledger */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Payment Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto min-w-full">
          <div className="min-w-[700px]">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="whitespace-nowrap">Date</TableHead>
                <TableHead className="whitespace-nowrap">Clinic</TableHead>
                <TableHead className="whitespace-nowrap hidden sm:table-cell">Plan</TableHead>
                <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="hidden md:table-cell whitespace-nowrap">Order ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-400 text-sm">
                    No payment records found.
                  </TableCell>
                </TableRow>
              ) : (
                recentPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-slate-50/50">
                    <TableCell className="whitespace-nowrap text-sm text-slate-600">
                      {format(new Date(payment.paidAt), "MMM d, yyyy")}
                      <span className="block text-xs text-slate-400">
                        {format(new Date(payment.paidAt), "h:mm a")}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-sm text-slate-900 min-w-[150px] truncate">
                      {payment.clinicName ?? "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={planColors[payment.planId] ?? "bg-slate-50 text-slate-600"}
                      >
                        {payment.planName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-700 text-sm whitespace-nowrap">
                      ₹{(payment.amountPaise / 100).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          payment.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-600"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-xs text-slate-400 max-w-[140px] truncate">
                      {payment.razorpayOrderId}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
              <p className="text-sm text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} payments
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/billing?page=${Math.max(1, page - 1)}`}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all ${page === 1 ? 'pointer-events-none opacity-40' : ''}`}
                  aria-disabled={page === 1}
                  tabIndex={page === 1 ? -1 : undefined}
                >
                  Previous
                </Link>
                <span className="px-3 py-1.5 text-sm text-slate-500">
                  {page} / {totalPages}
                </span>
                <Link
                  href={`/admin/billing?page=${Math.min(totalPages, page + 1)}`}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all ${page === totalPages ? 'pointer-events-none opacity-40' : ''}`}
                  aria-disabled={page === totalPages}
                  tabIndex={page === totalPages ? -1 : undefined}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
