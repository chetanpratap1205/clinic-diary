import type { ReactNode } from "react";
import type { Metadata } from "next";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone } from "lucide-react";
import { ClinicLogo } from "./clinic-logo";

import { PatientHeaderActions } from "@/components/patient-header-actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let [clinic] = await db
    .select({
      name: clinics.name,
      themeColor: clinics.themeColor,
      logoUrl: clinics.logoUrl,
    })
    .from(clinics)
    .where(eq(clinics.slug, slug))
    .limit(1);

  if (!clinic) {
    const { doctorLeads } = await import("@/db/schema");
    const [lead] = await db
      .select({
        name: doctorLeads.clinicName,
        doctorName: doctorLeads.doctorName,
        logoUrl: doctorLeads.logoUrl,
      })
      .from(doctorLeads)
      .where(eq(doctorLeads.clinicSlug, slug))
      .limit(1);

    if (lead) {
      clinic = {
        name: lead.name || `${lead.doctorName}'s Clinic`,
        themeColor: "#0d9488",
        logoUrl: lead.logoUrl || null,
      };
    }
  }

  const appName = clinic?.name || "Doctor Diary Clinic";

  return {
    manifest: `/api/manifest/${slug}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: appName,
    },
    icons: {
      icon: [
        { url: `/api/manifest/${slug}/icon?size=192`, sizes: "192x192" },
        { url: `/api/manifest/${slug}/icon?size=512`, sizes: "512x512" },
      ],
      apple: [
        {
          url: "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
  };
}

export default async function BookingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  if (!clinic) {
    const { doctorLeads } = await import("@/db/schema");
    const [lead] = await db.select().from(doctorLeads).where(eq(doctorLeads.clinicSlug, slug)).limit(1);
    if (!lead) notFound();
    
    // Create a minimal mock clinic for layout
    clinic = {
      id: lead.id,
      slug: lead.clinicSlug || slug,
      name: lead.clinicName || `${lead.doctorName}'s Clinic`,
      doctorName: lead.doctorName,
      logoUrl: lead.logoUrl || null,
      themeColor: "#0d9488",
      phone: lead.phone,
    } as any;
  }

  const themeColor = clinic.themeColor ?? "#0ea5e9";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ minHeight: "100dvh" }}>
      {/* 3px brand accent at very top */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ backgroundColor: themeColor }} />

      {/* Single Sticky Header — logo + name + PWA Install + call CTA */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex-shrink-0 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
            <div className="w-8 h-8 rounded-lg shadow-2xs overflow-hidden flex-shrink-0 bg-white ring-1 ring-slate-900/5">
              <ClinicLogo logoUrl={clinic.logoUrl} clinicName={clinic.name} themeColor={themeColor} variant="widget" />
            </div>
            <p className="text-xs sm:text-sm font-black text-slate-900 tracking-tight line-clamp-1 truncate">{clinic.name}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <PatientHeaderActions themeColor={themeColor} clinicName={clinic.name} />
            {clinic.phone && (
              <a
                href={`tel:+91${clinic.phone.replace(/\D/g, "").slice(-10)}`}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-1.5 rounded-full transition-all hover:opacity-90 active:scale-95 shadow-xs"
                style={{ backgroundColor: themeColor }}
              >
                <Phone className="w-3 h-3" />
                Call Clinic
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
