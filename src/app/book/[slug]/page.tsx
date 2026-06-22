import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BookingClient } from "./booking-client";
import { MapPin, Info } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clinicResult = await db
    .select()
    .from(clinics)
    .where(eq(clinics.slug, slug))
    .limit(1);

  if (!clinicResult.length) return { title: "Not Found" };

  const clinic = clinicResult[0];
  return {
    title: `Book Appointment | ${clinic.name}`,
    description: `Book a consultation with Dr. ${clinic.doctorName} at ${clinic.name}.`,
  };
}

export default async function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
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
      <div className="mb-10 text-center">
        <div 
          className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl shadow-md flex items-center justify-center text-white text-3xl font-bold mb-4"
          style={{ backgroundColor: clinic.themeColor ?? "#0ea5e9" }}
        >
          {clinic.name[0]?.toUpperCase()}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{clinic.name}</h1>
        <p className="text-slate-600 font-medium text-base sm:text-lg mt-1">Dr. {clinic.doctorName}</p>
        <p className="text-slate-500 text-sm">{clinic.specialty}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-4">
          <div className="flex items-center gap-1.5 text-slate-500 text-sm">
            <Info className="w-4 h-4" />
            <span>Fee: ₹{clinic.consultationFee}</span>
          </div>
          {clinic.address && (
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{clinic.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Booking Widget */}
      <BookingClient clinic={clinic} />
    </div>
  );
}
