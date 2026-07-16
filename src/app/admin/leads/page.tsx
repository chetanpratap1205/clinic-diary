import { db } from "@/db";
import { doctorLeads, growthPartners } from "@/db/schema";
import { desc, eq, sql, isNull, and } from "drizzle-orm";
import { LeadsTable } from "./_components/leads-table";
import { AddLeadDialog } from "./_components/add-lead-dialog";
import { CsvImport } from "./_components/csv-import";
import {
  Users,
  CheckCircle2,
  MessageCircle,
  TrendingUp,
  Flame,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Leads CRM | Doctor Diary Admin",
  description: "Manage prospective clinics and doctors",
};

export default async function LeadsPage() {
  // Join leads with partner names
  const leadsRaw = await db
    .select({
      id: doctorLeads.id,
      assignedTo: doctorLeads.assignedTo,
      doctorName: doctorLeads.doctorName,
      clinicName: doctorLeads.clinicName,
      phone: doctorLeads.phone,
      email: doctorLeads.email,
      specialty: doctorLeads.specialty,
      city: doctorLeads.city,
      address: doctorLeads.address,
      source: doctorLeads.source,
      status: doctorLeads.status,
      priority: doctorLeads.priority,
      notes: doctorLeads.notes,
      followUpDate: doctorLeads.followUpDate,
      lastContactedAt: doctorLeads.lastContactedAt,
      demoScheduledAt: doctorLeads.demoScheduledAt,
      convertedAt: doctorLeads.convertedAt,
      conversionAmount: doctorLeads.conversionAmount,
      commissionPaid: doctorLeads.commissionPaid,
      createdAt: doctorLeads.createdAt,
      updatedAt: doctorLeads.updatedAt,
      partnerName: growthPartners.name,
    })
    .from(doctorLeads)
    .leftJoin(growthPartners, eq(growthPartners.id, doctorLeads.assignedTo))
    .orderBy(
      // Hot leads first, then by created date
      sql`case ${doctorLeads.priority} when 'hot' then 1 when 'warm' then 2 when 'normal' then 3 when 'cold' then 4 else 5 end`,
      desc(doctorLeads.createdAt)
    );

  const leads = leadsRaw as any[];

  const totalLeads = leads.length;
  const contactedLeads = leads.filter((l) => l.status === "contacted").length;
  const convertedLeads = leads.filter((l) => l.status === "converted").length;
  const hotLeads = leads.filter((l) => l.priority === "hot").length;
  const unassignedLeads = leads.filter((l) => !l.assignedTo).length;
  const conversionRate =
    totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Prospects & Leads
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your sales pipeline and acquire new clinics.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <CsvImport />
          <AddLeadDialog />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-5">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalLeads}</div>
          </CardContent>
        </Card>

        <Card className="border-red-100 shadow-sm bg-red-50/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">🔥 Hot Leads</CardTitle>
            <Flame className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{hotLeads}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Contacted</CardTitle>
            <MessageCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{contactedLeads}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Converted</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{convertedLeads}</div>
          </CardContent>
        </Card>

        <Card className="border-teal-100 shadow-sm bg-teal-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned alert */}
      {unassignedLeads > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>{unassignedLeads} leads</strong> are unassigned and sitting in the pool.{" "}
            <a href="/admin/partners" className="underline font-semibold">
              Assign them to partners →
            </a>
          </span>
        </div>
      )}

      <LeadsTable leads={leads} />
    </div>
  );
}
