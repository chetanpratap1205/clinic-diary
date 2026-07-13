"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Building2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  totalRevenue: number;
};

interface ClinicsTableProps {
  clinics: ClinicRow[];
}

const TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "past_due", label: "Past Due" },
  { id: "cancelled", label: "Cancelled" },
  { id: "trial", label: "Trial / Free" },
];

const PAGE_SIZE = 20;

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

export function ClinicsTable({ clinics }: ClinicsTableProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);

  const counts = useMemo(
    () => ({
      all: clinics.length,
      active: clinics.filter((c) => c.subscriptionStatus === "active").length,
      past_due: clinics.filter((c) => c.subscriptionStatus === "past_due").length,
      cancelled: clinics.filter((c) => c.subscriptionStatus === "cancelled").length,
      trial: clinics.filter((c) => !c.subscriptionStatus).length,
    }),
    [clinics]
  );

  const filtered = useMemo(() => {
    return clinics.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(q) ||
        c.doctorName.toLowerCase().includes(q) ||
        c.specialty.toLowerCase().includes(q) ||
        c.phone.includes(q);

      const matchTab =
        activeTab === "all" ||
        (activeTab === "active" && c.subscriptionStatus === "active") ||
        (activeTab === "past_due" && c.subscriptionStatus === "past_due") ||
        (activeTab === "cancelled" && c.subscriptionStatus === "cancelled") ||
        (activeTab === "trial" && !c.subscriptionStatus);

      return matchSearch && matchTab;
    });
  }, [clinics, search, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5 flex-wrap">
          {TABS.map((tab) => {
            const count = counts[tab.id as keyof typeof counts];
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-teal-800 shadow-sm border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 opacity-50">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search clinics, doctors..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 text-sm pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 placeholder-slate-400 shadow-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Clinic / Doctor</TableHead>
              <TableHead className="font-semibold">Specialty</TableHead>
              <TableHead className="font-semibold">Joined</TableHead>
              <TableHead className="font-semibold text-right">Appts</TableHead>
              <TableHead className="font-semibold text-right">Revenue</TableHead>
              <TableHead className="font-semibold">Subscription</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-slate-500"
                >
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No clinics match your filter.</p>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((clinic) => (
                <TableRow
                  key={clinic.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        {clinic.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {clinic.doctorName} · {clinic.phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {clinic.specialty}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                    {format(new Date(clinic.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm font-medium text-slate-900 text-right">
                    {clinic.totalAppointments.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-emerald-700 text-right">
                    ₹{(clinic.totalRevenue / 100).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <SubBadge status={clinic.subscriptionStatus} />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/clinics/${clinic.id}`}
                      className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors inline-flex"
                      title="View clinic details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
            clinics
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm text-slate-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
