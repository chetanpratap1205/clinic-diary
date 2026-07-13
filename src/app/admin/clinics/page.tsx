import { db } from "@/db";
import { clinics, appointments, subscriptions, paymentLogs } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ClinicsTable, type ClinicRow } from "../_components/clinics-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clinics | ClinicDiary Admin" };

export default async function ClinicsPage() {
  // Use a subquery-based approach to avoid cartesian product from multiple LEFT JOINs
  const rawClinics = await db.execute(sql`
    SELECT
      c.id,
      c.name,
      c.doctor_name         AS "doctorName",
      c.specialty,
      c.phone,
      c.created_at          AS "createdAt",
      s.status              AS "subscriptionStatus",
      s.plan_id             AS "planId",
      (
        SELECT COUNT(*)::int
        FROM appointments a
        WHERE a.clinic_id = c.id
      )                     AS "totalAppointments",
      (
        SELECT COALESCE(SUM(pl.amount_paise), 0)::int
        FROM payment_logs pl
        WHERE pl.clinic_id = c.id AND pl.status = 'paid'
      )                     AS "totalRevenue"
    FROM clinics c
    LEFT JOIN subscriptions s ON s.clinic_id = c.id
    ORDER BY c.created_at DESC
  `);

  const allClinics = rawClinics.rows as ClinicRow[];

  // Summary stats for the header strip
  const active = allClinics.filter((c) => c.subscriptionStatus === "active").length;
  const trial = allClinics.filter((c) => !c.subscriptionStatus).length;
  const pastDue = allClinics.filter((c) => c.subscriptionStatus === "past_due").length;

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
          { label: "Total", value: allClinics.length, color: "text-slate-800" },
          { label: "Active Subs", value: active, color: "text-emerald-700" },
          { label: "Trial / Free", value: trial, color: "text-slate-500" },
          { label: "Past Due", value: pastDue, color: "text-amber-700" },
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
      <ClinicsTable clinics={allClinics} />
    </div>
  );
}
