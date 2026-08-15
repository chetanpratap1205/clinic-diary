"use client";

import { motion } from "framer-motion";
import { Shield, Smartphone, Receipt, PenTool, CheckCircle, ArrowRight, Sparkles } from "lucide-react";

const specialtyList = [
  "General Physician", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics", 
  "Psychiatry", "Dental", "Neurology", "Gynecology", "Ophthalmology", "ENT"
];

// Double the list for seamless marquee
const marqueeItems = [...specialtyList, ...specialtyList, ...specialtyList];

export function ExperienceEngine() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAFBFC] relative border-t border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0B132B] mb-6 tracking-tight leading-[1.1]">
            Stop Acting Like a Waiting Room.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
              Start Operating Like a Premium Brand.
            </span>
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
            Doctor Diary provides the infrastructure to eliminate chaos and elevate your practice—without forcing you to change how you work.
          </p>
        </div>
      </div>

      {/* Infinite Marquee for 40+ Specialties */}
      <div className="w-full overflow-hidden mb-20 relative flex items-center">
        {/* Gradient Masks for fading edges */}
        <div className="absolute inset-y-0 right-0 w-16 sm:w-48 bg-gradient-to-l from-[#FAFBFC] to-transparent z-10 pointer-events-none" />
        
        <div className="flex items-center shrink-0 ml-4 sm:ml-12 z-20 relative bg-[#FAFBFC] pr-4 sm:pr-8 border-r-2 border-slate-200 shadow-[20px_0_20px_-15px_rgba(250,251,252,1)] py-2">
          <span className="text-xs sm:text-sm font-black text-[#00B7A8] uppercase tracking-widest flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Trusted by 40+ Specialties
          </span>
        </div>

        <motion.div 
          className="flex items-center gap-8 pl-8 shrink-0"
          animate={{ x: [0, "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
        >
          {marqueeItems.map((item, i) => (
            <div key={i} className="flex items-center gap-8 shrink-0">
              <span className="text-base sm:text-lg font-bold text-slate-700 whitespace-nowrap">{item}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Storytelling Bento Box Layout */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Box 1: Keep Your Rx Pad */}
          <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-[32px] p-8 sm:p-12 relative overflow-hidden group shadow-md hover:shadow-xl transition-all min-h-[400px] flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-6">
                <PenTool className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0B132B] mb-4">Keep Your Rx Pad.<br/>No Forced Typing.</h3>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium max-w-md">
                You shouldn't have to change how you practice medicine. Write prescriptions by hand just like you do today. We digitize the workflow without forcing you to type a single word.
              </p>
            </div>
            
            {/* Abstract UI representing Rx Pad to Digital */}
            <div className="absolute right-0 bottom-0 w-full sm:w-2/3 h-2/3 bg-slate-50 border-t border-l border-slate-200 rounded-tl-[3rem] p-6 translate-x-12 translate-y-12 sm:translate-x-8 sm:translate-y-8 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500 flex flex-col gap-4">
               <div className="bg-white w-full h-20 sm:h-24 rounded-2xl border border-slate-200 shadow-sm p-4 transform -rotate-3 flex items-center justify-center">
                 <div className="w-full space-y-3 opacity-30">
                   <div className="h-2 bg-slate-400 rounded w-1/3"></div>
                   <div className="h-2 bg-slate-400 rounded w-2/3"></div>
                   <div className="h-2 bg-slate-400 rounded w-1/2"></div>
                 </div>
               </div>
               <div className="flex justify-center -my-2 z-10 relative">
                 <div className="bg-[#00B7A8] rounded-full p-2 shadow-lg text-white">
                   <ArrowRight className="w-5 h-5 rotate-90" />
                 </div>
               </div>
               <div className="bg-emerald-50 w-full h-20 sm:h-24 rounded-2xl border border-emerald-200 shadow-sm p-4 transform rotate-2 flex items-center gap-4">
                 <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500 shrink-0" />
                 <div>
                   <div className="text-xs sm:text-sm font-bold text-emerald-900">Digitized Instantly</div>
                   <div className="text-[10px] sm:text-xs text-emerald-700">Patient receives PDF on WhatsApp</div>
                 </div>
               </div>
            </div>
          </div>

          {/* Box 2: Zero Commission */}
          <div className="md:col-span-5 bg-[#0B132B] text-white rounded-[32px] p-8 sm:p-12 relative overflow-hidden group shadow-md hover:shadow-xl transition-all min-h-[400px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B7A8] rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-[#00B7A8] flex items-center justify-center mb-6">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">100% of Your Fees.<br/>Zero Commission.</h3>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
                Aggregators take a cut. We don't. Patients pay directly at your desk. We have absolutely zero involvement in your payments.
              </p>
            </div>
            
            <div className="relative z-10 mt-8">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                 <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xl">
                   ₹
                 </div>
                 <div>
                   <div className="text-white font-bold text-lg">0% Platform Fee</div>
                   <div className="text-slate-400 text-xs">Direct to your bank account</div>
                 </div>
              </div>
            </div>
          </div>

          {/* Box 3: 24/7 Smart Clinic Manager */}
          <div className="md:col-span-5 bg-emerald-50 border border-emerald-200/60 rounded-[32px] p-8 sm:p-12 relative overflow-hidden group shadow-md hover:shadow-xl transition-all min-h-[400px] flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0B132B] mb-4">The 24/7 Smart<br/>Clinic Manager.</h3>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                Let patients book 24x7 via <strong className="text-emerald-700">your own clinic app</strong> or by scanning a QR code at your shutter. Walk-ins and appointments merge perfectly into one smart queue.
              </p>
            </div>
            
            {/* Phone Mockup Snippet */}
            <div className="absolute right-[-10%] bottom-[-10%] w-[80%] max-w-[250px] aspect-[9/16] bg-white rounded-[2rem] border-8 border-slate-900 shadow-2xl p-4 group-hover:-translate-y-4 transition-transform duration-500 flex flex-col gap-3 rotate-6">
              <div className="w-1/3 h-1 bg-slate-200 rounded-full mx-auto mb-2" />
              <div className="bg-emerald-100 rounded-xl p-3 text-center border border-emerald-200">
                <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">New Booking via App</div>
                <div className="text-sm sm:text-base font-black text-emerald-900">Tomorrow, 10:30 AM</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center gap-3 mt-auto">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="space-y-1 w-full">
                  <div className="h-2 bg-slate-200 rounded w-2/3" />
                  <div className="h-2 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            </div>
          </div>

          {/* Box 4: 100% Practice Sovereignty */}
          <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-[32px] p-8 sm:p-12 relative overflow-hidden group shadow-md hover:shadow-xl transition-all min-h-[400px] flex flex-col justify-between">
            <div className="relative z-10 md:w-1/2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0B132B] mb-4">100% Practice<br/>Sovereignty.</h3>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
                Your patients belong to you. We never list competitors next to your name, we don't build our brand on your back, and we never cross-sell to your patients.
              </p>
            </div>
            
            {/* Visual representing independence */}
            <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-[120%] bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
            <div className="hidden sm:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-4 w-64 group-hover:scale-105 transition-transform duration-500">
               {/* Competitor Listing (Crossed Out) */}
               <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 opacity-50 relative">
                 <div className="absolute inset-0 flex items-center justify-center z-20">
                   <div className="w-full h-1 bg-red-400 rotate-[-15deg] absolute" />
                   <div className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded absolute right-2 -top-2 rotate-12 border border-red-200">
                     Aggregators
                   </div>
                 </div>
                 <div className="flex gap-3 mb-3 opacity-60">
                   <div className="w-8 h-8 rounded-full bg-slate-200" />
                   <div className="flex-1 space-y-2"><div className="h-2 bg-slate-300 w-full rounded" /><div className="h-2 bg-slate-200 w-1/2 rounded" /></div>
                 </div>
                 <div className="flex gap-3 opacity-60">
                   <div className="w-8 h-8 rounded-full bg-slate-200" />
                   <div className="flex-1 space-y-2"><div className="h-2 bg-slate-300 w-full rounded" /><div className="h-2 bg-slate-200 w-1/2 rounded" /></div>
                 </div>
               </div>
               
               {/* Own Brand (Highlighted) */}
               <div className="bg-white border-2 border-[#00B7A8] rounded-2xl p-4 shadow-xl relative z-10 transform -translate-x-8">
                 <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-[#00B7A8] flex items-center justify-center shadow-lg">
                   <CheckCircle className="w-4 h-4 text-white" />
                 </div>
                 <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-[#0B132B] flex items-center justify-center text-white text-xs font-bold">You</div>
                   <div>
                     <div className="text-sm font-bold text-[#0B132B]">Your Clinic</div>
                     <div className="text-xs text-[#00B7A8]">Exclusive Profile</div>
                   </div>
                 </div>
                 <div className="h-8 bg-[#0B132B] rounded-lg w-full text-center text-white text-[10px] font-bold flex items-center justify-center uppercase tracking-wider">
                   Your Patients Only
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
