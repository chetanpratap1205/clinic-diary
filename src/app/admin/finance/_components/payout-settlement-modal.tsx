"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2, Wallet } from "lucide-react";
import { settlePartnerPayoutsAction } from "@/app/actions/finance";
import { toast } from "sonner";

interface PayoutSettlementModalProps {
  partner: {
    partnerId: string;
    name: string;
    amountPaise: number;
    count: number;
  };
  trigger?: React.ReactNode;
}

export function PayoutSettlementModal({ partner }: PayoutSettlementModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refNumber, setRefNumber] = useState("");

  const amount = Math.round(Number(partner.amountPaise) / 100);

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const note = refNumber ? `Settled via UPI/NEFT Ref: ${refNumber}` : "Settled via Admin Console";
      const res = await settlePartnerPayoutsAction(partner.partnerId, note);
      if (res.success) {
        toast.success(`Successfully settled ₹${amount.toLocaleString("en-IN")} for ${partner.name}`);
        setOpen(false);
      } else {
        toast.error(res.error || "Failed to settle payout");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1 shadow-xs"
      >
        <CheckCircle2 className="w-3 h-3" />
        Settle ₹{amount.toLocaleString("en-IN")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <Wallet className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Settle Partner Commission</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Confirm payment of pending commissions owed to <span className="font-semibold text-slate-800">{partner.name}</span>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSettle} className="space-y-4 pt-2">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Partner Name:</span>
                <span className="font-semibold text-slate-800">{partner.name}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Pending Transactions:</span>
                <span className="font-semibold text-slate-800">{partner.count} payout(s)</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-slate-200">
                <span className="text-slate-700">Total Settlement:</span>
                <span className="text-emerald-700">₹{amount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ref" className="text-xs font-semibold text-slate-700">
                Transaction Reference / UTR Number (Optional)
              </Label>
              <Input
                id="ref"
                placeholder="e.g. UPI/423190823490 or NEFT109283"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" disabled={loading}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Confirm Settlement
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
