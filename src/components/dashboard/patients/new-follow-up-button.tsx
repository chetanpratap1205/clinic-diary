"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function NewFollowUpButton({ patientId }: { patientId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [days, setDays] = useState<number | "custom">(7);
  const [customDate, setCustomDate] = useState("");

  const presetDays = [3, 7, 15, 30];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let dueDateStr = "";
      if (days === "custom") {
        if (!customDate) {
          toast.error("Please select a date");
          setIsSubmitting(false);
          return;
        }
        dueDateStr = customDate;
      } else {
        const d = new Date();
        d.setDate(d.getDate() + days);
        dueDateStr = d.toISOString().split("T")[0];
      }

      const res = await fetch("/api/follow-ups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, dueDate: dueDateStr, notes }),
      });

      if (!res.ok) throw new Error("Failed to schedule follow-up");

      toast.success("Follow-up scheduled");
      setOpen(false);
      setNotes("");
      setDays(7);
      setCustomDate("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm gap-2">
          <Calendar className="w-4 h-4" />
          Schedule Follow-up
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Schedule Follow-up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">When?</label>
            <div className="grid grid-cols-4 gap-2">
              {presetDays.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={`py-2 text-sm font-medium rounded-xl border transition-colors ${
                    days === d
                      ? "bg-sky-50 border-sky-200 text-sky-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>
            
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setDays("custom")}
                className={`w-full py-2 text-sm font-medium rounded-xl border transition-colors ${
                  days === "custom"
                    ? "bg-sky-50 border-sky-200 text-sky-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Custom Date
              </button>
              {days === "custom" && (
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="mt-2 w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g. Review blood test results..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="rounded-xl border-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
