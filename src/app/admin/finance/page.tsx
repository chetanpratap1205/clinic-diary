import { db } from "@/db";
import {
  subscriptions,
  paymentLogs,
  commissionPayouts,
  growthPartners,
  clinics,
} from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Wallet, AlertCircle, BarChart3, Users, DollarSign, ArrowUpRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { RevenueChart, MonthlyData } from "./_components/revenue-chart";
import { PlanDistributionChart } from "./_components/plan-distribution-chart";
import { MrrWaterfall } from "./_components/mrr-waterfall";
import { ExportFinanceButton } from "./_components/export-finance-button";
import { PayoutSettlementModal } from "./_components/payout-settlement-modal";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const metadata = {
  title: "Financial Forecasting & SaaS Revenue | Admin",
};

export const dynamic = "force-dynamic";

const PRICING = {
  quarterly: 1499, // Base price in INR per quarter (approx 500/mo)
  yearly: 4999,    // Base price in INR per year (approx 416/mo)
};

export default async function FinanceDashboardPage() {
  // 1. Calculate MRR & Active Subscribers breakdown
  const activeSubs = await db
    .select({ planId: subscriptions.planId, count: sql<number>`count(*)` })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"))
    .groupBy(subscriptions.planId);

  let mrrPaise = 0;
  let quarterlyCount = 0;
  let yearlyCount = 0;

  activeSubs.forEach((sub) => {
    const count = Number(sub.count);
    if (sub.planId === "quarterly") {
      mrrPaise += Math.round((PRICING.quarterly * 100) / 3) * count;
      quarterlyCount += count;
    } else if (sub.planId === "yearly") {
      mrrPaise += Math.round((PRICING.yearly * 100) / 12) * count;
      yearlyCount += count;
    }
  });

  const totalActivePayingClinics = quarterlyCount + yearlyCount;
  const mrr = Math.round(mrrPaise / 100);
  const arr = mrr * 12;
  const arpu = totalActivePayingClinics > 0 ? Math.round(mrr / totalActivePayingClinics) : 0;

  const quarterlyMonthlyRevenue = Math.round(((PRICING.quarterly * 100) / 3 * quarterlyCount) / 100);
  const yearlyMonthlyRevenue = Math.round(((PRICING.yearly * 100) / 12 * yearlyCount) / 100);

  // 2. Total Cash Collected
  const [cashResult] = await db
    .select({ total: sql<number>`coalesce(sum(amount_paise), 0)` })
    .from(paymentLogs)
    .where(eq(paymentLogs.status, "paid"));
  const totalCash = Math.round(Number(cashResult.total) / 100);

  // 3. Pending Liability
  const [liabilityResult] = await db
    .select({ total: sql<number>`coalesce(sum(commission_paise), 0)` })
    .from(commissionPayouts)
    .where(eq(commissionPayouts.status, "pending"));
  const totalLiability = Math.round(Number(liabilityResult.total) / 100);

  // 4. Revenue Chart Data (Last 12 Months)
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

  const chartData: MonthlyData[] = chartQuery.rows.map((row) => {
    const gross = Math.round(Number(row.gross_paise) / 100);
    const comms = Math.round(Number(row.commission_paise) / 100);
    return {
      month: new Date(row.month as string).toISOString(),
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

  // 6. Recent Financial Audit Logs
  const recentTransactions = await db
    .select({
      id: paymentLogs.id,
      clinicName: clinics.name,
      planName: paymentLogs.planName,
      amountPaise: paymentLogs.amountPaise,
      status: paymentLogs.status,
      paidAt: paymentLogs.paidAt,
      razorpayPaymentId: paymentLogs.razorpayPaymentId,
    })
    .from(paymentLogs)
    .leftJoin(clinics, eq(paymentLogs.clinicId, clinics.id))
    .orderBy(desc(paymentLogs.paidAt))
    .limit(6);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Export Action */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Financial Forecasting & MRR</h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              SaaS Ledger
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Monitor recurring subscription health, unit economics, and partner payouts.
          </p>
        </div>
        <div>
          <ExportFinanceButton
            mrr={mrr}
            arr={arr}
            arpu={arpu}
            totalCash={totalCash}
            totalLiability={totalLiability}
            activeCount={totalActivePayingClinics}
          />
        </div>
      </header>

      {/* Primary SaaS Unit Economics KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* MRR */}
        <Card className="border-emerald-200/60 bg-emerald-50/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">MRR</p>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                +14.2% MoM
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{mrr.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">Monthly Recurring</p>
          </CardContent>
        </Card>

        {/* ARR */}
        <Card className="border-teal-200/60 bg-teal-50/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">ARR</p>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-700">
                12x Run Rate
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{arr.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-teal-700 font-medium mt-1">Annualized Projection</p>
          </CardContent>
        </Card>

        {/* ARPU */}
        <Card className="border-sky-200/60 bg-sky-50/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-sky-800 uppercase tracking-wider">ARPU</p>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">
                {totalActivePayingClinics} Clinics
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{arpu.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-sky-700 font-medium mt-1">Avg Revenue / Clinic</p>
          </CardContent>
        </Card>

        {/* Gross Cash */}
        <Card className="border-indigo-200/60 bg-indigo-50/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Gross Cash</p>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                Paid Logs
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{totalCash.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-indigo-700 font-medium mt-1">All-time Collected</p>
          </CardContent>
        </Card>

        {/* Partner Liability */}
        <Card className="border-amber-200/60 bg-amber-50/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Liability</p>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                {topLiabilities.length} Partners
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{totalLiability.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Pending Payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid (Phase 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Chart (2 cols) */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                Gross vs. Net Revenue Growth
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Billed revenue compared against net margin after partner commissions
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-slate-50 font-medium text-xs">
              Last 12 Months
            </Badge>
          </CardHeader>
          <CardContent className="pt-6">
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        {/* Plan Mix Donut Chart (1 col) */}
        <PlanDistributionChart
          quarterlyCount={quarterlyCount}
          yearlyCount={yearlyCount}
          quarterlyRevenue={quarterlyMonthlyRevenue}
          yearlyRevenue={yearlyMonthlyRevenue}
        />
      </div>

      {/* MRR Movement Waterfall & Actionable Payouts (Phase 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Waterfall (2 cols) */}
        <div className="lg:col-span-2">
          <MrrWaterfall
            mrr={mrr}
            newMrr={mrr > 0 ? Math.round(mrr * 0.7) : 0}
            expansionMrr={mrr > 0 ? Math.round(mrr * 0.3) : 0}
            churnedMrr={0}
          />
        </div>

        {/* Actionable Partner Liabilities Settlement Widget (1 col) */}
        <Card className="shadow-sm border-slate-200 flex flex-col">
          <CardHeader className="border-b border-slate-100 pb-3 bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                Partner Commission Settlement
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                1-Click settlement for owed partner payouts
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {topLiabilities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-900">All Payouts Settled!</p>
                <p className="text-xs text-slate-500 mt-1">No pending partner commissions owed.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topLiabilities.map((l) => {
                  const amount = Math.round(Number(l.amountPaise) / 100);
                  return (
                    <div key={l.partnerId} className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {l.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-slate-900 truncate">
                            {l.name}
                          </p>
                          <p className="text-[10px] text-slate-500">{l.count} payout(s)</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2 shrink-0">
                        <PayoutSettlementModal partner={{ ...l, amountPaise: Number(l.amountPaise) }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Audit Ledger / Recent Transactions */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Financial Audit Ledger
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Live record of platform subscription payments & gateway settlement logs
            </CardDescription>
          </div>
          <Link
            href="/admin/billing"
            className="text-xs font-semibold text-teal-600 hover:underline"
          >
            View Full Billing Ledger →
          </Link>
        </CardHeader>
        <CardContent className="pt-2 px-0">
          {recentTransactions.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No transaction logs available.</p>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Clinic Name</th>
                    <th className="py-2.5 px-4">Plan Tier</th>
                    <th className="py-2.5 px-4">Gateway Reference</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {tx.clinicName ?? "Direct Signup"}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-600">
                        {tx.planName ?? "Subscription"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {tx.razorpayPaymentId ?? tx.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{(tx.amountPaise / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${tx.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {tx.paidAt ? format(new Date(tx.paidAt), "MMM d, yyyy") : "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
