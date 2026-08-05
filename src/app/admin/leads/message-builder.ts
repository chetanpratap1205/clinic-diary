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

export const MESSAGE_CONFIG = {
  senderName: "Govind Bansal | Sales & Marketing Head",
  shortSenderName: "Govind Bansal",
  videoLink: "https://doctor.naturexpress.in/demo",
  pdfLink: "https://doctor.naturexpress.in/prospectus.pdf",
  repName: "Govind Bansal",
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
  doctorName: string;
  clinicName?: string | null;
  specialty?: string | null;
  city?: string | null;
}): string {
  let docName = lead.doctorName || "Doctor";
  // Remove "dr." prefix if it exists before sluggifying, so we can consistently add it
  if (docName.toLowerCase().startsWith("dr. ")) {
    docName = docName.substring(4);
  } else if (docName.toLowerCase().startsWith("dr ")) {
    docName = docName.substring(3);
  }

  let slug = docName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
    
  // Ensure it starts with dr-
  if (!slug.startsWith("dr-")) {
    slug = `dr-${slug}`;
  }

  return `https://doctor.naturexpress.in/book/${slug}`;
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
  const specialty = lead.specialty ? `as a ${lead.specialty}` : "";
  const demoUrl = generateLeadDemoUrl(lead);

  if (step === 1) {
    return `*Stop paying 20% commission to aggregators, Dr. ${name}.*

Your clinic's revenue and patient data belong exclusively to you${specialty ? ` — especially ${specialty}` : ""}.

We have pre-built a *100% Free Custom Booking Website + Mobile App* specifically for *${clinicName}*:

🌐 *Your Live Booking Website & App:*
${demoUrl}

⚡ *What ${clinicName} gets instantly:*
• *0% Commission* — Keep 100% of consultation & clinic fees.
• *Zero Typing* — Write on your paper Rx pad; patients get a digital copy on WhatsApp.
• *Automated Patient Returns* — Smart follow-up reminders bring back 18-20% more patients monthly.

Reply *1* to activate your 14-day free trial instantly.
Reply *2* to receive a 2-minute video demo.

${MESSAGE_CONFIG.shortSenderName}
Doctor Diary | 📄 ${MESSAGE_CONFIG.pdfLink}`;
  }

  if (step === 2) {
    return `*A clinic 2 streets from ${clinicName} just went live on Doctor Diary, Dr. ${name}.*

They now take 0% commission bookings, send automated WhatsApp follow-ups, and keep 100% of their patient fees — while still writing prescriptions on paper.

Your personalised clinic portal is still reserved and ready:

🌐 *${clinicName}'s Live Portal & App:*
${demoUrl}

🔒 *Territory Notice:* We lock 1 clinic per PIN code. Once it's claimed, it's gone.

Reply *YES* and we'll activate your clinic's portal in 15 minutes. Zero setup.

${MESSAGE_CONFIG.shortSenderName}
Doctor Diary`;
  }

  // Step 3 — Clean Exit / Takeaway
  return `*Closing your file now, Dr. ${name}.*

Completely understand — your schedule as a specialist leaves very little breathing room.

Your complimentary clinic website & app link remains active here for when you have a moment:
✨ ${demoUrl}

If *${clinicName}* ever decides to go commission-free and automate patient follow-ups, simply reply to this message. We'll handle the entire migration with zero downtime in 48 hours.

Wishing you a thriving practice ahead.

${MESSAGE_CONFIG.shortSenderName}
Doctor Diary`;
}

