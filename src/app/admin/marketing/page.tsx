import { db } from "@/db";
import { marketingCampaigns, marketingClickLogs } from "@/db/schema";
import { desc, gte, sql } from "drizzle-orm";
import { MarketingClient } from "./marketing-client";

export const dynamic = "force-dynamic";

export default async function MarketingAdminPage() {
  const campaigns = await db
    .select()
    .from(marketingCampaigns)
    .orderBy(desc(marketingCampaigns.createdAt));

  // Calculate high-level performance metrics
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalSignups = campaigns.reduce((sum, c) => sum + c.signups, 0);
  const avgConversion = totalClicks > 0 ? ((totalSignups / totalClicks) * 100).toFixed(1) : "0.0";

  // Daily Scan Trend (Last 14 days)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  let scanTrends: { date: string; count: number }[] = [];
  try {
    const rawTrends = await db
      .select({
        date: sql<string>`TO_CHAR(${marketingClickLogs.clickedAt}, 'YYYY-MM-DD')`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(marketingClickLogs)
      .where(gte(marketingClickLogs.clickedAt, fourteenDaysAgo))
      .groupBy(sql`TO_CHAR(${marketingClickLogs.clickedAt}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${marketingClickLogs.clickedAt}, 'YYYY-MM-DD')`);

    scanTrends = rawTrends;
  } catch (e) {
    console.error("Scan trend error:", e);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Marketing & Growth Tracking</h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              PLG Attribution Engine
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Manage physical QR standees, digital links, UTM parameters, and real-time signup conversion metrics.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Campaigns</p>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold">
              {activeCampaigns} Active
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{campaigns.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Scans / Clicks</p>
          <p className="text-3xl font-black text-teal-600 mt-2">{totalClicks.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attributed Signups</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{totalSignups.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conversion Rate</p>
          <p className="text-3xl font-black text-purple-600 mt-2">{avgConversion}%</p>
        </div>
      </div>

      {/* Main Interactive Client Interface */}
      <MarketingClient campaigns={campaigns} scanTrends={scanTrends} />
    </div>
  );
}
