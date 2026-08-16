import { db } from "@/db";
import { appointments, clinics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { TrackingClient } from "./tracking-client";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}): Promise<Metadata> {
  const { appointmentId } = await params;
  if (appointmentId.startsWith("demo-")) {
    const slug = appointmentId.replace("demo-", "");
    return {
      title: "Live Tracking | Demo Patient",
      manifest: `/api/manifest/${slug}`,
    };
  }
  try {
    const [result] = await db
      .select({
        patientName: appointments.patientName,
        clinicSlug: clinics.slug,
        clinicName: clinics.name,
      })
      .from(appointments)
      .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!result) return { title: "Not Found" };
    return {
      title: `Live Tracking | ${result.patientName}${result.clinicName ? ` - ${result.clinicName}` : ""}`,
      manifest: result.clinicSlug ? `/api/manifest/${result.clinicSlug}` : undefined,
    };
  } catch {
    return { title: "Invalid Tracking Link" };
  }
}

export default async function TrackingPage({ params, searchParams }: { params: Promise<{ appointmentId: string }>; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { appointmentId } = await params;
  const sp = await searchParams;
  const lang = sp?.lang === "hi" ? "hi" : "en";
  
  if (appointmentId.startsWith("demo-")) {
    const slug = appointmentId.replace("demo-", "");
    const { doctorLeads } = await import("@/db/schema");
    const [lead] = await db.select().from(doctorLeads).where(eq(doctorLeads.clinicSlug, slug)).limit(1);
    
    if (!lead) notFound();

    const mockAppointment = {
      id: appointmentId,
      clinicId: lead.id,
      patientId: "demo-patient",
      patientName: "Demo Patient",
      patientPhone: "9876543210",
      patientEmail: null,
      appointmentDate: new Date().toISOString().split("T")[0],
      appointmentTime: "10:00",
      status: "confirmed",
      tokenNumber: 14,
      cancelToken: "demo",
      feeCollected: 0,
      notes: null,
      acquisitionSource: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      visitNote: null,
    };

    const mockClinic = {
      id: lead.id,
      slug: lead.clinicSlug || slug,
      name: lead.clinicName || `${lead.doctorName}'s Clinic`,
      doctorName: lead.doctorName,
      logoUrl: lead.logoUrl,
      themeColor: "#0ea5e9",
      phone: lead.phone,
      address: lead.city,
      city: lead.city,
    } as any;

    const mockTodayAppts = [
      { status: "completed", tokenNumber: 1 },
      { status: "completed", tokenNumber: 2 },
      { status: "completed", tokenNumber: 3 },
      { status: "completed", tokenNumber: 4 },
      { status: "completed", tokenNumber: 5 },
      { status: "completed", tokenNumber: 6 },
      { status: "completed", tokenNumber: 7 },
      { status: "completed", tokenNumber: 8 },
      { status: "completed", tokenNumber: 9 },
      { status: "completed", tokenNumber: 10 },
      { status: "completed", tokenNumber: 11 },
      { status: "in_consultation", tokenNumber: 12 },
      { status: "confirmed", tokenNumber: 13 },
      mockAppointment,
      { status: "confirmed", tokenNumber: 15 },
    ] as any[];

    return <TrackingClient appointment={mockAppointment as any} clinic={mockClinic} todayAppts={mockTodayAppts} lang={lang} />;
  }

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

  return <TrackingClient appointment={appointment} clinic={clinic} todayAppts={todayAppts} lang={lang} />;
}
