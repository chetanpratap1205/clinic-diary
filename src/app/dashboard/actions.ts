"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { appointments, clinics, followUps, patients } from "@/db/schema";
import { eq, and, lte, desc, inArray } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendTurnCalledNotification, sendCheckinConfirmedNotification, sendTurnNearbyNotification } from "@/lib/push-notifications";

export async function logoutDoctor() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updateAppointmentStatus(appointmentId: string, status: string, feeCollected?: number) {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) {
    return { error: "Unauthorized" };
  }

  try {
    const updateData: any = { status };
    if (status === "checked_in") {
      updateData.consultationStartTime = null;
      updateData.consultationEndTime = null;
    } else if (status === "in_consultation") {
      updateData.consultationStartTime = new Date();
    } else if (status === "completed") {
      updateData.consultationEndTime = new Date();
      if (feeCollected !== undefined) {
        updateData.feeCollected = feeCollected;
      }
    }

    // Only allow update if appointment belongs to doctor's clinic
    await db
      .update(appointments)
      .set(updateData)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.clinicId, authUser.clinicId)
        )
      );

    // ─── Trigger Zero-Cost Typed Push Notifications ────────────────────────────────
    if (status === "in_consultation") {
      // Fetch patient name + clinic name for rich notification
      const [appt] = await db
        .select({ patientName: appointments.patientName, tokenNumber: appointments.tokenNumber })
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);
      const [clinic] = await db
        .select({ name: clinics.name })
        .from(clinics)
        .where(eq(clinics.id, authUser.clinicId))
        .limit(1);
      sendTurnCalledNotification(
        appointmentId,
        appt?.patientName || "Patient",
        clinic?.name || "the clinic"
      ).catch(() => {});

      // Auto-trigger Turn Nearby alert for next patient in queue (zero cost)
      const [currentAppt] = await db
        .select({ appointmentDate: appointments.appointmentDate })
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (currentAppt?.appointmentDate) {
        const waitingAppts = await db
          .select({ id: appointments.id })
          .from(appointments)
          .where(
            and(
              eq(appointments.clinicId, authUser.clinicId),
              eq(appointments.appointmentDate, currentAppt.appointmentDate),
              inArray(appointments.status, ["checked_in", "confirmed"])
            )
          )
          .orderBy(appointments.tokenNumber, appointments.appointmentTime);

        if (waitingAppts.length >= 2) {
          sendTurnNearbyNotification(waitingAppts[1].id, 2).catch(() => {});
        } else if (waitingAppts.length === 1) {
          sendTurnNearbyNotification(waitingAppts[0].id, 1).catch(() => {});
        }
      }
    } else if (status === "checked_in") {
      const [appt] = await db
        .select({ tokenNumber: appointments.tokenNumber })
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);
      sendCheckinConfirmedNotification(appointmentId, appt?.tokenNumber ?? null).catch(() => {});
    }

    // ─── P0: Golden Thread sync ────────────────────────────────────────────────
    // When completing, mark ANY follow-up that GENERATED this appointment as done
    // (via the originating appointmentId link — old path kept for backward compat)
    // AND mark any follow-up that has THIS as its follow_up_appointment_id (new path)
    if (status === "completed") {
      const now = new Date();
      // Path 1: old — follow-up whose appointmentId = this appointment (walk-in quick complete)
      await db
        .update(followUps)
        .set({ status: "completed", completedAt: now })
        .where(
          and(
            eq(followUps.appointmentId, appointmentId),
            eq(followUps.clinicId, authUser.clinicId),
            eq(followUps.status, "pending")
          )
        );
      // Path 2: new — follow-up whose followUpAppointmentId = this appointment
      await db
        .update(followUps)
        .set({ status: "completed", completedAt: now })
        .where(
          and(
            eq(followUps.followUpAppointmentId, appointmentId),
            eq(followUps.clinicId, authUser.clinicId),
            eq(followUps.status, "pending")
          )
        );
    } else if (status === "cancelled" || status === "no_show") {
      const fuStatus = status === "no_show" ? "missed" : "cancelled";
      await db
        .update(followUps)
        .set({ status: fuStatus })
        .where(
          and(
            eq(followUps.appointmentId, appointmentId),
            eq(followUps.clinicId, authUser.clinicId),
            eq(followUps.status, "pending")
          )
        );
      // Also unlink the follow-up appointment reference so it can be re-booked
      await db
        .update(followUps)
        .set({ followUpAppointmentId: null })
        .where(
          and(
            eq(followUps.followUpAppointmentId, appointmentId),
            eq(followUps.clinicId, authUser.clinicId),
            eq(followUps.status, "pending")
          )
        );
    }
    // ─── end golden thread sync ────────────────────────────────────────────────

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/queue");
    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard/follow-ups");
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { error: "Failed to update appointment status" };
  }
}

