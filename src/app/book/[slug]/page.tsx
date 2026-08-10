import { db } from "@/db";
import {
  clinics,
  availability,
  availabilityOverrides,
  reviews,
  appointments,
  clinicServices,
  clinicGallery,
  doctorLeads,
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
import { InstallAppSection } from "@/components/install-app-section";
import Link from "next/link";
import { trackLeadView } from "@/app/admin/leads/actions";
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
  Zap,
  Timer
} from "lucide-react";
import type { Metadata } from "next";
import { formatDoctorName } from "@/lib/utils";

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

const YouTube = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
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
  let [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  
  if (!clinic) {
    const [lead] = await db.select().from(doctorLeads).where(eq(doctorLeads.clinicSlug, slug)).limit(1);
    if (!lead) return { title: "Not Found" };
    
    // Create a mock clinic from lead data for metadata generation
    clinic = {
      id: lead.id,
      slug: lead.clinicSlug || slug,
      name: lead.clinicName || `${lead.doctorName}'s Clinic`,
      doctorName: lead.doctorName,
      degree: lead.degree || null,
      specialty: lead.specialty || "General Physician",
      phone: lead.phone,
      logoUrl: lead.logoUrl || null,
      consultationFee: lead.consultationFee || 0,
      freeFollowupDays: 0,
      averageConsultationMinutes: 15,
      themeColor: "#0ea5e9",
      address: lead.address || null,
      billingAddress: null,
      state: lead.city || null,
      gstin: null,
      googleMapsUrl: null,
      about: lead.about || null,
      heroImageUrl: null,
      instagramUrl: null,
      whatsappNumber: lead.phone,
      facebookUrl: null,
      referredBy: null,
      youtubeUrl: null,
      websiteUrl: null,
      vitalsPresets: [],
      complaintPresets: [],
      diagnosisPresets: [],
      treatmentPresets: [],
      createdAt: lead.createdAt,
    };
  }

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";
  const specialtyConfig = getSpecialtyConfig(clinic.specialty);
  const lexicon = specialtyConfig.uiLexicon;
  
  const displayDoctorName = (lexicon.doctorTitle === "Doctor" || lexicon.doctorTitle === "Dentist" || lexicon.doctorTitle === "Veterinarian") ? formatDoctorName(clinic.doctorName) : `${lexicon.doctorTitle} ${clinic.doctorName}`;

  // Extract locality / city from address or state for hyper-local search intent (Point 8)
  const addressParts = clinic.address ? clinic.address.split(",").map((s) => s.trim()) : [];
  const cityOrLocality = addressParts.length > 1 ? addressParts[addressParts.length - 2] || addressParts[0] : clinic.state || "";
  const locationTag = cityOrLocality ? ` in ${cityOrLocality}` : "";

  const ogParams = new URLSearchParams({
    name: clinic.name,
    doctor: clinic.doctorName,
    specialty: clinic.specialty || "",
    fee: clinic.consultationFee ? String(clinic.consultationFee) : "",
    location: cityOrLocality,
  });
  const canonicalUrl = `${BASE_URL}/book/${slug}`;
  const titleText = `Book Appointment - ${displayDoctorName} | ${specialtyConfig.displayName}${locationTag} | ${clinic.name}`;
  const descText = `Book a free appointment with ${displayDoctorName} (${specialtyConfig.displayName}) at ${clinic.name}${locationTag}. Instant OPD token & live queue position tracking on mobile.`;

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

  let [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  let isLead = false;

  if (!clinic) {
    const [lead] = await db.select().from(doctorLeads).where(eq(doctorLeads.clinicSlug, slug)).limit(1);
    if (!lead) {
      notFound();
    }
    
    // Create a robust mock clinic perfectly matching the UI expectations
    clinic = {
      id: lead.id, // Re-using lead ID so components expecting an ID won't crash
      slug: lead.clinicSlug || slug,
      name: lead.clinicName || `${lead.doctorName}'s Clinic`,
      doctorName: lead.doctorName,
      degree: lead.degree || null,
      specialty: lead.specialty || "General Physician",
      phone: lead.phone,
      logoUrl: lead.logoUrl || null,
      consultationFee: lead.consultationFee || 0,
      freeFollowupDays: 0,
      averageConsultationMinutes: 15,
      themeColor: "#0ea5e9",
      address: lead.address || null,
      billingAddress: null,
      state: lead.city || null,
      gstin: null,
      googleMapsUrl: null,
      about: lead.about || null,
      heroImageUrl: null,
      instagramUrl: null,
      whatsappNumber: lead.phone,
      facebookUrl: null,
      referredBy: null,
      youtubeUrl: null,
      websiteUrl: null,
      vitalsPresets: [],
      complaintPresets: [],
      diagnosisPresets: [],
      treatmentPresets: [],
      createdAt: lead.createdAt,
    };
    isLead = true;
  }

  // Capture lead timings text (e.g. "Mon-Sat 10:00 AM – 8:00 PM")
  // This is separate from availability table records which don't exist for leads.
  let leadTimings: string | null = null;
  if (isLead) {
    // We need to re-fetch to get timings since mock clinic object doesn't carry it cleanly
    const [leadForTimings] = await db
      .select({ timings: doctorLeads.timings })
      .from(doctorLeads)
      .where(eq(doctorLeads.clinicSlug, slug))
      .limit(1);
    leadTimings = leadForTimings?.timings ?? null;
  }

  // Fire-and-forget view tracking — never blocks the render
  if (isLead) void trackLeadView(slug);


  const themeColor = clinic.themeColor ?? "#0ea5e9";
  const specialtyConfig = getSpecialtyConfig(clinic.specialty);
  const lexicon = specialtyConfig.uiLexicon;

  const displayDoctorName = (lexicon.doctorTitle === "Doctor" || lexicon.doctorTitle === "Dentist" || lexicon.doctorTitle === "Veterinarian") ? formatDoctorName(clinic.doctorName) : `${lexicon.doctorTitle} ${clinic.doctorName}`;
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
  const averageRating = stats?.averageRating ? Number(stats.averageRating).toFixed(1) : null;
  const totalReviews = stats?.totalReviews || 0;

  const workingDays = [...new Set(availRecords.map((a) => a.dayOfWeek))];
  const closedDates = [...new Set(overrideRecords.filter((o) => o.isClosed).map((o) => o.date as string))];

  const daysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const schedule = availRecords.reduce((acc, curr) => {
    const day = daysMap[curr.dayOfWeek];
    if (!acc[day]) acc[day] = [];
    const [startH, startM] = curr.startTime.split(":");
    const [endH, endM] = curr.endTime.split(":");
    const startObj = new Date(); startObj.setHours(Number(startH), Number(startM));
    const endObj = new Date(); endObj.setHours(Number(endH), Number(endM));
    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    acc[day].push(`${formatTime(startObj)} - ${formatTime(endObj)}`);
    return acc;
  }, {} as Record<string, string[]>);
  const hasSchedule = Object.keys(schedule).length > 0;

  // Point 1, 14, 19, 29: Unified Google Maps intent and embed URL for robust native app handoff
  const searchQuery = encodeURIComponent(`${clinic.name}, ${clinic.address || ""}`.trim());
  const directionsUrl =
    clinic.googleMapsUrl && clinic.googleMapsUrl.startsWith("http")
      ? clinic.googleMapsUrl
      : clinic.address
      ? `https://www.google.com/maps/dir/?api=1&destination=${searchQuery}`
      : null;

  const mapEmbedUrl = `https://maps.google.com/maps?q=${searchQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const safeLogoUrl = isSafeImageUrl(clinic.logoUrl) ? clinic.logoUrl : null;
  const formattedFee = clinic.consultationFee ? `₹${Number(clinic.consultationFee).toLocaleString("en-IN")}` : "Free";

  const faqItems = [
    {
      question: `How do I book an appointment with ${displayDoctorName}?`,
      answer: `Select your preferred date and time slot in the booking box, enter your name and mobile number, and your live OPD token is generated instantly — zero online booking fee.`,
    },
    {
      question: `Is online booking free? What is the consultation fee?`,
      answer: clinic.consultationFee
        ? `Booking online via Doctor Diary is completely FREE. You pay the consultation fee of ${formattedFee} directly at ${clinic.name} during your visit.`
        : `Booking online via Doctor Diary is completely FREE. Please contact ${clinic.name} for consultation fee details.`,
    },
    {
      question: `How do I track my queue position?`,
      answer: `After booking, you will receive a tracking link. Click "Live Status" to check your real-time queue turn from home.`,
    },
  ];

  // Point 9: Comprehensive Schema.org JSON-LD Structured Data for Local Business & Rich Snippets
  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["MedicalClinic", "LocalBusiness"],
        "@id": `${BASE_URL}/book/${slug}#clinic`,
        "name": clinic.name,
        "medicalSpecialty": specialtyConfig.displayName,
        "telephone": clinic.phone ? `+91${clinic.phone.replace(/\D/g, "").slice(-10)}` : undefined,
        "url": `${BASE_URL}/book/${slug}`,
        "image": safeLogoUrl || `${BASE_URL}/og-image.png`,
        "priceRange": clinic.consultationFee ? formattedFee : "Free Consultation",
        "hasMap": directionsUrl || undefined,
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
            "opens": "09:00",
            "closes": "20:00"
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
          "reviewBody": review.comment || "Positive patient consultation experience."
        })),
        "hasOfferCatalog": services.length > 0 ? {
          "@type": "OfferCatalog",
          "name": `${specialtyConfig.displayName} Services`,
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
            
            {/* Left Column: Doctor Portrait Card (Desktop Only - Mobile combines into unified hero) */}
            <div className="hidden lg:block w-[320px] shrink-0 animate-in fade-in slide-in-from-left-8 duration-1000 ease-out">
              {isSafeImageUrl(clinic.heroImageUrl) ? (
                <div 
                  className="w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white relative group transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
                  style={{ boxShadow: `0 30px 60px -15px ${themeColor}35` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 group-hover:translate-x-full duration-1000 transition-all z-20 pointer-events-none -skew-x-12 -translate-x-full" />
                  <img src={clinic.heroImageUrl!} alt={displayDoctorName} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1.5 rounded-full shadow-lg ring-1 ring-white/50 flex items-center gap-1.5 font-bold text-xs">
                      <BadgeCheck className="w-4 h-4 text-white fill-[#1d9bf0]" />
                      {t.verifiedOfficial}
                    </div>
                  </div>
                  <div className="absolute bottom-4 inset-x-4 z-20">
                    <div className="w-full bg-white/95 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-emerald-700">{t.openNow}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{t.acceptingTokens}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className="w-full aspect-[4/4.5] rounded-[2.5rem] relative group transition-all duration-500 hover:-translate-y-2 flex flex-col items-center justify-center p-6 text-center"
                  style={{ 
                    background: `linear-gradient(145deg, #ffffff, #f8fafc)`,
                    boxShadow: `0 30px 60px -15px ${themeColor}25`
                  }}
                >
                  <div className="absolute top-4 right-4 z-20">
                    <div className="bg-white/90 backdrop-blur-md text-slate-800 px-3 py-1.5 rounded-full shadow-lg ring-1 ring-white/50 flex items-center gap-1.5 font-bold text-xs">
                      <BadgeCheck className="w-4 h-4 text-white fill-[#1d9bf0]" />
                      {t.verifiedOfficial}
                    </div>
                  </div>

                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] mb-5 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, border: '4px solid white' }}
                  >
                    {isSafeImageUrl(clinic.logoUrl) ? (
                      <img src={clinic.logoUrl!} alt={displayDoctorName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-black text-white tracking-widest drop-shadow-md">
                        {stripDr(clinic.doctorName).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 relative z-10">
                    <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      {specialtyConfig.heroBadge}
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 line-clamp-1 mt-2 tracking-tight">{displayDoctorName}</h2>
                    <p className="text-xs font-bold text-slate-500">{clinic.degree || specialtyConfig.displayName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Main Unified Hero Content (Mobile + Desktop Center) */}
            <div className="flex-1 w-full text-center lg:text-left space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Mobile Profile Card Header (Mobile Only) */}
              <div className="lg:hidden flex flex-col items-center text-center space-y-4">
                {/* Doctor Avatar */}
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center shadow-[0_10px_30px_-5px_rgba(0,0,0,0.2)] overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, border: '4px solid white' }}
                  >
                    {isSafeImageUrl(clinic.logoUrl) ? (
                      <img src={clinic.logoUrl!} alt={displayDoctorName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-white tracking-widest">
                        {stripDr(clinic.doctorName).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-white p-0.5 rounded-full shadow-md">
                    <BadgeCheck className="w-7 h-7 text-white fill-[#1d9bf0]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-[10px] font-black tracking-widest uppercase"
                    style={{ color: themeColor }}
                  >
                    <Stethoscope className="w-3 h-3" /> {specialtyConfig.heroBadge}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {displayDoctorName}
                  </h1>
                  <p className="text-xs text-slate-500 font-bold">
                    {clinic.degree ? `${clinic.degree} · ${specialtyConfig.displayName}` : specialtyConfig.displayName}
                  </p>
                </div>
              </div>

              {/* Desktop Title & Subtitle */}
              <div className="hidden lg:block space-y-3">
                <div 
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-white/60 text-[11px] font-black tracking-widest uppercase" 
                  style={{ color: themeColor, boxShadow: `0 8px 20px -8px ${themeColor}40` }}
                >
                  <Stethoscope className="w-3.5 h-3.5" /> {specialtyConfig.heroBadge}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-[3.25rem] font-black text-slate-900 tracking-tighter leading-[1.05]">
                  {displayDoctorName}
                </h1>
                <p className="text-sm sm:text-[15px] text-slate-600 font-medium max-w-md leading-relaxed">
                  Book your token online and skip the waiting room. Experience world-class {specialtyConfig.displayName.toLowerCase()} care.
                </p>
              </div>

              {/* 10/10 Bento Box Stats Row (Updated) */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 w-full max-w-md mx-auto lg:mx-0">
                
                {/* Credentials Box (Full Width for long degrees) */}
                <div className="col-span-2 flex items-center p-3 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm transition-all hover:bg-white hover:-translate-y-1 group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 mr-4 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Award className="w-5 h-5 text-indigo-500" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm sm:text-[15px] font-black text-slate-900 leading-tight mb-0.5 line-clamp-2">{clinic.degree || "Board Certified Specialist"}</p>
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.credentials}</p>
                  </div>
                </div>

                {/* Fee Box */}
                <div className="flex flex-col items-center sm:items-start p-3 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm transition-all hover:bg-white hover:-translate-y-1 group">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100 mb-2 group-hover:scale-110 transition-transform">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm sm:text-base font-black text-emerald-600 leading-none mb-1">{formattedFee}</p>
                  <p className="text-[8.5px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.consultFee}</p>
                </div>

                {/* Smart Queue / Token Box */}
                <div className="flex flex-col items-center sm:items-start p-3 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm transition-all hover:bg-white hover:-translate-y-1 group">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-50 border border-blue-100 mb-2 group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm sm:text-base font-black text-blue-600 leading-none mb-1">{t.smartQueueActive}</p>
                  <p className="text-[8.5px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.liveTracking}</p>
                </div>
              </div>

              {/* Pay at clinic & WhatsApp Quick Inquiry Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                <div className="px-3.5 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-100 flex items-center gap-2 shadow-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10.5px] font-black text-slate-800 uppercase tracking-wider">{t.payFeeAtClinic}</span>
                </div>

                {(clinic.whatsappNumber || clinic.phone) && (
                  <a
                    href={`https://wa.me/91${String(clinic.whatsappNumber || clinic.phone).replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi ${clinic.name}, I would like to inquire about OPD consultation with Dr. ${stripDr(clinic.doctorName)}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 hover:bg-[#25D366] hover:text-white hover:border-[#25D366] transition-all font-black text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                    <span>{t.whatsappInquiry}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: Direct Interactive Booking Card (Desktop Only) */}
            <div className="hidden lg:block w-full lg:w-[460px] shrink-0 animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
              <div 
                className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-white/80 p-3 sm:p-4 relative overflow-hidden" 
                style={{ boxShadow: `0 30px 70px -15px ${themeColor}25, 0 0 0 1px rgba(255,255,255,0.8) inset` }}
              >
                <BookingClient
                  clinic={clinic}
                  workingDays={workingDays}
                  closedDates={closedDates}
                  lexicon={lexicon}
                  lang={lang}
                  isLead={isLead}
                  leadTimings={leadTimings ?? undefined}
                />
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
               {/* Point 2: Dynamic tenant-specific mission quote */}
               <blockquote className="border-l-4 pl-4 py-2 mt-4 italic text-slate-700 font-semibold text-sm rounded-r-xl bg-slate-50/80 border-slate-300" style={{ borderColor: themeColor }}>
                 "Our philosophy at {clinic.name} is dedicated to transparent, compassionate care for every patient visiting Dr. {stripDr(clinic.doctorName)}."
               </blockquote>
             </div>
             
             {/* Point 26: Operating Hours Card */}
             {hasSchedule && (
               <div className="w-full md:w-64 flex flex-col gap-4 flex-shrink-0 relative z-10">
                 <div className="bg-slate-900 p-5 rounded-3xl text-white flex flex-col justify-between flex-1 shadow-xl relative overflow-hidden group/card border border-slate-800">
                   <div className="flex items-center gap-2 mb-3">
                     <Clock className="w-5 h-5 text-emerald-400" />
                     <span className="text-xs font-black uppercase tracking-wider text-slate-200">Operating Schedule</span>
                   </div>
                   <div className="space-y-1.5 text-xs text-slate-300 font-medium max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
                     {daysMap.map(day => (
                       schedule[day] ? (
                         <div key={day} className="flex justify-between font-semibold border-b border-slate-800 pb-1 mb-1 last:border-0 last:pb-0 last:mb-0">
                           <span className="text-slate-400">{day.substring(0, 3)}:</span> 
                           <span className="text-right text-[10px] sm:text-xs">
                             {schedule[day].map((t, i) => <div key={i}>{t}</div>)}
                           </span>
                         </div>
                       ) : null
                     ))}
                   </div>
                   <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400 font-bold">
                     <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Queue Active</span>
                     <span>Fast Booking</span>
                   </div>
                 </div>
               </div>
             )}
          </div>
        </ScrollReveal>

        {/* 10/10 Conditions & Tappable Expertise Cards (Point 18) */}
        {specialtyConfig.commonTreatments && specialtyConfig.commonTreatments.length > 0 && (
          <ScrollReveal delay={0.15}>
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-6 sm:p-8 border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {specialtyConfig.commonTreatments.map((treatment, i) => (
                  <div 
                    key={i} 
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100" style={{ color: themeColor }}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-extrabold text-slate-800">{treatment}</span>
                    </div>
                  </div>
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
                  <Timer className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Book in 20 Seconds</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">Select date, time, and enter your name & number. Instant confirmation.</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100 shadow-sm">
                  <Activity className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">See Your Queue Live</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">Track your real-time turn from home. Arrive when the doctor is ready.</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-pink-50 border border-pink-100 shadow-sm">
                  <ShieldCheck className="w-7 h-7 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Zero Booking Fee</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">100% free to book. Pay the consultation fee directly at the clinic.</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ══════════════════════════════════════════════════════════════════════
            INSTALL CLINIC APP SECTION (~65% scroll depth)
            Shows after "Why Choose Us" — patient has already seen the value,
            now we invite them to install. Platform-smart: Android gets 1-tap
            native install, iOS gets visual step guide, Desktop gets address-bar hint.
            Bilingual: respects the page's selected lang (en/hi).
        ══════════════════════════════════════════════════════════════════════ */}
        <ScrollReveal delay={0.1}>
          <InstallAppSection
            clinicName={clinic.name}
            logoUrl={safeLogoUrl}
            themeColor={themeColor}
            lang={lang}
          />
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
                              href={`tel:+91${clinic.phone.replace(/\D/g, "").slice(-10)}`} 
                              className="inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white px-3 py-2.5 rounded-2xl text-[11px] font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 text-center"
                            >
                              <Phone className="w-3.5 h-3.5" /> Call Clinic
                            </a>
                          )}

                          {clinic.whatsappNumber && (
                            <a 
                              href={`https://wa.me/91${clinic.whatsappNumber.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi ${clinic.name}, I have a question about booking an appointment.`)}`} 
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
              {(clinic.whatsappNumber || clinic.instagramUrl || (clinic as any).youtubeUrl || (clinic as any).websiteUrl) && (
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
                  {(clinic as any).youtubeUrl && (
                    <a href={(clinic as any).youtubeUrl} target="_blank" rel="noopener noreferrer" aria-label="Subscribe on YouTube" className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                      <YouTube className="w-5 h-5" />
                    </a>
                  )}
                  {(clinic as any).websiteUrl && (
                    <a href={(clinic as any).websiteUrl} target="_blank" rel="noopener noreferrer" aria-label="Visit Website" className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-emerald-500 hover:bg-emerald-50 transition-colors shadow-sm">
                      <GlobeIcon className="w-5 h-5" />
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
            {services.length > 0 && (
              <ScrollReveal delay={0.2}>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                  <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-slate-400" /> Treatments & Services
                  </h2>
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
                </div>
              </ScrollReveal>
            )}

            {/* Patient Reviews */}
            {totalReviews > 0 && (
              <ScrollReveal delay={0.3}>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 relative overflow-hidden">
                  <h2 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-4">
                    <Star className="w-4 h-4 text-slate-400" /> {t.reviewsLabel}
                  </h2>
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
                </div>
              </ScrollReveal>
            )}

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
