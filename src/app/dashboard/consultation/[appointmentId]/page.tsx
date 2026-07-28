import { getAuthUser } from "@/lib/auth";
import { db } from "@/db";
import { appointments, visitNotes, patients, clinics } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ConsultationClient } from "./consultation-client";

export default async function ConsultationPage(props: {
  params: Promise<{ appointmentId: string }>;
}) {
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

  if (!appointment) {
    redirect("/dashboard/queue");
  }

  let patient: any = null;
  if (appointment.patientId) {
    const [p] = await db
      .select()
      .from(patients)
      .where(eq(patients.id, appointment.patientId))
      .limit(1);
    patient = p;
  }

  if (!patient && appointment.patientPhone) {
    const [p] = await db
      .select()
      .from(patients)
      .where(
        and(
          eq(patients.clinicId, authUser.clinicId),
          eq(patients.phone, appointment.patientPhone)
        )
      )
      .limit(1);
    if (p) {
      patient = p;
      await db
        .update(appointments)
        .set({ patientId: p.id })
        .where(eq(appointments.id, appointment.id));
    }
  }

  if (!patient) {
    patient = {
      id: appointment.patientId || "",
      clinicId: appointment.clinicId,
      name: appointment.patientName || "Patient",
      phone: appointment.patientPhone || "",
      age: null,
      gender: null,
      address: null,
      medicalNotes: null,
      createdAt: appointment.createdAt,
    };
  }

  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, appointment.clinicId))
    .limit(1);

  const pastVisits = patient.id
    ? await db
        .select({
          note: visitNotes,
          date: appointments.appointmentDate,
        })
        .from(visitNotes)
        .innerJoin(appointments, eq(visitNotes.appointmentId, appointments.id))
        .where(eq(visitNotes.patientId, patient.id))
        .orderBy(desc(visitNotes.createdAt))
    : [];

  return (
    // Mobile: full screen minus top header (56px) and bottom nav (64px)
    // Desktop: full screen minus desktop header (64px)
    <div
      className="
        /* mobile */
        h-[calc(100dvh-56px-64px)]
        /* desktop */
        lg:h-[calc(100dvh-64px)]
        flex flex-col
        lg:p-4 lg:max-w-7xl lg:mx-auto
        overflow-hidden
      "
    >
      <ConsultationClient
        appointment={appointment}
        patient={patient}
        pastVisits={pastVisits}
        clinic={clinic}
      />
    </div>
  );
}
