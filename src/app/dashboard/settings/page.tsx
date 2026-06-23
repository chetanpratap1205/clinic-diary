import { db } from "@/db";
import { clinics, availability } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";
import { AvailabilityClient } from "./availability-client";

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

  const initialData = {
    name: clinic.name,
    doctorName: clinic.doctorName,
    specialty: clinic.specialty,
    consultationFee: clinic.consultationFee || 0,
    address: clinic.address,
    phone: clinic.phone,
    themeColor: clinic.themeColor,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Clinic Settings</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your brand identity, public profile, and working hours.</p>
      </div>

      <SettingsClient initialData={initialData} slug={clinic.slug} />
      
      <div className="pt-2 sm:pt-4">
        <AvailabilityClient initialAvailability={clinicAvailability} />
      </div>
    </div>
  );
}
