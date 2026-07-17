import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { growthPartners } from "@/db/schema";
import { eq } from "drizzle-orm";
import { FieldPortalNav } from "./_components/field-portal-nav";
import { PartnerSignOutButton } from "./_components/partner-sign-out-button";
import type { ReactNode } from "react";

export default async function FieldPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    // Not logged in → send to partner login page (not doctor login)
    redirect("/partner/login");
  }

  // Check if user is a Growth Partner
  const [partner] = await db
    .select()
    .from(growthPartners)
    .where(eq(growthPartners.authUserId, authUser.userId))
    .limit(1);

  if (!partner || !partner.isActive) {
    // Logged in but not a partner → show access denied on partner login page
    redirect("/partner/login?error=access_denied");
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0 md:flex-row">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 z-20 h-screen sticky top-0">
        <div className="h-16 flex items-center px-5 border-b border-slate-200 shrink-0 gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-blue-50 ring-1 ring-blue-100 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-192.png"
              alt="Doctor Diary"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-base tracking-tight block leading-tight">
              Doctor Diary
            </span>
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
              Field Portal
            </span>
          </div>
        </div>

        <div className="flex-1 py-4">
          <FieldPortalNav orientation="vertical" />
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
              {partner.name.substring(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {partner.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{partner.email}</p>
            </div>
          </div>
          {partner.referralCode && (
            <div className="mt-2 px-2 py-1 bg-blue-50 rounded-lg text-center">
              <p className="text-[10px] font-bold text-blue-600 font-mono">
                {partner.referralCode}
              </p>
            </div>
          )}
          <div className="mt-3">
            <PartnerSignOutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0 flex flex-col">{children}</main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-[env(safe-area-inset-bottom,0px)] px-2 h-16 flex items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <FieldPortalNav orientation="horizontal" />
      </nav>
    </div>
  );
}
