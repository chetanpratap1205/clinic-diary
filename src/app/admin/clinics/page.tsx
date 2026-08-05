import { db } from "@/db";
import { clinics, subscriptions } from "@/db/schema";
import { eq, desc, sql, and, or, ilike, isNull } from "drizzle-orm";
import { ClinicsTable, type ClinicRow } from "../_components/clinics-table";
import { ExportClinicsButton } from "../_components/export-clinics-button";
import { Building2, ShieldCheck, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clinics Management | Admin Console" };

export default async function ClinicsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const page = Number(searchParams?.page) || 1;
  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const tab = typeof searchParams?.tab === "string" ? searchParams.tab : "all";
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "newest";
  const specialtyFilter = typeof searchParams?.specialty === "string" ? searchParams.specialty : "all";

  // Dynamic filter building
  let condition = undefined;
  
  if (search) {
    condition = or(
      ilike(clinics.name, `%${search}%`),
      ilike(clinics.doctorName, `%${search}%`),
      ilike(clinics.phone, `%${search}%`)
    );
  }

  if (specialtyFilter && specialtyFilter !== "all") {
    condition = condition
      ? and(condition, eq(clinics.specialty, specialtyFilter))
      : eq(clinics.specialty, specialtyFilter);
  }
  
  if (tab === "active") {
    condition = condition ? and(condition, eq(subscriptions.status, "active")) : eq(subscriptions.status, "active");
  } else if (tab === "past_due") {
    condition = condition ? and(condition, eq(subscriptions.status, "past_due")) : eq(subscriptions.status, "past_due");
  } else if (tab === "cancelled") {
    condition = condition ? and(condition, eq(subscriptions.status, "cancelled")) : eq(subscriptions.status, "cancelled");
  } else if (tab === "trial") {
    condition = condition ? and(condition, isNull(subscriptions.status)) : isNull(subscriptions.status);
  } else if (tab === "at_risk") {
    condition = condition
      ? and(
          condition,
          sql`(SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = clinics.id AND a.created_at >= NOW() - INTERVAL '30 days') = 0`
        )
      : sql`(SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = clinics.id AND a.created_at >= NOW() - INTERVAL '30 days') = 0`;
  }

  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  // 1. Get tab counts & summary stats
  const countsResult = await db.execute(sql`
    SELECT 
      COUNT(*)::int as all,
      SUM(CASE WHEN s.status = 'active' THEN 1 ELSE 0 END)::int as active,
      SUM(CASE WHEN s.status = 'past_due' THEN 1 ELSE 0 END)::int as past_due,
      SUM(CASE WHEN s.status = 'cancelled' THEN 1 ELSE 0 END)::int as cancelled,
      SUM(CASE WHEN s.status IS NULL THEN 1 ELSE 0 END)::int as trial,
      SUM(CASE WHEN (SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = c.id AND a.created_at >= NOW() - INTERVAL '30 days') = 0 THEN 1 ELSE 0 END)::int as at_risk
    FROM clinics c
    LEFT JOIN subscriptions s ON s.clinic_id = c.id
  `);
  
  const counts = countsResult.rows[0] as {
    all: number;
    active: number;
    past_due: number;
    cancelled: number;
    trial: number;
    at_risk: number;
  };

  // 2. Fetch unique specialties for dropdown filter
  const specialtiesResult = await db
    .selectDistinct({ specialty: clinics.specialty })
    .from(clinics)
    .orderBy(clinics.specialty);
  const specialties = specialtiesResult.map((s) => s.specialty).filter(Boolean);

  // 3. Dynamic Sorting
  let orderByClause = desc(clinics.createdAt);
  if (sort === "revenue_desc") {
    orderByClause = desc(sql`(SELECT COALESCE(SUM(pl.amount_paise), 0)::int FROM payment_logs pl WHERE pl.clinic_id = clinics.id AND pl.status = 'paid')`);
  } else if (sort === "appts_desc") {
    orderByClause = desc(sql`(SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = clinics.id AND a.created_at >= NOW() - INTERVAL '30 days')`);
  }

  // 4. Get paginated clinics data
  const rawClinics = await db
    .select({
      id: clinics.id,
      name: clinics.name,
      doctorName: clinics.doctorName,
      specialty: clinics.specialty,
      phone: clinics.phone,
      createdAt: clinics.createdAt,
      subscriptionStatus: subscriptions.status,
      planId: subscriptions.planId,
      totalAppointments: sql<number>`(SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = clinics.id)`,
      qrAppointments: sql<number>`(SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = clinics.id AND a.acquisition_source LIKE 'qr_%')`,
      qrScans: sql<number>`(SELECT COUNT(*)::int FROM qr_scans s WHERE s.clinic_id = clinics.id)`,
      apptVolume30d: sql<number>`(SELECT COUNT(*)::int FROM appointments a WHERE a.clinic_id = clinics.id AND a.created_at >= NOW() - INTERVAL '30 days')`,
      totalRevenue: sql<number>`(SELECT COALESCE(SUM(pl.amount_paise), 0)::int FROM payment_logs pl WHERE pl.clinic_id = clinics.id AND pl.status = 'paid')`,
      kitOrderStatus: sql<string | null>`(SELECT status FROM orders o WHERE o.clinic_id = clinics.id ORDER BY o.created_at DESC LIMIT 1)`
    })
    .from(clinics)
    .leftJoin(subscriptions, eq(subscriptions.clinicId, clinics.id))
    .where(condition)
    .orderBy(orderByClause)
    .limit(PAGE_SIZE)
    .offset(offset);

  // 5. Total count for current filter
  const totalCountResult = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(clinics)
    .leftJoin(subscriptions, eq(subscriptions.clinicId, clinics.id))
    .where(condition);

  const totalCount = totalCountResult[0]?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Clinics Console</h2>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              {counts.all || 0} Registered
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Manage practice accounts, churn risks, and doctor access.
          </p>
        </div>
        <div>
          <ExportClinicsButton clinics={rawClinics as ClinicRow[]} />
        </div>
      </div>

      {/* Summary KPI Strip with Health Risk Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Clinics", value: counts.all || 0, color: "text-slate-900", bg: "border-slate-200" },
          { label: "Active Subs", value: counts.active || 0, color: "text-emerald-700", bg: "border-emerald-200 bg-emerald-50/20" },
          { label: "At Risk Clinics", value: counts.at_risk || 0, color: "text-rose-700", bg: "border-rose-200 bg-rose-50/20" },
          { label: "Trial / Free", value: counts.trial || 0, color: "text-slate-600", bg: "border-slate-200 bg-slate-50/50" },
          { label: "Past Due", value: counts.past_due || 0, color: "text-amber-700", bg: "border-amber-200 bg-amber-50/20" },
        ].map((s) => (
          <div
            key={s.label}
            className={`border rounded-xl px-4 py-3 shadow-xs bg-white ${s.bg}`}
          >
            <p className={`text-2xl font-black ${s.color} leading-none`}>{s.value}</p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-1">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Searchable, Filterable & Actionable Table */}
      <ClinicsTable 
        clinics={rawClinics as ClinicRow[]} 
        totalPages={totalPages}
        totalCount={totalCount}
        currentPage={page}
        currentSearch={search}
        currentTab={tab}
        currentSort={sort}
        currentSpecialty={specialtyFilter}
        specialties={specialties}
        counts={{
          all: counts.all || 0,
          active: counts.active || 0,
          past_due: counts.past_due || 0,
          cancelled: counts.cancelled || 0,
          trial: counts.trial || 0,
          at_risk: counts.at_risk || 0,
        }}
      />
    </div>
  );
}
