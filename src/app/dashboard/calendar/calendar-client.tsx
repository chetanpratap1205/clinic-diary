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
      return <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50 border border-sky-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Confirmed</Badge>;
    case "completed":
      return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Completed</Badge>;
    case "cancelled":
      return <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Cancelled</Badge>;
    case "no_show":
      return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">No Show</Badge>;
    case "checked_in":
      return <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border border-indigo-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Checked In</Badge>;
    case "in_consultation":
      return <Badge className="bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-50 border border-fuchsia-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">In Consult</Badge>;
    default:
      return <Badge variant="secondary" className="rounded-full shadow-sm text-[10px] px-2 py-0.5 capitalize">{status.replace('_', ' ')}</Badge>;
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
                --rdp-cell-size: 40px;
                --rdp-accent-color: #0ea5e9;
                --rdp-background-color: #f0f9ff;
                --rdp-outline: 2px solid var(--rdp-accent-color);
                width: 100%;
              }
              .rdp-months { width: 100%; display: flex; justify-content: center; }
              @media (min-width: 768px) {
                .rdp { --rdp-cell-size: 44px; }
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
                background: #0f172a !important;
                box-shadow: 0 4px 10px 0 rgba(15, 23, 42, 0.2) !important;
                border: none !important;
              }
              .rdp-day_today:not(.rdp-day_selected) {
                font-weight: 700;
                color: #0f172a;
                background-color: #f1f5f9;
              }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                background-color: #f8fafc;
                color: #0f172a;
              }
              .rdp-day {
                transition: all 0.2s ease;
                border-radius: 12px;
                position: relative;
              }
              .has-appointments::after {
                content: '';
                display: block;
                width: 4px;
                height: 4px;
                background-color: #0ea5e9;
                border-radius: 50%;
                position: absolute;
                bottom: 4px;
                left: 50%;
                transform: translateX(-50%);
              }
              .rdp-day_selected.has-appointments::after {
                background-color: #38bdf8;
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
            <div className="p-3 sm:p-4 flex justify-center w-full">
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
              <div className="relative border-l-2 border-slate-100 ml-4 sm:ml-5 space-y-5 sm:space-y-6 pb-safe mt-6">
                {dayAppointments.map((appt) => (
                  <div key={appt.id} className="relative pl-6 sm:pl-8">
                    {/* Timeline Node */}
                    <div className="absolute -left-[9px] sm:-left-[11px] top-6 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white border-[4px] border-sky-500 shadow-sm" />
                    
                    <Card
                      className="border-slate-200/60 shadow-sm hover:shadow-md hover:border-sky-200/60 transition-all duration-300 rounded-2xl group"
                    >
                      <CardContent className="p-0">
                        <div className="p-3 sm:p-4 flex items-center justify-between gap-3 bg-white/50 backdrop-blur-sm rounded-2xl">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[1.1rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center flex-shrink-0 shadow-inner border border-slate-200/80 group-hover:from-sky-50 group-hover:to-blue-50 transition-colors">
                              <span className="text-slate-700 group-hover:text-sky-700 font-bold text-sm sm:text-base">
                                {appt.patientName[0]?.toUpperCase()}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <p className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                  {appt.patientName}
                                </p>
                                {getStatusBadge(appt.status)}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-slate-600 font-bold tracking-tight">
                                    {formatTimeDisplay(
                                      appt.appointmentTime as string
                                    )}
                                  </span>
                                </div>
                                <div className="hidden sm:flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-slate-500 font-medium">
                                    {appt.patientPhone}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
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
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
