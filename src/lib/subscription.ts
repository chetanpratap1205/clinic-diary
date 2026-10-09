import { db } from "@/db";
import { clinics, subscriptions, patients, clinicAdmins } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export interface ClinicAccessStatus {
  hasAccess: boolean;
  status: "active" | "trial_active" | "trial_expired";
  isPaid: boolean;
  patientCount: number;
  patientLimit: number;
  patientsRemaining: number | null;
  daysRemaining: number | null;
  trialEndDate: Date | null;
}

export const TRIAL_PATIENT_LIMIT = 10;

/**
 * Checks subscription or trial status for a clinic.
 * 
 * Rules:
 * 1. Active paid subscription (valid period) -> FULL ACCESS (status: "active", isPaid: true, patientLimit: Infinity)
 * 2. Unclaimed shadow profile -> FULL ACCESS (status: "active")
 * 3. Trial clinic with < 10 patients -> TRIAL ACTIVE (status: "trial_active", isPaid: false, patientLimit: 10)
 * 4. Trial clinic with >= 10 patients -> TRIAL EXPIRED / WRITE-LOCKED (status: "trial_expired", isPaid: false, preserves read access)
 */
export async function getClinicAccessStatus(clinicId: string): Promise<ClinicAccessStatus> {
  const now = new Date();

  // 1. Fetch current patient count for this clinic
  const patientCountResult = await db
    .select({ count: count() })
    .from(patients)
    .where(eq(patients.clinicId, clinicId));

  const patientCount = Number(patientCountResult[0]?.count) || 0;

  // 2. Check for active paid subscription
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
    const sub = activeSubs[0];
    const isNotExpired = !sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > now;
    if (isNotExpired) {
      return {
        hasAccess: true,
        status: "active",
        isPaid: true,
        patientCount,
        patientLimit: Infinity,
        patientsRemaining: null,
        daysRemaining: null,
        trialEndDate: null,
      };
    }
  }

  // 3. Verify clinic exists
  const clinicRecords = await db
    .select({ createdAt: clinics.createdAt })
    .from(clinics)
    .where(eq(clinics.id, clinicId))
    .limit(1);

  if (clinicRecords.length === 0) {
    return {
      hasAccess: false,
      status: "trial_expired",
      isPaid: false,
      patientCount,
      patientLimit: TRIAL_PATIENT_LIMIT,
      patientsRemaining: 0,
      daysRemaining: 0,
      trialEndDate: null,
    };
  }

  // 4. Check if clinic is a Shadow Profile (unclaimed)
  const adminRecords = await db
    .select()
    .from(clinicAdmins)
    .where(eq(clinicAdmins.clinicId, clinicId))
    .limit(1);

  if (adminRecords.length === 0) {
    // Shadow profiles get unrestricted access until claimed
    return {
      hasAccess: true,
      status: "active",
      isPaid: false,
      patientCount,
      patientLimit: Infinity,
      patientsRemaining: null,
      daysRemaining: null,
      trialEndDate: null,
    };
  }

  // 5. 10-Patient Trial Evaluation
  if (patientCount < TRIAL_PATIENT_LIMIT) {
    const patientsRemaining = TRIAL_PATIENT_LIMIT - patientCount;
    return {
      hasAccess: true,
      status: "trial_active",
      isPaid: false,
      patientCount,
      patientLimit: TRIAL_PATIENT_LIMIT,
      patientsRemaining,
      daysRemaining: null,
      trialEndDate: null,
    };
  }

  return {
    hasAccess: false,
    status: "trial_expired",
    isPaid: false,
    patientCount,
    patientLimit: TRIAL_PATIENT_LIMIT,
    patientsRemaining: 0,
    daysRemaining: 0,
    trialEndDate: null,
  };
}
