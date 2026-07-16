"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { logVisit } from "../../actions";

export function LogVisitForm({ leadId, currentStatus }: { leadId: string, currentStatus: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState(currentStatus);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast.error("Please add some notes about the visit");
      return;
    }

    setIsSubmitting(true);
    try {
      await logVisit(leadId, notes, status !== currentStatus ? status : undefined);
      toast.success("Visit logged successfully!");
      setNotes("");
    } catch (err) {
      toast.error("Failed to log visit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-40 md:relative md:border md:rounded-2xl md:shadow-sm md:mt-8">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-3">
        <h3 className="hidden md:block text-lg font-bold text-slate-900 mb-4">Log a Visit</h3>
        
        <div className="flex gap-3">
          <div className="flex-1">
            <Textarea 
              placeholder="What happened during the visit?" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px] max-h-[120px] resize-none bg-slate-50 text-sm"
            />
          </div>
          <div className="w-1/3 flex flex-col justify-between gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-9 text-xs bg-slate-50">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="demo_scheduled">Demo Scheduled</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={isSubmitting || !notes.trim()} className="h-9 w-full bg-blue-600 hover:bg-blue-700 text-xs">
              {isSubmitting ? "Saving..." : "Log Visit"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
