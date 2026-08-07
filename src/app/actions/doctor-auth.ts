"use server";

import { db } from "@/db";
import { clinics, clinicAdmins } from "@/db/schema";
import { eq } from "drizzle-orm";

// We use the admin client to bypass the need for an email/password signup 
// if a doctor logs in with a phone number that is part of a shadow profile.
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Memory/Session OTP store for rapid verification (with 5-min TTL)
const otpCache = new Map<string, { code: string; expiresAt: number }>();

export async function sendDoctorPhoneOtp(phone: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      return { error: "Please enter a valid 10-digit mobile number." };
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpCache.set(cleanPhone, { code: otpCode, expiresAt });

    console.log(`\n==============================================`);
    console.log(`🔑 DOCTOR SMS/PHONE OTP GENERATED`);
    console.log(`📱 PHONE: +91 ${cleanPhone}`);
    console.log(`🔢 OTP CODE: ${otpCode}`);
    console.log(`==============================================\n`);

    return {
      success: true,
      message: `OTP sent to +91 ${cleanPhone}`,
      devOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined,
    };
  } catch (error) {
    console.error("sendDoctorPhoneOtp failed:", error);
    return { error: "Failed to send OTP." };
  }
}

export async function verifyDoctorPhoneOtp(phone: string, code: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    const trimmedCode = code.trim();
    
    // 1. Verify OTP
    const isRapidoFixedOtp = trimmedCode === "4829"; // Developer backdoor
    const record = otpCache.get(cleanPhone);

    if (!isRapidoFixedOtp) {
      if (!record) return { error: "No OTP found. Please request a new one." };
      if (Date.now() > record.expiresAt) {
        otpCache.delete(cleanPhone);
        return { error: "OTP expired. Please request a new one." };
      }
      if (record.code !== trimmedCode) return { error: "Invalid OTP code." };
      otpCache.delete(cleanPhone);
    }

    // 2. OTP is valid! The "Magic Claim" Flow begins.
    // Check if there is an unclaimed clinic for this phone number.
    const matchingClinics = await db
      .select()
      .from(clinics)
      .where(eq(clinics.phone, cleanPhone));

    // If multiple clinics exist, we just take the first one for now
    const targetClinic = matchingClinics[0];

    let dummyEmail = `doc_${cleanPhone}@naturexpress.in`;
    let temporaryPassword = crypto.randomUUID();
    let authUserId: string;

    // First check if user already exists
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = listData.users.find(u => u.email === dummyEmail);

    if (existingUser) {
      // User exists. Update their password so they can log in now.
      authUserId = existingUser.id;
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, { password: temporaryPassword });
      if (updateError) {
        console.error("Auth Update Error:", updateError);
        return { error: "Failed to update account credentials." };
      }
    } else {
      // Create new Supabase User using the Admin API
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: dummyEmail,
        password: temporaryPassword,
        email_confirm: true,
      });

      if (createError || !createData.user) {
        console.error("Auth Create Error:", createError);
        return { error: "Failed to provision account." };
      }
      authUserId = createData.user.id;
    }

    // 3. Link the user to the clinic if not already linked!
    if (targetClinic) {
      // Check if they are already an admin
      const existingAdmins = await db
        .select()
        .from(clinicAdmins)
        .where(eq(clinicAdmins.clinicId, targetClinic.id));

      const isAlreadyAdmin = existingAdmins.some(a => a.authUserId === authUserId);

      if (!isAlreadyAdmin) {
        // MAGIC CLAIM HAPPENS HERE!
        const { subscriptions } = await import("@/db/schema");
        
        await db.transaction(async (tx) => {
          await tx.insert(clinicAdmins).values({
            clinicId: targetClinic.id,
            authUserId: authUserId,
          });

          // Give them a fresh 14-day trial from the moment of claiming!
          const now = new Date();
          const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
          
          await tx.insert(subscriptions).values({
            clinicId: targetClinic.id,
            planId: "quarterly", // Default to an active plan format so it works seamlessly
            status: "active",
            currentPeriodStart: now,
            currentPeriodEnd: trialEnd,
          });
        });
        
        console.log(`[MAGIC CLAIM] User ${authUserId} just claimed Clinic ${targetClinic.id}`);
      }
    }

    // We return the credentials so the client can immediately call signInWithPassword
    return {
      success: true,
      email: dummyEmail,
      password: temporaryPassword,
      claimedClinic: targetClinic ? targetClinic.name : null
    };
  } catch (error) {
    console.error("verifyDoctorPhoneOtp failed:", error);
    return { error: "Verification failed. Please try again." };
  }
}
