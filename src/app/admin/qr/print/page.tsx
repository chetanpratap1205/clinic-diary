import { db } from "@/db";
import { qrCodes } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "./print-button";
// PdfAutoDownloader removed — browser print (Ctrl+P → Save as PDF) is sufficient

export const dynamic = "force-dynamic";

// ─── Unified Modern Glass Icons (strokeWidth=2, same 20×20 viewport) ──────────
const IconScan = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="6" height="6" rx="1.5"/>
    <rect x="15" y="3" width="6" height="6" rx="1.5"/>
    <rect x="3" y="15" width="6" height="6" rx="1.5"/>
    <path d="M15 15h1.5M15 18h3M15 21h6M21 15v1.5M21 18v3"/>
    <path d="M12 3v3M12 9v3M3 12h3M9 12h3"/>
  </svg>
);
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9"/>
    <polyline points="12 7 12 12 16 14"/>
  </svg>
);
const IconTicket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <path d="M9 11h6M9 14h4"/>
  </svg>
);
const IconArrive = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"/>
  </svg>
);
const IconSmile = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9"/>
    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
    <circle cx="9" cy="9.5" r="0.7" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="9.5" r="0.7" fill="currentColor" stroke="none"/>
  </svg>
);
const IconPhone = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3"/>
  </svg>
);
const IconShield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconZap = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconNoApp = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/>
    <path d="M9 7h6M9 11h4"/>
    <circle cx="17" cy="17" r="5" fill="#064e3b" stroke="currentColor" strokeWidth="2"/>
    <path d="M14.5 14.5l5 5M19.5 14.5l-5 5" stroke="currentColor" strokeWidth="2"/>
  </svg>
);
// IconStar removed — auth label removed per user request

// ─── Hex color constants (avoids oklch inheritance from Tailwind v4) ──────────
// Emerald palette (hex only — no oklch)
const C = {
  em400: "#34d399", em300: "#6ee7b7", em500: "#10b981", em900: "#064e3b",
  tl400: "#2dd4bf",
  yw400: "#facc15", yw300: "#fde047", yw500: "#eab308",
  in300: "#a5b4fc", in400: "#818cf8", in500: "#6366f1", in900: "#1e1b4b",
} as const;

