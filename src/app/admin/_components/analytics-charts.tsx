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
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AppointmentPoint {
  date: string;
  count: number;
}

interface TopClinic {
  name: string;
  count: number;
}

interface ChannelStat {
  channel: string;
  sent: number;
  failed: number;
}

interface AnalyticsChartsProps {
  appointmentTrend: AppointmentPoint[];
  topClinics: TopClinic[];
  channelStats: ChannelStat[];
}

const COLORS = ["#0d7559", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ef4444"];

const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  boxShadow: "0 4px 12px -2px rgb(0 0 0 / 0.08)",
  fontSize: "12px",
  padding: "8px 12px",
};

export function AnalyticsCharts({
  appointmentTrend,
  topClinics,
  channelStats,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-4">
      {/* Appointment Trend */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">
            Daily Appointments — Last 30 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          {appointmentTrend.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
              No appointment data for this period.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={appointmentTrend}
                margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ stroke: "#0ea5e9", strokeWidth: 1, strokeDasharray: "4 4" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Appointments"
                  stroke="#0ea5e9"
                  fill="url(#colorAppts)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Clinics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Top 5 Clinics by Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topClinics.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
                No data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={topClinics}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "#f8fafc" }}
                  />
                  <Bar
                    dataKey="count"
                    name="Appointments"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={22}
                  >
                    {topClinics.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Channel Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Reminder Delivery by Channel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {channelStats.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-slate-400 text-sm">
                No reminder data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={channelStats}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="channel"
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
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  />
                  <Bar
                    dataKey="sent"
                    name="Sent"
                    fill="#0d7559"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="failed"
                    name="Failed"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
