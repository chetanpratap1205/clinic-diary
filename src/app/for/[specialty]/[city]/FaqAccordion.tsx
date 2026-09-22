"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="bg-[#F8FAFC] border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-emerald-300"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
            >
              <span className="text-[#0B132B] font-bold text-sm sm:text-base leading-snug">
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 text-[#00B7A8] transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <p className="px-6 pb-6 text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