export default async function PrintQrPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; download?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.ids) redirect("/admin/qr");

  // Validate UUIDs to prevent Postgres crash on invalid input (like "YOUR_QR_ID")
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const idsArray = sp.ids.split(",").filter((id) => uuidRegex.test(id));
  
  if (idsArray.length === 0) {
    return <div style={{ color: "#7f1d1d", background: "#fef2f2", padding: "20px", margin: "20px", borderRadius: "8px", border: "1px solid #fecaca", fontFamily: "sans-serif" }}><strong>Error:</strong> Invalid QR IDs provided in the URL. Please use a valid database UUID.</div>;
  }

  const codes = await db
    .select({ id: qrCodes.id, code: qrCodes.code })
    .from(qrCodes)
    .where(inArray(qrCodes.id, idsArray))
    .orderBy(qrCodes.code);

  if (codes.length === 0) {
    return <div style={{ color: "#7f1d1d", background: "#fef2f2", padding: "20px", margin: "20px", borderRadius: "8px", border: "1px solid #fecaca", fontFamily: "sans-serif" }}><strong>Error:</strong> No QR codes found for the given IDs.</div>;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  const printItems = await Promise.all(
    codes.map(async (item) => {
      const url = `${baseUrl}/q/${item.code}`;
      const qrDataUri = await QRCode.toDataURL(url, {
        width: 1600,
        margin: 3,
        color: { dark: "#060606", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      return { ...item, url, qrDataUri };
    })
  );

  const hi = (s: string) => (
    <span style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}>{s}</span>
  );

  // ─── Step data: Inside card ───────────────────────────────────────────────
  const insideSteps = [
    { Icon: IconScan,    bg: "rgba(52,211,153,0.18)",  border: "rgba(52,211,153,0.35)",  color: C.em400,  accentBar: C.em400,  en: "Scan QR with camera",        hi: "QR स्कैन करें" },
    { Icon: IconClock,   bg: "rgba(234,179,8,0.18)",   border: "rgba(234,179,8,0.35)",   color: C.yw400,  accentBar: C.yw400,  en: "Choose your time slot",      hi: "समय चुनें" },
    { Icon: IconTicket,  bg: "rgba(45,212,191,0.18)",  border: "rgba(45,212,191,0.35)",  color: C.tl400,  accentBar: C.tl400,  en: "Get instant token number",   hi: "टोकन नंबर मिलेगा" },
    { Icon: IconArrive,  bg: "rgba(110,231,183,0.15)", border: "rgba(110,231,183,0.3)",  color: C.em300,  accentBar: C.em300,  en: "Arrive on time — no queue!", hi: "समय पर आएं — लाइन नहीं" },
  ];

  // ─── Step data: Outside card ──────────────────────────────────────────────
  const outsideSteps = [
    { Icon: IconScan,     bg: "rgba(165,180,252,0.18)", border: "rgba(165,180,252,0.35)", color: C.in300,  accentBar: C.in300,   en: "Scan QR with camera",            hi: "QR स्कैन करें" },
    { Icon: IconCalendar, bg: "rgba(234,179,8,0.18)",   border: "rgba(234,179,8,0.35)",   color: C.yw400,  accentBar: C.yw400,   en: "Pick date & time slot",          hi: "दिन और समय चुनें" },
    { Icon: IconTicket,   bg: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.32)",  color: "#38bdf8", accentBar: "#38bdf8", en: "Booking confirmed instantly",    hi: "बुकिंग पक्की हो जाएगी" },
    { Icon: IconSmile,    bg: "rgba(217,70,239,0.15)",  border: "rgba(217,70,239,0.3)",   color: "#e879f9", accentBar: "#e879f9", en: "Come on your day — no queues!", hi: "तय समय पर आएं — लाइन नहीं" },
  ];

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        /* ══════════════════════════════════════════════════════════
           RESET — scoped to .print-root so Tailwind oklch vars
           from globals.css cannot leak into this page's elements.
           All color values here are explicit hex / rgba — ZERO
           dependency on any CSS custom property from Tailwind v4.
        ══════════════════════════════════════════════════════════ */
        .print-root *, .print-root *::before, .print-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
        body { background: #0c0c0c; }

        @media print {
          @page { margin: 0; size: A4 portrait; }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: #ffffff !important;
          }
          .no-print { display: none !important; }
          .a4-wrap {
            margin: 10mm auto !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
          }
        }

        /* ─── A4 wrapper ─── */
        .a4-wrap {
          width: 190mm;
          height: 277mm;
          margin: 24px auto;
          display: flex;
          flex-direction: column;
          box-shadow: 0 40px 120px rgba(0,0,0,0.7);
          overflow: hidden;
          position: relative;
          background: #fff;
        }

        /* ─── Half card ─── */
        .half-card {
          width: 190mm;
          height: 138.5mm;
          min-height: 138.5mm;
          max-height: 138.5mm;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          flex-grow: 0;
        }

        /* ─── Gradients ─── */
        .grad-inside {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 65% 55% at 80% 45%, rgba(45,212,191,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 45% 80% at 8% 8%, rgba(6,78,59,0.92) 0%, transparent 50%),
            linear-gradient(145deg, #012918 0%, #022c1e 20%, #044032 40%, #065f46 65%, #059669 85%, #0d9488 100%);
        }
        .grad-outside {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 65% 55% at 80% 45%, rgba(99,102,241,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 45% 80% at 8% 8%, rgba(17,24,39,0.97) 0%, transparent 50%),
            linear-gradient(145deg, #05051a 0%, #0a083c 22%, #12107a 44%, #1e1b4b 66%, #312e81 85%, #3730a3 100%);
        }

        /* ─── Card content ─── */
        .card-content {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 5mm 7mm 4mm 7mm;
        }

        /* ─── Decorative SVG helper ─── */
        .deco { position: absolute; pointer-events: none; user-select: none; }

        /* ─── Ambient QR glow ─── */
        .qr-glow-inside {
          position: absolute; right: -10mm; top: 50%;
          transform: translateY(-50%);
          width: 68mm; height: 68mm;
          background: radial-gradient(ellipse, rgba(52,211,153,0.2) 0%, transparent 70%);
          z-index: 1; pointer-events: none;
        }
        .qr-glow-outside {
          position: absolute; right: -10mm; top: 50%;
          transform: translateY(-50%);
          width: 68mm; height: 68mm;
          background: radial-gradient(ellipse, rgba(99,102,241,0.25) 0%, transparent 70%);
          z-index: 1; pointer-events: none;
        }

        /* ════════════════════════════════════════════
           HEADER STRIP
        ════════════════════════════════════════════ */
        .header-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          margin-bottom: 3mm;
        }
        .brand-block { display: flex; align-items: center; gap: 10px; }
        .brand-logo {
          width: 36px; height: 36px;
          border-radius: 9px; overflow: hidden; flex-shrink: 0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 0 0 1.5px rgba(255,255,255,0.12);
        }
        .brand-logo img { width: 100%; height: 100%; display: block; object-fit: cover; }
        .brand-name {
          font-size: 19px; font-weight: 800;
          color: #fff; line-height: 1; letter-spacing: -0.5px;
        }
        .brand-tagline {
          font-size: 10px; font-weight: 500;
          color: rgba(255,255,255,0.5); margin-top: 1px; letter-spacing: 0.3px;
        }
        .header-badge {
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase; white-space: nowrap;
        }
        .header-badge-inside {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          color: #6ee7b7;
        }
        .header-badge-outside {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          color: #a5b4fc;
        }

        /* ════════════════════════════════════════════
           MAIN BODY — Left 47%, Arrow 6%, Right 47%
        ════════════════════════════════════════════ */
        .main-body {
          flex: 1;
          display: flex;
          flex-direction: row;
          align-items: stretch;
          min-height: 0;
          overflow: hidden;
          gap: 0;
          position: relative;
        }

        /* ─── LEFT COLUMN ─── */
        .left-col {
          width: 47%;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-right: 3mm;
        }

        /* Benefit pill */
        .benefit-pill {
          display: inline-flex; align-items: center; gap: 5px;
          border-radius: 99px; padding: 3px 10px;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.5px; text-transform: uppercase;
          margin-bottom: 5px; width: fit-content;
        }
        .benefit-pill-inside {
          background: rgba(234,179,8,0.2);
          border: 1.5px solid rgba(234,179,8,0.5);
          color: #fde047;
        }
        .benefit-pill-outside {
          background: rgba(165,180,252,0.15);
          border: 1.5px solid rgba(165,180,252,0.4);
          color: #a5b4fc;
        }

        /* Headline */
        .headline-primary {
          font-size: 27px; font-weight: 900;
          color: #ffffff; line-height: 1.05;
          letter-spacing: -0.8px; margin-bottom: 3px;
        }
        .headline-accent-inside { color: #34d399; }
        .headline-accent-outside { color: #a5b4fc; }

        /* Hindi headline */
        .headline-hindi {
          font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
          font-weight: 700; font-size: 14.5px;
          line-height: 1.55; letter-spacing: 0.2px;
          color: rgba(255,255,255,0.72);
          margin-bottom: 6px;
        }

        /* Flow label */
        .flow-label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          color: rgba(255,255,255,0.38);
          margin-bottom: 5px;
          display: flex; align-items: center; gap: 5px;
        }
        .flow-label::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(255,255,255,0.13);
        }

        /* ─── STEPS ─── */
        .steps { display: flex; flex-direction: column; gap: 4px; }
        .step-row {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 8px; border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.09);
          position: relative; overflow: hidden;
        }
        /* Left accent bar — rendered as a real <div> child (avoids CSS custom property) */
        .step-accent-bar {
          position: absolute;
          left: 0; top: 0; bottom: 0; width: 2.5px;
          border-radius: 10px 0 0 10px;
        }
        .step-badge {
          width: 24px; height: 24px; border-radius: 50%;
          font-size: 12px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .step-badge-inside { background: #34d399; color: #064e3b; box-shadow: 0 2px 8px rgba(52,211,153,0.4); }
        .step-badge-outside { background: #818cf8; color: #fff; box-shadow: 0 2px 8px rgba(129,140,248,0.4); }
        .step-icon-wrap {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .step-text-block { flex: 1; min-width: 0; }
        .step-en {
          font-size: 12px; font-weight: 700;
          color: #ffffff; line-height: 1.2;
        }
        .step-hi {
          font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.52);
          line-height: 1.5; letter-spacing: 0.1px;
        }

        /* ─── ARROW CUE (between left and right) ─── */
        .arrow-cue-col {
          width: 6%;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          opacity: 0.6;
          z-index: 6;
        }
        .arrow-cue-label {
          font-size: 7px; font-weight: 800;
          letter-spacing: 2px; text-transform: uppercase;
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          color: rgba(255,255,255,0.45);
        }
        .arrow-cue-line {
          width: 1px; height: 22px;
          background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.45));
        }

        /* ─── RIGHT COLUMN: QR hero ─── */
        .right-col {
          width: 47%;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          z-index: 6;
        }

        /* CTA Banner — yellow for Inside */
        .cta-banner-inside {
          width: 100%;
          background: linear-gradient(90deg, #eab308 0%, #facc15 50%, #fde047 100%);
          border-radius: 12px 12px 0 0;
          padding: 7px 16px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 -4px 24px rgba(234,179,8,0.4);
        }
        .cta-banner-inside-text {
          font-size: 14px; font-weight: 900;
          color: #422006; letter-spacing: 1.5px; text-transform: uppercase;
        }
        /* CTA Banner — indigo for Outside */
        .cta-banner-outside {
          width: 100%;
          background: linear-gradient(90deg, #312e81 0%, #4338ca 50%, #6366f1 100%);
          border: 2px solid rgba(165,180,252,0.4); border-bottom: none;
          border-radius: 12px 12px 0 0;
          padding: 7px 16px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 -4px 24px rgba(99,102,241,0.35);
        }
        .cta-banner-outside-text {
          font-size: 14px; font-weight: 900;
          color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase;
        }

        /* Floating QR Card */
        .qr-card {
          width: 100%; background: #ffffff;
          border-radius: 0 0 16px 16px;
          padding: 10px 10px 8px 10px;
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .qr-card-inside {
          box-shadow:
            0 8px 32px rgba(0,0,0,0.3),
            0 0 0 3px rgba(52,211,153,0.5),
            0 0 60px rgba(52,211,153,0.25);
        }
        .qr-card-outside {
          box-shadow:
            0 8px 32px rgba(0,0,0,0.4),
            0 0 0 3px rgba(129,140,248,0.5),
            0 0 60px rgba(99,102,241,0.25);
        }
        .qr-image-wrap {
          width: 100%; border-radius: 8px;
          overflow: hidden; position: relative;
        }
        .qr-image-wrap img {
          display: block; image-rendering: pixelated;
          width: 100%; height: auto;
        }
        /* Corner accent marks */
        .qr-corner { position: absolute; width: 14px; height: 14px; border-style: solid; }
        .qr-corner-tl-i { top: 4px; left: 4px;    border-width: 3px 0 0 3px; border-color: #10b981; }
        .qr-corner-tr-i { top: 4px; right: 4px;   border-width: 3px 3px 0 0; border-color: #10b981; }
        .qr-corner-bl-i { bottom: 4px; left: 4px; border-width: 0 0 3px 3px; border-color: #10b981; }
        .qr-corner-br-i { bottom: 4px; right: 4px;border-width: 0 3px 3px 0; border-color: #10b981; }
        .qr-corner-tl-o { top: 4px; left: 4px;    border-width: 3px 0 0 3px; border-color: #6366f1; }
        .qr-corner-tr-o { top: 4px; right: 4px;   border-width: 3px 3px 0 0; border-color: #6366f1; }
        .qr-corner-bl-o { bottom: 4px; left: 4px; border-width: 0 0 3px 3px; border-color: #6366f1; }
        .qr-corner-br-o { bottom: 4px; right: 4px;border-width: 0 3px 3px 0; border-color: #6366f1; }
        .qr-camera-hint {
          font-size: 9px; font-weight: 600; color: #64748b;
          display: flex; align-items: center; gap: 4px; margin-top: 0;
        }
        /* qr-auth-label removed */

        /* ════════════════════════════════════════════
           BOTTOM SECTION
        ════════════════════════════════════════════ */
        .bottom-section {
          flex-shrink: 0;
          margin-top: 2mm;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 4mm;
        }

        /* Trust chips */
        .trust-strip { display: flex; align-items: center; gap: 8px; flex: 1; flex-wrap: wrap; }
        .trust-chip {
          display: flex; align-items: center; gap: 4px;
          font-size: 9px; font-weight: 700;
          color: rgba(255,255,255,0.62);
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; padding: 3px 8px;
          white-space: nowrap;
        }
        .trust-chip-i svg { color: #34d399; }
        .trust-chip-o svg { color: #a5b4fc; }
        .code-watermark {
          font-size: 9px; font-weight: 700;
          letter-spacing: 2px; color: rgba(255,255,255,0.18);
          white-space: nowrap; flex-shrink: 0;
        }

        /* ─── BLANK WRITE BOX ─── */
        /* Plain empty space — doctor writes clinic details by hand */
        .blank-box {
          flex-shrink: 0;
          background: rgba(255,255,255,0.07);
          border: 1.5px dashed rgba(255,255,255,0.2);
          border-radius: 10px;
          min-width: 52mm;
          max-width: 58mm;
          height: 28px;
        }

        /* ─── CUT DIVIDER ─── */
        .cut-divider {
          height: 0;
          border-top: 2px dashed rgba(160,160,160,0.45);
          position: relative; flex-shrink: 0; z-index: 20;
        }
        .cut-label {
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          background: #fff; padding: 2px 16px;
          font-size: 9px; font-weight: 700;
          color: #94a3b8; white-space: nowrap;
          letter-spacing: 0.5px; border-radius: 10px;
          border: 1px solid #e2e8f0;
        }
      ` }} />

      {/* ══ ADMIN HEADER (no-print) ══════════════════════════════════ */}
      <div className="no-print" style={{
        background: "linear-gradient(135deg,#012918,#022c1e,#064e3b)",
        borderBottom: "1px solid rgba(52,211,153,0.15)",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="DD" style={{ width: 46, height: 46, borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.5), 0 0 0 2px rgba(52,211,153,0.3)" }} />
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 20, color: "#fff", letterSpacing: "-0.5px" }}>
              Doctor Diary — QR Poster Print
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              Ctrl+P → Paper: <strong style={{color:"rgba(255,255,255,0.7)"}}>A4</strong> → Margins: <strong style={{color:"rgba(255,255,255,0.7)"}}>None</strong> → ✅ Background Graphics <strong style={{color:"#34d399"}}>ON</strong>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <PrintButton />
        </div>
      </div>

      {/* ══ PRINT TIPS (no-print) ════════════════════════════════════ */}
      <div className="no-print" style={{
        maxWidth: 780, margin: "20px auto 12px",
        background: "rgba(52,211,153,0.07)", border: "1.5px solid rgba(52,211,153,0.22)",
        borderRadius: 14, padding: "14px 24px",
        fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6ee7b7",
        textAlign: "center", lineHeight: 1.65,
      }}>
        🟢 <strong>Top card</strong> — place <strong>inside</strong> the clinic (when open).&nbsp;&nbsp;
        🔵 <strong>Bottom card</strong> — place <strong>on door</strong> (when clinic is closed).
        <br />
        <span style={{ color: "rgba(110,231,183,0.5)", fontSize: 11 }}>
          The blank box at the bottom is for writing clinic details by hand after printing.
        </span>
      </div>

      {/* ══ PAGES ════════════════════════════════════════════════════ */}
      <div className="print-root">
        {printItems.map((item) => (
          <div key={item.id} className="a4-wrap">

            {/* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
                CARD 1 — INSIDE (Emerald)
            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */}
            <div className="half-card">
              <div className="grad-inside" />

              {/* Decorative: medical cross top-right only */}
              <svg className="deco" style={{ top: 0, right: 0, width: "44mm", height: "44mm", opacity: 0.04 }} viewBox="0 0 200 200">
                <rect x="78" y="0" width="44" height="200" rx="10" fill="white"/>
                <rect x="0" y="78" width="200" height="44" rx="10" fill="white"/>
              </svg>
              {/* Decorative: ring arc bottom-left only */}
              <svg className="deco" style={{ bottom: "-14mm", left: "-10mm", width: "46mm", height: "46mm", opacity: 0.05 }} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="white" strokeWidth="14"/>
                <circle cx="100" cy="100" r="55" fill="none" stroke="white" strokeWidth="8"/>
              </svg>
              {/* Ambient QR glow */}
              <div className="qr-glow-inside" />

              <div className="card-content">
                {/* HEADER */}
                <div className="header-strip">
                  <div className="brand-block">
                    <div className="brand-logo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icon-192.png" alt="Doctor Diary" />
                    </div>
                    <div>
                      <div className="brand-name">Doctor Diary</div>
                      <div className="brand-tagline">by NatureXpress · Skip the Queue</div>
                    </div>
                  </div>
                  <div className="header-badge header-badge-inside">🔴 Clinic Open</div>
                </div>

                {/* MAIN BODY */}
                <div className="main-body">
                  {/* LEFT */}
                  <div className="left-col">
                    <div className="benefit-pill benefit-pill-inside">⏱ Save 30–60 Min Waiting</div>
                    <div className="headline-primary">
                      BOOK YOUR<br />
                      <span className="headline-accent-inside">TOKEN</span>
                    </div>
                    <div className="headline-hindi">{hi("टोकन बुक करें — लाइन छोड़ें")}</div>
                    <div className="flow-label">How it works</div>
                    <div className="steps">
                      {insideSteps.map(({ Icon, bg, border, color, accentBar, en, hi: hiText }, i) => (
                        <div className="step-row" key={i}>
                          <div className="step-accent-bar" style={{ background: accentBar }} />
                          <div className="step-badge step-badge-inside">{i + 1}</div>
                          <div className="step-icon-wrap" style={{ background: bg, border: `1.5px solid ${border}`, color }}>
                            <Icon />
                          </div>
                          <div className="step-text-block">
                            <div className="step-en">{en}</div>
                            <div className="step-hi">{hi(hiText)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ARROW CUE */}
                  <div className="arrow-cue-col">
                    <div className="arrow-cue-label">Scan</div>
                    <div className="arrow-cue-line" />
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {/* RIGHT — QR HERO */}
                  <div className="right-col">
                    {/* CTA Banner */}
                    <div className="cta-banner-inside">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#422006" strokeWidth="2.5" strokeLinecap="round">
                        <rect x="5" y="2" width="14" height="20" rx="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="4"/>
                      </svg>
                      <span className="cta-banner-inside-text">📱 Scan Here</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#422006" strokeWidth="2.5" strokeLinecap="round">
                        <rect x="5" y="2" width="14" height="20" rx="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="4"/>
                      </svg>
                    </div>

                    {/* Floating QR Card */}
                    <div className="qr-card qr-card-inside">
                      <div className="qr-image-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.qrDataUri} alt="Scan to book your token" />
                        <div className="qr-corner qr-corner-tl-i" />
                        <div className="qr-corner qr-corner-tr-i" />
                        <div className="qr-corner qr-corner-bl-i" />
                        <div className="qr-corner qr-corner-br-i" />
                      </div>
                      <div className="qr-camera-hint">
                        <IconPhone />
                        Any phone camera &nbsp;•&nbsp; {hi("किसी भी कैमरे से")}
                      </div>
                    </div>

                    {/* Auth label removed — was overlapping */}
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="bottom-section">
                  {/* Trust badges */}
                  <div className="trust-strip">
                    <div className="trust-chip trust-chip-i"><IconShield /> Free</div>
                    <div className="trust-chip trust-chip-i"><IconNoApp /> No App</div>
                    <div className="trust-chip trust-chip-i"><IconZap /> Instant Token</div>
                    <div className="code-watermark">#{item.code}</div>
                  </div>

                  {/* Blank box — doctor handwrites clinic details after printing */}
                  <div className="blank-box" />
                </div>
              </div>
            </div>

            {/* ── CUT DIVIDER ─────────────────────────────── */}
            <div className="cut-divider">
              <div className="cut-label">✂ &nbsp;Cut here &nbsp;/&nbsp; {hi("यहाँ काटें")}</div>
            </div>

            {/* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
                CARD 2 — OUTSIDE (Indigo)
            ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */}
            <div className="half-card">
              <div className="grad-outside" />

              {/* Decorative: crescent top-right */}
              <svg className="deco" style={{ top: "-4mm", right: "-4mm", width: "40mm", height: "36mm", opacity: 0.07 }} viewBox="0 0 160 145">
                <circle cx="105" cy="58" r="44" fill="none" stroke="white" strokeWidth="12"/>
                <circle cx="126" cy="37" r="30" fill="#05051a"/>
                <circle cx="20" cy="15" r="3.5" fill="white"/>
                <circle cx="45" cy="7" r="2.5" fill="white"/>
                <circle cx="10" cy="46" r="3" fill="white"/>
              </svg>
              {/* Decorative: ring arc bottom-left */}
              <svg className="deco" style={{ bottom: "-14mm", left: "-10mm", width: "46mm", height: "46mm", opacity: 0.05 }} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="white" strokeWidth="14"/>
                <circle cx="100" cy="100" r="55" fill="none" stroke="white" strokeWidth="8"/>
              </svg>
              {/* Ambient glow */}
              <div className="qr-glow-outside" />

              <div className="card-content">
                {/* HEADER */}
                <div className="header-strip">
                  <div className="brand-block">
                    <div className="brand-logo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icon-192.png" alt="Doctor Diary" />
                    </div>
                    <div>
                      <div className="brand-name">Doctor Diary</div>
                      <div className="brand-tagline">by NatureXpress · Skip the Queue</div>
                    </div>
                  </div>
                  <div className="header-badge header-badge-outside">🔵 Book Next Visit</div>
                </div>

                {/* MAIN BODY */}
                <div className="main-body">
                  {/* LEFT */}
                  <div className="left-col">
                    <div className="benefit-pill benefit-pill-outside">✨ Your Time Matters</div>
                    <div className="headline-primary">
                      CLINIC CLOSED?<br />
                      <span className="headline-accent-outside">Book Online</span>
                    </div>
                    <div className="headline-hindi">{hi("ऑनलाइन बुकिंग — अगला दिन")}</div>
                    <div className="flow-label">How it works</div>
                    <div className="steps">
                      {outsideSteps.map(({ Icon, bg, border, color, accentBar, en, hi: hiText }, i) => (
                        <div className="step-row" key={i}>
                          <div className="step-accent-bar" style={{ background: accentBar }} />
                          <div className="step-badge step-badge-outside">{i + 1}</div>
                          <div className="step-icon-wrap" style={{ background: bg, border: `1.5px solid ${border}`, color }}>
                            <Icon />
                          </div>
                          <div className="step-text-block">
                            <div className="step-en">{en}</div>
                            <div className="step-hi">{hi(hiText)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ARROW CUE */}
                  <div className="arrow-cue-col">
                    <div className="arrow-cue-label">Scan</div>
                    <div className="arrow-cue-line" />
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                      <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.45)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {/* RIGHT — QR HERO */}
                  <div className="right-col">
                    {/* CTA Banner */}
                    <div className="cta-banner-outside">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e0e7ff" strokeWidth="2.5" strokeLinecap="round">
                        <rect x="5" y="2" width="14" height="20" rx="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="4"/>
                      </svg>
                      <span className="cta-banner-outside-text">👇 Scan to Book</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e0e7ff" strokeWidth="2.5" strokeLinecap="round">
                        <rect x="5" y="2" width="14" height="20" rx="2"/>
                        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="4"/>
                      </svg>
                    </div>

                    {/* Floating QR Card */}
                    <div className="qr-card qr-card-outside">
                      <div className="qr-image-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.qrDataUri} alt="Scan to book your next visit" />
                        <div className="qr-corner qr-corner-tl-o" />
                        <div className="qr-corner qr-corner-tr-o" />
                        <div className="qr-corner qr-corner-bl-o" />
                        <div className="qr-corner qr-corner-br-o" />
                      </div>
                      <div className="qr-camera-hint">
                        <IconPhone />
                        Any phone camera &nbsp;•&nbsp; {hi("किसी भी कैमरे से")}
                      </div>
                    </div>

                    {/* Auth label removed — was overlapping */}
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="bottom-section">
                  <div className="trust-strip">
                    <div className="trust-chip trust-chip-o"><IconShield /> Free</div>
                    <div className="trust-chip trust-chip-o"><IconNoApp /> No App</div>
                    <div className="trust-chip trust-chip-o"><IconZap /> Instant Token</div>
                    <div className="code-watermark">#{item.code}</div>
                  </div>

                  {/* Blank box — doctor handwrites clinic details after printing */}
                  <div className="blank-box" />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </>
  );
}
