"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Users, Clock, FileText, CheckCircle2, TrendingUp, Calendar, Zap, Layout } from "lucide-react";

export function DoctorDashboard() {
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

  const workflowSteps = [
    {
      time: "7:45 AM",
      title: "Morning Schedule Loaded",
      desc: "26 patients confirmed via automated WhatsApp. 3 slots rescheduled automatically, filling your entire calendar before you arrive.",
      icon: <Calendar className="w-5 h-5 text-emerald-500" />
    },
    {
      time: "During Clinic",
      title: "No-Interruption Queue",
      desc: "Reception views the live board on their monitor. Patients wait in their cars or nearby cafes, knowing their exact wait time. Zero lobby chaos.",
      icon: <Users className="w-5 h-5 text-blue-500" />
    },
    {
      time: "During Consult",
      title: "One-Tap Patient History",
      desc: "Tap once to see previous consult details, allergies, and Rx history. Take clinical notes without changing how you write prescriptions.",
      icon: <FileText className="w-5 h-5 text-purple-500" />
    },
    {
      time: "Post Consultation",
      title: "Auto-Scheduled Follow-ups",
      desc: "As soon as you finalize the visit, Doctor Diary queues up a personalized care message and follow-up trigger for that patient.",
      icon: <Zap className="w-5 h-5 text-amber-500" />
    },
    {
      time: "End of Day",
      title: "Practice Insights Dashboard",
      desc: "Analyze no-shows prevented, patient feedback, and direct clinic growth metrics. Everything compiled automatically.",
      icon: <TrendingUp className="w-5 h-5 text-teal-500" />
    }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 bg-slate-50 border-t border-b border-slate-200 relative overflow-hidden">
      {/* Decorative glows */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#00B7A8]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
            <Layout className="w-4 h-4" /> The Doctor's Workspace
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0B132B] mb-6 tracking-tight">
            Behind the patient experience — a calmer clinic.
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">
            Eliminate receptionist burnout, reduce double-bookings, and track operations effortlessly. Here is your clinic's backend flow.
          </p>
        </div>

        {/* 2-Column Dashboard Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center"
        >
          
          {/* Left Column: Sleek 3D Dashboard Image Mockup */}
          <motion.div 
            className="lg:col-span-7 relative group perspective-1000"
            initial={{ opacity: 0, scale: 0.9, rotateX: 5 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-[80px] rounded-full scale-90 group-hover:bg-[#00B7A8]/30 transition-colors duration-700" />
            
            {/* Outer Frame (Browser/Tablet Window) */}
            <div className="relative w-full rounded-[2rem] bg-slate-900 border-[8px] border-slate-800 p-2 sm:p-4 shadow-2xl overflow-hidden transition-transform duration-700 hover:rotate-y-[-2deg] hover:rotate-x-[2deg] hover:scale-[1.02]">
              {/* Fake Browser Header */}
              <div className="flex items-center gap-2 mb-3 px-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="ml-4 h-5 w-1/3 bg-white/10 rounded-full flex items-center px-3">
                  <span className="text-[9px] text-white/50 font-medium">dashboard.doctordiary.in</span>
                </div>
              </div>
              
              {/* Real Dashboard Image */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-inner border border-white/10 bg-slate-950">
                <Image 
                  src="/assets/Dashboard.png" 
                  alt="Doctor Diary Comprehensive Dashboard"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  quality={95}
                />
              </div>
            </div>
          </motion.div>

          {/* Right Column: Workflow Steps list */}
          <div className="lg:col-span-5 space-y-6">
            {workflowSteps.map((step, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="flex gap-4 text-left"
              >
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#00B7A8] uppercase tracking-wider">{step.time}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0B132B] mb-1">{step.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </section>
  );
}
