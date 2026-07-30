"use client";

import { useState, useTransition } from "react";
import { format, parseISO } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { formatTimeDisplay } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Phone, Clock, AlertCircle, Plus, MoreVertical, Check, X, UserMinus, MessageCircle, Sun, Sunrise, Sunset } from "lucide-react";
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
    case "follow_up_booked":
      return <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50 border border-sky-200 shadow-sm text-[10px] px-2 py-0.5 rounded-full font-semibold">Appt. Booked</Badge>;
    default:
      return <Badge variant="secondary" className="rounded-full shadow-sm text-[10px] px-2 py-0.5 capitalize">{status.replace('_', ' ')}</Badge>;
  }
}

export function CalendarClient({ events }: CalendarClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  
  const dayEvents = events.filter((e) => e.date === selectedDateStr);
  const eventDates = events.map((e) => parseISO(e.date));

  // Time Chunking
  const pendingFollowUps = dayEvents.filter(e => e.type === "follow_up" && e.status === "pending_follow_up");
  const scheduledEvents = dayEvents.filter(e => e.type === "appointment" || e.status === "follow_up_booked").sort((a, b) => a.time.localeCompare(b.time));
  
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
        toast.success(`Appointment marked as ${newStatus.replace('_', ' ')}`);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  const handleWhatsAppReminder = (phone: string, name: string) => {
    const text = encodeURIComponent(`Hi ${name}, this is a gentle reminder that you are due for your follow-up visit. Please reply to this message to confirm your time.`);
    window.open(`https://wa.me/91${phone}?text=${text}`, '_blank');
  };

  const EventCard = ({ evt }: { evt: CalendarEvent }) => (
    <div className="relative pl-6 sm:pl-8 group/card">
      <div className={`absolute -left-[9px] sm:-left-[11px] top-6 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-[4px] shadow-sm ${evt.type === 'follow_up' ? 'bg-white border-amber-400' : 'bg-white border-sky-500'}`} />
      
      <Card className={`border-slate-200/60 shadow-sm transition-all duration-300 rounded-2xl group ${evt.type === 'follow_up' ? 'hover:border-amber-300 hover:shadow-md' : 'hover:border-sky-300 hover:shadow-md'}`}>
        <CardContent className="p-0">
          <div className="p-3 sm:p-4 flex items-center justify-between gap-3 bg-white/50 backdrop-blur-sm rounded-2xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[1.1rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center flex-shrink-0 shadow-inner border border-slate-200/80 transition-colors ${evt.type === 'follow_up' ? 'group-hover:from-amber-50 group-hover:to-amber-100/50' : 'group-hover:from-sky-50 group-hover:to-blue-50'}`}>
                <span className={`font-bold text-sm sm:text-base ${evt.type === 'follow_up' ? 'text-amber-700' : 'text-slate-700 group-hover:text-sky-700'}`}>
                  {evt.patientName[0]?.toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-bold text-slate-900 text-sm sm:text-base truncate">
                    {evt.patientName}
                  </p>
                  {getStatusBadge(evt.status)}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {evt.type === 'follow_up' ? (
                      evt.followUpAppointmentId ? (
                        <>
                          <Clock className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-600">{formatTimeDisplay(evt.time)}</span>
                          <Badge className="bg-sky-50 text-sky-700 hover:bg-sky-50 border border-sky-200 shadow-sm text-[10px] px-1.5 py-0 rounded-md font-semibold ml-1">Booked ✓</Badge>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                          <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border border-amber-200 shadow-sm text-[10px] px-1.5 py-0 rounded-md font-semibold">Pending</Badge>
                        </>
                      )
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-bold tracking-tight text-slate-600">{formatTimeDisplay(evt.time)}</span>
                      </>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-slate-500 font-medium">{evt.patientPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 relative">
              {evt.type === 'follow_up' && !evt.followUpAppointmentId ? (
                <Button 
                  onClick={() => handleWhatsAppReminder(evt.patientPhone, evt.patientName)}
                  size="sm" 
                  className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold h-8 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Send Reminder</span>
                </Button>
              ) : (
                evt.type === 'appointment' && !['cancelled', 'completed', 'no_show'].includes(evt.status) ? (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === evt.id ? null : evt.id); }}
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {openMenuId === evt.id && (
                      <div className="absolute right-0 top-10 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-10 animate-in fade-in zoom-in-95 duration-100">
                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(evt.id, 'confirmed'); }} className="w-full text-left px-4 py-2 text-sm text-sky-700 hover:bg-sky-50 flex items-center gap-2">
                          <Check className="w-4 h-4" /> Confirm
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(evt.id, 'no_show'); }} className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                          <UserMinus className="w-4 h-4" /> Mark No Show
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(evt.id, 'cancelled'); }} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2">
                          <X className="w-4 h-4" /> Cancel Appt
                        </button>
                      </div>
                    )}
                  </>
                ) : null
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 sm:gap-8 items-start">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full lg:col-span-5 xl:col-span-4">
          <Card className="border-slate-100 shadow-sm overflow-hidden">
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

        <div className="w-full lg:col-span-7 xl:col-span-8">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-sky-500" /> Schedule
                </h2>
                <button onClick={() => setSelectedDate(new Date())} className="text-xs font-semibold px-2 py-1 bg-sky-50 text-sky-700 rounded-md hover:bg-sky-100 transition-colors">
                  Today
                </button>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
            </div>
            
            <div className="flex flex-row items-center gap-3">
              <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 px-2.5 py-1.5 shadow-sm text-sm">
                {dayEvents.length} {dayEvents.length === 1 ? "Event" : "Events"}
              </Badge>
              <Button onClick={() => setIsModalOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md h-9 px-4 font-bold flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Booking
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={selectedDateStr} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="space-y-8" onClick={() => setOpenMenuId(null)}>
              
              {dayEvents.length === 0 ? (
                <Card className="border-slate-100 shadow-sm border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-14 sm:py-20">
                    <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <CalendarIcon className="w-7 h-7 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium text-lg">Your schedule is clear</p>
                    <p className="text-slate-400 text-sm mt-1 text-center px-4">No appointments or follow-ups booked for this date.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-4 sm:ml-5 space-y-8 pb-safe mt-6">
                  
                  {/* Pending Follow Ups Section */}
                  {pendingFollowUps.length > 0 && (
                    <div className="space-y-4">
                      <div className="relative pl-6">
                        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 border border-slate-200 rounded-full" />
                        <h3 className="font-bold text-amber-700 text-sm tracking-widest uppercase flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Pending Follow-ups ({pendingFollowUps.length})
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {pendingFollowUps.map(evt => <EventCard key={evt.id} evt={evt} />)}
                      </div>
                    </div>
                  )}

                  {/* Morning Section */}
                  {morningEvents.length > 0 && (
                    <div className="space-y-4">
                      <div className="relative pl-6">
                        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 border border-slate-200 rounded-full" />
                        <h3 className="font-bold text-sky-700 text-sm tracking-widest uppercase flex items-center gap-2">
                          <Sunrise className="w-4 h-4" /> Morning
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {morningEvents.map(evt => <EventCard key={evt.id} evt={evt} />)}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Section */}
                  {afternoonEvents.length > 0 && (
                    <div className="space-y-4">
                      <div className="relative pl-6">
                        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 border border-slate-200 rounded-full" />
                        <h3 className="font-bold text-orange-600 text-sm tracking-widest uppercase flex items-center gap-2">
                          <Sun className="w-4 h-4" /> Afternoon
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {afternoonEvents.map(evt => <EventCard key={evt.id} evt={evt} />)}
                      </div>
                    </div>
                  )}

                  {/* Evening Section */}
                  {eveningEvents.length > 0 && (
                    <div className="space-y-4">
                      <div className="relative pl-6">
                        <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 bg-slate-50 border border-slate-200 rounded-full" />
                        <h3 className="font-bold text-indigo-700 text-sm tracking-widest uppercase flex items-center gap-2">
                          <Sunset className="w-4 h-4" /> Evening
                        </h3>
                      </div>
                      <div className="space-y-4">
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
    </>
  );
}
