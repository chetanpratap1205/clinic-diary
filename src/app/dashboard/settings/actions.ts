"use server";

import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface SettingsData {
  name: string;
  doctorName: string;
  specialty: string;
  consultationFee: number;
  address: string | null;
  phone: string;
  themeColor: string | null;
}

export async function updateClinicSettings(data: SettingsData) {
  try {
    const user = await getAuthUser();
    if (!user || !user.clinicId) {
      return { error: "Unauthorized" };
    }

    await db
      .update(clinics)
      .set({
        name: data.name,
        doctorName: data.doctorName,
        specialty: data.specialty,
        consultationFee: data.consultationFee,
        address: data.address,
        phone: data.phone,
        themeColor: data.themeColor,
      })
      .where(eq(clinics.id, user.clinicId));

    revalidatePath("/dashboard/settings");
    revalidatePath(`/book`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { error: "Failed to save settings. Please try again." };
  }
}
