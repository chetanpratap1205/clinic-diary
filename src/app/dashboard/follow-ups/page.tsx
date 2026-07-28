import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { followUps, patients, clinics, appointments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { FollowUpCard } from "@/components/dashboard/follow-ups/follow-up-card";
import { StaggerContainer, FadeInUp } from "@/components/dashboard/dashboard-animations";
import { Calendar, AlertCircle, Clock, CheckCircle2, TrendingUp, DollarSign, Users } from "lucide-react";

export default async function FollowUpsDashboardPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const clinicResult = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);
    
  const clinicData = clinicResult[0];
  const fee = clinicData.consultationFee || 500;

  const allFollowUps = await db
    .select({
      id: followUps.id,
      dueDate: followUps.dueDate,
      status: followUps.status,
      notes: followUps.notes,
      completedAt: followUps.completedAt,
      isFree: followUps.isFree,
      feeOverride: followUps.feeOverride,
      sourceType: followUps.sourceType,
      followUpAppointmentId: followUps.followUpAppointmentId,
      patient: {
        id: patients.id,
        name: patients.name,
        phone: patients.phone,
      }
    })
    .from(followUps)
    .innerJoin(patients, eq(followUps.patientId, patients.id))
    .where(eq(followUps.clinicId, authUser.clinicId));

  const pendingFollowUps = allFollowUps.filter(fu => fu.status === "pending");
  const completedFollowUps = allFollowUps.filter(fu => fu.status === "completed" || fu.status === "checked_in");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue: typeof pendingFollowUps = [];
  const dueToday: typeof pendingFollowUps = [];
  const upcoming: typeof pendingFollowUps = [];

  pendingFollowUps.forEach((fu) => {
    const dueDate = new Date(fu.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    
    if (dueDate < today) {
      overdue.push(fu);
    } else if (dueDate.getTime() === today.getTime()) {
      dueToday.push(fu);
    } else {
      upcoming.push(fu);
    }
  });

  // Sort them
  overdue.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  dueToday.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // ─── P0: Correct revenue calculation ──────────────────────────────────────
  // Recovered Revenue = actual fees from completed follow-up visits
  //   - Free follow-ups → ₹0 (isFree=true, feeOverride=0)
  //   - Paid follow-ups → actual feeCollected from linked appointment or clinicFee
  //   - Old records without link → use clinic fee as estimate
  let recoveredRevenue = 0;
  for (const fu of completedFollowUps) {
    if (fu.isFree) {
      // Free follow-up: contributes ₹0
      recoveredRevenue += 0;
    } else if (fu.feeOverride !== null && fu.feeOverride !== undefined) {
      // Explicit fee override set
      recoveredRevenue += fu.feeOverride;
    } else {
      // No override — use clinic default as estimate
      recoveredRevenue += fee;
    }
  }
  // ─── end P0 ───────────────────────────────────────────────────────────────

  const totalCount = allFollowUps.length;
  const completionRate = totalCount > 0 ? Math.round((completedFollowUps.length / totalCount) * 100) : 100;

  return (
    <StaggerContainer className="p-3 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      {/* Header & Revenue Impact Dashboard */}
      <FadeInUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-emerald-600" />
              Patient Follow-ups & Revenue Recall
            </h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-base font-medium">
              Automate patient retention, callbacks & zero-drop appointment recovery.
            </p>
          </div>
        </div>

        {/* Revenue Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Est. Recovered Revenue
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
              ₹{recoveredRevenue.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-slate-300 mt-1 font-medium">
              From {completedFollowUps.length} retained follow-up visits
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-500" />
              Follow-up Completion Rate
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {completionRate}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {completedFollowUps.length} of {totalCount} total follow-ups completed
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Action Required Today
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
              {dueToday.length + overdue.length} <span className="text-xs text-slate-500 font-bold">Patients</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {dueToday.length} due today • {overdue.length} overdue
            </p>
          </div>
        </div>
      </FadeInUp>

      {/* Due Today */}
      <FadeInUp>
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-700" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Due Today</h2>
            <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {dueToday.length}
            </span>
          </div>
          
          {dueToday.length === 0 ? (
            <div className="bg-gradient-to-r from-amber-50/80 to-white border border-amber-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm backdrop-blur-sm">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-amber-900 font-bold text-sm sm:text-base">No follow-ups due today.</p>
                <p className="text-amber-700/80 text-xs sm:text-sm font-medium mt-0.5">You're all caught up for the day!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueToday.map((fu) => (
                <FollowUpCard key={fu.id} followUp={fu} variant="today" clinic={{ name: clinicData.name, doctorName: clinicData.doctorName, slug: clinicData.slug }} />
              ))}
            </div>
          )}
        </section>
      </FadeInUp>

      {/* Overdue */}
      <FadeInUp>
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-700" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Overdue Callbacks</h2>
            <span className="ml-2 bg-red-100 text-red-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {overdue.length}
            </span>
          </div>
          
          {overdue.length === 0 ? (
            <div className="bg-gradient-to-r from-emerald-50/80 to-white border border-emerald-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm backdrop-blur-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-900 font-bold text-sm sm:text-base">All caught up! Zero overdue callbacks.</p>
                <p className="text-emerald-700/80 text-xs sm:text-sm font-medium mt-0.5">Great job staying on top of patient retention.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdue.map((fu) => (
                <FollowUpCard key={fu.id} followUp={fu} variant="overdue" clinic={{ name: clinicData.name, doctorName: clinicData.doctorName, slug: clinicData.slug }} />
              ))}
            </div>
          )}
        </section>
      </FadeInUp>

      {/* Upcoming */}
      <FadeInUp>
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-sky-700" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Upcoming Schedule</h2>
            <span className="ml-2 bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {upcoming.length}
            </span>
          </div>
          
          {upcoming.length === 0 ? (
            <div className="bg-gradient-to-r from-slate-50/80 to-white border border-slate-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm backdrop-blur-sm">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                <Calendar className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-sm sm:text-base">No upcoming follow-ups scheduled.</p>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">Future follow-ups will appear here automatically.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((fu) => (
                <FollowUpCard key={fu.id} followUp={fu} variant="upcoming" clinic={{ name: clinicData.name, doctorName: clinicData.doctorName, slug: clinicData.slug }} />
              ))}
            </div>
          )}
        </section>
      </FadeInUp>

    </StaggerContainer>
  );
}
