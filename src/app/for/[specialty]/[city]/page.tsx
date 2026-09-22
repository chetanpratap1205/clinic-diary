import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  Shield,
  Lock,
  Server,
  Award,
  Star,
  MessageCircle,
  Zap,
  Clock,
  Users,
  FileText,
  ChevronRight,
  QrCode,
  TrendingUp,
  PhoneOff,
} from "lucide-react";
import { SPECIALTIES, CITIES } from "@/data/seo-data";
import FaqAccordion from "./FaqAccordion";

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  params: Promise<{ specialty: string; city: string }>;
};

// ─── Static Route Generation — 42 × 30 = 1,260 pages ─────────────────────────

export async function generateStaticParams() {
  return SPECIALTIES.flatMap((specialty) =>
    CITIES.map((city) => ({
      specialty: specialty.slug,
      city: city.slug,
    }))
  );
}

// ─── Per-Page SEO Metadata ────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { specialty: specialtySlug, city: citySlug } = await params;
  const specialty = SPECIALTIES.find((s) => s.slug === specialtySlug);
  const city = CITIES.find((c) => c.slug === citySlug);

  if (!specialty || !city) return {};

  const title = `Clinic Software for ${specialty.shortLabel}s in ${city.label} | Doctor Diary`;
  const description = `Doctor Diary helps ${specialty.shortLabel}s in ${city.label} cut no-shows by 40%, manage queues digitally, and earn more with 0% commission. Set up your clinic free in 5 minutes.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://doctor.naturexpress.in/for/${specialtySlug}/${citySlug}`,
    },
    openGraph: {
      title: `${specialty.shortLabel} Clinic Software in ${city.label} — Doctor Diary`,
      description: `Run a smarter ${specialty.shortLabel} practice in ${city.label}. 0% commission. WhatsApp booking. Live queue. Digital Rx. Set up free.`,
      url: `https://doctor.naturexpress.in/for/${specialtySlug}/${citySlug}`,
      siteName: "Doctor Diary",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fillCity(template: string, city: string): string {
  return template.replace(/\{city\}/g, city);
}

// ─── JSON-LD Structured Data (FAQPage + SoftwareApplication) ─────────────────

function buildJsonLd(
  specialty: (typeof SPECIALTIES)[0],
  city: (typeof CITIES)[0]
) {
  const faqs = specialty.faqQuestions.map((q) => ({
    "@type": "Question",
    name: fillCity(q, city.label),
    acceptedAnswer: {
      "@type": "Answer",
      text: `Doctor Diary is purpose-built clinic management software trusted by independent ${specialty.shortLabel}s in ${city.label}, ${city.state}. It provides WhatsApp-based appointment booking, automated patient reminders, live digital queue management, digital prescriptions, and a private branded clinic URL — all with 0% commission on patient payments.`,
    },
  }));

  return JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Doctor Diary",
      applicationCategory: "MedicalApplication",
      operatingSystem: "Web, iOS, Android",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        description: "Free to set up. Paid plans from ₹1,999/quarter.",
      },
      description: `Clinic management software for ${specialty.shortLabel}s in ${city.label}. WhatsApp booking, digital queue, automated reminders, digital prescriptions, 0% commission.`,
      url: "https://doctor.naturexpress.in",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "512",
        bestRating: "5",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://doctor.naturexpress.in" },
        { "@type": "ListItem", position: 2, name: "Solutions", item: "https://doctor.naturexpress.in/for" },
        {
          "@type": "ListItem",
          position: 3,
          name: specialty.label,
          item: `https://doctor.naturexpress.in/for/${specialty.slug}`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: city.label,
          item: `https://doctor.naturexpress.in/for/${specialty.slug}/${city.slug}`,
        },
      ],
    },
  ]);
}

// ─── Feature tiles shown in the Solution section ──────────────────────────────

