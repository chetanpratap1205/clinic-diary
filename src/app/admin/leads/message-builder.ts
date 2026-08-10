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

export const LEAD_PRIORITIES = [
  { value: "hot", label: "🔥 Hot" },
  { value: "warm", label: "🟡 Warm" },
  { value: "normal", label: "Normal" },
  { value: "cold", label: "❄ Cold" },
];

export const LEAD_CATEGORIES = [
  { value: "A", label: "Cold Outreach", desc: "Discovered via Google Maps / Instagram / LinkedIn" },
  { value: "B", label: "Visited Clinic", desc: "Your team has physically visited the clinic" },
  { value: "C", label: "Inbound Lead", desc: "Doctor reached out to you directly" },
];

export const LEAD_SOURCES = [
  { value: "google_maps", label: "Google Maps 🗺️" },
  { value: "instagram", label: "Instagram 📸" },
  { value: "linkedin", label: "LinkedIn 💼" },
  { value: "field_visit", label: "Field Visit 🚗" },
  { value: "online", label: "Inbound Web 🌐" },
  { value: "imported", label: "CSV Import 📄" },
  { value: "growth_partner", label: "Growth Partner 🤝" },
  { value: "referral", label: "Referral 👥" },
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
  // We MUST use the actual clinicSlug from the database.
  // Fallbacks create broken links since they bypass collision checks.
  if (!lead.clinicSlug) {
    console.warn("generateLeadDemoUrl: lead.clinicSlug is missing, returning base url");
    return "https://doctor.naturexpress.in/demo";
  }
  return `https://doctor.naturexpress.in/book/${lead.clinicSlug}`;
}

// ─── Step / Category Helpers ──────────────────────────────────────────────────
export function getSuggestedPillar(specialty: string | null | undefined): string {
  return "growth";
}

export function getNextStepLabel(currentStep: number, category: string): string {
  const next = currentStep + 1;
  if (next > 3) return "All Steps Sent";
  return `Send Step ${next} (${getCategoryLabel(category)})`;
}

export function getCategoryLabel(cat: string): string {
  const found = LEAD_CATEGORIES.find((c) => c.value === cat.toUpperCase());
  return found?.label ?? "Unknown";
}

function extractLastName(name: string): string {
  const clean = name.replace(/^dr\.?\s+/i, "").trim();
  return clean.split(/\s+/)[0] || clean;
}

// ─── Category A — Cold Outreach Messages ─────────────────────────────────────
export function buildCategoryAMessage(lead: LeadForMessage, step: number): string {
  const name = extractLastName(lead.doctorName);
  const clinicName = lead.clinicName || "your clinic";
  const city = lead.city || "your area";
  const demoUrl = generateLeadDemoUrl(lead);

  if (step === 1) {
    return `Good morning ${formatDoctorName(name)},

While reviewing healthcare listings in ${city}, we noticed that ${clinicName} doesn't yet have a dedicated online booking page that patients can access directly.

So we prepared one specifically for your clinic.

🔗 ${demoUrl}

It already includes your clinic details and is not public yet.

We'd genuinely appreciate your opinion before we activate it. If you get just 60 seconds today, have a look.

— Doctor Diary Onboarding Team`;
  }

  if (step === 2) {
    return `${formatDoctorName(name)},

Thank you if you've already seen the page.

One thing we noticed after speaking with independent clinics is this:
Doctors rarely lose patients because of treatment. They lose patients because follow-ups become inconvenient.

That's exactly what Doctor Diary solves for ${clinicName}:
• Patients book without calling repeatedly.
• 1-click WhatsApp preset messages reduce missed follow-ups.
• Reception spends less time answering routine calls.
• You continue practicing exactly the way you do today (no change to how you write prescriptions).

No commissions. No marketplace. All at a pricing that costs less than a cup of tea per day.

If you'd like to activate your clinic page, simply reply:
*Activate*

We'll take care of everything else.`;
  }

  // Step 3 — Clean Exit / Takeaway
  return `${formatDoctorName(name)},

This will be my final message.

I understand adopting something new isn't a priority when patient care comes first.

Your clinic page will remain reserved here:
🔗 ${demoUrl}

If at any point you decide you'd like patients to book online, reduce follow-up no-shows with 1-click WhatsApp reminders, or simplify reception work, just reply to this chat.

We'll handle the setup. Wishing you and your team continued success.

— Doctor Diary Onboarding Team`;
}

