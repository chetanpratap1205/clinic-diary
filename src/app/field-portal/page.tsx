import { db } from "@/db";
import {
  doctorLeads,
  leadActivities,
  growthPartners,
  commissionPayouts,
} from "@/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, startOfDay, startOfMonth } from "date-fns";
import { Target, Users, MapPin, Activity, Wallet, Flame, TrendingUp, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "./_components/copy-link-button";

export const metadata = {
  title: "Field Portal | Doctor Diary",
};

export default async function FieldPortalDashboardPage() {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [partner] = await db
    .select()
    .from(growthPartners)
    .where(eq(growthPartners.authUserId, authUser.userId))
    .limit(1);

  if (!partner) return null;

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());

  const [
    totalAssigned,
    todayVisits,
    monthConverted,
    recentLeads,
    hotLeads,
    pendingCommission,
    paidCommission,
    recentPayouts,
    leaderboard,
  ] = await Promise.all([
    // Total Assigned Leads
    db
      .select({ count: sql<number>`count(*)` })
      .from(doctorLeads)
      .where(eq(doctorLeads.assignedTo, partner.id)),

    // Visits logged today
    db
      .select({ count: sql<number>`count(*)` })
      .from(leadActivities)
      .where(
        and(
          eq(leadActivities.partnerId, partner.id),
          eq(leadActivities.type, "visit"),
          gte(leadActivities.createdAt, today)
        )
      ),

    // Conversions this month
    db
      .select({ count: sql<number>`count(*)` })
      .from(doctorLeads)
      .where(
        and(
          eq(doctorLeads.assignedTo, partner.id),
          eq(doctorLeads.status, "converted"),
          gte(doctorLeads.convertedAt, monthStart)
        )
      ),

    // Recent leads assigned to this partner
    db
      .select()
      .from(doctorLeads)
      .where(eq(doctorLeads.assignedTo, partner.id))
      .orderBy(desc(doctorLeads.createdAt))
      .limit(5),

    // Hot leads
    db
      .select()
      .from(doctorLeads)
      .where(
        and(
          eq(doctorLeads.assignedTo, partner.id),
          eq(doctorLeads.priority, "hot"),
          sql`${doctorLeads.status} NOT IN ('converted', 'rejected')`
        )
      )
      .limit(3),

    // Pending commission
    db
      .select({ total: sql<number>`coalesce(sum(commission_paise), 0)` })
      .from(commissionPayouts)
      .where(
        and(
          eq(commissionPayouts.partnerId, partner.id),
          eq(commissionPayouts.status, "pending")
        )
      ),

    // Paid commission
    db
      .select({ total: sql<number>`coalesce(sum(commission_paise), 0)` })
      .from(commissionPayouts)
      .where(
        and(
          eq(commissionPayouts.partnerId, partner.id),
          eq(commissionPayouts.status, "paid")
        )
      ),

    // Recent individual payouts
    db
      .select()
      .from(commissionPayouts)
      .where(eq(commissionPayouts.partnerId, partner.id))
      .orderBy(desc(commissionPayouts.createdAt))
      .limit(5),

    // Leaderboard (all active partners ranked by monthly conversions)
    db
      .select({
        id: growthPartners.id,
        name: growthPartners.name,
        conversions: sql<number>`count(case when ${doctorLeads.status} = 'converted' and ${doctorLeads.convertedAt} >= ${monthStart.toISOString()} then 1 end)`,
      })
      .from(growthPartners)
      .leftJoin(doctorLeads, eq(doctorLeads.assignedTo, growthPartners.id))
      .where(eq(growthPartners.isActive, true))
      .groupBy(growthPartners.id)
      .orderBy(sql`conversions desc`)
      .limit(5),
  ]);

  const assignedCount = Number(totalAssigned[0]?.count || 0);
  const visitsCount = Number(todayVisits[0]?.count || 0);
  const monthConvertedCount = Number(monthConverted[0]?.count || 0);
  const target = partner.targetMonthly ?? 5;
  const progressPct = Math.min(Math.round((monthConvertedCount / target) * 100), 100);
  const pendingRs = Math.round(Number(pendingCommission[0]?.total || 0) / 100);
  const earnedRs = Math.round(Number(paidCommission[0]?.total || 0) / 100);

  const myRank = leaderboard.findIndex((p) => p.id === partner.id) + 1;
  const rankEmoji = myRank === 1 ? "🥇" : myRank === 2 ? "🥈" : myRank === 3 ? "🥉" : `#${myRank}`;

  const statusColors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    contacted: "bg-amber-100 text-amber-700",
    demo_scheduled: "bg-purple-100 text-purple-700",
    converted: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <header className="mb-2 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {partner.name.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {format(new Date(), "EEEE, MMMM d")} · {partner.region || partner.city || "Field Agent"}
          </p>
        </div>
        {partner.referralCode && (
          <CopyLinkButton referralCode={partner.referralCode} />
        )}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50/50">
          <CardHeader className="p-3 sm:p-4 pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider flex justify-between items-center">
              Total Assigned
              <Users className="w-4 h-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-3xl font-bold text-slate-900">{assignedCount}</div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/50">
          <CardHeader className="p-3 sm:p-4 pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider flex justify-between items-center">
              Visits Today
              <MapPin className="w-4 h-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-3xl font-bold text-slate-900">{visitsCount}</div>
          </CardContent>
        </Card>

        <Card className="border-teal-100 shadow-sm bg-gradient-to-br from-white to-teal-50/50">
          <CardHeader className="p-3 sm:p-4 pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider flex justify-between items-center">
              This Month
              <TrendingUp className="w-4 h-4 text-teal-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-3xl font-bold text-slate-900">{monthConvertedCount}</div>
            <p className="text-xs text-slate-500 mt-0.5">conversions</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 shadow-sm bg-gradient-to-br from-white to-amber-50/50">
          <CardHeader className="p-3 sm:p-4 pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wider flex justify-between items-center">
              My Rank
              <Activity className="w-4 h-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-3xl font-bold text-slate-900">{myRank > 0 ? rankEmoji : "—"}</div>
            <p className="text-xs text-slate-500 mt-0.5">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Target Progress */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-slate-900 text-sm">Monthly Target</span>
            </div>
            <span className="text-sm font-bold text-slate-700">
              {monthConvertedCount} / {target} conversions
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPct >= 100
                  ? "bg-emerald-500"
                  : progressPct >= 60
                  ? "bg-teal-500"
                  : "bg-amber-400"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-500">
              {progressPct >= 100
                ? "🎉 Target achieved!"
                : `${target - monthConvertedCount} more to hit target`}
            </span>
            <span className="text-xs font-bold text-slate-600">{progressPct}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Commission Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-emerald-100 shadow-sm">
          <CardHeader className="p-3 sm:p-4 pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-1">
            <p className="text-2xl font-bold text-emerald-700">
              ₹{earnedRs.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-emerald-600 mt-0.5">commission paid</p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 shadow-sm">
          <CardHeader className="p-3 sm:p-4 pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-1">
            <p className="text-2xl font-bold text-amber-700">
              ₹{pendingRs.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">to be paid</p>
          </CardContent>
        </Card>
      </div>

      {recentPayouts.length > 0 && (
        <Card className="border-slate-200 shadow-sm mt-4">
          <CardHeader className="pb-2 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-700">Recent Payout Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-2 px-0">
            <div className="divide-y divide-slate-100">
              {recentPayouts.map((payout) => (
                <div key={payout.id} className="flex justify-between items-center p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 capitalize">{payout.type.replace("_", " ")}</p>
                    <p className="text-[10px] text-slate-500">{format(new Date(payout.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <p className="text-sm font-bold text-slate-900">
                      ₹{Math.round(payout.commissionPaise / 100).toLocaleString("en-IN")}
                    </p>
                    <span className={`inline-flex px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${payout.status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {payout.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hot Leads — Priority Queue */}
      {hotLeads.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-red-500" />
            <h2 className="text-base font-bold text-slate-900">🔥 Hot Leads — Act Now</h2>
          </div>
          <div className="space-y-2">
            {hotLeads.map((lead) => (
              <Link key={lead.id} href={`/field-portal/leads/${lead.id}`}>
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {lead.clinicName || lead.doctorName}
                      </h3>
                      <p className="text-xs text-red-700 mt-0.5 font-medium">
                        {lead.city} · {lead.specialty || "General"}
                      </p>
                    </div>
                    <a
                      href={`tel:${lead.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shrink-0"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 1 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-700">
              🏆 Monthly Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-3 space-y-2">
            {leaderboard.map((p, idx) => {
              const isMe = p.id === partner.id;
              const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                    isMe ? "bg-blue-50 border border-blue-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{medal}</span>
                    <span className={`text-sm font-semibold ${isMe ? "text-blue-700" : "text-slate-700"}`}>
                      {p.name} {isMe && "(You)"}
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${isMe ? "text-blue-700" : "text-slate-500"}`}>
                    {Number(p.conversions)} converted
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Recent Leads */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Recent Leads</h2>
          <Link
            href="/field-portal/leads"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {recentLeads.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-900">
                No leads assigned yet
              </h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                You have no active leads in your pipeline.
              </p>
              <Link href="/field-portal/leads/new">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Add First Lead
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentLeads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/field-portal/leads/${lead.id}`}
                  className="block hover:bg-slate-50 transition-colors p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {lead.priority === "hot" && "🔥 "}
                        {lead.clinicName || lead.doctorName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {lead.city || "Unknown City"} · {lead.specialty || "General"}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                        statusColors[lead.status] || "bg-slate-100 text-slate-600"
                      } capitalize`}
                    >
                      {lead.status.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
