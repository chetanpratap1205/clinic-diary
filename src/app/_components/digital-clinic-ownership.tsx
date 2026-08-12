"use client";

import { motion } from "framer-motion";
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

          {/* Right Column: Premium Digital Clinic Profile Page Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div
              variants={itemVariants}
              className="w-full max-w-[420px] bg-white border border-slate-200 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left"
            >
              {/* Decorative shimmer */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Profile Card Header */}
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-black text-[#0B132B]">Dr. Kavya Menon</h3>
                  <p className="text-[#00B7A8] text-xs font-bold uppercase tracking-wider mt-0.5">
                    General Physician · Family Medicine
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs font-black text-[#0B132B]">4.9</span>
                    <span className="text-xs text-slate-500 font-semibold">(48 Verified Reviews)</span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-[#00B7A8] flex items-center justify-center text-white font-black text-xl shadow-md shrink-0">
                  KM
                </div>
              </div>

              {/* Live Status Indicator */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between mb-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Open Today
                  </span>
                </div>
                <span className="text-xs font-black text-[#0B132B] bg-white border border-emerald-100 px-3 py-1 rounded-full shadow-inner">
                  Serving Now: #12
                </span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button className="w-full h-12 bg-[#00B7A8] hover:bg-[#00998c] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md">
                  Book Direct Appointment
                </button>
                <button className="w-full h-12 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  Track Live Queue
                </button>
              </div>

              {/* Clinic Specs */}
              <div className="space-y-4 pt-6 border-t border-slate-100 text-xs sm:text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4.5 h-4.5 text-[#00B7A8] shrink-0" />
                  <span>Menon Clinic, 15, MG Road, Kozhikode</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4.5 h-4.5 text-[#00B7A8] shrink-0" />
                  <span>Mon–Sat: 9:00 AM – 1:00 PM, 5:00 PM – 9:00 PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4.5 h-4.5 text-[#00B7A8] shrink-0" />
                  <span>₹400 Consultation Fee · Pay Directly at Clinic</span>
                </div>
              </div>

              {/* Trust Tag */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Verified Direct Booking Page</span>
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
