import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { patients, appointments } from "@/db/schema";
import { eq, desc, count, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import { StaggerContainer, FadeInUp } from "@/components/dashboard/dashboard-animations";
import { PatientsClient } from "@/components/dashboard/patients/patients-client";

export default async function PatientsPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  // Fetch patients with their visit count and last visit date
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
    .where(eq(patients.clinicId, authUser.clinicId))
    .groupBy(
      patients.id,
      patients.name,
      patients.phone,
      patients.age,
      patients.gender,
      patients.address,
      patients.createdAt
    )
    .orderBy(desc(patients.createdAt));

  return (
    <StaggerContainer className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      <FadeInUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Patients</h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              {patientsWithStats.length} patient{patientsWithStats.length !== 1 ? 's' : ''} in your directory
            </p>
          </div>
          <Link
            href="/dashboard/patients/new"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </Link>
        </div>
      </FadeInUp>

      <FadeInUp>
        <PatientsClient patients={patientsWithStats} />
      </FadeInUp>
    </StaggerContainer>
  );
}
