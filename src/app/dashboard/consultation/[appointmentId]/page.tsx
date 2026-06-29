import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, visitNotes, patients } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ConsultationClient } from "./consultation-client";

export default async function ConsultationPage(props: { params: Promise<{ appointmentId: string }> }) {
  const params = await props.params;
  const authUser = await getAuthUser();
  if (!authUser?.clinicId) redirect("/login");

  const [appointment] = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.id, params.appointmentId),
        eq(appointments.clinicId, authUser.clinicId)
      )
    )
    .limit(1);

  if (!appointment || !appointment.patientId) {
    redirect("/dashboard/queue");
  }

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, appointment.patientId))
    .limit(1);

  const pastVisits = await db
    .select({
      note: visitNotes,
      date: appointments.appointmentDate
    })
    .from(visitNotes)
    .innerJoin(appointments, eq(visitNotes.appointmentId, appointments.id))
    .where(eq(visitNotes.patientId, patient.id))
    .orderBy(desc(visitNotes.createdAt));

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col p-4">
      <ConsultationClient 
        appointment={appointment}
        patient={patient}
        pastVisits={pastVisits}
      />
    </div>
  );
}
