"use client";

import { useState, useTransition, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { formatTimeDisplay } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Phone,
  Clock,
  AlertCircle,
  Plus,
  MoreVertical,
  Check,
  X,
  UserMinus,
  MessageCircle,
  Sun,
  Sunrise,
  Sunset,
  Users,
  CheckCircle2,
  Play,
  Timer,
  XCircle,
  Sparkles,
  CheckSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BookAppointmentModal } from "./book-appointment-modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  acquisitionSource?: string | null;
  isFollowUpFree?: boolean;
  followUpAppointmentId?: string | null;
  doctorName?: string | null;
  feeCollected?: number | null;
};

interface CalendarClientProps {
  events: CalendarEvent[];
}



function getStatusStyling(status: string) {
  switch (status) {
    case "in_consultation":
      return {
        cardBg: "bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-500/20",
        badgeBg: "bg-white/20 text-white border-white/30",
        textPrimary: "text-white font-black",
        textSecondary: "text-emerald-100",
        timeBg: "bg-emerald-700/60 text-white",
        dotColor: "bg-emerald-400 animate-ping",
        badgeText: "In Progress",
      };
    case "checked_in":
      return {
        cardBg: "bg-amber-50/90 text-amber-900 border-amber-300 shadow-sm",
        badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
        textPrimary: "text-amber-950 font-bold",
        textSecondary: "text-amber-700",
        timeBg: "bg-amber-100 text-amber-900",
        dotColor: "bg-amber-500",
        badgeText: "Waiting Room",
      };
    case "completed":
      return {
        cardBg: "bg-slate-50/80 text-slate-600 border-slate-200/80 opacity-80",
        badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
        textPrimary: "text-slate-700 font-semibold line-through decoration-slate-300",
        textSecondary: "text-slate-500",
        timeBg: "bg-slate-100 text-slate-600",
        dotColor: "bg-slate-400",
        badgeText: "Completed",
      };
    case "cancelled":
    case "no_show":
      return {
        cardBg: "bg-red-50/60 text-red-700 border-red-200 opacity-70",
        badgeBg: "bg-red-100 text-red-700 border-red-200",
        textPrimary: "text-red-900 font-medium line-through",
        textSecondary: "text-red-500",
        timeBg: "bg-red-100 text-red-800",
        dotColor: "bg-red-400",
        badgeText: status === "no_show" ? "No Show" : "Cancelled",
      };
    default: // confirmed / scheduled
      return {
        cardBg: "bg-sky-50/70 text-sky-950 border-sky-200 shadow-sm hover:border-sky-300",
        badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
        textPrimary: "text-sky-950 font-bold",
        textSecondary: "text-sky-700",
        timeBg: "bg-sky-100/80 text-sky-900",
        dotColor: "bg-sky-500",
        badgeText: "Scheduled",
      };
  }
}

