"use client";

import { useState } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppointmentActions } from "@/components/dashboard/appointment-actions";
import { Calendar as CalendarIcon, Phone, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Appointment } from "@/db/schema";

interface CalendarClientProps {
  appointments: Appointment[];
}

function getStatusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return (
        <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 border-none text-[10px] px-1.5 py-0.5">
          Confirmed
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px] px-1.5 py-0.5">
          Completed
        </Badge>
      );
    case "cancelled":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none text-[10px] px-1.5 py-0.5">
          Cancelled
        </Badge>
      );
    case "no_show":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none text-[10px] px-1.5 py-0.5">
          No Show
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatTimeDisplay(time: string): string {
  const t = time.slice(0, 5);
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function CalendarClient({ appointments }: CalendarClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const dayAppointments = appointments.filter(
    (appt) => appt.appointmentDate === selectedDateStr
  );

  const appointmentDates = appointments.map((appt) =>
    parseISO(appt.appointmentDate as string)
  );

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-8 items-start">
      {/* Calendar Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full lg:col-span-5 xl:col-span-4"
      >
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <style>{`
              .rdp {
                margin: 0;
                --rdp-cell-size: 46px;
                --rdp-accent-color: #0ea5e9;
                --rdp-background-color: #f0f9ff;
                --rdp-outline: 2px solid var(--rdp-accent-color);
              }
              @media (max-width: 400px) {
                .rdp {
                  --rdp-cell-size: 38px;
                  font-size: 13px;
                }
              }
              .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                font-weight: 600;
                color: white;
                background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%) !important;
                box-shadow: 0 4px 14px 0 rgba(2, 132, 199, 0.35) !important;
                border: none !important;
              }
              .rdp-day_today:not(.rdp-day_selected) {
                font-weight: 700;
                color: #0284c7;
                background-color: #e0f2fe;
              }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                background-color: #f8fafc;
                color: #0f172a;
              }
              .rdp-day {
                transition: all 0.2s ease;
                border-radius: 12px;
              }
              .has-appointments::after {
                content: '';
                display: block;
                width: 5px;
                height: 5px;
                background-color: #0ea5e9;
                border-radius: 50%;
                margin: 0 auto;
                margin-top: 3px;
                transition: transform 0.2s ease;
              }
              .rdp-day_selected.has-appointments::after {
                background-color: white;
                box-shadow: 0 0 4px rgba(255,255,255,0.8);
              }
              .rdp-head_cell {
                font-size: 13px;
                font-weight: 600;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                padding-bottom: 12px;
              }
              .rdp-nav_button {
                border-radius: 10px;
                transition: all 0.2s;
              }
              .rdp-nav_button:hover {
                background-color: #f0f9ff;
                color: #0ea5e9;
              }
            `}</style>
            <div className="p-3 sm:p-4 flex justify-center overflow-x-auto">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  booked: appointmentDates,
                }}
                modifiersClassNames={{
                  booked: "has-appointments",
                }}
                className="font-sans"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Schedule Section */}
      <div className="w-full lg:col-span-7 xl:col-span-8">
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-sky-500" />
                Schedule
              </h2>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-xs font-semibold px-2 py-1 bg-sky-50 text-sky-700 rounded-md hover:bg-sky-100 transition-colors"
              >
                Today
              </button>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-white border border-slate-200 text-slate-600 px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-sm text-xs sm:text-sm flex-shrink-0"
          >
            {dayAppointments.length}{" "}
            {dayAppointments.length === 1 ? "Booking" : "Bookings"}
          </Badge>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDateStr}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {dayAppointments.length === 0 ? (
              <Card className="border-slate-100 shadow-sm border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-14 sm:py-20">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-medium text-base sm:text-lg">
                    Your schedule is clear
                  </p>
                  <p className="text-slate-400 text-sm mt-1 text-center px-4">
                    No appointments booked for this date.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {dayAppointments.map((appt) => (
                  <Card
                    key={appt.id}
                    className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-100/60"
                  >
                    <CardContent className="p-0">
                      <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
                        {/* Avatar + Info */}
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Avatar */}
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-sky-100">
                            <span className="text-sky-700 font-bold text-xs sm:text-sm">
                              {appt.patientName[0]?.toUpperCase()}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-slate-900 text-sm">
                                {appt.patientName}
                              </p>
                              {getStatusBadge(appt.status)}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="text-xs text-slate-500 font-semibold">
                                  {formatTimeDisplay(
                                    appt.appointmentTime as string
                                  )}
                                </span>
                              </div>
                              <div className="hidden sm:flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="text-xs text-slate-500">
                                  {appt.patientPhone}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions — always visible */}
                        <div className="flex-shrink-0">
                          <AppointmentActions
                            appointmentId={appt.id}
                            patientId={appt.patientId}
                            currentStatus={appt.status}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
