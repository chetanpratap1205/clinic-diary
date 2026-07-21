"use server";

import { db } from "@/db";
import { clinics, clinicAdmins, availability, growthPartners, doctorLeads, leadActivities } from "@/db/schema";
import { eq, ilike, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function submitOnboarding(data: {
  name: string;
  doctorName: string;
  specialty: string;
  phone: string;
  slug: string;
  consultationFee: number;
  referralCode?: string;
  pincode: string;
  city: string;
  state: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to create a clinic." };
  }

  try {
    // Check if slug is taken (slug is unique in DB)
    // We rely on DB constraint to catch duplicates for safety, but could pre-check here

    let referredById = null;
    if (data.referralCode) {
      const [partner] = await db
        .select({ id: growthPartners.id })
        .from(growthPartners)
        .where(ilike(growthPartners.referralCode, data.referralCode))
        .limit(1);
      
      if (partner) {
        referredById = partner.id;
      }
    }

    // Insert Clinic
    const [newClinic] = await db.insert(clinics).values({
      name: data.name,
      doctorName: data.doctorName,
      specialty: data.specialty,
      phone: data.phone,
      slug: data.slug.toLowerCase(),
      consultationFee: data.consultationFee,
      referredBy: referredById,
      state: data.state,
      address: `${data.city}, ${data.state} - ${data.pincode}`,
    }).returning();

    // Link Admin
    await db.insert(clinicAdmins).values({
      clinicId: newClinic.id,
      authUserId: user.id,
    });

    // Seed default availability (Mon-Fri, 9am - 5pm, 30 min slots)
    const defaultAvailability = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
      clinicId: newClinic.id,
      dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
      slotDurationMinutes: 30,
    }));
    
    await db.insert(availability).values(defaultAvailability);

    // Auto-convert matching lead if referred
    if (referredById) {
      const [lead] = await db
        .select()
        .from(doctorLeads)
        .where(
          and(
            eq(doctorLeads.assignedTo, referredById),
            eq(doctorLeads.phone, data.phone)
          )
        )
        .limit(1);

      if (lead && lead.status !== "converted" && lead.status !== "rejected") {
        await db
          .update(doctorLeads)
          .set({ status: "converted", convertedAt: new Date() })
          .where(eq(doctorLeads.id, lead.id));
        
        await db.insert(leadActivities).values({
          leadId: lead.id,
          partnerId: referredById,
          type: "status_change",
          notes: "Lead automatically converted via referral signup",
          previousStatus: lead.status,
          newStatus: "converted"
        });
      }
    }

  } catch (error: any) {
    console.error("Onboarding error:", error);
    if (error.code === '23505') { // Postgres unique violation
      return { error: "This clinic URL (slug) is already taken. Please choose another." };
    }
    return { error: "An unexpected error occurred while saving your clinic." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
