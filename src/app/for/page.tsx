import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Stethoscope, MapPin } from "lucide-react";
import { SPECIALTIES, CITIES } from "@/data/seo-data";

export const metadata: Metadata = {
  title: "Clinic Software by Specialty & City in India | Doctor Diary",
  description:
    "Doctor Diary helps independent doctors across all specialties and cities in India manage appointments, reduce no-shows, and run more profitable clinics — with 0% commission.",
  alternates: {
    canonical: "https://doctor.naturexpress.in/for",
  },
};

export default function SolutionsIndexPage() {
  return (
    <main className="bg-[#FAFBFC] min-h-screen">
      {/* Hero */}
      <section className="bg-[#040D21] py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00B7A8]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
            Clinic Software for Every Specialty
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            Doctor Diary is built for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] to-emerald-400">
              every independent clinic
            </span>{" "}
            in India.
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-medium max-w-2xl mx-auto mb-8">
            42 specialties. 30 cities. One platform. 0% commission. Choose your
            specialty and city to see how Doctor Diary works for your practice.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-[#00B7A8] hover:bg-[#00A396] text-white font-bold px-8 py-4 rounded-2xl transition-colors duration-200 shadow-lg shadow-[#00B7A8]/25 group"
          >
            Set Up Your Clinic — It&apos;s Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Specialties Grid */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Stethoscope className="w-5 h-5 text-[#00B7A8]" />
            <h2 className="text-xl font-black text-[#0B132B]">Browse by Specialty</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {SPECIALTIES.map((s) => (
              <Link
                key={s.slug}
                href={`/for/${s.slug}/mumbai`}
                className="bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md rounded-2xl px-4 py-3 text-sm font-semibold text-[#0B132B] hover:text-[#00B7A8] transition-all duration-200 leading-snug"
              >
                {s.shortLabel}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="pb-16 sm:pb-20 px-4 sm:px-6 border-t border-slate-200/60 pt-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <MapPin className="w-5 h-5 text-[#00B7A8]" />
            <h2 className="text-xl font-black text-[#0B132B]">Browse by City</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {CITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/for/general-physician/${c.slug}`}
                className="bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md rounded-2xl px-4 py-3 text-center transition-all duration-200 group"
              >
                <p className="text-sm font-bold text-[#0B132B] group-hover:text-[#00B7A8] transition-colors">
                  {c.label}
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{c.state}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
