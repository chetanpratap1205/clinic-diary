"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  QrCode,
  ScrollText,
  BarChart3,
  Star,
  CalendarClock,
  Package,
  Users,
  Briefcase,
} from "lucide-react";

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/finance", label: "Finance & MRR", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/admin/leads", label: "Leads CRM", icon: Users },
      { href: "/admin/partners", label: "Growth Partners", icon: Briefcase },
      { href: "/admin/clinics", label: "Clinics", icon: Building2 },
      { href: "/admin/billing", label: "Billing", icon: CreditCard },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/follow-ups", label: "Follow-Ups", icon: CalendarClock },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/qr", label: "QR Codes", icon: QrCode },
      { href: "/admin/orders", label: "Orders", icon: Package },
      { href: "/admin/logs", label: "System Logs", icon: ScrollText },
    ],
  },
];

export interface AdminNavProps {
  onNavClick?: () => void;
}

export function AdminNav({ onNavClick }: AdminNavProps = {}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 py-3 px-3 overflow-y-auto space-y-4">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 select-none">
            {section.label}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} onClick={onNavClick}>
                  <span
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer font-medium text-sm group ${
                      isActive
                        ? "bg-teal-50 text-teal-700 border border-teal-100/80 shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive
                          ? "text-teal-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
