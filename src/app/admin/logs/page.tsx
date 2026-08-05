import { getSystemLogs } from "./actions";
import { LogsClient } from "./logs-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "System Logs & Telemetry | Admin Console",
};

export default async function AdminLogsPage() {
  const { notificationLogs, auditLogs, paymentAuditLogs, marketingLogs } = await getSystemLogs();

  // Metrics calculation
  const totalNotifications = notificationLogs.length;
  const failedCount = notificationLogs.filter((l) => l.status === "failed").length;
  const successCount = totalNotifications - failedCount;
  const successRate = totalNotifications > 0 ? ((successCount / totalNotifications) * 100).toFixed(1) : "100.0";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              System Logs & Telemetry
            </h1>
            <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Real-time Audit Trail
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Monitor WhatsApp notification delivery, platform audit activities, payment ledgers, and marketing QR telemetry.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Dispatched</p>
          <p className="text-3xl font-black text-slate-900 mt-2">{totalNotifications.toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Success Rate</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{successRate}%</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Failed Alerts</p>
            {failedCount > 0 && (
              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                Action Required
              </span>
            )}
          </div>
          <p className={`text-3xl font-black mt-2 ${failedCount > 0 ? "text-rose-600" : "text-slate-700"}`}>
            {failedCount}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Channel</p>
          <p className="text-2xl font-black text-[#25D366] mt-2 flex items-center gap-1.5">
            WhatsApp 💬
          </p>
        </div>
      </div>

      {/* Main Multi-Category Client Component */}
      <LogsClient
        notificationLogs={notificationLogs}
        auditLogs={auditLogs}
        paymentAuditLogs={paymentAuditLogs}
        marketingLogs={marketingLogs}
      />
    </div>
  );
}
