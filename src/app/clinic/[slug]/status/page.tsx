import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TrackWidget } from "@/app/clinic/[slug]/track-widget";
import Link from "next/link";
import { ChevronLeft, Search, Activity, HeartPulse } from "lucide-react";
import type { Metadata } from "next";
import { DICTIONARY, Language } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  if (!clinic) {
    const { doctorLeads } = await import("@/db/schema");
    const [lead] = await db.select().from(doctorLeads).where(eq(doctorLeads.clinicSlug, slug)).limit(1);
    if (!lead) return { title: "Not Found" };
    clinic = { name: lead.clinicName || `${lead.doctorName}'s Clinic` } as any;
  }

  return {
    title: `Check Status | ${clinic.name}`,
    description: `Check your live queue status at ${clinic.name}.`,
    manifest: `/api/manifest/${slug}`,
  };
}

export default async function StatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const lang = (resolvedSearchParams.lang as Language) || "en";
  const t = DICTIONARY[lang];
  let [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  if (!clinic) {
    const { doctorLeads } = await import("@/db/schema");
    const [lead] = await db.select().from(doctorLeads).where(eq(doctorLeads.clinicSlug, slug)).limit(1);
    if (!lead) notFound();
    
    // Create a minimal mock clinic
    clinic = {
      id: lead.id,
      slug: lead.clinicSlug || slug,
      name: lead.clinicName || `${lead.doctorName}'s Clinic`,
      doctorName: lead.doctorName,
      logoUrl: lead.logoUrl || null,
      themeColor: "#0ea5e9",
    } as any;
  }

  const themeColor = clinic.themeColor ?? "#0ea5e9";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      {/* Back Link */}
      <div className="w-full max-w-md mb-8">
        <Link 
          href={`/clinic/${slug}?lang=${lang}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> {t.backToBooking}
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
        <div className="h-2 w-full absolute top-0 left-0" style={{ backgroundColor: themeColor }} />
        
        <div className="p-6 sm:p-8 pt-10 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-slate-50" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
            <Activity className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 mb-2">{t.checkYourTurn}</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            {t.enterMobileToTrack(clinic.name)}
          </p>

          <TrackWidget clinicId={clinic.id} themeColor={themeColor} slug={slug} lang={lang} />
        </div>
        
        {/* Footer info */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 text-center flex flex-col items-center justify-center gap-2">
           <HeartPulse className="w-4 h-4 text-emerald-500" />
           <p className="text-[11px] text-slate-400 font-medium">{t.dataSafe}</p>
        </div>
      </div>
    </div>
  );
}
