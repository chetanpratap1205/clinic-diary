import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { followUps, patients } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format, differenceInDays } from "date-fns";
import { FollowUpCard } from "@/components/dashboard/follow-ups/follow-up-card";
import { StaggerContainer, FadeInUp } from "@/components/dashboard/dashboard-animations";
import { Calendar, AlertCircle, Clock, CheckCircle2 } from "lucide-react";

export default async function FollowUpsDashboardPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Follow-up Engine
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Never lose a returning patient. Stay on top of your follow-ups.
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
            <div className="bg-gradient-to-br from-amber-50/50 to-white border border-dashed border-amber-200/60 rounded-3xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-amber-100/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-amber-500" />
              </div>
              <p className="text-amber-900 font-bold text-lg">No follow-ups due today.</p>
              <p className="text-amber-600/80 text-sm mt-1">You're all caught up for the day!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueToday.map((fu) => (
                <FollowUpCard key={fu.id} followUp={fu} variant="today" />
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
            <div className="bg-gradient-to-br from-emerald-50/50 to-white border border-dashed border-emerald-200/60 rounded-3xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-emerald-100/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <p className="text-emerald-900 font-bold text-lg">All caught up! No overdue patients.</p>
              <p className="text-emerald-600/80 text-sm mt-1">Great job staying on top of your schedule.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overdue.map((fu) => (
                <FollowUpCard key={fu.id} followUp={fu} variant="overdue" />
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
            <div className="bg-gradient-to-br from-slate-50/50 to-white border border-dashed border-slate-200/60 rounded-3xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100/50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Calendar className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-900 font-bold text-lg">No upcoming follow-ups scheduled.</p>
              <p className="text-slate-500 text-sm mt-1">Future follow-ups will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((fu) => (
                <FollowUpCard key={fu.id} followUp={fu} variant="upcoming" />
              ))}
            </div>
          )}
        </section>
      </FadeInUp>

    </StaggerContainer>
  );
}
