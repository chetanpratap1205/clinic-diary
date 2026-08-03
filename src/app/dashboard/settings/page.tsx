import { db } from "@/db";
import { clinics, availability, availabilityOverrides } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { SettingsClient } from "./settings-client";
import { AvailabilityClient } from "./availability-client";
import { HolidayClient } from "./holiday-client";
import { QrCodeWidget } from "@/components/dashboard/qr-code-widget";
import { MessageCircle, Sparkles, ShieldCheck, Link as LinkIcon, ExternalLink, Download } from "lucide-react";

export const metadata = {
  title: "Your Website | Doctor Diary",
};

export default async function SettingsPage() {
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  if (!user.clinicId) {
    redirect("/onboarding");
  }

  const clinicResult = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, user.clinicId))
    .limit(1);

  if (!clinicResult.length) {
    redirect("/onboarding");
  }

  const clinic = clinicResult[0];

  const clinicAvailability = await db
    .select()
    .from(availability)
    .where(eq(availability.clinicId, user.clinicId));

  const initialHolidays = await db
    .select()
    .from(availabilityOverrides)
    .where(eq(availabilityOverrides.clinicId, user.clinicId));

  const initialData = {
    name: clinic.name,
    doctorName: clinic.doctorName,
    degree: clinic.degree,
    specialty: clinic.specialty,
    consultationFee: clinic.consultationFee || 0,
    freeFollowupDays: clinic.freeFollowupDays ?? 0, // P0
    address: clinic.address,
    phone: clinic.phone,
    themeColor: clinic.themeColor,
    about: clinic.about,
    logoUrl: clinic.logoUrl,
    heroImageUrl: clinic.heroImageUrl,
    googleMapsUrl: clinic.googleMapsUrl,
    billingAddress: clinic.billingAddress,
    state: clinic.state,
    gstin: clinic.gstin,
    whatsappNumber: clinic.whatsappNumber,
    instagramUrl: clinic.instagramUrl,
    facebookUrl: clinic.facebookUrl,
    vitalsPresets: clinic.vitalsPresets || [],
    complaintPresets: clinic.complaintPresets || [],
    diagnosisPresets: clinic.diagnosisPresets || [],
    treatmentPresets: clinic.treatmentPresets || [],
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-6xl mx-auto pb-safe bottom-nav-spacing lg:pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Your Clinic Website
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base max-w-2xl">
          You don&apos;t need a website — you have one. Everything below controls what your patients see when they find you online.
        </p>
      </div>

      {/* Public Presence & Sharing */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="p-6 sm:p-8 flex-1 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold tracking-wide mb-4 w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live on Internet
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Your Public Booking Page</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md">
            This is your clinic's digital front door. Share this link on WhatsApp, Instagram, or Google My Business.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <LinkIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                readOnly
                value={`https://doctor.naturexpress.in/book/${clinic.slug}`}
                className="bg-transparent text-sm font-semibold text-slate-700 w-full focus:outline-none"
              />
            </div>
            <a
              href={`/book/${clinic.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit
            </a>
          </div>
        </div>
        <div className="p-6 sm:p-8 bg-slate-50/50 flex flex-col items-center justify-center md:min-w-[320px]">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            Booking QR Code
          </h3>
          <QrCodeWidget
            clinicId={clinic.id}
            clinicName={clinic.name}
            slug={clinic.slug}
            themeColor={clinic.themeColor ?? "#0ea5e9"}
          />
        </div>
      </div>

      <SettingsClient initialData={initialData} slug={clinic.slug} />

      {/* Working Hours & Holidays */}
      <div className="pt-2 sm:pt-4 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">Availability</h2>
          <p className="text-slate-500 text-sm">Set your working hours — patients can only book during these times.</p>
        </div>
        <AvailabilityClient initialAvailability={clinicAvailability} />
        <HolidayClient initialHolidays={initialHolidays} />
      </div>

      {/* Customer Success Note */}
      <div className="pt-4 sm:pt-8">
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-500/20 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-400/30 shadow-inner z-10 rotate-3">
            <MessageCircle className="w-8 h-8 text-indigo-300" />
          </div>
          <div className="flex-1 text-center sm:text-left z-10">
            <h3 className="text-xs sm:text-sm font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Dedicated Success Manager
            </h3>
            <p className="text-indigo-100/90 text-sm sm:text-base leading-relaxed mb-5 font-medium max-w-2xl">
              "We believe software should serve the doctor, not the other way around. My team's only mission is your clinic's success. Need a feature tweaked? Want staff training? We are right here to help you get the maximum value."
            </p>
            <div className="font-bold text-white text-base">Customer Success Leadership</div>
            <div className="text-indigo-300/70 text-xs font-bold uppercase tracking-widest mt-0.5">Doctor Diary VIP Support</div>
          </div>
        </div>
      </div>

      {/* Founder Direct Access Banner */}
      <div className="pt-8 sm:pt-12">
        <div className="relative group overflow-hidden rounded-[2rem] bg-slate-900 p-[1px] shadow-2xl">
          {/* Animated Glow Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 opacity-20 group-hover:opacity-40 transition-opacity duration-700 blur-xl"></div>

          <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12 overflow-hidden border border-slate-700/50">
            {/* Background ambient lighting */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/20 rounded-full blur-[64px] pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-sky-500/20 rounded-full blur-[64px] pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>

            <div className="flex-1 z-10 w-full flex flex-col sm:flex-row items-center lg:items-start gap-6 lg:gap-8">
              {/* Profile Photo */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                <Image
                  src="/chetan_profile_photo.png"
                  alt="Founder"
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                />
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] sm:text-xs font-black tracking-widest uppercase mb-3 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5" />
                  Premium Partnership
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 flex items-center justify-center sm:justify-start gap-2 sm:gap-3">
                  Founder Direct Access <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </h3>
                <p className="text-emerald-400/90 text-xs sm:text-sm font-bold tracking-wide mb-3.5">
                  Chetan Pratap &bull; MBA in Innovation, Entrepreneurship &amp; Venture Development
                </p>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto sm:mx-0 font-medium">
                  We believe in building true, lasting partnerships with our doctors. If you ever need a custom feature built, face any technical issue, or just want to share feedback to improve the platform, you have a direct line to me.
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 z-10 w-full sm:w-auto flex flex-col items-center">
              <a
                href="https://wa.me/918077170715?text=Hi%20Chetan,%20I'm%20using%20Doctor%20Diary%20and%20I'd%20like%20to..."
                target="_blank"
                rel="noopener noreferrer"
                className="group/btn relative w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 sm:px-10 sm:py-5 rounded-2xl font-extrabold text-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(37,211,102,0.6)] active:scale-95"
              >
                <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-white" />
                <span>Message Founder</span>
              </a>
              <div className="flex items-center gap-2 mt-4 text-slate-400 text-xs sm:text-sm font-semibold tracking-wide">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Replies usually within minutes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
