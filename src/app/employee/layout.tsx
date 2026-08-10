import { redirect } from "next/navigation";
import { getAuthenticatedEmployee } from "@/lib/auth/rbac";
import Link from "next/link";
import { LogOut, LayoutDashboard, Users, MapPin, Award, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const emp = await getAuthenticatedEmployee();

  if (!emp) {
    redirect("/staff-login");
  }

  const roleLabelMap: Record<string, string> = {
    admin: "Super Admin",
    manager: "Manager",
    staff: "Staff",
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 z-20">
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
              Staff Portal
            </span>
          </div>
        </div>

        {/* Employee Info Header Card */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-semibold text-slate-700 truncate">
              {emp.name}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
              {roleLabelMap[emp.role] || emp.role}
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              {emp.employeeCode}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link
            href="/employee"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview
          </Link>
          <Link
            href="/employee/leads"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            <Users className="w-4 h-4" />
            My Doctor Leads
          </Link>
          <Link
            href="/employee/directory"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Unclaimed Directory
          </Link>
          <Link
            href="/employee/performance"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
          >
            <Award className="w-4 h-4" />
            My Targets
          </Link>

          {(emp.role === "admin" || emp.role === "manager") && (
            <div className="pt-4 mt-4 border-t border-slate-200">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Manager Tools
              </span>
              <Link
                href="/employee/team-leads"
                className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                <Users className="w-4 h-4 text-teal-600" />
                Team Leads
              </Link>
              <Link
                href="/employee/qr"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                QR Codes
              </Link>
              <Link
                href="/employee/marketing"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                <Award className="w-4 h-4 text-teal-600" />
                Marketing
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <form action="/auth/signout" method="post">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 h-9 text-xs text-slate-700 hover:bg-rose-50 hover:text-rose-600 border-slate-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-16 lg:pb-0">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 shrink-0 justify-between">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="Logo" className="w-5 h-5" />
            </div>
            <h1 className="text-sm font-semibold text-slate-800">
              Internal Staff Portal
            </h1>
            <span className="hidden sm:inline-block text-xs px-2 py-0.5 rounded bg-slate-100 font-mono text-slate-600">
              {emp.employeeCode}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline-block">
              {emp.email}
            </span>
            <form action="/auth/signout" method="post" className="lg:hidden">
              <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600 px-2">
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-30 px-2 shadow-lg">
        <Link
          href="/employee"
          className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-teal-600 py-1 px-2"
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link
          href="/employee/leads"
          className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-teal-600 py-1 px-2"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium">Leads</span>
        </Link>
        <Link
          href="/employee/directory"
          className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-teal-600 py-1 px-2"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-medium">Directory</span>
        </Link>
        <Link
          href="/employee/performance"
          className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-teal-600 py-1 px-2"
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] font-medium">Targets</span>
        </Link>
      </div>
    </div>
  );
}
