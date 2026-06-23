import type { ReactNode } from "react";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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

  return (
    <div
      className="min-h-screen bg-slate-50 flex flex-col"
      style={{ minHeight: "100dvh" }}
    >
      {/* Clinic brand top bar */}
      <div
        className="h-1.5 w-full flex-shrink-0"
        style={{ backgroundColor: clinic.themeColor ?? "#0ea5e9" }}
      />

      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        {children}
      </main>

      {/* Minimal Footer with safe area padding */}
      <footer className="py-5 pb-safe text-center text-slate-400 text-xs flex-shrink-0">
        Powered by{" "}
        <span className="font-semibold text-slate-500">Doctor Diary</span>
      </footer>
    </div>
  );
}
