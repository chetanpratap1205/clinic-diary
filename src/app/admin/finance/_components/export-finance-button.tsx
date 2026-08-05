"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportFinanceButtonProps {
  mrr: number;
  arr: number;
  arpu: number;
  totalCash: number;
  totalLiability: number;
  activeCount: number;
}

export function ExportFinanceButton({
  mrr,
  arr,
  arpu,
  totalCash,
  totalLiability,
  activeCount,
}: ExportFinanceButtonProps) {
  const handleExport = () => {
    const timestamp = new Date().toISOString().split("T")[0];
    const csvRows = [
      ["Doctor Diary SaaS - Financial Summary Report", timestamp],
      [],
      ["Metric", "Value (INR)", "Context"],
      ["Monthly Recurring Revenue (MRR)", mrr, "Normalized active monthly subscriptions"],
      ["Annual Run Rate (ARR)", arr, "MRR * 12 Projection"],
      ["Average Revenue Per Clinic (ARPU)", arpu, "MRR / Active Paying Clinics"],
      ["Active Paying Clinics", activeCount, "Clinics with status = active"],
      ["All-Time Gross Cash Collected", totalCash, "Sum of all paid payment logs"],
      ["Partner Commission Liability", totalLiability, "Unsettled pending partner payouts"],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Doctor_Diary_Financial_Report_${timestamp}.csv`);
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
      Export Financial Report (CSV)
    </Button>
  );
}
