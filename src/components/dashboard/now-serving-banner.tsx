"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ChevronRight } from "lucide-react";
import type { Appointment } from "@/db/schema";
import { format } from "date-fns";
import Link from "next/link";
import { normalizeAppointment } from "@/lib/appointment-utils";
import { getClinicTodayDate } from "@/lib/timezone";

interface NowServingBannerProps {
  clinicId: string;
  initialAppointments: Appointment[];
  themeColor: string;
}

export function NowServingBanner({ clinicId, initialAppointments, themeColor }: NowServingBannerProps) {
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    (initialAppointments || []).map(normalizeAppointment)
  );

  useEffect(() => {
    if (initialAppointments) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAppointments(initialAppointments.map(normalizeAppointment));
    }
  }, [initialAppointments]);

  useEffect(() => {
    const supabase = createClient();
    let isReconnecting = false;

    const channel = supabase
      .channel(`now-serving-${clinicId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `clinic_id=eq.${clinicId}`,
        },
        (payload) => {
          const today = getClinicTodayDate();
          if (payload.eventType === "UPDATE") {
            const updated = normalizeAppointment(payload.new);
            setAppointments((prev) => {
              if (updated.appointmentDate !== today) {
                return prev.filter((a) => a.id !== updated.id);
              }
              const exists = prev.some((a) => a.id === updated.id);
              if (!exists) return [...prev, updated];
              return prev.map((a) => (a.id === updated.id ? updated : a));
            });
          } else if (payload.eventType === "INSERT") {
            const newAppt = normalizeAppointment(payload.new);
            if (newAppt.appointmentDate === today) {
              setAppointments((prev) => {
                if (prev.some((a) => a.id === newAppt.id)) return prev;
                return [...prev, newAppt];
              });
            }
          } else if (payload.eventType === "DELETE") {
            if (payload.old?.id) {
              setAppointments((prev) => prev.filter((a) => a.id !== payload.old.id));
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && isReconnecting) {
          isReconnecting = false;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          isReconnecting = true;
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinicId]);

  const inConsultation = appointments
    .filter((a) => a && a.status === "in_consultation")
    .sort(
      (a, b) =>
        new Date(a.consultationStartTime || 0).getTime() -
        new Date(b.consultationStartTime || 0).getTime()
    );

  const checkedIn = appointments
    .filter((a) => a && a.status === "checked_in")
    .sort((a, b) => (a.tokenNumber || 0) - (b.tokenNumber || 0));

  const currentlyServing = inConsultation[0];
  const nextUp = checkedIn[0];

  if (!currentlyServing && !nextUp) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col sm:flex-row gap-3 mt-4"
      >
        {currentlyServing && (
          <Link
            href={`/dashboard/consultation/${currentlyServing.id}`}
            className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 flex items-center justify-between group shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden"
                style={{ backgroundColor: themeColor }}
              >
                <div className="absolute inset-0 bg-white/20"></div>
                <Play className="w-5 h-5 text-white fill-current relative z-10" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Now Serving</p>
                <p className="text-base font-bold text-white flex items-center gap-2">
                  {currentlyServing.patientName || "Patient"}
                  {currentlyServing.tokenNumber !== null && currentlyServing.tokenNumber !== undefined && (
                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs">#{currentlyServing.tokenNumber}</span>
                  )}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors group-hover:translate-x-1" />
          </Link>
        )}

        {nextUp && (
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <span className="text-slate-400 font-bold text-lg">
                  {nextUp.tokenNumber !== null && nextUp.tokenNumber !== undefined ? `#${nextUp.tokenNumber}` : "-"}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Next Up</p>
                <p className="text-base font-bold text-slate-800">{nextUp.patientName || "Patient"}</p>
              </div>
            </div>
            <Link
              href="/dashboard/queue"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Queue
            </Link>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
