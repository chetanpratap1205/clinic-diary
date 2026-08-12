"use client";

import { motion } from "framer-motion";
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
          
          {/* Left Column: Sleek Simulated Dashboard UI mockup */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Mock Dashboard Top Nav */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-lg font-black text-[#0B132B]">Daily Clinic Board</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Dr. Sharma's Cardiology Care</p>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-bold bg-emerald-50 border border-emerald-200 text-[#00B7A8] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 18 Active Confirmed
                  </span>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Today's Load</span>
                  <span className="text-2xl font-black text-[#0B132B]">26 / 30</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Live Queue</span>
                  <span className="text-2xl font-black text-emerald-600">Serving #18</span>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Recovered</span>
                  <span className="text-2xl font-black text-blue-600">+₹3,200</span>
                </div>
              </div>

              {/* Live Patient Grid */}
              <div className="space-y-3.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Queue</p>
                {[
                  { token: "#18", name: "Pankaj Verma", age: "54, Male", status: "In Consultation", time: "10:35 AM", color: "border-emerald-500 bg-emerald-50/30 text-emerald-700" },
                  { token: "#19", name: "Ananya Deshmukh", age: "29, Female", status: "Waiting in Lobby", time: "10:50 AM", color: "border-blue-500 bg-blue-50/20 text-blue-700" },
                  { token: "#20", name: "Rohan Kapoor", age: "42, Male", status: "Arriving Soon (WhatsApp Reminded)", time: "11:05 AM", color: "border-slate-200 bg-slate-50 text-slate-600" }
                ].map((patient, idx) => (
                  <div key={idx} className={`p-4 border rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 hover:shadow-sm ${patient.color}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black w-8 h-8 rounded-lg bg-slate-900/5 flex items-center justify-center shrink-0">
                        {patient.token}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[#0B132B]">{patient.name}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{patient.age} · Appt: {patient.time}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-sm">
                      {patient.status}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

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
