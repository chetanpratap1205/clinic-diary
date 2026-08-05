"use client";

import { useState, useTransition, useMemo } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MessageCircle,
  Smartphone,
  Mail,
  CalendarClock,
  Search,
  FileSpreadsheet,
  RotateCcw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  ShieldCheck,
  CreditCard,
  QrCode,
  Copy,
  Clock,
  Phone,
  Building2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { retryNotification } from "./actions";

interface LogsClientProps {
  notificationLogs: any[];
  auditLogs: any[];
  paymentAuditLogs: any[];
  marketingLogs: any[];
}

export function LogsClient({
  notificationLogs,
  auditLogs,
  paymentAuditLogs,
  marketingLogs,
}: LogsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("notifications");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Selected Log for Inspector Modal
  const [inspectorLog, setInspectorLog] = useState<any | null>(null);

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notificationLogs.filter((l) => {
      const matchesSearch =
        (l.clinicName && l.clinicName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.patientName && l.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (l.recipientPhone && l.recipientPhone.includes(searchQuery)) ||
        (l.message && l.message.toLowerCase().includes(searchQuery.toLowerCase())) ||
        l.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || l.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [notificationLogs, searchQuery, statusFilter]);

  // Handle Retry Notification
  const handleRetry = (logId: string) => {
    startTransition(async () => {
      const res = await retryNotification(logId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Notification re-queued & sent successfully ✓");
        setInspectorLog(null);
      }
    });
  };

  // Helper: Channel Icon & Badge
  const renderChannelBadge = (channel: string) => {
    const ch = (channel || "whatsapp").toLowerCase();

    if (ch === "whatsapp") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1EBE5A] bg-[#E7FDE1] border border-[#c4efb9] px-2.5 py-0.5 rounded-full">
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </span>
      );
    }

    if (ch === "sms") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
          <Smartphone className="w-3.5 h-3.5 text-blue-500" />
          SMS
        </span>
      );
    }

    if (ch === "email") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
          <Mail className="w-3.5 h-3.5 text-purple-500" />
          Email
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
        <CalendarClock className="w-3.5 h-3.5 text-slate-500" />
        {channel}
      </span>
    );
  };

  // Export CSV Audit Trail
  const exportLogsCSV = () => {
    const headers = ["Log ID", "Time", "Channel", "Trigger Type", "Clinic Name", "Patient Name", "Recipient Phone", "Status", "Message"];
    const rows = filteredNotifications.map((l) => [
      l.id,
      new Date(l.sentAt).toLocaleString(),
      l.channel,
      l.triggerType,
      `"${(l.clinicName || "Unknown").replace(/"/g, '""')}"`,
      `"${(l.patientName || "N/A").replace(/"/g, '""')}"`,
      l.recipientPhone || "N/A",
      l.status,
      `"${(l.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Notification_System_Logs_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Notification Audit Log CSV downloaded 📄");
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs & Filter Header */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <TabsList className="bg-slate-100 p-1 flex-wrap">
            <TabsTrigger value="notifications" className="text-xs font-bold gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-[#1EBE5A]" />
              WhatsApp Notifications ({notificationLogs.length})
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs font-bold gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Platform Audit ({auditLogs.length})
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs font-bold gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              Payment Ledger ({paymentAuditLogs.length})
            </TabsTrigger>
            <TabsTrigger value="marketing" className="text-xs font-bold gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-teal-600" />
              QR Scans ({marketingLogs.length})
            </TabsTrigger>
          </TabsList>

          {/* Right Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            {activeTab === "notifications" && (
              <>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 text-xs h-8 bg-slate-50 border-slate-200"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportLogsCSV}
                  className="text-xs gap-1.5 h-8 text-slate-700 border-slate-200 hover:bg-slate-50"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  Export CSV
                </Button>
              </>
            )}
          </div>
        </div>

        {/* ─── TAB 1: WHATSAPP NOTIFICATION LOGS ─────────────────────────────────── */}
        <TabsContent value="notifications" className="m-0">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="whitespace-nowrap font-bold text-slate-700">Sent Time</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-slate-700">Channel</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-slate-700">Trigger Type</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-slate-700">Clinic & Recipient</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-slate-700">Delivery Status</TableHead>
                    <TableHead className="whitespace-nowrap font-bold text-slate-700 text-right">Inspect</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <MessageCircle className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-700">No notification logs found</p>
                          <p className="text-xs text-slate-400">Automated WhatsApp messages will appear here live.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredNotifications.map((log) => {
                      const isFailed = log.status === "failed";

                      return (
                        <TableRow key={log.id} className="hover:bg-slate-50/60 transition-colors">
                          <TableCell className="whitespace-nowrap min-w-[130px]">
                            <span className="text-xs font-semibold text-slate-800 block">
                              {format(new Date(log.sentAt), "MMM d, h:mm a")}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              #{log.id.split("-")[0]}
                            </span>
                          </TableCell>

                          <TableCell className="min-w-[120px]">
                            {renderChannelBadge(log.channel)}
                          </TableCell>

                          <TableCell className="min-w-[160px]">
                            <span className="text-xs font-medium text-slate-700 capitalize bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {(log.triggerType || "confirmation").replace(/_/g, " ")}
                            </span>
                          </TableCell>

                          <TableCell className="min-w-[200px]">
                            <p className="font-bold text-slate-900 text-sm leading-snug">{log.clinicName || "Doctor Diary Clinic"}</p>
                            <p className="text-xs text-slate-500">To: {log.patientName || "Patient"}</p>
                          </TableCell>

                          <TableCell className="min-w-[110px]">
                            {isFailed ? (
                              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold gap-1">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Failed
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Sent
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="text-right whitespace-nowrap">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setInspectorLog(log)}
                              className="h-8 text-xs gap-1 text-slate-700 border-slate-200 hover:bg-slate-50"
                            >
                              <Eye className="w-3.5 h-3.5 text-teal-600" />
                              Inspect
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>

        {/* ─── TAB 2: PLATFORM AUDIT LOGS ────────────────────────────────────────── */}
        <TabsContent value="audit" className="m-0">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Timestamp</TableHead>
                  <TableHead className="font-bold text-slate-700">Event Type</TableHead>
                  <TableHead className="font-bold text-slate-700">Doctor / Lead</TableHead>
                  <TableHead className="font-bold text-slate-700">Growth Partner</TableHead>
                  <TableHead className="font-bold text-slate-700">Activity Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No platform audit logs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {format(new Date(log.createdAt), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-xs bg-blue-50 text-blue-700 border-blue-200 font-bold">
                          {log.type.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">
                        {log.doctorName || "Unknown Doctor"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {log.partnerName || "Platform System"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                        {log.notes || "Status updated"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ─── TAB 3: PAYMENT LEDGER LOGS ────────────────────────────────────────── */}
        <TabsContent value="payments" className="m-0">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Paid Date</TableHead>
                  <TableHead className="font-bold text-slate-700">Clinic</TableHead>
                  <TableHead className="font-bold text-slate-700">Plan</TableHead>
                  <TableHead className="font-bold text-slate-700">Amount</TableHead>
                  <TableHead className="font-bold text-slate-700">Razorpay Payment ID</TableHead>
                  <TableHead className="font-bold text-slate-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentAuditLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                      No payment ledger logs recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  paymentAuditLogs.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {format(new Date(p.paidAt), "MMM d, yyyy h:mm a")}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 text-sm">
                        {p.clinicName || "Doctor Clinic"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-700">
                        {p.planName}
                      </TableCell>
                      <TableCell className="font-black text-emerald-600">
                        ₹{Math.round(p.amountPaise / 100).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {p.razorpayPaymentId}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase text-[10px]">
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* ─── TAB 4: MARKETING SCAN TELEMETRY ───────────────────────────────────── */}
        <TabsContent value="marketing" className="m-0">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-bold text-slate-700">Scan Time</TableHead>
                  <TableHead className="font-bold text-slate-700">Campaign Name & Code</TableHead>
                  <TableHead className="font-bold text-slate-700">Referrer</TableHead>
                  <TableHead className="font-bold text-slate-700">User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketingLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                      No marketing scan telemetry recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  marketingLogs.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {format(new Date(m.clickedAt), "MMM d, h:mm a")}
                      </TableCell>
                      <TableCell>
                        <p className="font-bold text-slate-900 text-xs">{m.campaignName || "QR Campaign"}</p>
                        <span className="font-mono text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                          /m/{m.campaignCode}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                        {m.referrer || "Direct Scan"}
                      </TableCell>
                      <TableCell className="text-[11px] font-mono text-slate-400 max-w-xs truncate" title={m.userAgent}>
                        {m.userAgent || "Mobile Browser"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* ─── LOG INSPECTOR & PAYLOAD DRAWER MODAL ─────────────────────────────── */}
      {inspectorLog && (
        <Dialog open={!!inspectorLog} onOpenChange={() => setInspectorLog(null)}>
          <DialogContent className="w-[95vw] sm:max-w-[550px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#1EBE5A]" />
                WhatsApp Notification Inspector
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4 text-xs">
              {/* Meta Card */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Clinic:</span>
                  <span className="font-bold text-slate-900 text-sm">{inspectorLog.clinicName || "Doctor Diary"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Recipient Patient:</span>
                  <span className="font-bold text-slate-900 text-sm">{inspectorLog.patientName || "Patient"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Channel & Type:</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {renderChannelBadge(inspectorLog.channel)}
                    <span className="capitalize font-semibold text-slate-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {(inspectorLog.triggerType || "confirmation").replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Delivery State:</span>
                  <span
                    className={`font-bold inline-block mt-0.5 px-2 py-0.5 rounded-full border ${
                      inspectorLog.status === "failed"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {inspectorLog.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Rendered Message Body Preview */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rendered Message Payload
                </Label>
                <div className="bg-[#E7FDE1] rounded-xl p-4 text-[13px] text-slate-800 leading-relaxed whitespace-pre-wrap font-sans border border-[#c4efb9] relative shadow-inner">
                  {inspectorLog.message || "No message content recorded."}
                </div>
              </div>

              {/* Error Traceback (if failed) */}
              {inspectorLog.status === "failed" && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 space-y-1">
                  <p className="font-bold flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    API Delivery Failure Error
                  </p>
                  <p className="font-mono text-[11px]">
                    {inspectorLog.errorPayload || "WhatsApp API connection timeout. Number could not be reached."}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {inspectorLog.status === "failed" && (
                  <Button
                    onClick={() => handleRetry(inspectorLog.id)}
                    disabled={isPending}
                    className="flex-1 bg-[#1EBE5A] hover:bg-[#18A24B] text-white font-bold gap-2"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                    Retry Resend WhatsApp ↗
                  </Button>
                )}
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(inspectorLog.message || "");
                    toast.success("Message text copied!");
                  }}
                  variant="outline"
                  className="font-bold gap-1 text-slate-700 border-slate-300"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
