export const dynamic = "force-dynamic";

import { getEmployeeDashboardStats, getEmployeeLeads } from "./actions";
import Link from "next/link";
import { Users, PhoneCall, CalendarCheck, CheckCircle2, PlusCircle, ArrowUpRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDoctorName } from "@/lib/utils";

export default async function EmployeeOverviewPage() {
  const stats = await getEmployeeDashboardStats();
  const recentLeads = await getEmployeeLeads();

  const emp = stats.emp;
  const conversionPct = Math.min(
    Math.round((stats.converted / stats.targetMonthlyConversions) * 100),
    100
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Employee Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-500/20 text-teal-300 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-teal-500/30">
              {emp.role.replace("_", " ")}
            </span>
            <span className="text-slate-400 text-xs font-mono">{emp.employeeCode}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
            Welcome back, {emp.name}! 👋
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Territory:{" "}
            <span className="text-teal-300 font-medium">
              {emp.territoryCities.length > 0 ? emp.territoryCities.join(", ") : "All Regions"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/employee/leads">
            <Button className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs gap-2">
              <PlusCircle className="w-4 h-4" />
              Manage Leads
            </Button>
          </Link>
          <Link href="/employee/directory">
            <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold text-xs gap-2">
              Claim Directory Doctor ↗
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Assigned Leads</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalAssigned}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 font-bold shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Contacted / Visited</p>
            <p className="text-2xl font-bold text-slate-900">{stats.contacted}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Demos Scheduled</p>
            <p className="text-2xl font-bold text-slate-900">{stats.demoScheduled}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Converted Clinics</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.converted}</p>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Monthly Conversion Quota</h3>
            <p className="text-xs text-slate-500">
              {stats.converted} of {stats.targetMonthlyConversions} doctor conversions completed this month
            </p>
          </div>
          <span className="text-sm font-bold text-teal-700">{conversionPct}% Target Reached</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${conversionPct}%` }}
          />
        </div>
      </div>

      {/* Recent Assigned Doctor Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">My Assigned Doctor Leads</h3>
            <p className="text-xs text-slate-500">Recent doctor leads in your assigned pipeline</p>
          </div>
          <Link href="/employee/leads">
            <Button variant="ghost" size="sm" className="text-xs text-teal-600 hover:text-teal-700 gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Doctor & Clinic</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Specialty / City</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLeads.slice(0, 6).map((lead) => {
                const encodedMsg = encodeURIComponent(
                  `Namaste ${formatDoctorName(lead.doctorName)}! I'm ${emp.name} from Doctor Diary platform. I noticed your clinic ${lead.clinicName || ""} in ${lead.city || ""}. Would love to share a quick 2-minute demo of our automated Doctor Diary system!`
                );
                const waUrl = `https://wa.me/91${lead.phone.replace(/[^0-9]/g, "")}?text=${encodedMsg}`;

                return (
                  <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{formatDoctorName(lead.doctorName)}</p>
                      <p className="text-[11px] text-slate-500">{lead.clinicName || "Private Clinic"}</p>
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-800">{lead.phone}</td>
                    <td className="p-3">
                      <p className="text-slate-800 font-medium">{lead.specialty || "General Practice"}</p>
                      <p className="text-[11px] text-slate-400">{lead.city || "Pune"}</p>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        lead.status === "converted" ? "bg-emerald-100 text-emerald-800" :
                        lead.status === "demo_scheduled" ? "bg-amber-100 text-amber-800" :
                        lead.status === "contacted" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {lead.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <a href={waUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] h-7 px-2.5 gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                        </Button>
                      </a>
                    </td>
                  </tr>
                );
              })}

              {recentLeads.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">
                    No doctor leads assigned yet. Click "Claim Directory Doctor" or "Add Lead" to start!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
