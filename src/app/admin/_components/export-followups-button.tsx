"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { FollowUpRow } from "./followups-table";
import { format } from "date-fns";

interface ExportFollowUpsButtonProps {
  followUps: FollowUpRow[];
}

export function ExportFollowUpsButton({ followUps }: ExportFollowUpsButtonProps) {
  const handleExport = () => {
    const timestamp = format(new Date(), "yyyy-MM-dd");
    const csvRows = [
      ["Due Date", "Patient Name", "Patient Phone", "Clinic Name", "Status", "Notes"],
      ...followUps.map((f) => [
        f.dueDate ? format(new Date(f.dueDate), "yyyy-MM-dd") : "",
        f.patientName || "Unknown",
        f.patientPhone || "",
        f.clinicName || "—",
        f.status,
        f.notes ? f.notes.replace(/"/g, '""') : "",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Doctor_Diary_FollowUps_${timestamp}.csv`);
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
      Export CSV
    </Button>
  );
}
