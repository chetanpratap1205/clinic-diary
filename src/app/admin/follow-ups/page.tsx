import { db } from "@/db";
import { followUps, clinics, patients } from "@/db/schema";
import { eq, count, sql, and, or, ilike, lte, desc } from "drizzle-orm";
import { CalendarClock, CheckCircle2, XCircle, Clock, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FollowUpsTable, type FollowUpRow } from "../_components/followups-table";
import { ExportFollowUpsButton } from "../_components/export-followups-button";
import { NotifyDoctorButton } from "../_components/notify-doctor-button";
import { formatDoctorName } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Follow-Ups & Patient Retention | Admin Console" };

export default async function FollowUpsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  const page = Number(searchParams?.page) || 1;
  const search = typeof searchParams?.search === "string" ? searchParams.search : "";
  const tab = typeof searchParams?.tab === "string" ? searchParams.tab : "overdue";

  const PAGE_SIZE = 25;
  const offset = (page - 1) * PAGE_SIZE;

  // Dynamic filter condition
  let condition = undefined;

  if (search) {
    condition = or(
      ilike(patients.name, `%${search}%`),
      ilike(patients.phone, `%${search}%`),
      ilike(clinics.name, `%${search}%`),
      ilike(followUps.notes, `%${search}%`)
    );
  }

  if (tab === "overdue") {
    condition = condition
      ? and(condition, eq(followUps.status, "pending"), sql`f.due_date < CURRENT_DATE`)
      : and(eq(followUps.status, "pending"), sql`f.due_date < CURRENT_DATE`);
  } else if (tab === "pending") {
    condition = condition ? and(condition, eq(followUps.status, "pending")) : eq(followUps.status, "pending");
  } else if (tab === "completed") {
    condition = condition ? and(condition, eq(followUps.status, "completed")) : eq(followUps.status, "completed");
  } else if (tab === "missed") {
    condition = condition ? and(condition, eq(followUps.status, "missed")) : eq(followUps.status, "missed");
  }

  // 1. Aggregated Stats & Tab Counts
  const [
    [pendingResult],
    [completedResult],
    [missedResult],
    countsResult,
    perClinicResult,
  ] = await Promise.all([
    db.select({ value: count() }).from(followUps).where(eq(followUps.status, "pending")),
    db.select({ value: count() }).from(followUps).where(eq(followUps.status, "completed")),
    db.select({ value: count() }).from(followUps).where(eq(followUps.status, "missed")),

    db.execute(sql`
      SELECT
        COUNT(*)::int as all,
        SUM(CASE WHEN status = 'pending' AND due_date < CURRENT_DATE THEN 1 ELSE 0 END)::int as overdue,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int as pending,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)::int as completed,
        SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END)::int as missed
      FROM follow_ups
    `),

    // Count by clinic with doctor phone
    db.execute(sql`
      SELECT
        c.name AS "clinicName",
        c.doctor_name AS "doctorName",
        c.phone AS "doctorPhone",
        COUNT(*) FILTER (WHERE f.status = 'pending')::int   AS pending,
        COUNT(*) FILTER (WHERE f.status = 'completed')::int AS completed,
        COUNT(*) FILTER (WHERE f.status = 'missed')::int    AS missed,
        COUNT(*) FILTER (
          WHERE f.status = 'pending' AND f.due_date < CURRENT_DATE
        )::int AS overdue
      FROM clinics c
      LEFT JOIN follow_ups f ON f.clinic_id = c.id
      GROUP BY c.id, c.name, c.doctor_name, c.phone
      HAVING COUNT(f.id) > 0
      ORDER BY overdue DESC, pending DESC
      LIMIT 20
    `),
  ]);

  const counts = countsResult.rows[0] as {
    all: number;
    overdue: number;
    pending: number;
    completed: number;
    missed: number;
  };

  const perClinic = perClinicResult.rows as Array<{
    clinicName: string;
    doctorName: string;
    doctorPhone: string | null;
    pending: number;
    completed: number;
    missed: number;
    overdue: number;
  }>;

  const total = (pendingResult.value ?? 0) + (completedResult.value ?? 0) + (missedResult.value ?? 0);
  const completionRate =
    total > 0
      ? (((completedResult.value ?? 0) / total) * 100).toFixed(1)
      : "0.0";

  // 2. Query paginated follow-ups
  const rawFollowUps = await db.execute(sql`
    SELECT
      f.id,
      f.due_date    AS "dueDate",
      f.notes,
      f.status,
      p.name        AS "patientName",
      p.phone       AS "patientPhone",
      c.name        AS "clinicName"
    FROM follow_ups f
    LEFT JOIN patients p ON p.id = f.patient_id
    LEFT JOIN clinics  c ON c.id = f.clinic_id
    ${condition ? sql`WHERE ${condition}` : sql``}
    ORDER BY f.due_date ASC
    LIMIT ${PAGE_SIZE}
    OFFSET ${offset}
  `);

  const followUpRows = (rawFollowUps.rows as unknown as FollowUpRow[]) || [];

  // 3. Count for pagination
  const totalCountResult = await db.execute(sql`
    SELECT COUNT(*)::int as count
    FROM follow_ups f
    LEFT JOIN patients p ON p.id = f.patient_id
    LEFT JOIN clinics  c ON c.id = f.clinic_id
    ${condition ? sql`WHERE ${condition}` : sql``}
  `);

  const filteredTotalCount = Number(totalCountResult.rows[0]?.count || 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & CSV Exporter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Follow-Ups & Patient Retention</h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CalendarClock className="w-3.5 h-3.5 text-amber-600" />
              Retention Radar
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            Monitor patient retention, overdue follow-up SLAs, and clinic engagement across the platform.
          </p>
        </div>

        <div>
          <ExportFollowUpsButton followUps={followUpRows} />
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Overdue Follow-Ups",
            value: counts.overdue || 0,
            icon: AlertTriangle,
            color: "text-rose-700",
            bg: "bg-rose-50 border-rose-200",
            iconColor: "text-rose-600",
          },
          {
            label: "Pending Follow-Ups",
            value: pendingResult.value ?? 0,
            icon: Clock,
            color: "text-amber-700",
            bg: "bg-amber-50 border-amber-200",
            iconColor: "text-amber-600",
          },
          {
            label: "Completed",
            value: completedResult.value ?? 0,
            icon: CheckCircle2,
            color: "text-emerald-700",
            bg: "bg-emerald-50 border-emerald-200",
            iconColor: "text-emerald-600",
          },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            icon: CalendarClock,
            color: "text-teal-700",
            bg: "bg-teal-50 border-teal-200",
            iconColor: "text-teal-600",
          },
        ].map((s) => (
          <Card key={s.label} className={`shadow-xs border ${s.bg}`}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{s.label}</p>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className={`text-2xl font-black ${s.color} leading-none`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Searchable, Actionable Follow-Ups Table */}
      <FollowUpsTable
        followUps={followUpRows}
        totalCount={filteredTotalCount}
        currentPage={page}
        currentSearch={search}
        currentTab={tab}
        counts={{
          all: counts.all || 0,
          overdue: counts.overdue || 0,
          pending: counts.pending || 0,
          completed: counts.completed || 0,
          missed: counts.missed || 0,
        }}
      />

      {/* Per-Clinic Follow-Up Performance Breakdown with Doctor Notifications */}
      <Card className="shadow-xs border-slate-200/80">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Follow-Up Compliance by Practice
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Overdue follow-up SLA breakdown per clinic with 1-click WhatsApp alerts
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto min-w-full">
          <div className="min-w-[600px]">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow>
                  <TableHead className="font-semibold text-xs whitespace-nowrap">Clinic & Doctor</TableHead>
                  <TableHead className="font-semibold text-xs text-right whitespace-nowrap">Pending</TableHead>
                  <TableHead className="font-semibold text-xs text-right whitespace-nowrap hidden sm:table-cell">Completed</TableHead>
                  <TableHead className="font-semibold text-xs text-right whitespace-nowrap hidden sm:table-cell">Missed</TableHead>
                  <TableHead className="font-semibold text-xs text-right whitespace-nowrap">Overdue SLA</TableHead>
                  <TableHead className="font-semibold text-xs text-right whitespace-nowrap">Admin Alert Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perClinic.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-16 text-center text-slate-400 text-xs">
                      No clinic follow-up records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  perClinic.map((row) => (
                    <TableRow key={row.clinicName} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell className="min-w-[180px]">
                        <p className="font-semibold text-xs text-slate-900 truncate">{row.clinicName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{formatDoctorName(row.doctorName)}</p>
                      </TableCell>

                      <TableCell className="text-right text-xs text-amber-700 font-bold whitespace-nowrap">
                        {row.pending}
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-right text-xs text-emerald-700 font-semibold whitespace-nowrap">
                        {row.completed}
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-right text-xs text-rose-600 font-medium whitespace-nowrap">
                        {row.missed}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        {row.overdue > 0 ? (
                          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                            {row.overdue} Overdue
                          </Badge>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">0 (Clean)</span>
                        )}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <NotifyDoctorButton clinicName={row.clinicName} overdueCount={row.overdue} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
