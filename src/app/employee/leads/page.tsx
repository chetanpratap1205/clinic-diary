import { redirect } from "next/navigation";
import { getAuthenticatedEmployee } from "@/lib/auth/rbac";
import { getLeads, getLeadStats, getLeadCities } from "../../admin/leads/actions";
import { LeadsClient } from "../../admin/leads/leads-client";

export const dynamic = "force-dynamic";

export default async function EmployeeLeadsPage(props: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const emp = await getAuthenticatedEmployee();
  if (!emp) redirect("/staff-login");

  const searchParams = await props.searchParams;

  const filters = {
    search: searchParams.search,
    status: searchParams.status,
    priority: searchParams.priority,
    category: searchParams.category,
    specialty: searchParams.specialty,
    city: searchParams.city,
    source: searchParams.source,
    assignedEmployeeId: emp.employeeId,
    page: searchParams.page ? parseInt(searchParams.page) : 1,
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
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          My Doctor Leads
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
          Manage your personal sales pipeline and send WhatsApp messages.
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
        isAdmin={false} // Restricts admin-only actions inside LeadsClient, but retains message builder
      />
    </div>
  );
}
