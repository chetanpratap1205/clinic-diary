/**
 * 40+ Medical Specialty Taxonomy & Deep SEO/GEO Engine
 * Provides rich specialty-specific keywords, Hindi translations, Schema.org MedicalSpecialty codes,
 * tailored hero visual illustrations, high-converting patient intent keywords, and a Dynamic Lexicon.
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
  // Dynamic Lexicon Engine for B2C & B2B vocabulary adapting
  uiLexicon: {
    doctorTitle: string;       // e.g., "Doctor", "Veterinarian", "Therapist", "Specialist", "Skin Specialist"
    patientTitle: string;      // e.g., "Patient", "Client", "Pet"
    consultationTerm: string;  // e.g., "Consultation", "Session", "Visit"
    clinicType: string;        // e.g., "Clinic", "Polyclinic", "Rehab Center", "Hospital"
  };
}

const DEFAULT_LEXICON = {
  doctorTitle: "Doctor",
  patientTitle: "Patient",
  consultationTerm: "Consultation",
  clinicType: "Clinic",
};

export const SPECIALTY_TAXONOMY: Record<string, SpecialtySEOConfig> = {
  // 1. DENTAL
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
    uiLexicon: {
      ...DEFAULT_LEXICON,
      doctorTitle: "Dentist",
    }
  },
  
  // 2. AESTHETIC, DERMA & COSMETIC
  dermatologist: {
    key: "dermatologist",
    displayName: "Dermatologist & Cosmetologist",
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
    heroBadge: "✨ Skin, Hair & Aesthetics",
    heroImage: "/derma-hero-bg.jpg",
    faqPrompt: "What skin and hair treatments are offered?",
    uiLexicon: {
      ...DEFAULT_LEXICON,
      doctorTitle: "Skin Specialist",
      patientTitle: "Client",
      consultationTerm: "Consultation / Treatment",
    }
  },

  // 3. PHYSIOTHERAPISTS & REHAB
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
    uiLexicon: {
      doctorTitle: "Therapist",
      patientTitle: "Client",
      consultationTerm: "Session",
      clinicType: "Rehab Center",
    }
  },

  // 4. VETERINARY & PET CLINICS
  veterinary: {
    key: "veterinary",
    displayName: "Veterinarian & Pet Clinic",
    hindiName: "पशु चिकित्सक",
    medicalSpecialtyCode: "Veterinary",
    keywords: [
      "vet clinic near me",
      "pet doctor",
      "dog vaccination",
      "animal hospital",
      "pet grooming and care",
    ],
    commonTreatments: ["Pet Vaccination", "General Pet Checkup", "Tick & Flea Treatment", "Pet Deworming", "Surgery & Diagnostics"],
    heroBadge: "🐾 Pet Healthcare Specialist",
    heroImage: "/general-hero-bg.jpg",
    faqPrompt: "What pet care services do you provide?",
    uiLexicon: {
      doctorTitle: "Veterinarian",
      patientTitle: "Pet",
      consultationTerm: "Visit",
      clinicType: "Pet Clinic",
    }
  },

  // 5. AYUSH (Ayurveda, Homeopathy, etc. - no "Vaidya")
  ayush: {
    key: "ayush",
    displayName: "Ayurveda & Homeopathy Specialist",
    hindiName: "आयुर्वेद एवं होम्योपैथी डॉक्टर",
    medicalSpecialtyCode: "AlternativeMedicine",
    keywords: [
      "ayurvedic clinic near me",
      "homeopathic doctor",
      "natural treatment",
      "naturopathy center",
      "chronic disease specialist",
    ],
    commonTreatments: ["Prakriti Assessment", "Chronic Disease Management", "Panchakarma", "Immunity Boosting", "Diet & Lifestyle Consultation"],
    heroBadge: "🌿 Natural Healing Specialist",
    heroImage: "/general-hero-bg.jpg",
    faqPrompt: "What natural treatments are available?",
    uiLexicon: {
      ...DEFAULT_LEXICON,
      doctorTitle: "Doctor", // Explicitly NOT Vaidya per user request
      consultationTerm: "Consultation / Assessment",
    }
  },

  // 6. POLYCLINICS & MULTI-DOCTOR HUBS
  polyclinic: {
    key: "polyclinic",
    displayName: "Polyclinic & Multi-Specialty",
    hindiName: "मल्टी-स्पेशलिटी क्लिनिक",
    medicalSpecialtyCode: "MedicalClinic",
    keywords: [
      "polyclinic near me",
      "multi specialty clinic",
      "best doctors near me",
      "medical center",
    ],
    commonTreatments: ["General OPD", "Specialist Consultation", "Diagnostics & Lab Tests", "Health Checkup Packages"],
    heroBadge: "🏥 Multi-Specialty Healthcare Center",
    heroImage: "/general-hero-bg.jpg",
    faqPrompt: "Which specialists are available today?",
    uiLexicon: {
      ...DEFAULT_LEXICON,
      doctorTitle: "Specialist",
      clinicType: "Polyclinic",
    }
  },

  // STANDARD ALLOPATHIC OPD DOCTORS
  pediatrician: {
    key: "pediatrician",
    displayName: "Pediatrician & Child Specialist",
    hindiName: "बच्चों के डॉक्टर",
    medicalSpecialtyCode: "Pediatric",
    keywords: ["pediatrician near me", "child doctor", "baby vaccination clinic", "childhood fever treatment"],
    commonTreatments: ["Newborn Care", "Vaccination", "Fever & Infection Care", "Pediatric Nutrition"],
    heroBadge: "👶 Child Health & Vaccination Specialist",
    heroImage: "/pediatric-hero-bg.jpg",
    faqPrompt: "Is child vaccination available at clinic?",
    uiLexicon: DEFAULT_LEXICON
  },
  gynecologist: {
    key: "gynecologist",
    displayName: "Gynecologist & Obstetrician",
    hindiName: "महिला एवं प्रसूति रोग विशेषज्ञ",
    medicalSpecialtyCode: "Gynecologic",
    keywords: ["gynecologist near me", "female doctor clinic", "pregnancy checkup", "PCOS PCOD treatment"],
    commonTreatments: ["Pregnancy Care", "PCOS & PCOD Management", "Menstrual Health Consultation", "Infertility Evaluation"],
    heroBadge: "🌸 Women's Health Specialist",
    heroImage: "/general-hero-bg.jpg",
    faqPrompt: "What women health consultations are provided?",
    uiLexicon: DEFAULT_LEXICON
  },
  orthopedic: {
    key: "orthopedic",
    displayName: "Orthopedic & Bone Specialist",
    hindiName: "हड्डी एवं जोड़ विशेषज्ञ",
    medicalSpecialtyCode: "Orthopedic",
    keywords: ["orthopedic doctor near me", "bone specialist", "fracture treatment", "arthritis doctor"],
    commonTreatments: ["Fracture & Trauma Care", "Arthritis Care", "Ligament Relief", "Spine Care"],
    heroBadge: "🦴 Bone & Joint Specialist",
    heroImage: "/physio-hero-bg.jpg",
    faqPrompt: "What bone and joint treatments are available?",
    uiLexicon: DEFAULT_LEXICON
  },
  general_physician: {
    key: "general_physician",
    displayName: "General Physician & Internal Medicine",
    hindiName: "सामान्य रोग विशेषज्ञ",
    medicalSpecialtyCode: "PrimaryCare",
    keywords: ["general physician near me", "doctor consultation", "fever doctor", "health checkup clinic"],
    commonTreatments: ["Fever, Cold & Cough Care", "Diabetes & BP Management", "Full Body Health Checkup"],
    heroBadge: "🩺 General OPD & Internal Medicine",
    heroImage: "/general-hero-bg.jpg",
    faqPrompt: "What general health checkups are offered?",
    uiLexicon: DEFAULT_LEXICON
  },
};

export const SPECIALTY_LIST = [
  "Polyclinic / Multi-Specialty",
  "General Physician",
  "Dentist",
  "Dermatologist & Cosmetologist",
  "Pediatrician",
  "Gynecologist",
  "Orthopedic",
  "Physiotherapist",
  "Veterinarian",
  "Ayurvedic Doctor",
  "Homeopath",
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
  "Dietitian & Nutritionist",
  "Plastic Surgeon",
  "General Surgeon",
  "Neurosurgeon",
  "Chiropractor",
  "Acupuncturist",
  "Speech Therapist",
  "Occupational Therapist",
  "Sexologist",
  "Fertility Specialist (IVF)",
];

/**
 * Returns specialty configuration or sensible fallback for any of 40+ medical fields
 */
