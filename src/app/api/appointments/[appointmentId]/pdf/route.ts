import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, clinics, patients, visitNotes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateClinicalRxPdfBuffer } from "@/lib/pdf-generator";
import { format } from "date-fns";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ appointmentId: string }> }
) {
  try {
    const { appointmentId } = await props.params;

    if (!appointmentId) {
      return NextResponse.json({ error: "Missing appointment ID" }, { status: 400 });
    }

    const [row] = await db
      .select({
        appointment: appointments,
        clinic: clinics,
        patient: patients,
      })
      .from(appointments)
      .innerJoin(clinics, eq(appointments.clinicId, clinics.id))
      .leftJoin(patients, eq(appointments.patientId, patients.id))
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    const { appointment, clinic, patient } = row;

    const [note] = await db
      .select()
      .from(visitNotes)
      .where(eq(visitNotes.appointmentId, appointmentId))
      .limit(1);

    const pdfBuffer = await generateClinicalRxPdfBuffer({
      clinicName: clinic.name,
      doctorName: clinic.doctorName,
      specialty: clinic.specialty,
      degree: clinic.degree,
      phone: clinic.phone,
      address: clinic.address,
      partnerLabName: clinic.partnerLabName,
      preferredHospital: clinic.preferredHospital,
      patientName: patient?.name || appointment.patientName,
      patientPhone: patient?.phone || appointment.patientPhone,
      patientAge: patient?.age,
      patientGender: patient?.gender,
      abhaId: patient?.abhaId,
      tokenNumber: appointment.tokenNumber,
      appointmentDate: format(new Date(appointment.appointmentDate), "dd MMM yyyy"),
      vitals: note?.vitals,
      diagnosis: note?.diagnosis,
      complaint: note?.complaint,
      treatment: note?.treatment,
      labInvestigations: note?.labInvestigations,
      referral: note?.referral as any,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="DoctorDiary_Rx_${appointment.id.slice(0, 8)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate prescription PDF", details: error.message },
      { status: 500 }
    );
  }
}
