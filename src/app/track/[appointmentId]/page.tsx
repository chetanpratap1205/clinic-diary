import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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
  let apptResult: any[] = [];
  try {
    const { visitNotes } = await import("@/db/schema");
    const [apptData] = await db
      .select({ appt: appointments, note: visitNotes })
      .from(appointments)
      .leftJoin(visitNotes, eq(appointments.id, visitNotes.appointmentId))
      .where(eq(appointments.id, appointmentId))
      .limit(1);
    
    if (apptData) {
      apptResult = [{ ...apptData.appt, visitNote: apptData.note }];
    } else {
      apptResult = [];
    }
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

  const todayAppts = await db
    .select()
    .from(appointments)
    .where(
      and(
        eq(appointments.clinicId, appointment.clinicId),
        eq(appointments.appointmentDate, appointment.appointmentDate)
      )
    );

  return <TrackingClient appointment={appointment} clinic={clinic} todayAppts={todayAppts} />;
}
