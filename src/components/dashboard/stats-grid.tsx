"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PremiumIcon } from "@/components/ui/premium-icon";
import { Calendar, Clock, TrendingUp, AlertCircle, Check } from "lucide-react";
import { FadeInUp } from "@/components/dashboard/dashboard-animations";

interface StatsGridProps {
  todayRevenue: number;
  todayAppointmentsCount: number;
  completedTodayCount: number;
  dueTodayCount: number;
  overdueCount: number;
}

export function StatsGrid({
  todayRevenue,
  todayAppointmentsCount,
  completedTodayCount,
  dueTodayCount,
  overdueCount,
}: StatsGridProps) {
  return (
    <FadeInUp>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {[
          {
            label: "Today's Revenue",
            value: `₹${todayRevenue}`,
            icon: TrendingUp,
            variant: "purple",
          },
          {
            label: "Today's Appointments",
            value: todayAppointmentsCount,
            icon: Calendar,
            variant: "default",
          },
          {
            label: "Completed Today",
            value: completedTodayCount,
            icon: Check,
            variant: "success",
          },
          {
            label: "Follow-ups Due",
            value: dueTodayCount,
            icon: Clock,
            variant: dueTodayCount > 0 ? "warning" : "glass",
          },
          {
            label: "Overdue Follow-ups",
            value: overdueCount,
            icon: AlertCircle,
            variant: overdueCount > 0 ? "destructive" : "success",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className={`border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white group ${
              stat.label.includes("Overdue") ? "col-span-2 md:col-span-2 lg:col-span-1" : ""
            } ${
              stat.label.includes("Overdue") && overdueCount > 0
                ? "ring-2 ring-red-500/20"
                : ""
            }`}
          >
            <CardContent className="p-4 sm:p-5 relative overflow-hidden h-full flex flex-col justify-between">
              {stat.label.includes("Revenue") && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-[30px] group-hover:bg-purple-500/10 transition-colors pointer-events-none" />
              )}
              {stat.label.includes("Overdue") && overdueCount === 0 && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[30px] group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />
              )}
              <div className="mb-3 sm:mb-4 relative z-10">
                <PremiumIcon Icon={stat.icon} variant={stat.variant as any} size="md" />
              </div>
              <div className="relative z-10">
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight truncate">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </FadeInUp>
  );
}
