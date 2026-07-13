"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GrowthPoint {
  month: string;
  clinics: number;
}

interface RevenuePoint {
  month: string;
  revenue: number;
}

interface DashboardChartsProps {
  growthData: GrowthPoint[];
  revenueData: RevenuePoint[];
}

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
  fontSize: "12px",
  padding: "8px 12px",
};

export function DashboardCharts({ growthData, revenueData }: DashboardChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      {/* Growth Chart */}
      <Card className="col-span-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Clinic Signups — Last 6 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          {growthData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
              No signup data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={growthData}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorClinics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d7559" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0d7559" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ stroke: "#0d7559", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="clinics"
                  name="New Clinics"
                  stroke="#0d7559"
                  fill="url(#colorClinics)"
                  strokeWidth={2}
                  dot={{ fill: "#0d7559", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#0d7559", strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card className="col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Monthly Revenue — Last 6 Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
              No revenue data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={revenueData}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
                  }
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(value) => [
                    `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
                    "Revenue",
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#0d7559"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
