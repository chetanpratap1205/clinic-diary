import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, clinics, patients, followUps, qrScans } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { StatCardsGrid, StatCard } from "./components/stat-cards";
import { AnalyticsChartsDynamic as AnalyticsCharts } from "./components/analytics-charts-dynamic";
import { QRDecisionIntelligence } from "@/components/dashboard/qr-decision-intelligence";
import { Users, CalendarCheck, TrendingUp, Activity, Filter } from "lucide-react";
import { format, subDays, startOfYear, endOfYear, subYears, parseISO } from "date-fns";
import { ExportButton } from "./components/export-button";
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

  // Fetch clinic details for theme, fee, name, and doctorName
  const clinicResult = await db
    .select({
      name: clinics.name,
      doctorName: clinics.doctorName,
      consultationFee: clinics.consultationFee,
      themeColor: clinics.themeColor,
    })
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);
    
  if (!clinicResult.length) redirect("/onboarding");
  const clinic = clinicResult[0];

  // Fetch metrics data
  const [
    totalPatientsResult,
    appointmentsResult,
    followUpsResult,
    qrScansResult
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
      isFree: followUps.isFree,
      followUpAppointmentId: followUps.followUpAppointmentId,
    })
    .from(followUps)
    .where(
      and(
        eq(followUps.clinicId, authUser.clinicId),
        gte(followUps.dueDate, startDateStr),
        lte(followUps.dueDate, endDateStr)
      )
    ),

    // QR Scans grouped by placement
    db.select({
      placement: qrScans.placement,
      count: sql<number>`count(*)`,
    })
    .from(qrScans)
    .where(eq(qrScans.clinicId, authUser.clinicId))
    .groupBy(qrScans.placement)
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
    // Fix: pg returns Date objects for Postgres date types, stringifying it into keys causes parseISO to crash
    let dateStr = "";
    if (typeof app.date === "string") {
      dateStr = app.date.split("T")[0];
    } else {
      dateStr = String(app.date);
    }

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

  // Follow-up conversion + free/paid split
  const totalFollowUps = followUpsResult.length;
  const completedFollowUps = followUpsResult.filter(f => f.status === "completed").length;
  const freeFollowUps = followUpsResult.filter(f => f.isFree && f.status === "completed").length;
  const paidFollowUps = completedFollowUps - freeFollowUps;
  const followUpRate = totalFollowUps > 0
    ? Math.round((completedFollowUps / totalFollowUps) * 100)
    : 0;

  // Set of appointment IDs that are follow-up return visits
  const followUpApptIds = new Set(
    followUpsResult
      .filter(f => f.followUpAppointmentId)
      .map(f => f.followUpAppointmentId!)
  );

  // Revenue split: new visits vs follow-up return visits
  let newVisitRevenue = 0;
  let followUpVisitRevenue = 0;

  appointmentsResult.forEach(app => {
    if (app.status === "completed") {
      const fee = app.feeCollected ?? (clinic.consultationFee || 0);
      if (followUpApptIds.has(app.id)) {
        followUpVisitRevenue += fee;
      } else {
        newVisitRevenue += fee;
      }
    }
  });

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
    .map(([date, stats]) => {
      let formattedDate = date;
      try {
        formattedDate = format(parseISO(date), "MMM dd");
      } catch (err) {
        // Fallback if date is somehow invalid
      }
      return {
        date: formattedDate,
        ...stats
      };
    });

  const placementConfig: Record<string, { name: string; icon: string }> = {
    reception: { name: "Reception Poster", icon: "📍" },
    window: { name: "Outside Window", icon: "🪟" },
    stand: { name: "Acrylic Standee (4x6)", icon: "📐" },
    sticker: { name: "Prescription Sticker", icon: "🏷️" },
    general: { name: "General QR", icon: "📱" },
  };

  const scanCountsByPlacement: Record<string, number> = {};
  qrScansResult.forEach((row) => {
    if (row.placement) scanCountsByPlacement[row.placement] = Number(row.count || 0);
  });

  const apptCountsByPlacement: Record<string, number> = {};
  appointmentsResult.forEach((app) => {
    if (app.acquisitionSource) {
      const p = app.acquisitionSource.replace("qr_", "");
      apptCountsByPlacement[p] = (apptCountsByPlacement[p] || 0) + 1;
    }
  });

  const placementStats = ["reception", "window", "stand", "sticker"].map((p) => ({
    placement: p,
    name: placementConfig[p]?.name || p,
    icon: placementConfig[p]?.icon || "📱",
    scans: scanCountsByPlacement[p] || 0,
    appointments: apptCountsByPlacement[p] || 0,
    revenue: 0,
  }));

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Analytics & Intelligence
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Operational insights, queue tracking, and physical QR performance for <span className="font-semibold text-slate-700">{clinic.doctorName || clinic.name}</span>.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner overflow-x-auto no-scrollbar w-full sm:w-auto">
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
              className={`px-4 py-2 text-sm rounded-lg transition-all whitespace-nowrap ${period === 'all_time' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'}`}
            >
              All Time
            </Link>
          </div>
          <ExportButton />
        </div>
      </div>

      {/* 🤖 Physical QR Placement & AI Decision Intelligence */}
      <QRDecisionIntelligence
        doctorName={clinic.doctorName}
        clinicName={clinic.name}
        placementStats={placementStats}
      />

      <StatCardsGrid>
        <StatCard
          title="Total Patients"
          value={totalPatients}
          icon={<Users className="w-5 h-5" />}
          description="All time registered patients"
          themeColor={clinic.themeColor || "#0ea5e9"}
        />
        <StatCard
          title="Appointments"
          value={totalAppointmentsInPeriod}
          icon={<CalendarCheck className="w-5 h-5" />}
          description={`Selected period (${completionRate}% completed)`}
          themeColor={clinic.themeColor || "#0ea5e9"}
        />
        <StatCard
          title="Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          description={`New visits: ₹${newVisitRevenue.toLocaleString()} | Follow-ups: ₹${followUpVisitRevenue.toLocaleString()}`}
          themeColor={clinic.themeColor || "#0ea5e9"}
        />
        <StatCard
          title="Follow-up Success"
          value={`${followUpRate}%`}
          icon={<Activity className="w-5 h-5" />}
          description={`${completedFollowUps} resolved — ${freeFollowUps} free, ${paidFollowUps} paid`}
          themeColor={clinic.themeColor || "#0ea5e9"}
        />
      </StatCardsGrid>

      <AnalyticsCharts 
        dailyData={dailyData} 
        statusData={statusData} 
        sourceData={sourceData}
        themeColor={clinic.themeColor || "#0ea5e9"} 
      />
    </div>
  );
}
