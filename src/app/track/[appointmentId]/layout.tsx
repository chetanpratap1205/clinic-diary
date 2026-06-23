import type { ReactNode } from "react";
import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function TrackingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  
  // Quick validation to get the theme color safely
  let themeColor = "#0ea5e9";
  try {
    const appt = await db
      .select({ clinicId: appointments.clinicId })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (appt.length > 0) {
      const clinic = await db
        .select({ themeColor: clinics.themeColor })
        .from(clinics)
        .where(eq(clinics.id, appt[0].clinicId))
        .limit(1);
      
      if (clinic.length > 0 && clinic[0].themeColor) {
        themeColor = clinic[0].themeColor;
      }
    }
  } catch (e) {
    // If invalid UUID, ignore here, page will handle it
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ minHeight: '100dvh' }}>
      <div 
        className="h-1.5 w-full flex-shrink-0" 
        style={{ backgroundColor: themeColor }} 
      />
      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="py-5 pb-safe text-center text-slate-400 text-xs flex-shrink-0">
        Powered by <span className="font-semibold text-slate-500">Doctor Diary</span>
      </footer>
    </div>
  );
}
