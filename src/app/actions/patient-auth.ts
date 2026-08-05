"use server";

import { db } from "@/db";
import { appointments } from "@/db/schema";
import { eq, or } from "drizzle-orm";

// Memory/Session OTP store for rapid verification (with 5-min TTL)
// Maps email -> { code: string, expiresAt: number, clinicName?: string }
const otpCache = new Map<string, { code: string; expiresAt: number; clinicName?: string }>();

/**
 * Send a 6-digit Email OTP for Patient Login / History view.
 */
export async function sendPatientEmailOtp(email: string, clinicName: string = "Clinic") {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { error: "Please provide a valid email address." };
    }

    // Generate 6-digit numeric OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    otpCache.set(cleanEmail, { code: otpCode, expiresAt, clinicName });

    let emailSent = false;

    // 1. Try Resend if RESEND_API_KEY environment variable is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${clinicName} <notifications@doctor.naturexpress.in>`,
            to: [cleanEmail],
            subject: `${otpCode} is your verification code for ${clinicName}`,
            html: `
              <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
                <div style="text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; tracking: 1.5px; color: #64748b; background-color: #f1f5f9; padding: 6px 14px; border-radius: 20px;">Patient Security Portal</span>
                </div>
                <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; text-align: center; margin-top: 0; margin-bottom: 8px;">Your Verification Code</h2>
                <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 28px;">Use the 6-digit security code below to securely log into your health record at <strong>${clinicName}</strong>.</p>
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px stroke #cbd5e1; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 28px;">
                  <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #0f766e; font-family: monospace;">${otpCode}</span>
                </div>
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">This security code will expire in <strong>5 minutes</strong>. If you did not request this code, please ignore this email.</p>
              </div>
            `,
          }),
        });

        if (res.ok) {
          emailSent = true;
          console.log(`[RESEND OTP SUCCESS] Dispatched OTP ${otpCode} to ${cleanEmail}`);
        } else {
          const errText = await res.text();
          console.warn("[RESEND OTP WARN] API responded with error:", errText);
        }
      } catch (e) {
        console.error("[RESEND OTP ERROR]", e);
      }
    }

    // Always log for server inspection
    console.log(`\n==============================================`);
    console.log(`🔑 PATIENT EMAIL OTP GENERATED`);
    console.log(`📧 TO: ${cleanEmail}`);
    console.log(`🔢 CODE: ${otpCode}`);
    console.log(`==============================================\n`);

    return {
      success: true,
      message: emailSent
        ? `Verification code sent to ${cleanEmail}`
        : `Verification code generated for ${cleanEmail}`,
      devOtp: process.env.NODE_ENV !== "production" || !emailSent ? otpCode : undefined,
    };
  } catch (error) {
    console.error("sendPatientEmailOtp failed:", error);
    return { error: "Failed to dispatch verification code. Please try again." };
  }
}

/**
 * Verify Patient 6-digit Email OTP and return patient record/appointments.
 */