const FEATURES = [
  {
    icon: <QrCode className="w-6 h-6" />,
    title: "WhatsApp & QR Booking",
    desc: "Patients book instantly via WhatsApp link or QR code — no app download, no friction.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Live Digital Queue",
    desc: "Patients track their queue position in real time — crowded lobbies become a thing of the past.",
  },
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Automated Reminders",
    desc: "24-hour and 2-hour WhatsApp reminders cut no-shows by up to 40% — automatically, every day.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Digital Prescriptions",
    desc: "Generate and send typed prescriptions to patients via WhatsApp — your Rx pad, digitised.",
  },
];

// ─── Trust pillars — reused from EnterpriseSecurityGrid design language ───────

const TRUST_PILLARS = [
  {
    icon: <Lock className="w-6 h-6" />,
    title: "100% Patient Data Ownership",
    desc: "Your patient database is encrypted and locked strictly to your clinic. We never sell, share, or market to your patients.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "256-bit AES Encryption",
    desc: "End-to-end encryption for all prescriptions, records, and billing data with automated multi-region daily backups.",
  },
  {
    icon: <Server className="w-6 h-6" />,
    title: "99.99% Uptime Guarantee",
    desc: "Hosted on redundant cloud nodes — zero clinic interruption during peak hours, even on slow mobile data.",
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Contractual 0% Commission",
    desc: "Our terms legally guarantee Doctor Diary takes 0% of your revenue. Every patient payment goes straight to your bank.",
  },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function SpecialtyInCityPage({ params }: Props) {
  const { specialty: specialtySlug, city: citySlug } = await params;

  const specialty = SPECIALTIES.find((s) => s.slug === specialtySlug);
  const city = CITIES.find((c) => c.slug === citySlug);

  if (!specialty || !city) notFound();

  const signupHref = `/signup?specialty=${encodeURIComponent(specialty.slug)}&city=${encodeURIComponent(city.slug)}`;
  const jsonLd = buildJsonLd(specialty, city);

  return (
    <>
      {/* JSON-LD structured data — FAQPage + SoftwareApplication + Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <main className="bg-[#FAFBFC]">

        {/* ══════════════════════════════════════════════════════════════
            SECTION 1 — HERO
            Dark luxury background, exact keyword H1, strong CTA
        ══════════════════════════════════════════════════════════════ */}
        <section className="relative bg-[#040D21] overflow-hidden">
          {/* Ambient emerald glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[#00B7A8]/8 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-8 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#00B7A8] transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <Link href="/for" className="hover:text-[#00B7A8] transition-colors">Solutions</Link>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-slate-400">{specialty.label}</span>
              <ChevronRight className="w-3 h-3 flex-shrink-0" />
              <span className="text-slate-300">{city.label}</span>
            </nav>

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Trusted by 500+ independent clinics across India
            </div>

            <div className="max-w-4xl">
              {/* H1 — exact SEO keyword target */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-6">
                Clinic Management Software
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-400 to-[#00897B]">
                  Built for {specialty.shortLabel}s
                </span>{" "}
                in {city.label}
              </h1>

              {/* Specialty-specific pain point subheadline */}
              <p className="text-slate-300 text-base sm:text-xl leading-relaxed font-medium max-w-3xl mb-10">
                {specialty.painPoints[0].split(" — ")[0]}?{" "}
                <span className="text-white font-semibold">
                  Doctor Diary eliminates this — and the 2 other silent revenue leaks draining your {city.label} practice today.
                </span>
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link
                  href={signupHref}
                  className="inline-flex items-center justify-center gap-2 bg-[#00B7A8] hover:bg-[#00A396] text-white font-bold text-base px-8 py-4 rounded-2xl transition-colors duration-200 shadow-lg shadow-[#00B7A8]/25 group"
                >
                  Set Up Your Clinic — It&apos;s Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-colors duration-200"
                >
                  Book a 15-min Demo
                </Link>
              </div>

              {/* Micro-trust row */}
              <p className="text-slate-500 text-sm font-medium">
                No credit card required &nbsp;·&nbsp; 5-minute setup &nbsp;·&nbsp; Cancel anytime
              </p>
            </div>

            {/* Hero stats bar */}
            <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/8">
              {[
                { value: "500+", label: "Active Clinics" },
                { value: "40%", label: "Avg. No-Show Reduction" },
                { value: "0%", label: "Commission, Forever" },
                { value: "5 min", label: "To Go Live" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/3 hover:bg-white/6 transition-colors px-6 py-5 text-center"
                >
                  <p className="text-2xl sm:text-3xl font-black text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2 — THE PROBLEM
            Specialty-specific pain points — dark card design
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#0B132B] py-20 sm:py-24 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
                The {specialty.shortLabel} Challenge in {city.label}
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Running a {specialty.shortLabel} clinic in {city.label} is harder than it needs to be.
              </h2>
              <p className="text-slate-400 text-base sm:text-lg font-medium">
                These aren&apos;t edge cases. Every independent {specialty.shortLabel} in {city.label} deals with these operational drains — daily.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {specialty.painPoints.map((pain, i) => {
                const [problem, impact] = pain.includes(" — ")
                  ? pain.split(" — ")
                  : [pain, null];
                return (
                  <div
                    key={i}
                    className="bg-white/4 border border-white/8 rounded-3xl p-6 sm:p-8 hover:bg-white/6 hover:border-white/15 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-400 font-black text-base flex items-center justify-center mb-5">
                      0{i + 1}
                    </div>
                    <p className="text-white font-bold text-base sm:text-lg leading-snug mb-3">
                      {problem}
                    </p>
                    {impact && (
                      <p className="text-rose-400/80 text-sm font-semibold">{impact}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 3 — THE SOLUTION
            4 feature tiles on light background
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFBFC] py-20 sm:py-24 px-4 sm:px-6 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
                <Zap className="w-3.5 h-3.5" /> Doctor Diary Does the Heavy Lifting
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight mb-4">
                Everything a {specialty.shortLabel} clinic in {city.label} needs.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
                  Nothing it doesn&apos;t.
                </span>
              </h2>
              <p className="text-slate-500 text-base sm:text-lg font-medium">
                Purpose-built for independent Indian clinics. Simple enough for a single-doctor practice. Powerful enough to run 100 patients a day.
              </p>
            </div>

            {/* 4 feature tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {FEATURES.map((feat) => (
                <div
                  key={feat.title}
                  className="bg-white border border-slate-200 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 group hover:shadow-lg"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                    {feat.icon}
                  </div>
                  <h3 className="text-[#0B132B] font-bold text-base mb-2">{feat.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>

            {/* Specialty-specific outcomes */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">
                Specifically for {specialty.shortLabel}s in {city.label}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {specialty.solutions.map((sol) => (
                  <li key={sol} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00B7A8] flex-shrink-0 mt-0.5" />
                    <span className="text-[#0B132B] font-medium text-sm leading-relaxed">{sol}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 4 — HOW IT WORKS
            3-step numbered timeline on white
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-white py-20 sm:py-24 px-4 sm:px-6 border-t border-slate-200/60">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
                <Clock className="w-3.5 h-3.5" /> 5-Minute Setup
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight">
                Your {specialty.shortLabel} clinic in {city.label} goes live in 3 steps.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line — desktop only */}
              <div className="hidden md:block absolute top-10 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200" />

              {[
                {
                  step: "01",
                  title: "Create Your Clinic Page",
                  body: `Enter your clinic name, specialty (${specialty.shortLabel}), consultation hours, and fees. Your personalised clinic URL is ready in under 5 minutes.`,
                  cta: null,
                },
                {
                  step: "02",
                  title: "Share With Your Patients",
                  body: "Share your QR code or WhatsApp booking link. Patients book 24/7 — no phone calls to your reception, no paper ledger entries.",
                  cta: null,
                },
                {
                  step: "03",
                  title: "Consult. We Handle the Rest.",
                  body: "See your live queue, issue digital prescriptions, track follow-ups, and watch no-shows drop — all from one clean dashboard.",
                  cta: null,
                },
              ].map((item) => (
                <div key={item.step} className="text-center relative z-10">
                  <div className="w-20 h-20 rounded-full bg-[#0B132B] text-white font-black text-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#0B132B]/20">
                    {item.step}
                  </div>
                  <h3 className="text-[#0B132B] font-bold text-lg mb-3">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href={signupHref}
                className="inline-flex items-center gap-2 bg-[#00B7A8] hover:bg-[#00A396] text-white font-bold px-8 py-4 rounded-2xl transition-colors duration-200 shadow-lg shadow-[#00B7A8]/20 group"
              >
                Set Up Your Clinic — It&apos;s Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 5 — TRUST INFRASTRUCTURE
            Enterprise-grade 4-pillar trust grid (light background)
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#F8FAFC] py-20 sm:py-24 px-4 sm:px-6 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
                <Shield className="w-3.5 h-3.5" /> Enterprise-Grade Trust Infrastructure
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight mb-4">
                Built Like Bank Software.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
                  Owned 100% By Your Practice.
                </span>
              </h2>
              <p className="text-slate-500 text-base sm:text-lg font-medium">
                Doctor Diary is engineered on high-resilience medical cloud infrastructure. We provide the enterprise backbone while you retain complete sovereignty over your patients and data.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TRUST_PILLARS.map((pillar) => (
                <div
                  key={pillar.title}
                  className="bg-white border border-slate-200/90 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 group shadow-sm hover:shadow-md"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                    {pillar.icon}
                  </div>
                  <h3 className="text-[#0B132B] font-bold text-base mb-2">{pillar.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{pillar.desc}</p>
                </div>
              ))}
            </div>

            {/* Integration ribbon */}
            <div className="mt-16 pt-10 border-t border-slate-200/60 text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                Natively integrated with tools your patients already use
              </p>
              <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-20 opacity-50 hover:opacity-100 transition-opacity duration-500">
                {/* WhatsApp */}
                <div className="flex items-center gap-2 font-black text-xl text-[#0B132B]">
                  <svg className="w-6 h-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </div>
                {/* Google */}
                <div className="flex items-center gap-2 font-black text-xl text-[#0B132B]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </div>
                {/* UPI */}
                <div className="flex items-center gap-2 font-black text-xl text-[#0B132B]">
                  <div className="px-2 py-0.5 rounded border-2 border-slate-700 text-sm tracking-tight">UPI</div>
                  Payments
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 6 — DOCTOR TESTIMONIALS
            Dark section, 3 verified outcome cards
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#0B132B] py-20 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-14 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Clinic Outcomes
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4">
                Independent practices. Real outcomes.
              </h2>
              <p className="text-slate-400 text-base sm:text-lg font-medium">
                Doctors across specialties use Doctor Diary to run calmer, more profitable clinics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "Dental procedures require strict scheduling. Doctor Diary's 24-hour and 2-hour WhatsApp reminders have brought our no-show rate to near-zero. Slots are perfectly aligned now.",
                  doctor: "Dr. MadhuRani",
                  clinic: "Smile Roots Dental Clinic",
                  city: "Indore",
                  specialty: "Orthodontist & Implantologist",
                  metric: "No-Shows Reduced to Near-Zero",
                },
                {
                  quote: "Cardiology patients used to crowd the reception asking 'Mera number kab aayega?'. With Live Queue tracking, patients wait comfortably. Reception calls dropped by 80%.",
                  doctor: "Dr. Sandeep Sharma",
                  clinic: "Sharma Cardiology Center",
                  city: "Jaipur",
                  specialty: "Consultant Cardiologist",
                  metric: "80% Drop in Front-Desk Calls",
                },
                {
                  quote: "Doctor Diary's automated WhatsApp follow-ups reactivated old patients who had completed aesthetic treatments, boosting repeat consultations by 35% in the first quarter.",
                  doctor: "Dr. Priya Nair",
                  clinic: "Nair Skin & Aesthetics Clinic",
                  city: "Kochi",
                  specialty: "Dermatologist & Cosmetologist",
                  metric: "35% Increase in Patient Retention",
                },
              ].map((t) => (
                <div
                  key={t.doctor}
                  className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:bg-white/8 hover:border-white/20 transition-all duration-300"
                >
                  <div>
                    <div className="flex gap-1 mb-5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-200 text-sm sm:text-base font-semibold leading-relaxed italic mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                  <div className="pt-5 border-t border-white/10">
                    <p className="text-white font-bold text-base">{t.doctor}</p>
                    <p className="text-slate-400 text-xs font-semibold mt-0.5">{t.specialty}</p>
                    <p className="text-[#00B7A8] text-xs font-bold mt-1">
                      {t.clinic} · {t.city}
                    </p>
                    <div className="mt-3 inline-block bg-emerald-500/10 border border-emerald-500/20 text-[#00B7A8] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                      ⚡ {t.metric}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 7 — FAQ
            5 specialty × city specific Qs — JSON-LD injected in <head>
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-white py-20 sm:py-24 px-4 sm:px-6 border-t border-slate-200/60">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
                Frequently Asked Questions
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight">
                Questions from {specialty.shortLabel}s in {city.label}
              </h2>
            </div>

            <FaqAccordion
              items={specialty.faqQuestions.map((q) => ({
                question: fillCity(q, city.label),
                answer: `Doctor Diary is purpose-built for independent ${specialty.shortLabel}s in ${city.label}, ${city.state}. It provides WhatsApp-based appointment booking (patients book without downloading any app), a live digital queue patients track on their phones, automated 24h + 2h reminder sequences, digital prescription generation, and a private branded clinic URL — all with 0% commission. Setup takes 5 minutes and your first 14 days are completely free.`,
              }))}
            />

            <p className="text-center text-slate-400 text-sm mt-10 font-medium">
              More questions?{" "}
              <Link href="/contact" className="text-[#00B7A8] font-bold hover:underline">
                Talk to our clinic success team →
              </Link>
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 8 — FINAL CTA
            Full-width emerald gradient banner
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-gradient-to-br from-[#00B7A8] via-emerald-600 to-[#00897B] py-20 sm:py-24 px-4 sm:px-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/10 rounded-full blur-[80px]" />
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
              <PhoneOff className="w-3.5 h-3.5" /> No more paper. No more missed calls.
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-6">
              Ready to run a smarter {specialty.shortLabel} clinic in {city.label}?
            </h2>
            <p className="text-white/85 text-base sm:text-xl font-medium leading-relaxed mb-10 max-w-2xl mx-auto">
              Join 500+ independent clinics across India who switched to Doctor Diary. No commission. No middleman. Your clinic, your patients, your revenue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-2 bg-white text-[#00897B] hover:bg-white/95 font-black text-base px-8 py-4 rounded-2xl transition-colors duration-200 shadow-xl group"
              >
                Set Up Your Clinic — It&apos;s Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-colors duration-200"
              >
                Book a 15-min Demo
              </Link>
            </div>
            <p className="text-white/60 text-sm font-medium mt-6">
              14-day free trial &nbsp;·&nbsp; No credit card &nbsp;·&nbsp; 5-minute setup &nbsp;·&nbsp; Cancel anytime
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════
            INTERNAL LINKS — Other cities and specialties
            Builds link equity and aids Google crawl of all 1,260 pages
        ══════════════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFBFC] py-14 px-4 sm:px-6 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {/* Other cities for this specialty */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  {specialty.shortLabel} clinic software in other cities
                </p>
                <div className="flex flex-wrap gap-2">
                  {CITIES.filter((c) => c.slug !== city.slug)
                    .slice(0, 12)
                    .map((c) => (
                      <Link
                        key={c.slug}
                        href={`/for/${specialty.slug}/${c.slug}`}
                        className="text-xs font-semibold text-slate-600 hover:text-[#00B7A8] bg-white border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-full transition-all duration-200"
                      >
                        {c.label}
                      </Link>
                    ))}
                </div>
              </div>

              {/* Other specialties in this city */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                  Clinic software for other specialists in {city.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.filter((s) => s.slug !== specialty.slug)
                    .slice(0, 12)
                    .map((s) => (
                      <Link
                        key={s.slug}
                        href={`/for/${s.slug}/${city.slug}`}
                        className="text-xs font-semibold text-slate-600 hover:text-[#00B7A8] bg-white border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-full transition-all duration-200"
                      >
                        {s.shortLabel}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
