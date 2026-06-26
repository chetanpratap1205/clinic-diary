"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface DailyStats {
  date: string;
  appointments: number;
  revenue: number;
}

interface StatusStats {
  name: string;
  value: number;
}

interface AnalyticsChartsProps {
  dailyData: DailyStats[];
  statusData: StatusStats[];
  themeColor?: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#3b82f6", // blue
  completed: "#10b981", // emerald
  cancelled: "#ef4444", // red
  no_show: "#f59e0b", // amber
};

export function AnalyticsCharts({ dailyData, statusData, themeColor = "#0ea5e9" }: AnalyticsChartsProps) {
  // If there's no data, we should still show something empty or fallback
  const hasData = dailyData.length > 0 || statusData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue & Appointments Trend */}
      <div className="lg:col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-4">
        <div>
          <h3 className="font-semibold leading-none tracking-tight">Daily Performance</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Appointments and revenue trends over the selected period.
          </p>
        </div>
        
        {hasData ? (
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dx={-10}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dx={10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  name="Appointments"
                  dataKey="appointments" 
                  stroke={themeColor} 
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={false}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  name="Revenue (₹)"
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg mt-4">
            No trend data available for this period.
          </div>
        )}
      </div>

      {/* Status Breakdown */}
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-4">
        <div>
          <h3 className="font-semibold leading-none tracking-tight">Appointment Status</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Breakdown of appointment outcomes.
          </p>
        </div>
        
        {statusData.length > 0 ? (
          <div className="h-[300px] w-full mt-auto mb-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.name.toLowerCase()] || themeColor} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} appointments`, 'Count']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value: string) => <span className="capitalize">{value.replace('_', ' ')}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg mt-auto mb-auto">
            No status data available.
          </div>
        )}
      </div>
    </div>
  );
}
