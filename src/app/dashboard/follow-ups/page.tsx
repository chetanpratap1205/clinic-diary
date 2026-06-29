import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { followUps, patients, clinics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { FollowUpCard } from "@/components/dashboard/follow-ups/follow-up-card";
import { StaggerContainer, FadeInUp } from "@/components/dashboard/dashboard-animations";
import { Calendar, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export default async function FollowUpsDashboardPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const clinicResult = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);
    
  const clinicData = clinicResult[0];

  const pendingFollowUps = await db
    .select({
      id: followUps.id,
      dueDate: followUps.dueDate,
      status: followUps.status,
      notes: followUps.notes,
      patient: {
        id: patients.id,
        name: patients.name,
        phone: patients.phone,
      }
    })
    .from(followUps)
    .innerJoin(patients, eq(followUps.patientId, patients.id))
    .where(
      and(
        eq(followUps.clinicId, authUser.clinicId),
        eq(followUps.status, "pending")
      )
    );

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

  return (
    <StaggerContainer className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      {/* Header */}
      <FadeInUp>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Follow-ups
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm sm:text-base font-medium">
            Manage callbacks and ensure no patient falls through the cracks.
          </p>
        </div>
      </FadeInUp>

      {/* Due Today */}
      <FadeInUp>
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-amber-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Due Today</h2>
            <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
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
                <FollowUpCard key={fu.id} followUp={fu} variant="today" clinic={{ name: clinicData.name, slug: clinicData.slug }} />
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
            <h2 className="text-xl font-bold text-slate-900">Overdue</h2>
            <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {overdue.length}
            </span>
          </div>
          
          {overdue.length === 0 ? (
            <div className="bg-gradient-to-r from-emerald-50/80 to-white border border-emerald-100 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-sm backdrop-blur-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-emerald-900 font-bold text-sm sm:text-base">All caught up! No overdue patients.</p>
                <p className="text-emerald-700/80 text-xs sm:text-sm font-medium mt-0.5">Great job staying on top of your schedule.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdue.map((fu) => (
                <FollowUpCard key={fu.id} followUp={fu} variant="overdue" clinic={{ name: clinicData.name, slug: clinicData.slug }} />
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
            <h2 className="text-xl font-bold text-slate-900">Upcoming</h2>
            <span className="ml-2 bg-sky-100 text-sky-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
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
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">Future follow-ups will appear here.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((fu) => (
                <FollowUpCard key={fu.id} followUp={fu} variant="upcoming" clinic={{ name: clinicData.name, slug: clinicData.slug }} />
              ))}
            </div>
          )}
        </section>
      </FadeInUp>

    </StaggerContainer>
  );
}
