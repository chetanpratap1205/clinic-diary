import { db } from "@/db";
import { appointments, clinics, reminderLogs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function triggerInstantGoogleReviewBooster(appointmentId: string, clinicId: string) {
  try {
    // 1. Fetch clinic details
    const [clinic] = await db
      .select({
        name: clinics.name,
        doctorName: clinics.doctorName,
        googleReviewUrl: clinics.googleReviewUrl,
        googleMapsUrl: clinics.googleMapsUrl,
        enableAutoReviewBooster: clinics.enableAutoReviewBooster,
      })
      .from(clinics)
      .where(eq(clinics.id, clinicId))
      .limit(1);

    if (!clinic || !clinic.enableAutoReviewBooster) {
      return;
    }

    const targetUrl = clinic.googleReviewUrl || clinic.googleMapsUrl;
    if (!targetUrl) {
      return; // No review URL configured
    }

    // 2. Fetch appointment details
    const [appt] = await db
      .select({
        patientName: appointments.patientName,
        patientPhone: appointments.patientPhone,
      })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appt || !appt.patientPhone) {
      return;
    }

    const message = `Hello ${appt.patientName}! Thank you for visiting ${clinic.name} today. We hope you had a great experience with ${clinic.doctorName}.\n\nCould you please take 10 seconds to share your feedback on Google? It means the world to us!\n\n⭐ Leave a Review: ${targetUrl}`;

    // 3. Log the WhatsApp Review Booster trigger in reminder_logs
    await db.insert(reminderLogs).values({
      appointmentId,
      clinicId,
      channel: "whatsapp",
      triggerType: "instant_google_review_booster",
      recipientPhone: appt.patientPhone,
      status: "sent",
      message,
    });

    console.log(`[Google Review Booster] Sent instant WhatsApp review prompt to ${appt.patientPhone} for clinic ${clinic.name}`);
  } catch (error) {
    console.error("Error triggering instant Google Review Booster:", error);
  }
}
