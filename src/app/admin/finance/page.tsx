import { db } from "@/db";
import {
  subscriptions,
  paymentLogs,
  commissionPayouts,
  growthPartners,
} from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subMonths } from "date-fns";
import { TrendingUp, Wallet, AlertCircle, BarChart3, Users, Building2 } from "lucide-react";
import { RevenueChart, MonthlyData } from "./_components/revenue-chart";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Financial Forecasting | Admin",
};

export const dynamic = "force-dynamic";

export default async function FinanceDashboardPage() {
  // 1. Calculate MRR & ARR from active subscriptions
  const activeSubs = await db
    .select({ planId: subscriptions.planId, count: sql<number>`count(*)` })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))
    .groupBy(subscriptions.planId);

  let mrrPaise = 0;
  // Based on current pricing logic: Quarterly is 1499, Annual is 4999 (plus GST, but we calculate MRR on base)
  activeSubs.forEach((sub) => {
    const count = Number(sub.count);
    if (sub.planId === "quarterly") {
      mrrPaise += Math.round((1499 * 100) / 3) * count;
    } else if (sub.planId === "yearly") {
      mrrPaise += Math.round((4999 * 100) / 12) * count;
    }
  });

  const mrr = Math.round(mrrPaise / 100);
  const arr = mrr * 12;

  // 2. Calculate Total Cash Collected
  const [cashResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount_paise), 0)` })
    .from(paymentLogs)
    .where(eq(paymentLogs.status, "paid"));
  const totalCash = Math.round(Number(cashResult.total) / 100);

  // 3. Calculate Pending Liability
  const [liabilityResult] = await db
    .select({ total: sql<number>`coalesce(sum(commission_paise), 0)` })
    .from(commissionPayouts)
    .where(eq(commissionPayouts.status, "pending"));
  const totalLiability = Math.round(Number(liabilityResult.total) / 100);

  // 4. Generate Chart Data (Last 12 Months)
  // We need to group payments by month and sum amounts, then subtract commissions for that month to get net.
  const chartQuery = await db.execute(sql`
    WITH months AS (
      SELECT generate_series(
        date_trunc('month', CURRENT_DATE - INTERVAL '11 months'),
        date_trunc('month', CURRENT_DATE),
        '1 month'
      ) AS month
    ),
    payments AS (
      SELECT date_trunc('month', paid_at) AS month, sum(amount_paise) AS gross
      FROM payment_logs
      WHERE status = 'paid'
      GROUP BY 1
    ),
    commissions AS (
      SELECT date_trunc('month', created_at) AS month, sum(commission_paise) AS payouts
      FROM commission_payouts
      GROUP BY 1
    )
    SELECT 
      m.month,
      coalesce(p.gross, 0) AS gross_paise,
      coalesce(c.payouts, 0) AS commission_paise
    FROM months m
    LEFT JOIN payments p ON m.month = p.month
    LEFT JOIN commissions c ON m.month = c.month
    ORDER BY m.month ASC
  `);

  const chartData: MonthlyData[] = chartQuery.rows.map((row: any) => {
    const gross = Math.round(Number(row.gross_paise) / 100);
    const comms = Math.round(Number(row.commission_paise) / 100);
    return {
      month: new Date(row.month).toISOString(),
      grossRevenue: gross,
      commissions: comms,
      netRevenue: gross - comms,
    };
  });

  // 5. Top Commission Liabilities (Partners owed money)
  const topLiabilities = await db
    .select({
      partnerId: growthPartners.id,
      name: growthPartners.name,
      amountPaise: sql<number>`sum(${commissionPayouts.commissionPaise})`,
      count: sql<number>`count(*)`,
    })
    .from(commissionPayouts)
    .innerJoin(growthPartners, eq(growthPartners.id, commissionPayouts.partnerId))
    .where(eq(commissionPayouts.status, "pending"))
    .groupBy(growthPartners.id, growthPartners.name)
    .orderBy(sql`sum(${commissionPayouts.commissionPaise}) DESC`)
    .limit(10);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financial Forecasting</h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor your recurring revenue, cash flow, and partner payouts.
        </p>
      </header>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-emerald-800">MRR</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">₹{mrr.toLocaleString("en-IN")}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Monthly Recurring Revenue</p>
          </CardContent>
        </Card>

        <Card className="border-teal-200 bg-teal-50/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-teal-800">ARR</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">₹{arr.toLocaleString("en-IN")}</p>
            <p className="text-xs text-teal-600 font-medium mt-1">Annual Run Rate</p>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-indigo-800">Gross Cash Collected</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">₹{totalCash.toLocaleString("en-IN")}</p>
            <p className="text-xs text-indigo-600 font-medium mt-1">All-time successful payments</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
              <p className="text-sm font-semibold text-amber-800">Partner Liability</p>
            </div>
            <p className="text-3xl font-bold text-slate-900">₹{totalLiability.toLocaleString("en-IN")}</p>
            <p className="text-xs text-amber-600 font-medium mt-1">Total pending commissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center justify-between">
              Revenue Growth
              <Badge variant="outline" className="bg-slate-50 font-medium">Last 12 Months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        {/* Top Liabilities */}
        <Card className="shadow-sm border-slate-200 flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
            <CardTitle className="text-base font-bold text-slate-800">
              Pending Payouts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {topLiabilities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Wallet className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-900">All caught up!</p>
                <p className="text-xs text-slate-500 mt-1">No pending commissions owed.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topLiabilities.map((l) => {
                  const amount = Math.round(Number(l.amountPaise) / 100);
                  return (
                    <div key={l.partnerId} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {l.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 truncate max-w-[140px]">
                            {l.name}
                          </p>
                          <p className="text-xs text-slate-500">{l.count} pending payout{Number(l.count) !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="font-bold text-sm text-amber-700">₹{amount.toLocaleString("en-IN")}</p>
                        <Link 
                          href={`/admin/partners/${l.partnerId}`}
                          className="text-[10px] font-semibold text-teal-600 hover:underline mt-0.5"
                        >
                          View Partner →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
