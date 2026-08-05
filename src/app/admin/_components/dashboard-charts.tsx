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
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Activity, DollarSign, Calendar } from "lucide-react";

interface GrowthPoint {
  month: string;
  clinics: number;
}

interface RevenuePoint {
  month: string;
  revenue: number;
}

interface ActivityPoint {
  month: string;
  appointments: number;
}

interface DashboardChartsProps {
  growthData: GrowthPoint[];
  revenueData: RevenuePoint[];
  activityData?: ActivityPoint[];
}

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  fontSize: "12px",
  padding: "10px 14px",
};

export function DashboardCharts({ growthData, revenueData, activityData = [] }: DashboardChartsProps) {
  // Merge growth and activity data if month aligns
  const combinedActivityData = (activityData.length > 0 ? activityData : growthData).map((item) => {
    const growth = growthData.find((g) => g.month === item.month);
    const act = activityData.find((a) => a.month === item.month);
    return {
      month: item.month,
      clinics: growth ? growth.clinics : 0,
      appointments: act ? act.appointments : 0,
    };
  });

  const totalRevenueSixMonths = revenueData.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue & Growth Trend (Area Chart) */}
      <Card className="shadow-sm border-slate-200/80">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900">
                Revenue Growth Trend
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Monthly billed revenue collected over the last 6 months
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-medium block">6-Mo Total</span>
            <span className="text-base font-extrabold text-slate-900">
              ₹{totalRevenueSixMonths.toLocaleString("en-IN")}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {revenueData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
              No revenue data recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`₹${Number(value ?? 0).toLocaleString("en-IN")}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#d97706"
                  fill="url(#colorRev)"
                  strokeWidth={2.5}
                  dot={{ fill: "#d97706", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#b45309", strokeWidth: 2, stroke: "#ffffff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Platform Activity & Bookings (Bar Chart) */}
      <Card className="shadow-sm border-slate-200/80">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <CardTitle className="text-base font-bold text-slate-900">
                Platform Activity & Volume
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Appointments created vs. new clinic onboardings
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {combinedActivityData.length === 0 ? (
            <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
              No platform activity data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={combinedActivityData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ paddingTop: "8px", fontSize: "12px" }}
                  iconType="circle"
                />
                <Bar
                  dataKey="appointments"
                  name="Appointments"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
                <Bar
                  dataKey="clinics"
                  name="New Clinics"
                  fill="#0d7559"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
