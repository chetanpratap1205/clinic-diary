import { db } from "@/db";
import { qrCodes, clinics } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "../print/print-button";

export const dynamic = "force-dynamic";

export default async function PrintStandPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.ids) redirect("/admin/qr");

  // Validate UUIDs to prevent Postgres crash
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const idsArray = sp.ids.split(",").filter((id) => uuidRegex.test(id));

  if (idsArray.length === 0) {
    return (
      <div style={{ color: "#7f1d1d", background: "#fef2f2", padding: "20px", margin: "20px", borderRadius: "8px", border: "1px solid #fecaca", fontFamily: "sans-serif" }}>
        <strong>Error:</strong> Invalid QR IDs provided in the URL.
      </div>
    );
  }

  const codes = await db
    .select({
      id: qrCodes.id,
      code: qrCodes.code,
      clinicId: qrCodes.clinicId,
      clinicName: clinics.name,
      doctorName: clinics.doctorName,
      doctorSpecialty: clinics.specialty,
      clinicLogo: clinics.logoUrl,
      doctorPhoto: clinics.heroImageUrl,
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
      const url = `${baseUrl}/q/${item.code}?src=stand`;
      const qrDataUri = await QRCode.toDataURL(url, {
        width: 1200,
        margin: 1,
        color: { dark: "#0f766e", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      return { ...item, qrDataUri };
    })
  );

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@600;700;800&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap"
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
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
          .a4-stand-page {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            border: none !important;
          }
          .a4-stand-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }

        .a4-stand-page {
          width: 210mm;
          height: 297mm;
          margin: 24px auto;
          background: #ffffff;
          box-shadow: 0 40px 120px rgba(0,0,0,0.7);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10mm;
        }

        .stand-cut-wrapper {
          width: 195mm;
          height: 145mm;
          position: relative;
          border: 1.5px dashed #cbd5e1;
          border-radius: 6px;
          display: flex;
          background: #fff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
        }

        .fold-center-line {
          position: absolute;
          top: 0; bottom: 0; left: 50%;
          width: 0;
          border-left: 2px dashed #0d9488;
          z-index: 20;
        }

        .fold-label {
          position: absolute;
          top: -12px; left: 50%;
          transform: translateX(-50%);
          background: #0d9488; color: #ffffff;
          font-size: 8px; font-weight: 800;
          padding: 2px 8px; border-radius: 4px;
          text-transform: uppercase; letter-spacing: 0.5px;
          z-index: 21;
        }

        .stand-panel {
          width: 50%;
          height: 100%;
          padding: 6mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          position: relative;
          background: #ffffff;
        }

        .panel-front {
          background: radial-gradient(circle at top right, rgba(13,148,136,0.06) 0%, transparent 60%);
        }
        .panel-back {
          background: radial-gradient(circle at top left, rgba(99,102,241,0.06) 0%, transparent 60%);
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .brand-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #0f766e;
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .panel-tag {
          font-size: 8px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .title-block {
          text-align: center;
          margin-top: 1mm;
        }

        .title-en {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 19px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.15;
          letter-spacing: -0.5px;
        }
        .title-en span {
          color: #0d9488;
        }

        .title-hi {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #0f766e;
          margin-top: 2px;
        }

        .qr-card-wrap {
          width: 56mm;
          height: 56mm;
          background: #ffffff;
          border-radius: 12px;
          padding: 3mm;
          box-shadow: 0 8px 24px rgba(13,148,136,0.15), 0 0 0 2px rgba(13,148,136,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .qr-card-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          image-rendering: pixelated;
        }

        .steps-box {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 3mm 4mm;
          display: flex;
          flex-direction: column;
          gap: 1.5mm;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 9.5px;
          font-weight: 700;
          color: #1e293b;
        }
        .step-num {
          width: 15px; height: 15px;
          border-radius: 50%;
          background: #0d9488; color: #fff;
          font-size: 8.5px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .doctor-write-box {
          width: 100%;
          height: 26mm;
          border: 1.5px dashed #94a3b8;
          border-radius: 8px;
          background: #fafafa;
          padding: 3mm;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .doctor-write-label {
          font-size: 8px;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .doctor-write-name {
          font-size: 11.5px;
          font-weight: 900;
          color: #0f172a;
        }
        .doctor-write-sub {
          font-size: 8.5px;
          font-weight: 700;
          color: #0d9488;
        }

        .footer-badge-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          margin-top: 2mm;
        }

        .badge-chip {
          font-size: 8px;
          font-weight: 800;
          color: #0f766e;
          background: #f0fdfa;
          border: 1px solid #ccfbf1;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .code-pill {
          font-family: monospace;
          font-size: 8.5px;
          font-weight: 800;
          color: #475569;
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 4px;
        }
      `,
        }}
      />

      {/* ══ ADMIN HEADER (no-print) ══════════════════════════════════ */}
      <div
        className="no-print"
        style={{
          background: "linear-gradient(135deg, #0f172a, #1e293b, #0f766e)",
          borderBottom: "1px solid rgba(45,212,191,0.2)",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-192.png"
            alt="DD"
            style={{ width: 46, height: 46, borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.5)" }}
          />
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 20, color: "#fff" }}>
              Acrylic Table Standee (4x6 Inches)
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              Double-Sided Insert • Margins: <strong style={{ color: "#fff" }}>None</strong> • ✅ Background Graphics{" "}
              <strong style={{ color: "#2dd4bf" }}>ON</strong>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <PrintButton />
        </div>
      </div>

      {/* ══ PAGES ════════════════════════════════════════════════════ */}
      <div className="print-root">
        {printItems.map((item) => (
          <div key={item.id} className="a4-stand-page">
            <div className="stand-cut-wrapper">
              <div className="fold-center-line" />
              <div className="fold-label">✂ Fold Center Guide</div>

              {/* PANEL A: FRONT SIDE */}
              <div className="stand-panel panel-front">
                <div className="panel-header">
                  <div className="brand-badge">⚡ Live Queue</div>
                  <div className="panel-tag">Front Side</div>
                </div>

                <div className="title-block">
                  <div className="title-en">
                    Live <span>Queue Tracker</span>
                  </div>
                  <div className="title-hi">लाइव टोकन स्थिति देखें</div>
                </div>

                <div className="qr-card-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.qrDataUri} alt={`QR Code ${item.code}`} />
                </div>

                <div className="steps-box">
                  <div className="step-item">
                    <span className="step-num">1</span> Scan QR with phone camera
                  </div>
                  <div className="step-item">
                    <span className="step-num">2</span> View live token number & position
                  </div>
                  <div className="step-item">
                    <span className="step-num">3</span> Know your exact turn time!
                  </div>
                </div>

                <div className="footer-badge-strip">
                  <span className="badge-chip">⚡ Powered by Doctor Diary</span>
                  <span className="code-pill">#{item.code}</span>
                </div>
              </div>

              {/* PANEL B: BACK SIDE */}
              <div className="stand-panel panel-back">
                <div className="panel-header">
                  <div className="brand-badge" style={{ background: "#312e81" }}>
                    Doctor Profile
                  </div>
                  <div className="panel-tag">Back Side</div>
                </div>

                <div className="doctor-write-box">
                  <div className="doctor-write-label">Healthcare Provider</div>
                  {item.clinicName ? (
                    <div>
                      <div className="doctor-write-name">{item.doctorName || item.clinicName}</div>
                      <div className="doctor-write-sub">
                        {item.doctorSpecialty ? `${item.doctorSpecialty} · ` : ""}{item.clinicName}
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: "#94a3b8", fontSize: 9, fontStyle: "italic" }}>
                      Handwrite Doctor / Clinic details after printing
                    </div>
                  )}
                </div>

                <div className="steps-box" style={{ background: "rgba(224, 231, 255, 0.3)", borderColor: "#c7d2fe" }}>
                  <div className="step-item">
                    <span className="step-num" style={{ background: "#4338ca" }}>
                      ✓
                    </span>{" "}
                    Real-time queue tracking
                  </div>
                  <div className="step-item">
                    <span className="step-num" style={{ background: "#4338ca" }}>
                      ✓
                    </span>{" "}
                    Book next visit online anytime
                  </div>
                  <div className="step-item">
                    <span className="step-num" style={{ background: "#4338ca" }}>
                      ✓
                    </span>{" "}
                    Zero waiting room congestion
                  </div>
                </div>

                <div className="footer-badge-strip">
                  <span className="badge-chip" style={{ background: "#e0e7ff", color: "#3730a3", borderColor: "#c7d2fe" }}>
                    ⚡ Powered by Doctor Diary
                  </span>
                  <span className="code-pill">#{item.code}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
