import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Sidebar } from "@/components/dashboard/sidebar";
import { QuoteFooter } from "@/components/dashboard/quote-footer";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect("/login");
  }

  if (!authUser.clinicId) {
    redirect("/onboarding");
  }

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
      {/* Main content: offset for desktop sidebar, top header on mobile, bottom nav on mobile */}
      <div className="lg:pl-64">
        <div className="pt-14 lg:pt-0 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0 min-h-screen flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <QuoteFooter />
        </div>
      </div>
    </div>
  );
}
