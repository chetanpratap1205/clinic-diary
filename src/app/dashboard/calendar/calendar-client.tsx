"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Phone, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type CalendarEvent = {
  type: "appointment" | "follow_up";
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  status: string;
  notes: string | null;
};

interface CalendarClientProps {
  events: CalendarEvent[];
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
    case "pending_follow_up":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border border-amber-300 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Pending Follow-up</Badge>;
    default:
      return <Badge variant="secondary" className="rounded-full shadow-sm text-[10px] px-2 py-0.5 capitalize">{status.replace('_', ' ')}</Badge>;
  }
}

function formatTimeDisplay(time: string): string {
  if (time === "00:00:00") return "Follow-up";
  const t = time.slice(0, 5);
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function CalendarClient({ events }: CalendarClientProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  
  // Sort events so follow-ups appear at the top, then appointments by time
  const dayEvents = events
    .filter((e) => e.date === selectedDateStr)
    .sort((a, b) => {
      if (a.type === "follow_up" && b.type !== "follow_up") return -1;
      if (b.type === "follow_up" && a.type !== "follow_up") return 1;
      return a.time.localeCompare(b.time);
    });

  const eventDates = events.map((e) => parseISO(e.date));

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
              .has-events::after {
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
              .rdp-day_selected.has-events::after {
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
                  booked: eventDates,
                }}
                modifiersClassNames={{
                  booked: "has-events",
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
            {dayEvents.length} {dayEvents.length === 1 ? "Event" : "Events"}
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
            {dayEvents.length === 0 ? (
              <Card className="border-slate-100 shadow-sm border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-14 sm:py-20">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-medium text-base sm:text-lg">
                    Your schedule is clear
                  </p>
                  <p className="text-slate-400 text-sm mt-1 text-center px-4">
                    No appointments or follow-ups booked for this date.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-4 sm:ml-5 space-y-5 sm:space-y-6 pb-safe mt-6">
                {dayEvents.map((evt) => (
                  <div key={`${evt.type}-${evt.id}`} className="relative pl-6 sm:pl-8">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[9px] sm:-left-[11px] top-6 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-[4px] shadow-sm ${evt.type === 'follow_up' ? 'bg-white border-amber-400' : 'bg-white border-sky-500'}`} />
                    
                    <Card
                      className={`border-slate-200/60 shadow-sm transition-all duration-300 rounded-2xl group ${evt.type === 'follow_up' ? 'hover:border-amber-300 hover:shadow-md' : 'hover:border-sky-300 hover:shadow-md'}`}
                    >
                      <CardContent className="p-0">
                        <div className="p-3 sm:p-4 flex items-center justify-between gap-3 bg-white/50 backdrop-blur-sm rounded-2xl">
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Avatar */}
                            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[1.1rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center flex-shrink-0 shadow-inner border border-slate-200/80 transition-colors ${evt.type === 'follow_up' ? 'group-hover:from-amber-50 group-hover:to-amber-100/50' : 'group-hover:from-sky-50 group-hover:to-blue-50'}`}>
                              <span className={`font-bold text-sm sm:text-base ${evt.type === 'follow_up' ? 'text-amber-700' : 'text-slate-700 group-hover:text-sky-700'}`}>
                                {evt.patientName[0]?.toUpperCase()}
                              </span>
                            </div>

                            {/* Info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <p className="font-bold text-slate-900 text-sm sm:text-base truncate">
                                  {evt.patientName}
                                </p>
                                {getStatusBadge(evt.status)}
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                  {evt.type === 'follow_up' ? <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> : <Clock className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />}
                                  <span className={`text-xs sm:text-sm font-bold tracking-tight ${evt.type === 'follow_up' ? 'text-amber-700' : 'text-slate-600'}`}>
                                    {formatTimeDisplay(evt.time)}
                                  </span>
                                </div>
                                <div className="hidden sm:flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-slate-500 font-medium">
                                    {evt.patientPhone}
                                  </span>
                                </div>
                              </div>
                              {evt.type === 'follow_up' && evt.notes && (
                                <p className="text-xs text-slate-500 mt-1 truncate">
                                  {evt.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions (only for appointments) */}
                          <div className="flex-shrink-0">
                            {evt.type === 'appointment' ? (
                               <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300">
                                 {/* Read Only Indicator */}
                               </div>
                            ) : (
                               <div className="w-9 h-9" /> // Placeholder to keep alignment
                            )}
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
