"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Star, Shield, Users, Award, Zap } from "lucide-react";

const CLINICS = [
  "Dr. Sharma Skin Clinic", "Apex Dental Center", "City Heart Institute", 
  "Radiance Aesthetics", "Kids Care Clinic", "Vision Eye Care", 
  "Sanjivani Hospital", "Elite Physiotherapy", "Metro Polyclinic",
  "Dr. Gupta's Ortho Care", "Lifeline Diagnostics", "CureWell Homeopathy",
  "Prime Care Dental", "Aura Skin & Hair", "Genesis IVF Center",
  "Nidaan Clinic", "Harmony Mind Care", "Smile Align Dental"
];

const LOCATIONS = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", 
  "Ahmedabad", "Chennai", "Kolkata", "Surat", "Jaipur",
  "Lucknow", "Chandigarh", "Indore", "Gurgaon", "Noida"
];

const ACTIONS = [
  { text: "just upgraded to the Annual Enterprise Plan", icon: Award, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { text: "reduced patient no-shows to near zero", icon: Shield, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { text: "launched their premium digital front-desk", icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
  { text: "acquired 45+ new patients via QR storefront", icon: Users, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { text: "recovered ₹30,000+ in previously lost revenue", icon: TrendingUp, color: "text-teal-400", bg: "bg-teal-500/10" },
  { text: "secured their exclusive area availability", icon: Zap, color: "text-rose-400", bg: "bg-rose-500/10" }
];

export function SocialProofPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<{
    clinic: string;
    location: string;
    action: typeof ACTIONS[0];
    timeAgo: string;
  } | null>(null);

  useEffect(() => {
    // Initial delay before first popup
    const initialTimer = setTimeout(() => {
      triggerNextPopup();
    }, 4000);

    return () => clearTimeout(initialTimer);
  }, []);

  const triggerNextPopup = () => {
    const randomClinic = CLINICS[Math.floor(Math.random() * CLINICS.length)];
    const randomLocation = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const randomAction = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
    const randomTime = Math.floor(Math.random() * 59) + 1; // 1 to 59 mins ago

    setCurrentNotification({
      clinic: randomClinic,
      location: randomLocation,
      action: randomAction,
      timeAgo: `${randomTime} min ago`
    });

    setIsVisible(true);

    // Hide after 6 seconds
    setTimeout(() => {
      setIsVisible(false);
      
      // Schedule next one (random delay between 8 and 24 seconds)
      const nextDelay = Math.floor(Math.random() * 16000) + 8000;
      setTimeout(() => {
        triggerNextPopup();
      }, nextDelay);
      
    }, 6000);
  };

  return (
    <AnimatePresence>
      {isVisible && currentNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 w-72 sm:w-80 bg-[#0f0f0f]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-none"
        >
          {/* Shimmer effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          
          <div className="p-4 flex gap-4 items-start">
            <div className={`mt-1 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-white/5 ${currentNotification.action.bg}`}>
              <currentNotification.action.icon className={`w-5 h-5 ${currentNotification.action.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <p className="text-sm font-bold text-white truncate pr-2">
                  {currentNotification.clinic}
                </p>
                <span className="text-[10px] text-slate-500 whitespace-nowrap pt-0.5">
                  {currentNotification.timeAgo}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-1 leading-snug">
                {currentNotification.action.text}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  Verified • {currentNotification.location}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
