import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { clinics, clinicAdmins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/dashboard/sidebar";
import type { ReactNode } from "react";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect("/login");
  }

  if (!authUser.clinicId) {
    redirect("/onboarding");
  }

  // Load clinic data for the sidebar
  const clinicResult = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, authUser.clinicId))
    .limit(1);

  if (!clinicResult.length) {
    redirect("/onboarding");
  }

  const clinic = clinicResult[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        clinicName={clinic.name}
        clinicSlug={clinic.slug}
        doctorName={clinic.doctorName}
        themeColor={clinic.themeColor ?? "#0ea5e9"}
      />
      <div className="lg:pl-64">
        <div className="pt-14 lg:pt-0 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
