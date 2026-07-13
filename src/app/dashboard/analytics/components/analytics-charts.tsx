"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
  sourceData?: StatusStats[];
  themeColor?: string;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "#0ea5e9",
  completed: "#10b981",
  cancelled: "#f43f5e",
  no_show: "#f59e0b",
  in_consultation: "#8b5cf6",
  checked_in: "#3b82f6",
};

export function AnalyticsCharts({ dailyData, statusData, sourceData = [], themeColor = "#0ea5e9" }: AnalyticsChartsProps) {
  // If there's no data, we should still show something empty or fallback
  const hasData = dailyData.length > 0 || statusData.length > 0;

  return (
    <>
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
              <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                  dx={-10}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                  dx={10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(8px)' }}
                  labelStyle={{ fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 600, color: '#475569' }} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  name="Appointments"
                  dataKey="appointments" 
                  stroke={themeColor} 
                  fillOpacity={1}
                  fill="url(#colorAppointments)"
                  strokeWidth={4}
                  activeDot={{ r: 6, strokeWidth: 0, fill: themeColor }}
                />
                <Area 
                  yAxisId="right"
                  type="monotone" 
                  name="Revenue (₹)"
                  dataKey="revenue" 
                  stroke="#10b981" 
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={4}
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                />
              </AreaChart>
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
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  formatter={(value: string) => <span className="capitalize font-medium text-slate-600">{value.replace('_', ' ')}</span>}
                  wrapperStyle={{ paddingTop: '20px' }}
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

      {sourceData && sourceData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col gap-4 lg:col-span-1">
            <div>
              <h3 className="font-semibold leading-none tracking-tight">Acquisition Channels</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Where your patients are coming from.
              </p>
            </div>
            
            <div className="h-[300px] w-full mt-auto mb-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceData.map((entry, index) => {
                      const colors = ["#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#64748b"];
                      return (
                        <Cell 
                          key={`cell-source-${index}`} 
                          fill={colors[index % colors.length]} 
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} patients`, 'Count']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    formatter={(value: string) => <span className="font-medium text-slate-600">{value}</span>}
                    wrapperStyle={{ paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