// ─── Category B — Visited Clinic Messages ────────────────────────────────────
export function buildCategoryBMessage(lead: LeadForMessage, step: number): string {
  const name = extractLastName(lead.doctorName);
  const clinicName = lead.clinicName || "your clinic";
  const demoUrl = generateLeadDemoUrl(lead);

  if (step === 1) {
    return `Good morning ${formatDoctorName(name)},

Following up on our team's recent visit to ${clinicName}, we wanted to share something we prepared specifically for you.

We noticed many clinics lose out because they lack a dedicated online booking page. So we reserved this digital identity exclusively for your clinic:

🔗 ${demoUrl}

It already includes your clinic details and is not public yet.

We'd genuinely appreciate your opinion before we activate it. If you get just 60 seconds today, have a look.

— Doctor Diary Onboarding Team`;
  }

  if (step === 2) {
    return `${formatDoctorName(name)},

Thank you if you've already seen the page we discussed during our visit.

One thing we noticed after speaking with independent clinics is this:
Doctors rarely lose patients because of treatment. They lose patients because follow-ups become inconvenient.

That's exactly what Doctor Diary solves for ${clinicName}:
• Patients book without calling repeatedly.
• 1-click WhatsApp preset messages reduce missed follow-ups.
• Reception spends less time answering routine calls.
• You continue practicing exactly the way you do today.

No commissions. No marketplace. All at a pricing that costs less than a cup of tea per day.

If you'd like to activate your clinic page, simply reply:
*Activate*

We'll take care of everything else.`;
  }

  return `${formatDoctorName(name)},

This will be my final message.

I understand adopting something new isn't a priority when patient care comes first.

Your clinic page will remain reserved here:
🔗 ${demoUrl}

If at any point you decide you'd like patients to book online, reduce follow-up no-shows with 1-click WhatsApp messages, or simplify reception work, just reply to this chat.

We'll handle the setup. Wishing you and your team continued success.

— Doctor Diary Onboarding Team`;
}

// ─── Category C — Inbound Lead Messages ──────────────────────────────────────
export function buildCategoryCMessage(lead: LeadForMessage, step: number): string {
  const name = extractLastName(lead.doctorName);
  const clinicName = lead.clinicName || "your clinic";
  const demoUrl = generateLeadDemoUrl(lead);

  if (step === 1) {
    return `Good morning ${formatDoctorName(name)},

Thank you for reaching out regarding Doctor Diary for ${clinicName}. 

We wanted to make sure your digital identity was reserved right away, so we prepared your dedicated online booking page.

🔗 ${demoUrl}

It already includes your clinic details and is not public yet.

We'd genuinely appreciate your opinion on the design before we activate it. Have a look when you get 60 seconds today.

— Doctor Diary Onboarding Team`;
  }

  if (step === 2) {
    return `${formatDoctorName(name)},

Thank you if you've already seen the page.

Based on your inquiry, we know you're looking for solutions for ${clinicName}. The biggest issue we see for independent clinics is that they lose patients because follow-ups become inconvenient.

That's exactly what Doctor Diary solves:
• Patients book without calling repeatedly.
• 1-click WhatsApp preset messages reduce missed follow-ups.
• Reception spends less time answering routine calls.
• You continue practicing exactly the way you do today.

No commissions. No marketplace. All at a pricing that costs less than a cup of tea per day.

If you'd like to officially activate your clinic page, simply reply:
*Activate*

We'll take care of everything else.`;
  }

  return `${formatDoctorName(name)},

This will be my final message regarding your inquiry.

I understand adopting something new isn't always an immediate priority when patient care comes first.

Your clinic page will remain reserved here:
🔗 ${demoUrl}

If at any point you decide you'd like patients to book online, reduce follow-up no-shows with 1-click WhatsApp messages, or simplify reception work, just reply to this chat.

We'll handle the setup. Wishing you and your team continued success.

— Doctor Diary Onboarding Team`;
}

// ─── Unified message builder (used by WhatsApp drawer) ────────────────────────
export function buildMessageForStep(lead: LeadForMessage, category: string, step: number): string {
  const cat = (category || "A").toUpperCase();
  if (cat === "B") return buildCategoryBMessage(lead, step);
  if (cat === "C") return buildCategoryCMessage(lead, step);
  return buildCategoryAMessage(lead, step);
}

export function buildMessageForLead(lead: LeadForMessage, stepOverride?: number): { step: number; text: string } {
  const currentStep = lead.messageSentStep || 0;
  const nextStep = stepOverride !== undefined ? stepOverride : Math.min(currentStep + 1, 3);
  const text = buildMessageForStep(lead, lead.leadCategory || "A", nextStep);
  return { step: nextStep, text };
}
