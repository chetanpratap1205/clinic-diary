import webpush from "web-push";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";

// VAPID keys — must be set in environment variables
// Generate your own with: node -e "const wp=require('web-push'); console.log(wp.generateVAPIDKeys())"
const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY!;
const PRIVATE_VAPID_KEY = process.env.VAPID_PRIVATE_KEY!;

if (PUBLIC_VAPID_KEY && PRIVATE_VAPID_KEY) {
  webpush.setVapidDetails(
    "mailto:support@doctordiary.in",
    PUBLIC_VAPID_KEY,
    PRIVATE_VAPID_KEY
  );
} else {
  console.warn("[WebPush] VAPID keys not configured. Set NEXT_PUBLIC_VAPID_KEY and VAPID_PRIVATE_KEY in .env");
}

// ─── Typed Notification Payloads ──────────────────────────────────────────────
export type PushNotificationType =
  | "turn_called"
  | "turn_nearby"
  | "checkin_confirmed"
  | "reminder"
  | "default";

export interface PushPayload {
  type: PushNotificationType;
  title: string;
  body: string;
  url?: string;
  appointmentId?: string;
  directionsUrl?: string;
}

// ─── Core Send Helper ─────────────────────────────────────────────────────────
async function sendToSubscriptions(
  subs: { id: string; endpoint: string; p256dh: string; auth: string }[],
  payload: PushPayload
) {
  const notificationPayload = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notificationPayload
        );
      } catch (err: any) {
        // 410 Gone or 404 Not Found = expired subscription, clean it up
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id)).catch(() => {});
        }
        // All other errors: log silently, don't crash the server action
      }
    })
  );
}

// ─── Public API: Send to an Appointment's Subscribers ────────────────────────
export async function sendPushNotificationToAppointment(
  appointmentId: string,
  payload: Omit<PushPayload, "appointmentId">
) {
  if (!PUBLIC_VAPID_KEY || !PRIVATE_VAPID_KEY) return false;

  try {
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.appointmentId, appointmentId));

    if (!subs.length) return false;

    await sendToSubscriptions(subs, { ...payload, appointmentId });
    return true;
  } catch (error) {
    console.error("[WebPush] sendPushNotificationToAppointment failed:", error);
    return false;
  }
}

// ─── Public API: Send Turn Nearby Warning (2 positions away) ──────────────────
export async function sendTurnNearbyNotification(appointmentId: string, turnsAway: number) {
  return sendPushNotificationToAppointment(appointmentId, {
    type: "turn_nearby",
    title: `⚡ Almost Your Turn — ${turnsAway} patient${turnsAway > 1 ? "s" : ""} ahead`,
    body: `You are ${turnsAway} position${turnsAway > 1 ? "s" : ""} away from the doctor. Please head to the clinic now!`,
    url: `/track/${appointmentId}`,
  });
}

// ─── Public API: Send Your Turn Now Notification ──────────────────────────────
export async function sendTurnCalledNotification(appointmentId: string, patientName: string, clinicName: string) {
  return sendPushNotificationToAppointment(appointmentId, {
    type: "turn_called",
    title: `🔔 IT'S YOUR TURN — ${patientName}!`,
    body: `Dr. at ${clinicName} is ready for you right now. Please step in immediately.`,
    url: `/track/${appointmentId}`,
  });
}

// ─── Public API: Send Check-in Confirmed ─────────────────────────────────────
export async function sendCheckinConfirmedNotification(appointmentId: string, tokenNumber: number | null) {
  return sendPushNotificationToAppointment(appointmentId, {
    type: "checkin_confirmed",
    title: "✅ Check-in Confirmed!",
    body: `Token #${tokenNumber || "—"} confirmed. Track your live queue position to know when to step in.`,
    url: `/track/${appointmentId}`,
  });
}

// ─── Public API: Send Appointment Reminder (30 min before) ───────────────────
export async function sendAppointmentReminderNotification(
  appointmentId: string,
  patientName: string,
  doctorName: string,
  time: string,
  directionsUrl?: string
) {
  return sendPushNotificationToAppointment(appointmentId, {
    type: "reminder",
    title: `⏰ Appointment Reminder — ${time} Today`,
    body: `Hi ${patientName}! Your appointment with ${doctorName} is in 30 minutes. Don't be late!`,
    url: `/track/${appointmentId}`,
    directionsUrl,
  });
}
