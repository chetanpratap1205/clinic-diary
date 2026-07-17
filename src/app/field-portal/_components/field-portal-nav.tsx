"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstallPwaButton } from "./install-pwa-button";

const portalNavItems = [
  { href: "/field-portal", label: "Home", icon: Home, exact: true },
  { href: "/field-portal/leads", label: "My Leads", icon: Users },
  { href: "/field-portal/leads/new", label: "Add Lead", icon: PlusCircle },
];

export function FieldPortalNav({
  orientation = "vertical",
}: {
  orientation?: "horizontal" | "vertical";
}) {
  const pathname = usePathname();

  if (orientation === "horizontal") {
    return (
      <div className="flex items-center justify-around w-full">
        {portalNavItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 w-full max-w-[80px] rounded-xl transition-colors",
                isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn("w-6 h-6", isActive ? "fill-blue-50" : "")}
              />
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
        <InstallPwaButton isHorizontal={true} />
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-2 px-3">
      {portalNavItems.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer font-medium text-sm group",
                isActive
                  ? "bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 flex-shrink-0 transition-colors",
                  isActive
                    ? "text-blue-600"
                    : "text-slate-400 group-hover:text-slate-600"
                )}
              />
              <span className="flex-1">{item.label}</span>
            </span>
          </Link>
        );
      })}
      <InstallPwaButton />
    </nav>
  );
}
