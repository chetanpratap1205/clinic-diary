import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
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

  if (!authUser.clinicId || !authUser.clinicName || !authUser.clinicSlug) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        clinicName={authUser.clinicName}
        clinicSlug={authUser.clinicSlug}
        doctorName={authUser.name}
        themeColor={authUser.themeColor ?? "#0ea5e9"}
      />
      {/* Main content: offset for desktop sidebar, top header on mobile, bottom nav on mobile */}
      <div className="lg:pl-64">
        <div className="pt-14 lg:pt-0 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0 min-h-screen flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <QuoteFooter />
        </div>
      </div>
    </div>
  );
}
