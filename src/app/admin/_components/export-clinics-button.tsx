"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { ClinicRow } from "./clinics-table";
import { format } from "date-fns";

interface ExportClinicsButtonProps {
  clinics: ClinicRow[];
}

export function ExportClinicsButton({ clinics }: ExportClinicsButtonProps) {
  const handleExport = () => {
    const timestamp = format(new Date(), "yyyy-MM-dd");
    const csvRows = [
      ["Clinic Name", "Doctor Name", "Specialty", "Phone", "Joined Date", "30d Appts", "Total Appts", "Total Revenue (INR)", "Subscription Status"],
      ...clinics.map((c) => [
        c.name,
        c.doctorName,
        c.specialty,
        c.phone,
        c.createdAt ? format(new Date(c.createdAt), "yyyy-MM-dd") : "",
        c.apptVolume30d || 0,
        c.totalAppointments || 0,
        c.totalRevenue ? (c.totalRevenue / 100).toFixed(2) : "0",
        c.subscriptionStatus || "Trial / Free",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Doctor_Diary_Clinics_Directory_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="sm"
      className="h-9 gap-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border-slate-300 shadow-sm"
    >
      <Download className="w-3.5 h-3.5 text-teal-600" />
      Export CSV
    </Button>
  );
}
