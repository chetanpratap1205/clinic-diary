"use client";

import { useEffect, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, CheckCircle2 } from "lucide-react";

export function PdfAutoDownloader({ code, isAutoDownload }: { code?: string, isAutoDownload: boolean }) {
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");

  useEffect(() => {
    if (isAutoDownload && status === "idle") {
      generatePdf();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoDownload, status]);

  const generatePdf = async () => {
    try {
      setStatus("generating");
      
      // Wait for fonts/images to fully load
      await new Promise(r => setTimeout(r, 1000));
      
      const elements = document.querySelectorAll('.a4-wrap');
      if (elements.length === 0) return;

      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const canvas = await html2canvas(el, {
          scale: 2, // High resolution
          useCORS: true,
          backgroundColor: "#ffffff"
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        // A4 size is 210x297mm
        // The element has a 10mm margin, so we offset by 10mm to match the design
        pdf.addImage(imgData, 'JPEG', 10, 10, 190, 277);
      }
      
      pdf.save(`clinic-qr-${code || 'batch'}.pdf`);
      setStatus("done");
      
      // Close tab after a short delay if it was auto-opened
      if (isAutoDownload) {
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      setStatus("idle");
    }
  };

  if (!isAutoDownload && status === "idle") {
    return (
      <button 
        onClick={generatePdf}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all active:scale-95 text-sm"
      >
        <Download className="w-4 h-4" />
        Save as High-Res PDF
      </button>
    );
  }

  if (status === "generating") {
    return (
      <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold py-2.5 px-4 rounded-xl text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
        Generating Wow-Factor PDF...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold py-2.5 px-4 rounded-xl text-sm">
      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      PDF Downloaded successfully!
    </div>
  );
}
