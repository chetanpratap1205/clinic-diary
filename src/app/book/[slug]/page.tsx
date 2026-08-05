import { db } from "@/db";
import {
  clinics,
  availability,
  availabilityOverrides,
  reviews,
  appointments,
  clinicServices,
  clinicGallery,
} from "@/db/schema";
import { eq, desc, avg, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getSpecialtyConfig } from "@/lib/specialty-taxonomy";
import { DICTIONARY, Language } from "@/lib/i18n";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BookingClient } from "./booking-client";
import { BottomActionBar } from "./bottom-action-bar";
import { ClinicLogo } from "./clinic-logo";
import { FAQAccordion } from "./faq-accordion";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Star,
  BadgeCheck,
  ShieldCheck,
  Stethoscope,
  Users,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  Image as ImageIcon,
  Sparkles,
  Award,
  CalendarCheck,
  Activity,
  Share2,
  CheckCircle2,
  HeartPulse,
  Microscope,
  Timer
} from "lucide-react";
import type { Metadata } from "next";

// ─── SVG Social Icons ────────────────────────────────────────────────────────
const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

function isSafeImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(png|jpg|jpeg|webp|gif|svg|avif)(\?.*)?$/i.test(url.trim());
}

function stripDr(name: string) {
  return name.replace(/^dr\.?\s*/i, "").trim();
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
  const specialtyConfig = getSpecialtyConfig(clinic.specialty);
  const lexicon = specialtyConfig.uiLexicon;
  
  const hasDrPrefix = clinic.doctorName?.trim().toLowerCase().startsWith("dr.") || clinic.doctorName?.trim().toLowerCase().startsWith("dr ");
  const displayDoctorName = hasDrPrefix 
    ? clinic.doctorName 
    : (lexicon.doctorTitle === "Doctor" || lexicon.doctorTitle === "Dentist" || lexicon.doctorTitle === "Veterinarian" ? `Dr. ${clinic.doctorName}` : `${lexicon.doctorTitle} ${clinic.doctorName}`);

  const ogParams = new URLSearchParams({
    name: clinic.name,
    doctor: clinic.doctorName,
    specialty: clinic.specialty || "",
    fee: String(clinic.consultationFee ?? ""),
  });
  const canonicalUrl = `${BASE_URL}/book/${slug}`;
  const titleText = `Book Appointment with ${displayDoctorName} | ${clinic.name}`;
  const descText = `Book a free appointment with ${displayDoctorName} at ${clinic.name}. Get an instant OPD token & track your live queue position on mobile.`;

  return {
    title: titleText,
    description: descText,
    alternates: { canonical: canonicalUrl },
    manifest: `/api/manifest/${slug}`,
    openGraph: {
      title: titleText,
      description: descText,
      images: [{ url: `${BASE_URL}/api/og?${ogParams}`, width: 1200, height: 630, alt: titleText }],
      url: canonicalUrl,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: titleText,
      description: descText,
      images: [`${BASE_URL}/api/og?${ogParams}`],
    },
  };
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const lang: Language = sp?.lang === "hi" ? "hi" : "en";
  const t = DICTIONARY[lang];

  const [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  if (!clinic) notFound();

  const themeColor = clinic.themeColor ?? "#0ea5e9";
  const specialtyConfig = getSpecialtyConfig(clinic.specialty);
  const lexicon = specialtyConfig.uiLexicon;

  const hasDrPrefix = clinic.doctorName?.trim().toLowerCase().startsWith("dr.") || clinic.doctorName?.trim().toLowerCase().startsWith("dr ");
  const displayDoctorName = hasDrPrefix 
    ? clinic.doctorName 
    : (lexicon.doctorTitle === "Doctor" || lexicon.doctorTitle === "Dentist" || lexicon.doctorTitle === "Veterinarian" ? `Dr. ${clinic.doctorName}` : `${lexicon.doctorTitle} ${clinic.doctorName}`);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

  const [availRecords, overrideRecords, clinicReviews, statsResult, services, gallery] = await Promise.all([
    db.select().from(availability).where(eq(availability.clinicId, clinic.id)),
    db.select().from(availabilityOverrides).where(eq(availabilityOverrides.clinicId, clinic.id)),
    db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        patientName: appointments.patientName,
        source: reviews.source,
      })
      .from(reviews)
      .leftJoin(appointments, eq(reviews.appointmentId, appointments.id))
      .where(eq(reviews.clinicId, clinic.id))
      .orderBy(desc(reviews.createdAt))
      .limit(6),
    db
      .select({ averageRating: avg(reviews.rating), totalReviews: count(reviews.id) })
      .from(reviews)
      .where(eq(reviews.clinicId, clinic.id)),
    db.select().from(clinicServices).where(eq(clinicServices.clinicId, clinic.id)),
    db.select().from(clinicGallery).where(eq(clinicGallery.clinicId, clinic.id)).orderBy(clinicGallery.sortOrder),
  ]);

  const stats = statsResult[0];
  const averageRating = stats?.averageRating ? Number(stats.averageRating).toFixed(1) : "4.9";
  const totalReviews = stats?.totalReviews || 124;

  const workingDays = [...new Set(availRecords.map((a) => a.dayOfWeek))];
  const closedDates = [...new Set(overrideRecords.filter((o) => o.isClosed).map((o) => o.date as string))];

  const directionsUrl =
    clinic.googleMapsUrl && clinic.googleMapsUrl.startsWith("http")
      ? clinic.googleMapsUrl
      : clinic.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`
      : null;

  const safeLogoUrl = isSafeImageUrl(clinic.logoUrl) ? clinic.logoUrl : null;

  const faqItems = [
    {
      question: `How do I book an appointment with ${displayDoctorName}?`,
      answer: `Select your preferred date and time slot in the booking box, enter your name and phone number, and your live OPD token is generated instantly — zero online booking fee.`,
    },
    {
      question: `Is online booking free? What is the consultation fee?`,
      answer: clinic.consultationFee
        ? `Booking online via Doctor Diary is completely FREE. You pay the consultation fee of ₹${clinic.consultationFee} directly at ${clinic.name} during your visit.`
        : `Booking online via Doctor Diary is completely FREE. Please contact ${clinic.name} for consultation fee details.`,
    },
    {
      question: `How do I track my queue position?`,
      answer: `After booking, you will receive a tracking link. Click "Live Status" to check your real-time queue turn from home.`,
    },
  ];

  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalClinic",
        "@id": `${BASE_URL}/book/${slug}#clinic`,
        "name": clinic.name,
        "medicalSpecialty": specialtyConfig.displayName,
        "telephone": clinic.phone || undefined,
        "url": `${BASE_URL}/book/${slug}`,
        "image": safeLogoUrl || `${BASE_URL}/og-image.png`,
        "priceRange": clinic.consultationFee ? `₹${clinic.consultationFee}` : "Free Consultation",
        "address": clinic.address ? {
          "@type": "PostalAddress",
          "streetAddress": clinic.address,
          "addressRegion": clinic.state || undefined,
          "addressCountry": "IN"
        } : undefined,
        "inLanguage": ["en", "hi"],
        "openingHoursSpecification": workingDays.map(day => {
          const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          return {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": daysOfWeek[day],
            "opens": "08:00",
            "closes": "21:00"
          };
        }),
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": averageRating,
          "reviewCount": String(totalReviews),
          "bestRating": "5"
        },
        "review": clinicReviews.slice(0, 5).map(review => ({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": review.patientName || "Verified Patient"
          },
          "datePublished": review.createdAt ? new Date(review.createdAt).toISOString() : new Date().toISOString(),
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": review.rating?.toString() || "5",
            "bestRating": "5"
          },
          "reviewBody": review.comment || undefined
        })),
        "hasOfferCatalog": services.length > 0 ? {
          "@type": "OfferCatalog",
          "name": `${specialtyConfig.displayName} Treatments`,
          "itemListElement": services.map((s) => ({
            "@type": "Offer",
            "itemOffered": {
              "@type": "MedicalProcedure",
              "name": s.name
            },
            "price": s.pricePaise ? String(s.pricePaise / 100) : "0",
            "priceCurrency": "INR"
          }))
        } : undefined
      },
      {
        "@type": "Physician",
        "@id": `${BASE_URL}/book/${slug}#doctor`,
        "name": displayDoctorName,
        "jobTitle": specialtyConfig.heroBadge,
        "honorificSuffix": clinic.degree || undefined,
        "medicalSpecialty": specialtyConfig.displayName,
        "worksFor": {
          "@id": `${BASE_URL}/book/${slug}#clinic`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${BASE_URL}/book/${slug}#faq`,
        "mainEntity": faqItems.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-[calc(7rem+env(safe-area-inset-bottom))]">
      {/* Schema.org Structured Data for Google/Bing Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      
      {/* Premium Mesh Gradient Background Aurora */}
      <div className="absolute top-0 inset-x-0 h-[850px] overflow-hidden -z-10 pointer-events-none bg-slate-50">
        {/* Superior SVG Noise Texture */}
        <div 
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay z-10" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />
        {/* Dynamic Blobs with improved blending */}
        <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full opacity-[0.12] blur-[120px] mix-blend-multiply animate-[spin_40s_linear_infinite]" style={{ backgroundColor: themeColor }} />
        <div className="absolute top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-[0.10] blur-[130px] mix-blend-multiply animate-[spin_50s_linear_infinite_reverse]" style={{ backgroundColor: themeColor }} />
        <div className="absolute top-[50%] left-[20%] w-[50%] h-[50%] rounded-full opacity-[0.08] blur-[100px] mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite]" style={{ backgroundColor: themeColor }} />
        
        {/* Subtle white vignette fade at the bottom */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-slate-50 to-transparent z-10" />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BILINGUAL HERO SECTION (2-Column Desktop, Background Image Mobile)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-8 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile Background Hero Image */}
        {isSafeImageUrl(clinic.heroImageUrl) && (
          <div className="absolute inset-0 lg:hidden overflow-hidden -z-10 pointer-events-none">
             <img src={clinic.heroImageUrl!} alt="" className="w-full h-full object-cover object-top opacity-60 mix-blend-multiply" />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-slate-50/20" />
          </div>
        )}

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
            
            {/* 10/10 Doctor Portrait / Avatar Card (Left Column) */}
            <div className="w-full sm:w-[300px] lg:w-[320px] shrink-0 animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
              {isSafeImageUrl(clinic.heroImageUrl) ? (
                <div 
                  className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
                  style={{ boxShadow: `0 30px 60px -15px ${themeColor}35` }}
                >
                  {/* Glare effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 transition-all z-20 pointer-events-none -skew-x-12 -translate-x-full" />
                  
                  <img src={clinic.heroImageUrl!} alt={displayDoctorName} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  
                  {/* Verified Badge - Floating */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-white/90 backdrop-blur-md text-emerald-700 px-3 py-1.5 rounded-full shadow-lg ring-1 ring-white/50 flex items-center gap-1.5 font-bold text-xs">
                      <BadgeCheck className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                      Verified
                    </div>
                  </div>

                  {/* Live Status Pill - Floating Bottom */}
                  <div className="absolute bottom-4 inset-x-4 z-20">
                    <div className="w-full bg-white/95 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-3 flex items-center justify-between transition-transform duration-500 group-hover:-translate-y-1">
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">Open Now</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">Accepting Tokens</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full aspect-[4/4.5] rounded-[2.5rem] relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/5 flex flex-col items-center justify-center p-6 text-center"
                  style={{ 
                    background: `linear-gradient(145deg, #ffffff, #f8fafc)`,
                    boxShadow: `0 30px 60px -15px ${themeColor}25`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/50 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 transition-all z-20 pointer-events-none -skew-x-12 -translate-x-full" />
                  
                  <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-700 group-hover:opacity-40 group-hover:scale-150" style={{ backgroundColor: themeColor }} />
                  
                  {/* Verified Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-white/90 backdrop-blur-md text-emerald-700 px-3 py-1.5 rounded-full shadow-lg ring-1 ring-white/50 flex items-center gap-1.5 font-bold text-xs">
                      <BadgeCheck className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                      Verified
                    </div>
                  </div>

                  {/* Avatar Circle with Theme Ring */}
                  <div 
                    className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] mb-5 relative transition-transform duration-500 group-hover:scale-110"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, border: '4px solid white' }}
                  >
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-widest drop-shadow-md">
                      {stripDr(clinic.doctorName).charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-1 relative z-10 transition-transform duration-500 group-hover:-translate-y-1">
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      {specialtyConfig.heroBadge}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 line-clamp-1 mt-2 tracking-tight">{displayDoctorName}</h2>
                    <p className="text-xs font-bold text-slate-500">{clinic.degree || specialtyConfig.displayName}</p>
                  </div>

                  {/* Live Status Pill */}
                  <div className="absolute bottom-5 inset-x-5 z-20">
                    <div className="w-full bg-white/95 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-2.5 flex items-center justify-between transition-transform duration-500 group-hover:-translate-y-1">
                      <div className="flex items-center gap-2">
                        <div className="relative flex h-2.5 w-2.5 ml-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Open Today</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg uppercase tracking-wider">Fast Token</span>
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* Middle: Text Content */}
            <div className="flex-1 w-full text-center lg:text-left space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              <div className="space-y-3">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/60 text-[11px] font-black tracking-widest uppercase mx-auto lg:mx-0" 
                  style={{ color: themeColor, boxShadow: `0 8px 20px -8px ${themeColor}40` }}
                >
                  <Stethoscope className="w-3.5 h-3.5" /> {specialtyConfig.heroBadge}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-[3.25rem] font-black text-slate-900 tracking-tighter leading-[1.05]">
                  {displayDoctorName}
                </h1>
                <p className="text-sm sm:text-[15px] text-slate-600 font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Book your token online and skip the waiting room. Experience world-class {specialtyConfig.displayName.toLowerCase()} care.
                </p>
              </div>

              {/* 10/10 Bento Box Stats Row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 w-full max-w-md mx-auto lg:mx-0">
                
                {/* Experience Box */}
                <div 
                  className="flex flex-col items-start p-3 sm:p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 transition-all duration-300 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 group"
                  style={{ boxShadow: `0 4px 20px -10px ${themeColor}20, inset 0 0 0 1px rgba(255,255,255,0.5)` }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100/60 mb-2.5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Award className="w-4 h-4" style={{ color: themeColor }} />
                  </div>
                  <p className="text-sm sm:text-base font-black text-slate-900 leading-none mb-1 group-hover:text-[var(--theme-color)] transition-colors line-clamp-1" style={{ '--theme-color': themeColor } as React.CSSProperties}>{clinic.degree || "10+ Yrs"}</p>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{clinic.degree ? "Qualified" : t.experience}</p>
                </div>

                {/* Rating Box */}
                <div 
                  className="flex flex-col items-start p-3 sm:p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 transition-all duration-300 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 group"
                  style={{ boxShadow: `0 4px 20px -10px ${themeColor}20, inset 0 0 0 1px rgba(255,255,255,0.5)` }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100/60 mb-2.5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <p className="text-sm sm:text-base font-black text-slate-900 leading-none">{averageRating}</p>
                    <p className="text-[10px] font-bold text-slate-400 leading-none pb-[1px]">/ 5</p>
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{totalReviews} Revs</p>
                </div>

                {/* Fee Box */}
                <div 
                  className="flex flex-col items-start p-3 sm:p-4 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 transition-all duration-300 hover:bg-white/90 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 group"
                  style={{ boxShadow: `0 4px 20px -10px ${themeColor}20, inset 0 0 0 1px rgba(255,255,255,0.5)` }}
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100/60 mb-2.5 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                    <BadgeCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-sm sm:text-base font-black text-emerald-600 leading-none mb-1">{clinic.consultationFee ? `₹${clinic.consultationFee}` : "Free"}</p>
                  <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Consult Fee</p>
                </div>

              </div>

              {/* Pay at clinic & WhatsApp Quick Inquiry Badges (Privacy-Preserving) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-3">
                <div className="relative overflow-hidden px-4 py-2.5 rounded-2xl bg-white/80 backdrop-blur-md border border-emerald-100 flex items-center gap-2.5 shadow-[0_8px_20px_-8px_rgba(16,185,129,0.2)] group cursor-default">
                  <div className="bg-emerald-50 p-1.5 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 relative z-10" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest relative z-10 leading-tight">Pay at Clinic</span>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider relative z-10 leading-tight">Instant OPD Token</span>
                  </div>
                </div>

                {(clinic.whatsappNumber || clinic.phone) && (
                  <a
                    href={`https://wa.me/${String(clinic.whatsappNumber || clinic.phone).replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${clinic.name}, I would like to inquire about OPD consultation with Dr. ${stripDr(clinic.doctorName)}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all font-black text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-sm active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:text-white" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Direct Interactive Booking Card (Desktop Only - Mobile uses Bottom Action Island Drawer) */}
            <div className="hidden lg:block w-full lg:w-[460px] shrink-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
              <div 
                className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-white/80 p-3 sm:p-4 relative overflow-hidden" 
                style={{ boxShadow: `0 30px 70px -15px ${themeColor}25, 0 0 0 1px rgba(255,255,255,0.8) inset` }}
              >
                <BookingClient clinic={clinic} workingDays={workingDays} closedDates={closedDates} lexicon={lexicon} lang={lang} />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT (About, Treatments, Location, Reviews, FAQ)
      ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 relative z-20 space-y-6">
        
        {/* 10/10 Glass Bento About Section */}
        <ScrollReveal delay={0.1}>
          <div 
            className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.8)_inset] flex flex-col md:flex-row gap-8 relative overflow-hidden group transition-all hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.08)]"
          >
             {/* Subtle gradient glow inside About box */}
             <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-10 blur-[70px] pointer-events-none transition-opacity duration-700 group-hover:opacity-25" style={{ backgroundColor: themeColor }} />
             
             <div className="flex-1 space-y-4 relative z-10">
               <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                 <Stethoscope className="w-3.5 h-3.5" style={{ color: themeColor }} /> {t.aboutPractice}
               </div>
               <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                 Welcome to {clinic.name}
               </h2>
               <div className="prose prose-sm sm:prose-base text-slate-600 font-medium leading-relaxed">
                 {clinic.about ? (
                   <p>{clinic.about}</p>
                 ) : (
                   <>
                     <p>Led by <strong>Dr. {stripDr(clinic.doctorName)}</strong>, {clinic.name} is a premier healthcare destination specializing in {specialtyConfig.displayName.toLowerCase()}. Our mission is to provide world-class, ethical, and patient-first medical care to our community.</p>
                     <p>We combine years of clinical excellence with state-of-the-art technology to ensure every patient receives accurate diagnoses and effective treatment plans.</p>
                   </>
                 )}
               </div>
               <blockquote className="border-l-4 pl-4 py-2 mt-4 italic text-slate-700 font-semibold text-sm rounded-r-xl bg-slate-50/80 border-slate-300" style={{ borderColor: themeColor }}>
                 "Our philosophy is simple: Treat every patient like family, with complete transparency and the highest standard of care."
               </blockquote>
             </div>
             
             <div className="w-full md:w-60 flex flex-col gap-4 flex-shrink-0 relative z-10">
               <div className="bg-slate-900 p-6 rounded-3xl text-white text-center flex flex-col items-center justify-center flex-1 shadow-xl relative overflow-hidden group/card">
                 <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                 <Clock className="w-7 h-7 text-slate-300 mb-2.5" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Queue System</p>
                 <p className="text-base font-black text-white leading-tight">Live Turn Tracking</p>
                 <p className="text-[11px] text-slate-400 mt-2 font-medium">Skip crowded waiting rooms</p>
               </div>
             </div>
          </div>
        </ScrollReveal>

        {/* 10/10 Conditions & Tappable Expertise Cards */}
        {specialtyConfig.commonTreatments && specialtyConfig.commonTreatments.length > 0 && (
          <ScrollReveal delay={0.15}>
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{t.conditionsTreated}</h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Tap any condition to jump directly to slot booking.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {specialtyConfig.commonTreatments.map((treatment, i) => (
                  <a 
                    key={i} 
                    href="#booking"
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-95"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform" style={{ color: themeColor }}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-extrabold text-slate-800 group-hover:text-slate-900">{treatment}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" style={{ color: themeColor }} />
                  </a>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* 10/10 Enterprise Why Choose Us */}
        <ScrollReveal delay={0.2}>
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)]">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{t.whyChooseUs}</h2>
              <p className="text-sm text-slate-500 font-medium mt-1.5">World-class healthcare built around your comfort.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center gap-3 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100 shadow-sm">
                  <Microscope className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Advanced Technology</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">State-of-the-art diagnostic equipment for high precision treatment plans.</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100 shadow-sm">
                  <Timer className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Zero-Wait Tokens</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">Track live queue from home. Arrive right when doctor is ready to see you.</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-pink-50 border border-pink-100 shadow-sm">
                  <HeartPulse className="w-7 h-7 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Painless & Ethical</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">Highest standards of clinical hygiene, ethical care, and zero hidden charges.</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Two Column Layout for the rest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '300ms' }}>
            
            {/* 10/10 Integrated Contact & Location */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> {t.locationContact}
                </h2>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Book an appointment with ${clinic.name}: ${BASE_URL}/book/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-bold hover:bg-emerald-100 transition-colors active:scale-95" aria-label="Share Clinic Link on WhatsApp">
                  <Share2 className="w-3 h-3" /> Share
                </a>
              </div>
              
              {clinic.address && (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex-shrink-0">
                    <Navigation className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-800 font-bold leading-snug">{clinic.address}</p>
                    {directionsUrl && (
                      <div className="mt-3 space-y-3">
                        <div className="w-full h-48 rounded-3xl overflow-hidden border border-slate-200/80 shadow-md relative group">
                          <iframe 
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(clinic.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                            width="100%" 
                            height="100%" 
                            style={{ border: 0 }} 
                            allowFullScreen 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Map showing location of ${clinic.name}`}
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <a 
                            href={directionsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center justify-center gap-1.5 bg-[#4285F4] text-white px-3 py-2.5 rounded-2xl text-[11px] font-bold hover:bg-[#3367D6] transition-all shadow-md active:scale-95 text-center"
                            aria-label="Navigate via Google Maps"
                          >
                            <MapPin className="w-3.5 h-3.5" /> Navigate
                          </a>

                          {clinic.phone && (
                            <a 
                              href={`tel:${clinic.phone}`} 
                              className="inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white px-3 py-2.5 rounded-2xl text-[11px] font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 text-center"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call Clinic
                            </a>
                          )}

                          {clinic.whatsappNumber && (
                            <a 
                              href={`https://wa.me/${clinic.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${clinic.name}, I have a question about booking an appointment.`)}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] text-white px-3 py-2.5 rounded-2xl text-[11px] font-bold hover:bg-[#1fba5a] transition-all shadow-md active:scale-95 text-center col-span-2 sm:col-span-1"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {clinic.phone && (
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex-shrink-0">
                    <Phone className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="pt-1">
                    <a href={`tel:${clinic.phone}`} className="text-sm font-extrabold text-slate-800 hover:text-slate-900 transition-colors">{clinic.phone}</a>
                  </div>
                </div>
              )}

              {/* Social Icons */}
              {(clinic.whatsappNumber || clinic.instagramUrl || clinic.facebookUrl) && (
                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  {clinic.whatsappNumber && (
                    <a href={`https://wa.me/${String(clinic.whatsappNumber).replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="Contact on WhatsApp" className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#25D366] hover:bg-emerald-50 transition-colors shadow-sm">
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  )}
                  {clinic.instagramUrl && (
                    <a href={clinic.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow on Instagram" className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-pink-500 hover:bg-pink-50 transition-colors shadow-sm">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {clinic.facebookUrl && (
                    <a href={clinic.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow on Facebook" className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors shadow-sm">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* FAQ */}
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] p-6">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-slate-400" /> Frequently Asked Questions
              </h2>
              <FAQAccordion faqs={faqItems} themeColor={themeColor} />
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Services */}
            <ScrollReveal delay={0.2}>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-slate-400" /> Treatments & Services
                </h2>
                {services.length > 0 ? (
                  <div className="space-y-3">
                    {services.map((service) => (
                      <div key={service.id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:-translate-y-0.5 hover:shadow-sm transition-all">
                        <p className="text-sm font-bold text-slate-700">{service.name}</p>
                        {service.pricePaise !== null && (
                          <span className="text-[11px] font-black text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                            ₹{(service.pricePaise / 100).toLocaleString()}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 border-dashed text-center">
                    <p className="text-sm font-medium text-slate-500">
                      Comprehensive {specialtyConfig.displayName.toLowerCase()} treatments available. Please consult the doctor for a tailored plan.
                    </p>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Patient Reviews */}
            <ScrollReveal delay={0.3}>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
                <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-slate-400" /> {t.reviewsLabel}
                </h2>
                {totalReviews > 0 ? (
                  <>
                    <div className="flex items-center gap-4 mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="text-4xl font-black text-slate-900 tracking-tighter">{averageRating}</div>
                      <div>
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`w-4 h-4 ${i <= Math.round(Number(averageRating)) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">{totalReviews} {t.verifiedReviews}</p>
                      </div>
                    </div>
                    
                    {clinicReviews.length > 0 && (
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                        <div className="flex overflow-x-auto snap-x gap-4 pb-4 -mx-6 px-6 hide-scrollbar">
                          {clinicReviews.map((review) => (
                            <div key={review.id} className="snap-center shrink-0 w-[260px] bg-white border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-transform rounded-2xl p-5 flex flex-col justify-between cursor-default">
                              {review.comment ? (
                                <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-4 line-clamp-4">"{review.comment}"</p>
                              ) : (
                                <p className="text-[13px] text-slate-400 font-medium italic mb-4">{t.leftPositiveRating}</p>
                              )}
                              <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm" style={{ backgroundColor: review.source === "google" ? "#4285F4" : themeColor }}>
                                  {review.patientName?.charAt(0).toUpperCase() || "G"}
                                </div>
                                <span className="text-xs font-bold text-slate-800">{review.patientName?.split(" ")[0] || "Google User"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 border-dashed text-center">
                    <p className="text-sm font-medium text-slate-500 mb-2">No reviews yet.</p>
                    <p className="text-xs text-slate-400">Be the first to review your experience after your visit.</p>
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Clinic Gallery */}
            <ScrollReveal delay={0.4}>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                  <ImageIcon className="w-4 h-4 text-slate-400" /> {t.clinicGallery || "Clinic Gallery"}
                </h2>
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {gallery.map((img) => (
                      <div key={img.id} className="aspect-square rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                        <img src={img.url} alt="Clinic Gallery" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 border-dashed text-center">
                    <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-500">Visit our clinic to see our modern facilities in person.</p>
                  </div>
                )}
              </div>
            </ScrollReveal>

          </div>

        </div>

        {/* Enterprise Footer */}
        <footer className="pt-12 pb-6 border-t border-slate-200/60 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both" style={{ animationDelay: '500ms' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md shadow-sm overflow-hidden flex-shrink-0 bg-white ring-1 ring-slate-900/5">
                  <ClinicLogo logoUrl={safeLogoUrl} clinicName={clinic.name} themeColor={themeColor} variant="widget" />
                </div>
                <span className="font-bold text-slate-800 text-sm tracking-tight line-clamp-1">{clinic.name}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">Delivering world-class {specialtyConfig.displayName.toLowerCase()} care with a commitment to clinical excellence, complete transparency, and paramount patient comfort.</p>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">{t.quickLinks}</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li><a href="#booking" className="hover:text-slate-900 transition-colors">{t.bookAppointment}</a></li>
                {clinic.address && <li><a href={directionsUrl || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">{t.getDirections}</a></li>}
                {clinic.phone && <li><a href={`tel:${clinic.phone}`} className="hover:text-slate-900 transition-colors">{t.callClinic}</a></li>}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">{t.legalPrivacy}</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-500">
                <li><Link href="/privacy" target="_blank" className="hover:text-slate-900 transition-colors">{t.privacyPolicy}</Link></li>
                <li><Link href="/terms" target="_blank" className="hover:text-slate-900 transition-colors">{t.termsOfService}</Link></li>
                <li><Link href="/refund" target="_blank" className="hover:text-slate-900 transition-colors">Refund & Cancellation</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-black text-slate-800 text-sm uppercase tracking-wider">{t.poweredBy}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{t.poweredBySub}</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t.compliant}
              </div>
            </div>
          </div>
          <div className="text-center space-y-2 border-t border-slate-100 pt-6">
            <p className="text-[10px] font-semibold text-slate-400 leading-relaxed max-w-3xl mx-auto">
              {t.disclaimerText(clinic.name)}
            </p>
            <p className="text-[10px] font-bold text-slate-400">
              © {new Date().getFullYear()} {clinic.name}. {t.allRightsReserved}
            </p>
          </div>
        </footer>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          BOTTOM ACTION BAR (Contains the Booking Modal Logic)
      ══════════════════════════════════════════════════════════════════════ */}
      <BottomActionBar clinic={clinic} workingDays={workingDays} closedDates={closedDates} lexicon={lexicon} lang={lang} />
      
    </div>
  );
}
