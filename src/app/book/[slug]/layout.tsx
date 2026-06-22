import type { ReactNode } from "react";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Accent Header Bar */}
      <div 
        className="h-2 w-full" 
        style={{ backgroundColor: clinic.themeColor ?? "#0ea5e9" }} 
      />
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      
      {/* Minimal Footer */}
      <footer className="py-6 text-center text-slate-400 text-xs">
        Powered by Nature Express
      </footer>
    </div>
  );
}
