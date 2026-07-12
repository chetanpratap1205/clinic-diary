import { db } from "@/db";
import { qrCodes } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const IconScan = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
    <rect x="3" y="16" width="5" height="5" rx="1"/><line x1="16" y1="16" x2="21" y2="16"/>
    <line x1="16" y1="19" x2="21" y2="19"/><line x1="16" y1="22" x2="21" y2="22"/>
    <line x1="13" y1="3" x2="13" y2="8"/><line x1="13" y1="13" x2="13" y2="16"/>
    <line x1="3" y1="13" x2="8" y2="13"/>
  </svg>
);
const IconClock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>
  </svg>
);
const IconTicket = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
  </svg>
);
const IconCheck = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconSmile = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconZap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconHeart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

export default async function PrintQrPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.ids) redirect("/admin/qr");

  const idsArray = sp.ids.split(",");
  const codes = await db
    .select({ id: qrCodes.id, code: qrCodes.code })
    .from(qrCodes)
    .where(inArray(qrCodes.id, idsArray))
    .orderBy(qrCodes.code);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  const printItems = await Promise.all(
    codes.map(async (item) => {
      const url = `${baseUrl}/q/${item.code}`;
      const qrDataUri = await QRCode.toDataURL(url, {
        width: 1400, // Even higher resolution
        margin: 1,
        color: { dark: "#080808", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      return { ...item, url, qrDataUri };
    })
  );

  const hi = (s: string) => (
    <span style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}>{s}</span>
  );

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@400;500;600;700;800;900&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0f172a; font-family: 'Poppins', Arial, sans-serif; }

        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background: #ffffff !important; 
          }
          .no-print { display: none !important; }
          .a4-wrap { 
            margin: 10mm auto !important; /* 10mm safe zone hardware margin */
            box-shadow: none !important; 
            page-break-after: always; 
            break-after: page; 
          }
        }

        /* ─── A4 wrapper: 190×277mm (A4 minus 20mm safe borders) ─── */
        .a4-wrap {
          width: 190mm;
          height: 277mm;
          margin: 24px auto;
          display: flex;
          flex-direction: column;
          box-shadow: 0 30px 90px rgba(0,0,0,0.6);
          overflow: hidden;
          position: relative;
          background: #fff; /* Ensure it cuts off nicely against white */
        }

        /* ─── Each card: exactly half of wrapped A4 = 138.5mm tall ─── */
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

        /* ─── Full-bleed gradient layers ─── */
        .grad-open {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 70% at 75% 50%, rgba(6,214,160,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 50% 90% at 5% 10%, rgba(2,44,34,0.9) 0%, transparent 55%),
            linear-gradient(140deg, #011a12 0%, #022c22 25%, #053d2d 50%, #065f46 75%, #047857 100%);
        }
        .grad-closed {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 70% at 75% 55%, rgba(139,92,246,0.22) 0%, transparent 65%),
            radial-gradient(ellipse 50% 90% at 5% 10%, rgba(9,9,40,0.95) 0%, transparent 55%),
            linear-gradient(140deg, #07052a 0%, #0d0b3d 25%, #1a1551 50%, #27239a 75%, #3730a3 100%);
        }

        /* ─── Content layer sits above gradients ─── */
        .card-content {
          position: relative;
          z-index: 5;
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 6mm 10mm; /* Increased padding */
        }

        /* ─── TOP NAV BAR ─── */
        .nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          margin-bottom: 5mm;
        }
        .brand-block {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.4);
        }
        .brand-logo img { width: 100%; height: 100%; display: block; object-fit: cover; }
        .brand-title {
          font-family: 'Poppins', sans-serif;
          font-weight: 900;
          font-size: 24px;
          color: #fff;
          line-height: 1;
          letter-spacing: -0.5px;
        }
        .brand-sub {
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255,255,255,0.6);
          margin-top: 4px;
        }

        /* Status badges */
        .badge-open {
          display: flex; align-items: center; gap: 10px;
          background: rgba(52,211,153,0.15);
          border: 2px solid rgba(52,211,153,0.55);
          border-radius: 99px;
          padding: 8px 20px 8px 16px;
        }
        .dot-open {
          width: 14px; height: 14px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.35), 0 0 12px rgba(52,211,153,0.6);
          flex-shrink: 0;
        }
        .badge-open-text {
          font-family: 'Poppins', sans-serif;
          font-size: 14px; font-weight: 800;
          color: #6ee7b7; letter-spacing: 1px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .badge-closed {
          display: flex; align-items: center; gap: 10px;
          background: rgba(167,139,250,0.15);
          border: 2px solid rgba(167,139,250,0.5);
          border-radius: 99px;
          padding: 8px 20px 8px 16px;
        }
        .badge-closed-text {
          font-family: 'Poppins', sans-serif;
          font-size: 14px; font-weight: 800;
          color: #c4b5fd; letter-spacing: 1px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* ─── MAIN ROW (left text + right QR) ─── */
        .main-row {
          flex: 1;
          display: flex;
          flex-direction: row;
          align-items: stretch;
          gap: 10mm;
          min-height: 0;
          overflow: hidden;
        }

        /* LEFT TEXT ZONE — 50% */
        .text-col {
          width: 50%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
        }

        .section-label {
          font-family: 'Poppins', sans-serif;
          font-size: 12px; font-weight: 800;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .label-open { color: rgba(110,231,183,0.85); }
        .label-closed { color: rgba(196,181,253,0.85); }

        .h1-en {
          font-family: 'Poppins', sans-serif;
          font-weight: 900;
          font-size: 34px;
          color: #ffffff;
          line-height: 1.05;
          letter-spacing: -1px;
          margin-bottom: 4px;
        }
        .h1-accent-open { color: #34d399; }
        .h1-accent-closed { color: #a78bfa; }

        .h1-hi {
          font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
          font-weight: 800;
          font-size: 25px;
          line-height: 1.25;
          margin-bottom: 10px;
        }
        .h1-hi-open { color: rgba(255,255,255,0.95); }
        .h1-hi-closed { color: rgba(255,255,255,0.95); }

        .subtext {
          font-family: 'Poppins', sans-serif;
          font-size: 12.5px;
          color: rgba(255,255,255,0.6);
          line-height: 1.5;
          margin-bottom: 12px;
        }
        .subtext-hi {
          font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
          display: block;
          margin-top: 2px;
        }

        /* ─── STEPS ─── */
        .steps { display: flex; flex-direction: column; gap: 7px; }
        .step {
          display: flex; align-items: center; gap: 12px;
        }
        .step-icon-open {
          width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          position: relative;
        }
        .step-icon-closed {
          width: 38px; height: 38px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          position: relative;
        }
        .step-num-open {
          position: absolute;
          bottom: -4px; right: -5px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #34d399;
          font-family: 'Poppins', sans-serif;
          font-size: 11px; font-weight: 900;
          color: #022c22;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #053d2d;
        }
        .step-num-closed {
          position: absolute;
          bottom: -4px; right: -5px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #a78bfa;
          font-family: 'Poppins', sans-serif;
          font-size: 11px; font-weight: 900;
          color: #1a1551;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #0d0b3d;
        }
        .step-text { flex: 1; min-width: 0; }
        .step-en {
          font-family: 'Poppins', sans-serif;
          font-size: 14px; font-weight: 700;
          color: #ffffff;
          line-height: 1.15;
        }
        .step-hi {
          font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
          font-size: 11.5px; font-weight: 600;
          color: rgba(255,255,255,0.7);
          line-height: 1.3;
        }

        /* RIGHT QR ZONE — 50% */
        .qr-col {
          width: 50%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          gap: 6px;
        }

        /* SCAN ME banner */
        .scan-me-banner-open {
          width: 100%;
          background: linear-gradient(90deg, rgba(52,211,153,0.3) 0%, rgba(16,185,129,0.2) 100%);
          border: 2px solid rgba(52,211,153,0.6);
          border-radius: 12px 12px 0 0;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 -4px 20px rgba(52,211,153,0.2);
        }
        .scan-me-banner-closed {
          width: 100%;
          background: linear-gradient(90deg, rgba(167,139,250,0.3) 0%, rgba(99,102,241,0.2) 100%);
          border: 2px solid rgba(167,139,250,0.6);
          border-radius: 12px 12px 0 0;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 -4px 20px rgba(167,139,250,0.2);
        }
        .scan-me-text-open {
          font-family: 'Poppins', sans-serif;
          font-size: 16px; font-weight: 900;
          color: #6ee7b7;
          letter-spacing: 3px;
          text-transform: uppercase;
        }
        .scan-me-text-closed {
          font-family: 'Poppins', sans-serif;
          font-size: 16px; font-weight: 900;
          color: #c4b5fd;
          letter-spacing: 3px;
          text-transform: uppercase;
        }

        /* QR Frame */
        .qr-frame-open {
          width: 100%;
          background: #ffffff;
          border: 4px solid rgba(52,211,153,0.7);
          border-top: none;
          border-radius: 0 0 16px 16px;
          padding: 10px;
          box-shadow:
            0 0 40px rgba(52,211,153,0.5),
            0 0 80px rgba(52,211,153,0.25),
            0 0 120px rgba(52,211,153,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-frame-closed {
          width: 100%;
          background: #ffffff;
          border: 4px solid rgba(167,139,250,0.7);
          border-top: none;
          border-radius: 0 0 16px 16px;
          padding: 10px;
          box-shadow:
            0 0 40px rgba(167,139,250,0.6),
            0 0 80px rgba(139,92,246,0.3),
            0 0 120px rgba(99,102,241,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .qr-frame-open img,
        .qr-frame-closed img {
          display: block;
          image-rendering: pixelated;
          width: 100%;
          height: auto;
        }

        .qr-info {
          font-family: 'Poppins', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          text-align: center;
          line-height: 1.5;
          margin-top: 2px;
        }

        .free-pill-open {
          background: rgba(52,211,153,0.15);
          border: 1.5px solid rgba(52,211,153,0.4);
          border-radius: 99px;
          padding: 6px 18px;
          font-family: 'Poppins', sans-serif;
          font-size: 12px; font-weight: 700;
          color: #6ee7b7;
          text-align: center;
          white-space: nowrap;
        }
        .free-pill-closed {
          background: rgba(167,139,250,0.15);
          border: 1.5px solid rgba(167,139,250,0.4);
          border-radius: 99px;
          padding: 6px 18px;
          font-family: 'Poppins', sans-serif;
          font-size: 12px; font-weight: 700;
          color: #c4b5fd;
          text-align: center;
          white-space: nowrap;
        }

        /* ─── BOTTOM TRUST BAR ─── */
        .trust-bar {
          flex-shrink: 0;
          margin-top: 5mm;
          border-top: 1.5px solid rgba(255,255,255,0.1);
          padding-top: 4mm;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .trust-items {
          display: flex; align-items: center; gap: 18px;
        }
        .trust-chip {
          display: flex; align-items: center; gap: 7px;
          font-family: 'Poppins', sans-serif;
          font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,0.7);
        }
        .trust-sep { color: rgba(255,255,255,0.2); font-size: 14px; }
        .code-chip {
          font-family: 'Poppins', sans-serif;
          font-size: 11px; font-weight: 800;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.4);
        }

        /* ─── TAGLINE FOOTER ─── */
        .tagline-bar {
          flex-shrink: 0;
          margin-top: 3mm;
          border-radius: 12px;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .tagline-bar-open { background: rgba(52,211,153,0.12); }
        .tagline-bar-closed { background: rgba(167,139,250,0.12); }
        .tagline-icon-open {
          color: #34d399; flex-shrink: 0;
        }
        .tagline-icon-closed {
          color: #a78bfa; flex-shrink: 0;
        }
        .tagline-en {
          font-family: 'Poppins', sans-serif;
          font-size: 13px; font-weight: 800;
          color: rgba(255,255,255,1);
          line-height: 1.2;
        }
        .tagline-hi {
          font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
          font-size: 11.5px; font-weight: 600;
          color: rgba(255,255,255,0.7);
          line-height: 1.3;
        }

        /* ─── CUT DIVIDER ─── */
        .cut-divider {
          height: 0;
          border-top: 2px dashed rgba(150,150,150,0.55);
          position: relative;
          flex-shrink: 0;
          z-index: 20;
        }
        .cut-label {
          position: absolute; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          background: #fff;
          padding: 2px 18px;
          font-family: 'Poppins', sans-serif;
          font-size: 10px; font-weight: 700;
          color: #64748b;
          white-space: nowrap;
          letter-spacing: 0.5px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        /* ─── Decorative SVG elements ─── */
        .deco { position: absolute; pointer-events: none; user-select: none; }
      ` }} />

      {/* ══ ADMIN HEADER (no-print) ══════════════════════════════════ */}
      <div className="no-print" style={{
        background: "linear-gradient(135deg,#07052a,#0d0b3d,#1a1551)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="DD" style={{ width: 50, height: 50, borderRadius: 14, boxShadow: "0 4px 14px rgba(0,0,0,0.4)" }} />
          <div>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 900, fontSize: 22, color: "#fff" }}>
              Doctor Diary — Stunning QR Print 
            </div>
            <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              Click "Print" &rarr; Destination: Save as PDF (or Select Printer) &rarr; Paper Size: A4.
            </div>
          </div>
        </div>
        <PrintButton />
      </div>

      {/* ══ PRINT TIPS (no-print) ════════════════════════════════════ */}
      <div className="no-print" style={{
        maxWidth: 760, margin: "24px auto 16px",
        background: "rgba(245,158,11,0.1)", border: "2px solid rgba(245,158,11,0.3)",
        borderRadius: 16, padding: "16px 24px",
        fontFamily: "'Poppins',sans-serif", fontSize: 13, color: "#fde68a",
        textAlign: "center", lineHeight: 1.65,
      }}>
        <strong>Ctrl+P</strong> → Paper: <strong>A4</strong> → Margins: <strong>Default</strong> → ✅ <strong>Background Graphics ON</strong><br />
        <span style={{ color: "rgba(253,230,138,0.7)", fontSize: 12 }}>
          🟢 Green card inside clinic &nbsp;|&nbsp; 🟣 Blue card on the door outside. (Size optimized to never cut off borders!)
        </span>
      </div>

      {/* ══ PAGES ════════════════════════════════════════════════════ */}
      {printItems.map((item) => (
        <div key={item.id} className="a4-wrap">

          {/* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
              CARD 1 — INSIDE  (Clinic OPEN — Emerald)
          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */}
          <div className="half-card">
            <div className="grad-open" />

            {/* Decorative: Medical cross watermark — top right */}
            <svg className="deco" style={{ top: 0, right: 0, width: "52mm", height: "52mm", opacity: 0.055 }} viewBox="0 0 200 200">
              <rect x="78" y="0" width="44" height="200" rx="10" fill="white"/>
              <rect x="0" y="78" width="200" height="44" rx="10" fill="white"/>
            </svg>
            {/* Decorative: Concentric rings — bottom left */}
            <svg className="deco" style={{ bottom: "-22mm", left: "-14mm", width: "60mm", height: "60mm", opacity: 0.06 }} viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="16"/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="10"/>
              <circle cx="100" cy="100" r="30" fill="none" stroke="white" strokeWidth="6"/>
            </svg>
            {/* Decorative: Dot matrix — center */}
            <svg className="deco" style={{ top: "30mm", left: "50%", transform: "translateX(-50%)", width: "20mm", height: "18mm", opacity: 0.1 }} viewBox="0 0 80 72">
              {[0,1,2,3].map(r => [0,1,2,3].map(c => (
                <circle key={`${r}${c}`} cx={10+c*20} cy={10+r*18} r="3.5" fill="white"/>
              )))}
            </svg>
            {/* Decorative: ECG line — bottom right */}
            <svg className="deco" style={{ bottom: "11mm", right: 0, width: "70mm", height: "18mm", opacity: 0.07 }} viewBox="0 0 280 72" preserveAspectRatio="none">
              <polyline points="0,36 35,36 48,8 62,66 76,36 110,36 124,18 140,54 155,36 280,36"
                fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>

            <div className="card-content">
              {/* NAV */}
              <div className="nav-bar">
                <div className="brand-block">
                  <div className="brand-logo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon-192.png" alt="Doctor Diary" />
                  </div>
                  <div>
                    <div className="brand-title">Doctor Diary</div>
                    <div className="brand-sub">by NatureXpress</div>
                  </div>
                </div>
                <div className="badge-open">
                  <div className="dot-open" />
                  <span className="badge-open-text">
                    OPEN &nbsp;•&nbsp; {hi("क्लिनिक खुली है")}
                  </span>
                </div>
              </div>

              {/* MAIN ROW */}
              <div className="main-row">
                {/* LEFT */}
                <div className="text-col">
                  <div className="section-label label-open">
                    <span>📋</span> Book Appointment &nbsp;•&nbsp; {hi("अपॉइंटमेंट बुक करें")}
                  </div>

                  <div className="h1-en">
                    Skip The Queue!<br />
                    <span className="h1-accent-open">Book Your Token</span>
                  </div>
                  <div className="h1-hi h1-hi-open">
                    {hi("लाइन छोड़ें! अभी टोकन बुक करें")}
                  </div>

                  <div className="subtext">
                    No waiting. Get your number online before you arrive.
                    <span className="subtext-hi">{hi("घर बैठे नंबर लें, सही समय पर आएं।")}</span>
                  </div>

                  <div className="steps">
                    {([
                      { Icon: IconScan,     bg: "rgba(52,211,153,0.18)",  border: "rgba(52,211,153,0.45)",  color: "#34d399", en: "Scan QR with phone camera", hi: "फोन से QR स्कैन करें" },
                      { Icon: IconClock,    bg: "rgba(251,191,36,0.15)",  border: "rgba(251,191,36,0.4)",   color: "#fbbf24", en: "Choose your time slot",      hi: "अपना समय चुनें" },
                      { Icon: IconTicket,   bg: "rgba(96,165,250,0.15)",  border: "rgba(96,165,250,0.4)",   color: "#60a5fa", en: "Get instant token number",   hi: "तुरंत टोकन नंबर मिलेगा" },
                      { Icon: IconCheck,    bg: "rgba(167,139,250,0.15)", border: "rgba(167,139,250,0.4)",  color: "#a78bfa", en: "Arrive on time — zero wait!", hi: "समय पर आएं — कोई लाइन नहीं!" },
                    ] as const).map(({ Icon, bg, border, color, en, hi: hiText }, i) => (
                      <div className="step" key={i}>
                        <div className="step-icon-open" style={{ background: bg, border: `2px solid ${border}`, color }}>
                          <Icon />
                          <div className="step-num-open">{i + 1}</div>
                        </div>
                        <div className="step-text">
                          <div className="step-en">{en}</div>
                          <div className="step-hi">{hi(hiText)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT — QR */}
                <div className="qr-col">
                  <div className="scan-me-banner-open">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
                      <rect x="3" y="16" width="5" height="5" rx="1"/><line x1="16" y1="16" x2="21" y2="16"/>
                      <line x1="16" y1="19" x2="21" y2="19"/>
                    </svg>
                    <span className="scan-me-text-open">SCAN ME &nbsp;/&nbsp; {hi("स्कैन करें")}</span>
                  </div>
                  <div className="qr-frame-open">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.qrDataUri} alt="Scan to book appointment" />
                  </div>
                  <div className="qr-info">
                    📷 Any phone camera works &nbsp;•&nbsp; {hi("किसी भी फोन कैमरे से")}
                  </div>
                  <div className="free-pill-open">
                    ⏰ Instant Booking &nbsp;•&nbsp; {hi("कभी भी बुक करें — 24×7")}
                  </div>
                </div>
              </div>

              {/* TRUST */}
              <div className="trust-bar">
                <div className="trust-items">
                  <span className="trust-chip">
                    <span style={{ color: "#34d399" }}><IconShield /></span>
                    Secure &amp; Free
                  </span>
                  <span className="trust-sep">|</span>
                  <span className="trust-chip">
                    <span style={{ color: "#fbbf24" }}><IconZap /></span>
                    Instant Confirmation
                  </span>
                  <span className="trust-sep">|</span>
                  <span className="trust-chip" style={{ fontFamily: "'Noto Sans Devanagari','Mangal',sans-serif" }}>
                    ✅ {hi("हमेशा भरोसेमंद")}
                  </span>
                </div>
                <span className="code-chip">#{item.code}</span>
              </div>

              {/* TAGLINE */}
              <div className="tagline-bar tagline-bar-open">
                <span className="tagline-icon-open"><IconHeart /></span>
                <div>
                  <div className="tagline-en">Your health, your time — your choice!</div>
                  <div className="tagline-hi">{hi("स्मार्ट बुकिंग, तनाव-मुक्त कल।")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CUT DIVIDER ─────────────────────────────── */}
          <div className="cut-divider">
            <div className="cut-label">✂ &nbsp;Cut here &nbsp;/&nbsp; {hi("यहाँ काटें")}</div>
          </div>

          {/* ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
              CARD 2 — OUTSIDE (Clinic CLOSED — Indigo)
          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ */}
          <div className="half-card">
            <div className="grad-closed" />

            {/* Decorative: moon/stars — top right */}
            <svg className="deco" style={{ top: "2mm", right: "2mm", width: "48mm", height: "44mm", opacity: 0.08 }} viewBox="0 0 190 175">
              <circle cx="125" cy="65" r="48" fill="none" stroke="white" strokeWidth="14"/>
              <circle cx="152" cy="40" r="32" fill="#07052a"/>
              <circle cx="25" cy="18" r="5" fill="white"/><circle cx="50" cy="8" r="3.5" fill="white"/>
              <circle cx="12" cy="50" r="4" fill="white"/><circle cx="70" cy="22" r="3" fill="white"/>
              <circle cx="10" cy="85" r="2.5" fill="white"/><circle cx="42" cy="72" r="2" fill="white"/>
              <circle cx="80" cy="5" r="2" fill="white"/><circle cx="95" cy="30" r="1.5" fill="white"/>
            </svg>
            {/* Decorative: Concentric rings — bottom left */}
            <svg className="deco" style={{ bottom: "-20mm", left: "-12mm", width: "58mm", height: "58mm", opacity: 0.065 }} viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="16"/>
              <circle cx="100" cy="100" r="60" fill="none" stroke="white" strokeWidth="10"/>
              <circle cx="100" cy="100" r="30" fill="none" stroke="white" strokeWidth="6"/>
            </svg>
            {/* Decorative: dot matrix — center */}
            <svg className="deco" style={{ top: "30mm", left: "50%", transform: "translateX(-50%)", width: "20mm", height: "18mm", opacity: 0.1 }} viewBox="0 0 80 72">
              {[0,1,2,3].map(r => [0,1,2,3].map(c => (
                <circle key={`${r}${c}`} cx={10+c*20} cy={10+r*18} r="3.5" fill="white"/>
              )))}
            </svg>
            {/* Decorative: clock — bottom right */}
            <svg className="deco" style={{ bottom: "9mm", right: "6mm", width: "28mm", height: "28mm", opacity: 0.065 }} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="white" strokeWidth="8"/>
              <line x1="50" y1="50" x2="50" y2="20" stroke="white" strokeWidth="6" strokeLinecap="round"/>
              <line x1="50" y1="50" x2="72" y2="63" stroke="white" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="50" cy="50" r="5" fill="white"/>
            </svg>

            <div className="card-content">
              {/* NAV */}
              <div className="nav-bar">
                <div className="brand-block">
                  <div className="brand-logo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon-192.png" alt="Doctor Diary" />
                  </div>
                  <div>
                    <div className="brand-title">Doctor Diary</div>
                    <div className="brand-sub">by NatureXpress</div>
                  </div>
                </div>
                <div className="badge-closed">
                  <span className="badge-closed-text">
                    CLOSED &nbsp;•&nbsp; {hi("क्लिनिक बंद है")}
                  </span>
                </div>
              </div>

              {/* MAIN ROW */}
              <div className="main-row">
                {/* LEFT */}
                <div className="text-col">
                  <div className="section-label label-closed">
                    <span>🌙</span> Next Visit &nbsp;•&nbsp; {hi("अगली विज़िट")}
                  </div>

                  <div className="h1-en">
                    Clinic Closed?<br />
                    <span className="h1-accent-closed">Book Online Now!</span>
                  </div>
                  <div className="h1-hi h1-hi-closed">
                    {hi("क्लिनिक बंद? कोई बात नहीं — ऑनलाइन बुकिंग करें!")}
                  </div>

                  <div className="subtext">
                    Don't go back disappointed. Scan now to reserve your spot for when the clinic opens next.
                  </div>

                  <div className="steps">
                    {([
                      { Icon: IconScan,     bg: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.4)",  color: "#c4b5fd", en: "Scan QR with phone camera", hi: "फोन से QR स्कैन करें" },
                      { Icon: IconCalendar, bg: "rgba(99,102,241,0.18)",  border: "rgba(99,102,241,0.4)",   color: "#818cf8", en: "Pick date & time slot",    hi: "अगला दिन और समय चुनें" },
                      { Icon: IconTicket,   bg: "rgba(56,189,248,0.15)",  border: "rgba(56,189,248,0.4)",   color: "#38bdf8", en: "Booking confirmed instantly", hi: "बुकिंग तुरंत पक्की होगी" },
                      { Icon: IconSmile,    bg: "rgba(217,70,239,0.15)",  border: "rgba(217,70,239,0.4)",   color: "#e879f9", en: "Come on your day — no queues!", hi: "तय समय पर आएं — लाइन नहीं!" },
                    ] as const).map(({ Icon, bg, border, color, en, hi: hiText }, i) => (
                      <div className="step" key={i}>
                        <div className="step-icon-closed" style={{ background: bg, border: `2px solid ${border}`, color }}>
                          <Icon />
                          <div className="step-num-closed">{i + 1}</div>
                        </div>
                        <div className="step-text">
                          <div className="step-en">{en}</div>
                          <div className="step-hi">{hi(hiText)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT — QR */}
                <div className="qr-col">
                  <div className="scan-me-banner-closed">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="3" width="5" height="5" rx="1"/><rect x="16" y="3" width="5" height="5" rx="1"/>
                      <rect x="3" y="16" width="5" height="5" rx="1"/><line x1="16" y1="16" x2="21" y2="16"/>
                      <line x1="16" y1="19" x2="21" y2="19"/>
                    </svg>
                    <span className="scan-me-text-closed">SCAN ME &nbsp;/&nbsp; {hi("स्कैन करें")}</span>
                  </div>
                  <div className="qr-frame-closed">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.qrDataUri} alt="Scan to book appointment" />
                  </div>
                  <div className="qr-info">
                    📷 Any phone camera works &nbsp;•&nbsp; {hi("किसी भी फोन कैमरे से")}
                  </div>
                  <div className="free-pill-closed">
                    ⭐ Book 24×7 Anytime &nbsp;•&nbsp; {hi("कभी भी बुक करें")}
                  </div>
                </div>
              </div>

              {/* TRUST */}
              <div className="trust-bar">
                <div className="trust-items">
                  <span className="trust-chip">
                    <span style={{ color: "#34d399" }}><IconShield /></span>
                    Secure &amp; Free
                  </span>
                  <span className="trust-sep">|</span>
                  <span className="trust-chip">
                    <span style={{ color: "#fbbf24" }}><IconZap /></span>
                    Instant Confirmation
                  </span>
                  <span className="trust-sep">|</span>
                  <span className="trust-chip" style={{ fontFamily: "'Noto Sans Devanagari','Mangal',sans-serif" }}>
                    ✅ {hi("हमेशा भरोसेमंद")}
                  </span>
                </div>
                <span className="code-chip">#{item.code}</span>
              </div>

              {/* TAGLINE */}
              <div className="tagline-bar tagline-bar-closed">
                <span className="tagline-icon-closed"><IconHeart /></span>
                <div>
                  <div className="tagline-en">Your health, your time — your choice!</div>
                  <div className="tagline-hi">{hi("स्मार्ट बुकिंग, तनाव-मुक्त कल।")}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      ))}
    </>
  );
}
