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
  about?: string | null;
  logoUrl?: string | null;
  googleMapsUrl?: string | null;
  billingAddress?: string | null;
  state?: string | null;
  gstin?: string | null;
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
        about: data.about,
        logoUrl: data.logoUrl,
        googleMapsUrl: data.googleMapsUrl,
        billingAddress: data.billingAddress,
        state: data.state,
        gstin: data.gstin,
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
