import { db } from "@/db";
import { clinics, subscriptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { addDays, differenceInDays, isBefore } from "date-fns";

export interface ClinicAccessStatus {
  hasAccess: boolean;
  status: "active" | "trial_active" | "trial_expired";
  daysRemaining: number | null;
  trialEndDate: Date | null;
}

export const TRIAL_PERIOD_DAYS = 14;

/**
 * Checks subscription or trial status for a clinic.
 * 
 * Rules:
 * 1. Active paid subscription -> FULL ACCESS (status: "active")
 * 2. Within 14 days of clinic creation -> FULL ACCESS (status: "trial_active", returns days remaining)
 * 3. Trial expired & no active subscription -> WRITE-LOCKED (status: "trial_expired", preserves read access)
 */
export async function getClinicAccessStatus(clinicId: string): Promise<ClinicAccessStatus> {
  // 1. Check for active paid subscription
  const activeSubs = await db
    .select()
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.clinicId, clinicId),
        eq(subscriptions.status, "active")
      )
    )
    .limit(1);

  if (activeSubs.length > 0) {
    return {
      hasAccess: true,
      status: "active",
      daysRemaining: null,
      trialEndDate: null,
    };
  }

  // 2. Fetch clinic creation timestamp to evaluate 14-day trial
  const clinicRecords = await db
    .select({ createdAt: clinics.createdAt })
    .from(clinics)
    .where(eq(clinics.id, clinicId))
    .limit(1);

  if (clinicRecords.length === 0) {
    return {
      hasAccess: false,
      status: "trial_expired",
      daysRemaining: 0,
      trialEndDate: null,
    };
  }

  const createdAt = new Date(clinicRecords[0].createdAt);
  const trialEndDate = addDays(createdAt, TRIAL_PERIOD_DAYS);
  const now = new Date();

  if (isBefore(now, trialEndDate)) {
    const daysRemaining = Math.max(1, differenceInDays(trialEndDate, now) + 1);
    return {
      hasAccess: true,
      status: "trial_active",
      daysRemaining,
      trialEndDate,
    };
  }

  return {
    hasAccess: false,
    status: "trial_expired",
    daysRemaining: 0,
    trialEndDate,
  };
}
