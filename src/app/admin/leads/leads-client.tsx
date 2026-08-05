"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isAfter, formatDistanceToNow, differenceInDays } from "date-fns";
import {
  MessageCircle,
  Plus,
  Upload,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  X,
  RefreshCw,
  BookOpen,
  LayoutGrid,
  List,
  Sparkles,
  Copy,
  AlertTriangle,
  TrendingUp,
  CheckSquare,
  Square,
  Users,
  Clock,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { DoctorLead } from "@/db/schema";
import {
  buildMessageForLead,
  getNextStepLabel,
  generateLeadDemoUrl,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  LEAD_CATEGORIES,
  LEAD_SOURCES,
  SPECIALTIES,
} from "./message-builder";
import { WhatsAppMessageDrawer } from "./whatsapp-message-drawer";
import { LeadDetailDrawer } from "./lead-detail-drawer";
import { AddEditLeadModal } from "./add-edit-lead-modal";
import { CsvImportModal } from "./csv-import-modal";
import { DecisionGuideModal } from "./decision-guide-modal";
import { updateLead } from "./actions";
import { ExportLeadsButton } from "./export-leads-button";
import { ConvertLeadModal } from "./convert-lead-modal";
import { LeadsKanban } from "./leads-kanban";

interface LeadsClientProps {
  leads: DoctorLead[];
  stats: {
    total: number;
    hot: number;
    warm: number;
    new: number;
    contacted: number;
    demo_scheduled: number;
    converted: number;
    rejected: number;
    overdue: number;
  };
  cities: string[];
  total: number;
  totalPages: number;
  currentPage: number;
  currentFilters: {
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    specialty?: string;
    city?: string;
    source?: string;
  };
}

export function LeadsClient({
  leads,
  stats,
  cities,
  total,
  totalPages,
  currentPage,
  currentFilters,
}: LeadsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // View state
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Drawer / modal state
  const [waDrawerLead, setWaDrawerLead] = useState<DoctorLead | null>(null);
  const [detailDrawerLead, setDetailDrawerLead] = useState<DoctorLead | null>(null);
  const [editLead, setEditLead] = useState<DoctorLead | null>(null);
  const [convertModalLead, setConvertModalLead] = useState<DoctorLead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [searchInput, setSearchInput] = useState(currentFilters.search ?? "");

  // ─── Filter helpers ──────────────────────────────────────────────────────────
  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/admin/leads?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = () => setFilter("search", searchInput);

  const clearFilters = () => {
    setSearchInput("");
    router.push("/admin/leads");
  };

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/admin/leads?${params.toString()}`);
  };

  // ─── Fix #5: updateLead correct two-argument signature ────────────────────
  const handleStatusChange = async (lead: DoctorLead, newStatus: string) => {
    const res = await updateLead(lead.id, { status: newStatus });
    if (res.error) toast.error(res.error);
    else {
      toast.success(`Status → ${LEAD_STATUSES.find((s) => s.value === newStatus)?.label ?? newStatus}`);
      startTransition(() => router.refresh());
    }
  };

  const copyDemoUrl = (lead: DoctorLead) => {
    const url = generateLeadDemoUrl(lead);
    navigator.clipboard.writeText(url);
    toast.success("Live Demo URL copied! 🔗");
  };

  // ─── Bulk selection helpers ─────────────────────────────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map((l) => l.id)));
    }
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedIds.size === 0) return;
    let count = 0;
    for (const id of selectedIds) {
      const res = await updateLead(id, { status: newStatus });
      if (res.success) count++;
    }
    toast.success(`Updated ${count} leads to "${LEAD_STATUSES.find((s) => s.value === newStatus)?.label}"`);
    setSelectedIds(new Set());
    startTransition(() => router.refresh());
  };

  const hasActiveFilters = Object.values(currentFilters).some((v) => v && v !== "all");

  // ─── Follow-up due today / overdue ─────────────────────────────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpsDueToday = leads.filter((l) => {
    if (!l.followUpDate) return false;
    const due = new Date(l.followUpDate);
    due.setHours(0, 0, 0, 0);
    return due <= today && !["converted", "rejected"].includes(l.status);
  });

  // ─── Conversion rate ────────────────────────────────────────────────────────
  const conversionRate = stats.total > 0
    ? Math.round((stats.converted / stats.total) * 100)
    : 0;

  return (
    <div className="space-y-4">

      {/* ─── Follow-Up Due Today Alert Banner ───────────────────────────────── */}
      {followUpsDueToday.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="font-semibold text-amber-800">
            {followUpsDueToday.length} follow-up{followUpsDueToday.length > 1 ? "s" : ""} due today:
          </span>
          <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
            {followUpsDueToday.slice(0, 4).map((l) => (
              <button
                key={l.id}
                onClick={() => setDetailDrawerLead(l)}
                className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-full transition-colors truncate"
              >
                Dr. {l.doctorName.split(" ").pop()}
              </button>
            ))}
            {followUpsDueToday.length > 4 && (
              <span className="text-xs text-amber-600 font-medium">+{followUpsDueToday.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* ─── Header Stats — Grid on mobile, flex on desktop ─────────────────── */}
      <div className="grid grid-cols-4 sm:flex sm:flex-wrap items-center gap-2 text-xs">
        <StatPill label="Total" value={stats.total} color="slate" />
        <StatPill label="🔥 Hot" value={stats.hot} color="red" />
        <StatPill label="🟡 Warm" value={stats.warm} color="amber" />
        <StatPill label="New" value={stats.new} color="blue" />
        <StatPill label="Contacted" value={stats.contacted} color="yellow" />
        <StatPill label="Demo Set" value={stats.demo_scheduled} color="purple" />
        <StatPill label="Converted" value={stats.converted} color="green" />
        <StatPill label="⚠ Overdue" value={stats.overdue} color="red" />
        {/* Fix #7: Conversion Rate KPI */}
        <div className="flex items-center gap-1.5 border border-teal-200 bg-teal-50 px-2.5 py-1 rounded-lg shrink-0 font-medium text-teal-700">
          <TrendingUp className="w-3 h-3" />
          <span>Conv. Rate</span>
          <span className="font-black">{conversionRate}%</span>
        </div>
      </div>

      {/* ─── Bulk Actions Bar (shows when rows selected) ─────────────────────── */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-800">
            <CheckSquare className="w-4 h-4" />
            {selectedIds.size} selected
          </div>
          <div className="h-4 w-px bg-teal-200" />
          <span className="text-xs text-teal-700 font-medium">Bulk update status:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {LEAD_STATUSES.filter((s) => s.value !== "converted").map((s) => (
              <button
                key={s.value}
                onClick={() => handleBulkStatusChange(s.value)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-700 hover:bg-teal-100 transition-colors"
              >
                → {s.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="ml-auto p-1 rounded text-teal-500 hover:text-teal-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ─── Action Bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1 w-full sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search doctor, clinic, phone, city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 h-9 text-xs sm:text-sm"
            />
          </div>
          <Button onClick={handleSearch} size="sm" variant="outline" className="h-9 text-xs sm:text-sm px-3">
            Search
          </Button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {hasActiveFilters && (
            <Button onClick={clearFilters} size="sm" variant="ghost" className="h-9 text-slate-500 gap-1 px-2.5 text-xs">
              <X className="w-3.5 h-3.5" /> Clear
            </Button>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                viewMode === "kanban" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Kanban
            </button>
          </div>

          <ExportLeadsButton leads={leads} />

          <Button
            onClick={() => setShowGuideModal(true)}
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs px-2.5 sm:px-3"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guide</span>
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 text-xs px-2.5 sm:px-3"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            className="h-9 bg-teal-600 hover:bg-teal-700 gap-1.5 text-xs px-3 font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </Button>
        </div>
      </div>

      {/* ─── Filter Bar — now includes Source Channel ─────────────────────────── */}
      <div className="grid grid-cols-2 min-[540px]:flex min-[540px]:flex-wrap items-center gap-2">
        <div className="col-span-2 min-[540px]:col-span-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Filter:</span>
        </div>

        <Select value={currentFilters.status || "all"} onValueChange={(v) => setFilter("status", v)}>
          <SelectTrigger className="h-8 text-xs w-full min-[540px]:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.priority || "all"} onValueChange={(v) => setFilter("priority", v)}>
          <SelectTrigger className="h-8 text-xs w-full min-[540px]:w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            {LEAD_PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.category || "all"} onValueChange={(v) => setFilter("category", v)}>
          <SelectTrigger className="h-8 text-xs w-full min-[540px]:w-36">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {LEAD_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Fix #10: Source Channel Filter */}
        <Select value={currentFilters.source || "all"} onValueChange={(v) => setFilter("source", v)}>
          <SelectTrigger className="h-8 text-xs w-full min-[540px]:w-40">
            <SelectValue placeholder="Source Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {LEAD_SOURCES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentFilters.specialty || "all"} onValueChange={(v) => setFilter("specialty", v)}>
          <SelectTrigger className="h-8 text-xs w-full min-[540px]:w-44">
            <SelectValue placeholder="Specialty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Specialties</SelectItem>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {cities.length > 0 && (
          <Select value={currentFilters.city || "all"} onValueChange={(v) => setFilter("city", v)}>
            <SelectTrigger className="h-8 text-xs w-full min-[540px]:w-32">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Showing count */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-800">{leads.length}</span> of{" "}
          <span className="font-bold text-slate-800">{total}</span> leads
          {selectedIds.size > 0 && (
            <span className="ml-2 text-teal-600 font-semibold">• {selectedIds.size} selected</span>
          )}
        </div>
      </div>

      {/* Render Kanban or Table View */}
      {viewMode === "kanban" ? (
        <LeadsKanban
          leads={leads}
          onOpenMessageDrawer={setWaDrawerLead}
          onOpenConvertModal={setConvertModalLead}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {/* Fix #9: Bulk select checkbox */}
                  <th className="px-4 py-3 w-8">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-teal-600">
                      {selectedIds.size === leads.length && leads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Doctor / Clinic</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Specialty</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  {/* Fix #12: Days Since Last Contact */}
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Last Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Demo Link</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">Step</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-10 h-10 text-slate-200" />
                        <div>
                          <p className="font-medium text-slate-500">No leads found</p>
                          <p className="text-xs mt-1">Add a lead or import your CSV file to get started.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const demoUrl = generateLeadDemoUrl(lead);
                    const isConverted = lead.status === "converted";
                    const isSelected = selectedIds.has(lead.id);

                    // Fix #12: Days since last contact
                    const daysSinceContact = lead.lastContactedAt
                      ? differenceInDays(new Date(), new Date(lead.lastContactedAt))
                      : null;
                    const contactCold = daysSinceContact !== null && daysSinceContact >= 5;

                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50 transition-colors group ${isSelected ? "bg-teal-50/50" : ""}`}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3 w-8">
                          <button onClick={() => toggleSelect(lead.id)} className="text-slate-300 hover:text-teal-600">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-teal-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3">
                          <button
                            onClick={() => setDetailDrawerLead(lead)}
                            className="text-left hover:text-teal-700 transition-colors"
                          >
                            <p className="font-semibold text-slate-900 group-hover:text-teal-700 truncate max-w-[180px]">
                              {lead.doctorName}
                            </p>
                            {lead.clinicName && (
                              <p className="text-xs text-slate-500 truncate max-w-[180px] mt-0.5">
                                {lead.clinicName}
                              </p>
                            )}
                            {lead.city && (
                              <p className="text-xs text-slate-400 truncate">{lead.city}</p>
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3 hidden sm:table-cell">
                          {lead.specialty ? (
                            <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[130px] block">
                              {lead.specialty}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3 hidden md:table-cell">
                          <SourceChannelBadge source={lead.source} />
                        </td>

                        <td className="px-4 py-3">
                          <PriorityBadge priority={lead.priority} />
                        </td>

                        <td className="px-4 py-3">
                          <Select
                            value={lead.status}
                            onValueChange={(v) => handleStatusChange(lead, v)}
                          >
                            <SelectTrigger className="h-7 text-xs border-0 bg-transparent p-0 w-auto gap-1 focus:ring-0">
                              <StatusBadge status={lead.status} />
                            </SelectTrigger>
                            <SelectContent>
                              {LEAD_STATUSES.map((s) => (
                                <SelectItem key={s.value} value={s.value} className="text-xs">
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>

                        {/* Fix #12: Days Since Last Contact */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {daysSinceContact === null ? (
                            <span className="text-xs text-slate-400 italic">Never</span>
                          ) : (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                              contactCold
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                              {daysSinceContact === 0 ? "Today" : `${daysSinceContact}d ago`}
                              {contactCold && " 🧊"}
                            </span>
                          )}
                        </td>

                        {/* Demo Link */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <button
                            onClick={() => copyDemoUrl(lead)}
                            className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-1 rounded font-semibold transition-colors"
                            title="Copy Live Demo Link"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Demo URL</span>
                          </button>
                        </td>

                        <td className="px-4 py-3 hidden xl:table-cell">
                          <StepIndicator step={lead.messageSentStep || 0} />
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isConverted && (
                              <Button
                                onClick={() => setConvertModalLead(lead)}
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs px-2 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold"
                                title="Convert Lead to Active Clinic"
                              >
                                <Sparkles className="w-3 h-3 text-emerald-600" />
                                Convert
                              </Button>
                            )}
                            <Button
                              onClick={() => setWaDrawerLead(lead)}
                              size="sm"
                              className="h-7 text-xs px-2.5 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Page {currentPage} of {totalPages} ({total} total leads)
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-semibold px-2">{currentPage}</span>
            <Button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── Drawers and Modals ─────────────────────────────────────────────── */}
      <WhatsAppMessageDrawer
        lead={waDrawerLead}
        open={!!waDrawerLead}
        onOpenChange={(open) => !open && setWaDrawerLead(null)}
        onStepSent={() => startTransition(() => router.refresh())}
      />

      <LeadDetailDrawer
        lead={detailDrawerLead!}
        open={!!detailDrawerLead}
        onOpenChange={(open) => !open && setDetailDrawerLead(null)}
        onEditLead={(lead) => setEditLead(lead)}
        onOpenWhatsAppDrawer={(lead) => setWaDrawerLead(lead)}
        onOpenConvertModal={(lead) => setConvertModalLead(lead)}
        onRefresh={() => startTransition(() => router.refresh())}
      />

      <AddEditLeadModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => startTransition(() => router.refresh())}
      />

      {editLead && (
        <AddEditLeadModal
          lead={editLead}
          open={!!editLead}
          onOpenChange={(open) => !open && setEditLead(null)}
          onSuccess={() => startTransition(() => router.refresh())}
        />
      )}

      <CsvImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onSuccess={() => startTransition(() => router.refresh())}
      />

      <DecisionGuideModal
        open={showGuideModal}
        onOpenChange={setShowGuideModal}
      />

      {convertModalLead && (
        <ConvertLeadModal
          lead={convertModalLead}
          open={!!convertModalLead}
          onOpenChange={(open) => !open && setConvertModalLead(null)}
        />
      )}
    </div>
  );
}

// ─── Stat Pill Helper ─────────────────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    red: "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div className={`flex items-center gap-1.5 border px-2.5 py-1 rounded-lg shrink-0 font-medium ${colorMap[color] || colorMap.slate}`}>
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function SourceChannelBadge({ source }: { source?: string | null }) {
  const map: Record<string, { label: string; bg: string }> = {
    google_maps: { label: "Google Maps 🗺️", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    instagram: { label: "Instagram 📸", bg: "bg-pink-50 text-pink-700 border-pink-200" },
    linkedin: { label: "LinkedIn 💼", bg: "bg-sky-50 text-sky-700 border-sky-200" },
    field_visit: { label: "Field Visit 🚗", bg: "bg-amber-50 text-amber-800 border-amber-200" },
    imported: { label: "CSV Import 📄", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    online: { label: "Inbound 🌐", bg: "bg-teal-50 text-teal-700 border-teal-200" },
    growth_partner: { label: "Growth Partner 🤝", bg: "bg-violet-50 text-violet-700 border-violet-200" },
    referral: { label: "Referral 👥", bg: "bg-rose-50 text-rose-700 border-rose-200" },
  };

  const item = map[source || "online"] || { label: source || "Outreach", bg: "bg-slate-50 text-slate-600 border-slate-200" };

  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${item.bg}`}>
      {item.label}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority?: string | null }) {
  const map: Record<string, { label: string; bg: string }> = {
    hot: { label: "HOT 🔥", bg: "bg-red-100 text-red-800 font-black border-red-200" },
    warm: { label: "WARM 🟡", bg: "bg-amber-100 text-amber-800 font-bold border-amber-200" },
    normal: { label: "Normal", bg: "bg-slate-100 text-slate-600 border-slate-200" },
    cold: { label: "Cold ❄", bg: "bg-sky-100 text-sky-700 border-sky-200" },
  };
  const item = map[priority || "normal"] || map.normal;
  return (
    <Badge variant="outline" className={`text-[10px] ${item.bg}`}>
      {item.label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string }> = {
    new: { label: "New", bg: "bg-blue-100 text-blue-800 border-blue-200" },
    contacted: { label: "Contacted", bg: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    demo_scheduled: { label: "Demo Set", bg: "bg-purple-100 text-purple-800 border-purple-200" },
    converted: { label: "Converted ✓", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    rejected: { label: "Rejected", bg: "bg-slate-100 text-slate-500 border-slate-200" },
  };
  const item = map[status] || { label: status, bg: "bg-slate-100 text-slate-600 border-slate-200" };
  return (
    <Badge variant="outline" className={`text-[10px] font-semibold ${item.bg}`}>
      {item.label}
    </Badge>
  );
}

function StepIndicator({ step }: { step: number }) {
  if (step === 0) return <span className="text-xs text-slate-400">Not started</span>;
  if (step >= 3) return (
    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
      ✓ All 3 sent
    </span>
  );
  return (
    <span className="text-xs text-teal-700 font-bold bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
      Step {step}/3 sent
    </span>
  );
}
