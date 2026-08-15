import type { ReactNode } from "react";
import type { Metadata } from "next";
import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}): Promise<Metadata> {
  const { appointmentId } = await params;

  if (appointmentId.startsWith("demo-")) {
    const slug = appointmentId.replace("demo-", "");
    return {
      manifest: `/api/manifest/${slug}`,
    };
  }

  try {
    const [result] = await db
      .select({
        clinicSlug: clinics.slug,
      })
      .from(appointments)
      .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (result?.clinicSlug) {
      return {
        manifest: `/api/manifest/${result.clinicSlug}`,
      };
    }
  } catch {
    // If invalid UUID or DB error, fall back gracefully
  }

  return {};
}

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
    if (appointmentId.startsWith("demo-")) {
      themeColor = "#0ea5e9";
    } else {
      const [result] = await db
        .select({ themeColor: clinics.themeColor })
        .from(appointments)
        .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (result?.themeColor) {
        themeColor = result.themeColor;
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
      <footer className="py-6 pb-safe text-center flex flex-col items-center justify-center space-y-1.5 flex-shrink-0">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">Technology Partner</p>
        <p className="text-sm font-semibold text-slate-400">
          Powered by <span className="font-black text-slate-700">Doctor Diary</span>
        </p>
      </footer>
    </div>
  );
}
