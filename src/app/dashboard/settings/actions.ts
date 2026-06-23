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

export async function updateClinicAvailability(availabilityData: any[]) {
  try {
    const user = await getAuthUser();
    if (!user || !user.clinicId) {
      return { error: "Unauthorized" };
    }

    const { availability } = await import("@/db/schema");

    // Clear existing
    await db.delete(availability).where(eq(availability.clinicId, user.clinicId));

    // Insert new
    if (availabilityData.length > 0) {
      const recordsToInsert = availabilityData.map(a => ({
        clinicId: user.clinicId!,
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        slotDurationMinutes: a.slotDurationMinutes,
      }));
      await db.insert(availability).values(recordsToInsert);
    }

    revalidatePath("/dashboard/settings");
    revalidatePath(`/book`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update availability:", error);
    return { error: "Failed to save availability. Please try again." };
  }
}
