"use client";

import { useState, useTransition } from "react";
import { updateAppointmentStatus, completeAppointmentWithNotes } from "@/app/dashboard/actions";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Check,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AppointmentActionsProps {
  appointmentId: string;
  patientId: string | null;
  currentStatus: string;
}

export function AppointmentActions({
  appointmentId,
  patientId,
  currentStatus,
}: AppointmentActionsProps) {
  const [open, setOpen] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [notesData, setNotesData] = useState({
    complaint: "",
    treatment: "",
    followUpDays: "none" as number | "none",
  });

  function updateStatus(status: string) {
    setOpen(false);
    
    if (status === "completed") {
      setShowCompleteModal(true);
      return;
    }

    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Marked as ${status.replace(/_/g, " ")}`);
      }
    });
  }

  function handleCompleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await completeAppointmentWithNotes({
        appointmentId,
        patientId,
        complaint: notesData.complaint,
        treatment: notesData.treatment,
        followUpDays: notesData.followUpDays,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Appointment completed");
        setShowCompleteModal(false);
      }
    });
  }

  const actions = [
    {
      label: "Completed",
      status: "completed",
      icon: Check,
      color: "text-emerald-600",
      bg: "hover:bg-emerald-50",
    },
    {
      label: "No Show",
      status: "no_show",
      icon: AlertCircle,
      color: "text-amber-600",
      bg: "hover:bg-amber-50",
    },
    {
      label: "Cancel",
      status: "cancelled",
      icon: X,
      color: "text-red-600",
      bg: "hover:bg-red-50",
    },
  ].filter(
    (a) => a.status !== currentStatus && currentStatus !== "cancelled"
  );

  if (isPending && !showCompleteModal)
    return <Loader2 className="w-5 h-5 animate-spin text-sky-600" />;
  
  if (actions.length === 0) return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/30 active:scale-95"
          aria-label="Appointment actions"
          aria-expanded={open}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -8 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="absolute right-0 top-11 z-20 bg-white rounded-2xl border border-slate-200/70 shadow-2xl shadow-slate-900/10 overflow-hidden min-w-[160px]"
              >
                <div className="p-1.5">
                  {actions.map((action) => (
                    <button
                      key={action.status}
                      onClick={() => updateStatus(action.status)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors font-medium ${action.color} ${action.bg}`}
                    >
                      <action.icon className="w-4 h-4 flex-shrink-0" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Complete Visit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCompleteSubmit} className="space-y-5 pt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Complaint <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={notesData.complaint}
                onChange={(e) => setNotesData(prev => ({ ...prev, complaint: e.target.value }))}
                placeholder="E.g. Fever for 3 days"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Treatment/Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={notesData.treatment}
                onChange={(e) => setNotesData(prev => ({ ...prev, treatment: e.target.value }))}
                placeholder="E.g. Paracetamol 500mg BD"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
              />
            </div>

            {patientId ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Schedule Follow-up?
                </label>
                <div className="flex flex-wrap gap-2">
                  {["none", 3, 7, 15, 30].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setNotesData(prev => ({ ...prev, followUpDays: opt as any }))}
                      className={`px-4 py-2 text-sm font-medium rounded-xl border transition-colors ${
                        notesData.followUpDays === opt
                          ? "bg-sky-50 border-sky-200 text-sky-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {opt === "none" ? "No Follow-up" : `${opt} Days`}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-700">
                This is a legacy appointment without a linked patient. Follow-ups cannot be scheduled automatically.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCompleteModal(false)}
                className="rounded-xl border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Mark Complete
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
