"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format } from "date-fns";

export interface MonthlyData {
  month: string; // e.g., "2026-01-01"
  grossRevenue: number;
  commissions: number;
  netRevenue: number;
}

export function RevenueChart({ data }: { data: MonthlyData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] w-full text-sm text-slate-400 bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
        No revenue data available yet.
      </div>
    );
  }

  // Format the data for the chart
  const chartData = data.map((d) => ({
    ...d,
    displayMonth: format(new Date(d.month), "MMM yy"),
  }));

  const formatRupees = (val: number) => `₹${val.toLocaleString("en-IN")}`;

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="displayMonth"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#64748b" }}
            tickFormatter={(value) => `₹${value >= 1000 ? value / 1000 + "k" : value}`}
            dx={-10}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-4">
                    <p className="text-sm font-bold text-slate-900 mb-3">{label}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                          <span className="text-xs text-slate-500 font-medium">Gross Revenue</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {formatRupees(payload[0].value as number)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                          <span className="text-xs text-slate-500 font-medium">Net Revenue</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {formatRupees(payload[1].value as number)}
                        </span>
                      </div>
                      <div className="border-t border-slate-100 pt-2 mt-2 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-xs text-slate-500 font-medium">Commissions</span>
                        </div>
                        <span className="text-sm font-bold text-amber-700">
                          {formatRupees((payload[0].value as number) - (payload[1].value as number))}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="grossRevenue"
            stroke="#14b8a6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorGross)"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="netRevenue"
            stroke="#4f46e5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorNet)"
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
