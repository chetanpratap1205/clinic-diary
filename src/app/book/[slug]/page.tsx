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
  Stethoscope,
  CalendarCheck,
  CheckCircle2,
  Users,
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

  const directionsUrl = clinic.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`
    : null;

  // Map embed — use specific embed URL if provided, otherwise fallback to address text
  const mapEmbedUrl = clinic.googleMapsUrl
    ? clinic.googleMapsUrl
    : clinic.address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(clinic.address)}&output=embed&hl=en&z=15`
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

      {/* ─────────────── HERO BANNER ─────────────── */}
      <header className="relative overflow-hidden mb-8 sm:mb-12 -mx-4 sm:-mx-6 lg:-mx-8 bg-white border-b border-slate-100 pb-8 sm:pb-12 pt-10 sm:pt-14 shadow-sm">
        {/* Subtle dot mesh light */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        {/* Very subtle glow */}
        <div className="absolute top-0 -left-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-[120px] opacity-10 animate-blob" style={{ backgroundColor: themeColor }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-8">
            {/* Logo / Avatar with Pulse */}
            <div className="flex-shrink-0 relative">
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ backgroundColor: themeColor }} />
              <div className="relative shadow-2xl rounded-full border-[6px] border-white bg-white overflow-hidden">
                <ClinicLogo
                  logoUrl={safeLogoUrl}
                  clinicName={clinic.name}
                  themeColor={themeColor}
                  variant="hero"
                />
              </div>
            </div>

            {/* Identity */}
            <div className="flex-1 text-center sm:text-left">
              {/* Verified badge */}
              <div className="inline-flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold tracking-widest uppercase mb-3 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified Clinic
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-1">
                {clinic.name}
              </h1>
              <p className="text-slate-600 font-bold text-lg sm:text-xl mb-1 flex items-center justify-center sm:justify-start gap-1.5">
                <Stethoscope className="w-5 h-5 text-slate-400" />
                {displayDoctorName}
              </p>
              {clinic.specialty && (
                <p className="text-slate-500 text-sm font-medium mb-4">
                  {clinic.specialty}
                </p>
              )}

              {/* Info pills */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-4">
                {clinic.consultationFee ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm">
                    ₹{clinic.consultationFee} &nbsp;·&nbsp; Consultation Fee
                  </span>
                ) : null}
                {clinic.phone && (
                  <a
                    href={`tel:${clinic.phone}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {clinic.phone}
                  </a>
                )}
                {directionsUrl && clinic.address && (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    View on Map
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────── TRUST BAR ─────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-10 sm:mb-12 py-3 border-y border-slate-100">
        {[
          { icon: CheckCircle2, label: "Instant Confirmation" },
          { icon: ShieldCheck, label: "No Signup Required" },
          { icon: Users, label: "100% Free for Patients" },
          { icon: CalendarCheck, label: "Cancel Anytime" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Icon className="w-4 h-4" style={{ color: themeColor }} />
            {label}
          </div>
        ))}
      </div>

      {/* ─────────────── MAIN CONTENT GRID ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

        {/* LEFT: Clinic Information — order 2 on mobile */}
        <aside className="lg:col-span-5 order-2 lg:order-1 space-y-7">

          {/* About */}
          {clinic.about && (
            <section>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5" />
                About the Doctor
              </h2>
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
                <p className="text-slate-700 leading-relaxed text-[15px]">{clinic.about}</p>
              </div>
            </section>
          )}

          {/* How It Works — only show for first-time patients */}
          <section>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              How to Book
            </h2>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden divide-y divide-slate-50">
              {[
                { step: "1", title: "Pick a date", desc: "Choose any available day from the next 2 weeks" },
                { step: "2", title: "Pick a time slot", desc: "See real-time availability and select your slot" },
                { step: "3", title: "Enter your details", desc: "Name and phone number — takes 30 seconds" },
              ].map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-4 px-5 py-4">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: themeColor }}
                  >
                    {step}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          {(clinic.phone || clinic.address) && (
            <section>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Contact
              </h2>
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
                      <Phone className="w-[18px] h-[18px]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Call Now</p>
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
                          <Navigation className="w-3 h-3" /> Get Directions
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Map */}
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
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Working Hours
              </h2>
              <div className="rounded-2xl border border-slate-100 overflow-hidden bg-white shadow-sm">
                {FULL_DAY_NAMES.map((name, idx) => {
                  const rec = availRecords.find((a) => a.dayOfWeek === idx);
                  const isOpen = !!rec;
                  const isToday = idx === today;
                  return (
                    <div
                      key={name}
                      className={`flex items-center justify-between px-5 py-3 text-sm border-b border-slate-50 last:border-0 ${isToday ? "bg-slate-50/60" : ""}`}
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

          {/* Patient Reviews */}
          {totalReviews > 0 && (
            <section>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Star className="w-3.5 h-3.5" />
                Patient Reviews
              </h2>
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5">
                {/* Rating Summary */}
                <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-50">
                  <div className="text-center bg-amber-50 rounded-2xl px-4 py-3 border border-amber-100">
                    <p className="text-4xl font-black text-amber-600 leading-none">{averageRating}</p>
                    <div className="flex items-center gap-0.5 mt-2 justify-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i <= Math.round(Number(averageRating)) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">Verified Patient Reviews</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {totalReviews === 0
                        ? "After your visit, you'll receive a link to share your experience."
                        : `Based on ${totalReviews} verified patients who visited this clinic.`}
                    </p>
                  </div>
                </div>

                {/* Review List - Horizontal Scroll */}
                {totalReviews > 0 && (
                  <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide -mx-5 px-5">
                    {clinicReviews.map((review) => (
                      <div key={review.id} className="min-w-[280px] w-[280px] snap-center bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-shrink-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm"
                              style={{ backgroundColor: `${themeColor}ee` }}
                            >
                              {review.patientName?.[0]?.toUpperCase() || "P"}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 block leading-none">{review.patientName.split(" ")[0]}</span>
                              <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-0.5 mt-1 uppercase tracking-wider"><ShieldCheck className="w-3 h-3" /> Verified</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 mb-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-[13px] font-medium text-slate-700 leading-relaxed line-clamp-4">&quot;{review.comment}&quot;</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(clinic.name + (clinic.address ? " " + clinic.address : ""))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold transition-all hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl py-3 w-full mt-2"
                >
                  See all reviews on Google →
                </a>
              </div>
            </section>
          )}
        </aside>

        {/* RIGHT: Booking Widget — order 1 on mobile */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div className="lg:sticky lg:top-6 lg:z-30">
            <div className="mb-4">
              <p className="text-slate-500 text-sm font-medium">
                Book a consultation with <span className="font-bold text-slate-800">{displayDoctorName}</span>
                {clinic.specialty ? ` · ${clinic.specialty}` : ""}
              </p>
            </div>
            
            <div className="glass rounded-3xl p-1 shadow-2xl relative overflow-hidden ring-1 ring-black/5">
              <div className="absolute inset-0 bg-white/40" />
              <div className="relative bg-white/80 backdrop-blur-xl rounded-[1.35rem] shadow-inner">
                <BookingClient
                  clinic={clinic}
                  workingDays={workingDays}
                  closedDates={closedDates}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
