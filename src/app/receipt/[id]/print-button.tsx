"use client";

import { Download, Printer } from "lucide-react";

export function PrintButton({ appointmentId }: { appointmentId?: string }) {
  return (
    <div className="flex items-center gap-2">
      {appointmentId && (
        <a 
          href={`/api/appointments/${appointmentId}/pdf`}
          download
          className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
        >
          <Download className="w-3.5 h-3.5" /> Official PDF
        </a>
      )}
      <button 
        onClick={() => window.print()}
        className="text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
      >
        <Printer className="w-3.5 h-3.5" /> Print
      </button>
    </div>
  );
}
