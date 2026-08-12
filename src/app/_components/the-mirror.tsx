"use client";

import { motion } from "framer-motion";
import { PhoneCall, BookOpen, MessageSquare, Clock, AlertTriangle, RefreshCw } from "lucide-react";

export function TheMirror() {
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

  const chaosItems = [
    { icon: <PhoneCall className="w-5 h-5 text-red-400" />, text: "Patient calling to ask queue number" },
    { icon: <BookOpen className="w-5 h-5 text-amber-400" />, text: "Receptionist checking a paper register" },
    { icon: <MessageSquare className="w-5 h-5 text-blue-400" />, text: "WhatsApp messages piling up unanswered" },
    { icon: <Clock className="w-5 h-5 text-orange-400" />, text: "Patients waiting without real-time updates" },
    { icon: <AlertTriangle className="w-5 h-5 text-red-500" />, text: "No-show slots resulting in lost revenue" },
    { icon: <RefreshCw className="w-5 h-5 text-yellow-500" />, text: "Follow-ups forgotten in the rush" }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-[#0B132B] text-white relative overflow-hidden">
      {/* Background soft ambient lights */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
        >
          {/* Left Column: Empathy Prose */}
          <div className="lg:col-span-6 flex flex-col text-left">
            <motion.span 
              variants={itemVariants}
              className="text-[#00B7A8] font-bold text-xs uppercase tracking-widest mb-3"
            >
              The Reality of Practice
            </motion.span>
            
            <motion.h2 
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 tracking-tight leading-[1.15]"
            >
              Most clinic software was built for hospitals.<br />
              <span className="text-slate-400">Not for you.</span>
            </motion.h2>

            <motion.div 
              variants={itemVariants}
              className="space-y-5 text-slate-300 text-base sm:text-lg font-medium leading-relaxed"
            >
              <p>
                You spent a decade learning medicine. You envisioned a practice centered on care, precision, and patient relationships.
              </p>
              <p>
                Instead, you spend half your day managing phone calls, WhatsApp queues, missed appointments, and reception confusion.
              </p>
              <p className="text-white border-l-2 border-[#00B7A8] pl-4 italic">
                Not because you wanted to. Because the tools never caught up with you.
              </p>
            </motion.div>
          </div>

          {/* Right Column: The Chaos List vs The Identity */}
          <div className="lg:col-span-6">
            <motion.div 
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="mb-6 pb-6 border-b border-white/10">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Daily Operations
                </span>
                <span className="text-lg font-bold text-white">
                  The Friction You Face Every Morning
                </span>
              </div>

              <ul className="space-y-4">
                {chaosItems.map((item, idx) => (
                  <motion.li
                    key={idx}
                    variants={itemVariants}
                    className="flex items-center gap-3.5 text-slate-300 text-sm sm:text-base font-semibold"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <span>{item.text}</span>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-white/10 text-center lg:text-left">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                  The Patient Question
                </p>
                <h3 className="text-[#00B7A8] text-2xl font-black tracking-tight leading-none">
                  "Doctor kab aayenge?"
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm mt-2 font-medium">
                  That constant interruption shouldn't be your clinic's identity.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
