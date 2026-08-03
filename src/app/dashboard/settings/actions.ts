"use server";

import { db } from "@/db";
import { clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface SettingsData {
  name: string;
  doctorName: string;
  degree?: string | null;
  specialty: string;
  consultationFee: number;
  freeFollowupDays: number; // P0: 0 = no free follow-ups, N = free within N days
  address: string | null;
  phone: string;
  themeColor: string | null;
  about?: string | null;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  googleMapsUrl?: string | null;
  billingAddress?: string | null;
  state?: string | null;
  gstin?: string | null;
  whatsappNumber?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  vitalsPresets: string[];
  complaintPresets: string[];
  diagnosisPresets: string[];
  treatmentPresets: string[];
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
        degree: data.degree,
        specialty: data.specialty,
        consultationFee: data.consultationFee,
        freeFollowupDays: data.freeFollowupDays ?? 0, // P0
        address: data.address,
        phone: data.phone,
        themeColor: data.themeColor,
        about: data.about,
        logoUrl: data.logoUrl,
        heroImageUrl: data.heroImageUrl,
        googleMapsUrl: data.googleMapsUrl,
        billingAddress: data.billingAddress,
        state: data.state,
        gstin: data.gstin,
        whatsappNumber: data.whatsappNumber,
        instagramUrl: data.instagramUrl,
        facebookUrl: data.facebookUrl,
        vitalsPresets: data.vitalsPresets,
        complaintPresets: data.complaintPresets,
        diagnosisPresets: data.diagnosisPresets,
        treatmentPresets: data.treatmentPresets,
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

    await db.transaction(async (tx) => {
      // Clear existing
      await tx.delete(availability).where(eq(availability.clinicId, user.clinicId!));

      // Insert new
      if (availabilityData.length > 0) {
        const recordsToInsert = availabilityData.map(a => ({
          clinicId: user.clinicId!,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          slotDurationMinutes: a.slotDurationMinutes,
        }));
        await tx.insert(availability).values(recordsToInsert);
      }
    });

    revalidatePath("/dashboard/settings");
    revalidatePath(`/book`);

    return { success: true };
  } catch (error) {
    console.error("Failed to update availability:", error);
    return { error: "Failed to save availability. Please try again." };
  }
}

export async function addHoliday(date: string) {
  try {
    const user = await getAuthUser();
    if (!user || !user.clinicId) return { error: "Unauthorized" };

    const { availabilityOverrides } = await import("@/db/schema");
    await db.insert(availabilityOverrides).values({
      clinicId: user.clinicId,
      date,
      isClosed: true,
    });

    revalidatePath("/dashboard/settings");
    revalidatePath(`/book`);
    return { success: true };
  } catch (error) {
    console.error("Failed to add holiday:", error);
    return { error: "Failed to add holiday" };
  }
}

export async function removeHoliday(id: string) {
  try {
    const user = await getAuthUser();
    if (!user || !user.clinicId) return { error: "Unauthorized" };

    const { availabilityOverrides } = await import("@/db/schema");
    const { and } = await import("drizzle-orm");
    await db.delete(availabilityOverrides).where(
      and(
        eq(availabilityOverrides.id, id),
        eq(availabilityOverrides.clinicId, user.clinicId)
      )
    );

    revalidatePath("/dashboard/settings");
    revalidatePath(`/book`);
    return { success: true };
  } catch (error) {
    console.error("Failed to remove holiday:", error);
    return { error: "Failed to remove holiday" };
  }
}
