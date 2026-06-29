import { db } from "@/db";
import { clinics, availability, availabilityOverrides } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";
import { AvailabilityClient } from "./availability-client";
import { HolidayClient } from "./holiday-client";
import { MessageCircle, Sparkles, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Settings | Dashboard",
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
    specialty: clinic.specialty,
    consultationFee: clinic.consultationFee || 0,
    address: clinic.address,
    phone: clinic.phone,
    themeColor: clinic.themeColor,
    about: clinic.about,
    logoUrl: clinic.logoUrl,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-6xl mx-auto pb-safe bottom-nav-spacing lg:pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Clinic Settings</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your brand identity, public profile, and working hours.</p>
      </div>

      <SettingsClient initialData={initialData} slug={clinic.slug} />
      
      <div className="pt-2 sm:pt-4">
        <AvailabilityClient initialAvailability={clinicAvailability} />
        <HolidayClient initialHolidays={initialHolidays} />
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
            
            <div className="flex-1 text-center lg:text-left z-10 w-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] sm:text-xs font-black tracking-widest uppercase mb-4 shadow-inner">
                <Sparkles className="w-3.5 h-3.5" />
                Premium Partnership
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                Founder Direct Access <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                We believe in building true, lasting partnerships with our doctors. If you ever need a custom feature built, face any technical issue, or just want to share feedback to improve the platform, you have a direct line to me.
              </p>
            </div>

            <div className="flex-shrink-0 z-10 w-full sm:w-auto flex flex-col items-center">
              <a 
                href="https://wa.me/918077170715?text=Hi%20Chetan,%20I'm%20using%20Clinic%20Diary%20and%20I'd%20like%20to..."
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
