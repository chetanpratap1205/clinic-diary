import { getLeads, getLeadStats, getLeadCities } from "../../admin/leads/actions";
import { LeadsClient } from "../../admin/leads/leads-client";
import { requireEmployeeRole } from "@/lib/auth/rbac";

export const dynamic = "force-dynamic";

export default async function TeamLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const emp = await requireEmployeeRole(["admin", "manager"]);

  const params = await searchParams;

  const filters = {
    search: params.search,
    status: params.status,
    priority: params.priority,
    category: params.category,
    specialty: params.specialty,
    city: params.city,
    source: params.source,
    assignedManagerId: emp.role === "manager" ? emp.employeeId : undefined,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 50,
  };

  const [{ leads, total, totalPages }, stats, cities] = await Promise.all([
    getLeads(filters),
    getLeadStats(filters),
    getLeadCities(filters),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Team Leads
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Manager Tools
            </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
          Manage all team sales pipelines.
        </p>
      </div>

      <LeadsClient
        leads={leads}
        stats={stats}
        cities={cities}
        total={total}
        totalPages={totalPages}
        currentPage={filters.page}
        currentFilters={filters}
        isAdmin={true}
      />
    </div>
  );
}
