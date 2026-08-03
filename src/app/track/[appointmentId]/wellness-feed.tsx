"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Droplets, Moon, Apple, Smile, ChevronRight, ChevronLeft } from "lucide-react";

const TIPS = [
  {
    icon: Droplets,
    title: "Stay Hydrated",
    color: "#0ea5e9", // sky
    text: "Drinking enough water each day is crucial for many reasons: to regulate body temperature, keep joints lubricated, prevent infections, and deliver nutrients to cells. Aim for 8 glasses a day."
  },
  {
    icon: Moon,
    title: "Quality Sleep",
    color: "#8b5cf6", // violet
    text: "Good sleep is one of the pillars of health. Getting 7-8 hours of quality sleep improves brain performance, mood, and health. Try to maintain a consistent sleep schedule."
  },
  {
    icon: Apple,
    title: "Eat the Rainbow",
    color: "#ef4444", // red
    text: "A diet rich in fruits and vegetables can lower blood pressure, reduce risk of heart disease and stroke, and prevent some types of cancer. Add color to your plate!"
  },
  {
    icon: Smile,
    title: "Manage Stress",
    color: "#f59e0b", // amber
    text: "Chronic stress puts your health at risk. Practice deep breathing, meditation, or yoga. Taking just 5 minutes a day to close your eyes and focus on your breath can make a huge difference."
  },
  {
    icon: HeartPulse,
    title: "Daily Movement",
    color: "#10b981", // emerald
    text: "You don't need intense workouts to be healthy. Brisk walking, stretching, or gardening for 30 minutes a day boosts cardiovascular health and mental well-being."
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
