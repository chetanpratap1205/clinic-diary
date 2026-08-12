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
  Trash2,
  Edit3,
  MapPin,
  Rocket,
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
  LEAD_SOURCES,
  SPECIALTIES,
} from "./message-builder";
import { WhatsAppMessageDrawer } from "./whatsapp-message-drawer";
import { LeadDetailDrawer } from "./lead-detail-drawer";
import { AddEditLeadModal } from "./add-edit-lead-modal";
import { CsvImportModal } from "./csv-import-modal";
import { DecisionGuideModal } from "./decision-guide-modal";
import { updateLead, deleteLead, bulkAssignLeads, getEmployees } from "./actions";
import { ExportLeadsButton } from "./export-leads-button";
import { ConvertLeadModal } from "./convert-lead-modal";
import { useEffect } from "react";

interface LeadsClientProps {
  leads: DoctorLead[];
  stats: {
    total: number;

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
    specialty?: string;
    city?: string;
    source?: string;
    goLiveIntent?: string;
    assignedEmployeeId?: string;
  };
  isAdmin?: boolean;
}

export function LeadsClient({
  leads: initialLeads,
  stats,
  cities,
  total,
  totalPages,
  currentPage,
  currentFilters,
  isAdmin = false,
}: LeadsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [leads, setLeads] = useState<DoctorLead[]>(initialLeads);
  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [employeesList, setEmployeesList] = useState<any[]>([]);

  useEffect(() => {
    getEmployees().then(setEmployeesList);
  }, []);

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
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
    const res = await updateLead(lead.id, { status: newStatus });
    if (res.error) {
      toast.error(res.error);
      setLeads(initialLeads);
    }
    else {
      toast.success(`Status → ${LEAD_STATUSES.find((s) => s.value === newStatus)?.label ?? newStatus}`);
      startTransition(() => router.refresh());
    }
  };

  const copyDemoUrl = (lead: DoctorLead) => {
    let url = generateLeadDemoUrl(lead);
    if (typeof window !== "undefined" && url.startsWith("https://doctor.naturexpress.in")) {
       url = url.replace("https://doctor.naturexpress.in", window.location.origin);
    }
    navigator.clipboard.writeText(url);
    toast.success("Live Demo URL copied! 🔗");
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm("Are you sure you want to permanently delete this lead?")) return;
    setLeads(prev => prev.filter(l => l.id !== leadId));
    const res = await deleteLead(leadId);
    if (res.error) {
      toast.error(res.error);
      setLeads(initialLeads);
    }
    else {
      toast.success("Lead deleted successfully.");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(leadId);
        return next;
      });
      startTransition(() => router.refresh());
    }
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
    setLeads(prev => prev.map(l => selectedIds.has(l.id) ? { ...l, status: newStatus } : l));
    for (const id of selectedIds) {
      const res = await updateLead(id, { status: newStatus });
      if (res.success) count++;
    }
    toast.success(`Updated ${count} leads to "${LEAD_STATUSES.find((s) => s.value === newStatus)?.label}"`);
    setSelectedIds(new Set());
    startTransition(() => router.refresh());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} selected leads?`)) return;
    
    setLeads(prev => prev.filter(l => !selectedIds.has(l.id)));
    let count = 0;
    for (const id of selectedIds) {
      const res = await deleteLead(id);
      if (res.success) count++;
    }
    toast.success(`Successfully deleted ${count} leads.`);
    setSelectedIds(new Set());
    startTransition(() => router.refresh());
  };

  const handleBulkEmployeeAssign = async (employeeId: string) => {
    if (selectedIds.size === 0) return;
    const res = await bulkAssignLeads(Array.from(selectedIds), employeeId === "unassigned" ? null : employeeId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Successfully assigned ${selectedIds.size} leads.`);
      setSelectedIds(new Set());
      startTransition(() => router.refresh());
    }
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
      <div className="grid grid-cols-2 min-[480px]:grid-cols-4 md:flex md:flex-wrap items-center gap-2 text-xs">
        <StatPill label="Total" value={stats.total} color="slate" />
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
        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-semibold text-teal-800">
            <CheckSquare className="w-4 h-4" />
            {selectedIds.size} selected
          </div>
          <div className="h-4 w-px bg-teal-200 hidden sm:block" />
          
          <div className="flex items-center gap-2 border-r border-teal-200 pr-3">
            <span className="text-xs text-teal-700 font-medium">Assign to:</span>
            <Select onValueChange={handleBulkEmployeeAssign}>
              <SelectTrigger className="h-8 w-[160px] text-xs bg-white border-teal-300 focus:ring-teal-500">
                <SelectValue placeholder="Select member..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned" className="text-slate-400 italic">Unassigned</SelectItem>
                {employeesList.map((e) => (
                  <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-teal-700 font-medium">Status:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {LEAD_STATUSES.filter((s) => s.value !== "converted").map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleBulkStatusChange(s.value)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-teal-300 text-teal-700 hover:bg-teal-100 transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex items-center pl-3 border-l border-teal-200">
              <Button 
                onClick={handleBulkDelete}
                size="sm" 
                variant="ghost" 
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs px-2.5 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Selected
              </Button>
            </div>
          )}

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

        <button
          onClick={() => setFilter("goLiveIntent", currentFilters.goLiveIntent === "true" ? "all" : "true")}
          className={`h-8 px-3 rounded-md text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            currentFilters.goLiveIntent === "true" 
              ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Rocket className={`w-3.5 h-3.5 ${currentFilters.goLiveIntent === "true" ? "text-indigo-600" : "text-slate-400"}`} />
          Go Live Requests
        </button>

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

        <Select value={currentFilters.assignedEmployeeId || "all"} onValueChange={(v) => setFilter("assignedEmployeeId", v)}>
          <SelectTrigger className="h-8 text-xs w-full min-[540px]:w-40">
            <SelectValue placeholder="Assigned To" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Assignee</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {employeesList.map((e) => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
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

      {/* Showing count & Bulk Select All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleSelectAll} 
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-teal-600 transition-colors"
          >
            {selectedIds.size === leads.length && leads.length > 0 ? (
              <CheckSquare className="w-4.5 h-4.5 text-teal-600" />
            ) : (
              <Square className="w-4.5 h-4.5" />
            )}
            Select All on Page
          </button>
          <div className="text-xs text-slate-500 font-medium border-l border-slate-200 pl-4">
            Showing <span className="font-bold text-slate-800">{leads.length}</span> of{" "}
            <span className="font-bold text-slate-800">{total}</span> leads
            {selectedIds.size > 0 && (
              <span className="ml-2 text-teal-600 font-semibold">• {selectedIds.size} selected</span>
            )}
          </div>
        </div>
      </div>

      {/* Mobile-First Card Grid View */}
      {leads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Users className="w-10 h-10 text-slate-200" />
          <div>
            <p className="font-medium text-slate-500">No leads found</p>
            <p className="text-xs mt-1">Add a lead or import your CSV file to get started.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {leads.map((lead) => {
            const demoUrl = generateLeadDemoUrl(lead);
            const isConverted = lead.status === "converted";
            const isSelected = selectedIds.has(lead.id);

            const daysSinceContact = lead.lastContactedAt
              ? differenceInDays(new Date(), new Date(lead.lastContactedAt))
              : null;
            const contactCold = daysSinceContact !== null && daysSinceContact >= 5;

            return (
              <div
                key={lead.id}
                className={`flex flex-col bg-white border rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md ${
                  isSelected ? "border-teal-400 ring-1 ring-teal-400" : "border-slate-200"
                }`}
              >
                {/* Card Header */}
                <div className="p-3 border-b border-slate-100 flex items-start justify-between gap-2 bg-slate-50/50">
                  <div className="flex items-start gap-2 overflow-hidden">
                    <button onClick={() => toggleSelect(lead.id)} className="mt-0.5 text-slate-300 hover:text-teal-600 flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-teal-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <button
                        onClick={() => setDetailDrawerLead(lead)}
                        className="text-left hover:text-teal-700 transition-colors truncate block w-full"
                      >
                        <h3 className="font-bold text-slate-900 truncate flex items-center gap-2" title={lead.doctorName}>
                          {lead.doctorName}
                          {lead.goLiveIntentAt && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200" title="This doctor clicked the 'Go Live' button on their preview page">
                              <Rocket className="w-3 h-3" />
                              Go Live Request
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {lead.clinicName && (
                            <p className="text-xs font-medium text-slate-500 truncate" title={lead.clinicName}>
                              {lead.clinicName}
                            </p>
                          )}
                          {lead.assignedEmployeeId && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              👤 {employeesList.find(e => e.id === lead.assignedEmployeeId)?.name?.split(" ")[0] || "Assigned"}
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3 flex-1 flex flex-col gap-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {lead.specialty && (
                      <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {lead.specialty}
                      </span>
                    )}
                    {lead.city && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3" /> {lead.city}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-1">
                    <Select
                      value={lead.status}
                      onValueChange={(v) => handleStatusChange(lead, v)}
                    >
                      <SelectTrigger className="h-7 text-xs border-slate-200 bg-slate-50 w-auto gap-1">
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

                    {daysSinceContact !== null && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        contactCold
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {daysSinceContact === 0 ? "Today" : `${daysSinceContact}d`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-2 border-t border-slate-100 bg-slate-50 flex flex-col gap-1.5">
                  <Button
                    onClick={() => setWaDrawerLead(lead)}
                    size="sm"
                    className="h-9 w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send WhatsApp Message
                  </Button>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button
                      onClick={() => setEditLead(lead)}
                      variant="outline"
                      size="sm"
                      className="h-8 text-slate-600 border-slate-200 hover:bg-slate-200 text-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Profile
                    </Button>
                    
                    <Button
                      onClick={() => copyDemoUrl(lead)}
                      variant="outline"
                      size="sm"
                      className="h-8 text-teal-700 border-teal-200 bg-teal-50 hover:bg-teal-100 text-xs"
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
                    </Button>
                  </div>
                </div>

                {/* Admin Extra Actions (Convert / Delete) */}
                {isAdmin && (
                  <div className="px-2 pb-2 bg-slate-50 flex items-center justify-between gap-1.5">
                    {!isConverted ? (
                      <Button
                        onClick={() => setConvertModalLead(lead)}
                        size="sm"
                        variant="outline"
                        className="h-7 text-[10px] flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        <Sparkles className="w-3 h-3 mr-1" /> Convert
                      </Button>
                    ) : (
                      <div className="h-7 flex-1" />
                    )}
                    <Button
                      onClick={() => handleDeleteLead(lead.id)}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
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

      {/* Floating Bottom Bar for Employees (Mobile Only) */}
      {!isAdmin && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden bg-slate-900/95 backdrop-blur shadow-2xl border border-slate-800 rounded-2xl p-4 flex items-center justify-around z-40">
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">My Leads</p>
            <p className="text-lg font-black text-white">{total}</p>
          </div>
          <div className="w-px h-8 bg-slate-700 mx-2"></div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Follow-ups</p>
            <p className="text-lg font-black text-emerald-400">{stats.overdue || 0}</p>
          </div>
        </div>
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
    social_media: { label: "Social Media 📱", bg: "bg-pink-50 text-pink-700 border-pink-200" },
    manual: { label: "Manual ✍️", bg: "bg-amber-50 text-amber-800 border-amber-200" },
    referral: { label: "Referral 👥", bg: "bg-rose-50 text-rose-700 border-rose-200" },
  };

  const item = map[source || "manual"] || { label: source || "Manual", bg: "bg-slate-50 text-slate-600 border-slate-200" };

  return (
    <Badge variant="outline" className={`text-[10px] font-bold ${item.bg}`}>
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
