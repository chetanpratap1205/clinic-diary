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
  leadCategory?: string | null;
  messageSentStep?: number | null;
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
  { value: "new", label: "New Lead", badgeColor: "bg-slate-100 text-slate-700 border-slate-200" },
  { value: "verified", label: "Verified", badgeColor: "bg-teal-50 text-teal-700 border-teal-200" },
  { value: "contacted", label: "Contacted", badgeColor: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "whatsapp_sent", label: "WhatsApp Sent", badgeColor: "bg-[#E7FDE1] text-emerald-800 border-emerald-200" },
  { value: "called", label: "Called", badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "interested", label: "Interested 🔥", badgeColor: "bg-amber-50 text-amber-800 border-amber-300 font-semibold" },
  { value: "demo_scheduled", label: "Demo Scheduled", badgeColor: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "trial", label: "14-Day Trial", badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "converted", label: "Won (Converted) 🎉", badgeColor: "bg-emerald-600 text-white font-bold" },
  { value: "rejected", label: "Lost (Rejected)", badgeColor: "bg-red-50 text-red-600 border-red-200" },
  { value: "not_interested", label: "Not Interested", badgeColor: "bg-slate-200 text-slate-600 border-slate-300" },
];

export const VERIFICATION_STATUSES = [
  { value: "needs_verification", label: "Needs Verification ⚠️", badgeColor: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "verified", label: "Verified ✅", badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "invalid", label: "Invalid Lead ❌", badgeColor: "bg-red-50 text-red-700 border-red-200" },
  { value: "duplicate", label: "Duplicate 👥", badgeColor: "bg-slate-100 text-slate-600 border-slate-200" },
];

export const CALL_OUTCOMES = [
  { value: "connected", label: "Connected / Spoke with Doctor 🗣️" },
  { value: "no_answer", label: "No Answer / Ringing 🔕" },
  { value: "busy", label: "Line Busy ⏳" },
  { value: "wrong_number", label: "Wrong Number ❌" },
  { value: "call_back", label: "Call Back Requested 📅" },
  { value: "interested", label: "Doctor Interested 🔥" },
  { value: "not_interested", label: "Doctor Not Interested 🚫" },
];

export const LEAD_SOURCES = [
  { value: "google_maps", label: "Google Maps 🗺️" },
  { value: "social_media", label: "Social Media 📱" },
  { value: "referral", label: "Referral 👥" },
  { value: "imported", label: "Imported / Scraped 📥" },
  { value: "manual", label: "Manual Entry ✍️" },
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
  doctorName?: string | null;
  clinicName?: string | null;
  city?: string | null;
}): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";
  if (lead.clinicSlug) {
    return `${baseUrl}/clinic/${lead.clinicSlug}`;
  }
  
  const rawName = lead.clinicName || lead.doctorName || "clinic";
  const city = lead.city || "";
  const cleanSlug = `${rawName}-${city}`
    .toLowerCase()
    .replace(/^dr\.?\s*/i, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 45);

  return `${baseUrl}/clinic/${cleanSlug}`;
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

// ─── Universal Messaging Sequence (Truthful & Objective) ──────────────────────
export function buildUniversalMessage(lead: LeadForMessage, step: number): string {
  const name = extractLastName(lead.doctorName);
  const clinicName = lead.clinicName || "your clinic";
  const demoUrl = generateLeadDemoUrl(lead);

  if (step === 1) {
    return `${formatDoctorName(name)}, we set up a custom online booking page for ${clinicName}:
🔗 ${demoUrl}

It operates under your clinic's name with 0% marketplace commission. You keep your paper Rx pad and offline workflow intact.

Take a 30-second look at how it works.

— Doctor Diary Onboarding`;
  }

  if (step === 2) {
    return `${formatDoctorName(name)}, following up on the booking page created for ${clinicName}:
🔗 ${demoUrl}

Doctors use Doctor Diary for two main benefits:
1. 24/7 online booking for patients searching after OPD hours.
2. 0% commission on consultations.

Reply YES if you would like to test the 14-day free trial.`;
  }

  // Step 3 — Final Clean Touchpoint
  return `${formatDoctorName(name)}, final follow-up regarding the custom booking app for ${clinicName}:
🔗 ${demoUrl}

Reply ACTIVATE if you would like to claim your 14-day free trial. Otherwise, no problem at all!`;
}

export function buildMessageForStep(lead: LeadForMessage, step: number): string {
  return buildUniversalMessage(lead, step);
}

export function buildMessageForLead(lead: LeadForMessage, stepOverride?: number): { step: number; text: string } {
  const currentStep = lead.messageSentStep || 0;
  const nextStep = stepOverride !== undefined ? stepOverride : Math.min(currentStep + 1, 3);
  const text = buildMessageForStep(lead, nextStep);
  return { step: nextStep, text };
}
