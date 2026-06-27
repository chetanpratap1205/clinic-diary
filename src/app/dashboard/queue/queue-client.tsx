"use client";

import { useState, useTransition, useEffect } from "react";
import { updateAppointmentStatus } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, User, Phone, Play, Check, X, AlertTriangle, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Appointment, Clinic } from "@/db/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface QueueClientProps {
  initialAppointments: Appointment[];
  clinic: Clinic;
}

function formatTimeDisplay(time: string): string {
  const t = time.slice(0, 5);
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function QueueClient({ initialAppointments, clinic }: QueueClientProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [isPending, startTransition] = useTransition();

  // Supabase Realtime for instant updates across devices
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`queue-dashboard-${clinic.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `clinic_id=eq.${clinic.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setAppointments((prev) =>
              prev.map((a) => (a.id === payload.new.id ? (payload.new as Appointment) : a))
            );
          } else if (payload.eventType === "INSERT") {
            const newAppt = payload.new as Appointment;
            if (newAppt.appointmentDate === format(new Date(), "yyyy-MM-dd")) {
              setAppointments((prev) => [...prev, newAppt]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinic.id]);

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    startTransition(async () => {
      // Optimistic update
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId ? { ...a, status: newStatus } : a
        )
      );

      const res = await updateAppointmentStatus(appointmentId, newStatus);
      if (res?.error) {
        toast.error(res.error);
        // Revert on error could be implemented here
      } else {
        toast.success(`Patient marked as ${newStatus.replace("_", " ")}`);
      }
    });
  };

  // Group appointments
  const scheduled = appointments
    .filter((a) => a.status === "confirmed")
    .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

  const checkedIn = appointments
    .filter((a) => a.status === "checked_in")
    .sort(
      (a, b) =>
        new Date(a.checkInTime || 0).getTime() - new Date(b.checkInTime || 0).getTime()
    );

  const inConsultation = appointments
    .filter((a) => a.status === "in_consultation")
    .sort(
      (a, b) =>
        new Date(a.consultationStartTime || 0).getTime() -
        new Date(b.consultationStartTime || 0).getTime()
    );

  const completed = appointments
    .filter((a) => ["completed", "cancelled", "no_show"].includes(a.status))
    .sort((a, b) => {
       const aTime = a.consultationEndTime ? new Date(a.consultationEndTime).getTime() : new Date(a.createdAt).getTime();
       const bTime = b.consultationEndTime ? new Date(b.consultationEndTime).getTime() : new Date(b.createdAt).getTime();
       return bTime - aTime; // descending
    });

  const QueueCard = ({ appt }: { appt: Appointment }) => {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, height: 0 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 group relative overflow-hidden"
      >
        {appt.status === "in_consultation" && (
           <motion.div 
             className="absolute top-0 left-0 w-1 h-full"
             style={{ backgroundColor: clinic.themeColor || "#0ea5e9" }}
             layoutId="active-indicator"
           />
        )}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-600 font-bold text-sm">
              {appt.patientName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{appt.patientName}</p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeDisplay(appt.appointmentTime)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions based on status */}
        <div className="flex gap-2 mt-1">
          {appt.status === "confirmed" && (
            <>
              <button
                onClick={() => handleStatusChange(appt.id, "checked_in")}
                disabled={isPending}
                className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark Arrived
              </button>
              <button
                 onClick={() => handleStatusChange(appt.id, "no_show")}
                 disabled={isPending}
                 className="px-3 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-xl text-xs font-semibold transition-colors"
                 title="No Show"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          )}

          {appt.status === "checked_in" && (
            <button
              onClick={() => handleStatusChange(appt.id, "in_consultation")}
              disabled={isPending}
              className="w-full bg-sky-50 text-sky-700 hover:bg-sky-100 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
              style={{ color: clinic.themeColor || "#0ea5e9", backgroundColor: `${clinic.themeColor || "#0ea5e9"}15` }}
            >
              <Play className="w-3 h-3" /> Start Consult
            </button>
          )}

          {appt.status === "in_consultation" && (
            <button
              onClick={() => handleStatusChange(appt.id, "completed")}
              disabled={isPending}
              className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3" /> Complete
            </button>
          )}
          
          {["completed", "cancelled", "no_show"].includes(appt.status) && (
            <div className="w-full text-center text-xs font-medium text-slate-400 capitalize py-1">
              {appt.status.replace("_", " ")}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const Column = ({ title, count, items, icon: Icon, colorClass }: any) => (
    <div className="flex-1 min-w-[300px] flex flex-col gap-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
          <Icon className={cn("w-4 h-4", colorClass)} /> {title}
        </h2>
        <span className="bg-white text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
          {count}
        </span>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        <AnimatePresence mode="popLayout">
          {items.map((appt: Appointment) => (
            <QueueCard key={appt.id} appt={appt} />
          ))}
          {items.length === 0 && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
               className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs py-10"
             >
               <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mb-3">
                 <Activity className="w-5 h-5 opacity-20" />
               </div>
               No patients here
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
      <div className="snap-start min-w-[300px] flex-1">
        <Column 
          title="Scheduled" 
          count={scheduled.length} 
          items={scheduled} 
          icon={Clock} 
          colorClass="text-slate-400"
        />
      </div>
      <div className="snap-start min-w-[300px] flex-1">
        <Column 
          title="Waiting" 
          count={checkedIn.length} 
          items={checkedIn} 
          icon={User} 
          colorClass="text-indigo-500"
        />
      </div>
      <div className="snap-start min-w-[300px] flex-1">
        <Column 
          title="In Consult" 
          count={inConsultation.length} 
          items={inConsultation} 
          icon={Play} 
          colorClass="text-sky-500"
        />
      </div>
      <div className="snap-start min-w-[300px] flex-1">
        <Column 
          title="Done" 
          count={completed.length} 
          items={completed} 
          icon={CheckCircle2} 
          colorClass="text-emerald-500"
        />
      </div>
    </div>
  );
}
