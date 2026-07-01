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
  const clinicResult = await db
    .select()
    .from(clinics)
    .where(eq(clinics.slug, slug))
    .limit(1);

  if (!clinicResult.length) {
    notFound();
  }

  const clinic = clinicResult[0];
  const themeColor = clinic.themeColor ?? "#0ea5e9";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #e8f0fe 100%)",
      }}
    >
      {/* Thin brand accent bar */}
      <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: themeColor }} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 pb-safe flex-shrink-0 border-t border-slate-100/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} {clinic.name}. All rights reserved.
          </p>
          <p className="text-slate-400 text-xs flex items-center gap-1.5">
            Powered by{" "}
            <Link
              href="/"
              className="font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Clinic Diary
            </Link>
            {" "}— Your clinic, online.
          </p>
        </div>
      </footer>
    </div>
  );
}
