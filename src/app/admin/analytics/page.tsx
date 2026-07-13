import { db } from "@/db";
import { appointments, clinics, reminderLogs } from "@/db/schema";
import { sql } from "drizzle-orm";
import { AnalyticsCharts } from "../_components/analytics-charts";
import { format, subDays } from "date-fns";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics | ClinicDiary Admin" };

export default async function AnalyticsPage() {
  const thirtyDaysAgo = format(subDays(new Date(), 30), "yyyy-MM-dd");

  const [appointmentTrendResult, topClinicsResult, channelStatsResult] =
    await Promise.all([
      // Daily appointment counts for last 30 days
      db.execute(sql`
        SELECT
          TO_CHAR(appointment_date::date, 'MM/DD') AS date,
          COUNT(*)::int AS count,
          appointment_date AS sort_key
        FROM appointments
        WHERE appointment_date >= ${thirtyDaysAgo}::date
        GROUP BY appointment_date
        ORDER BY appointment_date ASC
      `),

      // Top 5 clinics by all-time appointment volume
      db.execute(sql`
        SELECT
          LEFT(c.name, 18) AS name,
          COUNT(a.id)::int AS count
        FROM clinics c
        LEFT JOIN appointments a ON a.clinic_id = c.id
        GROUP BY c.id, c.name
        ORDER BY count DESC
        LIMIT 5
      `),

      // Reminder delivery stats by channel
      db.execute(sql`
        SELECT
          INITCAP(channel) AS channel,
          COUNT(*) FILTER (WHERE status = 'sent')::int   AS sent,
          COUNT(*) FILTER (WHERE status = 'failed')::int AS failed
        FROM reminder_logs
        GROUP BY channel
        ORDER BY channel
      `),
    ]);

  const appointmentTrend = (
    appointmentTrendResult.rows as Array<{ date: string; count: number }>
  ).map((r) => ({ date: r.date, count: Number(r.count) }));

  const topClinics = (
    topClinicsResult.rows as Array<{ name: string; count: number }>
  ).map((r) => ({ name: r.name, count: Number(r.count) }));

  const channelStats = (
    channelStatsResult.rows as Array<{
      channel: string;
      sent: number;
      failed: number;
    }>
  ).map((r) => ({
    channel: r.channel,
    sent: Number(r.sent),
    failed: Number(r.failed),
  }));

  // Summary numbers
  const totalInPeriod = appointmentTrend.reduce((s, r) => s + r.count, 0);
  const totalReminders = channelStats.reduce((s, r) => s + r.sent + r.failed, 0);
  const sentReminders = channelStats.reduce((s, r) => s + r.sent, 0);
  const deliveryRate =
    totalReminders > 0
      ? ((sentReminders / totalReminders) * 100).toFixed(1)
      : "—";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Analytics</h2>
        <p className="text-slate-500 mt-1 text-sm">
          Platform-wide trends and operational metrics.
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Appts (30d)",
            value: totalInPeriod.toLocaleString(),
            color: "text-sky-700",
          },
          {
            label: "Avg/Day (30d)",
            value:
              appointmentTrend.length > 0
                ? (totalInPeriod / appointmentTrend.length).toFixed(1)
                : "0",
            color: "text-slate-900",
          },
          {
            label: "Reminders Sent",
            value: sentReminders.toLocaleString(),
            color: "text-emerald-700",
          },
          {
            label: "Delivery Rate",
            value: `${deliveryRate}%`,
            color: "text-teal-700",
          },
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

      {/* Charts (client component) */}
      <AnalyticsCharts
        appointmentTrend={appointmentTrend}
        topClinics={topClinics}
        channelStats={channelStats}
      />
    </div>
  );
}
