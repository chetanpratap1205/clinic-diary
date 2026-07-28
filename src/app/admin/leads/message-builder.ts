/**
 * Doctor Diary — WhatsApp Message Builder
 * Universal Messaging Strategy focusing on Patient Experience & Increasing Patient Return
 * Pure TypeScript — no React, no side effects.
 */

export type LeadCategory = "A" | "B" | "C";

export interface LeadForMessage {
  doctorName: string;
  clinicName?: string | null;
  phone: string;
  specialty?: string | null;
  city?: string | null;
  leadCategory: string;
  messageSentStep: number;
}

// ─── Global Config ───────────────────────────────────────────────────────────
export const MESSAGE_CONFIG = {
  senderName: "Govind Bansal | Sales & Marketing Head",
  shortSenderName: "Govind Bansal",
  videoLink: "https://doctor.naturexpress.in/demo",
  pdfLink: "https://doctor.naturexpress.in/prospectus.pdf",
  repName: "Govind Bansal",
};

// ─── Step label helper ────────────────────────────────────────────────────────
export function getSuggestedPillar(specialty: string | null | undefined): string {
  // Keeping for backward compatibility with schema
  return "growth";
}

export function getNextStepLabel(currentStep: number, category: string): string {
  const next = currentStep + 1;
  if (next > 3) return "All Steps Sent";
  return `Send Step ${next} (${getCategoryLabel(category)})`;
}

export function getCategoryLabel(cat: string): string {
  if (cat === "A") return "Cold Outreach";
  if (cat === "B") return "Visited Clinic";
  if (cat === "C") return "Inbound Lead";
  return "Unknown";
}

// ─── Universal Core Hook ─────────────────────────────────────────────────────
const getUniversalHook = () => `We know nothing beats the speed and comfort of writing on your favorite prescription pad. Doctor Diary is designed to work *with* that habit, not change it.

While you write as usual, Doctor Diary instantly creates a digital copy of your prescription and delivers it directly to your patient's WhatsApp before they even step out of the clinic.`;

// ─── Category A — Cold Outreach Messages ─────────────────────────────────────
export function buildCategoryAMessage(lead: LeadForMessage, step: number): string {
  const name = extractLastName(lead.doctorName);
  const clinicName = lead.clinicName || "your clinic";

  if (step === 1) {
    return `Respected Dr. ${name},

${getUniversalHook()}

Here is how Doctor Diary is upgrading patient experience and increasing patient footfall for clinics like yours:

🌟 5-Star Patient Experience: Patients get their Rx instantly on WhatsApp (no lost papers).
📈 Increasing Patient Returns: Automated WhatsApp follow-up reminders bring back 15-20% of patients who would otherwise miss their return dates.
🛋️ Calm Waiting Rooms: Live queue turn updates on the patient's phone prevent front-desk crowding.

🎥 45-Second Demo: ${MESSAGE_CONFIG.videoLink}
📄 Complete Feature Guide: ${MESSAGE_CONFIG.pdfLink}

Can I send you a test login to see how it looks on your phone?

${MESSAGE_CONFIG.senderName} | Doctor Diary`;
  }

  if (step === 2) {
    return `Dr. ${name}, following up briefly.

The single biggest feedback we hear from doctors using Doctor Diary is about the increase in returning patients.

Because patients receive a polite WhatsApp reminder 24 hours before their follow-up date, clinics are seeing an average 18% increase in follow-up footfall every month. 

You already have the video and prospectus from my last message.

If elevating the patient experience looks useful for ${clinicName}, reply and I will set that specific module up as a free trial. No full onboarding required.

${MESSAGE_CONFIG.senderName} | Doctor Diary`;
  }

  // Step 3 — Clean Exit
  return `Dr. ${name},

Last message from my end — I know your schedule leaves very little room.

Leaving this here for whenever it becomes relevant:
🎥 45-Second Video Overview: ${MESSAGE_CONFIG.videoLink}
📄 Complete Feature Prospectus: ${MESSAGE_CONFIG.pdfLink}

If increasing returning patients and providing a digital 5-star experience ever becomes a priority for ${clinicName}, reply to this message anytime and we will set up your clinic within 15 minutes.

Wishing you a great practice ahead.

${MESSAGE_CONFIG.senderName} | Doctor Diary`;
}

