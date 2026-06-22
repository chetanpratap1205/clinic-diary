import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TrackingClient } from "./tracking-client";

export async function generateMetadata({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  try {
    const appt = await db
      .select({ patientName: appointments.patientName })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (appt.length === 0) return { title: "Not Found" };
    return { title: `Live Tracking | ${appt[0].patientName}` };
  } catch {
    return { title: "Invalid Tracking Link" };
  }
}

export default async function TrackingPage({ params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  let apptResult;
  try {
    apptResult = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);
  } catch {
    notFound();
  }

  if (!apptResult || apptResult.length === 0) {
    notFound();
  }

  const appointment = apptResult[0];

  const clinicResult = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, appointment.clinicId))
    .limit(1);

  if (!clinicResult.length) {
    notFound();
  }

  const clinic = clinicResult[0];

  return <TrackingClient appointment={appointment} clinic={clinic} />;
}
