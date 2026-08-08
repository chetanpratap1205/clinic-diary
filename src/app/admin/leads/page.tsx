import { getLeads, getLeadStats, getLeadCities } from "./actions";
import { LeadsClient } from "./leads-client";

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
    page: params.page ? parseInt(params.page) : 1,
    pageSize: 50,
  };

  const [{ leads, total, totalPages }, stats, cities] = await Promise.all([
    getLeads(filters),
    getLeadStats(),
    getLeadCities(),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Doctor Leads
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
          Manage your sales pipeline and send WhatsApp messages from the playbook.
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
