"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, isAfter, formatDistanceToNow } from "date-fns";
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
import { buildWhatsAppMessage, getNextStepLabel, LEAD_STATUSES, LEAD_PRIORITIES, LEAD_CATEGORIES, SPECIALTIES } from "./message-builder";
import { WhatsAppMessageDrawer } from "./whatsapp-message-drawer";
import { LeadDetailDrawer } from "./lead-detail-drawer";
import { AddEditLeadModal } from "./add-edit-lead-modal";
import { CsvImportModal } from "./csv-import-modal";
import { DecisionGuideModal } from "./decision-guide-modal";
import { updateLead } from "./actions";

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

  // Drawer / modal state
  const [waDrawerLead, setWaDrawerLead] = useState<DoctorLead | null>(null);
  const [detailDrawerLead, setDetailDrawerLead] = useState<DoctorLead | null>(null);
  const [editLead, setEditLead] = useState<DoctorLead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [searchInput, setSearchInput] = useState(currentFilters.search ?? "");

  // ─── URL-driven filter helpers ─────────────────────────────────────────────
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

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/admin/leads?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchInput("");
    router.push("/admin/leads");
  };

  const handleSearch = () => setFilter("search", searchInput);

  const hasActiveFilters =
    currentFilters.search ||
    currentFilters.status ||
    currentFilters.priority ||
    currentFilters.category ||
    currentFilters.specialty ||
    currentFilters.city;

  // ─── Inline status change ──────────────────────────────────────────────────
  const handleStatusChange = (lead: DoctorLead, newStatus: string) => {
    startTransition(async () => {
      const res = await updateLead(lead.id, { status: newStatus });
      if (res.error) toast.error(res.error);
      else {
        toast.success("Status updated");
        router.refresh();
      }
    });
  };

  // ─── Render priority badge ─────────────────────────────────────────────────
  const PriorityBadge = ({ priority }: { priority: string }) => {
    const map: Record<string, string> = {
      hot: "bg-red-100 text-red-700 border-red-200",
      warm: "bg-orange-100 text-orange-700 border-orange-200",
      normal: "bg-slate-100 text-slate-600 border-slate-200",
      cold: "bg-slate-50 text-slate-400 border-slate-200",
    };
    const labels: Record<string, string> = {
      hot: "🔴 Hot",
      warm: "🟡 Warm",
      normal: "Normal",
      cold: "Cold",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${map[priority] || map.normal}`}>
        {labels[priority] || priority}
      </span>
    );
  };

  // ─── Render status badge ───────────────────────────────────────────────────
  const StatusBadge = ({ status }: { status: string }) => {
    const s = LEAD_STATUSES.find((x) => x.value === status);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${s?.color || "bg-slate-100 text-slate-600"}`}>
        {s?.label || status}
      </span>
    );
  };

  // ─── Step progress indicator ───────────────────────────────────────────────
  const StepIndicator = ({ step }: { step: number }) => {
    if (step === 0) return <span className="text-xs text-slate-400">Not sent</span>;
    if (step >= 3) return <span className="text-xs text-emerald-600 font-medium">✅ All sent</span>;
    return (
      <span className="text-xs text-blue-600 font-medium">
        Step {step} sent ✓
      </span>
    );
  };

  // ─── Follow-up date cell ───────────────────────────────────────────────────
  const FollowUpCell = ({ date }: { date: Date | null }) => {
    if (!date) return <span className="text-xs text-slate-400">—</span>;
    const d = new Date(date);
    const overdue = isAfter(new Date(), d);
    return (
      <span className={`text-xs font-medium ${overdue ? "text-red-600" : "text-slate-600"}`}>
        {overdue ? "⚠ " : ""}
        {format(d, "dd MMM")}
      </span>
    );
  };

  // ─── Category badge ────────────────────────────────────────────────────────
  const CategoryBadge = ({ cat }: { cat: string }) => {
    const colors: Record<string, string> = {
      A: "bg-slate-100 text-slate-600",
      B: "bg-teal-100 text-teal-700",
      C: "bg-purple-100 text-purple-700",
    };
    const labels: Record<string, string> = {
      A: "A · Cold",
      B: "B · Visited",
      C: "C · Inbound",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colors[cat] || colors.A}`}>
        {labels[cat] || cat}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* ─── Stats Header Pills ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 min-[480px]:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
        <StatPill label="Total Leads" value={stats.total} color="slate" />
        <StatPill label="🔴 Hot" value={stats.hot} color="red" />
        <StatPill label="🟡 Warm" value={stats.warm} color="orange" />
        <StatPill label="New" value={stats.new} color="blue" />
        <StatPill label="Contacted" value={stats.contacted} color="yellow" />
        <StatPill label="Demo Set" value={stats.demo_scheduled} color="purple" />
        <StatPill label="Converted" value={stats.converted} color="green" />
        <StatPill label="⚠ Overdue" value={stats.overdue} color="red" />
      </div>

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
          <Button
            onClick={() => router.refresh()}
            size="sm"
            variant="ghost"
            className="h-9 text-slate-500 px-2.5"
            title="Refresh leads"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={() => setShowGuideModal(true)}
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold text-xs px-2.5 sm:px-3"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Decision Guide</span>
          </Button>
          <Button
            onClick={() => setShowImportModal(true)}
            size="sm"
            variant="outline"
            className="h-9 gap-1.5 text-xs px-2.5 sm:px-3"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden min-[400px]:inline">Import CSV</span>
            <span className="min-[400px]:hidden">Import</span>
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

      {/* ─── Filter Bar ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 min-[540px]:flex min-[540px]:flex-wrap items-center gap-2">
        <div className="col-span-2 min-[540px]:col-span-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Filter:</span>
        </div>

        <Select
          value={currentFilters.status || "all"}
          onValueChange={(v) => setFilter("status", v)}
        >
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

        <Select
          value={currentFilters.priority || "all"}
          onValueChange={(v) => setFilter("priority", v)}
        >
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

        <Select
          value={currentFilters.category || "all"}
          onValueChange={(v) => setFilter("category", v)}
        >
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

        <Select
          value={currentFilters.specialty || "all"}
          onValueChange={(v) => setFilter("specialty", v)}
        >
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
          <Select
            value={currentFilters.city || "all"}
            onValueChange={(v) => setFilter("city", v)}
          >
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

      {/* ─── Results Count ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-xs sm:text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{leads.length}</span> of{" "}
          <span className="font-semibold text-slate-900">{total}</span> leads
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-slate-600 font-medium">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ─── Mobile Card View (Visible on small screens: phones & small tablets) ──────────────── */}
      <div className="block md:hidden space-y-3">
        {leads.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
            <Phone className="w-10 h-10 text-slate-200 mx-auto mb-2" />
            <p className="font-medium text-slate-500">No leads found</p>
            <p className="text-xs mt-1">Add a lead or import your CSV file to get started.</p>
          </div>
        ) : (
          leads.map((lead) => {
            const { isComplete } = buildWhatsAppMessage(lead);
            const isOverdue =
              lead.followUpDate &&
              isAfter(new Date(), new Date(lead.followUpDate)) &&
              !["converted", "rejected"].includes(lead.status);

            return (
              <div
                key={lead.id}
                className={`bg-white border rounded-xl p-4 space-y-3 shadow-sm transition-all ${
                  isOverdue ? "border-red-200 bg-red-50/20" : "border-slate-200"
                }`}
              >
                {/* Header: Doctor Name & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => setDetailDrawerLead(lead)}
                    className="text-left hover:text-teal-700 transition-colors flex-1 min-w-0"
                  >
                    <p className="font-bold text-slate-900 text-sm truncate">
                      {lead.doctorName}
                    </p>
                    {lead.clinicName && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        🏥 {lead.clinicName}
                      </p>
                    )}
                    {lead.city && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        📍 {lead.city}
                      </p>
                    )}
                  </button>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <PriorityBadge priority={lead.priority} />
                    <CategoryBadge cat={lead.leadCategory || "A"} />
                  </div>
                </div>

                {/* Sub-info Row: Specialty + FollowUp */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                  <div>
                    {lead.specialty ? (
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {lead.specialty}
                      </span>
                    ) : (
                      <span className="text-slate-300">No specialty</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StepIndicator step={lead.messageSentStep || 0} />
                    <FollowUpCell date={lead.followUpDate} />
                  </div>
                </div>

                {/* Status Dropdown & Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                  <div className="flex-1">
                    <Select
                      value={lead.status}
                      onValueChange={(v) => handleStatusChange(lead, v)}
                    >
                      <SelectTrigger className="h-8 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 w-full">
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
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isComplete && lead.status !== "rejected" && (
                      <button
                        onClick={() => setWaDrawerLead(lead)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-all text-xs font-semibold shadow-sm"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Step {Math.min((lead.messageSentStep || 0) + 1, 3)}</span>
                      </button>
                    )}
                    {isComplete && (
                      <span className="text-xs text-emerald-600 font-semibold px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                        ✅ Done
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setEditLead(lead);
                        setShowAddModal(true);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 bg-white"
                      title="Edit Lead"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Desktop/Tablet Leads Table (Visible on medium screens and up) ───────────────────────── */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Doctor / Clinic</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Specialty</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Step</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Follow-Up</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap hidden xl:table-cell">Last Contact</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Phone className="w-10 h-10 text-slate-200" />
                      <div>
                        <p className="font-medium text-slate-500">No leads found</p>
                        <p className="text-xs mt-1">Add a lead or import your CSV file to get started.</p>
                      </div>
                      <Button
                        onClick={() => setShowAddModal(true)}
                        size="sm"
                        className="bg-teal-600 hover:bg-teal-700 mt-2 gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add First Lead
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const { isComplete } = buildWhatsAppMessage(lead);
                  const isOverdue =
                    lead.followUpDate &&
                    isAfter(new Date(), new Date(lead.followUpDate)) &&
                    !["converted", "rejected"].includes(lead.status);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50 transition-colors group ${isOverdue ? "bg-red-50/30" : ""}`}
                    >
                      {/* Doctor / Clinic */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDetailDrawerLead(lead)}
                          className="text-left hover:text-teal-700 transition-colors"
                        >
                          <p className="font-semibold text-slate-900 group-hover:text-teal-700 truncate max-w-[180px]">
                            {lead.doctorName}
                          </p>
                          {lead.clinicName && (
                            <p className="text-xs text-slate-400 truncate max-w-[180px] mt-0.5">
                              {lead.clinicName}
                            </p>
                          )}
                          {lead.city && (
                            <p className="text-xs text-slate-400 truncate">{lead.city}</p>
                          )}
                        </button>
                      </td>

                      {/* Specialty */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {lead.specialty ? (
                          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[130px] block">
                            {lead.specialty}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <CategoryBadge cat={lead.leadCategory || "A"} />
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3">
                        <PriorityBadge priority={lead.priority} />
                      </td>

                      {/* Status */}
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

                      {/* Step */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <StepIndicator step={lead.messageSentStep || 0} />
                      </td>

                      {/* Follow-Up */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <FollowUpCell date={lead.followUpDate} />
                      </td>

                      {/* Last Contact */}
                      <td className="px-4 py-3 hidden xl:table-cell">
                        {lead.lastContactedAt ? (
                          <span className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(lead.lastContactedAt), { addSuffix: true })}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">Never</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* WhatsApp Button */}
                          {!isComplete && lead.status !== "rejected" && (
                            <button
                              onClick={() => setWaDrawerLead(lead)}
                              title={getNextStepLabel(lead.messageSentStep || 0, lead.leadCategory || "A")}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 transition-all text-xs font-medium group/wa"
                            >
                              <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                              <span className="hidden sm:inline whitespace-nowrap">
                                Step {Math.min((lead.messageSentStep || 0) + 1, 3)}
                              </span>
                            </button>
                          )}
                          {isComplete && (
                            <span className="text-xs text-emerald-600 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                              ✅ Done
                            </span>
                          )}

                          {/* Details button */}
                          <button
                            onClick={() => {
                              setEditLead(lead);
                              setShowAddModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Edit Lead"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
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

      {/* ─── Pagination Footer ───────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── Drawers & Modals ────────────────────────────────────────────────── */}
      {waDrawerLead && (
        <WhatsAppMessageDrawer
          lead={waDrawerLead}
          isOpen={!!waDrawerLead}
          onClose={() => setWaDrawerLead(null)}
          onUpdateStep={() => {
            router.refresh();
          }}
        />
      )}

      {detailDrawerLead && (
        <LeadDetailDrawer
          lead={detailDrawerLead}
          onClose={() => setDetailDrawerLead(null)}
          onEdit={() => {
            setEditLead(detailDrawerLead);
            setDetailDrawerLead(null);
            setShowAddModal(true);
          }}
          onRefresh={() => router.refresh()}
        />
      )}

      {showAddModal && (
        <AddEditLeadModal
          lead={editLead}
          onClose={() => {
            setShowAddModal(false);
            setEditLead(null);
          }}
          onSaved={() => {
            setShowAddModal(false);
            setEditLead(null);
            router.refresh();
          }}
        />
      )}

      {showImportModal && (
        <CsvImportModal
          onClose={() => setShowImportModal(false)}
          onImported={() => {
            setShowImportModal(false);
            router.refresh();
          }}
        />
      )}

      {showGuideModal && (
        <DecisionGuideModal onClose={() => setShowGuideModal(false)} />
      )}
    </div>
  );
}

// ─── Stat Pill Sub-component ─────────────────────────────────────────────────
function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    slate: "bg-white border-slate-200 text-slate-700",
    red: "bg-red-50 border-red-200 text-red-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    green: "bg-green-50 border-green-200 text-green-700",
  };
  return (
    <div className={`rounded-xl border px-2.5 sm:px-3 py-2 sm:py-2.5 min-w-0 ${colorMap[color] || colorMap.slate}`}>
      <p className="text-lg sm:text-xl font-bold leading-none">{value.toLocaleString()}</p>
      <p className="text-[10px] sm:text-[11px] mt-1 font-medium opacity-75 truncate">{label}</p>
    </div>
  );
}