// ─── Category B — Visited Clinic Messages ────────────────────────────────────
export function buildCategoryBMessage(lead: LeadForMessage, step: number): string {
  const name = extractLastName(lead.doctorName);
  const clinicName = lead.clinicName || "your clinic";

  if (step === 1) {
    return `Respected Dr. ${name},

${MESSAGE_CONFIG.repName} from our team visited ${clinicName} earlier today.

As promised, here is everything in one place:
🎥 Demo Video (45 seconds): ${MESSAGE_CONFIG.videoLink}
📄 Full Feature Prospectus: ${MESSAGE_CONFIG.pdfLink}

One thing worth highlighting for ${clinicName} — you don't need to change how you write prescriptions. Keep using your pen and pad. Doctor Diary just ensures the patient gets a digital copy on WhatsApp immediately. 

It elevates the patient experience instantly, and patients love it because they never lose their prescriptions again.

Tomorrow between 1–2 PM, can I show you the full workflow in a 3-minute call?

${MESSAGE_CONFIG.senderName} | Doctor Diary`;
  }

  if (step === 2) {
    return `Dr. ${name}, good afternoon.

Quick question about ${clinicName} — how many patients miss their return dates simply because they forgot or lost the paper prescription?

Doctor Diary fixes this automatically. Our automated WhatsApp follow-up reminders bring 15-20% more patients back to your clinic precisely when they are scheduled to return. It directly increases your clinic's monthly footfall without any extra effort from your front desk.

Your team can be set up and trained in under 15 minutes.

Shall I configure a trial version with ${clinicName} pre-loaded?

${MESSAGE_CONFIG.senderName} | Doctor Diary`;
  }

  // Step 3 — Personal Trial Handover
  return `Dr. ${name},

Following up on our team's visit to ${clinicName}.

Whenever you have 3 minutes between consultations, reply "DEMO" to this message and I will personally walk you through Doctor Diary configured for your practice.

🎥 Watch 45-Second Demo: ${MESSAGE_CONFIG.videoLink}
📄 Download Prospectus: ${MESSAGE_CONFIG.pdfLink}

If improving the patient experience fits your current goals, we can go fully live within the same day.

${MESSAGE_CONFIG.senderName} | Doctor Diary`;
}

// ─── Category C — Inbound Messages ───────────────────────────────────────────
export function buildCategoryCMessage(lead: LeadForMessage, step: number): string {
  const name = extractLastName(lead.doctorName);
  const clinicName = lead.clinicName || "your clinic";

  if (step === 1) {
    return `Respected Dr. ${name},

Thank you for reaching out — great timing on exploring Doctor Diary for ${clinicName}.

Here is your complete preview:
🎥 Product Walkthrough (45 sec): ${MESSAGE_CONFIG.videoLink}
📄 Full Feature Guide: ${MESSAGE_CONFIG.pdfLink}

Three things doctors tell us make the biggest difference from Day 1:
1. Patient Experience: Patients get their Rx instantly on WhatsApp (you still use your normal pen and pad).
2. Increased Footfall: Auto-reminders ensure patients don't forget their return dates.
3. Queue Sanity: Patients stop asking the receptionist "What's my turn?" — WhatsApp updates handle it.

What is the biggest friction point in your patient flow right now?

${MESSAGE_CONFIG.senderName} | Doctor Diary`;
  }

  if (step === 2) {
    return `Dr. ${name}, a quick follow-up on Doctor Diary.

In concrete terms, here is what changes for ${clinicName} in the first 30 days:

📌 Patient no-show rate drops significantly (WhatsApp reminders replace phone calls)
📌 Monthly follow-up revenue recovers 15–20% from automated patient nudges
📌 Google review count increases 3x from automated post-visit feedback requests
📌 The clinic feels like a premium, 5-star experience for every patient

The setup takes 15 minutes. There is no contract and no lock-in.

If you watched even part of the video I shared — reply with the one feature that stood out and I will demo just that in 2 minutes over a call.

${MESSAGE_CONFIG.senderName} | Doctor Diary`;
  }

  // Step 3 — Direct Close Offer
  return `Dr. ${name},

I am ${MESSAGE_CONFIG.shortSenderName}, Sales & Marketing Head at Doctor Diary. I wanted to reach out personally.

I built this outreach because I see how easily a clinic can elevate its patient experience and increase returning footfall with just a few smart digital tools, without disrupting the doctor's traditional workflow.

For ${clinicName}, I will personally handle the initial setup — your clinic header, logo, medicine preferences, and receptionist training.

What I am offering:
✅ Free 14-day full trial — full features, zero restrictions
✅ Personal setup call with our team (20 minutes, at your convenience)
✅ WhatsApp support directly on this number throughout the trial

Just reply "YES" and I will book your setup call within the hour.

${MESSAGE_CONFIG.senderName} | Doctor Diary`;
}

