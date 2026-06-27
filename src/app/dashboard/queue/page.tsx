import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { QueueClient } from "./queue-client";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const today = format(new Date(), "yyyy-MM-dd");

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
          eq(appointments.appointmentDate, today)
        )
      )
      .orderBy(asc(appointments.appointmentTime)),
  ]);

  const clinicData = clinicDataResult[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 pb-safe bottom-nav-spacing lg:pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Live Queue
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage today's appointments in real-time. Patients track this automatically.
        </p>
      </div>

      <QueueClient
        initialAppointments={todayAppts}
        clinic={clinicData}
      />
    </div>
  );
}
