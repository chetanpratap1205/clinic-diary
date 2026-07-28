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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden transition-all"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-slate-800 text-sm sm:text-base hover:bg-slate-50/60 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 flex-shrink-0" style={{ color: themeColor }} />
                {faq.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ${
                  isOpen ? "rotate-180 text-teal-600" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50/40">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
