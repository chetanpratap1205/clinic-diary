import { db } from "@/db";
import { marketingCampaigns } from "@/db/schema";
import { desc } from "drizzle-orm";
import { MarketingClient } from "./marketing-client";

export const dynamic = "force-dynamic";

export default async function MarketingAdminPage() {
  const campaigns = await db
    .select()
    .from(marketingCampaigns)
    .orderBy(desc(marketingCampaigns.createdAt));

  // Get total stats
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalSignups = campaigns.reduce((sum, c) => sum + c.signups, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Marketing Tracking</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Generate tracking URLs and QR codes to measure the effectiveness of your marketing campaigns.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-900">{campaigns.length}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Campaigns</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{totalClicks.toLocaleString()}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Scans/Clicks</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{totalSignups.toLocaleString()}</p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Total Signups</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-2xl font-bold text-purple-600">
            {totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(1) : "0"}%
          </p>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Conversion Rate</p>
        </div>
      </div>

      <MarketingClient campaigns={campaigns} />
    </div>
  );
}
