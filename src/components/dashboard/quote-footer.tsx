"use client";

import { useState, useEffect } from "react";
import { Quote } from "lucide-react";

const quotes = [
  "Wherever the art of Medicine is loved, there is also a love of Humanity. - Hippocrates",
  "The good physician treats the disease; the great physician treats the patient who has the disease. - William Osler",
  "Medicine cures diseases, but only doctors can cure patients. - Carl Jung",
  "People pay the doctor for his trouble; for his kindness they still remain in his debt. - Seneca",
  "The best doctor gives the least medicines. - Benjamin Franklin",
  "A smile is the best medicine, and a receptionist is the first one to prescribe it.",
  "Your care, empathy, and expertise change lives every single day.",
  "Healing is a matter of time, but it is sometimes also a matter of opportunity. - Hippocrates",
  "The first step to healing is feeling heard.",
  "Behind every great doctor is a great team making it happen."
];

export function QuoteFooter() {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Pick a random quote on mount so it differs per session/reload, but stable during navigation
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  if (!quote) return null;

  return (
    <div className="py-6 mt-8 border-t border-slate-200">
      <div className="flex items-center justify-center gap-2 text-slate-400">
        <Quote className="w-4 h-4 fill-slate-300 flex-shrink-0" />
        <p className="text-sm italic text-center max-w-2xl px-4 leading-relaxed">
          {quote}
        </p>
      </div>
    </div>
  );
}
