import { Suspense } from "react";
import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, clinics, followUps } from "@/db/schema";
import { eq, and, asc, or, lt, inArray } from "drizzle-orm";
import { getClinicTodayDate } from "@/lib/timezone";
import { redirect } from "next/navigation";
import { QueueClient } from "./queue-client";
import { QueueQuickAdd } from "./queue-quick-add";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const today = getClinicTodayDate();

  const [clinicDataResult, todayAppts] = await Promise.all([
    db
      .select()
      .from(clinics)
      .where(eq(clinics.id, authUser.clinicId))
      .limit(1),
    db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.clinicId, authUser.clinicId),
          or(
            eq(appointments.appointmentDate, today),
            and(
              lt(appointments.appointmentDate, today),
              inArray(appointments.status, ["confirmed", "checked_in", "in_consultation"])
            )
          )
        )
      )
      .orderBy(asc(appointments.appointmentDate), asc(appointments.appointmentTime)),
  ]);

  const clinicData = clinicDataResult[0];

  // ─── P0: Load follow-up metadata for today's appointments ─────────────────
  // For each appointment that IS a follow-up return visit, we need to know:
  //   - is it free? (isFree)
  //   - what fee override? (feeOverride)
  // We query follow_ups where followUpAppointmentId matches today's appointment IDs
  const apptIds = todayAppts.map((a) => a.id);
  let followUpMap: Record<string, { isFree: boolean; feeOverride: number | null }> = {};

  if (apptIds.length > 0) {
    const linkedFollowUps = await db
      .select({
        followUpAppointmentId: followUps.followUpAppointmentId,
        isFree: followUps.isFree,
        feeOverride: followUps.feeOverride,
      })
      .from(followUps)
      .where(
        and(
          eq(followUps.clinicId, authUser.clinicId),
          inArray(followUps.followUpAppointmentId, apptIds)
        )
      );

    for (const fu of linkedFollowUps) {
      if (fu.followUpAppointmentId) {
        followUpMap[fu.followUpAppointmentId] = {
          isFree: fu.isFree,
          feeOverride: fu.feeOverride,
        };
      }
    }
  }

  // Enrich appointments with follow-up metadata as a JSON notes tag
  // We inject into a virtual field via notes pattern — but more cleanly,
  // we pass the followUpMap to QueueClient directly
  // ─── end P0 ───────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-safe bottom-nav-spacing lg:pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Live Queue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage today&apos;s appointments in real-time. Patients track this automatically.
        </p>
      </div>

      <Suspense fallback={<div className="h-20 animate-pulse bg-slate-100 rounded-3xl"></div>}>
        <QueueQuickAdd />
      </Suspense>

      <QueueClient
        initialAppointments={todayAppts}
        clinic={clinicData}
        today={today}
        followUpMap={followUpMap}
      />
    </div>
  );
}
