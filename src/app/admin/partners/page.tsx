import { db } from "@/db";
import { growthPartners, doctorLeads, commissionPayouts } from "@/db/schema";
import { desc, eq, sql, isNull, and, ne } from "drizzle-orm";
import {
  Briefcase,
  Users,
  TrendingUp,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Phone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AddPartnerDialog } from "./_components/add-partner-dialog";
import { BulkAssignDialog } from "./_components/bulk-assign-dialog";
import { PartnerToggle } from "./_components/partner-toggle";

export const metadata = {
  title: "Growth Partners | Doctor Diary Admin",
};

export default async function AdminPartnersPage() {
  const [partners, unassignedCountResult] = await Promise.all([
    db
      .select({
        id: growthPartners.id,
        name: growthPartners.name,
        email: growthPartners.email,
        phone: growthPartners.phone,
        city: growthPartners.city,
        region: growthPartners.region,
        targetMonthly: growthPartners.targetMonthly,
        referralCode: growthPartners.referralCode,
        isActive: growthPartners.isActive,
        joinedAt: growthPartners.joinedAt,
        totalLeads: sql<number>`count(${doctorLeads.id})`,
        convertedLeads: sql<number>`count(case when ${doctorLeads.status} = 'converted' then 1 end)`,
        pendingCommission: sql<number>`coalesce((
          select sum(commission_paise) from commission_payouts cp
          where cp.partner_id = ${growthPartners.id} and cp.status = 'pending'
        ), 0)`,
      })
      .from(growthPartners)
      .leftJoin(doctorLeads, eq(doctorLeads.assignedTo, growthPartners.id))
      .groupBy(growthPartners.id)
      .orderBy(desc(growthPartners.joinedAt)),

    db
      .select({ count: sql<number>`count(*)` })
      .from(doctorLeads)
      .where(
        and(
          isNull(doctorLeads.assignedTo),
          ne(doctorLeads.status, "converted"),
          ne(doctorLeads.status, "rejected")
        )
      ),
  ]);

  const unassignedCount = Number(unassignedCountResult[0]?.count || 0);
  const activePartners = partners.filter((p) => p.isActive);
  const totalConverted = partners.reduce((sum, p) => sum + Number(p.convertedLeads), 0);
  const totalLeadsAssigned = partners.reduce((sum, p) => sum + Number(p.totalLeads), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Growth Partners
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your field sales team · 30% first sale · 10% renewals
          </p>
        </div>
        <AddPartnerDialog />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Partners
            </CardTitle>
            <Briefcase className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{partners.length}</p>
            <p className="text-xs text-slate-500 mt-1">{activePartners.length} active</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Leads Assigned
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{totalLeadsAssigned}</p>
            <p className="text-xs text-amber-600 font-medium mt-1">{unassignedCount} unassigned</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Conversions
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-900">{totalConverted}</p>
            <p className="text-xs text-slate-500 mt-1">clinics onboarded</p>
          </CardContent>
        </Card>

        <Card className="border-teal-200/60 bg-teal-50/60 backdrop-blur-xl shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Avg Win Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-teal-700">
              {totalLeadsAssigned > 0
                ? Math.round((totalConverted / totalLeadsAssigned) * 100)
                : 0}
              %
            </p>
            <p className="text-xs text-teal-600 mt-1">across all partners</p>
          </CardContent>
        </Card>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {partners.map((partner) => {
          const totalLeads = Number(partner.totalLeads);
          const converted = Number(partner.convertedLeads);
          const winRate = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;
          const target = partner.targetMonthly ?? 5;
          const progressPct = Math.min(Math.round((converted / target) * 100), 100);
          const pendingCommissionRs = Math.round(Number(partner.pendingCommission) / 100);

          return (
            <Card
              key={partner.id}
              className={`border shadow-sm relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 animate-in fade-in zoom-in-95 duration-500 ${
                !partner.isActive ? "border-slate-200 opacity-60" : "border-slate-200"
              }`}
            >
              {/* Header */}
              <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold uppercase text-sm shrink-0">
                      {partner.name.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm leading-tight">
                        {partner.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-[160px]">
                        {partner.email}
                      </p>
                    </div>
                  </div>
                  <PartnerToggle partnerId={partner.id} isActive={partner.isActive} />
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {partner.phone && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      <Phone className="w-2.5 h-2.5" />
                      {partner.phone}
                    </span>
                  )}
                  {partner.region && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                      <MapPin className="w-2.5 h-2.5" />
                      {partner.region}
                    </span>
                  )}
                  {partner.referralCode && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200 font-mono font-bold">
                      {partner.referralCode}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-4 pb-3 space-y-3">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100">
                  <div>
                    <p className="text-lg font-bold text-slate-700">{totalLeads}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Assigned
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-600">{converted}</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Converted
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-teal-600">{winRate}%</p>
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Win Rate
                    </p>
                  </div>
                </div>

                {/* Monthly Target Progress */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Monthly Target
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600">
                      {converted}/{target}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progressPct >= 100
                          ? "bg-emerald-500"
                          : progressPct >= 60
                          ? "bg-teal-500"
                          : "bg-amber-400"
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Commission */}
                {pendingCommissionRs > 0 && (
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 flex justify-between items-center">
                    <span className="text-xs text-amber-700">Pending Commission</span>
                    <span className="text-sm font-bold text-amber-800">
                      ₹{pendingCommissionRs.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <BulkAssignDialog
                    partnerId={partner.id}
                    partnerName={partner.name}
                    unassignedCount={unassignedCount}
                  />
                  <Link
                    href={`/admin/partners/${partner.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-lg px-3 py-2 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Detail
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Empty State */}
        {partners.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-900">
              No Growth Partners Yet
            </h3>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Add your first field sales partner to start tracking performance.
            </p>
            <AddPartnerDialog />
          </div>
        )}
      </div>
    </div>
  );
}