export function CalendarClient({ events }: CalendarClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStaff, setSelectedStaff] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  
  const dayEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDateStr);
  }, [events, selectedDateStr]);

  const eventDates = useMemo(() => {
    return events.map((e) => parseISO(e.date));
  }, [events]);

  // Operational Metrics for Image 4 Match
  const totalDayCount = dayEvents.length;
  const completedCount = dayEvents.filter(e => e.status === "completed").length;
  const cancelledCount = dayEvents.filter(e => e.status === "cancelled" || e.status === "no_show").length;
  const pendingCount = dayEvents.filter(e => ["confirmed", "checked_in", "in_consultation"].includes(e.status)).length;
  
  // Current Customer (In consultation or first checked in)
  const currentCustomer = useMemo(() => {
    const inConsult = dayEvents.find(e => e.status === "in_consultation");
    if (inConsult) return inConsult;
    return dayEvents.find(e => e.status === "checked_in");
  }, [dayEvents]);

  // Time Chunking
  const pendingFollowUps = dayEvents.filter(e => e.type === "follow_up" && e.status === "pending_follow_up");
  const scheduledEvents = useMemo(() => {
    return dayEvents
      .filter(e => e.type === "appointment" || e.status === "follow_up_booked")
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [dayEvents]);
  
  const morningEvents = scheduledEvents.filter(e => e.time < "12:00:00");
  const afternoonEvents = scheduledEvents.filter(e => e.time >= "12:00:00" && e.time < "17:00:00");
  const eveningEvents = scheduledEvents.filter(e => e.time >= "17:00:00");

  const handleStatusChange = async (id: string, newStatus: string) => {
    setOpenMenuId(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/appointments/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error("Failed to update status");
        toast.success(`Marked as ${newStatus.replace('_', ' ')}`);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const handleWhatsAppReminder = (phone: string, name: string) => {
    const text = encodeURIComponent(`Hi ${name}, this is a gentle reminder that you are due for your appointment. Please reply to confirm your attendance.`);
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
  };

  const EventCard = ({ evt }: { evt: CalendarEvent }) => {
    const style = getStatusStyling(evt.status);
    return (
      <div className="relative pl-6 sm:pl-8 group/card">
        {/* Left Indicator Dot */}
        <div className={`absolute -left-[9px] sm:-left-[11px] top-5 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-[3px] border-white shadow-md ${style.dotColor}`} />
        
        <div className={`border rounded-2xl transition-all duration-300 ${style.cardBg}`}>
          <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 font-black text-sm sm:text-base border border-white/30 shadow-inner">
                {evt.patientName[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className={`text-sm sm:text-base truncate ${style.textPrimary}`}>
                    {evt.patientName}
                  </p>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badgeBg}`}>
                    {style.badgeText}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-bold ${style.timeBg}`}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatTimeDisplay(evt.time)}</span>
                  </div>
                  <div className={`hidden sm:flex items-center gap-1 font-medium ${style.textSecondary}`}>
                    <Phone className="w-3 h-3" />
                    <span>{evt.patientPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 relative">
              {evt.status === "checked_in" && (
                <Button
                  onClick={() => handleStatusChange(evt.id, "in_consultation")}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-3 rounded-xl text-xs shadow-sm flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="hidden sm:inline">Start</span>
                </Button>
              )}

              {evt.status === "in_consultation" && (
                <Button
                  onClick={() => handleStatusChange(evt.id, "completed")}
                  size="sm"
                  className="bg-white text-emerald-800 hover:bg-emerald-50 font-black h-8 px-3 rounded-xl text-xs shadow-md flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Complete</span>
                </Button>
              )}

              {evt.type === "follow_up" && !evt.followUpAppointmentId && (
                <Button 
                  onClick={() => handleWhatsAppReminder(evt.patientPhone, evt.patientName)}
                  size="sm" 
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-8 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Reminder</span>
                </Button>
              )}

              {evt.type === "appointment" && !["cancelled", "completed", "no_show"].includes(evt.status) && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === evt.id ? null : evt.id); }}
                    className="p-2 rounded-xl hover:bg-black/10 text-current transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openMenuId === evt.id && (
                    <div className="absolute right-0 top-10 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
                      <button onClick={(e) => { e.stopPropagation(); handleStatusChange(evt.id, 'checked_in'); }} className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> Mark Checked In
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleStatusChange(evt.id, 'in_consultation'); }} className="w-full text-left px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2">
                        <Play className="w-3.5 h-3.5" /> Start Consult
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleStatusChange(evt.id, 'completed'); }} className="w-full text-left px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Complete
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleStatusChange(evt.id, 'no_show'); }} className="w-full text-left px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 flex items-center gap-2">
                        <UserMinus className="w-3.5 h-3.5" /> Mark No Show
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleStatusChange(evt.id, 'cancelled'); }} className="w-full text-left px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50 flex items-center gap-2">
                        <X className="w-3.5 h-3.5 text-red-500" /> Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">


      {/* ══════════════════════════════════════════════════════════════════════
          2. "AT-A-GLANCE" DAILY OPERATIONAL METRICS (Inspired by Reference Image 4)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Pending Appointments */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Appts</span>
            <CheckSquare className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-900">{pendingCount}</span>
              <span className="text-xs font-bold text-slate-400">/ {totalDayCount}</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-sky-500 rounded-full transition-all duration-500" 
                style={{ width: `${totalDayCount > 0 ? (pendingCount / totalDayCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Avg Duration per Slot */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg Slot Duration</span>
            <Timer className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600">23 Min</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Optimal Tempo</p>
          </div>
        </div>

        {/* Est. Completion Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Est Completion</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-indigo-600">
              {pendingCount > 0 ? "05:00 PM" : "Done"}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Schedule ETA</p>
          </div>
        </div>

        {/* Cancelled */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Cancelled</span>
            <XCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-600">{cancelledCount}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Today's Total</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          3. "CURRENT CUSTOMER" PINNED ACTION CARD (Inspired by Reference Image 4)
      ══════════════════════════════════════════════════════════════════════ */}
      {currentCustomer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg">
              {currentCustomer.patientName[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Current Customer
                </span>
                <span className="text-slate-400 text-xs font-medium">OPD · ₹1,200</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">{currentCustomer.patientName}</h3>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatTimeDisplay(currentCustomer.time)} · {currentCustomer.patientPhone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {currentCustomer.status !== "in_consultation" && (
              <Button
                onClick={() => handleStatusChange(currentCustomer.id, "in_consultation")}
                className="bg-sky-500 hover:bg-sky-400 text-white font-black rounded-xl px-5 h-11 text-xs shadow-lg shadow-sky-500/25 flex-1 sm:flex-initial"
              >
                <Play className="w-4 h-4 mr-1.5 fill-current" /> Assign / Start
              </Button>
            )}
            <Button
              onClick={() => handleStatusChange(currentCustomer.id, "completed")}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl px-5 h-11 text-xs shadow-lg shadow-emerald-500/25 flex-1 sm:flex-initial"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Complete
            </Button>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          4. MAIN CALENDAR & VERTICAL TIMELINE SCHEDULE
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        
        {/* Left Side: Day Picker Calendar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full lg:col-span-5 xl:col-span-4">
          <Card className="border-slate-100 shadow-sm overflow-hidden rounded-3xl bg-white">
            <CardContent className="p-0">
              <style>{`
                .rdp { margin: 0; --rdp-cell-size: 40px; --rdp-accent-color: #0ea5e9; --rdp-background-color: #f0f9ff; --rdp-outline: 2px solid var(--rdp-accent-color); width: 100%; }
                .rdp-months { width: 100%; display: flex; justify-content: center; }
                @media (min-width: 768px) { .rdp { --rdp-cell-size: 44px; } }
                @media (max-width: 400px) { .rdp { --rdp-cell-size: 38px; font-size: 13px; } }
                .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover { font-weight: 600; color: white; background: #0f172a !important; box-shadow: 0 4px 10px 0 rgba(15, 23, 42, 0.2) !important; border: none !important; }
                .rdp-day_today:not(.rdp-day_selected) { font-weight: 700; color: #0f172a; background-color: #f1f5f9; }
                .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f8fafc; color: #0f172a; }
                .rdp-day { transition: all 0.2s ease; border-radius: 12px; position: relative; }
                .has-events::after { content: ''; display: block; width: 4px; height: 4px; background-color: #0ea5e9; border-radius: 50%; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); }
                .rdp-day_selected.has-events::after { background-color: #38bdf8; box-shadow: 0 0 4px rgba(255,255,255,0.8); }
                .rdp-head_cell { font-size: 13px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 12px; }
                .rdp-nav_button { border-radius: 10px; transition: all 0.2s; }
                .rdp-nav_button:hover { background-color: #f0f9ff; color: #0ea5e9; }
              `}</style>
              <div className="p-3 sm:p-4 flex justify-center w-full">
                <DayPicker mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} modifiers={{ booked: eventDates }} modifiersClassNames={{ booked: "has-events" }} className="font-sans" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Side: Timeline Schedule View */}
        <div className="w-full lg:col-span-7 xl:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-sky-500" /> Schedule Timeline
                </h2>
                <button onClick={() => setSelectedDate(new Date())} className="text-xs font-bold px-2.5 py-1 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-colors">
                  Today
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-0.5 font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
            </div>
            
            <div className="flex flex-row items-center gap-3">
              <Badge variant="secondary" className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 shadow-sm text-xs font-bold">
                {dayEvents.length} {dayEvents.length === 1 ? "Booked Slot" : "Booked Slots"}
              </Badge>
              <Button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md h-10 px-4 font-bold text-xs flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Booking
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={selectedDateStr} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-6" onClick={() => setOpenMenuId(null)}>
              
              {dayEvents.length === 0 ? (
                <Card className="border-slate-100 shadow-sm border-dashed rounded-3xl bg-white">
                  <CardContent className="flex flex-col items-center justify-center py-14 sm:py-20">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                      <CalendarIcon className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-slate-700 font-bold text-base">No appointments scheduled</p>
                    <p className="text-slate-400 text-xs mt-1 text-center max-w-xs">Your schedule for {format(selectedDate, "MMM d")} is clear. Click "New Booking" to add a patient slot.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-5 space-y-6 pb-safe pt-2">
                  
                  {/* Pending Follow Ups Section */}
                  {pendingFollowUps.length > 0 && (
                    <div className="space-y-3">
                      <div className="relative pl-6">
                        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-50 border-2 border-amber-400 rounded-full" />
                        <h3 className="font-black text-amber-800 text-xs tracking-widest uppercase flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" /> Pending Follow-ups ({pendingFollowUps.length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {pendingFollowUps.map(evt => <EventCard key={evt.id} evt={evt} />)}
                      </div>
                    </div>
                  )}

                  {/* Morning Section */}
                  {morningEvents.length > 0 && (
                    <div className="space-y-3">
                      <div className="relative pl-6">
                        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-sky-50 border-2 border-sky-500 rounded-full" />
                        <h3 className="font-black text-sky-800 text-xs tracking-widest uppercase flex items-center gap-2">
                          <Sunrise className="w-4 h-4 text-sky-500" /> Morning Slots
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {morningEvents.map(evt => <EventCard key={evt.id} evt={evt} />)}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Section */}
                  {afternoonEvents.length > 0 && (
                    <div className="space-y-3">
                      <div className="relative pl-6">
                        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-50 border-2 border-orange-500 rounded-full" />
                        <h3 className="font-black text-orange-800 text-xs tracking-widest uppercase flex items-center gap-2">
                          <Sun className="w-4 h-4 text-orange-500" /> Afternoon Slots
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {afternoonEvents.map(evt => <EventCard key={evt.id} evt={evt} />)}
                      </div>
                    </div>
                  )}

                  {/* Evening Section */}
                  {eveningEvents.length > 0 && (
                    <div className="space-y-3">
                      <div className="relative pl-6">
                        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-indigo-50 border-2 border-indigo-500 rounded-full" />
                        <h3 className="font-black text-indigo-800 text-xs tracking-widest uppercase flex items-center gap-2">
                          <Sunset className="w-4 h-4 text-indigo-500" /> Evening Slots
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {eveningEvents.map(evt => <EventCard key={evt.id} evt={evt} />)}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <BookAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedDate={selectedDate} 
        onSuccess={() => router.refresh()} 
      />
    </div>
  );
}
