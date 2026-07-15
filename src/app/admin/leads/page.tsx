import { db } from "@/db";
import { doctorLeads } from "@/db/schema";
import { desc } from "drizzle-orm";
import { LeadsTable } from "./_components/leads-table";
import { AddLeadDialog } from "./_components/add-lead-dialog";
import { 
  Users, 
  CheckCircle2, 
  MessageCircle,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Leads CRM | Doctor Diary Admin",
  description: "Manage prospective clinics and doctors",
};

export default async function LeadsPage() {
  const leads = await db
    .select()
    .from(doctorLeads)
    .orderBy(desc(doctorLeads.createdAt));

  const totalLeads = leads.length;
  const contactedLeads = leads.filter(l => l.status === "contacted").length;
  const convertedLeads = leads.filter(l => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

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
        
        <AddLeadDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalLeads}</div>
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

        <Card className="border-slate-200 shadow-sm bg-teal-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}
