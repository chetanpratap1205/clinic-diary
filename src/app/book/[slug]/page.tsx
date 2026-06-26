import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BookingClient } from "./booking-client";
import { MapPin, Info, Phone, Star, ShieldCheck, Clock } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const clinicResult = await db
    .select()
    .from(clinics)
    .where(eq(clinics.slug, slug))
    .limit(1);

  if (!clinicResult.length) return { title: "Not Found" };

  const clinic = clinicResult[0];
  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

  const ogParams = new URLSearchParams({
    name: clinic.name,
    doctor: clinic.doctorName,
    specialty: clinic.specialty || "",
    fee: String(clinic.consultationFee ?? ""),
  });

  const ogImageUrl = `${BASE_URL}/api/og?${ogParams.toString()}`;

  return {
    title: `Book Appointment | ${clinic.name}`,
    description: `Book a consultation with Dr. ${clinic.doctorName} at ${clinic.name}. Online appointments available. No signup required.`,
    openGraph: {
      title: `Book with Dr. ${clinic.doctorName} — ${clinic.name}`,
      description: `Fast, easy online appointment booking at ${clinic.name}. No signup required.`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `Book appointment at ${clinic.name}` }],
      url: `${BASE_URL}/book/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Book with Dr. ${clinic.doctorName} — ${clinic.name}`,
      description: `Fast, easy online appointment booking. No signup required.`,
      images: [ogImageUrl],
    },
  };
}

export default async function BookingPage({
  params,
}: {
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
    <div className="w-full flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-16">
      {/* Left Column: Clinic Profile (Enterprise Layout) */}
      <div className="lg:col-span-5 flex flex-col space-y-8">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl shadow-lg flex items-center justify-center text-white text-3xl font-bold bg-center bg-cover bg-no-repeat overflow-hidden relative"
              style={{ 
                backgroundColor: themeColor,
                backgroundImage: clinic.logoUrl ? `url(${clinic.logoUrl})` : "none"
              }}
            >
              {!clinic.logoUrl && clinic.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {clinic.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm font-semibold">
                  Dr. {clinic.doctorName}
                </Badge>
                {clinic.specialty && (
                  <span className="text-slate-500 text-sm font-medium">
                    &bull; {clinic.specialty}
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-6">
            {clinic.about || `Welcome to ${clinic.name}. We provide exceptional healthcare services tailored to your needs. Book your consultation instantly online.`}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${themeColor}15` }}>
                <Info className="w-5 h-5" style={{ color: themeColor }} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Fee</p>
                <p className="font-semibold text-slate-900">₹{clinic.consultationFee}</p>
              </div>
            </div>
            
            {clinic.phone && (
              <a href={`tel:${clinic.phone}`} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-start gap-3 hover:border-slate-200 transition-colors group">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                  <Phone className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Contact</p>
                  <p className="font-semibold text-slate-900">{clinic.phone}</p>
                </div>
              </a>
            )}
          </div>
        </div>

        {clinic.address && (
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Clinic Location</p>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">{clinic.address}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: themeColor }} />
          <div className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full opacity-10" style={{ backgroundColor: themeColor }} />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-yellow-400">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
            </div>
            <p className="text-lg font-medium leading-relaxed">
              "Booking was completely seamless. I didn't have to wait on the phone, and the reminder system was super helpful."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-300">
                P
              </div>
              <div>
                <p className="font-semibold text-sm">Verified Patient</p>
                <p className="text-xs text-slate-400">Recent Visit</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 justify-center lg:justify-start pt-4 text-slate-400">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" /> Secure Booking
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="w-4 h-4" /> 24/7 Availability
          </div>
        </div>
      </div>

      {/* Right Column: Booking Widget */}
      <div className="lg:col-span-7">
        <BookingClient clinic={clinic} />
      </div>
    </div>
  );
}
