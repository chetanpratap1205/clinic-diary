import { db } from "@/db";
import { clinics, availability, availabilityOverrides, reviews, appointments } from "@/db/schema";
import { eq, desc, avg, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BookingClient } from "./booking-client";
import { ClinicLogo } from "./clinic-logo";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Star,
  BadgeCheck,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const FULL_DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTimeDisplay(time: string): string {
  if (!time) return "";
  const t = time.slice(0, 5);
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/** Only pass logo to <img> if it's a direct image URL — prevents webpage thumbnails */
function isSafeImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(png|jpg|jpeg|webp|gif|svg|avif)(\?.*)?$/i.test(url.trim());
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  if (!clinic) return { title: "Not Found" };

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";
  const displayDoctorName = clinic.doctorName?.trim().startsWith("Dr.")
    ? clinic.doctorName
    : `Dr. ${clinic.doctorName}`;

  const ogParams = new URLSearchParams({
    name: clinic.name,
    doctor: clinic.doctorName,
    specialty: clinic.specialty || "",
    fee: String(clinic.consultationFee ?? ""),
  });

  return {
    title: `${clinic.name} — Book Appointment Online`,
    description: `Book a consultation with ${displayDoctorName}${clinic.specialty ? `, ${clinic.specialty}` : ""} at ${clinic.name}.${clinic.address ? ` Based in ${clinic.address}.` : ""} Instant confirmation. No signup required.`,
    openGraph: {
      title: `${clinic.name} — ${displayDoctorName}`,
      description: `Book your consultation online. Instant confirmation, no signup required.`,
      images: [{ url: `${BASE_URL}/api/og?${ogParams}`, width: 1200, height: 630 }],
      url: `${BASE_URL}/book/${slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${clinic.name} — Book Online`,
      description: `Consult ${displayDoctorName}. No signup required.`,
      images: [`${BASE_URL}/api/og?${ogParams}`],
    },
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  if (!clinic) notFound();

  const themeColor = clinic.themeColor ?? "#0ea5e9";
  const displayDoctorName = clinic.doctorName?.trim().startsWith("Dr.")
    ? clinic.doctorName
    : `Dr. ${clinic.doctorName}`;
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

  const [availRecords, overrideRecords, clinicReviews, statsResult] = await Promise.all([
    db.select().from(availability).where(eq(availability.clinicId, clinic.id)),
    db.select().from(availabilityOverrides).where(eq(availabilityOverrides.clinicId, clinic.id)),
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        patientName: appointments.patientName,
      })
      .from(reviews)
      .innerJoin(appointments, eq(reviews.appointmentId, appointments.id))
      .where(eq(reviews.clinicId, clinic.id))
      .orderBy(desc(reviews.createdAt))
      .limit(5),
    db
      .select({
        averageRating: avg(reviews.rating),
        totalReviews: count(reviews.id),
      })
      .from(reviews)
      .where(eq(reviews.clinicId, clinic.id)),
  ]);

  const stats = statsResult[0];
  const averageRating = stats?.averageRating ? Number(stats.averageRating).toFixed(1) : "0";
  const totalReviews = stats?.totalReviews || 0;

  const workingDays = [...new Set(availRecords.map((a) => a.dayOfWeek))];
  const closedDates = [...new Set(overrideRecords.filter((o) => o.isClosed).map((o) => o.date as string))];

  // Map: always use address text for accuracy
  const mapEmbedUrl = clinic.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(clinic.address)}&output=embed&hl=en&z=15`
    : null;
  const directionsUrl = clinic.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`
    : null;

  // Safe logo: only a direct image file URL, never a webpage URL
  const safeLogoUrl = isSafeImageUrl(clinic.logoUrl) ? clinic.logoUrl : null;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "Physician"],
    name: clinic.name,
    description: clinic.about || `${displayDoctorName} — ${clinic.specialty || "Medical Clinic"}. Book appointments online.`,
    url: `${BASE_URL}/book/${slug}`,
    ...(clinic.phone && { telephone: clinic.phone }),
    ...(clinic.address && { address: { "@type": "PostalAddress", streetAddress: clinic.address } }),
    ...(clinic.specialty && { medicalSpecialty: clinic.specialty }),
    ...(clinic.consultationFee && { priceRange: `₹${clinic.consultationFee}` }),
    ...(safeLogoUrl && { image: safeLogoUrl }),
    ...(workingDays.length > 0 && {
      openingHours: availRecords.map((a) => `${DAY_NAMES[a.dayOfWeek]} ${a.startTime.slice(0, 5)}-${a.endTime.slice(0, 5)}`),
    }),
  };

  const today = new Date().getDay();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ─────────────── HERO ─────────────── */}
      <header
        className="relative overflow-hidden mb-10 sm:mb-14"
        style={{
          background: `linear-gradient(150deg, ${themeColor} 0%, ${themeColor}ee 40%, ${themeColor}bb 100%)`,
        }}
      >
        {/* Mesh texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow blob */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20 blur-3xl bg-white pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full opacity-15 blur-2xl bg-white pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
            {/* Circular logo — clinical, professional */}
            <div className="flex-shrink-0">
              <ClinicLogo
                logoUrl={safeLogoUrl}
                clinicName={clinic.name}
                themeColor={themeColor}
                variant="hero"
              />
            </div>

            {/* Identity */}
            <div className="flex-1 text-center sm:text-left">
              {/* Verified badge */}
              <div className="inline-flex items-center gap-1.5 text-white/80 text-xs font-bold tracking-widest uppercase mb-3">
                <BadgeCheck className="w-3.5 h-3.5 text-white" />
                Verified Clinic
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none mb-2">
                {clinic.name}
              </h1>
              <p className="text-white/90 font-semibold text-xl sm:text-2xl mb-1">
                {displayDoctorName}
              </p>
              {clinic.specialty && (
                <p className="text-white/65 text-base font-medium mb-5">
                  {clinic.specialty}
                </p>
              )}

              {/* Action pills */}
              <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                {clinic.consultationFee ? (
                  <span className="text-sm font-black text-white bg-white/15 border border-white/25 px-4 py-2 rounded-full backdrop-blur-sm">
                    ₹{clinic.consultationFee} &nbsp;·&nbsp; Consultation Fee
                  </span>
                ) : null}
                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/15 border border-white/25 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/25 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    {clinic.phone}
                  </a>
                )}
                {directionsUrl && clinic.address && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-white bg-white/15 border border-white/25 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/25 transition-all"
                  >
                    <MapPin className="w-4 h-4" />
                    {clinic.address}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────── CONTENT GRID ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

        {/* LEFT: Clinic Information — order 2 on mobile (booking first) */}
        <aside className="lg:col-span-4 xl:col-span-5 order-2 lg:order-1 space-y-8">

          {/* About */}
          {clinic.about && (
            <section>
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">About</h2>
              <p className="text-slate-700 leading-relaxed text-[15px]">
                {clinic.about}
              </p>
            </section>
          )}

          {/* Contact */}
          {(clinic.phone || clinic.address) && (
            <section>
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Contact</h2>
              <div className="rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50 bg-white shadow-sm">
                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                    >
                      <Phone className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Call</p>
                      <p className="font-semibold text-slate-900 text-sm">{clinic.phone}</p>
                    </div>
                    <span className="ml-auto text-slate-300 group-hover:text-slate-400 text-xs font-bold">→</span>
                  </a>
                )}
                {clinic.address && (
                  <div className="flex items-start gap-4 px-5 py-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                    >
                      <MapPin className="w-[18px] h-[18px]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Address</p>
                      <p className="font-semibold text-slate-900 text-sm leading-snug mt-0.5">{clinic.address}</p>
                      {directionsUrl && (
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold mt-2 transition-colors hover:opacity-70"
                          style={{ color: themeColor }}
                        >
                          <Navigation className="w-3 h-3" /> Open in Google Maps
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Map — generated from address, guaranteed correct */}
          {mapEmbedUrl && (
            <section>
              <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="220"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`${clinic.name} location`}
                />
              </div>
            </section>
          )}

          {/* Working Hours */}
          {availRecords.length > 0 && (
            <section>
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Working Hours</h2>
              <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
                {FULL_DAY_NAMES.map((name, idx) => {
                  const rec = availRecords.find((a) => a.dayOfWeek === idx);
                  const isOpen = !!rec;
                  const isToday = idx === today;
                  return (
                    <div
                      key={name}
                      className={`flex items-center justify-between px-5 py-3 text-sm border-b border-slate-50 last:border-0 ${
                        isToday ? "bg-slate-50/60" : ""
                      }`}
                    >
                      <span className={`font-semibold ${isOpen ? "text-slate-800" : "text-slate-300"} flex items-center gap-2`}>
                        {isToday && isOpen && (
                          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: themeColor }} />
                        )}
                        {name}
                        {isToday && <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: themeColor }}>Today</span>}
                      </span>
                      {isOpen && rec ? (
                        <span className="text-slate-600 font-medium tabular-nums text-xs">
                          {formatTimeDisplay(rec.startTime)} – {formatTimeDisplay(rec.endTime)}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs font-semibold">Closed</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Reviews section — dynamic verified reviews */}
          <section>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i <= Math.round(Number(averageRating))
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-700 ml-1">Patient Reviews</span>
                </div>
                {totalReviews > 0 && (
                  <span className="text-xs font-bold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">
                    {averageRating} ({totalReviews})
                  </span>
                )}
              </div>

              {totalReviews === 0 ? (
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  We&apos;re collecting verified patient reviews. After your visit, you&apos;ll receive a link to share your experience.
                </p>
              ) : (
                <div className="space-y-4 mb-5 divide-y divide-slate-50">
                  {clinicReviews.map((review) => (
                    <div key={review.id} className="pt-4 first:pt-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700">{review.patientName.split(" ")[0]}</span>
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-0.5"><ShieldCheck className="w-3 h-3 text-emerald-500" /> Verified</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5 mb-2">
                         {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                      </div>
                      {review.comment && (
                        <p className="text-sm text-slate-600 leading-relaxed">
                          &quot;{review.comment}&quot;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(clinic.name + (clinic.address ? " " + clinic.address : ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold transition-colors hover:opacity-80 text-slate-500"
              >
                Search on Google →
              </a>
            </div>
          </section>
        </aside>

        {/* RIGHT: Booking Widget — order 1 on mobile */}
        <div className="lg:col-span-8 xl:col-span-7 order-1 lg:order-2">
          <div className="lg:sticky lg:top-8">
            {/* Widget header context */}
            <div className="mb-4 px-1">
              <p className="text-slate-500 text-sm font-medium">
                Book a consultation with <span className="font-bold text-slate-800">{displayDoctorName}</span>
                {clinic.specialty ? ` · ${clinic.specialty}` : ""}
              </p>
            </div>
            <BookingClient
              clinic={clinic}
              workingDays={workingDays}
              closedDates={closedDates}
            />
          </div>
        </div>
      </div>
    </>
  );
}
