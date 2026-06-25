import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BookingClient } from "./booking-client";
import { MapPin, Info, Phone } from "lucide-react";
import type { Metadata } from "next";

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

  return (
    <div className="w-full">
      {/* Clinic Header Profile */}
      <div className="mb-8 sm:mb-10 text-center">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl sm:rounded-3xl shadow-md flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-4"
          style={{ backgroundColor: clinic.themeColor ?? "#0ea5e9" }}
        >
          {clinic.name[0]?.toUpperCase()}
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          {clinic.name}
        </h1>
        <p className="text-slate-600 font-medium text-sm sm:text-base mt-1">
          Dr. {clinic.doctorName}
        </p>
        {clinic.specialty && (
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            {clinic.specialty}
          </p>
        )}

        {/* Clinic Info Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4">
          <div className="flex items-center gap-1.5 bg-slate-100/80 text-slate-600 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>₹{clinic.consultationFee} fee</span>
          </div>
          {clinic.address && (
            <div className="flex items-center gap-1.5 bg-slate-100/80 text-slate-600 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full max-w-[200px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{clinic.address}</span>
            </div>
          )}
          {clinic.phone && (
            <a
              href={`tel:${clinic.phone}`}
              className="flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{clinic.phone}</span>
            </a>
          )}
        </div>
      </div>

      {/* Booking Widget */}
      <BookingClient clinic={clinic} />
    </div>
  );
}
