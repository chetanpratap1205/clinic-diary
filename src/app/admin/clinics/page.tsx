import { db } from "@/db";
import { clinics, subscriptions } from "@/db/schema";
import { eq, desc, sql, and, or, ilike, isNull } from "drizzle-orm";
import { ClinicsTable, type ClinicRow } from "../_components/clinics-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clinics | Doctor Diary Admin" };

export default async function ClinicsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const page = Number(searchParams?.page) || 1;
  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const tab = typeof searchParams?.tab === "string" ? searchParams.tab : "all";

  // Build the dynamic condition
  let condition = undefined;
  
  if (search) {
    condition = or(
      ilike(clinics.name, `%${search}%`),
      ilike(clinics.doctorName, `%${search}%`),
      ilike(clinics.phone, `%${search}%`)
    );
  }
  
  if (tab === "active") {
    condition = condition ? and(condition, eq(subscriptions.status, 'active')) : eq(subscriptions.status, 'active');
  } else if (tab === "past_due") {
    condition = condition ? and(condition, eq(subscriptions.status, 'past_due')) : eq(subscriptions.status, 'past_due');
  } else if (tab === "cancelled") {
    condition = condition ? and(condition, eq(subscriptions.status, 'cancelled')) : eq(subscriptions.status, 'cancelled');
  } else if (tab === "trial") {
    condition = condition ? and(condition, isNull(subscriptions.status)) : isNull(subscriptions.status);
  }

  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  // 1. Get counts for the tabs
  const countsResult = await db.execute(sql`
    SELECT 
      COUNT(*)::int as all,
      SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END)::int as active,
      SUM(CASE WHEN s.status = 'past_due' THEN 1 ELSE 0 END)::int as past_due,
      SUM(CASE WHEN s.status = 'cancelled' THEN 1 ELSE 0 END)::int as cancelled,
      SUM(CASE WHEN s.status IS NULL THEN 1 ELSE 0 END)::int as trial
    FROM clinics c
    LEFT JOIN subscriptions s ON s.clinic_id = c.id
  `);
  
  const counts = countsResult.rows[0] as { all: number; active: number; past_due: number; cancelled: number; trial: number };

  // 2. Get paginated data
  const rawClinics = await db.select({
    id: clinics.id,
    name: clinics.name,
    doctorName: clinics.doctorName,
    specialty: clinics.specialty,
    phone: clinics.phone,
    createdAt: clinics.createdAt,
    subscriptionStatus: subscriptions.status,
    planId: subscriptions.planId,
    totalAppointments: sql<number>`(SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = clinics.id)`,
    apptVolume30d: sql<number>`(SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = clinics.id AND a.created_at >= NOW() - INTERVAL '30 days')`,
    totalRevenue: sql<number>`(SELECT COALESCE(SUM(pl.amount_paise), 0)::int FROM payment_logs pl WHERE pl.clinic_id = clinics.id AND pl.status = 'paid')`,
    kitOrderStatus: sql<string | null>`(SELECT status FROM orders o WHERE o.clinic_id = clinics.id ORDER BY o.created_at DESC LIMIT 1)`
  })
  .from(clinics)
  .leftJoin(subscriptions, eq(subscriptions.clinicId, clinics.id))
  .where(condition)
  .orderBy(desc(clinics.createdAt))
  .limit(PAGE_SIZE)
  .offset(offset);

  // 3. Get total count for current filter
  const totalCountResult = await db.select({ count: sql<number>`COUNT(*)::int` })
  .from(clinics)
  .leftJoin(subscriptions, eq(subscriptions.clinicId, clinics.id))
  .where(condition);

  const totalCount = totalCountResult[0]?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Clinics</h2>
          <p className="text-slate-500 mt-1 text-sm">
            All registered clinics on the platform.
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.all, color: "text-slate-800" },
          { label: "Active Subs", value: counts.active || 0, color: "text-emerald-700" },
          { label: "Trial / Free", value: counts.trial || 0, color: "text-slate-500" },
          { label: "Past Due", value: counts.past_due || 0, color: "text-amber-700" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm"
          >
            <p className={`text-2xl font-bold ${s.color} leading-none`}>{s.value}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Searchable / filterable table */}
      <ClinicsTable 
        clinics={rawClinics as ClinicRow[]} 
        totalPages={totalPages}
        totalCount={totalCount}
        currentPage={page}
        currentSearch={search}
        currentTab={tab}
        counts={{
          all: counts.all || 0,
          active: counts.active || 0,
          past_due: counts.past_due || 0,
          cancelled: counts.cancelled || 0,
          trial: counts.trial || 0,
        }}
      />
    </div>
  );
}
