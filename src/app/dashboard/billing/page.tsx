import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillingOverview } from "@/components/billing/BillingOverview";
import { BillingHistory } from "@/components/billing/BillingHistory";
import { PricingCards } from "@/components/billing/PricingCards";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Billing & Subscriptions - Doctor Diary",
  description: "Manage your clinic subscription and billing.",
};

export default function BillingPage() {
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
          <BillingOverview />
        </TabsContent>
        
        <TabsContent value="plans" className="outline-none">
          <div className="py-6">
            <PricingCards />
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="outline-none">
          <div className="py-4">
            <BillingHistory />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
