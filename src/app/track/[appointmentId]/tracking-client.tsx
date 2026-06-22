"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { CheckCircle2, Clock, Check, Phone, Navigation, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TrackingClientProps {
  appointment: any;
  clinic: any;
}

export function TrackingClient({ appointment, clinic }: TrackingClientProps) {
  const themeColor = clinic.themeColor ?? "#0ea5e9";
  
  // Swiggy-style timeline states
  const statuses = [
    { id: "confirmed", title: "Booking Confirmed", desc: "Your slot has been successfully reserved." },
    { id: "doctor_notified", title: "Doctor Notified", desc: `Dr. ${clinic.doctorName} has been informed.` },
    { id: "ready", title: "Ready for Consultation", desc: "Please arrive 5 mins early." },
    { id: "completed", title: "Completed", desc: "Thank you for visiting!" },
  ];

  let currentIndex = 0;
  if (appointment.status === "completed") currentIndex = 3;
  else if (appointment.status === "no_show") currentIndex = 3;
  else if (appointment.status === "cancelled") currentIndex = -1; // special case
  else {
    // In a real app, 'doctor_notified' or 'ready' would be driven by real-time updates.
    // For MVP, if it's 'confirmed', we assume it's at step 1 (Doctor Notified) or Step 0.
    // Let's just highlight Step 1 as "active" immediately for the wow factor.
    currentIndex = 1; 
  }

  function formatTimeDisplay(time: string): string {
    const t = time.slice(0, 5);
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  const isCancelled = appointment.status === "cancelled" || appointment.status === "no_show";

  return (
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{clinic.name}</h1>
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
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Appointment Time</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">{format(new Date(appointment.appointmentDate), "MMM d")}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                  <span className="text-lg font-bold text-slate-900">{formatTimeDisplay(appointment.appointmentTime)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-4 space-y-8">
              {/* Timeline line */}
              <div className="absolute top-4 bottom-4 left-6 w-0.5 bg-slate-100 rounded-full"></div>

              {isCancelled ? (
                <div className="relative flex items-start gap-4">
                  <div className="absolute -left-2 top-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center z-10">
                    <XCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-600">Appointment Cancelled</h3>
                    <p className="text-xs text-slate-500 mt-1">This appointment has been marked as cancelled or no-show.</p>
                  </div>
                </div>
              ) : (
                statuses.map((status, idx) => {
                  const isCompleted = idx < currentIndex;
                  const isActive = idx === currentIndex;
                  const isPending = idx > currentIndex;

                  return (
                    <motion.div 
                      key={status.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      className={`relative flex items-start gap-4 ${isPending ? "opacity-40" : ""}`}
                    >
                      {/* Node */}
                      <div className="absolute -left-2 top-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center z-10">
                        {isCompleted ? (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
                            <Check className="w-3 h-3" />
                          </div>
                        ) : isActive ? (
                          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColor }}>
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
                        <h3 className={`text-sm font-bold ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                          {status.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{status.desc}</p>
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
        <Button variant="outline" className="h-14 rounded-2xl bg-white border-slate-200 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 flex flex-col gap-1 items-center justify-center h-auto py-3">
          <Phone className="w-4 h-4 text-slate-400" />
          <span className="text-xs">Call Clinic</span>
        </Button>
        <Button variant="outline" className="h-14 rounded-2xl bg-white border-slate-200 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 flex flex-col gap-1 items-center justify-center h-auto py-3">
          <Navigation className="w-4 h-4 text-slate-400" />
          <span className="text-xs">Directions</span>
        </Button>
      </motion.div>
    </div>
  );
}
