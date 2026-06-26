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
  MapPin,
  XCircle,
  X,
  AlertTriangle,
  Loader2,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  Navigation2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Appointment, Clinic } from "@/db/schema";
import Link from "next/link";

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

/** Strip leading "Dr." prefix so we don't double-render "Dr. Dr. Singh" */
function stripDrPrefix(name: string): string {
  return name.replace(/^dr\.?\s*/i, "").trim();
}

/** Format "HH:mm" → "4:00 PM" */
function formatTimeDisplay(time: string): string {
  const t = time.slice(0, 5);
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/** Build a proper Google Maps search URL for accurate per-clinic directions */
function buildDirectionsUrl(clinic: Clinic): string {
  const parts = [clinic.name, clinic.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
}

const STATUSES = [
  {
    id: "confirmed",
    title: "Booking Confirmed",
    desc: "Your slot has been successfully reserved.",
    icon: CalendarCheck,
  },
  {
    id: "checked_in",
    title: "Checked In",
    desc: "You are checked in and waiting.",
    icon: Check,
  },
  {
    id: "in_consultation",
    title: "In Consultation",
    desc: null, // filled dynamically
    icon: Sparkles,
  },
  {
    id: "completed",
    title: "Visit Complete",
    desc: "Thank you for visiting! Take care. 💙",
    icon: CheckCircle2,
  },
] as const;

function getStatusIndex(status: string): number {
  if (status === "completed") return 3;
  if (status === "in_consultation") return 2;
  if (status === "checked_in") return 1;
  return 0; // confirmed + anything else
}

export function TrackingClient({
  appointment: initialAppointment,
  clinic,
}: TrackingClientProps) {
  const [appointment, setAppointment] = useState(initialAppointment);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showBanner, setShowBanner] = useState(true);

  const themeColor = clinic.themeColor ?? "#0ea5e9";
  const doctorFirstName = stripDrPrefix(clinic.doctorName);
  const directionsUrl = buildDirectionsUrl(clinic);

  // Real-time updates via Supabase Realtime
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

  // Auto-hide confirmation banner after 4s
  useEffect(() => {
    if (appointment.status === "confirmed" && showBanner) {
      const timer = setTimeout(() => setShowBanner(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [appointment.status, showBanner]);

  const currentIndex = getStatusIndex(appointment.status);
  const isCancelled =
    appointment.status === "cancelled" || appointment.status === "no_show";
  const isCompleted = appointment.status === "completed";
  const canCancel =
    !isCancelled &&
    !isCompleted &&
    appointment.status !== "in_consultation";

  const handleCancel = () => {
    startTransition(async () => {
      const ok = await cancelAppointment(appointment.id);
      if (ok) {
        setAppointment((prev) => ({ ...prev, status: "cancelled" }));
        setShowCancelModal(false);
      }
    });
  };

  return (
    <>
      <div className="space-y-5">
        {/* ──── Hero Header ──── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center pt-2"
        >
          {/* Clinic Avatar */}
          <div className="relative inline-flex mb-4">
            <div
              className="w-[72px] h-[72px] rounded-2xl shadow-lg flex items-center justify-center text-white text-3xl font-bold"
              style={{ backgroundColor: themeColor }}
            >
              {clinic.name[0]?.toUpperCase()}
            </div>
            {/* Live pulse badge */}
            {!isCancelled && !isCompleted && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{ backgroundColor: themeColor }}
                />
                <span
                  className="relative inline-flex rounded-full h-4 w-4 border-2 border-white"
                  style={{ backgroundColor: themeColor }}
                />
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {clinic.name}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {isCancelled
              ? "Appointment Cancelled"
              : isCompleted
              ? "Visit Completed ✓"
              : "Live Tracking"}
          </p>
        </motion.div>

        {/* ──── Confirmation Banner (shows briefly on fresh booking) ──── */}
        <AnimatePresence>
          {appointment.status === "confirmed" && showBanner && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="relative overflow-hidden rounded-2xl px-5 py-4 text-white shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${themeColor}ee, ${themeColor}cc)`,
              }}
            >
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
              <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/10" />
              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                  <CalendarCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-base leading-tight">
                    Booking Confirmed! 🎉
                  </p>
                  <p className="text-white/80 text-xs mt-0.5">
                    See you on{" "}
                    {format(
                      new Date(appointment.appointmentDate as string),
                      "MMM d"
                    )}{" "}
                    at{" "}
                    {formatTimeDisplay(appointment.appointmentTime as string)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ──── Appointment Time Card ──── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-100 shadow-lg shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
            {/* Thin accent line at top */}
            <div className="h-1" style={{ backgroundColor: themeColor }} />
            <CardContent className="p-5">
              {/* Appointment datetime row */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-5 mb-5">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${themeColor}18` }}
                >
                  <Clock
                    className="w-5 h-5"
                    style={{ color: themeColor }}
                  />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Appointment Time
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl font-bold text-slate-900">
                      {format(
                        new Date(appointment.appointmentDate as string),
                        "EEE, MMM d"
                      )}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span
                      className="text-xl font-bold"
                      style={{ color: themeColor }}
                    >
                      {formatTimeDisplay(appointment.appointmentTime as string)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ──── Timeline ──── */}
              <div className="space-y-0">
                {isCancelled ? (
                  /* Cancelled / No-show state */
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-500" />
                      </div>
                    </div>
                    <div className="pt-1.5">
                      <h3 className="text-sm font-bold text-red-600">
                        Appointment{" "}
                        {appointment.status === "no_show"
                          ? "Marked No-Show"
                          : "Cancelled"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        This appointment is no longer active.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  STATUSES.map((status, idx) => {
                    const isStepDone = idx < currentIndex;
                    const isActive = idx === currentIndex;
                    const isPendingStep = idx > currentIndex;
                    const isLast = idx === STATUSES.length - 1;

                    // Dynamic description for "In Consultation"
                    const desc =
                      status.id === "in_consultation"
                        ? `Dr. ${doctorFirstName} is seeing you now.`
                        : status.desc;

                    return (
                      <div key={status.id} className="flex items-start gap-4">
                        {/* Left column: dot + connector */}
                        <div className="flex flex-col items-center flex-shrink-0 w-9">
                          {/* Dot */}
                          <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.15 + idx * 0.08 }}
                            className="relative z-10"
                          >
                            {isStepDone ? (
                              /* Completed step */
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: themeColor }}
                              >
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            ) : isActive ? (
                              /* Active step — pulsing */
                              <div className="relative w-9 h-9 flex items-center justify-center">
                                <motion.div
                                  animate={{
                                    scale: [1, 1.6, 1],
                                    opacity: [0.5, 0, 0.5],
                                  }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "easeInOut",
                                  }}
                                  className="absolute inset-0 rounded-full"
                                  style={{ backgroundColor: themeColor }}
                                />
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center relative z-10 shadow-md"
                                  style={{ backgroundColor: themeColor }}
                                >
                                  <div className="w-3 h-3 bg-white rounded-full" />
                                </div>
                              </div>
                            ) : (
                              /* Pending step */
                              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                              </div>
                            )}
                          </motion.div>

                          {/* Connector line (not on last item) */}
                          {!isLast && (
                            <div className="relative w-0.5 flex-1 min-h-[32px] my-1 overflow-hidden rounded-full bg-slate-100">
                              {isStepDone && (
                                <motion.div
                                  initial={{ scaleY: 0 }}
                                  animate={{ scaleY: 1 }}
                                  transition={{
                                    delay: 0.2 + idx * 0.1,
                                    duration: 0.4,
                                  }}
                                  className="absolute inset-0 origin-top rounded-full"
                                  style={{ backgroundColor: themeColor }}
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right column: text */}
                        <motion.div
                          initial={{ opacity: 0, x: -6 }}
                          animate={{
                            opacity: isPendingStep ? 0.45 : 1,
                            x: 0,
                          }}
                          transition={{ delay: 0.2 + idx * 0.08 }}
                          className={`pt-1.5 pb-${isLast ? "0" : "6"}`}
                        >
                          <h3
                            className={`text-sm font-bold leading-tight ${
                              isActive
                                ? "text-slate-900"
                                : isStepDone
                                ? "text-slate-700"
                                : "text-slate-500"
                            }`}
                          >
                            {status.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                            {desc}
                          </p>
                        </motion.div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ──── Action Buttons ──── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 gap-3"
        >
          {/* FIX #3: Use anchor tag directly styled as button — no invalid button-in-anchor */}
          {/* Call Clinic */}
          <a
            href={clinic.phone ? `tel:${clinic.phone}` : undefined}
            aria-label={`Call ${clinic.name}`}
            className={`
              flex flex-col items-center justify-center gap-2 
              bg-white border border-slate-200 rounded-2xl py-4 px-3
              font-semibold shadow-sm transition-all duration-200
              ${
                clinic.phone
                  ? "hover:bg-teal-50 hover:border-teal-300 hover:shadow-md active:scale-95 cursor-pointer"
                  : "opacity-40 pointer-events-none"
              }
            `}
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Phone className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">
              Call Clinic
            </span>
            {clinic.phone && (
              <span className="text-[10px] text-slate-400 -mt-1">
                {clinic.phone}
              </span>
            )}
          </a>

          {/* FIX #4: Smarter Google Maps URL with clinic name + address */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Get directions to ${clinic.name}`}
            className={`
              flex flex-col items-center justify-center gap-2 
              bg-white border border-slate-200 rounded-2xl py-4 px-3
              font-semibold shadow-sm transition-all duration-200
              hover:bg-blue-50 hover:border-blue-300 hover:shadow-md active:scale-95 cursor-pointer
            `}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Navigation2 className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-slate-700">
              Directions
            </span>
            {clinic.address ? (
              <span className="text-[10px] text-slate-400 -mt-1 text-center leading-tight line-clamp-2 px-1">
                {clinic.address}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 -mt-1">
                Open in Maps
              </span>
            )}
          </a>
        </motion.div>

        {/* ──── Book Again CTA (shown when completed or cancelled) ──── */}
        <AnimatePresence>
          {(isCompleted || isCancelled) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
            >
              <Link
                href={`/book/${clinic.slug}`}
                className="flex items-center justify-between gap-3 w-full rounded-2xl border border-dashed border-slate-300 bg-white/80 px-5 py-4 hover:bg-white hover:border-slate-400 hover:shadow-md transition-all duration-200 group active:scale-[0.98]"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-slate-900">
                    {isCompleted
                      ? "Book Your Next Visit"
                      : "Book a New Appointment"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    with Dr. {doctorFirstName} at {clinic.name}
                  </p>
                </div>
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:translate-x-0.5"
                  style={{ backgroundColor: `${themeColor}18` }}
                >
                  <ArrowRight className="w-4 h-4" style={{ color: themeColor }} />
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ──── Cancel Link ──── */}
        {canCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-sm text-slate-400 hover:text-red-500 transition-colors py-2 font-medium underline-offset-2 hover:underline"
            >
              Cancel this appointment
            </button>
          </motion.div>
        )}
      </div>

      {/* ──── Cancel Confirmation Modal ──── */}
      <AnimatePresence>
        {showCancelModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
              onClick={() => setShowCancelModal(false)}
            />

            {/* Sheet */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:bottom-4 sm:w-full sm:max-w-sm"
            >
              <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-10 h-1 bg-slate-200 rounded-full" />
                </div>

                <div className="px-6 pb-8 pt-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 text-center mb-1.5">
                    Cancel Appointment?
                  </h2>
                  <p className="text-sm text-slate-500 text-center mb-6 leading-relaxed">
                    This will cancel your appointment with{" "}
                    <strong className="text-slate-700">
                      Dr. {doctorFirstName}
                    </strong>
                    . This action cannot be undone.
                  </p>

                  <div className="flex gap-3">
                    <button
                      className="flex-1 h-12 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                      onClick={() => setShowCancelModal(false)}
                      disabled={isPending}
                    >
                      Keep It
                    </button>
                    <button
                      className="flex-1 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                      onClick={handleCancel}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Yes, Cancel"
                      )}
                    </button>
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
