/**
 * 40+ Medical Specialty Taxonomy & Deep SEO/GEO Engine
 * Provides rich specialty-specific keywords, Hindi translations, Schema.org MedicalSpecialty codes,
 * tailored hero visual illustrations, and high-converting patient intent keywords.
 */

export interface SpecialtySEOConfig {
  key: string;
  displayName: string;
  hindiName: string;
  medicalSpecialtyCode: string;
  keywords: string[];
  commonTreatments: string[];
  heroBadge: string;
  heroImage: string;
  faqPrompt: string;
}

export const SPECIALTY_TAXONOMY: Record<string, SpecialtySEOConfig> = {
  dentist: {
    key: "dentist",
    displayName: "Dentist & Dental Surgeon",
    hindiName: "दांतों के डॉक्टर",
    medicalSpecialtyCode: "Dentistry",
    keywords: [
      "dentist near me",
      "best dental clinic",
      "tooth pain doctor",
      "root canal treatment",
      "teeth whitening",
      "dental implants",
      "braces specialist",
      "tooth extraction",
    ],
    commonTreatments: ["Root Canal Treatment (RCT)", "Teeth Cleaning & Polishing", "Dental Implants", "Tooth Extraction", "Dental Crowns & Bridges", "Braces & Aligners"],
    heroBadge: "🦷 Dental Care Specialist",
    heroImage: "/dental-hero-bg.jpg",
    faqPrompt: "What dental treatments are available?",
  },
  dermatologist: {
    key: "dermatologist",
    displayName: "Dermatologist & Skin Specialist",
    hindiName: "त्वचा एवं बालों के डॉक्टर",
    medicalSpecialtyCode: "Dermatology",
    keywords: [
      "dermatologist near me",
      "skin doctor",
      "acne treatment clinic",
      "hair loss doctor",
      "laser skin care",
      "pigmentation treatment",
      "glowing skin consultation",
    ],
    commonTreatments: ["Acne & Pimples Care", "Hair Fall & PRP Therapy", "Skin Brightening & Laser", "Eczema & Allergy Treatment", "Anti-Aging Consultation"],
    heroBadge: "✨ Skin & Hair Specialist",
    heroImage: "/derma-hero-bg.jpg",
    faqPrompt: "What skin and hair treatments are offered?",
  },
  physiotherapist: {
    key: "physiotherapist",
    displayName: "Physiotherapist & Spine Specialist",
    hindiName: "फिजियोथेरेपिस्ट एवं जोड़ दर्द विशेषज्ञ",
    medicalSpecialtyCode: "Physiotherapy",
    keywords: [
      "physiotherapist near me",
      "back pain treatment",
      "knee pain physiotherapy",
      "frozen shoulder exercise",
      "sports injury rehabilitation",
      "spine rehabilitation clinic",
    ],
    commonTreatments: ["Back & Neck Pain Relief", "Knee & Joint Rehabilitation", "Sports Injury Recovery", "Stroke & Neuro Rehab", "Post-Surgery Physiotherapy"],
    heroBadge: "🦾 Joint & Spine Mobility Specialist",
    heroImage: "/physio-hero-bg.jpg",
    faqPrompt: "How does physiotherapy rehabilitation work?",
  },
  pediatrician: {
    key: "pediatrician",
    displayName: "Pediatrician & Child Specialist",
    hindiName: "बच्चों के डॉक्टर",
    medicalSpecialtyCode: "Pediatric",
    keywords: [
      "pediatrician near me",
      "child doctor",
      "baby vaccination clinic",
      "childhood fever treatment",
      "newborn growth care",
    ],
    commonTreatments: ["Newborn Care & Growth Monitoring", "Childhood Vaccination & Immunization", "Fever & Infection Care", "Pediatric Nutrition"],
    heroBadge: "👶 Child Health & Vaccination Specialist",
    heroImage: "/pediatric-hero-bg.jpg",
    faqPrompt: "Is child vaccination available at clinic?",
  },
  gynecologist: {
    key: "gynecologist",
    displayName: "Gynecologist & Obstetrician",
    hindiName: "महिला एवं प्रसूति रोग विशेषज्ञ",
    medicalSpecialtyCode: "Gynecologic",
    keywords: [
      "gynecologist near me",
      "female doctor clinic",
      "pregnancy checkup",
      "PCOS PCOD treatment",
      "women health specialist",
    ],
    commonTreatments: ["Pregnancy Care & ANC Checkup", "PCOS & PCOD Management", "Menstrual Health Consultation", "Infertility Evaluation"],
    heroBadge: "🌸 Women's Health Specialist",
    heroImage: "/general-hero-bg.jpg",
    faqPrompt: "What women health consultations are provided?",
  },
  orthopedic: {
    key: "orthopedic",
    displayName: "Orthopedic & Bone Specialist",
    hindiName: "हड्डी एवं जोड़ विशेषज्ञ",
    medicalSpecialtyCode: "Orthopedic",
    keywords: [
      "orthopedic doctor near me",
      "bone specialist",
      "fracture treatment",
      "arthritis doctor",
      "joint replacement consultation",
    ],
    commonTreatments: ["Fracture & Trauma Care", "Arthritis & Knee Joint Care", "Ligament & Muscle Tear Relief", "Spine Care"],
    heroBadge: "🦴 Bone & Joint Specialist",
    heroImage: "/physio-hero-bg.jpg",
    faqPrompt: "What bone and joint treatments are available?",
  },
  general_physician: {
    key: "general_physician",
    displayName: "General Physician & Internal Medicine",
    hindiName: "सामान्य रोग विशेषज्ञ",
    medicalSpecialtyCode: "PrimaryCare",
    keywords: [
      "general physician near me",
      "doctor consultation",
      "fever doctor",
      "diabetes BP doctor",
      "health checkup clinic",
    ],
    commonTreatments: ["Fever, Cold & Cough Care", "Diabetes & BP Management", "Full Body Health Checkup", "Thyroid & Metabolic Care"],
    heroBadge: "🩺 General OPD & Internal Medicine",
    heroImage: "/general-hero-bg.jpg",
    faqPrompt: "What general health checkups are offered?",
  },
};

