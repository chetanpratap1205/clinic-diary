import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, clinics, pushSubscriptions } from "@/db/schema";
import { and, eq, gte, lte, inArray } from "drizzle-orm";
import { sendAppointmentReminderNotification } from "@/lib/push-notifications";

/**
 * POST /api/push/send-reminders
 * 
 * Sends a "30 minute reminder" OS push notification to all patients
 * whose appointment slot starts between now and now+35 minutes,
 * who have a push subscription registered, and haven't been reminded yet.
 * 
 * Designed to be called by a cron job (e.g., Supabase pg_cron, Vercel Cron, GitHub Actions)
 * every 5 minutes. Protected by CRON_SECRET header.
 * 
 * Cron setup (Supabase pg_cron alternative: Vercel cron.json):
 *   { "path": "/api/push/send-reminders", "schedule": "* /5 * * * *" }
 */
export async function POST(request: Request) {
  // ── Security: Validate cron secret ─────────────────────────────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    // 5-minute window matching the cron interval (e.g. +25 to +29 mins inclusive)
    const windowStart = new Date(now.getTime() + 25 * 60 * 1000); // 25 min from now
    const windowEnd = new Date(now.getTime() + 29 * 60 * 1000);   // 29 min from now

    // Format to HH:MM for matching appointment slot strings (stored as "09:30")
    const toTimeStr = (d: Date) =>
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

    // Fetch appointments in the 30-min reminder window
    const upcomingAppointments = await db
      .select({
        id: appointments.id,
        patientName: appointments.patientName,
        appointmentTime: appointments.appointmentTime,
        clinicId: appointments.clinicId,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.appointmentDate, todayStr),
          eq(appointments.status, "scheduled"),
          gte(appointments.appointmentTime, toTimeStr(windowStart)),
          lte(appointments.appointmentTime, toTimeStr(windowEnd))
        )
      );

    if (!upcomingAppointments.length) {
      return NextResponse.json({ sent: 0, message: "No appointments in reminder window" });
    }

    // Fetch clinic details for appointments in scope
    const clinicIds = [...new Set(upcomingAppointments.map((a) => a.clinicId))];
    const clinicsData = await db
      .select({ id: clinics.id, name: clinics.name, doctorName: clinics.doctorName, address: clinics.address, googleMapsUrl: clinics.googleMapsUrl })
      .from(clinics)
      .where(inArray(clinics.id, clinicIds));

    const clinicMap = Object.fromEntries(clinicsData.map((c) => [c.id, c]));

    // Check which appointments have push subscriptions
    const apptIds = upcomingAppointments.map((a) => a.id);
    const subsWithAppts = await db
      .select({ appointmentId: pushSubscriptions.appointmentId })
      .from(pushSubscriptions)
      .where(inArray(pushSubscriptions.appointmentId, apptIds));

    const subscribedApptIds = new Set(subsWithAppts.map((s) => s.appointmentId));

    // Send reminders
    let sentCount = 0;
    await Promise.all(
      upcomingAppointments
        .filter((a) => subscribedApptIds.has(a.id))
        .map(async (appt) => {
          const clinic = clinicMap[appt.clinicId];
          if (!clinic) return;

          // Build directions URL — prefer existing Google Maps URL, fallback to search
          const directionsUrl = clinic.googleMapsUrl ||
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              [clinic.name, clinic.address].filter(Boolean).join(", ")
            )}`;

          const success = await sendAppointmentReminderNotification(
            appt.id,
            appt.patientName,
            clinic.doctorName,
            appt.appointmentTime,
            directionsUrl
          );

          if (success) sentCount++;
        })
    );

    return NextResponse.json({
      sent: sentCount,
      checked: upcomingAppointments.length,
      withSubscriptions: subscribedApptIds.size,
    });
  } catch (error: any) {
    console.error("[send-reminders] Error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

// Allow GET for easy testing from browser
export async function GET(request: Request) {
  return POST(request);
}
