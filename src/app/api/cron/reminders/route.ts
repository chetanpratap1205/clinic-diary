import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, reminderLogs, clinics } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { sendNotification } from "@/lib/notifications";
import { parseISO, differenceInMinutes, addHours } from "date-fns";

// Vercel Cron will hit this endpoint
export async function GET(request: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    // In production, require the secret. For local dev, allow if no secret is configured.
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("⏰ Starting Cron Reminder Scan...");

    // 2. Fetch all upcoming uncancelled appointments in the next ~25 hours
    // To keep DB logic simple and fast, we pull all future appointments up to 25 hours from now
    // and process the exact time-windows in memory.
    const now = new Date();
    const cutoff = addHours(now, 25);
    const cutoffStr = cutoff.toISOString().split("T")[0]; // YYYY-MM-DD
    const todayStr = now.toISOString().split("T")[0];

    // Note: In a massive scale app, we'd use complex SQL. For SaaS MVP, this is highly efficient.
    const upcomingAppts = await db
      .select()
      .from(appointments)
      .where(ne(appointments.status, "cancelled")); // Simplification: we'll filter dates in memory

    // Pre-fetch all reminder logs to check idempotency efficiently
    const allLogs = await db.select().from(reminderLogs);
    
    // Group logs by appointmentId for fast lookup
    const logsByAppt = allLogs.reduce((acc: any, log) => {
      if (!acc[log.appointmentId]) acc[log.appointmentId] = new Set();
      acc[log.appointmentId].add(log.triggerType);
      return acc;
    }, {});

    let processedCount = 0;

    // 3. Process each appointment
    for (const appt of upcomingAppts) {
      // Parse the appointment datetime
      const apptDateStr = `${appt.appointmentDate}T${appt.appointmentTime}:00`;
      const apptTime = parseISO(apptDateStr);
      
      // Skip past appointments
      if (apptTime <= now) continue;

      const minsUntil = differenceInMinutes(apptTime, now);

      // We only care about appointments within the next 24 hours
      if (minsUntil > 24 * 60) continue;

      const sentTriggers = logsByAppt[appt.id] || new Set();

      // Fetch clinic for notification details
      const clinicRecords = await db.select().from(clinics).where(eq(clinics.id, appt.clinicId)).limit(1);
      if (!clinicRecords.length) continue;
      const clinic = clinicRecords[0];

      const trackingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://doctordiary.in"}/track/${appt.id}`;

      // Check Daily Reminder: If within 24 hours and hasn't been sent yet
      if (minsUntil <= 24 * 60 && minsUntil > 0 && !sentTriggers.has("reminder_24h")) {
        console.log(`[CRON] Triggering daily reminder for Appt ${appt.id}`);
        await sendNotification("sms", "reminder_24h", {
          appointmentId: appt.id,
          patientPhone: appt.patientPhone,
          patientName: appt.patientName,
          clinicName: clinic.name,
          doctorName: clinic.doctorName,
          appointmentDate: appt.appointmentDate,
          appointmentTime: appt.appointmentTime,
          trackingUrl,
        });
        processedCount++;
      }

      // Check 1-Hour Reminder: If within 1.25 hours and hasn't been sent
      if (minsUntil <= 60 + 15 && minsUntil > 0 && !sentTriggers.has("reminder_1h")) {
        console.log(`[CRON] Triggering 1h reminder for Appt ${appt.id}`);
        await sendNotification("sms", "reminder_1h", {
          appointmentId: appt.id,
          patientPhone: appt.patientPhone,
          patientName: appt.patientName,
          clinicName: clinic.name,
          doctorName: clinic.doctorName,
          appointmentDate: appt.appointmentDate,
          appointmentTime: appt.appointmentTime,
          trackingUrl,
        });
        processedCount++;
      }
    }

    console.log(`⏰ Cron scan complete. Reminders dispatched: ${processedCount}`);
    return NextResponse.json({ success: true, dispatched: processedCount });

  } catch (error) {
    console.error("Cron failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
