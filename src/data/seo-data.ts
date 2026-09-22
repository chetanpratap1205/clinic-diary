/**
 * Programmatic SEO Master Data
 * Generates /for/[specialty]/[city] — 42 × 30 = 1,260 landing pages
 *
 * Each specialty has:
 *   - slug: URL-safe identifier
 *   - label: Full display name (e.g. "Dermatology & Cosmetology")
 *   - shortLabel: Role title (e.g. "Dermatologist")
 *   - painPoints: 3 specific clinical/operational problems doctors face
 *   - solutions: 3 corresponding Doctor Diary outcomes
 *   - faqQuestions: 5 question templates — {city} is replaced at render time
 */

export interface Specialty {
  slug: string;
  label: string;
  shortLabel: string;
  painPoints: [string, string, string];
  solutions: [string, string, string];
  faqQuestions: [string, string, string, string, string];
}

export interface City {
  slug: string;
  label: string;
  state: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 42 Medical Specialties — sourced from the live ExperienceEngine component
// ─────────────────────────────────────────────────────────────────────────────
export const SPECIALTIES: Specialty[] = [
  {
    slug: "general-physician",
    label: "General Physician & Internal Medicine",
    shortLabel: "General Physician",
    painPoints: [
      "Managing 60–80 walk-in patients daily with a paper register and zero queue transparency",
      "Phones ringing all day with patients asking 'Doctor kab aayenge?' — interrupting every consultation",
      "No-show patients leaving idle gaps during peak hours, losing ₹500–₹1,500 per wasted slot",
    ],
    solutions: [
      "Live digital queue patients track on WhatsApp — front-desk phone calls drop by 80%",
      "Automated 24h + 2h WhatsApp reminders cut no-shows by up to 40% every month",
      "Full patient history, prescriptions, and follow-ups in one click — zero paperwork",
    ],
    faqQuestions: [
      "Is Doctor Diary suitable for a high-volume General Physician clinic in {city}?",
      "How do patients in {city} book appointments with a General Physician on Doctor Diary?",
      "Can I manage walk-in patients alongside pre-booked slots at my {city} clinic?",
      "Does Doctor Diary work on slow 4G mobile internet in {city}?",
      "How long does it take to set up a General Physician clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "cardiology",
    label: "Cardiology & Interventional Care",
    shortLabel: "Cardiologist",
    painPoints: [
      "Long cardiology consultations mean even a single 15-min no-show derails the entire day's schedule",
      "Post-procedure follow-ups are missed by patients, leading to poor outcomes and silent revenue leakage",
      "Crowded waiting rooms with anxious cardiac patients and zero queue updates create unnecessary clinical stress",
    ],
    solutions: [
      "Custom slot durations (20–30 min) with buffer time — no rushed consultations ever again",
      "Automated post-procedure WhatsApp follow-up sequences ensure every patient returns on schedule",
      "Live queue updates sent to patients' phones — cardiac patients wait comfortably, not in a crowded lobby",
    ],
    faqQuestions: [
      "Can Cardiologists in {city} configure 20–30 minute appointment slots on Doctor Diary?",
      "How does Doctor Diary reduce no-shows for Cardiology consultations in {city}?",
      "Is patient data stored securely for a Cardiology practice in {city}?",
      "Can I manage multiple Cardiology clinic locations in {city} from one dashboard?",
      "Does Doctor Diary integrate WhatsApp messaging for Cardiology patients in {city}?",
    ],
  },
  {
    slug: "dermatology",
    label: "Dermatology & Cosmetology",
    shortLabel: "Dermatologist",
    painPoints: [
      "High-value aesthetic procedure slots (₹3,000–₹20,000) vanish to last-minute no-shows with zero recovery",
      "No structured system to follow up with patients after peels, laser sessions, or hair treatments",
      "Patients searching 'best dermatologist in {city}' land on Practo — cutting you out and charging commission",
    ],
    solutions: [
      "Automated pre-procedure reminders slash no-show rates on high-value aesthetic slots dramatically",
      "Post-treatment WhatsApp follow-up sequences re-activate patients for repeat sessions — raising lifetime value",
      "Your own clinic URL (doctordiary.in/dr-name) ranks on Google independently — 0% Practo commission ever",
    ],
    faqQuestions: [
      "Can Dermatology clinics in {city} manage aesthetic procedure bookings on Doctor Diary?",
      "How do I get my Dermatology clinic in {city} found on Google without paying Practo?",
      "Does Doctor Diary support post-treatment follow-up scheduling for skin clinics in {city}?",
      "What commission does Doctor Diary charge Dermatologists in {city}?",
      "How quickly can a Dermatology clinic in {city} go live on Doctor Diary?",
    ],
  },
  {
    slug: "pediatrics",
    label: "Pediatrics & Neonatology",
    shortLabel: "Pediatrician",
    painPoints: [
      "Parents call the clinic 5–10 times to check queue status — overwhelming reception staff every single day",
      "Vaccination schedules and growth-monitoring follow-ups are missed without active automated reminders",
      "Paper OPD registers make it impossible to pull a child's records quickly during a visit or emergency",
    ],
    solutions: [
      "Parents track their child's queue position live on WhatsApp — reception calls drop by 75% instantly",
      "Automated vaccination reminder sequences ensure children return for every scheduled immunisation dose",
      "Complete digital patient history accessible in under 3 seconds — every visit, every prescription, all records",
    ],
    faqQuestions: [
      "Is Doctor Diary suitable for a Pediatrics clinic in {city}?",
      "How does Doctor Diary help Pediatricians in {city} manage vaccination reminder schedules?",
      "Can parents in {city} track their child's live queue position through Doctor Diary?",
      "Does Doctor Diary support digital prescriptions for Pediatric patients in {city}?",
      "Is it free to set up a Pediatrics clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "orthopedics",
    label: "Orthopedics & Joint Replacement",
    shortLabel: "Orthopedic Surgeon",
    painPoints: [
      "Post-surgery follow-up compliance is poor — patients skip physiotherapy sessions and critical revisits",
      "High-footfall OPD with walk-ins and scheduled patients colliding creates chaos in the waiting room",
      "Investigation reports are lost before follow-up visits, forcing costly repeat consultations",
    ],
    solutions: [
      "Automated post-surgery follow-up sequences ensure every patient returns for each critical revisit",
      "Separate walk-in and scheduled queues managed side-by-side from one clean dashboard",
      "Digital prescriptions and referral notes delivered to patients instantly via WhatsApp — zero paper lost",
    ],
    faqQuestions: [
      "Can Orthopedic Surgeons in {city} manage OPD and post-surgery follow-ups on Doctor Diary?",
      "How does Doctor Diary handle high patient volumes at Orthopedic clinics in {city}?",
      "Does Doctor Diary support digital prescriptions for Orthopedic patients in {city}?",
      "Can I manage multiple Orthopedic clinic staff members in {city} on one account?",
      "How does Doctor Diary compare to Practo for Orthopedic clinics in {city}?",
    ],
  },
  {
    slug: "obstetrics-gynecology",
    label: "Obstetrics & Gynecology",
    shortLabel: "Gynecologist",
    painPoints: [
      "Pregnant patients require sequential, priority scheduling — any queue disruption causes immediate complaints",
      "Prenatal and postnatal follow-up appointments are routinely missed without automated reminder systems",
      "Sensitive patient data demands maximum privacy — paper registers in open receptions are a liability",
    ],
    solutions: [
      "Priority queue management schedules prenatal and urgent patients separately from routine OPD",
      "Trimester-based automated WhatsApp reminders keep pregnancy follow-up attendance near 100%",
      "End-to-end encrypted patient records — accessible only by the treating doctor, always",
    ],
    faqQuestions: [
      "Is Doctor Diary suitable for Gynecology and Obstetrics clinics in {city}?",
      "How does Doctor Diary protect patient privacy for Gynecology practices in {city}?",
      "Can Gynecologists in {city} configure automated prenatal follow-up reminder sequences?",
      "Does Doctor Diary support maternity and postnatal appointment scheduling in {city}?",
      "What are the pricing plans for a Gynecology clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "ent",
    label: "ENT & Head-Neck Care",
    shortLabel: "ENT Specialist",
    painPoints: [
      "ENT OPDs see 50–100 patients daily — paper registers and manual calling create hard bottlenecks",
      "Procedure-based appointments (ear cleaning, nasal endoscopy) need strict time-slots paper cannot manage",
      "Post-procedure care instructions are verbal — patients forget, leading to complications and emergency revisits",
    ],
    solutions: [
      "High-volume ENT OPD queue managed digitally — patients get live phone updates, not crowded lobby waits",
      "Procedure-specific appointment slots configurable by room, equipment type, and consultation duration",
      "Digital post-procedure care instructions delivered via WhatsApp immediately after every visit",
    ],
    faqQuestions: [
      "Can ENT clinics in {city} manage high-volume OPD alongside procedure bookings on Doctor Diary?",
      "Does Doctor Diary support procedure-based slot scheduling for ENT specialists in {city}?",
      "How does Doctor Diary help ENT clinics in {city} send post-procedure care instructions?",
      "Is Doctor Diary free to start for ENT specialists in {city}?",
      "Can ENT clinics in {city} run their practice independently without Practo?",
    ],
  },
  {
    slug: "ophthalmology",
    label: "Ophthalmology & Eye Surgery",
    shortLabel: "Ophthalmologist",
    painPoints: [
      "Elderly patients struggle with smartphone booking apps — walk-ins dominate and destroy the schedule",
      "Pre-op and post-op follow-ups for cataract and LASIK patients are missed without proactive reminders",
      "Staff spend hours manually calling patients for appointment confirmations and refraction recalls",
    ],
    solutions: [
      "Simple WhatsApp-based booking — elderly patients book with just a phone number, no app installation needed",
      "Automated pre-op prep and post-op follow-up sequences run on autopilot for every surgical patient",
      "Refractive prescriptions sent digitally to patients immediately after refraction — zero paper, zero calls",
    ],
    faqQuestions: [
      "Is Doctor Diary easy for elderly patients at Ophthalmology clinics in {city} to use?",
      "Can Ophthalmologists in {city} automate pre-surgery and post-surgery follow-up reminders?",
      "Does Doctor Diary support digital prescriptions for eye clinics in {city}?",
      "How does Doctor Diary manage walk-in patients for Ophthalmology OPDs in {city}?",
      "What does Doctor Diary cost for an Ophthalmology clinic in {city}?",
    ],
  },
  {
    slug: "dental",
    label: "Dental Surgery & Orthodontics",
    shortLabel: "Dentist",
    painPoints: [
      "Dental procedures have strict time slots — a 15-min late patient disrupts 3 subsequent bookings",
      "Orthodontic and implant patients on multi-month plans frequently miss adjustment appointments",
      "No-show rates at dental clinics average 25–30%, leaving expensive chair time idle every day",
    ],
    solutions: [
      "Automated 24h + 2h reminders bring dental no-show rates down to near-zero consistently",
      "Long-term treatment tracking with automatic adjustment reminders keeps ortho patients on schedule",
      "Your own branded booking page — patients book directly, not through third-party aggregators",
    ],
    faqQuestions: [
      "Can Dental clinics in {city} significantly reduce no-shows using Doctor Diary?",
      "Does Doctor Diary support multi-session orthodontic treatment tracking in {city}?",
      "How does appointment booking work for Dental clinics in {city} on Doctor Diary?",
      "Can Dentists in {city} manage implant and cosmetic dental procedure slots separately?",
      "Is Doctor Diary free for Dental clinics in {city} to get started?",
    ],
  },
  {
    slug: "neurology",
    label: "Neurology & Neuro-surgery",
    shortLabel: "Neurologist",
    painPoints: [
      "Neurological conditions demand long consultations — standard 10-min slots leave patients feeling dismissed",
      "Chronic patients (epilepsy, Parkinson's, MS) miss medication review appointments at alarming rates",
      "Complex multi-drug prescriptions conveyed verbally lead to dangerous patient medication errors",
    ],
    solutions: [
      "Custom slot durations (20–45 min) prevent rushed consultations and dramatically improve patient satisfaction",
      "Automated chronic-condition follow-up reminders ensure medication reviews are never missed again",
      "Digital prescriptions with drug names, dosages, and instructions sent directly to patient WhatsApp",
    ],
    faqQuestions: [
      "Can Neurologists in {city} configure long consultation slots (30–45 minutes) on Doctor Diary?",
      "Does Doctor Diary support chronic disease follow-up management for Neurology clinics in {city}?",
      "How does Doctor Diary handle digital prescriptions for Neurology patients in {city}?",
      "Is patient data secure for a Neurology practice in {city} using Doctor Diary?",
      "What is the setup process for a Neurology clinic in {city} on Doctor Diary?",
    ],
  },
  {
    slug: "gastroenterology",
    label: "Gastroenterology & Hepatology",
    shortLabel: "Gastroenterologist",
    painPoints: [
      "Endoscopy patients arrive unprepared due to inadequate pre-procedure communication — procedures get cancelled",
      "Chronic liver and IBD patients require quarterly follow-ups that are routinely missed without active outreach",
      "High diagnostic referral volumes create paperwork chaos — reports get lost before the follow-up visit",
    ],
    solutions: [
      "Pre-procedure preparation instructions auto-delivered via WhatsApp before every endoscopy appointment",
      "Quarterly follow-up reminders for chronic Gastroenterology patients run completely on autopilot",
      "Digital prescription history and referral notes accessible at the next appointment in seconds",
    ],
    faqQuestions: [
      "Can Gastroenterology clinics in {city} send endoscopy prep instructions automatically?",
      "Does Doctor Diary support chronic disease follow-up for Gastroenterology patients in {city}?",
      "How does Doctor Diary manage procedure booking for Gastroenterology clinics in {city}?",
      "What security protects patient data at Gastroenterology clinics in {city} on Doctor Diary?",
      "How long does setting up a Gastroenterology clinic on Doctor Diary in {city} take?",
    ],
  },
  {
    slug: "pulmonology",
    label: "Pulmonology & Chest Medicine",
    shortLabel: "Pulmonologist",
    painPoints: [
      "COPD and asthma patients need seasonal follow-ups — without active outreach, they disappear between visits",
      "Spirometry and PFT appointments need pre-test prep instructions that verbal-only communication fails to deliver",
      "High-risk respiratory patients miss critical medication review visits, silently worsening their condition",
    ],
    solutions: [
      "Seasonal automated reminders for COPD and asthma patients ensure consistent follow-up rates year-round",
      "Pre-spirometry preparation instructions auto-sent via WhatsApp before the test appointment",
      "High-risk patient flagging and priority scheduling ensures critical respiratory cases are never delayed",
    ],
    faqQuestions: [
      "Can Pulmonology clinics in {city} send automated seasonal reminders to COPD patients?",
      "Does Doctor Diary support PFT and spirometry appointment management in {city}?",
      "How does Doctor Diary help Pulmonologists in {city} manage high-risk patient follow-ups?",
      "Is patient respiratory data secure on Doctor Diary for clinics in {city}?",
      "What subscription plans does Doctor Diary offer for Pulmonology clinics in {city}?",
    ],
  },
  {
    slug: "psychiatry",
    label: "Psychiatry & Behavioral Health",
    shortLabel: "Psychiatrist",
    painPoints: [
      "Psychiatry patients require extreme privacy — aggregator platforms expose their identity by association",
      "Irregular medication compliance leads to missed follow-ups with serious clinical consequences",
      "50-minute sessions mean a single no-show creates a ₹2,000–₹5,000 revenue loss with no recovery",
    ],
    solutions: [
      "Completely private booking under your own branded clinic URL — zero aggregator exposure for patients",
      "Discrete WhatsApp reminders (no third-party branding) maintain medication follow-up compliance",
      "Cancellation window tracking and no-show visibility protects high-value session revenue",
    ],
    faqQuestions: [
      "Does Doctor Diary ensure full patient privacy for Psychiatry practices in {city}?",
      "Can Psychiatrists in {city} manage 50-minute therapy session bookings on Doctor Diary?",
      "How does Doctor Diary handle medication follow-up reminders for Psychiatry patients in {city}?",
      "Is Doctor Diary discreet enough for a private Psychiatry practice in {city}?",
      "What does Doctor Diary cost for a Psychiatry clinic in {city}?",
    ],
  },
  {
    slug: "endocrinology",
    label: "Endocrinology & Diabetology",
    shortLabel: "Endocrinologist",
    painPoints: [
      "Diabetic patients need HbA1c reviews every 3 months — missed appointments worsen glycemic control silently",
      "Thyroid and hormonal disorder patients forget to bring periodic lab reports, wasting consultation time",
      "Insulin-dependent patients need urgent slot access but queues are always full during peak hours",
    ],
    solutions: [
      "Quarterly HbA1c and diabetes review reminders ensure patients never miss a critical metabolic checkup",
      "Pre-appointment lab report reminders ensure patients arrive prepared, saving 5–10 mins per consultation",
      "Priority queue slots for urgent diabetic care alongside standard OPD scheduling",
    ],
    faqQuestions: [
      "Can Endocrinology clinics in {city} automate quarterly diabetic review appointment reminders?",
      "Does Doctor Diary support lab report coordination for Endocrinology patients in {city}?",
      "How does Doctor Diary help Diabetology clinics in {city} manage high-volume OPD?",
      "Is patient data secure at Endocrinology clinics in {city} using Doctor Diary?",
      "How do I set up an Endocrinology clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "nephrology",
    label: "Nephrology & Renal Care",
    shortLabel: "Nephrologist",
    painPoints: [
      "Dialysis-dependent patients have life-critical schedules — any queue disruption has direct health consequences",
      "CKD patients miss quarterly eGFR review appointments, accelerating disease progression undetected",
      "Transplant follow-up compliance is critical — paper systems routinely fail to ensure consistent attendance",
    ],
    solutions: [
      "Time-critical dialysis slot management with patient-facing queue status prevents scheduling chaos entirely",
      "Automated CKD quarterly review reminders keep every patient on their monitoring schedule",
      "Post-transplant follow-up sequences ensure medication and monitoring visits are never missed",
    ],
    faqQuestions: [
      "Can Nephrology clinics in {city} manage time-critical dialysis appointment schedules on Doctor Diary?",
      "Does Doctor Diary support CKD quarterly review reminders for patients in {city}?",
      "How does Doctor Diary ensure post-transplant follow-up compliance in {city}?",
      "Is patient data secure for a Nephrology practice in {city} using Doctor Diary?",
      "What is the pricing for Doctor Diary at a Nephrology clinic in {city}?",
    ],
  },
  {
    slug: "urology",
    label: "Urology & Andrology",
    shortLabel: "Urologist",
    painPoints: [
      "Urology patients feel embarrassed queuing in public waiting rooms — privacy is non-negotiable",
      "Post-operative catheter and stent care requires precise timing that verbal instructions completely miss",
      "High-value surgical consultations are preceded by patient no-shows without sufficient reminder systems",
    ],
    solutions: [
      "Private, discreet booking via your personal clinic URL — patients book directly, not through aggregators",
      "Automated post-operative care sequences deliver instructions and book follow-ups via WhatsApp automatically",
      "Multi-touch reminder system (24h + 2h) minimises no-shows before every surgical consultation",
    ],
    faqQuestions: [
      "Does Doctor Diary ensure patient privacy for Urology clinics in {city}?",
      "Can Urologists in {city} send automated post-operative care instructions via WhatsApp?",
      "How does Doctor Diary reduce no-shows for Urology consultations in {city}?",
      "What features does Doctor Diary offer for Andrology practices in {city}?",
      "Is it free to set up a Urology clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "oncology",
    label: "Oncology & Surgical Oncology",
    shortLabel: "Oncologist",
    painPoints: [
      "Chemotherapy scheduling requires multi-department coordination — paper systems break under this complexity",
      "Cancer patients and families are emotionally overwhelmed — crowded public lobbies add unnecessary distress",
      "Complex medication protocols conveyed verbally lead to critical dosage and timing errors at home",
    ],
    solutions: [
      "Multi-session protocol scheduling with automated sequencing for chemotherapy and radiation appointments",
      "Private queue tracking allows cancer patients to wait in comfort without public waiting room exposure",
      "Digital prescription and protocol summaries sent to patient and caregiver WhatsApp after every visit",
    ],
    faqQuestions: [
      "Can Oncology clinics in {city} schedule multi-session chemotherapy appointments on Doctor Diary?",
      "Does Doctor Diary support privacy for cancer patients visiting Oncology clinics in {city}?",
      "How does Doctor Diary handle complex medication protocols for Oncology practices in {city}?",
      "Is Doctor Diary secure for sensitive cancer patient records in {city}?",
      "How long does onboarding an Oncology clinic in {city} to Doctor Diary take?",
    ],
  },
  {
    slug: "rheumatology",
    label: "Rheumatology & Immunology",
    shortLabel: "Rheumatologist",
    painPoints: [
      "Rheumatoid arthritis and lupus patients need bimonthly reviews — high drop-off rates exist between visits",
      "Biologic infusion appointments need strict pre-screening that verbal coordination routinely fails to deliver",
      "Chronic pain patients cannot comfortably stand in crowded waiting rooms for extended periods",
    ],
    solutions: [
      "Bimonthly disease activity review reminders keep every chronic rheumatology patient on their protocol",
      "Pre-infusion screening checklist auto-delivered via WhatsApp ensures patients arrive prepared for biologics",
      "Live queue updates allow chronic pain patients to wait comfortably at home or in their car",
    ],
    faqQuestions: [
      "Can Rheumatology clinics in {city} automate bimonthly follow-up reminders for chronic patients?",
      "Does Doctor Diary support biologic infusion appointment scheduling for Rheumatology practices in {city}?",
      "How does Doctor Diary help Rheumatology patients in {city} avoid crowded waiting rooms?",
      "Is immunology patient data secure on Doctor Diary for clinics in {city}?",
      "What pricing plans does Doctor Diary offer for Rheumatology clinics in {city}?",
    ],
  },
  {
    slug: "general-surgery",
    label: "General & Laparoscopic Surgery",
    shortLabel: "General Surgeon",
    painPoints: [
      "Pre-operative fasting and prep instructions are verbal — patients arrive unprepared and surgeries get cancelled",
      "Post-laparoscopic care follow-ups are missed, leading to complications and avoidable emergency revisits",
      "OPD scheduling collides with theatre time — paper systems cannot manage this dual complexity",
    ],
    solutions: [
      "Automated pre-operative checklist and fasting instructions delivered via WhatsApp the day before surgery",
      "Post-operative care sequence with wound check reminders ensures seamless and safe recovery monitoring",
      "Separate OPD and procedure slots managed side-by-side — zero scheduling conflicts ever",
    ],
    faqQuestions: [
      "Can General Surgery clinics in {city} send automated pre-operative preparation instructions?",
      "Does Doctor Diary support post-laparoscopic follow-up scheduling for surgeons in {city}?",
      "How does Doctor Diary separate OPD and theatre slots for Surgeons in {city}?",
      "Is surgical patient data secure on Doctor Diary for practices in {city}?",
      "How do I get started with Doctor Diary for a Surgery practice in {city}?",
    ],
  },
  {
    slug: "ayurveda",
    label: "Ayurveda & Integrative Medicine",
    shortLabel: "Ayurvedic Doctor",
    painPoints: [
      "Panchkarma and intensive treatment courses require multi-session scheduling that paper registers cannot track",
      "Patients frequently discover your practice through Practo, giving that platform permanent control of your patients",
      "Seasonal patient surges (winter wellness, monsoon detox) are unmanageable without scalable booking infrastructure",
    ],
    solutions: [
      "Multi-session Panchkarma course booking with automated daily session reminders keeps patients on-track",
      "Your own clinic booking page with 0% commission — patients book directly with you, not through intermediaries",
      "Scalable booking infrastructure handles seasonal patient surges without additional staff or paper",
    ],
    faqQuestions: [
      "Can Ayurvedic clinics in {city} manage multi-session Panchkarma bookings on Doctor Diary?",
      "Does Doctor Diary charge any commission for Ayurveda bookings in {city}?",
      "How does Doctor Diary help Ayurvedic doctors in {city} attract patients directly without Practo?",
      "Can I manage seasonal wellness programs for my Ayurveda clinic in {city} on Doctor Diary?",
      "Is Doctor Diary suitable for traditional Ayurvedic practices in {city}?",
    ],
  },
  {
    slug: "homeopathy",
    label: "Homeopathy & Holistic Care",
    shortLabel: "Homeopathic Doctor",
    painPoints: [
      "Homeopathy requires long consultations and close patient monitoring — rushed schedules reduce treatment efficacy",
      "Patients on chronic homeopathic protocols frequently discontinue without consistent follow-up reminders",
      "Aggregator platforms prioritise allopathic specialists — Homeopathic practices are systematically de-prioritised",
    ],
    solutions: [
      "Long consultation slot support with chronic protocol follow-up reminders keeps patients consistent",
      "Your own branded clinic URL builds Google visibility for your Homeopathic practice directly",
      "WhatsApp-based booking makes it friction-free for chronic patients to continue long-term treatment",
    ],
    faqQuestions: [
      "Is Doctor Diary suitable for Homeopathic practices in {city}?",
      "Can Homeopathic doctors in {city} manage long consultations and chronic condition follow-ups?",
      "How does Doctor Diary help Homeopathic clinics in {city} get found on Google?",
      "Does Doctor Diary charge any commission for Homeopathy bookings in {city}?",
      "What does it cost to set up a Homeopathy clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "physiotherapy",
    label: "Physiotherapy & Rehabilitation",
    shortLabel: "Physiotherapist",
    painPoints: [
      "Physiotherapy requires 10–20 session packages — tracking attendance manually across weeks is chaotic",
      "Patients frequently drop out mid-treatment, jeopardising recovery outcomes and clinic revenue together",
      "Cancelled slots cannot be filled in real-time — idle physiotherapy time is direct, unrecoverable revenue loss",
    ],
    solutions: [
      "Multi-session package tracking with automated session reminders maximises treatment plan completion rates",
      "Mid-course progress check-in messages and encouragement reduce patient drop-off significantly",
      "Real-time slot availability means cancelled sessions can be immediately offered to waiting patients",
    ],
    faqQuestions: [
      "Can Physiotherapy clinics in {city} manage multi-session treatment packages on Doctor Diary?",
      "Does Doctor Diary send automated session reminders for Physiotherapy patients in {city}?",
      "How does Doctor Diary reduce patient drop-off rates for Rehabilitation clinics in {city}?",
      "Can Physiotherapists in {city} manage their practice independently without Practo?",
      "Is Doctor Diary free to start for a Physiotherapy clinic in {city}?",
    ],
  },
  {
    slug: "dietetics",
    label: "Dietetics & Clinical Nutrition",
    shortLabel: "Dietitian",
    painPoints: [
      "Nutrition outcomes depend on weekly follow-ups — patients skip them without active, consistent reminders",
      "Meal plans and diet charts handed on paper are lost before the next appointment — progress stalls",
      "Dietitian practices have low Google visibility — patients default to YouTube instead of booking a consultation",
    ],
    solutions: [
      "Weekly follow-up reminders with progress check-ins keep nutrition patients engaged and accountable",
      "Digital diet plan delivery via WhatsApp — patients always have their current plan readily accessible",
      "Your branded clinic page improves Google presence for nutrition and clinical dietetics consultations",
    ],
    faqQuestions: [
      "Can Dietitian clinics in {city} automate weekly follow-up reminders for nutrition patients?",
      "Does Doctor Diary support digital diet plan delivery for Dietitians in {city}?",
      "How does Doctor Diary help Dietitians in {city} improve their Google visibility?",
      "Is Doctor Diary suitable for a solo Dietitian practice in {city}?",
      "What is the cost of Doctor Diary for a Dietetics clinic in {city}?",
    ],
  },
  {
    slug: "radiology",
    label: "Radiology & Diagnostics",
    shortLabel: "Radiologist",
    painPoints: [
      "MRI, CT, and Ultrasound slots need strict 15–30 min scheduling — walk-ins disrupt the entire workflow",
      "Patients flood the front desk with calls asking 'Report ready hua kya?' — creating unnecessary chaos",
      "Referring doctors expect timely report delivery — delays damage referral relationships and future business",
    ],
    solutions: [
      "Modality-specific slot management (MRI, CT, USG) with automated patient preparation instructions",
      "Automated WhatsApp notification when reports are ready — zero front-desk calls for report inquiries",
      "Digital reports delivered simultaneously to patient and referring doctor — instant, no delays",
    ],
    faqQuestions: [
      "Can Radiology centers in {city} manage MRI, CT, and USG slot scheduling on Doctor Diary?",
      "Does Doctor Diary automatically notify patients when radiology reports are ready in {city}?",
      "How does Doctor Diary handle referring doctor coordination for Radiology practices in {city}?",
      "Is Doctor Diary suitable for a standalone Diagnostic Center in {city}?",
      "What is the pricing for Doctor Diary at a Radiology center in {city}?",
    ],
  },
  {
    slug: "pathology",
    label: "Pathology & Lab Medicine",
    shortLabel: "Pathologist",
    painPoints: [
      "Unscheduled patient arrivals create peak-hour processing backlogs and sample collection chaos",
      "Patients call repeatedly asking 'Report aaya kya?' — these avoidable calls flood the front desk all day",
      "Home collection requests are managed via WhatsApp chats — no structured scheduling or confirmation system",
    ],
    solutions: [
      "Scheduled sample collection slots spread patient arrivals evenly, eliminating collection-hour backlogs",
      "Automated report-ready WhatsApp notifications eliminate report inquiry calls entirely",
      "Home collection booking with automated confirmation and phlebotomist assignment — all in one system",
    ],
    faqQuestions: [
      "Can Pathology labs in {city} schedule and manage sample collection appointments on Doctor Diary?",
      "Does Doctor Diary send automated report-ready notifications for Labs in {city}?",
      "How does Doctor Diary manage home sample collection requests for Pathology labs in {city}?",
      "Is Doctor Diary suitable for a standalone Diagnostic Lab in {city}?",
      "What does Doctor Diary cost for a Pathology lab in {city}?",
    ],
  },
  {
    slug: "plastic-surgery",
    label: "Plastic & Aesthetic Surgery",
    shortLabel: "Plastic Surgeon",
    painPoints: [
      "High-value aesthetic consultations (₹5,000–₹50,000 procedures) are lost to no-shows without any recovery",
      "Pre-operative patient education before rhinoplasty or liposuction is too complex for verbal delivery alone",
      "Post-surgical recovery follow-ups are critical for outcomes but poorly managed without structured systems",
    ],
    solutions: [
      "Multi-touch reminders ensure patients commit to high-value aesthetic consultation appointments",
      "Automated pre-operative education content — what to expect, how to prepare — delivered via WhatsApp",
      "Structured post-surgical recovery sequence with wound checks, medication reviews, and result evaluations",
    ],
    faqQuestions: [
      "Can Plastic Surgery clinics in {city} manage high-value consultation bookings on Doctor Diary?",
      "Does Doctor Diary support pre-operative patient education for Aesthetic Surgery clinics in {city}?",
      "How does Doctor Diary handle post-surgical follow-up for Plastic Surgery patients in {city}?",
      "Is patient data private for Aesthetic Surgery practices in {city} using Doctor Diary?",
      "How do I set up a Plastic Surgery clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "vascular-surgery",
    label: "Vascular & Endovascular Surgery",
    shortLabel: "Vascular Surgeon",
    painPoints: [
      "Vascular procedures (varicose veins, peripheral artery disease) need procedure-specific pre-assessment slots",
      "Post-endovascular monitoring is time-sensitive — a single missed follow-up can have serious consequences",
      "Complex cases need coordination across surgery, radiology, and rehab — paper makes this impossible",
    ],
    solutions: [
      "Procedure-specific scheduling templates for varicose vein, DVT, and endovascular procedure slots",
      "Time-critical post-procedure follow-up alerts ensure vascular patients return for essential monitoring",
      "Digital referral and patient record sharing supports seamless multi-provider care coordination",
    ],
    faqQuestions: [
      "Can Vascular Surgery clinics in {city} manage procedure-specific scheduling on Doctor Diary?",
      "Does Doctor Diary support post-endovascular follow-up management for clinics in {city}?",
      "How does Doctor Diary help Vascular Surgeons in {city} coordinate care across providers?",
      "Is patient data secure for Vascular Surgery practices in {city} using Doctor Diary?",
      "How do I get started with Doctor Diary for a Vascular Surgery clinic in {city}?",
    ],
  },
  {
    slug: "pediatric-surgery",
    label: "Pediatric Surgery",
    shortLabel: "Pediatric Surgeon",
    painPoints: [
      "Pediatric surgical families are anxious and overwhelmed — disorganised communication worsens their experience",
      "Pre-operative preparation for children requires careful parent education that verbal-only instructions miss",
      "Post-operative wound care and dietary instructions for children are frequently mismanaged at home",
    ],
    solutions: [
      "Automated parent-facing pre-operative preparation guide delivered via WhatsApp before every procedure",
      "Child-specific post-operative care instructions with wound check reminders delivered directly to parents",
      "Priority booking slots for surgical follow-ups ensure no critical pediatric review appointment is missed",
    ],
    faqQuestions: [
      "Can Pediatric Surgery clinics in {city} manage pre-operative parent communication on Doctor Diary?",
      "Does Doctor Diary support post-surgical follow-up scheduling for pediatric patients in {city}?",
      "How does Doctor Diary improve the parent experience at Pediatric Surgery clinics in {city}?",
      "Is child patient data secure on Doctor Diary for practices in {city}?",
      "How do I set up a Pediatric Surgery clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "geriatric-medicine",
    label: "Geriatric Medicine",
    shortLabel: "Geriatrician",
    painPoints: [
      "Elderly patients cannot navigate complex smartphone apps — digital booking systems exclude them entirely",
      "Multi-morbidity patients on 8–12 medications need comprehensive digital prescription communication",
      "Mobility challenges mean elderly patients need flexible, arrival-accommodating queue management",
    ],
    solutions: [
      "Phone number-only WhatsApp booking — zero smartphone navigation required for elderly patients",
      "Comprehensive medication lists with instructions sent to the patient and their family caregiver simultaneously",
      "Flexible arrival window management ensures mobility-challenged patients are never penalised for delays",
    ],
    faqQuestions: [
      "Is Doctor Diary easy for elderly patients at Geriatric Medicine clinics in {city} to use?",
      "Can Geriatricians in {city} manage complex multi-medication prescriptions digitally on Doctor Diary?",
      "How does Doctor Diary involve family caregivers of elderly patients at clinics in {city}?",
      "Does Doctor Diary work well for mobility-challenged patients at Geriatric practices in {city}?",
      "What does Doctor Diary cost for a Geriatric Medicine clinic in {city}?",
    ],
  },
  {
    slug: "allergy-immunology",
    label: "Allergy & Immunology",
    shortLabel: "Allergist",
    painPoints: [
      "Immunotherapy (allergy shot) schedules require weekly visits over 3–5 years — drop-off rates are enormous",
      "Allergy testing requires medication avoidance prep — verbal briefings are forgotten by appointment day",
      "Seasonal allergy surges create unmanageable walk-in queues that disrupt scheduled immunotherapy patients",
    ],
    solutions: [
      "Long-term immunotherapy session tracking with automated weekly reminders reduces 3–5 year protocol drop-off",
      "Pre-allergy-test medication avoidance instructions auto-delivered 48h before testing appointments",
      "Separate walk-in and immunotherapy queues during seasonal peaks — zero scheduling chaos",
    ],
    faqQuestions: [
      "Can Allergy clinics in {city} manage long-term immunotherapy scheduling on Doctor Diary?",
      "Does Doctor Diary send pre-allergy-test preparation instructions to patients in {city}?",
      "How does Doctor Diary handle seasonal allergy patient surges for clinics in {city}?",
      "Is Doctor Diary suitable for an Immunotherapy practice in {city}?",
      "What is the pricing for an Allergy clinic in {city} on Doctor Diary?",
    ],
  },
  {
    slug: "pain-spine",
    label: "Pain & Spine Management",
    shortLabel: "Pain Specialist",
    painPoints: [
      "Chronic pain patients cannot stand in crowded waiting rooms — poor queue management directly harms them",
      "Pain procedures (nerve blocks, epidurals) require strict pre-procedure protocols that paper cannot enforce",
      "Multi-disciplinary pain management needs coordination across physiotherapy, surgery, and psychology teams",
    ],
    solutions: [
      "Live WhatsApp queue updates allow chronic pain patients to wait comfortably without standing in queues",
      "Pre-procedure instructions and informed consent reminders auto-delivered before every pain procedure",
      "Digital referral notes and coordination support for multi-provider pain management care teams",
    ],
    faqQuestions: [
      "Does Doctor Diary support waiting room-free queue management for Pain clinics in {city}?",
      "Can Pain Management clinics in {city} send pre-procedure instructions automatically via Doctor Diary?",
      "How does Doctor Diary support multi-disciplinary Pain Management coordination in {city}?",
      "Is Doctor Diary suitable for a Spine Management clinic in {city}?",
      "How do I set up a Pain Management practice on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "anesthesiology",
    label: "Anesthesiology & Critical Care",
    shortLabel: "Anesthesiologist",
    painPoints: [
      "Pre-anesthetic assessment clinics have unpredictable patient flow — paper management creates chaos",
      "Complex pre-operative fasting and medication instructions conveyed verbally lead to surgical cancellations",
      "Post-operative pain management follow-ups for day-surgery patients are routinely missed",
    ],
    solutions: [
      "Structured pre-anesthetic assessment scheduling with clear patient flow management",
      "Comprehensive pre-operative fasting and medication instructions auto-delivered the day before surgery",
      "Automated post-day-surgery pain management check-in messages sent the morning after discharge",
    ],
    faqQuestions: [
      "Can Anesthesiology clinics in {city} manage pre-anesthetic assessment scheduling on Doctor Diary?",
      "Does Doctor Diary send pre-operative instructions for Anesthesiology patients in {city}?",
      "How does Doctor Diary support post-day-surgery follow-ups for Anesthesiologists in {city}?",
      "Is Doctor Diary suitable for a pre-anesthetic assessment clinic in {city}?",
      "What does Doctor Diary cost for an Anesthesiology practice in {city}?",
    ],
  },
  {
    slug: "podiatry",
    label: "Podiatry & Foot Care",
    shortLabel: "Podiatrist",
    painPoints: [
      "Diabetic foot patients require strict monthly check-ups — paper systems completely fail to remind patients",
      "Podiatry has low public awareness — the practice suffers from poor visibility on standard search platforms",
      "Wound care follow-ups for diabetic ulcer patients are critical — missed appointments can lead to amputation",
    ],
    solutions: [
      "Monthly diabetic foot care reminder sequences ensure at-risk patients never miss a check-up",
      "Your own clinic URL improves Google visibility for Podiatry — patients find you without aggregators",
      "Critical wound care follow-up alerts with escalation sequences for high-risk diabetic foot patients",
    ],
    faqQuestions: [
      "Can Podiatry clinics in {city} automate monthly diabetic foot care appointment reminders?",
      "Does Doctor Diary help Podiatrists in {city} get found on Google without Practo?",
      "How does Doctor Diary manage wound care follow-up scheduling for Podiatry patients in {city}?",
      "Is Doctor Diary suitable for a standalone Podiatry practice in {city}?",
      "What is the cost of Doctor Diary for a Podiatry clinic in {city}?",
    ],
  },
  {
    slug: "infectious-disease",
    label: "Infectious Disease Specialists",
    shortLabel: "Infectious Disease Specialist",
    painPoints: [
      "Infectious disease consultations need isolation-aware scheduling — shared waiting rooms are clinically inappropriate",
      "Antimicrobial stewardship requires strict treatment course monitoring — patients stop antibiotics prematurely",
      "Travel medicine consultations before international trips require precise, time-sensitive appointment scheduling",
    ],
    solutions: [
      "Private direct-to-consultation booking routes patients past shared waiting rooms entirely",
      "Automated treatment course completion reminders ensure antibiotic adherence and reduce resistance risk",
      "Pre-travel vaccine and consultation scheduling with country-specific health protocol reminders",
    ],
    faqQuestions: [
      "Does Doctor Diary support private consultation management for Infectious Disease specialists in {city}?",
      "Can Infectious Disease clinics in {city} send antibiotic treatment course completion reminders?",
      "How does Doctor Diary manage travel medicine scheduling for clinics in {city}?",
      "Is patient data secure for Infectious Disease specialists in {city} using Doctor Diary?",
      "How do I set up an Infectious Disease practice on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "occupational-medicine",
    label: "Occupational & Preventive Care",
    shortLabel: "Occupational Health Doctor",
    painPoints: [
      "Corporate health check-up camps require bulk scheduling for hundreds of employees — impossible on paper",
      "Annual employee health check compliance tracking is a manual, error-prone, time-intensive process",
      "Occupational disease surveillance requires longitudinal tracking that paper records cannot support at scale",
    ],
    solutions: [
      "Bulk corporate booking with employee-wise appointment scheduling and automated individual reminders",
      "Annual health check compliance dashboard tracks and reminds employees who haven't completed their checks",
      "Longitudinal occupational health records with automated annual re-screening reminders at the right time",
    ],
    faqQuestions: [
      "Can Occupational Medicine practices in {city} manage corporate health check bookings on Doctor Diary?",
      "Does Doctor Diary support bulk employee health check scheduling for companies in {city}?",
      "How does Doctor Diary track annual health check compliance for Occupational clinics in {city}?",
      "Is Doctor Diary suitable for a corporate Occupational Health center in {city}?",
      "What pricing does Doctor Diary offer for Occupational Medicine clinics in {city}?",
    ],
  },
  {
    slug: "speech-audiology",
    label: "Speech & Audiology Therapy",
    shortLabel: "Speech Therapist",
    painPoints: [
      "Speech and audiology therapy requires consistent weekly sessions over months — high drop-off is endemic",
      "Home exercise compliance is poor without structured digital reinforcement between in-clinic sessions",
      "Family caregiver involvement is critical for pediatric speech therapy but coordination is difficult to manage",
    ],
    solutions: [
      "Weekly session reminders with progress tracking reduce therapy drop-off and improve treatment outcomes",
      "Digital home exercise programme delivery via WhatsApp keeps patients practising between every session",
      "Family caregiver notifications keep parents aligned on pediatric therapy progress and homework assignments",
    ],
    faqQuestions: [
      "Can Speech Therapy clinics in {city} manage long-term session packages on Doctor Diary?",
      "Does Doctor Diary support home exercise programme delivery for Speech Therapists in {city}?",
      "How does Doctor Diary involve family caregivers in Pediatric Speech Therapy in {city}?",
      "Is Doctor Diary suitable for an Audiology practice in {city}?",
      "What is the cost of Doctor Diary for a Speech Therapy clinic in {city}?",
    ],
  },
  {
    slug: "trichology",
    label: "Trichology & Hair Restoration",
    shortLabel: "Trichologist",
    painPoints: [
      "PRP and hair restoration treatments require multi-session protocols — manual session tracking fails",
      "Post-transplant care requires day-by-day instructions that patients managing graft recovery often get wrong",
      "High-value trichology consultations (₹2,000–₹10,000) are routinely lost to no-shows without recovery",
    ],
    solutions: [
      "Multi-session PRP and hair restoration protocol tracking with automated session reminders",
      "Post-transplant care sequence delivering day-by-day instructions via WhatsApp for the first 14 days",
      "Multi-touch reminder system significantly reduces no-shows before high-value hair restoration bookings",
    ],
    faqQuestions: [
      "Can Trichology clinics in {city} manage multi-session PRP treatment scheduling on Doctor Diary?",
      "Does Doctor Diary support post-hair-transplant care instruction delivery for clinics in {city}?",
      "How does Doctor Diary reduce no-shows for hair restoration consultations in {city}?",
      "Is Doctor Diary suitable for a standalone Trichology practice in {city}?",
      "How do I set up a Trichology clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "ivf-reproductive",
    label: "IVF & Reproductive Medicine",
    shortLabel: "Fertility Specialist",
    painPoints: [
      "IVF protocols have dozens of time-sensitive steps — a single missed appointment can abort an entire cycle",
      "Couples undergoing fertility treatment are emotionally stressed — disorganised communication worsens their experience",
      "Trigger shot and retrieval timing requires precise, time-critical notification that paper simply cannot deliver",
    ],
    solutions: [
      "Day-by-day IVF protocol scheduling with time-sensitive alerts for critical stimulation and trigger steps",
      "Organised, compassionate communication reduces anxiety for couples throughout their fertility journey",
      "Time-critical trigger shot and retrieval appointment alerts delivered to the minute via WhatsApp",
    ],
    faqQuestions: [
      "Can IVF clinics in {city} manage day-by-day treatment protocol scheduling on Doctor Diary?",
      "Does Doctor Diary send time-sensitive alerts for IVF trigger shots and egg retrievals in {city}?",
      "How does Doctor Diary improve the patient experience for couples at Fertility clinics in {city}?",
      "Is reproductive patient data fully private and encrypted on Doctor Diary in {city}?",
      "How do I set up an IVF clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "sports-medicine",
    label: "Sports Medicine",
    shortLabel: "Sports Medicine Doctor",
    painPoints: [
      "Athletes need rapid return-to-play assessments — long queues shared with civilian patients are unacceptable",
      "Rehabilitation protocols for sports injuries require milestone-based follow-up that paper cannot track",
      "Team doctors managing multiple athletes across clubs need multi-patient scheduling paper makes impossible",
    ],
    solutions: [
      "Priority queue slots for urgent injury assessments alongside standard OPD management",
      "Milestone-based rehabilitation tracking with automated check-in points throughout recovery protocols",
      "Multi-patient management dashboard for team doctors handling full sports club athlete rosters",
    ],
    faqQuestions: [
      "Can Sports Medicine clinics in {city} manage athlete priority bookings on Doctor Diary?",
      "Does Doctor Diary support rehabilitation milestone tracking for Sports Medicine in {city}?",
      "How does Doctor Diary help team doctors in {city} manage multiple athlete appointment schedules?",
      "Is Doctor Diary suitable for a standalone Sports Medicine practice in {city}?",
      "What is the pricing for Doctor Diary at a Sports Medicine clinic in {city}?",
    ],
  },
  {
    slug: "emergency-medicine",
    label: "Emergency Medicine",
    shortLabel: "Emergency Physician",
    painPoints: [
      "After-hours emergencies have no clear escalation path — patients with urgent needs don't know where to go",
      "Post-emergency follow-ups are unstructured — patients discharged after acute episodes miss critical reviews",
      "Emergency-converted OPD patients fall through the cracks with no continuity of care management",
    ],
    solutions: [
      "Clear after-hours direction messaging and urgent consultation booking pathways for emergency cases",
      "Automated 48h post-emergency follow-up booking ensures continuity after every acute episode",
      "Seamless emergency visit-to-follow-up-OPD conversion within the same connected patient record",
    ],
    faqQuestions: [
      "Can Emergency Medicine clinics in {city} manage after-hours consultation booking on Doctor Diary?",
      "Does Doctor Diary support post-emergency follow-up scheduling for clinics in {city}?",
      "How does Doctor Diary handle continuity of care for Emergency patients in {city}?",
      "Is Doctor Diary suitable for an urgent care centre in {city}?",
      "How do I set up an Emergency Medicine clinic on Doctor Diary in {city}?",
    ],
  },
  {
    slug: "family-practice",
    label: "Family Practice",
    shortLabel: "Family Doctor",
    painPoints: [
      "Family physicians see patients of all ages and urgency levels — flat queues don't reflect clinical priority",
      "Annual wellness check reminders for chronic patients require proactive outreach that paper cannot scale",
      "Entire families registered at one practice create complex multi-member scheduling challenges",
    ],
    solutions: [
      "Multi-priority queue management allows acute, chronic, and wellness visits to be appropriately triaged",
      "Proactive annual wellness and vaccination reminders for every registered family member automatically",
      "Family account management — book appointments for all family members from one WhatsApp number",
    ],
    faqQuestions: [
      "Can Family Practice clinics in {city} manage multi-priority patient queues on Doctor Diary?",
      "Does Doctor Diary support proactive annual wellness reminders for Family Practice patients in {city}?",
      "Can families in {city} book appointments for all members from one WhatsApp number on Doctor Diary?",
      "Is Doctor Diary suitable for a high-volume Family Practice clinic in {city}?",
      "What is the pricing for Doctor Diary for a Family Practice clinic in {city}?",
    ],
  },
  {
    slug: "preventive-health",
    label: "Preventive Health & Longevity",
    shortLabel: "Preventive Health Doctor",
    painPoints: [
      "Preventive health consultations are elective — high no-show rates make revenue planning unpredictable",
      "Annual health audit programmes require proactive patient outreach that manual systems cannot scale",
      "Longevity and lifestyle medicine is a premium offering — it needs a professional online presence to attract the right patients",
    ],
    solutions: [
      "Annual health audit scheduling with automated renewal reminders creates predictable, recurring revenue",
      "Proactive outreach sequences re-engage lapsed preventive health patients before they seek competitors",
      "Professional branded clinic URL positions your practice as the premium preventive health destination",
    ],
    faqQuestions: [
      "Can Preventive Health clinics in {city} automate annual health audit appointment reminders?",
      "Does Doctor Diary support longevity medicine consultation scheduling in {city}?",
      "How does Doctor Diary help Preventive Health practices in {city} attract premium patients?",
      "Is Doctor Diary suitable for a Lifestyle Medicine practice in {city}?",
      "How do I set up a Preventive Health clinic on Doctor Diary in {city}?",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 30 Top Indian Cities — ranked by doctor density and healthcare infrastructure
// ─────────────────────────────────────────────────────────────────────────────
export const CITIES: City[] = [
  { slug: "mumbai", label: "Mumbai", state: "Maharashtra" },
  { slug: "delhi", label: "Delhi", state: "Delhi" },
  { slug: "bangalore", label: "Bangalore", state: "Karnataka" },
  { slug: "hyderabad", label: "Hyderabad", state: "Telangana" },
  { slug: "chennai", label: "Chennai", state: "Tamil Nadu" },
  { slug: "pune", label: "Pune", state: "Maharashtra" },
  { slug: "kolkata", label: "Kolkata", state: "West Bengal" },
  { slug: "ahmedabad", label: "Ahmedabad", state: "Gujarat" },
  { slug: "jaipur", label: "Jaipur", state: "Rajasthan" },
  { slug: "surat", label: "Surat", state: "Gujarat" },
  { slug: "lucknow", label: "Lucknow", state: "Uttar Pradesh" },
  { slug: "nagpur", label: "Nagpur", state: "Maharashtra" },
  { slug: "indore", label: "Indore", state: "Madhya Pradesh" },
  { slug: "thane", label: "Thane", state: "Maharashtra" },
  { slug: "bhopal", label: "Bhopal", state: "Madhya Pradesh" },
  { slug: "visakhapatnam", label: "Visakhapatnam", state: "Andhra Pradesh" },
  { slug: "vadodara", label: "Vadodara", state: "Gujarat" },
  { slug: "ludhiana", label: "Ludhiana", state: "Punjab" },
  { slug: "nashik", label: "Nashik", state: "Maharashtra" },
  { slug: "rajkot", label: "Rajkot", state: "Gujarat" },
  { slug: "coimbatore", label: "Coimbatore", state: "Tamil Nadu" },
  { slug: "patna", label: "Patna", state: "Bihar" },
  { slug: "chandigarh", label: "Chandigarh", state: "Punjab" },
  { slug: "kochi", label: "Kochi", state: "Kerala" },
  { slug: "mysuru", label: "Mysuru", state: "Karnataka" },
  { slug: "agra", label: "Agra", state: "Uttar Pradesh" },
  { slug: "guwahati", label: "Guwahati", state: "Assam" },
  { slug: "faridabad", label: "Faridabad", state: "Haryana" },
  { slug: "meerut", label: "Meerut", state: "Uttar Pradesh" },
  { slug: "kanpur", label: "Kanpur", state: "Uttar Pradesh" },
  // UAE Cities & Healthcare Hubs
  { slug: "dubai", label: "Dubai", state: "Dubai" },
  { slug: "abu-dhabi", label: "Abu Dhabi", state: "Abu Dhabi" },
  { slug: "sharjah", label: "Sharjah", state: "Sharjah" },
  { slug: "ajman", label: "Ajman", state: "Ajman" },
  { slug: "ras-al-khaimah", label: "Ras Al Khaimah", state: "Ras Al Khaimah" },
  { slug: "al-ain", label: "Al Ain", state: "Abu Dhabi" },
];
