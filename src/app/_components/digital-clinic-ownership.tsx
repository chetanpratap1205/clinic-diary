"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Shield, Sparkles, MapPin, Clock, CreditCard, Star, CheckCircle } from "lucide-react";

export function DigitalClinicOwnership() {
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  } as const;

  return (
    <section className="py-24 px-4 sm:px-6 bg-[#FAFBFC] border-t border-slate-200 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
        >
          
          {/* Left Column: Narrative Copy */}
          <div className="lg:col-span-6 text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
              <Shield className="w-4 h-4" /> 100% Practice Sovereignty
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black text-[#0B132B] mb-6 tracking-tight leading-[1.1]">
              Your clinic should have its own digital home.
            </h2>

            <div className="space-y-6 text-slate-600 text-base sm:text-lg font-medium leading-relaxed mb-8">
              <p>
                When patients search for your specialty, they should find <strong className="text-[#0B132B] font-bold">your clinic</strong>—not an aggregator platform that lists your competitors on the same screen.
              </p>
              <p>
                When they book, they book directly with you. When they receive confirmations and updates on WhatsApp, it arrives under your brand's name. And when they return, they remember you—not the marketplace in the middle.
              </p>
              <p>
                Doctor Diary acts as your infrastructure. We host your profile, power your communications, and manage your queue—keeping you completely independent.
              </p>
            </div>

            <div className="text-[#00B7A8] font-black text-xl italic tracking-tight">
              "Your clinic. Your patients. Your relationship."
            </div>
          </div>

          {/* Right Column: Premium Digital Clinic Stack Mockup */}
          <div className="lg:col-span-6 relative flex justify-center items-center h-[500px] sm:h-[600px] w-full">
            {/* Background Image (Settings) */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: -20, rotate: 6 }}
              whileInView={{ opacity: 0.7, x: 20, y: -10, rotate: 3 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="absolute right-[5%] sm:right-[15%] top-[5%] w-[55%] sm:w-[45%] aspect-[9/19] rounded-3xl overflow-hidden shadow-xl border-4 border-slate-200/50 bg-slate-100"
            >
              <Image src="/assets/settings.PNG" alt="App Settings" fill className="object-cover object-top" sizes="(max-width: 768px) 50vw, 30vw" quality={80} />
            </motion.div>

            {/* Foreground Image (Booking App) */}
            <motion.div
              initial={{ opacity: 0, x: -40, y: 20, rotate: -6 }}
              whileInView={{ opacity: 1, x: -20, y: 10, rotate: -2 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="absolute left-[5%] sm:left-[15%] top-[10%] w-[60%] sm:w-[50%] aspect-[9/19] rounded-[2.5rem] bg-slate-900 border-[6px] border-slate-800 shadow-2xl overflow-hidden hover:rotate-0 hover:scale-[1.02] transition-all duration-500 z-10"
            >
              <Image src="/assets/booking_app.PNG" alt="Clinic Profile" fill className="object-cover object-top" sizes="(max-width: 768px) 60vw, 40vw" quality={95} />
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
