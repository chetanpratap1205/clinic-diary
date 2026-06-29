"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, CalendarDays, Info, IndianRupee, Infinity as InfinityIcon } from "lucide-react";

interface UsageMetricsProps {
  planId: string;
  appointmentCount: number;
  totalPaid: number;
}

export function UsageMetrics({ planId, appointmentCount, totalPaid }: UsageMetricsProps) {
  const getAppointmentLimit = () => {
    switch (planId) {
      case "monthly": return Infinity;
      case "quarterly": return Infinity;
      case "yearly": return Infinity;
      default: return Infinity; // Free / no plan
    }
  };

  const aptLimit = getAppointmentLimit();
  
  const metrics = [
    {
      id: "appointments",
      name: "Appointments",
      icon: <CalendarDays className="w-4 h-4" />,
      used: appointmentCount,
      limit: aptLimit,
      unit: "booked",
      color: "bg-blue-500",
      isUnlimited: aptLimit === Infinity,
    },
    {
      id: "patients",
      name: "Patients",
      icon: <Users className="w-4 h-4" />,
      used: "Unlimited",
      limit: Infinity,
      unit: "allowed",
      color: "bg-emerald-500",
      isUnlimited: true,
    },
    {
      id: "paid",
      name: "Lifetime Value",
      icon: <IndianRupee className="w-4 h-4" />,
      used: `₹${totalPaid.toLocaleString('en-IN')}`,
      limit: Infinity,
      unit: "paid",
      color: "bg-amber-500",
      isUnlimited: true,
    }
  ];

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-gray-900">Usage Metrics</CardTitle>
            <CardDescription className="mt-1">Your current billing cycle usage</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {metrics.map((metric) => {
          let percentage = 100;
          let isNearLimit = false;

          if (!metric.isUnlimited && typeof metric.used === 'number') {
             percentage = Math.min((metric.used / metric.limit) * 100, 100);
             isNearLimit = percentage >= 85;
          }
          
          const progressColor = isNearLimit ? "bg-red-500" : metric.color;

          return (
            <div key={metric.id} className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <div className={`p-1.5 rounded-md text-white shadow-sm ${metric.color}`}>
                    {metric.icon}
                  </div>
                  {metric.name}
                </div>
                <div className="text-slate-500 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1.5">
                  <span className={isNearLimit ? "text-red-600 font-bold text-sm" : "text-slate-900 font-bold text-sm"}>
                    {metric.used}
                  </span>
                  {metric.isUnlimited ? (
                    <span className="flex items-center text-emerald-600 font-bold bg-emerald-100/50 px-1.5 py-0.5 rounded text-xs gap-0.5">
                      <InfinityIcon className="w-3.5 h-3.5" />
                      {metric.unit}
                    </span>
                  ) : (
                    `/ ${metric.limit} ${metric.unit}`
                  )}
                </div>
              </div>
              
              {!metric.isUnlimited && (
                <>
                  <Progress value={percentage} indicatorColor={progressColor} className="h-2.5 bg-slate-100 rounded-full" />
                  {isNearLimit && (
                    <p className="text-xs font-medium text-red-500 flex items-center gap-1.5 mt-1 bg-red-50 px-2 py-1 rounded-md w-fit">
                      <Info className="w-3.5 h-3.5" />
                      Approaching plan limit. Consider upgrading.
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