export async function completeAppointmentWithNotes(data: {
  appointmentId: string;
  patientId: string | null;
  complaint: string;
  diagnosis?: string;
  treatment: string;
  followUpDays: number | "none";
  feeCollected?: number;
}) {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) {
    return { error: "Unauthorized" };
  }

  try {
    const updateData: any = { status: "completed", consultationEndTime: new Date() };
    if (data.feeCollected !== undefined) {
      updateData.feeCollected = data.feeCollected;
    }

    let activePatientId = data.patientId;
    const [existingAppt] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, data.appointmentId))
      .limit(1);

    if (!activePatientId && existingAppt?.patientPhone) {
      const [p] = await db
        .select()
        .from(patients)
        .where(
          and(
            eq(patients.clinicId, authUser.clinicId),
            eq(patients.phone, existingAppt.patientPhone)
          )
        )
        .limit(1);

      if (p) {
        activePatientId = p.id;
        updateData.patientId = p.id;
      } else if (existingAppt.patientName) {
        const [newP] = await db
          .insert(patients)
          .values({
            clinicId: authUser.clinicId,
            name: existingAppt.patientName,
            phone: existingAppt.patientPhone,
          })
          .returning();
        if (newP) {
          activePatientId = newP.id;
          updateData.patientId = newP.id;
        }
      }
    }

    // 1. Update appointment status and timestamp
    await db
      .update(appointments)
      .set(updateData)
      .where(
        and(
          eq(appointments.id, data.appointmentId),
          eq(appointments.clinicId, authUser.clinicId)
        )
      );

    const now = new Date();

    // ─── P0: Golden Thread — complete any linked follow-ups ───────────────────
    // Path 1: follow-up that generated this appointment (originating appointmentId)
    await db
      .update(followUps)
      .set({ status: "completed", completedAt: now })
      .where(
        and(
          eq(followUps.appointmentId, data.appointmentId),
          eq(followUps.clinicId, authUser.clinicId),
          eq(followUps.status, "pending")
        )
      );
    // Path 2: follow-up that has THIS as its return appointment
    await db
      .update(followUps)
      .set({ status: "completed", completedAt: now })
      .where(
        and(
          eq(followUps.followUpAppointmentId, data.appointmentId),
          eq(followUps.clinicId, authUser.clinicId),
          eq(followUps.status, "pending")
        )
      );
    // ─── end golden thread ────────────────────────────────────────────────────

    // 2. Add visit notes
    if (activePatientId && (data.complaint || data.diagnosis || data.treatment)) {
      const { visitNotes } = await import("@/db/schema");
      await db.insert(visitNotes).values({
        clinicId: authUser.clinicId,
        patientId: activePatientId,
        appointmentId: data.appointmentId,
        complaint: data.complaint || null,
        diagnosis: data.diagnosis || null,
        treatment: data.treatment || null,
        followUpRequired: data.followUpDays !== "none",
      });
    }

    // 3. Schedule follow-up if requested
    if (activePatientId && data.followUpDays !== "none") {
      const { CLINIC_TIMEZONE } = await import("@/lib/timezone");
      const { formatInTimeZone } = await import("date-fns-tz");
      const { addDays } = await import("date-fns");
      const targetDate = addDays(now, data.followUpDays);
      const dueDateStr = formatInTimeZone(targetDate, CLINIC_TIMEZONE, "yyyy-MM-dd");

      // ─── P0: Determine if follow-up is free based on clinic policy ────────
      const [clinicData] = await db
        .select({ freeFollowupDays: clinics.freeFollowupDays })
        .from(clinics)
        .where(eq(clinics.id, authUser.clinicId))
        .limit(1);

      const freeWindow = clinicData?.freeFollowupDays ?? 0;
      const isFree = freeWindow > 0 && data.followUpDays <= freeWindow;

      await db.insert(followUps).values({
        clinicId: authUser.clinicId,
        patientId: activePatientId,
        appointmentId: data.appointmentId, // originating appointment
        dueDate: dueDateStr,
        status: "pending",
        isFree,
        feeOverride: isFree ? 0 : null,
        sourceType: "auto",
        notes: data.complaint ? `Follow-up for: ${data.complaint}` : null,
      });
      // ─── end P0 ────────────────────────────────────────────────────────────
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/queue");
    revalidatePath("/dashboard/calendar");
    revalidatePath("/dashboard/follow-ups");
    if (activePatientId) revalidatePath(`/dashboard/patients/${activePatientId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to complete appointment:", error);
    return { error: "Failed to complete appointment" };
  }
}

export async function checkInWalkIn(patientId: string) {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) {
    return { error: "Unauthorized" };
  }

  try {
    const [patient] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.id, patientId),
          eq(patients.clinicId, authUser.clinicId)
        )
      )
      .limit(1);

    if (!patient) return { error: "Patient not found" };

    const { getClinicTodayDate, CLINIC_TIMEZONE } = await import("@/lib/timezone");
    const { ensureUniqueTime } = await import("@/lib/appointment-utils");
    const { formatInTimeZone } = await import("date-fns-tz");
    const { max } = await import("drizzle-orm");

    const todayStr = getClinicTodayDate();
    const now = new Date();

    const todayAppointmentsData = await db
      .select({ appointmentTime: appointments.appointmentTime, tokenNumber: appointments.tokenNumber })
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, authUser.clinicId),
          eq(appointments.appointmentDate, todayStr)
        )
      );

    const existingTimes = new Set<string>(todayAppointmentsData.map((a) => a.appointmentTime));
    const rawTime = formatInTimeZone(now, CLINIC_TIMEZONE, "HH:mm:ss");
    const appointmentTime = ensureUniqueTime(rawTime, existingTimes);

    const maxToken = todayAppointmentsData.reduce((m, curr) => Math.max(m, curr.tokenNumber || 0), 0);
    const nextToken = maxToken + 1;

    // ─── P0: Check for pending follow-up before creating appointment ──────────
    // Find the most recent pending follow-up for this patient at this clinic
    // due today or earlier (covers overdue follow-ups too)
    const [pendingFollowUp] = await db
      .select()
      .from(followUps)
      .where(
        and(
          eq(followUps.clinicId, authUser.clinicId),
          eq(followUps.patientId, patientId),
          eq(followUps.status, "pending"),
          lte(followUps.dueDate, todayStr)
        )
      )
      .orderBy(desc(followUps.dueDate))
      .limit(1);

    // Determine appointment notes and fee
    const isFollowUpVisit = !!pendingFollowUp;
    const isFreeFollowUp = isFollowUpVisit && pendingFollowUp.isFree;
    const appointmentNotes = isFollowUpVisit
      ? "Auto-generated from Follow-up"
      : "Walk-in patient";
    const followUpFee = isFollowUpVisit
      ? (isFreeFollowUp ? 0 : (pendingFollowUp.feeOverride ?? undefined))
      : undefined;

    const [newAppt] = await db.insert(appointments).values({
      clinicId: authUser.clinicId,
      patientId: patient.id,
      patientName: patient.name,
      patientPhone: patient.phone,
      appointmentDate: todayStr,
      appointmentTime,
      status: "checked_in",
      checkInTime: now,
      notes: appointmentNotes,
      tokenNumber: nextToken,
      ...(followUpFee !== undefined && { feeCollected: followUpFee }),
    }).returning();

    // ─── P0: Link the follow-up to this new appointment (golden thread) ──────
    if (pendingFollowUp && newAppt) {
      await db
        .update(followUps)
        .set({ followUpAppointmentId: newAppt.id })
        .where(eq(followUps.id, pendingFollowUp.id));
    }
    // ─── end P0 ────────────────────────────────────────────────────────────────

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/queue");
    revalidatePath(`/dashboard/patients/${patientId}`);
    revalidatePath("/dashboard/follow-ups");
    return { success: true };
  } catch (error) {
    console.error("Failed to check in walk-in:", error);
    return { error: "Failed to check in walk-in" };
  }
}
