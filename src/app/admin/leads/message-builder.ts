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
  const landingPageUrl = "https://doctor.naturexpress.in";

  if (step === 1) {
    return `${formatDoctorName(name)}, I recently searched for ${clinicName} online and noticed patients can’t book an appointment directly after finding you.

So our engineering team built a *custom booking app* for your clinic:
🔗 ${demoUrl}

It works under *your clinic’s own name* — not a marketplace. 
You keep your paper Rx pad and existing workflow. We simply add the digital booking layer around it.

We’ve already built it. Tap the link to see how it looks.

— Doctor Diary Onboarding`;
  }

  if (step === 2) {
    return `${formatDoctorName(name)}, just checking if you had a chance to see the booking app we built for your clinic.

Top doctors in ${city} are switching to this system for two reasons:
1. *Zero Disruption:* You get 24/7 online bookings, but your offline clinic workflow stays exactly the same.
2. *0% Commission:* The patient relationship stays entirely yours.

*Important:* We strictly limit Doctor Diary to *ONE clinic per specialty in each local area* to protect your patient flow from competitors. 

You can check if your area's slot is still available here:
🔗 ${landingPageUrl}

Reply *YES* to claim your 14-day free trial and lock your territory.`;
  }

  // Step 3 — Clean Exit / Takeaway
  return `${formatDoctorName(name)}, this is my final follow-up.

We are keeping your custom booking app reserved for *48 more hours*:
🔗 ${demoUrl}

If you prefer sticking to the old manual system, no problem at all. After the hold period, we will release your area's exclusive slot to another specialist.

Reply *ACTIVATE* to secure your digital upgrade and 14-day trial.`;
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
