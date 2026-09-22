import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, Zap } from "lucide-react";
import { COMPARISONS } from "@/data/vs-data";

export const metadata: Metadata = {
  title: "Clinic Software Comparisons & Alternatives | Doctor Diary",
  description: "Compare Doctor Diary with Practo, Zocdoc, Lybrate, Clinicea, and traditional paper registers. Discover why independent doctors in India & UAE choose 0% commission.",
  alternates: {
    canonical: "https://doctor.naturexpress.in/vs",
  },
};

export default function ComparisonsHubPage() {
  return (
    <main className="bg-[#FAFBFC] min-h-screen">
      {/* Hero */}
      <section className="bg-[#040D21] py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
            Software Comparisons & Alternatives
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            Why Independent Doctors Choose{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] to-emerald-400">
              Doctor Diary
            </span>
          </h1>
          <p className="text-slate-300 text-base sm:text-lg font-medium max-w-2xl mx-auto mb-8">
            Compare feature-by-feature, pricing models, commission rates, and patient data privacy policies across leading platforms.
          </p>
        </div>
      </section>

      {/* Comparisons Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {COMPARISONS.map((item) => (
            <div
              key={item.slug}
              className="bg-white border border-slate-200 hover:border-[#00B7A8] rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="inline-block bg-emerald-50 text-[#00B7A8] text-xs font-bold px-3 py-1 rounded-full mb-4">
                  {item.badgeText}
                </div>
                <h2 className="text-2xl font-black text-[#0B132B] mb-3 group-hover:text-[#00B7A8] transition-colors">
                  Doctor Diary vs {item.competitorName}
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                  {item.subtitle}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed Matrix</span>
                <Link
                  href={`/vs/${item.slug}`}
                  className="inline-flex items-center gap-2 text-[#00B7A8] font-bold text-sm hover:underline"
                >
                  View Comparison
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
