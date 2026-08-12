"use client";

import { motion } from "framer-motion";
import { CalendarRange, BookOpen, Clock, RefreshCw } from "lucide-react";

export function ZeroFrictionGuarantee() {
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
    <section className="py-24 px-4 sm:px-6 bg-white border-t border-slate-200 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 transform origin-top-right -z-10" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4"
          >
            <RefreshCw className="w-4 h-4" /> Seamless Transition
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B132B] mb-6 tracking-tight leading-[1.1]"
          >
            You don't have to change anything to get started.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-lg font-medium leading-relaxed max-w-2xl mx-auto"
          >
            We built Doctor Diary to fit around your existing habits. Keep the parts of your practice you love, and automate the parts you hate.
          </motion.p>
        </div>

        {/* Value Proposition Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="bg-white border border-slate-200 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5">
              <CalendarRange className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0B132B] mb-3">Your Walk-ins? <br/><span className="text-[#00B7A8]">They still come.</span></h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              We don't force anyone to book online. Walk-in patients scan a QR code at your desk and seamlessly join the same smart queue.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="bg-white border border-slate-200 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0B132B] mb-3">Your Rx Pad? <br/><span className="text-[#00B7A8]">We don't touch it.</span></h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              Love writing on your traditional prescription pad? Keep using it. Our system handles the front desk so you can practice medicine your way.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="bg-white border border-slate-200 hover:border-emerald-500/40 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#0B132B] mb-3">Your Old Register? <br/><span className="text-[#00B7A8]">Migrated free.</span></h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              Have an Excel sheet or another software? Our engineering team moves 100% of your patient records over in 48 hours, completely free.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B7A8]/20 rounded-full blur-3xl group-hover:bg-[#00B7A8]/40 transition-colors" />
            <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-5 border border-white/10 relative z-10">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 relative z-10">The only change? <br/><span className="text-[#00B7A8]">24/7 visibility.</span></h3>
            <p className="text-sm font-medium text-slate-400 leading-relaxed relative z-10">
              When your clinic closes at 8 PM, your digital front desk stays open. Patients can now find and book you at 11 PM.
            </p>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
