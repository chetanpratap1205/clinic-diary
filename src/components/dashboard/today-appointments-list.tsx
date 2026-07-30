"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Clock, Phone } from "lucide-react";
import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { PremiumIcon } from "@/components/ui/premium-icon";
import { FadeIn, FadeInUp } from "@/components/dashboard/dashboard-animations";
import { AppointmentActions } from "@/components/dashboard/appointment-actions";
import { formatTimeDisplay } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

interface TodayAppointmentsListProps {
  appointments: any[];
  bookingUrl: string;
}

function getStatusBadge(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    confirmed: {
      label: "Confirmed",
      className: "bg-primary-50 text-primary-700 border border-primary-200/50 shadow-sm hover:bg-primary-100",
    },
    checked_in: {
      label: "Checked In",
      className: "bg-indigo-50 text-indigo-700 border border-indigo-200/50 shadow-sm hover:bg-indigo-100",
    },
    in_consultation: {
      label: "In Consult",
      className: "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/50 shadow-sm hover:bg-fuchsia-100",
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200/50 shadow-sm hover:bg-emerald-100",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-700 border border-red-200/50 shadow-sm hover:bg-red-100",
    },
    no_show: {
      label: "No Show",
      className: "bg-amber-50 text-amber-700 border border-amber-200/50 shadow-sm hover:bg-amber-100",
    },
  };

  const config = map[status];
  if (!config) return <Badge variant="secondary">{status}</Badge>;

  return (
    <Badge
      className={`${config.className} border-none text-[11px] px-2 py-0.5`}
    >
      {config.label}
    </Badge>
  );
}

export function TodayAppointmentsList({ appointments, bookingUrl }: TodayAppointmentsListProps) {
  return (
    <FadeInUp>
      <Card className="border-surface-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] bg-white h-full">
        <CardHeader className="bg-white border-b border-surface-100/50 py-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold tracking-tight text-surface-950">
              Today&apos;s Appointments
            </CardTitle>
            <span className="text-xs sm:text-sm font-medium text-surface-500 bg-surface-50 border border-surface-100 px-2 sm:px-2.5 py-1 rounded-md">
              {format(new Date(), "MMM d")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <FadeIn className="text-center py-16 sm:py-20 px-4">
              <div className="mb-5">
                <PremiumIcon Icon={Calendar} variant="glass" size="xl" className="mx-auto" />
              </div>
              <p className="text-surface-700 font-bold text-lg sm:text-xl mb-2">
                Your queue is clear
              </p>
              <p className="text-surface-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                Share your booking link directly with patients on WhatsApp to fill these slots.
              </p>
              <div className="flex justify-center">
                 <CopyLinkButton url={bookingUrl} className="bg-indigo-600 text-white hover:bg-indigo-700 border-none shadow-md shadow-indigo-600/20 px-6 py-2 rounded-xl font-medium" />
              </div>
            </FadeIn>
          ) : (
            <div className="divide-y divide-surface-100">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors group cursor-default border-l-2 border-transparent hover:border-indigo-500 last:rounded-b-2xl"
                >
                  {/* Left: Avatar + Info */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 shadow-inner text-slate-500 font-black text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      {appt.patientName[0]?.toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm truncate">
                          {appt.patientName}
                        </p>
                        {getStatusBadge(appt.status)}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5">
                          <Clock strokeWidth={2} className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                          <p className="text-[13px] text-slate-600 font-semibold group-hover:text-slate-900 transition-colors">
                            {formatTimeDisplay(appt.appointmentTime as string)}
                          </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5">
                          <Phone strokeWidth={2} className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                          <p className="text-[13px] text-slate-500 font-medium group-hover:text-slate-700 transition-colors">
                            {appt.patientPhone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex-shrink-0">
                    <AppointmentActions
                      appointmentId={appt.id}
                      patientId={appt.patientId}
                      currentStatus={appt.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </FadeInUp>
  );
}
