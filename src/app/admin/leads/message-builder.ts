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

  if (step === 1) {
    return `Dr. ${formatDoctorName(name)}, I recently searched for ${clinicName} online but noticed patients can't book an appointment directly from Google.

You are likely losing walk-ins and new patients simply because they search after clinic hours.

To fix this, our engineering team built a custom digital front desk just for your clinic:
🔗 ${demoUrl}

This isn't a marketplace like Practo. It's your clinic, under your own name. Walk-ins still come, and you still use your paper Rx pad—we just handle the digital booking automatically.

Tap the link to see how it looks. Shall we activate this for you?

— Doctor Diary Onboarding`;
  }

  if (step === 2) {
    return `Dr. ${formatDoctorName(name)}, just checking if you had a moment to see the booking app we built for ${clinicName}?

Top doctors in ${city} are switching to this system because of three simple rules:
1. 0% Commission (Patients pay you directly at the desk).
2. Zero Disruption (Keep using your paper Rx pad).
3. 24/7 Visibility (Patients book even when the clinic is closed).

All for less than the cost of a cup of tea per day.

🔗 ${demoUrl}

Reply 'YES' to claim your 14-day free trial and stop losing patients to competitors.`;
  }

  // Step 3 — Clean Exit / Takeaway
  return `Dr. ${formatDoctorName(name)}, this is my final message regarding the digital front desk we built for you.

We are strictly limiting this technology to a few premium clinics in ${city} to ensure they dominate local patient searches without overcrowding the system.

I'll leave your custom booking link active for 48 more hours:
🔗 ${demoUrl}

If you prefer sticking to the old manual system, no problem at all. We will release this spot to another specialist in your area tomorrow.

Reply 'ACTIVATE' if you want to secure your clinic's digital upgrade.`;
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
