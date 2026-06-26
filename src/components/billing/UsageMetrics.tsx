"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, CalendarDays, HardDrive, Info } from "lucide-react";

export function UsageMetrics() {
  // Mock usage data
  const metrics = [
    {
      id: "appointments",
      name: "Appointments",
      icon: <CalendarDays className="w-4 h-4" />,
      used: 350,
      limit: 500,
      unit: "booked",
      color: "bg-blue-500",
    },
    {
      id: "patients",
      name: "Patients",
      icon: <Users className="w-4 h-4" />,
      used: 180,
      limit: 250,
      unit: "registered",
      color: "bg-emerald-500",
    },
    {
      id: "storage",
      name: "Storage",
      icon: <HardDrive className="w-4 h-4" />,
      used: 3.2,
      limit: 5,
      unit: "GB",
      color: "bg-amber-500",
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
      <CardContent className="space-y-6">
        {metrics.map((metric) => {
          const percentage = Math.min((metric.used / metric.limit) * 100, 100);
          const isNearLimit = percentage >= 85;
          const progressColor = isNearLimit ? "bg-red-500" : metric.color;

          return (
            <div key={metric.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 font-medium text-gray-700">
                  {metric.icon}
                  {metric.name}
                </div>
                <div className="text-gray-500">
                  <span className={isNearLimit ? "text-red-600 font-bold" : "text-gray-900 font-semibold"}>
                    {metric.used}
                  </span>{" "}
                  / {metric.limit} {metric.unit}
                </div>
              </div>
              <Progress value={percentage} indicatorColor={progressColor} className="h-2 bg-slate-100" />
              {isNearLimit && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <Info className="w-3 h-3" />
                  Approaching plan limit. Consider upgrading.
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
