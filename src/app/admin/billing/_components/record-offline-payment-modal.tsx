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
import { PlusCircle, Loader2, CreditCard, CheckCircle2 } from "lucide-react";
import { recordOfflinePaymentAction } from "@/app/actions/billing";
import { toast } from "sonner";
import { formatDoctorName } from "@/lib/utils";

interface ClinicOption {
  id: string;
  name: string;
  doctorName: string;
}

interface RecordOfflinePaymentModalProps {
  clinics: ClinicOption[];
}

export function RecordOfflinePaymentModal({ clinics }: RecordOfflinePaymentModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [planId, setPlanId] = useState("quarterly");
  const [amountRupees, setAmountRupees] = useState("1499");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handlePlanChange = (selectedPlan: string) => {
    setPlanId(selectedPlan);
    if (selectedPlan === "quarterly") setAmountRupees("1499");
    else if (selectedPlan === "yearly") setAmountRupees("4999");
    else if (selectedPlan === "monthly") setAmountRupees("499");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClinicId) {
      toast.error("Please select a clinic");
      return;
    }
    if (!amountRupees || Number(amountRupees) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);

    try {
      const planName =
        planId === "quarterly"
          ? "Quarterly Plan (3 Months)"
          : planId === "yearly"
          ? "Annual Plan (12 Months)"
          : "Monthly Plan (1 Month)";

      const res = await recordOfflinePaymentAction({
        clinicId: selectedClinicId,
        planId,
        planName,
        amountRupees: Number(amountRupees),
        paymentMethod,
        referenceNumber,
        notes,
      });

      if (res.success) {
        toast.success("Offline payment recorded & subscription activated successfully!");
        setOpen(false);
        setReferenceNumber("");
        setNotes("");
      } else {
        toast.error(res.error || "Failed to record payment");
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
        className="h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shadow-xs"
      >
        <PlusCircle className="w-3.5 h-3.5" />
        Record Offline Payment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
              <CreditCard className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">Record Offline Payment</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Log bank transfers, cash, or offline payments to activate practice subscription.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Select Clinic */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Select Clinic</Label>
              <select
                value={selectedClinicId}
                onChange={(e) => setSelectedClinicId(e.target.value)}
                required
                className="w-full h-9 bg-white border border-slate-200 text-slate-900 text-xs px-3 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                <option value="">-- Choose Practice / Clinic --</option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({formatDoctorName(c.doctorName)})
                  </option>
                ))}
              </select>
            </div>

            {/* Plan & Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Plan Tier</Label>
                <select
                  value={planId}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full h-9 bg-white border border-slate-200 text-slate-900 text-xs px-3 rounded-lg focus:outline-none focus:border-teal-500"
                >
                  <option value="quarterly">Quarterly (₹1,499)</option>
                  <option value="yearly">Annual (₹4,999)</option>
                  <option value="monthly">Monthly (₹499)</option>
                  <option value="custom">Custom Plan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Amount (₹ INR)</Label>
                <Input
                  type="number"
                  value={amountRupees}
                  onChange={(e) => setAmountRupees(e.target.value)}
                  required
                  placeholder="1499"
                  className="h-9 text-xs font-bold"
                />
              </div>
            </div>

            {/* Payment Method & UTR Ref */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Payment Mode</Label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-9 bg-white border border-slate-200 text-slate-900 text-xs px-3 rounded-lg focus:outline-none focus:border-teal-500"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="upi">Direct UPI Transfer</option>
                  <option value="cash">Cash / Hand Delivery</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">UTR / Ref Number</Label>
                <Input
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. UTR1092834928"
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" disabled={loading}>
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Record Payment & Activate
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
