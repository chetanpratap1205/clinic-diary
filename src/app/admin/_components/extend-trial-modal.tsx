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
import { Zap, Loader2, Calendar } from "lucide-react";
import { extendClinicTrialAction } from "@/app/actions/clinics";
import { toast } from "sonner";
import { format } from "date-fns";
import { formatDoctorName } from "@/lib/utils";

interface ExtendTrialModalProps {
  clinic: {
    id: string;
    name: string;
    doctorName: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExtendTrialModal({ clinic, open, onOpenChange }: ExtendTrialModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number>(14);

  const handleExtend = async () => {
    setLoading(true);
    try {
      const res = await extendClinicTrialAction(clinic.id, selectedDays);
      if (res.success && res.newEndDate) {
        toast.success(
          `Extended access for ${clinic.name} by ${selectedDays} days (Valid until ${format(new Date(res.newEndDate), "MMM d, yyyy")})`
        );
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to extend access");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-2">
            <Zap className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold">Extend Clinic Access</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Grant extra active subscription/trial days to <span className="font-semibold text-slate-800">{clinic.name}</span> ({formatDoctorName(clinic.doctorName)}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <p className="text-xs font-semibold text-slate-700">Select Trial Extension Period:</p>
          <div className="grid grid-cols-3 gap-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setSelectedDays(days)}
                className={`py-2.5 px-3 rounded-lg border text-xs font-bold transition-all ${
                  selectedDays === days
                    ? "bg-teal-50 border-teal-500 text-teal-700 ring-2 ring-teal-100"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                +{days} Days
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleExtend} className="bg-teal-600 hover:bg-teal-700 text-white gap-1.5" disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
            Grant +{selectedDays} Days
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
