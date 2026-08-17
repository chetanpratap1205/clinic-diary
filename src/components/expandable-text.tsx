"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableTextProps {
  children: React.ReactNode;
  themeColor?: string;
  readMoreText?: string;
  readLessText?: string;
}

export function ExpandableText({ 
  children, 
  themeColor = "#0ea5e9",
  readMoreText = "Read More",
  readLessText = "Read Less"
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <div className={`prose prose-sm sm:prose-base text-slate-600 font-medium leading-relaxed transition-all duration-300 ${isExpanded ? "" : "line-clamp-3"}`}>
        {children}
      </div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 text-sm font-extrabold transition-opacity hover:opacity-80 active:scale-95 text-[#0f766e]"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <>
            {readLessText} <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            {readMoreText} <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
