import { db } from "@/db";
import { followUps, clinics, patients } from "@/db/schema";
import { eq, count, sql, asc } from "drizzle-orm";
import { format } from "date-fns";
import { CalendarClock, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Follow-Ups | Doctor Diary Admin" };

export default async function FollowUpsPage() {
  const [
    [pendingResult],
    [completedResult],
    [missedResult],
    overdueResult,
    perClinicResult,
  ] = await Promise.all([
    db.select({ value: count() }).from(followUps).where(eq(followUps.status, "pending")),
    db.select({ value: count() }).from(followUps).where(eq(followUps.status, "completed")),
    db.select({ value: count() }).from(followUps).where(eq(followUps.status, "missed")),

    // Overdue: pending AND due date < today
    db.execute(sql`
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
      WHERE f.status = 'pending'
        AND f.due_date < CURRENT_DATE
      ORDER BY f.due_date ASC
      LIMIT 50
    `),

    // Count by clinic
    db.execute(sql`
      SELECT
        c.name AS "clinicName",
        COUNT(*) FILTER (WHERE f.status = 'pending')::int   AS pending,
        COUNT(*) FILTER (WHERE f.status = 'completed')::int AS completed,
        COUNT(*) FILTER (WHERE f.status = 'missed')::int    AS missed,
        COUNT(*) FILTER (
          WHERE f.status = 'pending' AND f.due_date < CURRENT_DATE
        )::int AS overdue
      FROM clinics c
      LEFT JOIN follow_ups f ON f.clinic_id = c.id
      GROUP BY c.id, c.name
      HAVING COUNT(f.id) > 0
      ORDER BY pending DESC
      LIMIT 20
    `),
  ]);

  const overdue = overdueResult.rows as Array<{
    id: string;
    dueDate: string;
    notes: string | null;
    status: string;
    patientName: string | null;
    patientPhone: string | null;
    clinicName: string | null;
  }>;

  const perClinic = perClinicResult.rows as Array<{
    clinicName: string;
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Follow-Ups</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Platform-wide follow-up status and overdue tracker.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Pending",
            value: pendingResult.value ?? 0,
            icon: Clock,
            color: "text-amber-700",
            bg: "bg-amber-50",
            iconColor: "text-amber-600",
          },
          {
            label: "Completed",
            value: completedResult.value ?? 0,
            icon: CheckCircle2,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            iconColor: "text-emerald-600",
          },
          {
            label: "Missed",
            value: missedResult.value ?? 0,
            icon: XCircle,
            color: "text-red-600",
            bg: "bg-red-50",
            iconColor: "text-red-500",
          },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            icon: CalendarClock,
            color: "text-teal-700",
            bg: "bg-teal-50",
            iconColor: "text-teal-600",
          },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="pt-4 pb-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <p className={`text-2xl font-bold ${s.color} leading-none`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overdue Follow-Ups */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Overdue Follow-Ups ({overdue.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Clinic</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Days Overdue</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdue.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-slate-400 text-sm"
                  >
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-300" />
                    No overdue follow-ups. Great work!
                  </TableCell>
                </TableRow>
              ) : (
                overdue.map((fu) => {
                  const daysOverdue = Math.floor(
                    (Date.now() - new Date(fu.dueDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <TableRow key={fu.id} className="hover:bg-amber-50/30">
                      <TableCell>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {fu.patientName ?? "Unknown"}
                          </p>
                          {fu.patientPhone && (
                            <p className="text-xs text-slate-400">{fu.patientPhone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {fu.clinicName ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap text-slate-600">
                        {format(new Date(fu.dueDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            daysOverdue > 7
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {daysOverdue}d overdue
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-[200px] truncate">
                        {fu.notes ?? <span className="italic">—</span>}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Per-Clinic Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Follow-Ups by Clinic
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Clinic</TableHead>
                <TableHead className="text-right">Pending</TableHead>
                <TableHead className="text-right">Completed</TableHead>
                <TableHead className="text-right">Missed</TableHead>
                <TableHead className="text-right">Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perClinic.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-16 text-center text-slate-400 text-sm">
                    No data available.
                  </TableCell>
                </TableRow>
              ) : (
                perClinic.map((row) => (
                  <TableRow key={row.clinicName} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-sm text-slate-900">
                      {row.clinicName}
                    </TableCell>
                    <TableCell className="text-right text-sm text-amber-700 font-semibold">
                      {row.pending}
                    </TableCell>
                    <TableCell className="text-right text-sm text-emerald-700">
                      {row.completed}
                    </TableCell>
                    <TableCell className="text-right text-sm text-red-600">
                      {row.missed}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.overdue > 0 ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {row.overdue}
                        </Badge>
                      ) : (
                        <span className="text-sm text-slate-400">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
