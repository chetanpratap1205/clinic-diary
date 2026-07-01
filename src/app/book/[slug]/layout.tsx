import type { ReactNode } from "react";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function BookingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  if (!clinic) notFound();

  const themeColor = clinic.themeColor ?? "#0ea5e9";

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ minHeight: "100dvh" }}>
      {/* 3px brand accent — thin and tasteful */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ backgroundColor: themeColor }} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 overflow-hidden">
        {children}
      </main>

      <footer className="border-t border-slate-100 py-6 pb-safe flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-400 text-xs">© {new Date().getFullYear()} {clinic.name}</p>
          <p className="text-slate-400 text-xs">
            Powered by{" "}
            <Link href="/" className="font-semibold text-slate-500 hover:text-slate-700 transition-colors">
              Clinic Diary
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
