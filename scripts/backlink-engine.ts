/**
 * Backlink & Directory Submission Engine
 * Generates ready-to-submit payloads for top SaaS directories & backlink platforms
 * Run: npx tsx scripts/backlink-engine.ts
 */

export interface DirectoryListing {
  platform: string;
  category: string;
  submissionUrl: string;
  title: string;
  tagline: string;
  shortDescription: string;
  fullDescription: string;
  keywords: string[];
  pricingModel: string;
}

export const DIRECTORY_LISTINGS: DirectoryListing[] = [
  {
    platform: "Product Hunt",
    category: "Health & Fitness / SaaS",
    submissionUrl: "https://www.producthunt.com/posts/new",
    title: "Doctor Diary",
    tagline: "Clinic management software with 0% commission & WhatsApp booking",
    shortDescription: "Doctor Diary helps independent doctors in India & UAE eliminate no-shows by 40%, track live OPD queues, and manage digital prescriptions via WhatsApp.",
    fullDescription: `Doctor Diary is purpose-built practice management software engineered for independent clinics, polyclinics, and OPD practices across India & UAE.

Key Features:
- 0% Commission Guarantee: Direct patient-to-clinic payments via UPI/Card/Cash.
- Native WhatsApp Booking: 2-click appointment booking with zero app downloads.
- Live OPD Queue Tokens: Real-time waiting room queue tracking on patient smartphones.
- Automated Reminders: 24h & 2h WhatsApp alerts cut no-shows to under 3%.
- Physical QR Stand Included: Acrylic branded QR counter stands for instant patient check-in.`,
    keywords: ["clinic management software", "doctor appointment app", "WhatsApp clinic booking", "OPD queue management", "Practo alternative"],
    pricingModel: "Freemium / ₹1,999 quarterly subscription",
  },
  {
    platform: "G2",
    category: "Medical Practice Management Software",
    submissionUrl: "https://www.g2.com/products/new",
    title: "Doctor Diary by NatureXpress",
    tagline: "Zero-commission clinic software with WhatsApp automation",
    shortDescription: "Enterprise-grade clinic software for independent practices, dermatologists, pediatricians, and dentists in India & UAE.",
    fullDescription: "Doctor Diary is high-performance clinic software offering native WhatsApp appointment confirmations, digital prescriptions, live queue tokens, and automated Google review collection with 0% commission.",
    keywords: ["medical EMR", "clinic management", "patient scheduling software", "healthcare SaaS"],
    pricingModel: "Paid / Subscription",
  },
  {
    platform: "SaaSHub",
    category: "Healthcare / Medical",
    submissionUrl: "https://www.saashub.com/submit",
    title: "Doctor Diary",
    tagline: "The 0% commission Practo alternative for doctors",
    shortDescription: "Automate clinic appointments, live queues, and WhatsApp patient reminders without paying marketplace commissions.",
    fullDescription: "Doctor Diary gives independent doctors complete patient data sovereignty. Features WhatsApp booking, live OPD queue tracking, digital Rx, and automated follow-ups.",
    keywords: ["Practo alternative", "Zocdoc alternative", "clinic software India", "doctor app Dubai"],
    pricingModel: "Freemium",
  },
  {
    platform: "AlternativeTo",
    category: "Medical & Health",
    submissionUrl: "https://alternativeto.net/software/new/",
    title: "Doctor Diary",
    tagline: "Open & Direct alternative to Practo and Zocdoc",
    shortDescription: "Private clinic software with WhatsApp integration and live queue tracking. 0% commission.",
    fullDescription: "Doctor Diary is a direct alternative to Practo Ray, Zocdoc, and Lybrate for doctors in India and the Middle East.",
    keywords: ["Practo", "Zocdoc", "Lybrate", "Clinicea"],
    pricingModel: "Freemium",
  },
];

function printDirectoryPayloads() {
  console.log("\n=======================================================");
  console.log("🚀 DOCTOR DIARY — BACKLINK & DIRECTORY PAYLOAD ENGINE");
  console.log("=======================================================\n");

  DIRECTORY_LISTINGS.forEach((dir, idx) => {
    console.log(`[${idx + 1}] PLATFORM: ${dir.platform}`);
    console.log(`🔗 Submission URL: ${dir.submissionUrl}`);
    console.log(`📌 Title:         ${dir.title}`);
    console.log(`🏷️ Tagline:       ${dir.tagline}`);
    console.log(`📝 Description:   ${dir.shortDescription}`);
    console.log(`🔑 Keywords:      ${dir.keywords.join(", ")}`);
    console.log("-------------------------------------------------------\n");
  });
}

printDirectoryPayloads();
