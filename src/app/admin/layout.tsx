import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./_components/admin-nav";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim());
  if (!adminIds.includes(user.id)) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden print:h-auto print:block print:bg-white print:overflow-visible">
      {/* Sidebar */}
      <aside className="print:hidden w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-slate-200 shrink-0 gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-teal-50 ring-1 ring-teal-100 shrink-0">
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
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">
              Super Admin
            </span>
          </div>
        </div>

        {/* Navigation (client component for active state) */}
        <AdminNav />

        {/* User footer */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs uppercase flex-shrink-0">
              {user.email?.substring(0, 2) || "AD"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.email}
              </p>
              <p className="text-xs text-slate-500">Platform Admin</p>
            </div>
          </div>
          <form action="/auth/signout" method="post">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-9 text-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:block">
        {/* Top Header */}
        <header className="print:hidden h-16 bg-white border-b border-slate-200 flex items-center px-6 sm:px-8 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-semibold text-slate-600">
              Platform Console
            </h1>
            <span className="text-slate-300">·</span>
            <Link
              href="/"
              target="_blank"
              className="text-xs text-teal-600 hover:text-teal-700 hover:underline transition-colors"
            >
              View Live Site ↗
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 print:p-0 print:overflow-visible">
          <div className="max-w-6xl mx-auto print:max-w-none">{children}</div>
        </main>
      </div>
    </div>
  );
}
