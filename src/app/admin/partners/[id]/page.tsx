import { db } from "@/db";
import {
  growthPartners,
  doctorLeads,
  leadActivities,
  commissionPayouts,
} from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Target,
  TrendingUp,
  CheckCircle2,
  Users,
  Clock,
  Flame,
  Wallet,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { EditPartnerDialog } from "./_components/edit-partner-dialog";
import { MarkPaidButton } from "./_components/mark-paid-button";

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const [partner] = await db
    .select({ name: growthPartners.name })
    .from(growthPartners)
    .where(eq(growthPartners.id, id))
    .limit(1);
  return { title: `${partner?.name ?? "Partner"} | Admin` };
}

export default async function PartnerDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  const [partner] = await db
    .select()
    .from(growthPartners)
    .where(eq(growthPartners.id, id))
    .limit(1);

  if (!partner) notFound();

  const [leads, activities, commissions] = await Promise.all([
    db
      .select()
      .from(doctorLeads)
      .where(eq(doctorLeads.assignedTo, id))
      .orderBy(desc(doctorLeads.createdAt)),

    db
      .select()
      .from(leadActivities)
      .where(eq(leadActivities.partnerId, id))
      .orderBy(desc(leadActivities.createdAt))
      .limit(20),

    db
      .select()
      .from(commissionPayouts)
      .where(eq(commissionPayouts.partnerId, id))
      .orderBy(desc(commissionPayouts.createdAt)),
  ]);

  const totalLeads = leads.length;
  const converted = leads.filter((l) => l.status === "converted").length;
  const contacted = leads.filter((l) => l.status === "contacted").length;
  const demoScheduled = leads.filter((l) => l.status === "demo_scheduled").length;
  const winRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
  const target = partner.targetMonthly ?? 5;

  const totalEarned = commissions
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + c.commissionPaise, 0);
  const totalPending = commissions
    .filter((c) => c.status === "pending")
    .reduce((s, c) => s + c.commissionPaise, 0);

  const statusColors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    contacted: "bg-amber-50 text-amber-700 border-amber-200",
    demo_scheduled: "bg-purple-50 text-purple-700 border-purple-200",
    converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const priorityIcons: Record<string, string> = {
    hot: "🔥",
    warm: "🌡️",
    normal: "📋",
    cold: "❄️",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/admin/partners"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Partners
      </Link>

      {/* Partner Hero */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-2xl uppercase shrink-0">
            {partner.name.substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start gap-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">{partner.name}</h1>
                {partner.referralCode && (
                  <span className="inline-block mt-1 font-mono text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded">
                    {partner.referralCode}
                  </span>
                )}
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    partner.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {partner.isActive ? "● Active" : "○ Inactive"}
                </span>
                <EditPartnerDialog partner={{ id: partner.id, name: partner.name, targetMonthly: partner.targetMonthly }} />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-400" />
                {partner.email}
              </span>
              {partner.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {partner.phone}
                </span>
              )}
              {partner.region && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {partner.region}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                Joined {format(new Date(partner.joinedAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: totalLeads, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Converted", value: converted, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50" },
          { label: "Monthly Target", value: `${converted}/${target}`, icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat) => (
          <Card key={stat.label} className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </CardTitle>
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Breakdown */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-700">Pipeline Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "New", count: leads.filter(l => l.status === "new").length, color: "bg-blue-50 text-blue-700 border-blue-200" },
              { label: "Contacted", count: contacted, color: "bg-amber-50 text-amber-700 border-amber-200" },
              { label: "Demo Scheduled", count: demoScheduled, color: "bg-purple-50 text-purple-700 border-purple-200" },
              { label: "Converted", count: converted, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { label: "Rejected", count: leads.filter(l => l.status === "rejected").length, color: "bg-red-50 text-red-700 border-red-200" },
            ].map((s) => (
              <div key={s.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold ${s.color}`}>
                {s.label}: <span className="text-base font-bold">{s.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Commission Summary */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-600" />
              Commission Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
                <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Total Paid</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">
                  ₹{Math.round(totalEarned / 100).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Pending</p>
                <p className="text-xl font-bold text-amber-700 mt-1">
                  ₹{Math.round(totalPending / 100).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {commissions.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No commissions recorded yet</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {commissions.slice(0, 10).map((c) => (
                  <div key={c.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-slate-700 capitalize">{c.type.replace("_", " ")}</p>
                      <p className="text-[10px] text-slate-400">{format(new Date(c.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <div className="text-right flex items-center justify-end">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          ₹{Math.round(c.commissionPaise / 100).toLocaleString("en-IN")}
                        </p>
                        <span className={`text-[10px] font-bold ${c.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                      {c.status === "pending" && <MarkPaidButton payoutId={c.id} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No activity recorded yet</p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {activities.map((act) => (
                  <div key={act.id} className="flex gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold uppercase mt-0.5">
                      {act.type[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 capitalize">{act.type}</p>
                      {act.notes && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{act.notes}</p>}
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-700">
            Assigned Leads ({leads.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {leads.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No leads assigned to this partner yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="text-left px-4 py-3">Doctor / Clinic</th>
                    <th className="text-left px-4 py-3">Contact</th>
                    <th className="text-left px-4 py-3">Priority</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">Dr. {lead.doctorName}</p>
                        {lead.clinicName && (
                          <p className="text-xs text-slate-500">{lead.clinicName}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <p>{lead.phone}</p>
                        {lead.city && <p className="text-xs text-slate-400">{lead.city}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm">{priorityIcons[lead.priority] ?? "📋"}</span>
                        <span className="ml-1 text-xs text-slate-600 capitalize">{lead.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${statusColors[lead.status] ?? ""}`}
                        >
                          {lead.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                        {format(new Date(lead.createdAt), "MMM d, yyyy")}
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
