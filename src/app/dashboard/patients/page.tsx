import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { patients, appointments, subscriptions, clinics, followUps } from "@/db/schema";
import { eq, desc, count, and, ilike, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getClinicAccessStatus } from "@/lib/subscription";
import { Plus } from "lucide-react";
import Link from "next/link";
import { StaggerContainer, FadeInUp } from "@/components/dashboard/dashboard-animations";
import { PatientsClient } from "@/components/dashboard/patients/patients-client";

export default async function PatientsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const searchParams = await props.searchParams;
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) || 1 : 1;
  const searchQ = typeof searchParams.search === "string" ? searchParams.search : "";
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);

  let whereCondition = eq(patients.clinicId, authUser.clinicId);
  if (searchQ) {
    whereCondition = and(
      eq(patients.clinicId, authUser.clinicId),
      or(
        ilike(patients.name, `%${searchQ}%`),
        ilike(patients.phone, `%${searchQ}%`)
      )
    ) as any;
  }

  // Count query
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(patients)
    .where(whereCondition);

  // Fetch patients with their visit count
  const patientsWithStats = await db
    .select({
      id: patients.id,
      name: patients.name,
      phone: patients.phone,
      age: patients.age,
      gender: patients.gender,
      address: patients.address,
      createdAt: patients.createdAt,
      visitCount: count(appointments.id),
      // P1: Count pending follow-ups per patient for the indicator badge
      pendingFollowUps: sql<number>`count(distinct case when ${followUps.status} = 'pending' then ${followUps.id} end)`,
    })
    .from(patients)
    .leftJoin(
      appointments,
      and(
        eq(appointments.patientId, patients.id),
        eq(appointments.clinicId, patients.clinicId)
      )
    )
    .leftJoin(
      followUps,
      and(
        eq(followUps.patientId, patients.id),
        eq(followUps.clinicId, patients.clinicId)
      )
    )
    .where(whereCondition)
    .groupBy(
      patients.id,
      patients.name,
      patients.phone,
      patients.age,
      patients.gender,
      patients.address,
      patients.createdAt
    )
    .orderBy(desc(patients.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Total patients count for limit check (without search filter)
  const [{ totalPatientsCount }] = await db
    .select({ totalPatientsCount: count() })
    .from(patients)
    .where(eq(patients.clinicId, authUser.clinicId));

  // Check subscription / 14-day trial status
  const accessStatus = await getClinicAccessStatus(authUser.clinicId);
  const isTrialExpired = accessStatus.status === "trial_expired";

  return (
    <StaggerContainer className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      {isTrialExpired && (
        <FadeInUp>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-amber-900">14-Day Free Trial Expired</h3>
              <p className="text-amber-700 mt-1">Your free trial has ended. Upgrade to an active plan to continue adding new patients while keeping your existing records safe.</p>
            </div>
            <Link
              href="/dashboard/billing"
              className="whitespace-nowrap inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Upgrade Now
            </Link>
          </div>
        </FadeInUp>
      )}

      {accessStatus.status === "trial_active" && accessStatus.daysRemaining !== null && (
        <FadeInUp>
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
              <div>
                <h4 className="text-sm font-semibold text-sky-950">14-Day Unlimited Free Trial Active</h4>
                <p className="text-xs text-sky-700 mt-0.5">
                  You have <span className="font-bold">{accessStatus.daysRemaining} day{accessStatus.daysRemaining !== 1 ? 's' : ''} remaining</span> with unlimited patient records & features.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/billing"
              className="text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              View Plans
            </Link>
          </div>
        </FadeInUp>
      )}

      <FadeInUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Patients</h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              {totalCount} patient{totalCount !== 1 ? 's' : ''} {searchQ && 'found'}
            </p>
          </div>
          {!isTrialExpired ? (
            <Link
              href="/dashboard/patients/new"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 hover:ring-4 ring-slate-900/5 text-sm sm:text-base"
            >
              <Plus strokeWidth={2.5} className="w-4 h-4" />
              Add Patient
            </Link>
          ) : (
            <Link
              href="/dashboard/billing"
              className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md text-sm sm:text-base"
            >
              <Plus strokeWidth={2.5} className="w-4 h-4" />
              Upgrade to Add Patients
            </Link>
          )}
        </div>
      </FadeInUp>

      <FadeInUp>
        <PatientsClient 
          patients={patientsWithStats} 
          clinic={clinic} 
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          initialSearch={searchQ}
        />
      </FadeInUp>
    </StaggerContainer>
  );
}
