export const dynamic = "force-dynamic";

import Link from "next/link";
import { Clock, BookOpen, Zap, Trophy, ArrowRight } from "lucide-react";
import { chapters, colorMap } from "./_data/chapters";

export const metadata = {
  title: "Sales Training Hub — Doctor Diary Employee Portal",
};

const stats = [
  { icon: BookOpen, value: "13", label: "Chapters" },
  { icon: Clock, value: "~2.5hr", label: "Total Read Time" },
  { icon: Zap, value: "70+", label: "Real Scripts" },
  { icon: Trophy, value: "8", label: "WhatsApp Templates" },
];

export default function TrainingHubPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-400/10 px-2.5 py-1 rounded-full border border-teal-400/20">
              🎓 Sales Playbook
            </span>
            <span className="text-xs text-slate-400">v1.0 — Sirf Field Ke Liye</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            Doctor Diary
            <br />
            <span className="text-teal-400">Sales Training Hub</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
            Real Hinglish scripts. Ground reality. Jo textbook mein nahi milta.
            Reception se leke doctor tak — har situation ka jawab yahan hai.
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-4 mt-5">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-none">{value}</p>
                  <p className="text-[10px] text-slate-400">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access — Hot Chapters */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          ⚡ Quick Access — Most Used
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { slug: "call-reception", label: "Reception Script", icon: "📞" },
            { slug: "call-doctor", label: "Doctor Script", icon: "👨‍⚕️" },
            { slug: "situational", label: "Situational Selling", icon: "🎭" },
            { slug: "objections", label: "Handle Objections", icon: "⚡" },
          ].map((item) => (
            <Link
              key={item.slug}
              href={`/employee/training/${item.slug}`}
              className="flex flex-col items-center gap-2 bg-white border border-slate-200 rounded-xl p-3 hover:border-teal-400 hover:shadow-md transition-all group text-center"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-xs font-semibold text-slate-700 leading-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* All Chapters */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          📚 All Chapters
        </h2>
        <div className="space-y-2">
          {chapters.map((chap, index) => {
            const colors = colorMap[chap.color] ?? colorMap.teal;
            return (
              <Link
                key={chap.slug}
                href={`/employee/training/${chap.slug}`}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-400 hover:shadow-md transition-all group"
              >
                {/* Chapter Number + Emoji */}
                <div
                  className={`w-12 h-12 rounded-xl ${colors.bg} flex flex-col items-center justify-center shrink-0 border ${colors.border}`}
                >
                  <span className="text-lg leading-none">{chap.emoji}</span>
                  <span className={`text-[9px] font-bold ${colors.text} mt-0.5`}>
                    {String(index).padStart(2, "0")}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">
                      {chap.title}
                    </h3>
                    <span
                      className={`hidden sm:inline-flex text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0 ${colors.badge}`}
                    >
                      {chap.color}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{chap.tagline}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {chap.readTime}
                    </span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className="text-[10px] text-slate-400">
                      {chap.blocks.length} sections
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Founder Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl shrink-0">🎯</span>
          <div>
            <p className="text-sm font-bold text-amber-900 mb-1">
              Founder&apos;s Note — Isko Seriously Lo
            </p>
            <p className="text-xs text-amber-800 leading-relaxed">
              Ye content sirf padh lena kaafi nahi hai. Har script ko loud bol
              ke practice karo — mirror ke saamne, dost ke saath, kisi ko bhi.
              Jab script natural lagni lage, tab field mein jaao. Embarrassment
              temporary hoti hai, skill permanent hoti hai.
            </p>
            <p className="text-xs font-bold text-amber-900 mt-2">
              — Chetan, Founder Doctor Diary
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
