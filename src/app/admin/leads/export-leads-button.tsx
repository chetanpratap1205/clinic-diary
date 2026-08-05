"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { generateLeadDemoUrl } from "./message-builder";

interface ExportLeadsButtonProps {
  leads: any[];
}

export function ExportLeadsButton({ leads }: ExportLeadsButtonProps) {
  const handleExport = () => {
    const timestamp = format(new Date(), "yyyy-MM-dd");
    const csvRows = [
      [
        "Doctor Name",
        "Clinic Name",
        "Phone",
        "Email",
        "Specialty",
        "City",
        "Address",
        "Source Channel",
        "Lead Category",
        "Priority",
        "Status",
        "Playbook Step Sent",
        "Last Contacted",
        "Days Since Last Contact",
        "Follow-up Date",
        "Assigned To",
        "Notes",
        "Personalised Demo URL",
        "Added Date",
      ],
      ...leads.map((l) => {
        const demoUrl = generateLeadDemoUrl(l);
        const daysSince = l.lastContactedAt
          ? differenceInDays(new Date(), new Date(l.lastContactedAt))
          : "Never";

        return [
          l.doctorName ?? "",
          l.clinicName ?? "",
          l.phone ?? "",
          l.email ?? "",
          l.specialty ?? "",
          l.city ?? "",
          l.address ?? "",
          l.source ?? "online",
          l.leadCategory ?? "A",
          l.priority ?? "normal",
          l.status ?? "new",
          `Step ${l.messageSentStep ?? 0} / 3`,
          l.lastContactedAt ? format(new Date(l.lastContactedAt), "dd MMM yyyy") : "Never",
          daysSince === "Never" ? "Never" : `${daysSince} days`,
          l.followUpDate ? format(new Date(l.followUpDate), "dd MMM yyyy") : "",
          l.assignedTo ?? "",
          (l.notes ?? "").replace(/"/g, "'"),
          demoUrl,
          l.createdAt ? format(new Date(l.createdAt), "yyyy-MM-dd") : "",
        ];
      }),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" + // BOM for Excel compatibility
      csvRows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Doctor_Diary_Leads_${timestamp}.csv`);
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
