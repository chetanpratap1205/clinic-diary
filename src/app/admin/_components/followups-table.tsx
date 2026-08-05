"use client";

import { useState, useEffect } from "react";
import { Search, CalendarClock, AlertTriangle, CheckCircle2 } from "lucide-react";
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
import { FollowUpRowActions } from "./followup-row-actions";

export type FollowUpRow = {
  id: string;
  dueDate: Date | string;
  notes: string | null;
  status: string;
  patientName: string | null;
  patientPhone: string | null;
  clinicName: string | null;
};

interface FollowUpsTableProps {
  followUps: FollowUpRow[];
  totalCount: number;
  currentPage: number;
  currentSearch: string;
  currentTab: string;
  counts: {
    all: number;
    overdue: number;
    pending: number;
    completed: number;
    missed: number;
  };
}

const TABS = [
  { id: "overdue", label: "Overdue ⚠️" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed ✓" },
  { id: "missed", label: "Missed" },
  { id: "all", label: "All Records" },
];

const PAGE_SIZE = 25;

export function FollowUpsTable({
  followUps,
  totalCount,
  currentPage,
  currentSearch,
  currentTab,
  counts,
}: FollowUpsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentSearch);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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

  const handleTabChange = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab && tab !== "all") params.set("tab", tab);
    else params.delete("tab");
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
      {/* Search & Tabs Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex bg-slate-100/80 rounded-xl p-1 gap-0.5 flex-wrap">
          {TABS.map((tab) => {
            const count = counts[tab.id as keyof typeof counts] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
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

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, phone, clinic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 placeholder-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs relative w-full">
        <div className="min-w-[700px]">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Patient</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap hidden sm:table-cell">Clinic</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Due Date</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Status / Overdue</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap hidden md:table-cell">Notes</TableHead>
                <TableHead className="font-semibold text-xs text-right whitespace-nowrap">Outreach Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {followUps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400 text-sm">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                    No follow-up records match your filter.
                  </TableCell>
                </TableRow>
              ) : (
                followUps.map((fu) => {
                  const isOverdue = fu.status === "pending" && new Date(fu.dueDate).getTime() < Date.now();
                  const daysOverdue = isOverdue
                    ? Math.floor((Date.now() - new Date(fu.dueDate).getTime()) / (1000 * 60 * 60 * 24))
                    : 0;

                  return (
                    <TableRow key={fu.id} className="hover:bg-slate-50/60 transition-colors">
                      <TableCell className="min-w-[150px]">
                        <div>
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {fu.patientName ?? "Unknown Patient"}
                          </p>
                          {fu.patientPhone && (
                            <p className="text-[11px] text-slate-400 font-mono truncate">{fu.patientPhone}</p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-xs text-slate-600 truncate max-w-[160px]">
                        {fu.clinicName ?? "—"}
                      </TableCell>

                      <TableCell className="text-xs text-slate-600 whitespace-nowrap">
                        {fu.dueDate ? format(new Date(fu.dueDate), "MMM d, yyyy") : "—"}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {isOverdue ? (
                          <Badge variant="outline" className={daysOverdue > 7 ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                            {daysOverdue}d Overdue
                          </Badge>
                        ) : fu.status === "completed" ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                            Completed
                          </Badge>
                        ) : fu.status === "missed" ? (
                          <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                            Missed
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                            Pending
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="hidden md:table-cell text-xs text-slate-500 max-w-[200px] truncate">
                        {fu.notes ?? <span className="italic text-slate-400">—</span>}
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <FollowUpRowActions
                          followUpId={fu.id}
                          patientName={fu.patientName}
                          patientPhone={fu.patientPhone}
                          clinicName={fu.clinicName}
                          dueDate={fu.dueDate}
                          status={fu.status}
                        />
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
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} follow-ups
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
