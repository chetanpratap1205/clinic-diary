"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { AdminNav } from "./admin-nav";

export function AdminMobileNav({
  userEmail,
}: {
  userEmail: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={
        <Button variant="ghost" size="icon" className="lg:hidden shrink-0 text-slate-500 hover:text-slate-900" />
      }>
        <Menu className="w-5 h-5" />
        <span className="sr-only">Toggle navigation menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 flex flex-col bg-white border-r-slate-200">
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

        <AdminNav onNavClick={() => setOpen(false)} />

        <div className="p-4 border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs uppercase flex-shrink-0">
              {userEmail.substring(0, 2) || "AD"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userEmail}
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
      </SheetContent>
    </Sheet>
  );
}
