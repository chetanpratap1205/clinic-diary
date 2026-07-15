import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillingOverview } from "@/components/billing/BillingOverview";
import { BillingHistory } from "@/components/billing/BillingHistory";
import { PricingCards } from "@/components/billing/PricingCards";
import { ShieldCheck } from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { subscriptions, paymentLogs, appointments } from "@/db/schema";
import { eq, and, gte, lte, count, desc } from "drizzle-orm";
import { format, startOfMonth, endOfMonth } from "date-fns";

export const metadata = {
  title: "Billing & Subscriptions - Doctor Diary",
  description: "Manage your clinic subscription and billing.",
};

export default async function BillingPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  // Fetch all billing data in parallel
  const [activeSubResult, paymentHistory] = await Promise.all([
    db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.clinicId, authUser.clinicId))
      .limit(1),
    db
      .select()
      .from(paymentLogs)
      .where(eq(paymentLogs.clinicId, authUser.clinicId))
      .orderBy(desc(paymentLogs.paidAt)),
  ]);

  const activeSub = activeSubResult[0] || null;

  // Determine current billing cycle for usage metrics
  const cycleStart = activeSub?.currentPeriodStart || startOfMonth(new Date());
  const cycleEnd = activeSub?.currentPeriodEnd || endOfMonth(new Date());

  // Count appointments in current cycle
  const appointmentsResult = await db
    .select({ count: count() })
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, authUser.clinicId),
        gte(appointments.appointmentDate, format(cycleStart, "yyyy-MM-dd")),
        lte(appointments.appointmentDate, format(cycleEnd, "yyyy-MM-dd"))
      )
    );

  const appointmentCount = appointmentsResult[0]?.count || 0;

  // Calculate total amount paid in INR (from paise)
  const totalPaid = paymentHistory.reduce(
    (acc, log) => acc + log.amountPaise / 100,
    0
  );

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Billing & Subscriptions</h2>
          <p className="text-muted-foreground mt-1 text-lg">
            Manage your plan, limits, and view past invoices.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          <span>Enterprise-grade security</span>
        </div>
      </div>

      {/* CFO / Finance Head Note */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-slate-600 shadow-inner z-10">
          <ShieldCheck className="w-8 h-8 text-teal-400/50" />
        </div>
        <div className="flex-1 text-center sm:text-left z-10">
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-2">A Note From Finance</h3>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic mb-4">
            "We don't view Doctor Diary as a cost for your clinic, but as a growth investment. My team ensures our pricing model is fully transparent with zero hidden fees. If you aren't seeing a clear ROI in your first month, we want to know about it."
          </p>
          <div className="font-semibold text-white">Finance Leadership Team</div>
          <div className="text-slate-400 text-xs uppercase tracking-wide">Doctor Diary</div>
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-200/50 p-1 shadow-inner h-auto rounded-xl inline-flex w-full sm:w-auto overflow-x-auto no-scrollbar">
          <TabsTrigger value="overview" className="text-base px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium transition-all whitespace-nowrap">Overview</TabsTrigger>
          <TabsTrigger value="plans" className="text-base px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium transition-all whitespace-nowrap">Upgrade Plan</TabsTrigger>
          <TabsTrigger value="history" className="text-base px-6 py-2.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm font-medium transition-all whitespace-nowrap">Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 outline-none">
          <BillingOverview activeSub={activeSub} appointmentCount={appointmentCount} totalPaid={totalPaid} />
        </TabsContent>
        
        <TabsContent value="plans" className="outline-none">
          <div className="py-6">
            <PricingCards activePlanId={activeSub?.status === "active" ? activeSub.planId : undefined} adminName={authUser.name} />
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="outline-none">
          <div className="py-4">
            <BillingHistory paymentHistory={paymentHistory} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
