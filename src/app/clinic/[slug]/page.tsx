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

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { getSpecialtyConfig } from "@/lib/specialty-taxonomy";
import { DICTIONARY, Language } from "@/lib/i18n";
import { ScrollReveal } from "@/components/scroll-reveal";
import { BookingClient } from "./booking-client";
import { BottomActionBar } from "./bottom-action-bar";
import { ClinicLogo } from "./clinic-logo";
import { FAQAccordion } from "./faq-accordion";
import { InstallAppSection } from "@/components/install-app-section";
import { LeadFomoBanner } from "./lead-fomo-banner";
import { ExpandableText } from "@/components/expandable-text";
import Link from "next/link";
import Image from "next/image";
import { trackLeadView } from "@/app/admin/leads/actions";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  Star,
  ShieldCheck,
  Stethoscope,
  MessageCircle,
  HelpCircle,
  Sparkles,
  CalendarCheck,
  Activity,
  Share2,
  CheckCircle2,
  Timer,
  ChevronRight,
} from "lucide-react";
import type { Metadata } from "next";
import { formatDoctorName } from "@/lib/utils";
import { VerifiedBadge } from "./verified-badge";

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

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.659-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

const SolidPhoneIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className={className}>
    <path d="M21.384 17.752a2.108 2.108 0 0 1-.522 3.359 7.543 7.543 0 0 1-5.476.642C8.2 20.535 4.5 16.836 2.8 11.75c-.655-1.956-.516-4.223.642-5.476a2.108 2.108 0 0 1 3.359-.522l3.358 3.359a2.108 2.108 0 0 1 0 2.981l-1.42 1.42a12.87 12.87 0 0 0 5.768 5.769l1.42-1.42a2.108 2.108 0 0 1 2.981 0l3.358 3.358Z" />
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
      themeColor: "#0d9488",
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
  
  const displayDoctorName = formatDoctorName(clinic.doctorName);

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
  const canonicalUrl = `${BASE_URL}/clinic/${slug}`;
  const titleText = `${displayDoctorName} | ${specialtyConfig.displayName}${locationTag} | ${clinic.name}`;
  const descText = `Book a free appointment with ${displayDoctorName} (${specialtyConfig.displayName}) at ${clinic.name}${locationTag}. Instant OPD token & live queue position tracking on mobile.`;

  return {
    title: titleText,
    description: descText,
    alternates: { canonical: canonicalUrl },
    manifest: `/api/manifest/${slug}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: clinic.name,
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
      themeColor: "#0d9488",
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

  const displayDoctorName = formatDoctorName(clinic.doctorName);
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
  // Compute today’s clinic timings to surface above-fold on mobile
  const todayDayName = daysMap[new Date().getDay()];
  const todayTimings = schedule[todayDayName] || null;

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

  const faqItems = lang === "hi" ? [
    {
      question: `${displayDoctorName} के साथ अपॉइंटमेंट कैसे बुक करें?`,
      answer: `बुकिंग बॉक्स में अपनी पसंदीदा तारीख और समय चुनें, नाम और मोबाइल नंबर डालें — आपका लाइव OPD टोकन तुरंत मिल जाएगा। ऑनलाइन बुकिंग का कोई शुल्क नहीं।`,
    },
    {
      question: `क्या ऑनलाइन बुकिंग मुफ्त है? परामर्श शुल्क क्या है?`,
      answer: clinic.consultationFee
        ? `Doctor Diary पर ऑनलाइन बुकिंग पूरी तरह मुफ्त है। परामर्श शुल्क ${formattedFee} सीधे ${clinic.name} पर अपनी विजिट के दौरान देना होगा।`
        : `Doctor Diary पर ऑनलाइन बुकिंग पूरी तरह मुफ्त है। परामर्श शुल्क के लिए कृपया ${clinic.name} से संपर्क करें।`,
    },
    {
      question: `अपनी कतार में अपना नंबर कैसे ट्रैक करें?`,
      answer: `बुकिंग के बाद आपको एक ट्रैकिंग लिंक मिलेगा। "लाइव स्थिति" पर क्लिक करें और घर से अपनी बारी देखें।`,
    },
  ] : [
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
        "@id": `${BASE_URL}/clinic/${slug}#clinic`,
        "name": clinic.name,
        "medicalSpecialty": specialtyConfig.displayName,
        "telephone": clinic.phone ? `+91${clinic.phone.replace(/\D/g, "").slice(-10)}` : undefined,
        "url": `${BASE_URL}/clinic/${slug}`,
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
        "@id": `${BASE_URL}/clinic/${slug}#doctor`,
        "name": displayDoctorName,
        "jobTitle": specialtyConfig.heroBadge,
        "honorificSuffix": clinic.degree || undefined,
        "medicalSpecialty": specialtyConfig.displayName,
        "worksFor": {
          "@id": `${BASE_URL}/clinic/${slug}#clinic`
        }
      },
      {
        "@type": "FAQPage",
        "@id": `${BASE_URL}/clinic/${slug}#faq`,
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

      {/* ══════════════════════════════════════════════════════════════════════
          PREMIUM HERO SECTION — WOW First Impression
          Desktop: 3-col (Doctor Portrait | Info+Stats | Booking Widget)
          Mobile:  Avatar → Name → Specialty → Stats → [Book CTA via bottom bar]
      ══════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="hero-doctor-name" className="relative pt-8 pb-14 sm:pt-14 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* ─── Aurora Background Layer ─────────────────────────────────── */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
          {/* Deep mesh gradient base */}
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${themeColor}18 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 60%, ${themeColor}10 0%, transparent 60%), #f8fafc` }} />
          {/* Animated orbs */}
          <div className="absolute -top-[25%] -right-[15%] w-[65%] h-[65%] rounded-full blur-[130px] opacity-[0.14] animate-[spin_50s_linear_infinite]" style={{ backgroundColor: themeColor }} />
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[110px] opacity-[0.10] animate-[spin_60s_linear_infinite_reverse]" style={{ backgroundColor: themeColor }} />
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
          {/* Bottom fade */}
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-12">

            {/* ─── LEFT: Doctor Portrait Card (Desktop Only) ───────────── */}
            {isSafeImageUrl(clinic.heroImageUrl) && (
              <div className="hidden lg:flex flex-col gap-4 w-[300px] xl:w-[320px] shrink-0">
                {/* Portrait */}
                <div
                  className="w-full aspect-[3/4] rounded-[2rem] overflow-hidden relative group shadow-2xl ring-1 ring-black/8 transition-all duration-500 hover:-translate-y-2"
                  style={{ boxShadow: `0 40px 80px -20px ${themeColor}40` }}
                >
                  <Image
                    src={clinic.heroImageUrl!}
                    alt={`${displayDoctorName} - ${specialtyConfig.displayName}`}
                    fill
                    sizes="320px"
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    priority
                  />
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                  {/* Verified badge — tap to reveal explanation tooltip */}
                  <div className="absolute top-4 right-4">
                    <VerifiedBadge label={t.verifiedOfficial} tooltip={t.verifiedTooltip} variant="pill" />
                  </div>
                  {/* Live status strip — only shows when clinic has hours scheduled for today */}
                  {todayTimings && (
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{t.openToday}</span>
                        <span className="ml-auto text-[10px] font-bold text-white/70 bg-white/10 px-2 py-0.5 rounded-full">{todayTimings[0]}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Clinic name badge below portrait */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-sm ring-1 ring-slate-200/60 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-black text-sm"
                    style={{ backgroundColor: themeColor }}
                  >
                    {isSafeImageUrl(clinic.logoUrl) ? (
                      <Image src={clinic.logoUrl!} alt={clinic.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      clinic.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{clinic.name}</p>
                    {clinic.address && <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{clinic.address.split(",")[0]}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* ─── CENTER: Hero Content ────────────────────────────────── */}
            <div className={`flex-1 w-full text-center lg:text-left space-y-6 ${!isSafeImageUrl(clinic.heroImageUrl) ? "lg:flex lg:flex-col lg:items-center lg:text-center lg:py-6" : ""}`}>

              {/* Mobile (and Desktop Fallback): Avatar + Name row */}
              <div className={`flex flex-col items-center space-y-4 ${isSafeImageUrl(clinic.heroImageUrl) ? "lg:hidden" : ""}`}>
                {/* Clinic hero image (mobile full-width, if available) */}
                {isSafeImageUrl(clinic.heroImageUrl) && (
                  <div className="relative w-full h-52 rounded-[2rem] overflow-hidden shadow-xl ring-1 ring-black/8">
                    <Image
                      src={clinic.heroImageUrl!}
                      alt={`${displayDoctorName} - ${specialtyConfig.displayName}`}
                      fill
                      sizes="100vw"
                      className="object-cover object-top"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-1" style={{ backgroundColor: themeColor + "dd" }}>
                          <Stethoscope className="w-3 h-3 text-white" />
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{specialtyConfig.heroBadge}</span>
                        </div>
                        <h1 id="hero-doctor-name" className="text-xl font-black text-white drop-shadow-lg leading-tight">{displayDoctorName}</h1>
                        {clinic.degree && <p className="text-[11px] text-white/80 font-semibold mt-0.5">{clinic.degree.replace(/ and /gi, ' · ')}</p>}
                      </div>
                      <VerifiedBadge label={t.verifiedOfficial} tooltip={t.verifiedTooltip} variant="pill-sm" />
                    </div>
                  </div>
                )}

                {/* No hero image fallback (mobile + desktop) */}
                {!isSafeImageUrl(clinic.heroImageUrl) && (
                  <>
                    {/* Avatar circle */}
                    <div className="relative">
                      <div
                        className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.25)] ring-4 ring-white flex items-center justify-center text-white text-4xl lg:text-5xl font-black"
                        style={{ backgroundColor: themeColor }}
                      >
                        {isSafeImageUrl(clinic.logoUrl) ? (
                          <Image src={clinic.logoUrl!} alt={displayDoctorName} width={128} height={128} className="w-full h-full object-cover" />
                        ) : (
                          stripDr(clinic.doctorName).charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 rounded-full ring-2 ring-white">
                        <VerifiedBadge label={t.verifiedOfficial} tooltip={t.verifiedTooltip} variant="icon-only" />
                      </div>
                    </div>
                    {/* Name + specialty */}
                    <div className="space-y-1 lg:space-y-3">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full bg-white/90 border border-slate-200" style={{ color: themeColor }}>
                        <Stethoscope className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                        <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest">{specialtyConfig.heroBadge}</span>
                      </div>
                      <h1 id="hero-doctor-name" className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight">{displayDoctorName}</h1>
                      <p className="text-xs lg:text-sm text-slate-500 font-bold">
                        {clinic.degree ? `${clinic.degree.replace(/ and /gi, ' · ')} · ${specialtyConfig.displayName}` : specialtyConfig.displayName}
                      </p>
                      <p className="hidden lg:block text-base text-slate-600 font-medium max-w-md mx-auto leading-relaxed mt-2">
                        {lang === "hi"
                          ? `${clinic.name} में ${specialtyConfig.displayName.toLowerCase()} के लिए विशेषज्ञ देखभाल। ऑनलाइन टोकन बुक करें और लाइव कतार ट्रैक करें।`
                          : `Expert ${specialtyConfig.displayName.toLowerCase()} care at ${clinic.name}. Book your token online and track the live queue from home.`
                        }
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Desktop: Specialty badge + Name + Description (Only when hero image exists) */}
              {isSafeImageUrl(clinic.heroImageUrl) && (
                <div className="hidden lg:block space-y-4">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border"
                    style={{ color: themeColor, backgroundColor: `${themeColor}12`, borderColor: `${themeColor}30` }}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    {specialtyConfig.heroBadge}
                  </div>
                  <h1 id="hero-doctor-name" className="text-4xl xl:text-[3.5rem] font-black text-slate-900 tracking-tighter leading-[1.04]">
                    {displayDoctorName}
                  </h1>
                  {clinic.degree && (
                    <p className="text-sm text-slate-500 font-semibold">{clinic.degree.replace(/ and /gi, ' · ')} · {specialtyConfig.displayName}</p>
                  )}
                  <p className="text-base text-slate-600 font-medium max-w-md leading-relaxed">
                    {lang === "hi"
                      ? `${clinic.name} में ${specialtyConfig.displayName.toLowerCase()} के लिए विशेषज्ञ देखभाल। ऑनलाइन टोकन बुक करें और लाइव कतार ट्रैक करें।`
                      : `Expert ${specialtyConfig.displayName.toLowerCase()} care at ${clinic.name}. Book your token online and track the live queue from home.`
                    }
                  </p>
                </div>
              )}

              {/* ─── 3-Box Premium Bento Stats (3-col, 1 row) ─────────── */}
              <div className={`grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-sm md:max-w-md mx-auto ${!isSafeImageUrl(clinic.heroImageUrl) ? "lg:mx-auto" : "lg:mx-0"}`}>

                {/* Box 1: Consultation Fee */}
                <div className="group flex flex-col items-center lg:items-start p-3 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100 mb-2 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-4 h-4 text-emerald-800" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm sm:text-[15px] font-black text-emerald-800 leading-none mb-1">{formattedFee}</p>
                  <p className="text-[8px] sm:text-[9.5px] font-black text-slate-700 uppercase tracking-widest text-center lg:text-left">{t.consultFee}</p>
                </div>

                {/* Box 2: Zero Booking Fee */}
                <div className="group flex flex-col items-center lg:items-start p-3 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-50 border border-indigo-100 mb-2 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-4 h-4 text-indigo-800" strokeWidth={2.5} />
                  </div>
                  <p className="text-sm sm:text-[15px] font-black text-indigo-900 leading-none mb-1">
                    ₹0 <span className="text-[10px] uppercase font-bold text-indigo-800">Fee</span>
                  </p>
                  <p className="text-[8px] sm:text-[9.5px] font-black text-slate-700 uppercase tracking-widest text-center lg:text-left">{lang === "hi" ? "क्लिनिक में भुगतान करें" : "Pay at clinic"}</p>
                </div>

                {/* Box 3: Live Queue */}
                {(() => {
                  let isQueueActive = false;
                  let title = t.liveQueue;
                  let subtitle = t.liveQueueTrack;

                  if (isLead) {
                    isQueueActive = true;
                    let openTime = "10:00 AM";
                    if (leadTimings) {
                       const timeMatch = leadTimings.match(/\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/i);
                       if (timeMatch) openTime = timeMatch[0].toUpperCase();
                    }
                    title = `Queue from ${openTime}`;
                    subtitle = lang === "hi" ? "लाइव टोकन ट्रैकिंग" : "Live Token Tracking";
                  } else {
                    // For actual clinics, show the opening time if we don't have live active data
                    // In a full implementation, we'd check current active tokens here.
                    const openTime = todayTimings ? todayTimings[0].split("-")[0].trim() : "10:00 AM";
                    title = `Opens at ${openTime}`;
                    subtitle = "Live tracking active";
                  }

                  return (
                    <Link
                      href={`/clinic/${clinic.slug}/status?lang=${lang}`}
                      className="group flex flex-col items-center lg:items-start p-3 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-1 relative"
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-100 mb-2 group-hover:scale-110 transition-transform relative">
                        <Activity className="w-4 h-4 text-emerald-800" strokeWidth={2.5} />
                        {isQueueActive && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-[15px] font-black text-emerald-800 leading-none mb-1">{title}</p>
                      <p className="text-[8px] sm:text-[9.5px] font-black text-slate-700 uppercase tracking-widest text-center lg:text-left">{subtitle}</p>
                    </Link>
                  );
                })()}
              </div>

              {/* ─── Compact Location + Today’s Hours Strip ──────── */}
              {(clinic.address || todayTimings) && (
                <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-1.5 w-full max-w-sm md:max-w-md mx-auto ${!isSafeImageUrl(clinic.heroImageUrl) ? "lg:mx-auto lg:justify-center" : "lg:mx-0"}`}>
                  {todayTimings && (
                    <span className="flex items-start gap-1.5 text-[11px] font-bold">
                      <span className="relative flex h-1.5 w-1.5 flex-shrink-0 mt-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                      </span>
                      <span className="text-emerald-800 font-black flex-shrink-0">{t.openToday}:</span>
                      <div className="flex flex-col text-slate-600 leading-tight">
                        {todayTimings.map((time, i) => (
                          <span key={i}>{time}</span>
                        ))}
                      </div>
                    </span>
                  )}
                  {clinic.address && (
                    <a
                      href={directionsUrl || "#"}
                      target={directionsUrl ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-slate-900 transition-colors active:scale-95 group/loc"
                      aria-label="Get directions to clinic"
                    >
                      <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: themeColor }} />
                      <span className="truncate max-w-[200px] sm:max-w-[250px]">{lang === "hi" ? "दिशा-निर्देश" : "Directions"}</span>
                      {directionsUrl && <Navigation className="w-2.5 h-2.5 flex-shrink-0 opacity-60" />}
                    </a>
                  )}
                </div>
              )}

              {/* ─── Action Buttons Row ─────────────────────────────────── */}
              <div className={`flex flex-wrap items-center justify-center lg:justify-start gap-2 ${!isSafeImageUrl(clinic.heroImageUrl) ? "lg:justify-center" : ""}`}>
                {(clinic.phone) && (
                  <a
                    href={`tel:+91${String(clinic.phone).replace(/\D/g, "").slice(-10)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all font-bold text-[10px] uppercase tracking-wider active:scale-95 shadow-sm"
                  >
                    <SolidPhoneIcon className="w-3.5 h-3.5 text-emerald-800" />
                    <span>{lang === "hi" ? "कॉल करें" : "Call Clinic"}</span>
                  </a>
                )}

                {(clinic.whatsappNumber || clinic.phone) && (
                  <a
                    href={`https://wa.me/91${String(clinic.whatsappNumber || clinic.phone).replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi ${clinic.name}, I would like to inquire about OPD consultation with ${displayDoctorName}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all font-bold text-[10px] uppercase tracking-wider active:scale-95 shadow-sm"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-800" />
                    <span>{t.chatOnWhatsapp}</span>
                  </a>
                )}
              </div>
            </div>

            {/* ─── RIGHT: Booking Widget (Desktop Only) ────────────────── */}
            <div className="hidden lg:block w-full lg:w-[440px] xl:w-[460px] shrink-0">
              <div
                className="bg-white/95 backdrop-blur-2xl rounded-[2rem] border border-white/80 p-4 relative overflow-hidden"
                style={{ boxShadow: `0 30px 70px -15px ${themeColor}30, 0 0 0 1px rgba(255,255,255,0.9) inset` }}
              >
                {/* Subtle theme color top accent */}
                <div className="absolute top-0 inset-x-0 h-1 rounded-t-[2rem]" style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}80)` }} />
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
                 {lang === "hi" ? `${clinic.name} में आपका स्वागत है` : `Welcome to ${clinic.name}`}
               </h2>
                <ExpandableText 
                  themeColor={themeColor} 
                  readMoreText={lang === "hi" ? "और पढ़ें" : "Read More"} 
                  readLessText={lang === "hi" ? "कम दिखाएं" : "Read Less"}
                >
                 {clinic.about ? (
                   <p>{clinic.about}</p>
                 ) : (
                   lang === "hi" ? (
                     <>
                       <p><strong>डॉ. {stripDr(clinic.doctorName)}</strong> के नेतृत्व में, {clinic.name} {specialtyConfig.displayName.toLowerCase()} में विशेषज्ञता रखने वाला एक प्रमुख स्वास्थ्य केंद्र है। हमारा लक्ष्य हमारे समुदाय को विश्व स्तरीय, नैतिक और रोगी-प्रथम चिकित्सा देखभाल प्रदान करना है।</p>
                       <p>हम वर्षों की नैदानिक उत्कृष्टता और आधुनिक तकनीक को मिलाकर हर मरीज़ को सटीक निदान और प्रभावी उपचार सुनिश्चित करते हैं।</p>
                     </>
                   ) : (
                     <>
                       <p>Led by <strong>Dr. {stripDr(clinic.doctorName)}</strong>, {clinic.name} is a premier healthcare destination specializing in {specialtyConfig.displayName.toLowerCase()}. Our mission is to provide world-class, ethical, and patient-first medical care to our community.</p>
                       <p>We combine years of clinical excellence with state-of-the-art technology to ensure every patient receives accurate diagnoses and effective treatment plans.</p>
                     </>
                   )
                 )}
                </ExpandableText>
                {/* Bilingual mission quote */}
               <blockquote className="border-l-4 pl-4 py-2 mt-4 italic text-slate-700 font-semibold text-sm rounded-r-xl bg-slate-50/80 border-slate-300" style={{ borderColor: themeColor }}>
                 {lang === "hi"
                   ? `"${clinic.name} में हमारी सोच है कि डॉ. ${stripDr(clinic.doctorName)} के प्रत्येक मरीज़ को पारदर्शी और दयालु देखभाल मिले。"`
                   : `"Our philosophy at ${clinic.name} is dedicated to transparent, compassionate care for every patient visiting Dr. ${stripDr(clinic.doctorName)}."`
                 }
               </blockquote>
             </div>
             
             {/* Point 26: Operating Hours Card */}
             {hasSchedule && (
               <div className="w-full md:w-64 flex flex-col gap-4 flex-shrink-0 relative z-10">
                 <div className="bg-slate-900 p-5 rounded-3xl text-white flex flex-col justify-between flex-1 shadow-xl relative overflow-hidden group/card border border-slate-800">
                   <div className="flex items-center gap-2 mb-3">
                     <Clock className="w-5 h-5 text-emerald-400" />
                     <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                       {lang === "hi" ? "समय सारिणी" : "Operating Schedule"}
                     </span>
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
                     {lang === "hi" ? "मुफ्त बुकिंग" : "Book Free Online"}
                   </div>
                 </div>
               </div>
             )}
          </div>
        </ScrollReveal>

        {/* 10/10 Conditions & Tappable Expertise Cards (Point 18) */}
        {specialtyConfig.commonTreatments && specialtyConfig.commonTreatments.length > 0 && (
          <ScrollReveal delay={0.15}>
            <div className="py-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {lang === "hi" ? "विशेषज्ञता क्षेत्र" : "Conditions We Treat"}
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    {lang === "hi" ? `${clinic.name} में उपचार की जाने वाली प्रमुख स्थितियाँ` : `Common conditions treated at ${clinic.name}`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {specialtyConfig.commonTreatments.map((treatment, i) => (
                  <a
                    key={i}
                    href="#booking"
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:scale-110 transition-transform" style={{ color: themeColor }}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-extrabold text-slate-800">{treatment}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5" style={{ color: themeColor }}>
                      {lang === "hi" ? "बुक करें" : "Book"} →
                    </span>
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
              <p className="text-sm text-slate-500 font-medium mt-1.5">
                {lang === "hi" ? "आपकी सुविधा के लिए विश्व-स्तरीय स्वास्थ्य सेवा।" : "World-class healthcare built around your comfort."}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center gap-3 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 border border-blue-100 shadow-sm">
                  <Timer className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{lang === "hi" ? "20 सेकंड में बुकिंग" : "Book in 20 Seconds"}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">{lang === "hi" ? "तारीख, समय और नाम-मोबाइल डालें। तुरंत पुष्टि।" : "Select date, time, and enter your name & number. Instant confirmation."}</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 border border-emerald-100 shadow-sm">
                  <Activity className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{lang === "hi" ? "लाइव कतार देखें" : "See Your Queue Live"}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">{lang === "hi" ? "घर से अपना नंबर ट्रैक करें। डॉक्टर तैयार हों तब आएं।" : "Track your real-time turn from home. Arrive when the doctor is ready."}</p>
                </div>
              </div>
              <div className="flex flex-col items-center text-center gap-3 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-pink-50 border border-pink-100 shadow-sm">
                  <ShieldCheck className="w-7 h-7 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{lang === "hi" ? "शून्य बुकिंग शुल्क" : "Zero Booking Fee"}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed">{lang === "hi" ? "बुकिंग 100% मुफ्त। फीस सीधे क्लिनिक में दें।" : "100% free to book. Pay the consultation fee directly at the clinic."}</p>
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
                <a href={`https://wa.me/?text=${encodeURIComponent(`Book an appointment with ${clinic.name}: ${BASE_URL}/clinic/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 px-3 py-1.5 rounded-full text-[10px] font-extrabold hover:bg-emerald-200 transition-colors active:scale-95" aria-label="Share Clinic Link on WhatsApp">
                  <Share2 className="w-3 h-3 text-emerald-800" /> {lang === "hi" ? "शेयर" : "Share"}
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
                            className="inline-flex items-center justify-center gap-1.5 bg-[#1557BF] text-white px-3 py-2.5 rounded-2xl text-[11px] font-extrabold hover:bg-[#11469c] transition-all shadow-md active:scale-95 text-center"
                            aria-label="Navigate via Google Maps"
                          >
                            <MapPin className="w-3.5 h-3.5 text-white" /> {lang === "hi" ? "रास्ता" : "Navigate"}
                          </a>

                          {clinic.phone && (
                            <a 
                              href={`tel:+91${clinic.phone.replace(/\D/g, "").slice(-10)}`} 
                              className="inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white px-3 py-2.5 rounded-2xl text-[11px] font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 text-center"
                            >
                              <SolidPhoneIcon className="w-3.5 h-3.5" /> {lang === "hi" ? "कॉल करें" : "Call Clinic"}
                            </a>
                          )}

                          {clinic.whatsappNumber && (
                            <a 
                              href={`https://wa.me/91${clinic.whatsappNumber.replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi ${clinic.name}, I have a question about booking an appointment.`)}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center justify-center gap-1.5 bg-[#25D366] text-white px-3 py-2.5 rounded-2xl text-[11px] font-bold hover:bg-[#1fba5a] transition-all shadow-md active:scale-95 text-center col-span-2 sm:col-span-1"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp
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
                      <WhatsAppIcon className="w-5 h-5" />
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
            <div className="pt-4 border-t border-slate-200/60 mt-4">
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                <HelpCircle className="w-4 h-4 text-slate-400" /> {lang === "hi" ? "अक्सर पूछे जाने वाले सवाल" : "Frequently Asked Questions"}
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
                    <Sparkles className="w-4 h-4 text-slate-400" /> {lang === "hi" ? "उपचार और सेवाएँ" : "Treatments & Services"}
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
                              <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-4 line-clamp-4">&quot;{review.comment}&quot;</p>
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

        {/* ══════════════════════════════════════════════════════════════════════
            FOMO LEAD BANNER (Visible on all devices for leads)
        ══════════════════════════════════════════════════════════════════════ */}
        {isLead && (
          <ScrollReveal delay={0.4}>
            <div className="mt-12">
              <LeadFomoBanner clinicName={clinic.name} doctorName={stripDr(clinic.doctorName)} slug={slug} />
            </div>
          </ScrollReveal>
        )}

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
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {lang === "hi"
                  ? `${clinic.name} में ${specialtyConfig.displayName.toLowerCase()} की विश्व स्तरीय देखभाल — नैदानिक उत्कृष्टता, पारदर्शिता और रोगी आराम के प्रति प्रतिबद्ध।`
                  : `Delivering world-class ${specialtyConfig.displayName.toLowerCase()} care with a commitment to clinical excellence, complete transparency, and paramount patient comfort.`
                }
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">{t.quickLinks}</h3>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li><a href="#booking" className="hover:text-slate-900 transition-colors">{t.bookAppointment}</a></li>
                {clinic.address && <li><a href={directionsUrl || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors">{t.getDirections}</a></li>}
                {clinic.phone && <li><a href={`tel:${clinic.phone}`} className="hover:text-slate-900 transition-colors">{t.callClinic}</a></li>}
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">{t.legalPrivacy}</h3>
              <ul className="space-y-2 text-xs font-medium text-slate-600">
                <li><Link href="/privacy" target="_blank" className="hover:text-slate-900 transition-colors">{t.privacyPolicy}</Link></li>
                <li><Link href="/terms" target="_blank" className="hover:text-slate-900 transition-colors">{t.termsOfService}</Link></li>
                <li><Link href="/refund" target="_blank" className="hover:text-slate-900 transition-colors">{lang === "hi" ? "रिफंड और रद्दीकरण" : "Refund & Cancellation"}</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">{t.poweredBy}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.poweredBySub}</p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {t.compliant}
              </div>
            </div>
          </div>
          <div className="text-center space-y-2 border-t border-slate-100 pt-6">
            <p className="text-[10px] font-bold text-slate-700">
              © {new Date().getFullYear()} {clinic.name}. {t.allRightsReserved}
            </p>
          </div>
        </footer>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          BOTTOM ACTION BAR (Contains the Booking Modal Logic)
      ══════════════════════════════════════════════════════════════════════ */}
      <BottomActionBar clinic={clinic} workingDays={workingDays} closedDates={closedDates} lexicon={lexicon} lang={lang} isLead={isLead} leadTimings={leadTimings ?? undefined} />
      
    </div>
  );
}
