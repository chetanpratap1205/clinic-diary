/**
 * Centralized Google Analytics (gtag.js) Event Helper for Doctor Diary
 * Measurement ID: G-Y3BEDYTXTW
 */

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-Y3BEDYTXTW";

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event" | "js" | "set",
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Send custom event to Google Analytics 4
 */
export function trackGAEvent(eventName: string, eventParams: Record<string, any> = {}) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    try {
      window.gtag("event", eventName, {
        send_to: GA_MEASUREMENT_ID,
        ...eventParams,
      });
    } catch (err) {
      console.warn("GA event failed to dispatch:", err);
    }
  }
}

// ─── Standard SaaS Funnel Helpers ─────────────────────────────────────────────

/** Triggered when a new doctor creates an account */
export function trackSignUp(method: string = "email") {
  trackGAEvent("sign_up", {
    method,
  });
}

/** Triggered when a doctor finishes clinic profile onboarding */
export function trackOnboardingComplete(params: {
  clinicName?: string;
  specialty?: string;
  city?: string;
  consultationFee?: number;
}) {
  trackGAEvent("onboarding_complete", {
    specialty: params.specialty || "General",
    city: params.city || "",
    consultation_fee: params.consultationFee || 0,
  });
}

/** Triggered when a patient books an appointment */
export function trackAppointmentBooked(params: {
  clinicSlug: string;
  doctorName?: string;
  specialty?: string;
  isOnline?: boolean;
}) {
  trackGAEvent("appointment_booked", {
    clinic_slug: params.clinicSlug,
    doctor_name: params.doctorName || "",
    specialty: params.specialty || "",
    booking_type: params.isOnline ? "online" : "walk_in",
  });
}

/** Triggered when a doctor clicks a paid subscription plan */
export function trackBeginCheckout(params: {
  planId: string;
  planName: string;
  value: number;
  currency?: string;
}) {
  trackGAEvent("begin_checkout", {
    plan_id: params.planId,
    plan_name: params.planName,
    value: params.value,
    currency: params.currency || "INR",
  });
}

/** Triggered when Razorpay payment is successfully verified */
export function trackPurchase(params: {
  transactionId: string;
  planId: string;
  planName: string;
  value: number;
  currency?: string;
}) {
  trackGAEvent("purchase", {
    transaction_id: params.transactionId,
    plan_id: params.planId,
    plan_name: params.planName,
    value: params.value,
    currency: params.currency || "INR",
  });
}

/** Triggered when a doctor completes a consultation / prescription */
export function trackConsultationCompleted(params: {
  appointmentId: string;
  hasPrescription?: boolean;
}) {
  trackGAEvent("consultation_completed", {
    appointment_id: params.appointmentId,
    has_prescription: params.hasPrescription ?? true,
  });
}

/** Triggered when a lead requests a demo or submits a contact form */
export function trackLeadGenerated(formName: string = "demo_request") {
  trackGAEvent("generate_lead", {
    form_name: formName,
  });
}
