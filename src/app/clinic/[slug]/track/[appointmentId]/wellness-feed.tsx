"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, ChevronRight, ChevronLeft, Sun, Eye, Brain, Activity, Bone } from "lucide-react";

const TIPS = [
  {
    icon: Activity,
    title: "The 30-30-30 Rule",
    color: "#ef4444", // red
    text: "For better blood sugar control and weight management, try 30g of protein within 30 minutes of waking up, followed by 30 minutes of steady cardiovascular exercise."
  },
  {
    icon: Bone,
    title: "Why Joints Crack",
    color: "#0ea5e9", // sky
    text: "Hearing a 'pop' when you bend your knees? It's usually just nitrogen gas bubbles escaping from synovial fluid. Unless it's accompanied by pain or swelling, it's completely normal."
  },
  {
    icon: Sun,
    title: "Hidden Vitamin D",
    color: "#f59e0b", // amber
    text: "Just 15 minutes of direct morning sunlight on your arms and face can provide your daily Vitamin D requirement, improving bone density, mood, and sleep quality."
  },
  {
    icon: Eye,
    title: "The 20-20-20 Rule",
    color: "#10b981", // emerald
    text: "Prevent digital eye strain (a common cause of headaches): Every 20 minutes, look at something 20 feet away for 20 seconds. This relaxes the focusing muscles in your eyes."
  },
  {
    icon: Brain,
    title: "The Gut-Brain Link",
    color: "#8b5cf6", // violet
    text: "Over 90% of your body's serotonin (the 'happy hormone') is produced in your gut. A diet rich in fermented foods and fiber directly impacts your mood and cognitive focus."
  }
];

export function WellnessFeed({ themeColor }: { themeColor: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TIPS.length);
    }, 8000); // Auto-rotate every 8 seconds
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % TIPS.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + TIPS.length) % TIPS.length);

  const tip = TIPS[currentIndex];
  const Icon = tip.icon;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="flex items-center gap-2 mb-5">
        <HeartPulse className="w-4 h-4 text-slate-400" />
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Healthy Living</h3>
      </div>

      <div className="relative min-h-[140px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                style={{ backgroundColor: `${tip.color}15`, color: tip.color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-black text-slate-800">{tip.title}</h4>
            </div>
            
            <p className="text-[13px] text-slate-600 leading-relaxed pr-2">
              {tip.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
        <div className="flex gap-1.5">
          {TIPS.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-4" : "w-1.5 opacity-30"}`}
              style={{ backgroundColor: idx === currentIndex ? themeColor : "#94a3b8" }}
            />
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={handlePrev} className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={handleNext} className="w-7 h-7 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
