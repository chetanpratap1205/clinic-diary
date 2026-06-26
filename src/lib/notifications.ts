import { db } from "@/db";
import { reminderLogs } from "@/db/schema";
import { format } from "date-fns";

export type NotificationChannel = "sms" | "whatsapp" | "email" | "console";
export type TriggerType = "booking_confirmation" | "reminder_24h" | "reminder_1h" | "cancellation" | "status_update";

interface NotificationPayload {
  appointmentId: string;
  patientPhone: string;
  patientName: string;
  clinicName: string;
  doctorName: string;
  appointmentDate: string; // yyyy-MM-dd
  appointmentTime: string; // HH:mm:ss or HH:mm
  trackingUrl: string;
}

/**
 * Core notification service.
 * In a full production environment with API keys, this would switch based on channel
 * and call Twilio / Resend / MessageBird APIs.
 * For this MVP, we simulate the send and log it beautifully to the console and database.
 */
export async function sendNotification(
  channel: NotificationChannel,
  triggerType: TriggerType,
  payload: NotificationPayload
) {
  try {
    // 1. Generate the Message Content
    let message = "";
    
    const formattedDate = format(new Date(payload.appointmentDate), "MMM d, yyyy");
    const t = payload.appointmentTime.slice(0, 5);
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedTime = `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;

    switch (triggerType) {
      case "booking_confirmation":
        message = `Hi ${payload.patientName}, your appointment with Dr. ${payload.doctorName} at ${payload.clinicName} is confirmed for ${formattedDate} at ${formattedTime}.\n\nTrack your live status here: ${payload.trackingUrl}`;
        break;
      case "status_update":
        message = `Update: Dr. ${payload.doctorName} is reviewing your file. Check your live status: ${payload.trackingUrl}`;
        break;
      default:
        message = `Update for your appointment with Dr. ${payload.doctorName}: ${payload.trackingUrl}`;
    }

    // 2. Sending Logic (MSG91 / Fast2SMS or Simulated)
    if (channel === "sms" && process.env.MSG91_AUTH_KEY) {
      // MSG91 / Fast2SMS Production Integration placeholder
      // e.g., fetch(`https://api.msg91.com/api/v5/flow/`, { ... })
      
      console.log(`[MSG91] Dispatching SMS to ${payload.patientPhone}`);
      // Simulate API latency
      await new Promise((resolve) => setTimeout(resolve, 300));
    } else {
      // Simulate Sending (Wait 500ms to mimic network request)
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("\n==============================================");
      console.log(`🚀 [SIMULATED ${channel.toUpperCase()}] SENT TO: ${payload.patientPhone}`);
      console.log(`📝 MESSAGE:`);
      console.log(message);
      console.log("==============================================\n");
    }

    // 3. Log to Database for Audit Trail
    await db.insert(reminderLogs).values({
      appointmentId: payload.appointmentId,
      channel: channel,
      triggerType: triggerType,
      status: "sent",
      message: message,
    });

    return { success: true, messageId: `sim_${Date.now()}` };
  } catch (error) {
    console.error("Failed to send notification:", error);
    
    // Log failure
    try {
      await db.insert(reminderLogs).values({
        appointmentId: payload.appointmentId,
        channel: channel,
        triggerType: triggerType,
        status: "failed",
        message: "Failed to process notification",
      });
    } catch (e) {
       // Ignore DB log failure
    }

    return { success: false, error };
  }
}
