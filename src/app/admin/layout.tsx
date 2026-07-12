import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ReactNode } from "react";
import Image from "next/image";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminIds = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim());
  if (!adminIds.includes(user.id)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white px-4 py-3 flex items-center gap-3 shadow-sm relative z-10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-teal-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="Doctor Diary" className="w-full h-full object-cover" />
        </div>
        <span className="font-bold text-slate-800 text-sm">ClinicDiary Admin</span>
        <span className="ml-auto text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-md">{user.email}</span>
      </div>
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