export const SPECIALTY_LIST = [
  "General Physician",
  "Dentist",
  "Dermatologist",
  "Pediatrician",
  "Gynecologist",
  "Orthopedic",
  "Physiotherapist",
  "Cardiologist",
  "Neurologist",
  "Psychiatrist",
  "Psychologist",
  "ENT Specialist",
  "Ophthalmologist",
  "Gastroenterologist",
  "Urologist",
  "Nephrologist",
  "Endocrinologist",
  "Pulmonologist",
  "Oncologist",
  "Rheumatologist",
  "Dietitian & Nutritionist",
  "Ayurvedic Doctor",
  "Homeopath",
  "Veterinarian",
  "Plastic Surgeon",
  "General Surgeon",
  "Neurosurgeon",
  "Cardiac Surgeon",
  "Pediatric Surgeon",
  "Vascular Surgeon",
  "Chiropractor",
  "Acupuncturist",
  "Speech Therapist",
  "Occupational Therapist",
  "Sexologist",
  "Fertility Specialist (IVF)",
  "Allergist",
  "Infectious Disease Specialist",
  "Hematologist",
  "Radiologist",
  "Anesthesiologist",
  "Pathologist",
  "Sports Medicine",
  "Pain Management Specialist",
  "Podiatrist",
  "Geriatrician",
  "Hepatologist",
  "Proctologist",
];

/**
 * Returns specialty configuration or sensible fallback for any of 40+ medical fields
 */
export function getSpecialtyConfig(specialtyName?: string | null): SpecialtySEOConfig {
  if (!specialtyName) {
    return SPECIALTY_TAXONOMY.general_physician;
  }

  const normalized = specialtyName.toLowerCase().trim();

  if (normalized.includes("dent") || normalized.includes("teeth")) return SPECIALTY_TAXONOMY.dentist;
  if (normalized.includes("derm") || normalized.includes("skin") || normalized.includes("hair")) return SPECIALTY_TAXONOMY.dermatologist;
  if (normalized.includes("physio") || normalized.includes("pain") || normalized.includes("rehab")) return SPECIALTY_TAXONOMY.physiotherapist;
  if (normalized.includes("pedia") || normalized.includes("child") || normalized.includes("baby")) return SPECIALTY_TAXONOMY.pediatrician;
  if (normalized.includes("gyn") || normalized.includes("women") || normalized.includes("preg")) return SPECIALTY_TAXONOMY.gynecologist;
  if (normalized.includes("ortho") || normalized.includes("bone") || normalized.includes("joint")) return SPECIALTY_TAXONOMY.orthopedic;

  // Generic dynamic fallback for remaining 35+ specialties (ENT, Eye, Heart, Neuro, Gastro, Ayurvedic, Homeopathy, etc.)
  return {
    key: "specialist",
    displayName: `${specialtyName} Specialist`,
    hindiName: `${specialtyName} विशेषज्ञ`,
    medicalSpecialtyCode: "MedicalSpecialty",
    keywords: [
      `${specialtyName.toLowerCase()} near me`,
      `best ${specialtyName.toLowerCase()} clinic`,
      `book ${specialtyName.toLowerCase()} appointment`,
      `opd consultation ${specialtyName.toLowerCase()}`,
    ],
    commonTreatments: [`${specialtyName} OPD Consultation`, `Specialized ${specialtyName} Evaluation`, `Preventive Health Care`],
    heroBadge: `🩺 ${specialtyName} Specialist`,
    heroImage: "/general-hero-bg.jpg",
    faqPrompt: `What services are provided under ${specialtyName}?`,
  };
}