// ─── Universal Builder by Category + Step ────────────────────────────────────
export function buildMessageForStep(
  lead: LeadForMessage,
  category: string,
  step: number
): string {
  const cat = (category || "A") as LeadCategory;
  if (cat === "A") return buildCategoryAMessage(lead, step);
  if (cat === "B") return buildCategoryBMessage(lead, step);
  return buildCategoryCMessage(lead, step);
}

// ─── Main Builder ─────────────────────────────────────────────────────────────
export function buildWhatsAppMessage(lead: LeadForMessage): {
  message: string;
  stepNumber: number;
  isComplete: boolean;
  waUrl: string;
} {
  const nextStep = lead.messageSentStep + 1;
  const isComplete = nextStep > 3;

  let message = "";

  if (!isComplete) {
    message = buildMessageForStep(lead, lead.leadCategory || "A", nextStep);
  }

  const phone = lead.phone.replace(/\D/g, "");
  const phoneWithCountry = phone.startsWith("91") ? phone : `91${phone}`;
  const waUrl = isComplete ? "" : `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;

  return { message, stepNumber: nextStep, isComplete, waUrl };
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function extractLastName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  return parts[parts.length - 1] || fullName;
}

export const SPECIALTIES = [
  "General Physician",
  "Dermatology & Aesthetics",
  "Pediatrics",
  "Gynecology & Obstetrics",
  "Dentistry & Orthodontics",
  "Orthopedics & Physiotherapy",
  "Psychiatry & Mental Health",
  "Cardiology",
  "Diabetology & Endocrinology",
  "Neurology",
  "ENT",
  "Ophthalmology",
  "Urology",
  "Pulmonology",
  "Gastroenterology",
  "Oncology",
  "Polyclinic / Multi-Specialty",
  "Other",
];

export const LEAD_SOURCES = [
  { value: "online", label: "Online / Google Maps" },
  { value: "field_visit", label: "Field Visit" },
  { value: "referral", label: "Referral" },
  { value: "imported", label: "Imported (CSV)" },
  { value: "inbound", label: "Inbound / Ad Form" },
];

export const LEAD_STATUSES = [
  { value: "new", label: "New", color: "bg-blue-100 text-blue-700" },
  { value: "contacted", label: "Contacted", color: "bg-yellow-100 text-yellow-700" },
  { value: "demo_scheduled", label: "Demo Scheduled", color: "bg-purple-100 text-purple-700" },
  { value: "converted", label: "Converted", color: "bg-green-100 text-green-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
];

export const LEAD_PRIORITIES = [
  { value: "hot", label: "🔴 Hot", color: "bg-red-100 text-red-700" },
  { value: "warm", label: "🟡 Warm", color: "bg-orange-100 text-orange-700" },
  { value: "normal", label: "🔵 Normal", color: "bg-slate-100 text-slate-600" },
  { value: "cold", label: "⚪ Cold", color: "bg-slate-50 text-slate-400" },
];

export const LEAD_CATEGORIES = [
  { value: "A", label: "A — Cold Outreach", desc: "No prior contact. Found on directory/Google Maps." },
  { value: "B", label: "B — Clinic Visited", desc: "Field rep visited the clinic in person." },
  { value: "C", label: "C — Inbound Lead", desc: "Doctor reached out via ad, form, or WhatsApp." },
];