export async function verifyPatientEmailOtp(email: string, code: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const record = otpCache.get(cleanEmail);

    if (!record) {
      return { error: "No verification code found for this email. Please request a new code." };
    }

    if (Date.now() > record.expiresAt) {
      otpCache.delete(cleanEmail);
      return { error: "Verification code has expired. Please request a new code." };
    }

    if (record.code !== code.trim()) {
      return { error: "Invalid verification code. Please check your email and try again." };
    }

    // Code is valid! Clean cache
    otpCache.delete(cleanEmail);

    // Fetch patient appointments associated with this email
    const patientAppointments = await db
      .select({
        id: appointments.id,
        patientName: appointments.patientName,
        patientPhone: appointments.patientPhone,
        appointmentDate: appointments.appointmentDate,
        appointmentTime: appointments.appointmentTime,
        status: appointments.status,
        tokenNumber: appointments.tokenNumber,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .where(eq(appointments.patientEmail, cleanEmail));

    return {
      success: true,
      email: cleanEmail,
      appointmentCount: patientAppointments.length,
      appointments: patientAppointments,
    };
  } catch (error) {
    console.error("verifyPatientEmailOtp failed:", error);
    return { error: "Failed to verify code. Please try again." };
  }
}

/**
 * Send rich HTML Booking Confirmation Email via Resend.
 */
export async function sendBookingConfirmationEmail(payload: {
  patientEmail: string;
  patientName: string;
  clinicName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: number;
  trackingUrl: string;
  cancelToken?: string;
}) {
  try {
    const cleanEmail = payload.patientEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) return;

    if (process.env.RESEND_API_KEY) {
      const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in"}/api/cancel-appointment?token=${payload.cancelToken || ""}`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${payload.clinicName} <notifications@doctor.naturexpress.in>`,
          to: [cleanEmail],
          subject: `Appointment Confirmed! Token #${payload.tokenNumber} - ${payload.clinicName}`,
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #0d9488; background-color: #ccfbf1; padding: 6px 14px; border-radius: 20px;">OPD Token Confirmed</span>
              </div>
              <h2 style="color: #0f172a; font-size: 22px; font-weight: 900; text-align: center; margin-top: 0; margin-bottom: 6px;">Appointment Confirmed!</h2>
              <p style="color: #64748b; font-size: 14px; text-align: center; margin-bottom: 24px;">Dear <strong>${payload.patientName}</strong>, your slot is locked at <strong>${payload.clinicName}</strong>.</p>
              
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 20px; padding: 24px; margin-bottom: 24px; text-align: center;">
                <p style="font-size: 11px; font-weight: 800; uppercase; color: #64748b; letter-spacing: 1px; margin: 0 0 6px 0;">YOUR LIVE OPD TOKEN NUMBER</p>
                <span style="font-size: 42px; font-weight: 900; color: #0f766e; letter-spacing: 2px;">#${payload.tokenNumber}</span>
                <div style="margin-top: 16px; pt-16px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-around;">
                  <p style="margin: 0; font-size: 13px; font-weight: 700; color: #334155;">📅 ${payload.appointmentDate}</p>
                  <p style="margin: 0; font-size: 13px; font-weight: 700; color: #334155;">⏰ ${payload.appointmentTime}</p>
                </div>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${payload.trackingUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 14px; text-decoration: none; box-shadow: 0 4px 14px rgba(13,148,136,0.3);">Track Live Queue Turn →</a>
              </div>

              <div style="border-top: 1px solid #f1f5f9; pt: 16px; text-align: center;">
                <p style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">Doctor: <strong>Dr. ${payload.doctorName}</strong></p>
                ${payload.cancelToken ? `<a href="${cancelUrl}" style="color: #ef4444; font-size: 11px; font-weight: 600; text-decoration: underline;">Need to cancel this appointment? Click here</a>` : ""}
              </div>
            </div>
          `,
        }),
      });
      console.log(`[RESEND BOOKING EMAIL] Dispatched booking email to ${cleanEmail}`);
    }
  } catch (e) {
    console.error("sendBookingConfirmationEmail failed:", e);
  }
}

/**
 * Cancel patient appointment via token.
 */
export async function cancelPatientAppointment(cancelToken: string) {
  try {
    if (!cancelToken) return { error: "Invalid cancellation token." };

    const [appt] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.cancelToken, cancelToken))
      .limit(1);

    if (!appt) {
      return { error: "Appointment not found or already cancelled." };
    }

    if (appt.status === "cancelled") {
      return { message: "This appointment was already cancelled." };
    }

    await db
      .update(appointments)
      .set({ status: "cancelled" })
      .where(eq(appointments.id, appt.id));

    return { success: true, message: "Your appointment has been successfully cancelled." };
  } catch (error) {
    console.error("cancelPatientAppointment failed:", error);
    return { error: "Failed to cancel appointment. Please contact the clinic." };
  }
}
