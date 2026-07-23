"use client";

import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
    >
      <Download className="w-4 h-4" /> Download PDF
    </button>
  );
}
