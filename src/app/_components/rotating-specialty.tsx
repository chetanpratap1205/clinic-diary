"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Psychiatry",
  "Dental",
  "General",
  "Orthopedic",
];

export function RotatingSpecialty() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) => (current + 1) % SPECIALTIES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative inline-flex items-center">
      {/* Invisible spacer to maintain stable width for left-aligned text */}
      <span className="invisible pointer-events-none" aria-hidden="true">
        Dermatology
      </span>
      
      <span className="absolute left-0 top-0 bottom-0 right-0 flex items-center overflow-visible">
        <AnimatePresence mode="wait">
          <motion.span
            key={SPECIALTIES[index]}
            initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute left-0 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 font-black"
          >
            {SPECIALTIES[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
