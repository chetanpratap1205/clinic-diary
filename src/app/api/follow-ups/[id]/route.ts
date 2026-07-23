import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { followUps, appointments, patients, clinics } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/auth";
import { format } from "date-fns";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !authUser.clinicId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = (await params).id;
    const body = await req.json();
    const { status } = body;

    // Added checked_in and cancelled to the allowed statuses
    if (!status || !["pending", "checked_in", "completed", "missed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    let appointmentIdToLink: string | null = null;

    // If marked as checked_in (Check In), create an Appointment first so we can link it
    if (status === "checked_in") {
      const [followUpRecord] = await db
        .select()
        .from(followUps)
        .where(eq(followUps.id, id))
        .limit(1);

      if (followUpRecord) {
        const [patient] = await db
          .select()
          .from(patients)
          .where(eq(patients.id, followUpRecord.patientId))
          .limit(1);

        if (patient) {
          const todayStr = format(new Date(), "yyyy-MM-dd");
          const now = new Date();
          
          // Get clinic settings for average consultation minutes
          const [clinicResult] = await db
            .select({ averageConsultationMinutes: clinics.averageConsultationMinutes })
            .from(clinics)
            .where(eq(clinics.id, authUser.clinicId));
          const avgConsultMins = clinicResult?.averageConsultationMinutes ?? 15;

          // Get existing appointments today to calculate the correct walk-in slot
          const todayAppointmentsData = await db
            .select()
            .from(appointments)
            .where(
              and(
                eq(appointments.clinicId, authUser.clinicId),
                eq(appointments.appointmentDate, todayStr)
              )
            );
            
          // Get next token number
          const maxTokenData = todayAppointmentsData.reduce((max, curr) => Math.max(max, curr.tokenNumber || 0), 0);
          const nextToken = maxTokenData + 1;

          let appointmentTime = format(now, "HH:mm:ss");
          if (todayAppointmentsData.length > 0) {
            const { getWalkInTimeSlot } = await import("@/lib/queue-logic");
            appointmentTime = getWalkInTimeSlot(todayAppointmentsData, now, avgConsultMins);
          }

          const [newAppt] = await db.insert(appointments).values({
            clinicId: authUser.clinicId,
            patientId: patient.id,
            patientName: patient.name,
            patientPhone: patient.phone,
            appointmentDate: todayStr,
            appointmentTime: appointmentTime,
            tokenNumber: nextToken,
            status: "checked_in",
            checkInTime: now,
            notes: "Auto-generated from Follow-up Check In",
          }).returning({ id: appointments.id });

          if (newAppt) {
            appointmentIdToLink = newAppt.id;
          }
        }
      }
    }

    // Update follow-up status and link appointment if created
    const updateData: any = { 
      status,
      completedAt: status === "completed" ? new Date() : null,
    };

    if (appointmentIdToLink) {
      updateData.appointmentId = appointmentIdToLink;
    }

    const [updated] = await db
      .update(followUps)
      .set(updateData)
      .where(
        and(
          eq(followUps.id, id),
          eq(followUps.clinicId, authUser.clinicId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Follow-up not found" }, { status: 404 });
    }

    return NextResponse.json({ followUp: updated });
  } catch (err) {
    console.error("[FollowUp PATCH] Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