export function getSpecialtyConfig(specialtyName?: string | null): SpecialtySEOConfig {
  if (!specialtyName) {
    return SPECIALTY_TAXONOMY.general_physician;
  }

  const normalized = specialtyName.toLowerCase().trim();

  // Route specific variations to our 6 domain engines
  if (normalized.includes("dent") || normalized.includes("teeth")) return SPECIALTY_TAXONOMY.dentist;
  if (normalized.includes("derm") || normalized.includes("skin") || normalized.includes("hair") || normalized.includes("aesth") || normalized.includes("cosmet")) return SPECIALTY_TAXONOMY.dermatologist;
  if (normalized.includes("physio") || normalized.includes("pain") || normalized.includes("rehab") || normalized.includes("chiro")) return SPECIALTY_TAXONOMY.physiotherapist;
  if (normalized.includes("vet") || normalized.includes("animal") || normalized.includes("pet")) return SPECIALTY_TAXONOMY.veterinary;
  if (normalized.includes("ayur") || normalized.includes("homeo") || normalized.includes("natu") || normalized.includes("unani") || normalized.includes("ayush")) return SPECIALTY_TAXONOMY.ayush;
  if (normalized.includes("poly") || normalized.includes("multi") || normalized.includes("center") || normalized.includes("hospital")) return SPECIALTY_TAXONOMY.polyclinic;
  
  // Standard OPD
  if (normalized.includes("pedia") || normalized.includes("child") || normalized.includes("baby")) return SPECIALTY_TAXONOMY.pediatrician;
  if (normalized.includes("gyn") || normalized.includes("women") || normalized.includes("preg")) return SPECIALTY_TAXONOMY.gynecologist;
  if (normalized.includes("ortho") || normalized.includes("bone") || normalized.includes("joint")) return SPECIALTY_TAXONOMY.orthopedic;

  // Generic dynamic fallback for remaining specialties
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
    uiLexicon: {
      ...DEFAULT_LEXICON,
      doctorTitle: "Specialist",
    }
  };
}
