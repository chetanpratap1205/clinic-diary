export const dynamic = "force-dynamic";

import { getAuthenticatedEmployee } from "@/lib/auth/rbac";
import { getEmployeeDashboardStats } from "../actions";
import { redirect } from "next/navigation";
import { Target, Award, TrendingUp, CheckCircle, Clock } from "lucide-react";

export default async function EmployeePerformancePage() {
  const stats = await getEmployeeDashboardStats();
  if (!stats?.emp) redirect("/staff-login");

  const emp = stats.emp;
  const leadTargetPct = Math.min(Math.round((stats.totalAssigned / stats.targetMonthlyLeads) * 100), 100);
  const conversionTargetPct = Math.min(Math.round((stats.converted / stats.targetMonthlyConversions) * 100), 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personal Performance & Quota Tracker</h2>
          <p className="text-xs text-slate-500">
            Monthly target tracking for {emp.name} ({emp.employeeCode})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">{emp.role.replace("_", " ")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leads Target Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-sm">Monthly Lead Pipeline Target</h3>
            </div>
            <span className="text-xs font-bold text-teal-700">{leadTargetPct}%</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalAssigned}</span>
            <span className="text-xs text-slate-500">/ {stats.targetMonthlyLeads} leads</span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${leadTargetPct}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Total doctor leads acquired, claimed, or assigned this month.</p>
        </div>

        {/* Conversions Target Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Monthly Conversion Quota</h3>
            </div>
            <span className="text-xs font-bold text-emerald-700">{conversionTargetPct}%</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600">{stats.converted}</span>
            <span className="text-xs text-slate-500">/ {stats.targetMonthlyConversions} conversions</span>
          </div>

          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${conversionTargetPct}%` }} />
          </div>
          <p className="text-[11px] text-slate-400">Doctors successfully converted to active paid SaaS subscriptions.</p>
        </div>
      </div>

      {/* Activity Log Summary */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Activity & Engagement Metrics</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-500">Logged Field Visits</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.contacted}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-500">Demos Scheduled</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{stats.demoScheduled}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-500">Converted Clinics</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{stats.converted}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-500">Total Activity Logs</p>
            <p className="text-xl font-bold text-teal-600 mt-1">{stats.activityCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
