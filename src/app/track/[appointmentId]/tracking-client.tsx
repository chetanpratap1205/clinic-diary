"use client";

import { useEffect, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Check,
  Phone,
  Navigation,
  XCircle,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Appointment, Clinic } from "@/db/schema";

interface TrackingClientProps {
  appointment: Appointment;
  clinic: Clinic;
}

async function cancelAppointment(appointmentId: string) {
  const res = await fetch(`/api/appointments/${appointmentId}/cancel`, {
    method: "POST",
  });
  return res.ok;
}

export function TrackingClient({
  appointment: initialAppointment,
  clinic,
}: TrackingClientProps) {
  const [appointment, setAppointment] = useState(initialAppointment);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const themeColor = clinic.themeColor ?? "#0ea5e9";

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`appointment-${appointment.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "appointments",
          filter: `id=eq.${appointment.id}`,
        },
        (payload) => {
          setAppointment(payload.new as Appointment);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appointment.id]);

  // Swiggy-style timeline states
  const statuses = [
    {
      id: "confirmed",
      title: "Booking Confirmed",
      desc: "Your slot has been successfully reserved.",
    },
    {
      id: "checked_in",
      title: "Checked In",
      desc: "You are checked in and waiting.",
    },
    {
      id: "in_consultation",
      title: "In Consultation",
      desc: `Dr. ${clinic.doctorName} is seeing you now.`,
    },
    {
      id: "completed",
      title: "Completed",
      desc: "Thank you for visiting!",
    },
  ];

  let currentIndex = 0;
  if (appointment.status === "completed") currentIndex = 4;
  else if (appointment.status === "in_consultation") currentIndex = 2;
  else if (appointment.status === "checked_in") currentIndex = 1;
  else if (appointment.status === "no_show") currentIndex = 4;
  else if (appointment.status === "cancelled") currentIndex = -1;
  else {
    currentIndex = 0;
  }

  function formatTimeDisplay(time: string): string {
    const t = time.slice(0, 5);
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  const isCancelled =
    appointment.status === "cancelled" || appointment.status === "no_show";
  const isCompleted = appointment.status === "completed";
  const canCancel =
    !isCancelled && !isCompleted && appointment.status !== "in_consultation";

  const handleCancel = () => {
    startTransition(async () => {
      const ok = await cancelAppointment(appointment.id);
      if (ok) {
        setAppointment((prev) => ({ ...prev, status: "cancelled" }));
        setShowCancelModal(false);
      }
    });
  };

  // Build directions URL
  const directionsUrl = clinic.address
    ? `https://maps.google.com/?q=${encodeURIComponent(clinic.address)}`
    : `https://maps.google.com/?q=${encodeURIComponent(clinic.name)}`;

  return (
    <>
      <div className="space-y-6">
        {/* Header Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div
            className="w-16 h-16 mx-auto rounded-2xl shadow-sm flex items-center justify-center text-white text-2xl font-bold mb-4"
            style={{ backgroundColor: themeColor }}
          >
            {clinic.name[0]?.toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {clinic.name}
          </h1>
          <p className="text-slate-500 font-medium mt-1">Live Tracking</p>
        </motion.div>

        {/* Primary Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Appointment Time
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-slate-900">
                      {format(new Date(appointment.appointmentDate as string), "MMM d")}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-lg font-bold text-slate-900">
                      {formatTimeDisplay(appointment.appointmentTime as string)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-4 space-y-8">
                <div className="absolute top-4 bottom-4 left-6 w-0.5 bg-slate-100 rounded-full" />

                {isCancelled ? (
                  <div className="relative flex items-start gap-4">
                    <div className="absolute -left-2 top-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center z-10">
                      <XCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-red-600">
                        Appointment Cancelled
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        This appointment has been marked as cancelled or
                        no-show.
                      </p>
                    </div>
                  </div>
                ) : (
                  statuses.map((status, idx) => {
                    const isStepCompleted = idx < currentIndex;
                    const isActive = idx === currentIndex;
                    const isPendingStep = idx > currentIndex;

                    return (
                      <motion.div
                        key={status.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1 }}
                        className={`relative flex items-start gap-4 ${
                          isPendingStep ? "opacity-40" : ""
                        }`}
                      >
                        {/* Node */}
                        <div className="absolute -left-2 top-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center z-10">
                          {isStepCompleted ? (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                              style={{ backgroundColor: themeColor }}
                            >
                              <Check className="w-3 h-3" />
                            </div>
                          ) : isActive ? (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: themeColor }}
                            >
                              <motion.div
                                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-full h-full rounded-full absolute"
                                style={{ backgroundColor: themeColor, opacity: 0.5 }}
                              />
                              <div className="w-2 h-2 bg-white rounded-full relative z-10" />
                            </div>
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-slate-200" />
                          )}
                        </div>

                        {/* Content */}
                        <div>
                          <h3
                            className={`text-sm font-bold ${
                              isActive ? "text-slate-900" : "text-slate-700"
                            }`}
                          >
                            {status.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {status.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* Call Clinic — wired to real phone */}
          <a
            href={clinic.phone ? `tel:${clinic.phone}` : undefined}
            className={!clinic.phone ? "pointer-events-none opacity-50" : ""}
            aria-label={`Call ${clinic.name}`}
          >
            <Button
              variant="outline"
              className="w-full rounded-2xl bg-white border-slate-200 text-slate-700 font-semibold shadow-sm hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 flex flex-col gap-1 items-center justify-center py-4 h-auto transition-all"
            >
              <Phone className="w-5 h-5 text-teal-600" />
              <span className="text-xs font-semibold">Call Clinic</span>
            </Button>
          </a>

          {/* Directions — wired to Google Maps */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Get directions to ${clinic.name}`}
          >
            <Button
              variant="outline"
              className="w-full rounded-2xl bg-white border-slate-200 text-slate-700 font-semibold shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 flex flex-col gap-1 items-center justify-center py-4 h-auto transition-all"
            >
              <Navigation className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-semibold">Directions</span>
            </Button>
          </a>
        </motion.div>

        {/* Cancel appointment button — only if cancellable */}
        {canCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full text-center text-sm text-slate-400 hover:text-red-500 transition-colors py-2 font-medium"
            >
              Cancel this appointment
            </button>
          </motion.div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50"
              onClick={() => setShowCancelModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm z-50"
            >
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-red-400 to-orange-400" />
                <div className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 text-center mb-2">
                    Cancel Appointment?
                  </h2>
                  <p className="text-sm text-slate-500 text-center mb-6">
                    This will cancel your appointment with{" "}
                    <strong>Dr. {clinic.doctorName}</strong>. This action
                    cannot be undone.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 rounded-xl border-slate-200 font-medium"
                      onClick={() => setShowCancelModal(false)}
                      disabled={isPending}
                    >
                      Keep It
                    </Button>
                    <Button
                      className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-sm"
                      onClick={handleCancel}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Yes, Cancel"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
