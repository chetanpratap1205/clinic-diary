import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { patients, appointments, subscriptions, clinics } from "@/db/schema";
import { eq, desc, count, and, ilike, or } from "drizzle-orm";
import { redirect } from "next/navigation";
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
    })
    .from(patients)
    .leftJoin(
      appointments,
      and(
        eq(appointments.patientId, patients.id),
        eq(appointments.clinicId, patients.clinicId)
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

  // Check subscription status
  const activeSubs = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.clinicId, authUser.clinicId),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1);

  const hasActiveSubscription = activeSubs.length > 0;
  const isLimitReached = !hasActiveSubscription && totalPatientsCount >= 5;

  return (
    <StaggerContainer className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      {isLimitReached && (
        <FadeInUp>
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h3 className="text-lg font-semibold text-sky-900">Patient Limit Reached</h3>
              <p className="text-sky-700 mt-1">You've reached the 5-patient limit on the free plan. Upgrade to unlock unlimited patients and premium features.</p>
            </div>
            <Link
              href="/dashboard/billing"
              className="whitespace-nowrap inline-flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
            >
              View Pricing
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
          {!isLimitReached ? (
            <Link
              href="/dashboard/patients/new"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 hover:ring-4 ring-slate-900/5 text-sm sm:text-base"
            >
              <Plus strokeWidth={2.5} className="w-4 h-4" />
              Add Patient
            </Link>
          ) : (
            <button
              disabled
              className="inline-flex items-center justify-center gap-2 bg-slate-100 text-slate-400 px-6 py-3 rounded-2xl font-bold cursor-not-allowed text-sm sm:text-base"
            >
              <Plus strokeWidth={2.5} className="w-4 h-4" />
              Add Patient
            </button>
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
