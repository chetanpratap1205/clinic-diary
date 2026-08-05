import { db } from "@/db";
import { qrCodes, clinics } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

export default async function PrintQrPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.ids) redirect("/admin/qr");

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const idsArray = sp.ids.split(",").filter((id) => uuidRegex.test(id));

  if (idsArray.length === 0) {
    return (
      <div style={{ color: "#7f1d1d", background: "#fef2f2", padding: "20px", margin: "20px", borderRadius: "8px", border: "1px solid #fecaca", fontFamily: "sans-serif" }}>
        <strong>Error:</strong> Invalid QR IDs provided.
      </div>
    );
  }

  const codes = await db
    .select({
      id: qrCodes.id,
      code: qrCodes.code,
      clinicName: clinics.name,
      doctorName: clinics.doctorName,
      doctorSpecialty: clinics.specialty,
      clinicLogo: clinics.logoUrl,
    })
    .from(qrCodes)
    .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
    .where(inArray(qrCodes.id, idsArray))
    .orderBy(qrCodes.code);

  if (codes.length === 0) {
    return (
      <div style={{ color: "#7f1d1d", background: "#fef2f2", padding: "20px", margin: "20px", borderRadius: "8px", border: "1px solid #fecaca", fontFamily: "sans-serif" }}>
        <strong>Error:</strong> No QR codes found for the given IDs.
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  const printItems = await Promise.all(
    codes.map(async (item) => {
      const base = `${baseUrl}/q/${item.code}`;
      const qrInside = await QRCode.toDataURL(`${base}?src=reception`, {
        width: 2000,
        margin: 1,
        color: { dark: "#044e37", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      const qrOutside = await QRCode.toDataURL(`${base}?src=window`, {
        width: 2000,
        margin: 1,
        color: { dark: "#1e1b4b", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      return { ...item, qrInside, qrOutside };
    })
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap"
      />

      <style dangerouslySetInnerHTML={{ __html: `
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090b; font-family: 'Inter', system-ui, sans-serif; }

        @media print {
          @page { size: A4 portrait; margin: 0; }
          body {
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print { display: none !important; }
          .a4-page {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
          }
          .a4-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }

        .a4-page {
          width: 210mm;
          height: 297mm;
          margin: 24px auto;
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }

        /* ═══════════════════════════════════
           PAGE 1 — INSIDE CLINIC
           Deep Forest Emerald Premium
        ═══════════════════════════════════ */
        .page-inside {
          background: radial-gradient(ellipse 100% 70% at 50% 0%, #065f46 0%, #044e37 30%, #033526 60%, #022c22 100%);
        }

        /* ═══════════════════════════════════
           PAGE 2 — OUTSIDE CLINIC
           Deep Midnight Indigo Premium
        ═══════════════════════════════════ */
        .page-outside {
          background: radial-gradient(ellipse 100% 70% at 50% 0%, #3730a3 0%, #1e1b4b 35%, #12107a 65%, #05051a 100%);
        }

        /* Subtle decorative circles */
        .deco-circle-1 {
          position: absolute;
          width: 180mm; height: 180mm;
          border-radius: 50%;
          top: -60mm; right: -60mm;
          opacity: 0.07;
          pointer-events: none;
        }
        .deco-circle-1-i { background: #34d399; }
        .deco-circle-1-o { background: #818cf8; }

        .deco-circle-2 {
          position: absolute;
          width: 100mm; height: 100mm;
          border-radius: 50%;
          bottom: 20mm; left: -40mm;
          opacity: 0.05;
          pointer-events: none;
        }
        .deco-circle-2-i { background: #6ee7b7; }
        .deco-circle-2-o { background: #c7d2fe; }

        /* ── TOP HEADER ── */
        .top-header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7mm 10mm 0 10mm;
          position: relative;
          z-index: 10;
        }

        .brand-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-logo-box {
          width: 44px; height: 44px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 6px 20px rgba(0,0,0,0.5), 0 0 0 2px rgba(255,255,255,0.15);
        }
        .brand-logo-box img { width: 100%; height: 100%; display: block; object-fit: cover; }

        .brand-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 22px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .brand-sub {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.65);
          margin-top: 2px;
          letter-spacing: 0.2px;
        }

        .status-pill-inside {
          background: rgba(52,211,153,0.18);
          border: 1.5px solid rgba(52,211,153,0.45);
          color: #6ee7b7;
          font-size: 11px;
          font-weight: 800;
          padding: 5px 14px;
          border-radius: 99px;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-pill-outside {
          background: rgba(165,180,252,0.18);
          border: 1.5px solid rgba(165,180,252,0.45);
          color: #a5b4fc;
          font-size: 11px;
          font-weight: 800;
          padding: 5px 14px;
          border-radius: 99px;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── CENTRE: MASCOT ── */
        .mascot-row {
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0 10mm;
          position: relative;
          z-index: 10;
        }

        .mascot-img {
          height: 68mm;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 12px 28px rgba(0,0,0,0.6));
        }

        /* ── HEADLINE BLOCK ── */
        .headline-block {
          text-align: center;
          padding: 0 8mm;
          position: relative;
          z-index: 10;
        }

        .badge-time-save {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(250,204,21,0.18);
          border: 1.5px solid rgba(250,204,21,0.45);
          color: #fde047;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 14px;
          border-radius: 99px;
          margin-bottom: 4mm;
          letter-spacing: 0.3px;
        }

        .headline-en {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 38px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.05;
          letter-spacing: -1px;
        }
        .headline-en-accent-inside { color: #34d399; }
        .headline-en-accent-outside { color: #a5b4fc; }

        .headline-hi {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 20px;
          font-weight: 800;
          color: rgba(255,255,255,0.9);
          margin-top: 3mm;
          line-height: 1.3;
        }
        .headline-hi-sub {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 16px;
          font-weight: 700;
          margin-top: 1mm;
        }
        .headline-hi-sub-i { color: #34d399; }
        .headline-hi-sub-o { color: #a5b4fc; }

        /* ── HERO QR STAGE (60%+ visual real estate) ── */
        .qr-stage-wrap {
          width: 100%;
          padding: 0 18mm;
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .qr-stage-inside {
          width: 100%;
          background: #ffffff;
          border-radius: 24px;
          padding: 6mm 6mm 4mm 6mm;
          box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 0 4px rgba(52,211,153,0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .qr-stage-outside {
          width: 100%;
          background: #ffffff;
          border-radius: 24px;
          padding: 6mm 6mm 4mm 6mm;
          box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 0 4px rgba(129,140,248,0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .scan-cta-banner-inside {
          background: linear-gradient(90deg, #059669 0%, #10b981 50%, #34d399 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          padding: 6px 24px;
          border-radius: 99px;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 5mm;
          box-shadow: 0 6px 20px rgba(16,185,129,0.45);
        }
        .scan-cta-banner-outside {
          background: linear-gradient(90deg, #4338ca 0%, #6366f1 50%, #818cf8 100%);
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          padding: 6px 24px;
          border-radius: 99px;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 5mm;
          box-shadow: 0 6px 20px rgba(99,102,241,0.45);
        }

        .qr-image-hero {
          width: 100%;
          max-width: 130mm;
          height: auto;
          display: block;
          image-rendering: pixelated;
          border-radius: 12px;
        }

        .any-camera-note {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          margin-top: 3mm;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── FEATURES ROW ── */
        .features-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5mm;
          padding: 0 10mm;
          position: relative;
          z-index: 10;
        }

        .feature-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 800;
          color: rgba(255,255,255,0.85);
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 5px 12px;
          border-radius: 99px;
        }

        /* ── DOCTOR FOOTER CARD ── */
        .doctor-footer {
          width: 100%;
          padding: 0 10mm 8mm 10mm;
          position: relative;
          z-index: 10;
        }

        .doctor-card-inner {
          width: 100%;
          background: #ffffff;
          border-radius: 14px;
          padding: 4mm 6mm;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }

        .doctor-left { flex: 1; min-width: 0; }

        .doctor-label {
          font-size: 10px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 1mm;
        }
        .doctor-name {
          font-size: 17px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .doctor-clinic {
          font-size: 12px;
          font-weight: 700;
          margin-top: 1mm;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .doctor-clinic-i { color: #044e37; }
        .doctor-clinic-o { color: #312e81; }

        .doctor-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
          flex-shrink: 0;
          margin-left: 5mm;
        }
        .doctor-code-pill {
          font-family: monospace;
          font-size: 11px;
          font-weight: 900;
          color: #475569;
          background: #f1f5f9;
          padding: 3px 8px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        .doctor-url {
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
        }

        /* ── SECURITY STRIP ── */
        .security-strip {
          width: 100%;
          background: rgba(0,0,0,0.35);
          padding: 3mm 10mm;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8mm;
          position: relative;
          z-index: 10;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .security-item {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 12px;
          font-weight: 800;
          color: rgba(255,255,255,0.85);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .security-sep {
          color: rgba(255,255,255,0.25);
          font-size: 14px;
        }
      ` }} />

      {/* ═══ ADMIN HEADER (no-print) ═══════════════════════════════════ */}
      <div className="no-print" style={{
        background: "linear-gradient(135deg, #022c22, #044e37, #059669)",
        borderBottom: "1px solid rgba(52,211,153,0.3)",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="DD" style={{ width: 46, height: 46, borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.5)" }} />
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 20, color: "#fff" }}>
              Enterprise A4 Poster Suite — Full Page (Inside + Outside)
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
              Each poster = full separate A4 page • Ctrl+P → Margins: <strong style={{ color: "#fff" }}>None</strong> • ✅ Background Graphics <strong style={{ color: "#34d399" }}>ON</strong>
            </div>
          </div>
        </div>
        <PrintButton />
      </div>

      {/* ═══ PRINT TIPS ═════════════════════════════════════════════ */}
      <div className="no-print" style={{
        maxWidth: 840, margin: "20px auto 12px",
        background: "rgba(52,211,153,0.08)", border: "1.5px solid rgba(52,211,153,0.25)",
        borderRadius: 14, padding: "14px 24px",
        fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#6ee7b7",
        textAlign: "center", lineHeight: 1.65,
      }}>
        🟢 <strong>Emerald Poster</strong> — Inside Reception / Waiting Room &nbsp;|&nbsp;
        🔵 <strong>Indigo Poster</strong> — Outside Entrance Door / Window &nbsp;|&nbsp;
        📄 <strong>Each poster prints on its own full A4 page.</strong>
      </div>

      {/* ═══ PRINT PAGES ════════════════════════════════════════════ */}
      <div>
        {printItems.map((item) => (
          <>
            {/* ██████████████████████████████████████████
                PAGE 1 (per clinic): INSIDE CLINIC — FULL A4
                Deep Emerald · Live Token Queue
            ██████████████████████████████████████████ */}
            <div key={`inside-${item.id}`} className="a4-page page-inside">
              {/* Decorative background circles */}
              <div className="deco-circle-1 deco-circle-1-i" />
              <div className="deco-circle-2 deco-circle-2-i" />

              {/* TOP HEADER */}
              <div className="top-header">
                <div className="brand-row">
                  <div className="brand-logo-box">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon-192.png" alt="Doctor Diary" />
                  </div>
                  <div>
                    <div className="brand-title">Doctor Diary</div>
                    <div className="brand-sub">by NatureXpress · Skip the Queue</div>
                  </div>
                </div>
                <div className="status-pill-inside">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                  CLINIC OPEN
                </div>
              </div>

              {/* MASCOT */}
              <div className="mascot-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/mascot/mascot-pointing.png"
                  alt="Digital Assistant pointing to QR"
                  className="mascot-img"
                />
              </div>

              {/* HEADLINE */}
              <div className="headline-block">
                <div className="badge-time-save">⏱ अपना 30–60 मिनट बचाएं</div>
                <div className="headline-en">
                  अपना समय बचाएं, <span className="headline-en-accent-inside">SCAN करें</span>
                </div>
                <div className="headline-hi">और टोकन / अपॉइंटमेंट बुक करें अभी</div>
                <div className="headline-hi-sub headline-hi-sub-i">लाइव टोकन नंबर पाने के लिए अभी स्कैन करें</div>
              </div>

              {/* HERO QR STAGE */}
              <div className="qr-stage-wrap">
                <div className="qr-stage-inside">
                  <div className="scan-cta-banner-inside">📱 SCAN HERE</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.qrInside} alt="QR Code" className="qr-image-hero" />
                  <div className="any-camera-note">
                    <span>📷</span> Any phone camera · किसी भी कैमरे से
                  </div>
                </div>
              </div>

              {/* FEATURES ROW */}
              <div className="features-row">
                <div className="feature-chip">👥 लंबी लाइन से छुटकारा</div>
                <div className="feature-chip">📅 अपना समय चुनें</div>
                <div className="feature-chip">🔔 तुरंत कन्फर्मेशन</div>
                <div className="feature-chip">💳 100% फ्री</div>
              </div>

              {/* DOCTOR FOOTER */}
              <div className="doctor-footer">
                <div className="doctor-card-inner">
                  <div className="doctor-left">
                    <div className="doctor-label">Healthcare Provider</div>
                    <div className="doctor-name">{item.doctorName || item.clinicName || "Doctor Diary Partner"}</div>
                    <div className={`doctor-clinic doctor-clinic-i`}>
                      {item.doctorSpecialty ? `${item.doctorSpecialty} · ` : ""}{item.clinicName || "Official Reception Desk"}
                    </div>
                  </div>
                  <div className="doctor-right">
                    <div className="doctor-code-pill">#{item.code}</div>
                    <div className="doctor-url">doctor.naturexpress.in</div>
                  </div>
                </div>
              </div>

              {/* SECURITY STRIP */}
              <div className="security-strip">
                <span className="security-item">🔒 100% सुरक्षित</span>
                <span className="security-sep">|</span>
                <span className="security-item">✅ भरोसेमंद</span>
                <span className="security-sep">|</span>
                <span className="security-item">⚡ आसान और तेज़</span>
                <span className="security-sep">|</span>
                <span className="security-item" style={{ fontFamily: "monospace", fontSize: 12 }}>doctor.naturexpress.in</span>
              </div>
            </div>

            {/* ██████████████████████████████████████████
                PAGE 2 (per clinic): OUTSIDE CLINIC — FULL A4
                Deep Midnight Indigo · 24/7 Slot Booking
            ██████████████████████████████████████████ */}
            <div key={`outside-${item.id}`} className="a4-page page-outside">
              {/* Decorative background circles */}
              <div className="deco-circle-1 deco-circle-1-o" />
              <div className="deco-circle-2 deco-circle-2-o" />

              {/* TOP HEADER */}
              <div className="top-header">
                <div className="brand-row">
                  <div className="brand-logo-box">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icon-192.png" alt="Doctor Diary" />
                  </div>
                  <div>
                    <div className="brand-title">Doctor Diary</div>
                    <div className="brand-sub">by NatureXpress · 24/7 Smart Desk</div>
                  </div>
                </div>
                <div className="status-pill-outside">
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6366f1", flexShrink: 0 }} />
                  24/7 BOOKING
                </div>
              </div>

              {/* MASCOT */}
              <div className="mascot-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/mascot/mascot-namaste.png"
                  alt="Digital Assistant in Namaste pose"
                  className="mascot-img"
                />
              </div>

              {/* HEADLINE */}
              <div className="headline-block">
                <div className="badge-time-save" style={{ background: "rgba(165,180,252,0.15)", borderColor: "rgba(165,180,252,0.45)", color: "#c7d2fe" }}>
                  ✨ क्लिनिक बंद है? कोई बात नहीं!
                </div>
                <div className="headline-en">
                  Clinic Closed? <span className="headline-en-accent-outside">SCAN करें</span>
                </div>
                <div className="headline-hi">और अगले उपलब्ध स्लॉट का टोकन अभी बुक करें</div>
                <div className="headline-hi-sub headline-hi-sub-o">डॉक्टर की छुट्टी हो या रात हो — 24 घंटे उपलब्ध</div>
              </div>

              {/* HERO QR STAGE */}
              <div className="qr-stage-wrap">
                <div className="qr-stage-outside">
                  <div className="scan-cta-banner-outside">📱 BOOK 24/7</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.qrOutside} alt="QR Code" className="qr-image-hero" />
                  <div className="any-camera-note">
                    <span>📷</span> Any phone camera · किसी भी कैमरे से
                  </div>
                </div>
              </div>

              {/* FEATURES ROW */}
              <div className="features-row">
                <div className="feature-chip">🌙 24 घंटे बुकिंग</div>
                <div className="feature-chip">📅 कल का समय चुनें</div>
                <div className="feature-chip">💬 WhatsApp कन्फर्मेशन</div>
                <div className="feature-chip">🛡️ 100% फ्री</div>
              </div>

              {/* DOCTOR FOOTER */}
              <div className="doctor-footer">
                <div className="doctor-card-inner">
                  <div className="doctor-left">
                    <div className="doctor-label">Healthcare Provider</div>
                    <div className="doctor-name">{item.doctorName || item.clinicName || "Doctor Diary Partner"}</div>
                    <div className={`doctor-clinic doctor-clinic-o`}>
                      {item.doctorSpecialty ? `${item.doctorSpecialty} · ` : ""}{item.clinicName || "Healthcare Provider"}
                    </div>
                  </div>
                  <div className="doctor-right">
                    <div className="doctor-code-pill">#{item.code}</div>
                    <div className="doctor-url">doctor.naturexpress.in</div>
                  </div>
                </div>
              </div>

              {/* SECURITY STRIP */}
              <div className="security-strip">
                <span className="security-item">🔒 100% सुरक्षित</span>
                <span className="security-sep">|</span>
                <span className="security-item">✅ भरोसेमंद</span>
                <span className="security-sep">|</span>
                <span className="security-item">⚡ आसान और तेज़</span>
                <span className="security-sep">|</span>
                <span className="security-item" style={{ fontFamily: "monospace", fontSize: 12 }}>doctor.naturexpress.in</span>
              </div>
            </div>
          </>
        ))}
      </div>
    </>
  );
}
