"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { PaymentRow } from "./billing-table";
import { format } from "date-fns";

interface ExportBillingButtonProps {
  payments: PaymentRow[];
}

export function ExportBillingButton({ payments }: ExportBillingButtonProps) {
  const handleExport = () => {
    const timestamp = format(new Date(), "yyyy-MM-dd");
    const csvRows = [
      ["Date", "Time", "Clinic Name", "Plan Name", "Amount (INR)", "Status", "Gateway Order ID", "Gateway Payment ID"],
      ...payments.map((p) => [
        p.paidAt ? format(new Date(p.paidAt), "yyyy-MM-dd") : "",
        p.paidAt ? format(new Date(p.paidAt), "HH:mm:ss") : "",
        p.clinicName || "—",
        p.planName || "—",
        (p.amountPaise / 100).toFixed(2),
        p.status,
        p.razorpayOrderId || "—",
        p.razorpayPaymentId || "—",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Doctor_Diary_Billing_Ledger_${timestamp}.csv`);
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
      Export Ledger CSV
    </Button>
  );
}
