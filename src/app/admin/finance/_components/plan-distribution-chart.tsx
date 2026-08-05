"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";

interface PlanDistributionChartProps {
  quarterlyCount: number;
  yearlyCount: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
}

const COLORS = ["#0d7559", "#4f46e5"];

export function PlanDistributionChart({
  quarterlyCount,
  yearlyCount,
  quarterlyRevenue,
  yearlyRevenue,
}: PlanDistributionChartProps) {
  const data = [
    { name: "Quarterly Plan", value: quarterlyRevenue, count: quarterlyCount },
    { name: "Annual Plan", value: yearlyRevenue, count: yearlyCount },
  ];

  const totalRev = quarterlyRevenue + yearlyRevenue;

  return (
    <Card className="shadow-sm border-slate-200/80">
      <CardHeader className="pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900">
              Subscription Mix
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Revenue breakdown by billing tier
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {totalRev === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
            No active plan data recorded yet.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2 h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, "Monthly Value"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 space-y-3">
              <div className="p-2.5 rounded-lg border border-teal-100 bg-teal-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-600" />
                  <span className="text-xs font-semibold text-slate-800">Quarterly Tier</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-slate-900">{quarterlyCount} Clinics</p>
                  <p className="text-[10px] text-teal-700 font-medium">₹{quarterlyRevenue.toLocaleString("en-IN")}/mo</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-600" />
                  <span className="text-xs font-semibold text-slate-800">Annual Tier</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-extrabold text-slate-900">{yearlyCount} Clinics</p>
                  <p className="text-[10px] text-indigo-700 font-medium">₹{yearlyRevenue.toLocaleString("en-IN")}/mo</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
