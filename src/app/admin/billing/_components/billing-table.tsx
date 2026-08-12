"use client";

import { useState, useEffect } from "react";
import { Search, CreditCard, ExternalLink, FileText } from "lucide-react";
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
import { ViewPaymentReceiptModal, type PaymentReceipt } from "./view-payment-receipt-modal";

export type PaymentRow = {
  id: string;
  invoiceNumber: string | null;
  amountPaise: number;
  status: string;
  paidAt: Date | string;
  planName: string;
  planId: string;
  razorpayOrderId: string | null;
  razorpayPaymentId?: string | null;
  clinicName: string | null;
};

interface BillingTableProps {
  payments: PaymentRow[];
  totalPages: number;
  totalCount: number;
  currentPage: number;
  currentSearch: string;
  currentStatus: string;
  counts: {
    all: number;
    paid: number;
    pending: number;
    failed: number;
  };
}

const TABS = [
  { id: "all", label: "All Payments" },
  { id: "paid", label: "Paid" },
  { id: "pending", label: "Pending" },
  { id: "failed", label: "Failed" },
];

const PAGE_SIZE = 50;

const planColors: Record<string, string> = {
  monthly: "bg-sky-50 text-sky-700 border-sky-200",
  quarterly: "bg-violet-50 text-violet-700 border-violet-200",
  yearly: "bg-amber-50 text-amber-700 border-amber-200",
};

export function BillingTable({
  payments,
  totalPages,
  totalCount,
  currentPage,
  currentSearch,
  currentStatus,
  counts,
}: BillingTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(currentSearch);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);

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

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status && status !== "all") params.set("status", status);
    else params.delete("status");
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
      {/* View Invoice Receipt Modal */}
      <ViewPaymentReceiptModal
        receipt={selectedReceipt}
        open={!!selectedReceipt}
        onOpenChange={(open) => {
          if (!open) setSelectedReceipt(null);
        }}
      />

      {/* Search Bar & Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex bg-slate-100/80 rounded-xl p-1 gap-0.5 flex-wrap">
          {TABS.map((tab) => {
            const count = counts[tab.id as keyof typeof counts] || 0;
            return (
              <button
                key={tab.id}
                onClick={() => handleStatusChange(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  currentStatus === tab.id
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
            placeholder="Search clinic, plan, order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 placeholder-slate-400 shadow-xs"
          />
        </div>
      </div>

      {/* Payment Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs relative w-full">
        <div className="min-w-[750px]">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Date & Time</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Clinic</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap hidden sm:table-cell">Plan Tier</TableHead>
                <TableHead className="font-semibold text-xs text-right whitespace-nowrap">Amount</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Status</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap hidden md:table-cell">Gateway Reference</TableHead>
                <TableHead className="w-10 text-right">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-400 text-sm">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No payment logs match your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    onClick={() => setSelectedReceipt(payment)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <TableCell className="whitespace-nowrap text-xs text-slate-600">
                      {payment.paidAt ? format(new Date(payment.paidAt), "MMM d, yyyy") : "Pending"}
                      <span className="block text-[10px] text-slate-400">
                        {payment.paidAt ? format(new Date(payment.paidAt), "h:mm a") : ""}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-xs text-slate-900 min-w-[160px] truncate">
                      {payment.clinicName ?? "Direct Signup"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={planColors[payment.planId] ?? "bg-slate-50 text-slate-600"}
                      >
                        {payment.planName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-extrabold text-emerald-700 text-xs whitespace-nowrap">
                      ₹{(payment.amountPaise / 100).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          payment.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : payment.status === "pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }
                      >
                        {payment.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell font-mono text-[11px] text-slate-500 max-w-[150px] truncate">
                      {payment.invoiceNumber || payment.razorpayOrderId || payment.id.slice(0, 10)}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReceipt(payment);
                        }}
                        className="p-1.5 rounded-lg hover:bg-teal-50 text-slate-400 hover:text-teal-600 transition-colors inline-flex"
                        title="View Invoice Receipt"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
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
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} records
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
