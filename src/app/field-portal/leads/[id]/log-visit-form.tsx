"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { logVisit } from "../../actions";
import { toast } from "sonner";
import { MapPin, Loader2 } from "lucide-react";

interface LogVisitFormProps {
  leadId: string;
  currentStatus: string;
}

export function LogVisitForm({ leadId, currentStatus }: LogVisitFormProps) {
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!notes.trim()) {
      toast.error("Please add notes about your visit");
      return;
    }

    startTransition(async () => {
      try {
        await logVisit(leadId, notes, status !== currentStatus ? status : undefined);
        toast.success("✅ Visit logged successfully!");
        setNotes("");
      } catch (err: any) {
        toast.error(err.message || "Failed to log visit");
      }
    });
  };

  const statusOptions = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "demo_scheduled", label: "Demo Scheduled" },
    { value: "converted", label: "Converted ✅" },
    { value: "rejected", label: "Rejected ❌" },
  ];

  return (
    <div className="fixed bottom-20 md:bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] p-4 md:static md:rounded-2xl md:border md:shadow-sm z-40">
      <form onSubmit={handleSubmit} className="space-y-3 max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Log Visit</h3>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <div className="col-span-3">
            <Label className="sr-only">Visit Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What happened during this visit? (e.g. Met doctor, showed demo...)"
              className="resize-none bg-slate-50 text-sm min-h-[72px]"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label className="text-xs text-slate-500">Update Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-slate-50 text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              disabled={isPending || !notes.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Log Visit"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
