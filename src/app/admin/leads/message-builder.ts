/**
 * Doctor Diary — WhatsApp Message Builder
 * Universal Messaging Strategy focusing on Patient Experience & Increasing Patient Return
 * Pure TypeScript — no React, no side effects.
 */
import { formatDoctorName } from "@/lib/utils";

export type LeadCategory = "A" | "B" | "C";

export interface LeadForMessage {
  doctorName: string;
  clinicName?: string | null;
  phone: string;
  specialty?: string | null;
  city?: string | null;
  leadCategory: string;
  messageSentStep: number;
  clinicSlug?: string | null;
}

export const MESSAGE_CONFIG = {
  senderName: "Doctor Diary Onboarding Team",
  shortSenderName: "Doctor Diary",
  videoLink: "https://doctor.naturexpress.in/demo",
  pdfLink: "https://doctor.naturexpress.in/prospectus.pdf",
  repName: "Onboarding Team",
};

// ─── Lookup Tables (referenced by all forms & filters) ────────────────────────
export const LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "demo_scheduled", label: "Demo Scheduled" },
  { value: "converted", label: "Converted" },
  { value: "rejected", label: "Rejected" },
];

export const LEAD_SOURCES = [
  { value: "google_maps", label: "Google Maps 🗺️" },
  { value: "social_media", label: "Social Media 📱" },
  { value: "referral", label: "Referral 👥" },
  { value: "manual", label: "Manual / Other ✍️" },
];

export const SPECIALTIES = [
  "General Physician",
  "Dermatologist",
  "Cardiologist",
  "Orthopedic",
  "Pediatrician",
  "Gynecologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Dentist",
  "Neurologist",
  "Psychiatrist",
  "Urologist",
  "Gastroenterologist",
  "Pulmonologist",
  "Endocrinologist",
  "Rheumatologist",
  "Oncologist",
  "Nephrologist",
  "Hematologist",
  "Radiologist",
  "Pathologist",
  "Surgeon",
  "Physiotherapist",
  "Nutritionist/Dietitian",
  "Homeopath",
  "Ayurvedic Physician",
];

// ─── Auto-Generated Personalized Demo Preview URL ──────────────────────────────
export function generateLeadDemoUrl(lead: {
  clinicSlug?: string | null;
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";
  if (!lead.clinicSlug) {
    console.warn("generateLeadDemoUrl: lead.clinicSlug is missing, returning base url");
    return `${baseUrl}/demo`;
  }
  return `${baseUrl}/book/${lead.clinicSlug}`;
}

// ─── Step / Category Helpers ──────────────────────────────────────────────────
export function getSuggestedPillar(specialty: string | null | undefined): string {
  return "growth";
}

export function getNextStepLabel(currentStep: number): string {
  const next = currentStep + 1;
  if (next > 3) return "All Steps Sent";
  return `Send Step ${next}`;
}

function extractLastName(name: string): string {
  const clean = name.replace(/^dr\.?\s+/i, "").trim();
  return clean.split(/\s+/)[0] || clean;
}

// ─── Universal Messaging Sequence ──────────────────────────────────────────────
export function buildUniversalMessage(lead: LeadForMessage, step: number): string {
  const name = extractLastName(lead.doctorName);
  const clinicName = lead.clinicName || "your clinic";
  const city = lead.city || "your area";
  const demoUrl = generateLeadDemoUrl(lead);
  const videoUrl = "https://youtu.be/doctor-diary-demo"; // Replace with actual video link later

  if (step === 1) {
    return `Dr. ${formatDoctorName(name)}, I recently looked for ${clinicName} online but couldn't find a direct way to book an appointment.

Patients search 24x7, and without a booking link on your Google Maps, you're losing them to competitors.

To fix this, our engineering team built a custom booking site just for you:
🔗 ${demoUrl}

Link it to your Google Maps, Instagram, and Clinic QR code so patients can book 24x7x365. 

Watch this 60-second video to see how it works: ${videoUrl}

Shall we activate this for you?

— Doctor Diary Team`;
  }

  if (step === 2) {
    return `Dr. ${formatDoctorName(name)}, checking if you had a moment to see the booking site we built for ${clinicName}?

Clinics in ${city} using this setup have seen patient visits increase by up to 50% simply by being bookable 24x7. 

Unlike other apps, we charge 0% commission. You keep 100% of your earnings. Plus, you don't have to change your routine—you can keep writing on your regular paper Rx pad.

All at a cost less than a cup of tea per day.

🔗 ${demoUrl}

If you want to stop losing patients to other clinics, reply 'YES' to claim your 14-day free trial.`;
  }

  // Step 3 — Clean Exit / Takeaway
  return `Dr. ${formatDoctorName(name)}, this is my last follow-up regarding your custom booking app.

We are limiting this technology to only a few premium clinics in ${city} to ensure they completely dominate local patient searches.

I'll leave your booking site active for another 48 hours:
🔗 ${demoUrl}

If you don't need it, no problem. We will release this spot to another specialist in your area. 

Reply 'ACTIVATE' if you want to secure it.`;
}

// ─── Unified message builder (used by WhatsApp drawer) ────────────────────────
export function buildMessageForStep(lead: LeadForMessage, step: number): string {
  return buildUniversalMessage(lead, step);
}

export function buildMessageForLead(lead: LeadForMessage, stepOverride?: number): { step: number; text: string } {
  const currentStep = lead.messageSentStep || 0;
  const nextStep = stepOverride !== undefined ? stepOverride : Math.min(currentStep + 1, 3);
  const text = buildMessageForStep(lead, nextStep);
  return { step: nextStep, text };
}
