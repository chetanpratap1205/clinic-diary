import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { followUps, appointments, patients } from "@/db/schema";
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
          const timeStr = format(new Date(), "HH:mm:ss");

          const [newAppt] = await db.insert(appointments).values({
            clinicId: authUser.clinicId,
            patientId: patient.id,
            patientName: patient.name,
            patientPhone: patient.phone,
            appointmentDate: todayStr,
            appointmentTime: timeStr,
            status: "checked_in",
            checkInTime: new Date(),
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

