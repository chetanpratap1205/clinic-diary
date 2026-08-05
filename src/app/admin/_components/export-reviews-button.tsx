"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ReviewRow } from "./reviews-table";
import { format } from "date-fns";

interface ExportReviewsButtonProps {
  reviews: ReviewRow[];
}

export function ExportReviewsButton({ reviews }: ExportReviewsButtonProps) {
  const handleExport = () => {
    const timestamp = format(new Date(), "yyyy-MM-dd");
    const csvRows = [
      ["Date", "Clinic Name", "Patient Name", "Rating", "Comment", "Status"],
      ...reviews.map((r) => [
        r.createdAt ? format(new Date(r.createdAt), "yyyy-MM-dd") : "",
        r.clinicName || "—",
        r.patientName || "Anonymous",
        r.rating,
        r.comment ? r.comment.replace(/"/g, '""') : "",
        r.isVerified ? "Verified" : "Unverified / Pending",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Doctor_Diary_Reviews_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      className="h-9 gap-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border-slate-300 shadow-xs"
    >
      <Download className="w-3.5 h-3.5 text-teal-600" />
      Export Reviews CSV
    </Button>
  );
}
