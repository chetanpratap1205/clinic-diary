"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  themeColor: string;
}

export function FAQAccordion({ faqs, themeColor }: FAQAccordionProps) {
  // Pre-expand first question, allow multi-expand or toggle
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndexes.includes(idx);
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggleIndex(idx)}
              aria-expanded={isOpen}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-800 text-sm sm:text-base hover:bg-slate-50/60 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 flex-shrink-0" style={{ color: themeColor }} />
                <span>{faq.question}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                  isOpen ? "rotate-180 text-teal-600" : ""
                }`}
              />
            </button>

            {/* Answer is always in DOM for SEO crawlers, toggled with display/max-height animation */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/40">
                {faq.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

