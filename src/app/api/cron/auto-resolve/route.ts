import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, followUps } from "@/db/schema";
import { and, lt, inArray } from "drizzle-orm";
import { getClinicTodayDate } from "@/lib/timezone";

// Vercel Cron will trigger this GET request daily at midnight
export async function GET(req: Request) {
  try {
    // 1. Verify CRON_SECRET to prevent unauthorized execution
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // In production, we strictly require the cron secret. 
    // If not set locally, we can optionally bypass for testing, 
    // but best practice is to always require it if set in env.
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Identify all stale appointments (older than today, not completed/cancelled/no_show)
    const today = getClinicTodayDate(); 

    const staleAppointments = await db
      .select()
      .from(appointments)
      .where(
        and(
          lt(appointments.appointmentDate, today),
          inArray(appointments.status, ["confirmed", "checked_in", "in_consultation"])
        )
      );

    if (staleAppointments.length === 0) {
      return NextResponse.json({ message: "No stale appointments found. Queue is clean." });
    }

    const updatedIds: string[] = [];
    const followUpsToInsert: any[] = [];

    // 3. Process each stale appointment
    for (const appt of staleAppointments) {
      updatedIds.push(appt.id);
      
      // We only create follow-ups if patientId is present
      if (appt.patientId) {
        followUpsToInsert.push({
          clinicId: appt.clinicId,
          patientId: appt.patientId,
          appointmentId: appt.id,
          dueDate: today, // Due today, meaning they show up immediately on the dashboard
          status: "pending",
          sourceType: "auto",
          notes: "Auto-generated: No-show recovery",
          isFree: false, 
        });
      }
    }

    // 4. Execute bulk updates
    // Update appointments to "no_show"
    if (updatedIds.length > 0) {
      await db
        .update(appointments)
        .set({ status: "no_show" })
        .where(inArray(appointments.id, updatedIds));
    }

    // Insert follow-ups for revenue recovery
    if (followUpsToInsert.length > 0) {
      await db.insert(followUps).values(followUpsToInsert);
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${updatedIds.length} stale appointments.`,
      resolvedAppointments: updatedIds.length,
      followUpsCreated: followUpsToInsert.length,
    });

  } catch (error: any) {
    console.error("[CRON AUTO-RESOLVE ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
