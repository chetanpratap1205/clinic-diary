"use client";

import { useState, useTransition, useMemo } from "react";
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
  StickyNote,
  Eye,
  X,
  Printer,
  Sparkles,
  TrendingUp,
  BarChart3,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

export type QrCodeRow = {
  id: string;
  code: string;
  clinicId: string | null;
  assignedAt: Date | null;
  printedAt: Date | null;
  notes: string | null;
  usageType: string;
  createdAt: Date;
  clinicName: string | null;
  clinicSlug: string | null;
  doctorName: string | null;
  doctorSpecialty?: string | null;
  clinicLogo?: string | null;
  subStatus: string | null;
  subEnd: Date | null;
  totalScans?: number;
  qrAppts?: number;
};

export type ClinicOption = {
  id: string;
  name: string;
  slug: string;
  doctorName: string;
  specialty?: string | null;
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
  
  // Filtering & Tabs state
  const [activeTab, setActiveTab] = useState<"all" | "ready" | "assigned" | "printed" | "unprinted">("ready");
  const [placementFilter, setPlacementFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "scans" | "appts" | "code">("newest");
  
  // Creation & Single assignment state
  const [generateCount, setGenerateCount] = useState(5);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [notes, setNotes] = useState("");
  const [usageType, setUsageType] = useState("general");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Multi-Select Batch State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchClinicId, setBatchClinicId] = useState("");
  const [batchUsageType, setBatchUsageType] = useState("general");

  // Live Interactive Preview Modal State
  const [previewCodeRow, setPreviewCodeRow] = useState<QrCodeRow | null>(null);
  const [previewDataUri, setPreviewDataUri] = useState<string | null>(null);
  const [previewFormat, setPreviewFormat] = useState<"stand" | "poster" | "sticker">("stand");

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
        body: JSON.stringify({ qrId, clinicId: selectedClinicId, notes, usageType }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to assign");
        return;
      }
      toast.success("🎉 QR code assigned! Ready for deployment.", { duration: 4000 });
      setAssigningId(null);
      setSelectedClinicId("");
      setNotes("");
      setUsageType("general");
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
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        await refresh();
      } else {
        toast.error("Failed to delete");
      }
    });
  };

  // ── Batch Operations ────────────────────────────────────────────────────────
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBatchAssign = () => {
    if (selectedIds.size === 0 || !batchClinicId) {
      toast.error("Select a clinic and at least one QR code");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/admin/qr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrIds: Array.from(selectedIds),
          clinicId: batchClinicId,
          usageType: batchUsageType,
        }),
      });
      if (res.ok) {
        toast.success(`🎉 Assigned ${selectedIds.size} codes to clinic!`);
        setSelectedIds(new Set());
        setBatchClinicId("");
        await refresh();
      } else {
        toast.error("Failed batch assignment");
      }
    });
  };

  const handleBatchUnassign = () => {
    if (selectedIds.size === 0) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/qr", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrIds: Array.from(selectedIds),
          clinicId: null,
        }),
      });
      if (res.ok) {
        toast.success(`Unassigned ${selectedIds.size} codes`);
        setSelectedIds(new Set());
        await refresh();
      } else {
        toast.error("Failed batch unassign");
      }
    });
  };

  const handleBatchMarkPrinted = () => {
    if (selectedIds.size === 0) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/qr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        toast.success(`Marked ${selectedIds.size} codes as printed!`);
        await refresh();
      } else {
        toast.error("Failed to mark printed");
      }
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected QR codes?`)) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/qr", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });
      if (res.ok) {
        toast.success(`Deleted ${selectedIds.size} codes`);
        setSelectedIds(new Set());
        await refresh();
      } else {
        toast.error("Failed batch delete");
      }
    });
  };

  const handleBatchPrint = (format: "poster" | "stand" | "sticker" | "kit" | "sales-pack") => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    // Mark as printed and open print window
    startTransition(async () => {
      await fetch("/api/admin/qr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      await refresh();
    });

    if (format === "poster") window.open(`/admin/qr/print?ids=${ids.join(",")}`, "_blank");
    else if (format === "stand") window.open(`/admin/qr/print-stand?ids=${ids.join(",")}`, "_blank");
    else if (format === "sticker") window.open(`/admin/qr/print-stickers?ids=${ids.join(",")}`, "_blank");
    else if (format === "sales-pack") window.open(`/api/admin/qr/sales-pack?ids=${ids.join(",")}`, "_blank");
    else window.open(`/admin/qr/print-kit?ids=${ids.join(",")}`, "_blank");
  };

  const copyRedirectUrl = async (code: string) => {
    await navigator.clipboard.writeText(`${baseUrl}/q/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const printSingleFormat = (id: string, format: "poster" | "stand" | "sticker" | "kit" | "sales-pack") => {
    if (format === "poster") window.open(`/admin/qr/print?ids=${id}`, "_blank");
    else if (format === "stand") window.open(`/admin/qr/print-stand?ids=${id}`, "_blank");
    else if (format === "sticker") window.open(`/admin/qr/print-stickers?ids=${id}`, "_blank");
    else if (format === "sales-pack") window.open(`/api/admin/qr/sales-pack?id=${id}`, "_blank");
    else window.open(`/admin/qr/print-kit?ids=${id}`, "_blank");
  };

  // Open Live Mockup Preview Modal
  const openPreviewModal = async (row: QrCodeRow) => {
    setPreviewCodeRow(row);
    try {
      const dataUri = await QRCode.toDataURL(`${baseUrl}/q/${row.code}`, {
        width: 1000,
        margin: 2,
        color: { dark: "#060606", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      setPreviewDataUri(dataUri);
    } catch (_err) {
      toast.error("Could not generate QR preview");
    }
  };

  // Filter & Sorting Computation
  const filtered = useMemo(() => {
    return codes
      .filter((c) => {
        const matchesSearch =
          !search ||
          c.code.toLowerCase().includes(search.toLowerCase()) ||
          c.clinicName?.toLowerCase().includes(search.toLowerCase()) ||
          c.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
          c.notes?.toLowerCase().includes(search.toLowerCase());
          
        const matchesTab =
          activeTab === "all" ||
          (activeTab === "assigned" && !!c.clinicId) ||
          (activeTab === "ready" && !c.clinicId) ||
          (activeTab === "printed" && !!c.printedAt) ||
          (activeTab === "unprinted" && !c.printedAt);

        const matchesPlacement =
          placementFilter === "all" || c.usageType === placementFilter;
          
        return matchesSearch && matchesTab && matchesPlacement;
      })
      .sort((a, b) => {
        if (sortOption === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortOption === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortOption === "scans") return (b.totalScans || 0) - (a.totalScans || 0);
        if (sortOption === "appts") return (b.qrAppts || 0) - (a.qrAppts || 0);
        if (sortOption === "code") return a.code.localeCompare(b.code);
        return 0;
      });
  }, [codes, search, activeTab, placementFilter, sortOption]);

  // Aggregate Funnel Metrics
  const stats = useMemo(() => {
    const totalScans = codes.reduce((acc, c) => acc + (c.totalScans || 0), 0);
    const totalAppts = codes.reduce((acc, c) => acc + (c.qrAppts || 0), 0);
    const conversionRate = totalScans > 0 ? ((totalAppts / totalScans) * 100).toFixed(1) : "0.0";

    return {
      total: codes.length,
      assigned: codes.filter((c) => c.clinicId).length,
      ready: codes.filter((c) => !c.clinicId).length,
      printed: codes.filter((c) => c.printedAt).length,
      active: codes.filter((c) => {
        if (!c.clinicId) return false;
        return (
          c.subStatus === "active" &&
          (!c.subEnd || new Date(c.subEnd) > new Date())
        );
      }).length,
      totalScans,
      totalAppts,
      conversionRate,
      receptionCount: codes.filter((c) => c.usageType === "reception_desk").length,
      standeeCount: codes.filter((c) => c.usageType === "acrylic_stand").length,
      windowCount: codes.filter((c) => c.usageType === "outside_window").length,
      stickerCount: codes.filter((c) => c.usageType === "patient_file_sticker").length,
    };
  }, [codes]);

  const unprintedUnassignedCodes = codes.filter((c) => !c.clinicId && !c.printedAt);

  return (
    <div className="space-y-6">
      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md shadow-teal-600/20">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            Enterprise QR Management Studio
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate, customize physical standees, track scan conversion funnel, and dispatch kits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => startTransition(refresh)}
            disabled={isPending}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold shadow-xs transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPending ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ══ STATS & CONVERSION FUNNEL STRIP ═════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Total Generated</span>
          <p className="text-2xl font-black text-slate-800 leading-none my-1">{stats.total}</p>
          <span className="text-slate-500 text-[10px] font-medium">{stats.printed} Printed</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Ready to Assign</span>
          <p className="text-2xl font-black text-teal-600 leading-none my-1">{stats.ready}</p>
          <span className="text-teal-600/80 text-[10px] font-semibold">Unallocated</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Assigned Clinics</span>
          <p className="text-2xl font-black text-indigo-600 leading-none my-1">{stats.assigned}</p>
          <span className="text-indigo-600/80 text-[10px] font-semibold">{stats.active} Active Subs</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Total Scans Logged</span>
          <p className="text-2xl font-black text-emerald-600 leading-none my-1">{stats.totalScans}</p>
          <span className="text-emerald-600/80 text-[10px] font-semibold">Reception & Standees</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between shadow-xs">
          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">QR Appointments</span>
          <p className="text-2xl font-black text-amber-500 leading-none my-1">{stats.totalAppts}</p>
          <span className="text-amber-600/80 text-[10px] font-semibold">Booked tokens</span>
        </div>

        <div className="bg-gradient-to-br from-teal-700 to-emerald-900 text-white rounded-2xl p-3.5 flex flex-col justify-between shadow-md shadow-teal-900/10">
          <span className="text-teal-200 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-teal-300" /> Funnel Conv %
          </span>
          <p className="text-2xl font-black text-white leading-none my-1">{stats.conversionRate}%</p>
          <span className="text-teal-200/80 text-[10px] font-semibold">Scans ➔ Appt %</span>
        </div>
      </div>

      {/* ══ ACTION BAR (BATCH CREATION & PRINTING) ══════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <span className="text-slate-700 font-bold text-sm">Generate Codes:</span>
          <input
            type="number"
            min={1}
            max={100}
            value={generateCount}
            onChange={(e) => setGenerateCount(Number(e.target.value))}
            className="w-16 bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold text-center rounded-xl px-2 py-2 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />
          <button
            onClick={handleGenerate}
            disabled={isPending}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Batch Create
          </button>
        </div>

        {unprintedUnassignedCodes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-teal-50/70 p-2 rounded-xl border border-teal-100">
            <span className="text-teal-800 font-bold text-xs px-2">
              {unprintedUnassignedCodes.length} Unprinted Ready
            </span>
            <button
              onClick={() => {
                const ids = unprintedUnassignedCodes.map(c => c.id);
                setSelectedIds(new Set(ids));
                handleBatchPrint("poster");
              }}
              disabled={isPending}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5" />
              Posters
            </button>
            <button
              onClick={() => {
                const ids = unprintedUnassignedCodes.map(c => c.id);
                setSelectedIds(new Set(ids));
                handleBatchPrint("stand");
              }}
              disabled={isPending}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              Standees
            </button>
            <button
              onClick={() => {
                const ids = unprintedUnassignedCodes.map(c => c.id);
                setSelectedIds(new Set(ids));
                handleBatchPrint("sticker");
              }}
              disabled={isPending}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-2xs"
            >
              <StickyNote className="w-3.5 h-3.5" />
              Stickers
            </button>
            <button
              onClick={() => {
                const ids = unprintedUnassignedCodes.map(c => c.id);
                setSelectedIds(new Set(ids));
                handleBatchPrint("sales-pack");
              }}
              disabled={isPending}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Sales Pack
            </button>
          </div>
        )}
      </div>

      {/* ══ BATCH ACTION BAR (WHEN ITEMS ARE SELECTED) ══════════════════════ */}
      {selectedIds.size > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="bg-teal-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-full">
              {selectedIds.size} Selected
            </span>
            <span className="text-xs text-slate-300 font-semibold">Bulk Actions Menu:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Batch Assign Dropdowns */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <select
                value={batchClinicId}
                onChange={(e) => setBatchClinicId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-teal-400"
              >
                <option value="">— Select Clinic —</option>
                {allClinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.doctorName} · {c.name}
                  </option>
                ))}
              </select>

              <select
                value={batchUsageType}
                onChange={(e) => setBatchUsageType(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-teal-400"
              >
                <option value="general">General</option>
                <option value="reception_desk">Reception Desk</option>
                <option value="acrylic_stand">Acrylic Standee</option>
                <option value="outside_window">Outside Window</option>
                <option value="patient_file_sticker">Sticker</option>
              </select>

              <button
                onClick={handleBatchAssign}
                disabled={isPending || !batchClinicId}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg disabled:opacity-50 transition-all"
              >
                Assign
              </button>
            </div>

            <button
              onClick={handleBatchUnassign}
              disabled={isPending}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3 py-2 rounded-xl transition-all"
            >
              Unassign
            </button>

            <button
              onClick={handleBatchMarkPrinted}
              disabled={isPending}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-3 py-2 rounded-xl transition-all"
            >
              Mark Printed
            </button>

            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => handleBatchPrint("poster")}
                className="text-xs font-semibold text-slate-200 hover:text-white px-2 py-1"
                title="Print A4 Posters"
              >
                Posters
              </button>
              <button
                onClick={() => handleBatchPrint("stand")}
                className="text-xs font-semibold text-slate-200 hover:text-white px-2 py-1"
                title="Print Acrylic Standees"
              >
                Standees
              </button>
              <button
                onClick={() => handleBatchPrint("sticker")}
                className="text-xs font-semibold text-slate-200 hover:text-white px-2 py-1"
                title="Print Stickers"
              >
                Stickers
              </button>
              <button
                onClick={() => handleBatchPrint("kit")}
                className="bg-teal-500 text-slate-950 font-bold text-xs px-2.5 py-1 rounded-lg hover:bg-teal-400"
                title="Print Full Enterprise Kit"
              >
                Print Kit
              </button>
            </div>

            <button
              onClick={handleBatchDelete}
              disabled={isPending}
              className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white font-semibold text-xs px-3 py-2 rounded-xl border border-rose-500/30 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ══ TABS, SEARCH & FILTER CONTROLS ══════════════════════════════════ */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap bg-slate-100 rounded-xl p-1 w-full lg:w-auto">
            {[
              { id: "ready", label: "Ready to Assign", count: stats.ready },
              { id: "assigned", label: "Assigned", count: stats.assigned },
              { id: "printed", label: "Printed", count: stats.printed },
              { id: "all", label: "All Codes", count: stats.total },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-teal-800 shadow-xs border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search, Placement & Sort */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search code, doctor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 placeholder-slate-400"
              />
            </div>

            {/* Placement Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={placementFilter}
                onChange={(e) => setPlacementFilter(e.target.value)}
                className="bg-transparent focus:outline-none text-xs font-bold text-slate-800"
              >
                <option value="all">All Placements</option>
                <option value="reception_desk">Reception Desk</option>
                <option value="acrylic_stand">Acrylic Standee</option>
                <option value="outside_window">Outside Window</option>
                <option value="patient_file_sticker">Sticker Sheet</option>
                <option value="general">General</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
                className="bg-transparent focus:outline-none text-xs font-bold text-slate-800"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="scans">Sort: Most Scans</option>
                <option value="appts">Sort: Most Appts</option>
                <option value="code">Sort: Code A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Master Select Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filtered.length > 0 && selectedIds.size === filtered.length}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
            />
            <span>Select all {filtered.length} visible codes</span>
          </label>
          <span>Showing {filtered.length} of {codes.length} codes</span>
        </div>
      </div>

      {/* ══ QR CODES LIST ═══════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed shadow-xs">
            <QrCode className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-slate-700 font-bold mb-1">No QR Codes Found</h3>
            <p className="text-sm text-slate-500">
              {search || placementFilter !== "all" ? "Try adjusting your search filters." : "Generate new codes to get started."}
            </p>
          </div>
        )}

        {filtered.map((row) => {
          const isSelected = selectedIds.has(row.id);
          const isAssigning = assigningId === row.id;
          const redirectUrl = `${baseUrl}/q/${row.code}`;
          const isActive = row.clinicId && row.subStatus === "active" && (!row.subEnd || new Date(row.subEnd) > new Date());

          return (
            <div
              key={row.id}
              className={`bg-white border rounded-2xl p-4 transition-all shadow-xs ${
                isSelected
                  ? "border-teal-500 ring-2 ring-teal-100 bg-teal-50/20"
                  : row.clinicId
                  ? isActive
                    ? "border-teal-200 hover:border-teal-300"
                    : "border-rose-200 hover:border-rose-300"
                  : "border-slate-200 hover:border-teal-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                
                {/* Select Checkbox & ID */}
                <div className="flex items-center gap-3 min-w-[220px]">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelectOne(row.id)}
                    className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                  />

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
                    <div className="font-black text-slate-800 font-mono text-lg tracking-tight flex items-center gap-2">
                      {row.code}
                    </div>
                    
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      {row.clinicId ? getSubBadge(row) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          row.printedAt 
                            ? "bg-teal-50 text-teal-600 border-teal-200" 
                            : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}>
                          {row.printedAt ? "✓ Printed" : "Needs Printing"}
                        </span>
                      )}
                      
                      {row.usageType && row.usageType !== "general" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 uppercase">
                          {row.usageType.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clinic Assignment Details & Metrics */}
                <div className="flex-1 min-w-0">
                  {row.clinicId ? (
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-slate-900 font-bold text-sm">
                          {row.doctorName || "Doctor"} {row.doctorSpecialty && <span className="text-slate-500 font-normal">({row.doctorSpecialty})</span>}
                        </p>
                        <span className="text-slate-400 text-xs">· {row.clinicName}</span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          <BarChart3 className="w-3 h-3 text-emerald-600" />
                          {row.totalScans || 0} Scans
                        </span>

                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                          <CheckCircle2 className="w-3 h-3 text-teal-600" />
                          {row.qrAppts || 0} Appointments
                        </span>

                        <span className="text-[11px] font-bold text-slate-500">
                          Conv Rate: {row.totalScans && row.totalScans > 0 ? (((row.qrAppts || 0) / row.totalScans) * 100).toFixed(1) : "0.0"}%
                        </span>
                      </div>

                      {row.notes && (
                        <p className="text-slate-500 text-xs mt-1 flex items-center gap-1.5 truncate">
                          <FileText className="w-3.5 h-3.5" />
                          {row.notes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-slate-600 font-semibold text-sm">
                        Unassigned — Available for field distribution.
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5" suppressHydrationWarning>
                        Created {new Date(row.createdAt).toISOString().split("T")[0]}
                      </p>
                    </div>
                  )}
                  <p className="text-teal-600/70 text-[10px] mt-1 font-mono truncate">
                    {redirectUrl}
                  </p>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {/* Live Mockup Preview Modal Trigger */}
                  <button
                    onClick={() => openPreviewModal(row)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold shadow-2xs transition-all"
                    title="Interactive Live Standee / Poster Preview"
                  >
                    <Eye className="w-3.5 h-3.5 text-teal-400" />
                    Preview
                  </button>

                  <button
                    onClick={() => copyRedirectUrl(row.code)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all"
                    title="Copy Link"
                  >
                    {copiedCode === row.code ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  {/* Print Selector */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1">
                    <button
                      onClick={() => printSingleFormat(row.id, "poster")}
                      className="px-2 py-1.5 rounded-lg bg-white text-slate-700 hover:text-teal-700 font-bold text-[11px] border border-slate-200/60 transition-all"
                      title="Print A4 Posters"
                    >
                      Posters
                    </button>
                    <button
                      onClick={() => printSingleFormat(row.id, "stand")}
                      className="px-2 py-1.5 rounded-lg bg-white text-slate-700 hover:text-teal-700 font-bold text-[11px] border border-slate-200/60 transition-all"
                      title="Print 4x6 Acrylic Standee"
                    >
                      Standee
                    </button>
                    <button
                      onClick={() => printSingleFormat(row.id, "sticker")}
                      className="px-2 py-1.5 rounded-lg bg-white text-slate-700 hover:text-indigo-700 font-bold text-[11px] border border-slate-200/60 transition-all"
                      title="Print Sticker Sheet"
                    >
                      Stickers
                    </button>
                    <button
                      onClick={() => printSingleFormat(row.id, "kit")}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition-all"
                      title="Print Full Enterprise Kit"
                    >
                      <Download className="w-3 h-3" />
                      Kit
                    </button>
                  </div>

                  {row.clinicId ? (
                    <button
                      onClick={() => handleUnassign(row.id, row.code)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-all"
                    >
                      <Link2Off className="w-3.5 h-3.5" />
                      Unassign
                    </button>
                  ) : (
                    <button
                      onClick={() => setAssigningId(isAssigning ? null : row.id)}
                      disabled={isPending}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all ${
                        isAssigning
                          ? "bg-teal-600 text-white shadow-md shadow-teal-500/20"
                          : "bg-slate-50 border border-slate-200 hover:bg-teal-50 text-slate-700 hover:text-teal-600"
                      }`}
                    >
                      <Link2 className="w-3.5 h-3.5" />
                      Assign
                    </button>
                  )}

                  {!row.clinicId && (
                    <button
                      onClick={() => handleDelete(row.id, row.code)}
                      disabled={isPending}
                      className="p-2 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 text-slate-400 hover:text-rose-600 transition-all"
                      title="Delete QR Code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Single Inline Assignment Panel */}
              {isAssigning && (
                <div className="mt-4 p-4 bg-teal-50/70 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-teal-900">Assign QR Code {row.code}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <select
                      value={selectedClinicId}
                      onChange={(e) => setSelectedClinicId(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 shadow-xs"
                    >
                      <option value="">— Select Clinic —</option>
                      {allClinics.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.doctorName} · {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={usageType}
                      onChange={(e) => setUsageType(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 shadow-xs"
                    >
                      <option value="general">General</option>
                      <option value="reception_desk">Reception Desk Poster</option>
                      <option value="acrylic_stand">Acrylic Standee (4x6 Table)</option>
                      <option value="outside_window">Outside Door Poster</option>
                      <option value="patient_file_sticker">Patient File Sticker</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Handout notes (e.g. Pune demo visit)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="bg-white border border-slate-300 text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 placeholder-slate-400 shadow-xs"
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => {
                        setAssigningId(null);
                        setSelectedClinicId("");
                        setNotes("");
                        setUsageType("general");
                      }}
                      className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAssign(row.id)}
                      disabled={isPending || !selectedClinicId}
                      className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs transition-all"
                    >
                      {isPending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Confirm Assignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ══ LIVE INTERACTIVE 2D MOCKUP PREVIEW MODAL ═══════════════════════ */}
      {previewCodeRow && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-800 relative space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center border border-teal-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Live Standee Mockup · {previewCodeRow.code}
                  </h3>
                  <p className="text-xs text-slate-400">
                    High-fidelity physical print artifact preview for doctors & field sales.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewCodeRow(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format Selector Tabs inside Modal */}
            <div className="flex justify-center bg-slate-950 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto">
              <button
                onClick={() => setPreviewFormat("stand")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  previewFormat === "stand" ? "bg-teal-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                4x6 Acrylic Standee
              </button>
              <button
                onClick={() => setPreviewFormat("poster")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  previewFormat === "poster" ? "bg-teal-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                Inside Poster
              </button>
              <button
                onClick={() => setPreviewFormat("sticker")}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  previewFormat === "sticker" ? "bg-teal-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                Outside Entrance
              </button>
            </div>

            {/* Interactive Mockup Container */}
            <div className="flex justify-center">
              {/* 1. Single-Sided Enterprise Acrylic Standee (4x6 Inches / A5) */}
              {previewFormat === "stand" && (
                <div className="w-[310px] h-[450px] rounded-3xl bg-gradient-to-b from-[#080d1a] via-[#064e3b] to-[#022c22] border-4 border-emerald-400/60 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden text-center text-white">
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider outfit">🏥 {previewCodeRow.clinicName || "Doctor Diary"}</span>
                    <span className="text-[9px] font-extrabold bg-emerald-400/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-300/40">🔴 Live OPD</span>
                  </div>

                  <div className="my-1">
                    <h4 className="text-lg font-black text-white leading-tight outfit">
                      {previewCodeRow.doctorName ? `Dr. ${previewCodeRow.doctorName.replace(/^dr\.?\s*/i, "")}` : previewCodeRow.clinicName}
                    </h4>
                    {previewCodeRow.doctorSpecialty && <p className="text-[11px] text-emerald-200 font-bold">{previewCodeRow.doctorSpecialty}</p>}
                    <p className="text-xs font-black text-white mt-2 outfit">Scan to Book Live OPD Token</p>
                    <p className="text-[10px] text-emerald-300 font-bold hi">अपॉइंटमेंट टोकन के लिए स्कैन करें</p>
                  </div>

                  {/* Scannable Focal QR Viewfinder */}
                  <div className="relative mx-auto w-[165px] h-[165px] p-2 flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400 rounded-tl-md" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400 rounded-tr-md" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400 rounded-bl-md" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400 rounded-br-md" />

                    <div className="bg-white p-2 rounded-2xl shadow-2xl w-full h-full flex items-center justify-center">
                      {previewDataUri ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={previewDataUri} alt="QR Code" className="w-full h-auto" />
                      ) : (
                        <div className="w-full h-36 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">Loading...</div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center gap-1.5 text-[9px] font-bold text-white/90">
                    <span className="bg-white/10 px-2 py-0.5 rounded-full">✓ Pay at Clinic</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-full">✓ 100% Free</span>
                  </div>

                  <div className="text-center text-[9px] font-mono text-emerald-300/80 border-t border-white/10 pt-1.5">
                    Code: #{previewCodeRow.code}
                  </div>
                </div>
              )}

              {/* 2. Inside Clinic Waiting Room Poster (A4) */}
              {previewFormat === "poster" && (
                <div className="w-[320px] h-[450px] bg-white text-slate-900 border-4 border-emerald-700 rounded-3xl p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden text-center">
                  <div className="bg-gradient-to-r from-[#080d1a] to-[#064e3b] text-white p-3 rounded-2xl flex justify-between items-center">
                    <div className="text-left">
                      <p className="text-xs font-black leading-tight outfit">{previewCodeRow.clinicName || "Doctor Diary Clinic"}</p>
                      <p className="text-[10px] text-emerald-300 font-bold">{previewCodeRow.doctorName ? `Dr. ${previewCodeRow.doctorName.replace(/^dr\.?\s*/i, "")}` : ""}</p>
                    </div>
                    <span className="text-[9px] font-bold bg-emerald-500/30 text-emerald-200 px-2 py-1 rounded-full uppercase">🔴 Live Queue</span>
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight outfit">SKIP WAITING AREA QUEUE</h4>
                    <p className="text-xs text-emerald-800 font-bold hi">लाइव डिजिटल ओपीडी टोकन पाएं</p>
                  </div>

                  {/* Scannable Viewfinder QR */}
                  <div className="relative mx-auto w-[160px] h-[160px] p-2 flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-700 rounded-tl-md" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-700 rounded-tr-md" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-700 rounded-bl-md" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-700 rounded-br-md" />

                    <div className="bg-white p-1.5 rounded-2xl w-full h-full shadow-xl border-2 border-slate-200 flex items-center justify-center">
                      {previewDataUri && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={previewDataUri} alt="QR Code" className="w-full h-auto" />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[9px] font-bold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <div>1. Scan QR</div>
                    <div>2. Pick Slot</div>
                    <div>3. Track Live</div>
                  </div>

                  <div className="text-center text-[10px] font-mono text-slate-500">
                    Code: #{previewCodeRow.code}
                  </div>
                </div>
              )}

              {/* 3. Outside Clinic Entrance Gate Poster (A4) */}
              {previewFormat === "sticker" && (
                <div className="w-[320px] h-[450px] bg-gradient-to-br from-[#080d1a] via-[#0f172a] to-[#064e3b] text-white rounded-3xl p-5 flex flex-col justify-between border-4 border-emerald-400/60 shadow-2xl text-center">
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <span className="text-xs font-black text-white outfit">{previewCodeRow.clinicName || "Doctor Diary"}</span>
                    <span className="text-[9px] font-bold bg-emerald-500/30 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-400/40">🚪 Entrance Gate</span>
                  </div>

                  <div>
                    <h4 className="text-xl font-black text-white leading-tight outfit">DONT WAIT OUTSIDE</h4>
                    <p className="text-xs text-emerald-300 font-bold hi">बाहर लाइन में लगने की ज़रूरत नहीं</p>
                  </div>

                  {/* Scannable Viewfinder QR */}
                  <div className="relative mx-auto w-[165px] h-[165px] p-2 flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400 rounded-tl-md" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400 rounded-tr-md" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400 rounded-bl-md" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400 rounded-br-md" />

                    <div className="bg-white p-2 rounded-2xl w-full h-full shadow-2xl flex items-center justify-center">
                      {previewDataUri && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={previewDataUri} alt="QR Code" className="w-full h-auto" />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center gap-1.5 text-[9px] font-bold text-white/90">
                    <span className="bg-white/10 px-2 py-0.5 rounded-full">⚡ Instant Token</span>
                    <span className="bg-white/10 px-2 py-0.5 rounded-full">✓ 100% Free</span>
                  </div>

                  <div className="text-center text-[10px] font-mono text-emerald-400">
                    Code: #{previewCodeRow.code}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Placement: <strong className="text-white uppercase">{previewCodeRow.usageType}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printSingleFormat(previewCodeRow.id, previewFormat === "stand" ? "stand" : previewFormat === "poster" ? "poster" : "sticker")}
                  className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print High-Res PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