// ─── Category B — Visited Clinic Messages ────────────────────────────────────
export function buildCategoryBMessage(lead: LeadForMessage, step: number): string {
  const name = extractLastName(lead.doctorName);
  const clinicName = lead.clinicName || "your clinic";
  const specialty = lead.specialty ? `${lead.specialty} ` : "";
  const demoUrl = generateLeadDemoUrl(lead);

  if (step === 1) {
    return `*As promised during our visit, Dr. ${name} — your clinic's link is live.*

It was a pleasure meeting you at *${clinicName}* earlier. Our engineering team has already pre-configured your private booking website & mobile app:

🌐 *${specialty}Portal & App for ${clinicName}:*
${demoUrl}

💡 *What you can open right now and see live:*
• Your clinic name, specialty & booking page — already set up.
• Patients book directly, you collect fees at 0% commission.
• You keep writing Rx on paper; they get a digital copy on WhatsApp.

Reply *START* and I'll activate your 14-day free trial in 60 seconds.

${MESSAGE_CONFIG.shortSenderName}
Doctor Diary`;
  }

  if (step === 2) {
    return `*18% more returning patients at ${clinicName} — here's how, Dr. ${name}.*

Since our visit, I wanted to follow up specifically on what we discussed about missed follow-ups costing revenue.

Doctor Diary's automated WhatsApp reminders run 24/7 in the background — silently bringing back patients who would otherwise forget their follow-up date.

🌐 *Your live clinic portal (already set up):*
${demoUrl}

Enable this for just 10 patients this week — zero setup required. You'll see the difference in 7 days.

${MESSAGE_CONFIG.shortSenderName}
Doctor Diary`;
  }

  return `*Dr. ${name}, your patients are ready — the portal just needs your go-ahead.*

I'll stop following up from my end now — I know how packed a ${specialty}specialist's schedule can be.

Your clinic's custom website & app link stays active here permanently:
✨ ${demoUrl}

When you're ready to take 0% commission bookings and bring back patients on autopilot, just reply here. We'll have *${clinicName}* fully live within 48 hours.

${MESSAGE_CONFIG.shortSenderName}
Doctor Diary`;
}

// ─── Category C — Inbound Lead Messages ──────────────────────────────────────
export function buildCategoryCMessage(lead: LeadForMessage, step: number): string {
  const name = extractLastName(lead.doctorName);
  const clinicName = lead.clinicName || "your clinic";
  const specialty = lead.specialty ? ` ${lead.specialty}` : "";
  const demoUrl = generateLeadDemoUrl(lead);

  if (step === 1) {
    return `*Your free clinic website & app are live, Dr. ${name}!*

Thank you for reaching out to Doctor Diary. We've already pre-configured *${clinicName}'s* complete digital booking infrastructure:

🌐 *Your Live Booking Portal & App:*
${demoUrl}

⚡ *What's inside (open the link now):*
• *0% Commission* — All appointment & direct patient payments go straight to you.
• *Keep Pen & Pad* — Write as usual; we handle the digital WhatsApp delivery.
• *White-Glove Setup* — All patient data migrated in 48 hours, zero downtime.

Reply *DEMO* for a 5-minute guided call.
Reply *GO* to activate your account right now!

${MESSAGE_CONFIG.shortSenderName}
Doctor Diary | 📄 ${MESSAGE_CONFIG.pdfLink}`;
  }

  if (step === 2) {
    return `*24 hours left to hold your territory, Dr. ${name}.*

You enquired about Doctor Diary and we want to make sure *${clinicName}* secures its PIN code territory before another${specialty} clinic in your area does.

We only activate 1 clinic per PIN code area to guarantee digital exclusivity and maximum ROI.

🌐 *Your portal is live and waiting:*
${demoUrl}

Reply *NOW* and we will complete your clinic setup in under 15 minutes today.

${MESSAGE_CONFIG.shortSenderName}
Doctor Diary`;
  }

  return `*Closing out your inquiry for now, Dr. ${name}.*

You can access *${clinicName}'s* custom booking website & app anytime here:
✨ ${demoUrl}

Whenever you're ready to go commission-free and protect your patient database from aggregators, drop a message here and we'll activate everything within 15 minutes.

${MESSAGE_CONFIG.shortSenderName}
Doctor Diary`;
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
