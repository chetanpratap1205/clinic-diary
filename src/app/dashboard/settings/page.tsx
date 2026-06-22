import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clinic Settings</h1>
        <p className="text-slate-500 mt-1">Manage your brand identity and public profile.</p>
      </div>

      <SettingsClient initialData={initialData} slug={clinic.slug} />
    </div>
  );
}
