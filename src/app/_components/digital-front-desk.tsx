"use client";

import { motion } from "framer-motion";
import { CalendarRange, Sparkles, UserCheck, RefreshCw, Layers } from "lucide-react";

export function DigitalFrontDesk() {
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
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  } as const;

  const steps = [
    {
      title: "Before the Visit",
      subtitle: "Simplify Patient Access",
      icon: <CalendarRange className="w-6 h-6 text-[#00B7A8]" />,
      items: [
        "Frictionless online booking",
        "Personalized QR code booking link",
        "Instant WhatsApp confirmations",
        "Automated 24-hour reminders",
        "Automated 2-hour pre-visit reminders"
      ]
    },
    {
      title: "During the Visit",
      subtitle: "Eliminate Front-Desk Chaos",
      icon: <UserCheck className="w-6 h-6 text-[#00B7A8]" />,
      items: [
        "Instant digital walk-in registration",
        "Live queue tracking on patient phones",
        "One-tap digital patient history",
        "Streamlined reception workflow",
        "Real-time doctor consult queue"
      ]
    },
    {
      title: "After the Visit",
      subtitle: "Retain & Grow Relationships",
      icon: <RefreshCw className="w-6 h-6 text-[#00B7A8]" />,
      items: [
        "Automatic follow-up scheduling",
        "WhatsApp care reminders",
        "5-star Google review triggers",
        "Inactive patient reactivation",
        "Practice growth & analytics dashboard"
      ]
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-[#FAFBFC] relative overflow-hidden">
      {/* Light decorative gradient blobs */}
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
            <Layers className="w-4 h-4" /> Introducing Your Operating Layer
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0B132B] mb-6 tracking-tight leading-[1.1]">
            Meet your clinic's digital front desk.
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">
            Everything your receptionist does manually — done automatically, under your clinic's name.<br className="hidden sm:inline" />
            Not a marketplace. A calm, connected operating layer that respects your existing workflow.
          </p>
        </div>

        {/* 3-Column Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="bg-white border border-slate-200/90 hover:border-emerald-500/40 rounded-[32px] p-8 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Phase {idx + 1}</span>
                    <h3 className="text-2xl font-bold text-[#0B132B] mt-1">{step.title}</h3>
                    <p className="text-slate-500 text-xs font-semibold mt-0.5">{step.subtitle}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>

                <ul className="space-y-4">
                  {step.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3 text-slate-700 text-sm font-semibold">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00B7A8] shrink-0 mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Physical QR kit callout in "Before the Visit" */}
              {idx === 0 && (
                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-2 text-[#00B7A8] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Physical QR kit included</span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Section Footer Statement */}
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-lg font-bold italic">
            You practise medicine. Doctor Diary keeps the clinic moving.
          </p>
        </div>

      </div>
    </section>
  );
}
