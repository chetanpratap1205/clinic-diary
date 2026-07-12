"use client";

import { useState, useTransition } from "react";
import {
  QrCode,
  Plus,
  CheckCircle2,
  Link2,
  Link2Off,
  Download,
  RefreshCw,
  Zap,
  Search,
  Copy,
  Check,
  FileText,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type QrCodeRow = {
  id: string;
  code: string;
  clinicId: string | null;
  assignedAt: Date | null;
  printedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  clinicName: string | null;
  clinicSlug: string | null;
  doctorName: string | null;
  subStatus: string | null;
  subEnd: Date | null;
};

type ClinicOption = {
  id: string;
  name: string;
  slug: string;
  doctorName: string;
};

interface AdminQrClientProps {
  initialCodes: QrCodeRow[];
  allClinics: ClinicOption[];
  baseUrl: string;
}

function getSubBadge(row: QrCodeRow) {
  if (!row.clinicId) return null;
  const isActive =
    row.subStatus === "active" &&
    (!row.subEnd || new Date(row.subEnd) > new Date());
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 border border-teal-200">
        <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
      <AlertCircle className="w-2.5 h-2.5" />
      Expired
    </span>
  );
}

export function AdminQrClient({ initialCodes, allClinics, baseUrl }: AdminQrClientProps) {
  const [codes, setCodes] = useState<QrCodeRow[]>(initialCodes);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ready" | "assigned" | "all">("ready");
  
  const [generateCount, setGenerateCount] = useState(2);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [notes, setNotes] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const refresh = async () => {
    const res = await fetch("/api/admin/qr");
    if (res.ok) {
      const data = await res.json();
      setCodes(data);
    }
  };

  const handleGenerate = () => {
    startTransition(async () => {
      const res = await fetch("/api/admin/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: generateCount }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`✅ Generated ${data.created} new QR codes`);
        setActiveTab("ready");
        await refresh();
      } else {
        toast.error("Failed to generate codes");
      }
    });
  };

  const handleAssign = (qrId: string) => {
    if (!selectedClinicId) {
      toast.error("Select a clinic first");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/qr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrId, clinicId: selectedClinicId, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to assign");
        return;
      }
      toast.success("🎉 QR code assigned! Hand the card to the doctor.", {
        duration: 5000,
      });
      setAssigningId(null);
      setSelectedClinicId("");
      setNotes("");
      await refresh();
    });
  };

  const handleUnassign = (qrId: string, code: string) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/qr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qrId, clinicId: null }),
      });
      if (res.ok) {
        toast.success(`${code} unassigned`);
        await refresh();
      } else {
        toast.error("Failed to unassign");
      }
    });
  };

  const handleDelete = (id: string, code: string) => {
    if (!confirm(`Delete QR Code ${code}? This action cannot be undone.`)) return;
    startTransition(async () => {
      const res = await fetch(`/api/admin/qr?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`${code} deleted`);
        await refresh();
      } else {
        toast.error("Failed to delete");
      }
    });
  };

  const copyRedirectUrl = async (code: string) => {
    await navigator.clipboard.writeText(`${baseUrl}/q/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadQrPdf = (id: string, code: string) => {
    window.open(`/admin/qr/print?ids=${id}`, "_blank");
  };

  const unprintedUnassignedCodes = codes.filter((c) => !c.clinicId && !c.printedAt);

  const handleBatchPrint = () => {
    if (unprintedUnassignedCodes.length === 0) return;
    
    startTransition(async () => {
      const ids = unprintedUnassignedCodes.map(c => c.id);
      const res = await fetch("/api/admin/qr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      
      if (res.ok) {
        toast.success("Codes marked as printed!");
        const idParams = ids.join(",");
        window.open(`/admin/qr/print?ids=${idParams}`, "_blank");
        await refresh();
      } else {
        toast.error("Failed to mark as printed");
      }
    });
  };

  const filtered = codes.filter((c) => {
    const matchesSearch =
      !search ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.clinicName?.toLowerCase().includes(search.toLowerCase()) ||
      c.doctorName?.toLowerCase().includes(search.toLowerCase());
      
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "assigned" && !!c.clinicId) ||
      (activeTab === "ready" && !c.clinicId);
      
    return matchesSearch && matchesTab;
  });

  const stats = {
    total: codes.length,
    assigned: codes.filter((c) => c.clinicId).length,
    ready: codes.filter((c) => !c.clinicId).length,
    active: codes.filter((c) => {
      if (!c.clinicId) return false;
      return (
        c.subStatus === "active" &&
        (!c.subEnd || new Date(c.subEnd) > new Date())
      );
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-teal-600/20">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            QR Code Manager
          </h1>
          <p className="text-slate-500 text-sm mt-1">Generate, print, and assign QR codes to clinics.</p>
        </div>
        <button
          onClick={() => startTransition(refresh)}
          disabled={isPending}
          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-teal-600 shadow-sm transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Generated", value: stats.total, color: "text-slate-800" },
          { label: "Ready to Assign", value: stats.ready, color: "text-teal-600" },
          { label: "Assigned", value: stats.assigned, color: "text-indigo-600" },
          { label: "Active Clinics", value: stats.active, color: "text-teal-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
            <p className={`text-3xl font-black ${s.color} leading-none mb-1`}>{s.value}</p>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <span className="text-slate-700 font-bold text-sm">Generate new codes:</span>
          <input
            type="number"
            min={1}
            max={50}
            value={generateCount}
            onChange={(e) => setGenerateCount(Number(e.target.value))}
            className="w-16 bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold text-center rounded-xl px-2 py-2 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>

        {unprintedUnassignedCodes.length > 0 && (
          <div className="flex items-center gap-4 bg-teal-50 p-2.5 rounded-xl border border-teal-100">
            <div className="text-right">
              <span className="text-teal-800 font-bold text-sm block leading-none mb-1">
                {unprintedUnassignedCodes.length} Unprinted
              </span>
              <span className="text-teal-600/70 text-[10px] uppercase font-bold tracking-wide">
                Will yield {unprintedUnassignedCodes.length * 2} cards
              </span>
            </div>
            <button
              onClick={handleBatchPrint}
              disabled={isPending}
              className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-md shadow-teal-500/20"
            >
              <FileText className="w-4 h-4" />
              Print Batch
            </button>
          </div>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex bg-slate-100 rounded-xl p-1 w-full sm:w-auto">
          {[
            { id: "ready", label: "Ready to Assign", count: stats.ready },
            { id: "assigned", label: "Assigned", count: stats.assigned },
            { id: "all", label: "All Codes", count: stats.total },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 sm:flex-none px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-white text-teal-800 shadow-sm border border-slate-200/50"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search code or clinic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-300 text-slate-900 text-sm pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 placeholder-slate-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* QR Code List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm">
            <QrCode className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-slate-700 font-bold mb-1">No QR Codes Found</h3>
            <p className="text-sm text-slate-500">
              {search ? "Try adjusting your search terms." : "Generate new codes to get started."}
            </p>
          </div>
        )}

        {filtered.map((row) => {
          const isAssigning = assigningId === row.id;
          const redirectUrl = `${baseUrl}/q/${row.code}`;
          const isActive = row.clinicId && row.subStatus === "active" && (!row.subEnd || new Date(row.subEnd) > new Date());

          return (
            <div
              key={row.id}
              className={`bg-white border rounded-2xl p-4 transition-all shadow-sm ${
                row.clinicId
                  ? isActive
                    ? "border-teal-200 hover:border-teal-300"
                    : "border-rose-200 hover:border-rose-300"
                  : "border-slate-200 hover:border-teal-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                
                {/* ID & Status */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    row.clinicId
                      ? isActive
                        ? "bg-teal-50 text-teal-600"
                        : "bg-rose-50 text-rose-600"
                      : "bg-teal-50 text-teal-600"
                  }`}>
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-black text-slate-800 font-mono text-lg tracking-tight">
                      {row.code}
                    </div>
                    {row.clinicId ? getSubBadge(row) : (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        row.printedAt 
                          ? "bg-teal-50 text-teal-600 border-teal-200" 
                          : "bg-amber-50 text-amber-600 border-amber-200"
                      }`}>
                        {row.printedAt ? "✓ Printed" : "Needs Printing"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Assignment Details */}
                <div className="flex-1 min-w-0">
                  {row.clinicId ? (
                    <div>
                      <p className="text-slate-800 font-semibold truncate text-sm">
                        {row.doctorName} <span className="text-slate-400 font-normal ml-1">· {row.clinicName}</span>
                      </p>
                      {row.notes && (
                        <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5" />
                          {row.notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-sm">
                      Unassigned — ready for distribution.
                    </div>
                  )}
                  <p className="text-teal-500/70 text-[10px] mt-1 font-mono truncate hover:text-teal-600 transition-colors cursor-default">
                    {redirectUrl}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <button
                    onClick={() => copyRedirectUrl(row.code)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-teal-600 transition-all"
                    title="Copy URL"
                  >
                    {copiedCode === row.code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => downloadQrPdf(row.id, row.code)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-teal-600 transition-all"
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {row.clinicId ? (
                    <button
                      onClick={() => handleUnassign(row.id, row.code)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-semibold text-xs transition-all"
                    >
                      <Link2Off className="w-4 h-4" />
                      Unassign
                    </button>
                  ) : (
                    <button
                      onClick={() => setAssigningId(isAssigning ? null : row.id)}
                      disabled={isPending}
                      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                        isAssigning
                          ? "bg-teal-600 text-white shadow-md shadow-teal-500/20"
                          : "bg-slate-50 border border-slate-200 hover:bg-teal-50 text-slate-600 hover:text-teal-600"
                      }`}
                    >
                      <Link2 className="w-4 h-4" />
                      Assign
                    </button>
                  )}

                  {!row.clinicId && (
                    <button
                      onClick={() => handleDelete(row.id, row.code)}
                      disabled={isPending}
                      className="p-2.5 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-400 hover:text-rose-500 transition-all ml-1"
                      title="Delete QR Code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Assignment Modal */}
              {isAssigning && (
                <div className="mt-4 p-4 bg-teal-50/50 rounded-xl border border-teal-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-teal-900">Assign QR Code {row.code}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select
                      value={selectedClinicId}
                      onChange={(e) => setSelectedClinicId(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 shadow-sm"
                    >
                      <option value="">— Select Clinic —</option>
                      {allClinics.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.doctorName} · {c.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Optional notes (e.g. handed out during demo)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 text-slate-900 text-sm px-3 py-2.5 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 placeholder-slate-400 shadow-sm"
                    />
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setAssigningId(null);
                        setSelectedClinicId("");
                        setNotes("");
                      }}
                      className="px-4 py-2 rounded-lg text-slate-500 hover:text-slate-700 text-sm font-semibold transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAssign(row.id)}
                      disabled={isPending || !selectedClinicId}
                      className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2 rounded-lg transition-all active:scale-95 shadow-md shadow-teal-500/20"
                    >
                      {isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Confirm Assignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
