import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Shield,
  Zap,
  Lock,
  ChevronRight,
  Check,
  X,
  HelpCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import { COMPARISONS, getComparisonBySlug } from "@/data/vs-data";
import FaqAccordion from "@/app/for/[specialty]/[city]/FaqAccordion";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return COMPARISONS.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = getComparisonBySlug(slug);

  if (!data) return {};

  return {
    title: `${data.title} | Doctor Diary`,
    description: data.metaDescription,
    alternates: {
      canonical: `https://doctor.naturexpress.in/vs/${slug}`,
    },
    openGraph: {
      title: data.title,
      description: data.metaDescription,
      url: `https://doctor.naturexpress.in/vs/${slug}`,
      siteName: "Doctor Diary",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.metaDescription,
    },
  };
}

function buildJsonLd(data: typeof COMPARISONS[0]) {
  const faqs = data.faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
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
        price: "1999",
        priceCurrency: "INR",
        description: "Quarterly flat subscription with 0% commission on patient bookings.",
      },
      description: data.metaDescription,
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
        { "@type": "ListItem", position: 2, name: "Comparisons", item: "https://doctor.naturexpress.in/vs" },
        {
          "@type": "ListItem",
          position: 3,
          name: `Doctor Diary vs ${data.competitorName}`,
          item: `https://doctor.naturexpress.in/vs/${data.slug}`,
        },
      ],
    },
  ]);
}

export default async function ComparisonPage({ params }: Props) {
  const { slug } = await params;
  const data = getComparisonBySlug(slug);

  if (!data) notFound();

  const jsonLd = buildJsonLd(data);
  const signupHref = `/signup?ref=vs_${data.slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <main className="bg-[#FAFBFC] min-h-screen">
        {/* ─── Hero Section ─────────────────────────────────────────── */}
        <section className="relative bg-[#040D21] pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#00B7A8]/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-8" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#00B7A8] transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <Link href="/vs" className="hover:text-[#00B7A8] transition-colors">Comparisons</Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-200">Doctor Diary vs {data.competitorName}</span>
            </nav>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              {data.badgeText}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight max-w-4xl mx-auto mb-6">
              {data.title}
            </h1>

            <p className="text-slate-300 text-base sm:text-xl font-medium leading-relaxed max-w-3xl mx-auto mb-10">
              {data.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-2 bg-[#00B7A8] hover:bg-[#00A396] text-white font-bold text-base px-8 py-4 rounded-2xl transition-colors duration-200 shadow-lg shadow-[#00B7A8]/25 group"
              >
                Switch to Doctor Diary Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-colors duration-200"
              >
                Book a 15-Min Demo
              </Link>
            </div>
          </div>
        </section>

        {/* ─── Pricing & Commission Contrast Cards ────────────────────── */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Diary Card */}
            <div className="bg-white border-2 border-[#00B7A8] rounded-3xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#00B7A8] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">
                Recommended
              </div>
              <h3 className="text-xl font-black text-[#0B132B] mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-[#00B7A8]" />
                Doctor Diary
              </h3>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing Model</p>
                  <p className="text-lg font-extrabold text-[#0B132B] mt-0.5">{data.pricingSummary.doctorDiary}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commission Cut</p>
                  <p className="text-sm font-bold text-[#00B7A8] mt-0.5">{data.commissionComparison.doctorDiary}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 font-medium border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00B7A8]" /> 100% Patient Data Sovereignty</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00B7A8]" /> Native WhatsApp Appointment Booking</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#00B7A8]" /> Live OPD Queue Mobile Tracking</li>
              </ul>
            </div>

            {/* Competitor Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-700 mb-4 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-rose-500" />
                {data.competitorName}
              </h3>
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pricing Model</p>
                  <p className="text-lg font-extrabold text-slate-700 mt-0.5">{data.pricingSummary.competitor}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Commission Cut</p>
                  <p className="text-sm font-bold text-rose-500 mt-0.5">{data.commissionComparison.competitor}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-slate-500 font-medium border-t border-slate-100 pt-4">
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-rose-400" /> Shared Marketplace Directory</li>
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-rose-400" /> Mandatory App Download or SMS fees</li>
                <li className="flex items-center gap-2"><X className="w-4 h-4 text-rose-400" /> No Live OPD Queue System</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ─── Key Differences Grid ─────────────────────────────────── */}
        <section className="bg-[#0B132B] py-20 px-4 sm:px-6 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
                Core Architectural Advantages
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                3 Reasons Doctors Switch from {data.competitorName}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.keyDifferences.map((diff, idx) => {
                const [title, desc] = diff.split(" — ");
                return (
                  <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8">
                    <div className="w-10 h-10 rounded-xl bg-[#00B7A8]/20 text-[#00B7A8] font-black flex items-center justify-center mb-4 text-lg">
                      0{idx + 1}
                    </div>
                    <h3 className="font-bold text-lg text-white mb-2">{title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Feature Comparison Table ─────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight mb-4">
              Feature-by-Feature Matrix
            </h2>
            <p className="text-slate-500 text-base font-medium">
              See how Doctor Diary compares against {data.competitorName} across operational capabilities.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-black uppercase text-slate-500 tracking-wider">
                    <th className="py-4 px-6">Feature / Capability</th>
                    <th className="py-4 px-6 text-[#00B7A8] bg-emerald-50/50">Doctor Diary</th>
                    <th className="py-4 px-6 text-slate-600">{data.competitorName}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm font-medium">
                  {data.features.map((f, i) => (
                    <tr key={i} className={f.highlight ? "bg-emerald-50/20" : "hover:bg-slate-50/50"}>
                      <td className="py-4 px-6 font-semibold text-[#0B132B]">{f.feature}</td>
                      <td className="py-4 px-6 bg-emerald-50/30 font-bold text-[#00B7A8]">
                        {typeof f.doctorDiary === "boolean" ? (
                          f.doctorDiary ? <CheckCircle2 className="w-5 h-5 text-[#00B7A8]" /> : <X className="w-5 h-5 text-slate-300" />
                        ) : (
                          f.doctorDiary
                        )}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {typeof f.competitor === "boolean" ? (
                          f.competitor ? <Check className="w-5 h-5 text-slate-600" /> : <XCircle className="w-5 h-5 text-rose-400" />
                        ) : (
                          f.competitor
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── FAQ Section ──────────────────────────────────────────── */}
        <section className="bg-white py-20 px-4 sm:px-6 border-t border-slate-200/60">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
                <HelpCircle className="w-3.5 h-3.5" /> Frequently Asked Questions
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0B132B] tracking-tight">
                Doctor Diary vs {data.competitorName} FAQs
              </h2>
            </div>

            <FaqAccordion items={data.faqs} />
          </div>
        </section>

        {/* ─── Final CTA Banner ─────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-[#00B7A8] via-emerald-600 to-[#00897B] py-20 px-4 sm:px-6 text-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight">
              Ready to take full ownership of your clinic?
            </h2>
            <p className="text-white/90 text-lg sm:text-xl font-medium mb-10 max-w-2xl mx-auto">
              Join independent doctors across India & UAE who cut patient no-shows and eliminated third-party commission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={signupHref}
                className="inline-flex items-center justify-center gap-2 bg-white text-[#00897B] font-black text-base px-8 py-4 rounded-2xl shadow-xl hover:bg-white/95 transition-colors"
              >
                Set Up Your Clinic — It&apos;s Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
