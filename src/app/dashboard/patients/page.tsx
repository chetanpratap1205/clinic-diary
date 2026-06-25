import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { patients, clinics } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { Plus, Search, User, Phone, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  StaggerContainer,
  FadeInUp,
} from "@/components/dashboard/dashboard-animations";

export default async function PatientsPage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const patientsList = await db
    .select()
    .from(patients)
    .where(eq(patients.clinicId, authUser.clinicId))
    .orderBy(desc(patients.createdAt));

  return (
    <StaggerContainer className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-5 sm:space-y-8 pb-safe bottom-nav-spacing lg:pb-8">
      {/* Header */}
      <FadeInUp>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Patients
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              Manage your clinic&apos;s patient directory
            </p>
          </div>
          <Link
            href="/dashboard/patients/new"
            className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Patient
          </Link>
        </div>
      </FadeInUp>

      {/* Patient List */}
      <FadeInUp>
        <Card className="border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patients by name or phone... (Coming soon)"
                disabled
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>
          <CardContent className="p-0">
            {patientsList.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-slate-300" />
                </div>
                <p className="text-slate-600 font-medium text-base sm:text-lg">
                  No patients yet
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Add your first patient to start managing follow-ups
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {patientsList.map((patient) => (
                  <Link
                    key={patient.id}
                    href={`/dashboard/patients/${patient.id}`}
                    className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-sky-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100/50">
                        <span className="text-indigo-700 font-bold text-sm">
                          {patient.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                          {patient.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-xs font-medium">
                              {patient.phone}
                            </span>
                          </div>
                          {patient.age && (
                            <div className="hidden sm:flex items-center gap-1.5 text-slate-500">
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-xs">{patient.age} yrs</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <p className="text-xs text-slate-400 font-medium flex items-center justify-end gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Added {format(new Date(patient.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeInUp>
    </StaggerContainer>
  );
}
