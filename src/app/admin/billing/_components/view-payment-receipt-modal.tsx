"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Printer, CheckCircle2, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

export interface PaymentReceipt {
  id: string;
  amountPaise: number;
  status: string;
  paidAt: Date | string;
  planName: string;
  planId: string;
  razorpayOrderId: string | null;
  razorpayPaymentId?: string | null;
  clinicName: string | null;
}

interface ViewPaymentReceiptModalProps {
  receipt: PaymentReceipt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewPaymentReceiptModal({ receipt, open, onOpenChange }: ViewPaymentReceiptModalProps) {
  if (!receipt) return null;

  const amountRupees = (receipt.amountPaise / 100).toLocaleString("en-IN");
  const formattedDate = receipt.paidAt ? format(new Date(receipt.paidAt), "MMMM d, yyyy · h:mm a") : "Pending";

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="pb-2 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">Payment Invoice Receipt</DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Transaction Receipt #{receipt.id.slice(0, 8).toUpperCase()}
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {receipt.status.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 print:p-0">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Billed To Practice:</span>
              <span className="text-sm font-bold text-slate-900">{receipt.clinicName ?? "Direct Subscription"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Subscription Tier:</span>
              <span className="text-xs font-semibold text-slate-800">{receipt.planName || "Standard Plan"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Payment Timestamp:</span>
              <span className="text-xs text-slate-700 font-mono">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Order ID:</span>
              <span className="text-xs font-mono text-slate-600 truncate max-w-[200px]">{receipt.razorpayOrderId ?? "N/A"}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-sm font-bold text-slate-800">Total Billed Amount:</span>
              <span className="text-lg font-black text-emerald-700">₹{amountRupees}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Verified Gateway Transaction Record • Doctor Diary Platform
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </Button>
          <Button size="sm" onClick={() => onOpenChange(false)} className="bg-slate-900 hover:bg-slate-800 text-white">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
