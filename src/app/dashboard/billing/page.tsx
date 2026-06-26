import { PricingCards } from "@/components/billing/PricingCards";

export const metadata = {
  title: "Billing & Subscriptions - Doctor Diary",
  description: "Manage your clinic subscription and billing.",
};

export default function BillingPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Upgrade Your Plan</h2>
      </div>
      
      <div className="py-8">
        <PricingCards />
      </div>
    </div>
  );
}
