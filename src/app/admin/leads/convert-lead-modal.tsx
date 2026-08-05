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
import { Building2, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { convertLeadToClinicAction } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ConvertLeadModalProps {
  lead: {
    id: string;
    doctorName: string;
    clinicName?: string | null;
    specialty?: string | null;
    city?: string | null;
    phone: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConvertLeadModal({ lead, open, onOpenChange }: ConvertLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleConvert = async () => {
    setLoading(true);
    try {
      const res = await convertLeadToClinicAction(lead.id);
      if (res.success) {
        toast.success(`✅ Clinic account provisioned for ${res.clinicName || lead.doctorName}! 14-day trial activated.`);
        onOpenChange(false);
        // Navigate to the clinics list — individual clinic detail page may not exist
        router.push("/admin/clinics");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to convert lead");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold">Provision Active Clinic Account</DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Convert lead <span className="font-semibold text-slate-800">{lead.doctorName}</span> ({lead.clinicName || "Practice Clinic"}) into a live clinic account with an automatic 14-day trial.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Doctor Name:</span>
            <span className="font-semibold text-slate-800">{lead.doctorName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Clinic Name:</span>
            <span className="font-semibold text-slate-800">{lead.clinicName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Specialty:</span>
            <span className="font-semibold text-slate-800">{lead.specialty || "General Physician"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone:</span>
            <span className="font-mono text-slate-700">{lead.phone}</span>
          </div>
          <div className="flex justify-between pt-1.5 border-t border-slate-200 text-emerald-700 font-bold">
            <span>Initial Access:</span>
            <span>14-Day Free Trial</span>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConvert} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" disabled={loading}>
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Building2 className="w-3.5 h-3.5" />}
            Provision & Activate Clinic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
