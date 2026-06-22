"use client";

import { useState, useTransition } from "react";
import { updateAppointmentStatus } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { MoreHorizontal, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AppointmentActionsProps {
  appointmentId: string;
  currentStatus: string;
}

export function AppointmentActions({ appointmentId, currentStatus }: AppointmentActionsProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateStatus(status: string) {
    setOpen(false);
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Marked as ${status.replace("_", " ")}`);
      }
    });
  }

  const actions = [
    { label: "Completed", status: "completed", icon: Check, color: "text-emerald-600 hover:bg-emerald-50" },
    { label: "No Show", status: "no_show", icon: AlertCircle, color: "text-amber-600 hover:bg-amber-50" },
    { label: "Cancel", status: "cancelled", icon: X, color: "text-red-600 hover:bg-red-50" },
  ].filter((a) => a.status !== currentStatus && currentStatus !== "cancelled");

  if (isPending) return <Loader2 className="w-5 h-5 animate-spin text-sky-600" />;
  if (actions.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/20"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-10 z-20 bg-white rounded-xl border border-slate-200/60 shadow-xl overflow-hidden min-w-[160px]"
            >
              <div className="p-1">
                {actions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => updateStatus(action.status)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors font-medium ${action.color}`}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
