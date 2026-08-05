"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { adminUpdateFollowUpStatusAction } from "@/app/actions/admin-followups";
import { Button } from "@/components/ui/button";

interface FollowUpRowActionsProps {
  followUpId: string;
  patientName: string | null;
  patientPhone: string | null;
  clinicName: string | null;
  dueDate: string | Date;
  status: string;
}

export function FollowUpRowActions({
  followUpId,
  patientName,
  patientPhone,
  clinicName,
  dueDate,
  status,
}: FollowUpRowActionsProps) {
  const [loading, setLoading] = useState(false);

  const formattedPhone = patientPhone?.replace(/\D/g, "") || "";
  const waUrl = formattedPhone
    ? `https://wa.me/91${formattedPhone.slice(-10)}?text=${encodeURIComponent(
        `Hello ${patientName || "Patient"}, friendly reminder regarding your upcoming follow-up appointment at ${clinicName || "your clinic"}. Please reply to confirm your visit.`
      )}`
    : "#";

  const handleMarkCompleted = async () => {
    setLoading(true);
    try {
      const res = await adminUpdateFollowUpStatusAction(followUpId, "completed");
      if (res.success) {
        toast.success("Follow-up marked as completed ✓");
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {/* 1-Click WhatsApp Patient Reminder */}
      {formattedPhone && status !== "completed" && (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          title="Send WhatsApp Reminder to Patient"
        >
          <MessageSquare className="w-3 h-3" />
          WhatsApp
        </a>
      )}

      {/* 1-Click Mark Completed */}
      {status !== "completed" && (
        <Button
          onClick={handleMarkCompleted}
          disabled={loading}
          size="sm"
          variant="outline"
          className="h-7 text-xs px-2 gap-1 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border-slate-200"
          title="Mark Follow-up as Completed"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
          Complete
        </Button>
      )}
    </div>
  );
}
