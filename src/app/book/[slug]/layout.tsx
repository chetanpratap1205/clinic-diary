import type { ReactNode } from "react";
import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone } from "lucide-react";

export default async function BookingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [clinic] = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  if (!clinic) notFound();

  const themeColor = clinic.themeColor ?? "#0ea5e9";

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ minHeight: "100dvh" }}>
      {/* 3px brand accent at very top */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ backgroundColor: themeColor }} />

      {/* Sticky top nav — clinic name + call CTA */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800 truncate max-w-[60%]">{clinic.name}</p>
          {clinic.phone && (
            <a
              href={`tel:${clinic.phone}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-1.5 rounded-full transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
              style={{ backgroundColor: themeColor }}
            >
              <Phone className="w-3 h-3" />
              Call Clinic
            </a>
          )}
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 overflow-hidden">
        {children}
      </main>

      <footer className="border-t border-slate-100 py-6 pb-safe flex-shrink-0 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 text-xs">
            © {new Date().getFullYear()} {clinic.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-slate-400 text-xs hover:text-slate-600 transition-colors">Terms</Link>
            <p className="text-slate-400 text-xs">
              Powered by{" "}
              <Link href="/" className="font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                Doctor Diary by NatureXpress
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
