"use client";

import { useState, useTransition } from "react";
import { updateAppointmentStatus } from "@/app/dashboard/actions";
import { toast } from "sonner";
import {
  MoreHorizontal,
  Check,
  X,
  AlertCircle,
  Loader2,
  UserCheck,
  Activity,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AppointmentActionsProps {
  appointmentId: string;
  currentStatus: string;
}

export function AppointmentActions({
  appointmentId,
  currentStatus,
}: AppointmentActionsProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateStatus(status: string) {
    setOpen(false);
    startTransition(async () => {
      const result = await updateAppointmentStatus(appointmentId, status);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Marked as ${status.replace(/_/g, " ")}`);
      }
    });
  }

  const actions = [
    {
      label: "Checked In",
      status: "checked_in",
      icon: UserCheck,
      color: "text-indigo-600",
      bg: "hover:bg-indigo-50",
    },
    {
      label: "In Consult",
      status: "in_consultation",
      icon: Activity,
      color: "text-fuchsia-600",
      bg: "hover:bg-fuchsia-50",
    },
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

  if (isPending)
    return <Loader2 className="w-5 h-5 animate-spin text-sky-600" />;
  if (actions.length === 0) return null;

  return (
    <div className="relative">
      {/* Always visible action button — critical for mobile (no hover) */}
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
            {/* Backdrop — closes menu when tapping outside */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />

            {/* Dropdown menu — positions smartly to avoid edge overflow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -8 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute right-0 top-11 z-20 bg-white rounded-2xl border border-slate-200/70 shadow-2xl shadow-slate-900/10 overflow-hidden min-w-[160px]"
              style={{ maxHeight: "calc(100vh - 200px)" }}
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
  );
}
