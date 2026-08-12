import { getLeads, getLeadStats, getLeadCities, getTeamPerformanceSummary } from "./actions";
import { LeadsPageWrapper } from "./leads-page-wrapper";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const filters = {
    search: params.search,
    status: params.status,
    priority: params.priority,
    category: params.category,
    specialty: params.specialty,
    city: params.city,
    source: params.source,
    goLiveIntent: params.goLiveIntent,
    assignedEmployeeId: params.assignedEmployeeId,
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 50,
  };

  const [{ leads, total, totalPages }, stats, cities, teamData] = await Promise.all([
    getLeads(filters),
    getLeadStats(),
    getLeadCities(),
    getTeamPerformanceSummary(),
  ]);

  return (
    <LeadsPageWrapper
      leads={leads}
      stats={stats}
      cities={cities}
      total={total}
      totalPages={totalPages}
      currentPage={filters.page}
      currentFilters={filters}
      isAdmin={true}
      teamData={teamData}
    />
  );
}
