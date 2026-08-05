"use client";

import { useState, useEffect } from "react";
import { Search, Star, MessageSquare, AlertCircle, Filter } from "lucide-react";
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
import { ReviewTableActions } from "./review-table-actions";

export type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  isVerified: boolean;
  createdAt: Date | string;
  clinicName: string | null;
  clinicId: string;
  patientName: string | null;
};

interface ReviewsTableProps {
  reviews: ReviewRow[];
  totalCount: number;
  currentPage: number;
  currentSearch: string;
  currentTab: string;
  currentRating: string;
  counts: {
    all: number;
    verified: number;
    pending: number;
    critical: number;
  };
}

const TABS = [
  { id: "all", label: "All Reviews" },
  { id: "verified", label: "Verified ✓" },
  { id: "pending", label: "Pending Moderation" },
  { id: "critical", label: "Critical Feedback (1-2★) ⚠️" },
];

const RATINGS = [
  { id: "all", label: "All Ratings" },
  { id: "5", label: "5 Stars ★★★★★" },
  { id: "4", label: "4 Stars ★★★★" },
  { id: "3", label: "3 Stars ★★★" },
  { id: "2", label: "2 Stars ★★" },
  { id: "1", label: "1 Star ★" },
];

const PAGE_SIZE = 25;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsTable({
  reviews,
  totalCount,
  currentPage,
  currentSearch,
  currentTab,
  currentRating,
  counts,
}: ReviewsTableProps) {
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

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
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
      <div className="flex flex-col gap-3">
        {/* Status Tabs */}
        <div className="flex bg-slate-100/80 rounded-xl p-1 gap-0.5 flex-wrap">
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

        {/* Search & Rating Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clinic, patient, comment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 placeholder-slate-400 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs shadow-xs w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={currentRating}
              onChange={(e) => updateParam("rating", e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              {RATINGS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs relative w-full">
        <div className="min-w-[750px]">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Clinic</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap hidden sm:table-cell">Patient</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Rating</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap">Feedback Comment</TableHead>
                <TableHead className="font-semibold text-xs whitespace-nowrap hidden md:table-cell">Date</TableHead>
                <TableHead className="font-semibold text-xs text-right whitespace-nowrap">Moderation Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400 text-sm">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No patient reviews match your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                reviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell className="text-xs font-semibold text-slate-900 min-w-[150px] truncate">
                      {review.clinicName ?? "—"}
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-xs text-slate-600 truncate">
                      {review.patientName ?? "Anonymous Patient"}
                    </TableCell>

                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={review.rating} />
                        {review.rating <= 2 && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
                            Low Rating
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="max-w-[280px]">
                      <p className="text-xs text-slate-700 line-clamp-2">
                        {review.comment ? (
                          `"${review.comment}"`
                        ) : (
                          <span className="italic text-slate-400">No comment text provided</span>
                        )}
                      </p>
                    </TableCell>

                    <TableCell className="hidden md:table-cell text-xs text-slate-500 whitespace-nowrap">
                      {review.createdAt ? format(new Date(review.createdAt), "MMM d, yyyy") : "—"}
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <ReviewTableActions reviewId={review.id} isVerified={review.isVerified} />
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
            {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} reviews
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
