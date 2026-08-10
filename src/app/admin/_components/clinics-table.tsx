"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Building2, ExternalLink, MoreVertical, MessageSquare, Phone, Zap, ArrowUpDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ExtendTrialModal } from "./extend-trial-modal";
import { formatDoctorName } from "@/lib/utils";

export type ClinicRow = {
  id: string;
  name: string;
  doctorName: string;
  specialty: string;
  phone: string;
  createdAt: Date | string;
  subscriptionStatus: string | null;
  planId: string | null;
  totalAppointments: number;
  qrAppointments?: number;
  qrScans?: number;
  apptVolume30d?: number;
  totalRevenue: number;
  kitOrderStatus?: string | null;
};

interface ClinicsTableProps {
  clinics: ClinicRow[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
  currentSearch: string;
  currentTab: string;
  currentSort: string;
  currentSpecialty: string;
  specialties: string[];
  counts: {
    all: number;
    active: number;
    past_due: number;
    cancelled: number;
    trial: number;
    at_risk: number;
  };
}

const TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "at_risk", label: "At Risk ⚠️" },
  { id: "trial", label: "Trial / Free" },
  { id: "past_due", label: "Past Due" },
  { id: "cancelled", label: "Cancelled" },
];

const SORTS = [
  { id: "newest", label: "Newest Joined" },
  { id: "revenue_desc", label: "Highest Revenue" },
  { id: "appts_desc", label: "Most Active (30d)" },
];

const PAGE_SIZE = 20;

function HealthBadge({ apptVolume30d }: { apptVolume30d?: number }) {
  const vol = apptVolume30d || 0;
  if (vol >= 5) {
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Healthy
      </Badge>
    );
  }
  if (vol > 0) {
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-[10px]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Low Activity
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 text-[10px]">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> At Risk
    </Badge>
  );
}

function SubBadge({ status }: { status: string | null }) {
  if (status === "active")
    return (
      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
        Active
      </Badge>
    );
  if (status === "past_due")
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
        Past Due
      </Badge>
    );
  if (status === "cancelled")
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        Cancelled
      </Badge>
    );
  return (
    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
      Trial / Free
    </Badge>
  );
}

export function ClinicsTable({
  clinics,
  totalPages,
  totalCount,
  currentPage,
  currentSearch,
  currentTab,
  currentSort,
  currentSpecialty,
  specialties,
  counts,
}: ClinicsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentSearch);
  const [selectedExtendClinic, setSelectedExtendClinic] = useState<ClinicRow | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== currentSearch) {
        const params = new URLSearchParams(searchParams.toString());
        if (search) params.set("search", search);
        else params.delete("search");
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, currentSearch, pathname, router, searchParams]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all" && value !== "newest") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Extend Trial Modal */}
      {selectedExtendClinic && (
        <ExtendTrialModal
          clinic={selectedExtendClinic}
          open={!!selectedExtendClinic}
          onOpenChange={(open) => {
            if (!open) setSelectedExtendClinic(null);
          }}
        />
      )}

      {/* Search + Filters + Tabs Bar */}
      <div className="flex flex-col gap-3">
        {/* Status Tabs */}
        <div className="flex bg-slate-100/80 rounded-xl p-1 gap-0.5 flex-wrap overflow-x-auto">
          {TABS.map((tab) => {
            const count = counts[tab.id as keyof typeof counts] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => updateParam("tab", tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  currentTab === tab.id
                    ? "bg-white text-teal-800 shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-60 font-bold">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clinics, doctors, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 placeholder-slate-400 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Specialty Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs shadow-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={currentSpecialty}
                onChange={(e) => updateParam("specialty", e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">All Specialties</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={currentSort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs relative w-full">
        <div className="min-w-[850px]">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Clinic / Doctor</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Health</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap hidden sm:table-cell">Specialty</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap hidden md:table-cell">Joined</TableHead>
                <TableHead className="font-semibold text-xs text-right whitespace-nowrap hidden lg:table-cell">Appts (30d/All)</TableHead>
                <TableHead className="font-semibold text-xs text-right whitespace-nowrap hidden xl:table-cell">QR Appts (Scans)</TableHead>
                <TableHead className="font-semibold text-xs text-right whitespace-nowrap hidden lg:table-cell">Revenue</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Subscription</TableHead>
                <TableHead className="w-10 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-slate-500">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No clinics match your filter parameters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                clinics.map((clinic) => {
                  const formattedPhone = clinic.phone?.replace(/\D/g, "") || "";
                  const waUrl = formattedPhone
                    ? `https://wa.me/91${formattedPhone.slice(-10)}?text=${encodeURIComponent(
                        `Hello ${formatDoctorName(clinic.doctorName)}, checking in from Doctor Diary admin support regarding ${clinic.name}. Need any assistance?`
                      )}`
                    : "#";

                  return (
                    <TableRow key={clinic.id} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell className="min-w-[200px]">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm truncate">{clinic.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                            {formatDoctorName(clinic.doctorName)} • {clinic.phone}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <HealthBadge apptVolume30d={clinic.apptVolume30d} />
                      </TableCell>

                      <TableCell className="text-sm text-slate-600 hidden sm:table-cell whitespace-nowrap">
                        {clinic.specialty}
                      </TableCell>

                      <TableCell className="text-sm text-slate-600 whitespace-nowrap hidden md:table-cell">
                        {format(new Date(clinic.createdAt), "MMM d, yyyy")}
                      </TableCell>

                      <TableCell className="text-sm font-medium text-slate-900 text-right hidden lg:table-cell whitespace-nowrap">
                        <span className="text-teal-600 font-bold">{clinic.apptVolume30d || 0}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-500 text-xs">{clinic.totalAppointments.toLocaleString()}</span>
                      </TableCell>

                      <TableCell className="text-sm font-medium text-right hidden xl:table-cell whitespace-nowrap">
                        <span className="text-emerald-700 font-extrabold">{clinic.qrAppointments || 0} appts</span>
                        <span className="text-slate-400 text-xs ml-1">({clinic.qrScans || 0} scans)</span>
                      </TableCell>

                      <TableCell className="text-sm font-semibold text-emerald-700 text-right hidden lg:table-cell whitespace-nowrap">
                        ₹{(clinic.totalRevenue / 100).toLocaleString("en-IN")}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <SubBadge status={clinic.subscriptionStatus} />
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel className="text-xs text-slate-500 font-normal">
                              Admin Superpowers
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {formattedPhone && (
                              <DropdownMenuItem asChild className="cursor-pointer text-emerald-700 font-medium">
                                <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  WhatsApp Doctor
                                </a>
                              </DropdownMenuItem>
                            )}

                            {formattedPhone && (
                              <DropdownMenuItem asChild className="cursor-pointer">
                                <a href={`tel:${clinic.phone}`} className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5" />
                                  Call Doctor
                                </a>
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuItem
                              onClick={() => setSelectedExtendClinic(clinic)}
                              className="cursor-pointer text-teal-700 font-medium flex items-center gap-2"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              Extend Access / Trial
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem asChild className="cursor-pointer">
                              <Link href={`/admin/clinics/${clinic.id}`} className="flex items-center gap-2">
                                <ExternalLink className="w-3.5 h-3.5" />
                                View Full Workspace
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-500">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} clinics
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="text-xs text-slate-500 font-medium">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
