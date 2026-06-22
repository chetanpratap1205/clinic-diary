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
    case "confirmed": return <Badge variant="default" className="bg-sky-100 text-sky-700 hover:bg-sky-100 border-none">Confirmed</Badge>;
    case "completed": return <Badge variant="success" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Completed</Badge>;
    case "cancelled": return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Cancelled</Badge>;
    case "no_show": return <Badge variant="warning" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">No Show</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
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

  // Filter appointments for the selected date
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const dayAppointments = appointments.filter(
    (appt) => appt.appointmentDate === selectedDateStr
  );

  // Identify all dates that have at least one appointment (for the calendar dots)
  const appointmentDates = appointments.map((appt) => parseISO(appt.appointmentDate as string));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Calendar Section */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="lg:col-span-5 xl:col-span-4"
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
              .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
                font-weight: 600;
              }
              .rdp-day_today {
                font-weight: 700;
                color: #0ea5e9;
              }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                background-color: #f8fafc;
              }
              .has-appointments::after {
                content: '';
                display: block;
                width: 4px;
                height: 4px;
                background-color: #0ea5e9;
                border-radius: 50%;
                margin: 0 auto;
                margin-top: 2px;
              }
              .rdp-day_selected.has-appointments::after {
                background-color: white;
              }
            `}</style>
            <div className="p-4 sm:p-6 flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  booked: appointmentDates,
                }}
                modifiersClassNames={{
                  booked: "has-appointments"
                }}
                className="font-sans"
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Schedule Section */}
      <div className="lg:col-span-7 xl:col-span-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Schedule</h2>
            <p className="text-slate-500 text-sm mt-1">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
          </div>
          <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 shadow-sm text-sm">
            {dayAppointments.length} {dayAppointments.length === 1 ? "Booking" : "Bookings"}
          </Badge>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDateStr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {dayAppointments.length === 0 ? (
                <Card className="border-slate-100 shadow-sm border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-20">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <CalendarIcon className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium text-lg">Your schedule is clear</p>
                    <p className="text-slate-400 text-sm mt-1">No appointments booked for this date.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {dayAppointments.map((appt) => (
                    <Card key={appt.id} className="border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-5">
                            {/* Time */}
                            <div className="w-20 flex-shrink-0 text-right hidden sm:block">
                              <p className="text-sm font-bold text-slate-900">{formatTimeDisplay(appt.appointmentTime as string)}</p>
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-sky-100">
                              <span className="text-sky-700 font-bold text-sm">
                                {appt.patientName[0]?.toUpperCase()}
                              </span>
                            </div>

                            {/* Info */}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900">{appt.patientName}</p>
                                <span className="sm:hidden text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                  {formatTimeDisplay(appt.appointmentTime as string)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-1.5">
                                <div className="flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <p className="text-xs text-slate-500 font-medium">{appt.patientPhone}</p>
                                </div>
                                <div className="hidden sm:block">
                                  {getStatusBadge(appt.status)}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 sm:border-0">
                            <div className="sm:hidden">
                              {getStatusBadge(appt.status)}
                            </div>
                            <AppointmentActions
                              appointmentId={appt.id}
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
    </div>
  );
}
