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

      // Allow fonts and images to fully render before capture
      await new Promise(r => setTimeout(r, 1200));

      const elements = document.querySelectorAll('.a4-wrap');
      if (elements.length === 0) return;

      const pdf = new jsPDF('p', 'mm', 'a4');

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const canvas = await html2canvas(el, {
          scale: 3,          // High resolution: 3x for sharp print output
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.97);

        if (i > 0) {
          pdf.addPage();
        }

        // A4 = 210×297mm, poster = 190×277mm with 10mm margins
        pdf.addImage(imgData, 'JPEG', 10, 10, 190, 277);
      }

      pdf.save(`doctor-diary-qr-${code || 'batch'}.pdf`);
      setStatus("done");

      if (isAutoDownload) {
        setTimeout(() => window.close(), 3000);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      setStatus("idle");
    }
  };

  if (!isAutoDownload && status === "idle") {
    return (
      <button
        onClick={generatePdf}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(99,102,241,0.15)",
          border: "1.5px solid rgba(165,180,252,0.35)",
          color: "#a5b4fc",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700, fontSize: 13,
          padding: "9px 18px", borderRadius: 12,
          cursor: "pointer", letterSpacing: "0.2px",
          transition: "all 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        <Download style={{ width: 15, height: 15 }} />
        Save as PDF
      </button>
    );
  }

  if (status === "generating") {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "rgba(52,211,153,0.08)",
        border: "1.5px solid rgba(52,211,153,0.25)",
        color: "#6ee7b7",
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600, fontSize: 13,
        padding: "9px 18px", borderRadius: 12,
        whiteSpace: "nowrap",
      }}>
        {/* Simple pulsing dot — no spinning circle */}
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: "#34d399",
          animation: "pulse 1.2s ease-in-out infinite",
        }} />
        Preparing PDF...
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(0.75); }
          }
        `}} />
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      background: "rgba(52,211,153,0.1)",
      border: "1.5px solid rgba(52,211,153,0.3)",
      color: "#34d399",
      fontFamily: "'Inter', sans-serif",
      fontWeight: 700, fontSize: 13,
      padding: "9px 18px", borderRadius: 12,
      whiteSpace: "nowrap",
    }}>
      <CheckCircle2 style={{ width: 15, height: 15, color: "#34d399" }} />
      PDF ready — check Downloads
    </div>
  );
}
