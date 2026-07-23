import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, clinics, patients, followUps } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { StatCardsGrid, StatCard } from "./components/stat-cards";
import { AnalyticsChartsDynamic as AnalyticsCharts } from "./components/analytics-charts-dynamic";
import { Users, CalendarCheck, TrendingUp, Activity, Filter } from "lucide-react";
import { format, subDays, startOfYear, endOfYear, subYears, parseISO } from "date-fns";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata = {
  title: "Analytics | Doctor Diary",
};

interface SearchParams {
  period?: string;
}

export default async function AnalyticsPage(props: { searchParams: Promise<SearchParams> }) {
  const searchParams = await props.searchParams;
  const authUser = await getAuthUser();

  if (!authUser || !authUser.clinicId) {
    redirect("/login");
  }

  const period = searchParams.period || "30d";

  // Determine date ranges based on period
  const today = new Date();
  let startDate = subDays(today, 30);
  let endDate = today;

  if (period === "7d") {
    startDate = subDays(today, 7);
  } else if (period === "this_year") {
    startDate = startOfYear(today);
    endDate = endOfYear(today);
  } else if (period === "last_year") {
    const lastYear = subYears(today, 1);
    startDate = startOfYear(lastYear);
    endDate = endOfYear(lastYear);
  } else if (period === "all_time") {
    startDate = new Date(2000, 0, 1); // effectively all time
    endDate = new Date(2099, 11, 31);
  }

  const startDateStr = format(startDate, "yyyy-MM-dd");
  const endDateStr = format(endDate, "yyyy-MM-dd");

  // Fetch clinic details for theme and fee
  const clinicResult = await db
    .select({ consultationFee: clinics.consultationFee, themeColor: clinics.themeColor })
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);
    
  if (!clinicResult.length) redirect("/onboarding");
  const clinic = clinicResult[0];

  // Fetch metrics data
  const [
    totalPatientsResult,
    appointmentsResult,
    followUpsResult
  ] = await Promise.all([
    // Total Patients (All Time)
    db.select({ count: sql<number>`count(*)` }).from(patients).where(eq(patients.clinicId, authUser.clinicId)),
    
    // Appointments in period
    db.select({
      id: appointments.id,
      status: appointments.status,
      date: appointments.appointmentDate,
      acquisitionSource: appointments.acquisitionSource,
      feeCollected: appointments.feeCollected,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, authUser.clinicId),
        gte(appointments.appointmentDate, startDateStr),
        lte(appointments.appointmentDate, endDateStr)
      )
    ),

    // Follow-ups in period
    db.select({
      id: followUps.id,
      status: followUps.status,
    })
    .from(followUps)
    .where(
      and(
        eq(followUps.clinicId, authUser.clinicId),
        gte(followUps.dueDate, startDateStr),
        lte(followUps.dueDate, endDateStr)
      )
    )
  ]);

  const totalPatients = Number(totalPatientsResult[0]?.count || 0);

  // Process Appointment Stats
  let completedCount = 0;
  const statusCounts: Record<string, number> = {};
  
  // For daily charts
  const dailyMap: Record<string, { appointments: number; revenue: number }> = {};
  
  // For acquisition sources
  const sourceCounts: Record<string, number> = {
    qr_reception: 0,
    qr_window: 0,
    qr_sticker: 0,
    qr_general: 0,
    qr_inside: 0,
    qr_outside: 0,
    sticker: 0,
    direct_link: 0,
    unknown: 0
  };
  
  let totalRevenue = 0;

  appointmentsResult.forEach(app => {
    // Status breakdown
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    
    // Daily breakdown
    const dateStr = app.date;
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = { appointments: 0, revenue: 0 };
    }
    dailyMap[dateStr].appointments += 1;

    if (app.status === "completed") {
      completedCount++;
      const fee = app.feeCollected ?? (clinic.consultationFee || 0);
      dailyMap[dateStr].revenue += fee;
      totalRevenue += fee;
    }

    // Source breakdown
    const source = app.acquisitionSource || "unknown";
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  const totalAppointmentsInPeriod = appointmentsResult.length;
  const completionRate = totalAppointmentsInPeriod > 0 
    ? Math.round((completedCount / totalAppointmentsInPeriod) * 100) 
    : 0;

  // Follow-up conversion
  const totalFollowUps = followUpsResult.length;
  const completedFollowUps = followUpsResult.filter(f => f.status === "completed").length;
  const followUpRate = totalFollowUps > 0 
    ? Math.round((completedFollowUps / totalFollowUps) * 100) 
    : 0;

  // Format data for Recharts
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const sourceLabels: Record<string, string> = {
    qr_reception: "Reception Standee (QR)",
    qr_window: "Outside Window (QR)",
    qr_sticker: "Patient File (Sticker)",
    qr_general: "General QR",
    qr_inside: "In-Clinic Poster",
    qr_outside: "Outside Poster",
    sticker: "Desk Sticker",
    direct_link: "Direct Link",
    unknown: "Unknown",
  };

  const sourceData = Object.entries(sourceCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value]) => ({
      name: sourceLabels[name] || name,
      value,
    }));

  const dailyData = Object.entries(dailyMap)
    .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
    .map(([date, stats]) => ({
      date: format(parseISO(date), "MMM dd"),
      ...stats
    }));

  // If period is large, maybe group by week/month, but for now daily is fine for Recharts since it scales
  
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Insights and operational metrics for your clinic.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-xl shadow-inner h-auto inline-flex overflow-x-auto no-scrollbar w-full md:w-auto">
          <Link 
            href="?period=7d" 
            className={`px-4 py-2 text-sm rounded-lg transition-all whitespace-nowrap ${period === '7d' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'}`}
          >
            7 Days
          </Link>
          <Link 
            href="?period=30d" 
            className={`px-4 py-2 text-sm rounded-lg transition-all whitespace-nowrap ${period === '30d' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'}`}
          >
            30 Days
          </Link>
          <Link 
            href="?period=this_year" 
            className={`px-4 py-2 text-sm rounded-lg transition-all whitespace-nowrap ${period === 'this_year' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'}`}
          >
            This Year
          </Link>
          <Link 
            href="?period=last_year" 
            className={`px-4 py-2 text-sm rounded-lg transition-all whitespace-nowrap ${period === 'last_year' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'}`}
          >
            Last Year
          </Link>
          <Link 
            href="?period=all_time" 
            className={`px-4 py-2 text-sm rounded-lg transition-all whitespace-nowrap ${period === 'all_time' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'}`}
          >
            All Time
          </Link>
        </div>
      </div>

      <StatCardsGrid>
        <StatCard
          title="Total Patients"
          value={totalPatients}
          icon={<Users className="w-5 h-5" />}
          description="All time registered patients"
          themeColor={clinic.themeColor!}
        />
        <StatCard
          title="Appointments"
          value={totalAppointmentsInPeriod}
          icon={<CalendarCheck className="w-5 h-5" />}
          description={`Selected period (${completionRate}% completed)`}
          themeColor={clinic.themeColor!}
        />
        <StatCard
          title="Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          description="Total collected from completed visits"
          themeColor={clinic.themeColor!}
        />
        <StatCard
          title="Follow-up Success"
          value={`${followUpRate}%`}
          icon={<Activity className="w-5 h-5" />}
          description={`${completedFollowUps} of ${totalFollowUps} follow-ups resolved`}
          themeColor={clinic.themeColor!}
        />
      </StatCardsGrid>

      <AnalyticsCharts 
        dailyData={dailyData} 
        statusData={statusData} 
        sourceData={sourceData}
        themeColor={clinic.themeColor!} 
      />
    </div>
  );
}
