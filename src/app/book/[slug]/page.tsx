import { db } from "@/db";
import { clinics, availability, availabilityOverrides } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BookingClient } from "./booking-client";
import {
  MapPin,
  Phone,
  ShieldCheck,
  Clock,
  Star,
  Stethoscope,
  CalendarDays,
  BadgeCheck,
  Navigation,
} from "lucide-react";
import type { Metadata } from "next";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

function formatTimeDisplay(time: string): string {
  if (!time) return "";
  const t = time.slice(0, 5);
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function isValidEmbedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      (u.hostname.includes("google.com") || u.hostname.includes("maps.google")) &&
      (u.pathname.includes("/maps/embed") || u.searchParams.has("pb"))
    );
  } catch {
    return false;
  }
}

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

  const displayDoctorName = clinic.doctorName?.trim().startsWith("Dr.")
    ? clinic.doctorName
    : `Dr. ${clinic.doctorName || "Doctor Name"}`;

  return {
    title: `${clinic.name} | Book Appointment Online`,
    description: `Book an appointment with ${displayDoctorName}${clinic.specialty ? `, ${clinic.specialty}` : ""} at ${clinic.name}.${clinic.address ? ` Located at ${clinic.address}.` : ""} Online appointments — no signup required.`,
    openGraph: {
      title: `${clinic.name} — ${displayDoctorName}`,
      description: `Book your consultation with ${displayDoctorName}. Fast, easy online appointment booking. No signup required.`,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `Book appointment at ${clinic.name}` }],
      url: `${BASE_URL}/book/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${clinic.name} — Book Online`,
      description: `Consult ${displayDoctorName}. No signup required.`,
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

  const displayDoctorName = clinic.doctorName?.trim().startsWith("Dr.")
    ? clinic.doctorName
    : `Dr. ${clinic.doctorName || "Doctor Name"}`;

  const BASE_URL =
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

  const [availRecords, overrideRecords] = await Promise.all([
    db.select().from(availability).where(eq(availability.clinicId, clinic.id)),
    db
      .select()
      .from(availabilityOverrides)
      .where(eq(availabilityOverrides.clinicId, clinic.id)),
  ]);

  const workingDays = Array.from(new Set(availRecords.map((a) => a.dayOfWeek)));
  const closedDates = Array.from(
    new Set(
      overrideRecords
        .filter((o) => o.isClosed)
        .map((o) => o.date as string)
    )
  );

  // Build working hours display grouped by schedule
  const scheduleByDay = availRecords
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((a) => ({
      day: FULL_DAY_NAMES[a.dayOfWeek],
      short: DAY_NAMES[a.dayOfWeek],
      start: formatTimeDisplay(a.startTime),
      end: formatTimeDisplay(a.endTime),
    }));

  const hasGoogleEmbed =
    clinic.googleMapsUrl && isValidEmbedUrl(clinic.googleMapsUrl);

  const directionsUrl = clinic.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`
    : null;

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "Physician"],
    name: clinic.name,
    description:
      clinic.about ||
      `${displayDoctorName}${clinic.specialty ? ` — ${clinic.specialty}` : ""}. Book appointments online.`,
    url: `${BASE_URL}/book/${slug}`,
    telephone: clinic.phone || undefined,
    ...(clinic.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: clinic.address,
      },
    }),
    ...(clinic.specialty && { medicalSpecialty: clinic.specialty }),
    ...(clinic.consultationFee && {
      priceRange: `₹${clinic.consultationFee}`,
    }),
    ...(clinic.logoUrl && { image: clinic.logoUrl }),
    ...(workingDays.length > 0 && {
      openingHours: availRecords.map(
        (a) =>
          `${DAY_NAMES[a.dayOfWeek]} ${a.startTime.slice(0, 5)}-${a.endTime.slice(0, 5)}`
      ),
    }),
  };

  return (
    <>
      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full space-y-0">

        {/* ── HERO SECTION ─────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl mb-8 sm:mb-12" style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 60%, ${themeColor}88 100%)` }}>
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ backgroundColor: "#fff" }} />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-2xl" style={{ backgroundColor: "#fff" }} />

          <div className="relative z-10 px-6 py-10 sm:py-14 sm:px-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            {/* Avatar / Logo */}
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-2xl border-4 border-white/30 flex items-center justify-center text-white text-3xl sm:text-4xl font-black flex-shrink-0 overflow-hidden bg-center bg-cover bg-no-repeat"
              style={{
                backgroundColor: `${themeColor}88`,
                backgroundImage: clinic.logoUrl ? `url(${clinic.logoUrl})` : "none",
              }}
            >
              {!clinic.logoUrl && (clinic.name?.[0]?.toUpperCase() || "C")}
            </div>

            {/* Clinic Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white/90 text-xs font-bold tracking-wider uppercase mb-3">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified Clinic
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-1">
                {clinic.name}
              </h1>
              <p className="text-white/80 font-bold text-lg sm:text-xl mb-1">{displayDoctorName}</p>
              {clinic.specialty && (
                <p className="text-white/70 font-medium text-base mb-4">
                  <Stethoscope className="w-4 h-4 inline mr-1.5 opacity-80" />
                  {clinic.specialty}
                </p>
              )}

              {/* Quick Info Pills */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-4">
                {clinic.consultationFee ? (
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                    ₹{clinic.consultationFee} Consultation
                  </span>
                ) : null}
                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-bold px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Now
                  </a>
                )}
                {directionsUrl && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-bold px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Directions
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT GRID ───────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT: Clinic Info */}
          <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">

            {/* About */}
            {clinic.about && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: themeColor }} />
                  About
                </h2>
                <p className="text-slate-600 leading-relaxed text-base">
                  {clinic.about}
                </p>
              </section>
            )}

            {/* Trust Signals */}
            <section className="grid grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Secure", sub: "Booking" },
                { icon: Star, label: "Instant", sub: "Confirmation" },
                { icon: CalendarDays, label: "No Signup", sub: "Required" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white/80 backdrop-blur-md rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
                  <Icon className="w-5 h-5 mx-auto mb-1.5" style={{ color: themeColor }} />
                  <p className="text-xs font-black text-slate-800 leading-tight">{label}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
                </div>
              ))}
            </section>

            {/* Contact & Location */}
            {(clinic.phone || clinic.address) && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: themeColor }} />
                  Contact & Location
                </h2>
                <div className="space-y-3">
                  {clinic.phone && (
                    <a
                      href={`tel:${clinic.phone}`}
                      className="flex items-center gap-3 bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-slate-200 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 group-hover:scale-110 transition-transform" style={{ color: themeColor }}>
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone</p>
                        <p className="font-bold text-slate-900 text-sm">{clinic.phone}</p>
                      </div>
                    </a>
                  )}
                  {clinic.address && (
                    <div className="flex items-start gap-3 bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-50 mt-0.5" style={{ color: themeColor }}>
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Address</p>
                        <p className="font-semibold text-slate-900 text-sm leading-relaxed mt-0.5">{clinic.address}</p>
                        {directionsUrl && (
                          <a
                            href={directionsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold mt-2 hover:underline"
                            style={{ color: themeColor }}
                          >
                            <Navigation className="w-3 h-3" /> Get Directions
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Google Maps Embed */}
            {hasGoogleEmbed && (
              <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
                <iframe
                  src={clinic.googleMapsUrl!}
                  width="100%"
                  height="260"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${clinic.name} location map`}
                />
              </div>
            )}

            {/* Working Hours */}
            {scheduleByDay.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: themeColor }} />
                  Working Hours
                </h2>
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {FULL_DAY_NAMES.map((dayName, dayIndex) => {
                    const rec = availRecords.find((a) => a.dayOfWeek === dayIndex);
                    const isOpen = !!rec;
                    return (
                      <div
                        key={dayName}
                        className={`flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0 ${!isOpen ? "opacity-40" : ""}`}
                      >
                        <span className={`text-sm font-semibold ${isOpen ? "text-slate-800" : "text-slate-400"}`}>
                          {dayName}
                        </span>
                        {isOpen && rec ? (
                          <span className="text-sm text-slate-600 font-medium">
                            {formatTimeDisplay(rec.startTime)} – {formatTimeDisplay(rec.endTime)}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Closed</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT: Booking Widget */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="lg:sticky lg:top-8">
              <BookingClient
                clinic={clinic}
                workingDays={workingDays}
                closedDates={closedDates}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
