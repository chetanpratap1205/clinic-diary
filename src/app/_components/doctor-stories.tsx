"use client";

import { motion } from "framer-motion";
import { Star, MessageSquare, Quote, CheckCircle2 } from "lucide-react";

export function DoctorStories() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  } as const;

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  } as const;

  const stories = [
    {
      quote: "Dental procedures require strict scheduling. If a patient skips or shows up 30 minutes late, the whole day's calendar breaks. Doctor Diary's 24-hour and 2-hour WhatsApp reminders have brought our no-show rate to near-zero. Slots are perfectly aligned now.",
      doctorName: "Dr. MadhuRani",
      clinicName: "Smile Roots Dental Clinic",
      city: "Indore",
      specialty: "Orthodontist & Implantologist",
      metric: "No-Shows Reduced to Near-Zero"
    },
    {
      quote: "Cardiology consultations take time, and queue management was our biggest headache. Patients used to crowd the reception asking 'Mera number kab aayega?'. With Live Queue tracking, patients wait comfortably elsewhere. Reception calls dropped by 80%.",
      doctorName: "Dr. Sandeep Sharma",
      clinicName: "Sharma Cardiology Center",
      city: "Jaipur",
      specialty: "Consultant Cardiologist",
      metric: "80% Drop in Front-Desk Calls"
    },
    {
      quote: "Aesthetic procedures are high-value but have longer gaps. We didn't have a structured way to stay connected with patients post-treatment. Doctor Diary's automated WhatsApp follow-ups reactivated old patients, boosting repeat consultations by 35%.",
      doctorName: "Dr. Priya Nair",
      clinicName: "Nair Skin & Aesthetics Clinic",
      city: "Kochi",
      specialty: "Dermatologist & Cosmetologist",
      metric: "35% Increase in Patient Retention"
    }
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-[#F8FAFC] text-slate-900 border-t border-slate-200/80 relative overflow-hidden">
      {/* Background soft ambient lights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
            <CheckCircle2 className="w-4 h-4" /> Verified Clinic Outcomes
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B132B] mb-4 tracking-tight">
            Independent practices, real outcomes.
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">
            See how doctors across different specialties use Doctor Diary to run calmer, more profitable clinics.
          </p>
        </div>

        {/* Testimonials Card Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {stories.map((story, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="bg-white border border-slate-200/90 rounded-[32px] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden hover:border-[#00B7A8]/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl"
            >
              {/* Shading/Quote icon */}
              <Quote className="absolute right-6 top-6 w-16 h-16 text-slate-100 pointer-events-none" />

              <div>
                {/* Rating stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Patient / doctor quote */}
                <p className="text-slate-700 text-sm sm:text-base font-semibold leading-relaxed mb-8 italic">
                  "{story.quote}"
                </p>
              </div>

              {/* Doctor Details */}
              <div className="pt-6 border-t border-slate-100 mt-auto">
                <p className="text-[#0B132B] font-bold text-base">{story.doctorName}</p>
                <p className="text-slate-500 text-xs font-semibold">{story.specialty}</p>
                <p className="text-[#00B7A8] text-xs font-bold mt-1">
                  {story.clinicName} · {story.city}
                </p>

                {/* Specific Metric Badge */}
                <div className="mt-4 inline-block bg-emerald-50 border border-emerald-200 text-[#00B7A8] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
                  ⚡ {story.metric}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
