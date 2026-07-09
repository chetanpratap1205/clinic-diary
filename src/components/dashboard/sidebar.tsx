"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Loader2,
  Activity,
  AlertTriangle,
  Users,
  Repeat,
  BarChart3,
  Settings2,
  CreditCard,
  ListOrdered,
} from "lucide-react";
import { useState, useTransition } from "react";
import { logoutDoctor } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PremiumIcon } from "@/components/ui/premium-icon";

interface SidebarProps {
  clinicName: string;
  clinicSlug: string;
  doctorName: string;
  themeColor?: string;
}

const navItems = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/dashboard/queue", label: "Queue", icon: ListOrdered },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/patients", label: "Patients", icon: Users },
  { href: "/dashboard/follow-ups", label: "Follow-ups", icon: Repeat },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar({
  clinicName,
  clinicSlug,
  doctorName,
  themeColor = "#0ea5e9",
}: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    setShowLogoutModal(false);
    startTransition(async () => {
      toast.promise(logoutDoctor(), {
        loading: "Signing out securely...",
        success: "Signed out successfully",
        error: "Failed to sign out",
      });
    });
  };

  const renderSidebarContent = (layoutPrefix: string) => (
    <div className="flex flex-col h-full bg-white pb-safe">
      {/* Logo */}
      <div className="p-4 sm:p-5 border-b border-slate-100/60 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-inner bg-gradient-to-br flex-shrink-0"
            style={{ 
              backgroundColor: themeColor,
              backgroundImage: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`,
              boxShadow: `inset 0 2px 4px 0 rgba(255, 255, 255, 0.3), 0 2px 5px 0 ${themeColor}40`
            }}
          >
            {clinicName[0]?.toUpperCase() ?? "N"}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-slate-900 truncate tracking-tight">
              {clinicName}
            </p>
            <p className="text-xs text-slate-500 truncate">{doctorName}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto" aria-label="Dashboard navigation">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="relative block group"
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.div
                  layoutId={`${layoutPrefix}-sidebar-active`}
                  className="absolute inset-0 rounded-xl bg-slate-100/80"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              {active && (
                <motion.div
                  layoutId={`${layoutPrefix}-sidebar-active-indicator`}
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                  style={{ backgroundColor: themeColor }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  active
                    ? "text-slate-900 translate-x-1"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 group-hover:translate-x-1"
                )}
              >
                <item.icon 
                  strokeWidth={active ? 2.5 : 2} 
                  className={cn("w-4 h-4 flex-shrink-0 transition-colors", active ? "" : "text-slate-400 group-hover:text-slate-600")}
                  style={active ? { color: themeColor } : {}}
                />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 pb-8 lg:pb-24 border-t border-slate-100 bg-slate-50/50">
        <Link
          href="/dashboard/settings"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border border-transparent mb-1",
            pathname.startsWith("/dashboard/settings")
              ? "text-slate-900 bg-slate-100"
              : "text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 hover:border-slate-200"
          )}
          aria-label="Clinic settings"
        >
          <Settings2 strokeWidth={1.5} className="w-4 h-4 flex-shrink-0 text-slate-500" />
          Settings
        </Link>
        <a
          href={`/book/${clinicSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
          aria-label="View your public booking page"
        >
          <ExternalLink strokeWidth={1.5} className="w-4 h-4 flex-shrink-0 text-sky-600" />
          View Booking Page
        </a>
        <button
          onClick={() => setShowLogoutModal(true)}
          disabled={isPending}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all mt-1 disabled:opacity-50"
          aria-label="Sign out of your account"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut strokeWidth={1.5} className="w-4 h-4 flex-shrink-0" />
          )}
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── MOBILE: Top Header Bar ─────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-4 z-40 pt-safe">
        <Link href="/dashboard" className="flex items-center gap-2.5" aria-label="Dashboard home">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            {clinicName[0]?.toUpperCase() ?? "N"}
          </div>
          <span className="font-semibold text-slate-900 text-sm tracking-tight truncate max-w-[160px]">
            {clinicName}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={`/book/${clinicSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            aria-label="View booking page"
          >
            <ExternalLink strokeWidth={1.5} className="w-4 h-4" />
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 -mr-1 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-sidebar"
          >
            {mobileOpen ? (
              <X strokeWidth={1.5} className="w-5 h-5 text-slate-600" />
            ) : (
              <Menu strokeWidth={1.5} className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* ─── MOBILE: Slide-out Drawer ────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <div
        id="mobile-sidebar"
        className={cn(
          "lg:hidden fixed left-0 top-14 bottom-0 w-[280px] bg-white border-r border-slate-200 z-50 transition-transform duration-300 ease-out shadow-2xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!mobileOpen}
      >
        {renderSidebarContent("mobile")}
      </div>

      {/* ─── MOBILE: Bottom Navigation Bar ─────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/70 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around px-1 h-16">
          {navItems.slice(0, 4).map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all duration-200 relative",
                  active ? "text-slate-900" : "text-slate-400"
                )}
                style={active ? { color: themeColor } : {}}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
              >
                {active && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute inset-x-2 top-2 bottom-2 rounded-xl"
                    style={{ backgroundColor: themeColor, opacity: 0.08 }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 35 }}
                  />
                )}
                <item.icon
                  strokeWidth={1.5}
                  className={cn(
                    "w-5 h-5 transition-transform duration-200",
                    active && "scale-110"
                  )}
                />
                <span className="text-[10px] font-semibold tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* More Menu Toggle */}
          <button
            onClick={() => setMobileOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all duration-200 relative",
              mobileOpen || ["/dashboard/follow-ups", "/dashboard/billing", "/dashboard/analytics", "/dashboard/settings"].some(p => pathname.startsWith(p)) 
                ? "text-slate-900" 
                : "text-slate-400"
            )}
            style={mobileOpen || ["/dashboard/follow-ups", "/dashboard/billing", "/dashboard/analytics", "/dashboard/settings"].some(p => pathname.startsWith(p)) ? { color: themeColor } : {}}
            aria-label="More"
          >
            {(mobileOpen || ["/dashboard/follow-ups", "/dashboard/billing", "/dashboard/analytics", "/dashboard/settings"].some(p => pathname.startsWith(p))) && (
              <motion.div
                layoutId="bottom-nav-active"
                className="absolute inset-x-2 top-2 bottom-2 rounded-xl"
                style={{ backgroundColor: themeColor, opacity: 0.08 }}
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
            <Menu strokeWidth={1.5} className="w-5 h-5" />
            <span className="text-[10px] font-semibold tracking-tight">More</span>
          </button>
        </div>
      </div>

      {/* ─── DESKTOP: Fixed Sidebar ──────────────────────────────── */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-white border-r border-slate-200 z-10 shadow-sm">
        {renderSidebarContent("desktop")}
      </div>

      {/* ─── LOGOUT CONFIRMATION MODAL ──────────────────────────── */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
              onClick={() => setShowLogoutModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-x-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm z-[60]"
            >
              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-slate-300 to-slate-400" />
                <div className="p-6">
                  <div className="mb-4 flex justify-center">
                    <PremiumIcon Icon={AlertTriangle} variant="destructive" size="xl" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 text-center mb-2">
                    Sign out?
                  </h2>
                  <p className="text-sm text-slate-500 text-center mb-6">
                    You&apos;ll need to sign back in to access your dashboard.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 rounded-xl border-slate-200 font-medium"
                      onClick={() => setShowLogoutModal(false)}
                    >
                      Stay
                    </Button>
                    <Button
                      className="flex-1 h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm"
                      onClick={handleLogout}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Sign Out"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
