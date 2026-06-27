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
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/50 min-h-screen">
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
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1 shadow-sm h-auto">
          <TabsTrigger value="overview" className="text-base px-6 py-2.5 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-none">Overview</TabsTrigger>
          <TabsTrigger value="plans" className="text-base px-6 py-2.5 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-none">Upgrade Plan</TabsTrigger>
          <TabsTrigger value="history" className="text-base px-6 py-2.5 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-700 data-[state=active]:shadow-none">Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 outline-none">
          <BillingOverview activeSub={activeSub} appointmentCount={appointmentCount} totalPaid={totalPaid} />
        </TabsContent>
        
        <TabsContent value="plans" className="outline-none">
          <div className="py-6">
            <PricingCards activePlanId={activeSub?.status === "active" ? activeSub.planId : undefined} />
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
