import { db } from "@/db";
import { qrCodes, clinics } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "../print/print-button";
import { formatDoctorName } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PrintStandPage({
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
        width: 1800,
        margin: 1,
        color: { dark: "#064e3b", light: "#ffffff" },
        errorCorrectionLevel: "H",
      });
      return { ...item, qrDataUri };
    })
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&family=Outfit:wght@600;700;800;900&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        .print-root *, .print-root *::before, .print-root *::after {
          box-sizing: border-box; margin: 0; padding: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .hi { font-family: 'Noto Sans Devanagari', sans-serif; }
        .outfit { font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif; }

        body { background: #07090e; }

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
          margin: 20mm auto;
          background: #ffffff;
          box-shadow: 0 40px 120px rgba(0,0,0,0.85);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8mm;
        }

        .stand-acrylic-card {
          width: 132mm;
          height: 196mm;
          position: relative;
          border: 1.5px dashed #cbd5e1;
          border-radius: 20px;
          background: radial-gradient(circle at 50% 0%, #064e3b 0%, #062c22 45%, #080d1a 100%);
          color: #ffffff;
          overflow: hidden;
          box-shadow: 0 30px 90px rgba(0,0,0,0.45);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 7mm 8mm;
          text-align: center;
        }

        .stand-top-status {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          padding-bottom: 3mm;
          position: relative; z-index: 2;
        }
        .stand-clinic-brand {
          font-family: 'Outfit', sans-serif;
          font-size: 11.5px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stand-live-chip {
          background: linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(6,78,59,0.6) 100%);
          border: 1.5px solid rgba(52,211,153,0.6);
          color: #34d399;
          font-size: 9px;
          font-weight: 800;
          padding: 3.5px 11px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 0 15px rgba(52,211,153,0.2);
        }
        .live-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #34d399;
          box-shadow: 0 0 8px #34d399;
        }

        .stand-doctor-section {
          margin-top: 2.5mm;
          width: 100%;
          position: relative; z-index: 2;
        }
        .stand-doctor-name {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.05;
          letter-spacing: -0.4px;
        }
        .stand-doctor-specialty {
          font-size: 11px;
          font-weight: 800;
          color: #34d399;
          margin-top: 1.5px;
        }

        .stand-action-box {
          margin-top: 2.5mm;
          position: relative; z-index: 2;
        }
        .stand-action-en {
          font-family: 'Outfit', sans-serif;
          font-size: 16.5px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: -0.3px;
        }
        .stand-action-hi {
          font-size: 12px;
          font-weight: 800;
          color: #6ee7b7;
          margin-top: 1px;
        }

        .stand-qr-viewfinder {
          width: 78mm;
          height: 78mm;
          position: relative;
          margin: 3mm 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative; z-index: 2;
        }
        
        .qr-corner-bracket {
          position: absolute; width: 14px; height: 14px;
          border-color: #34d399; border-style: solid;
        }
        .bracket-tl { top: -3px; left: -3px; border-width: 3px 0 0 3px; border-top-left-radius: 8px; }
        .bracket-tr { top: -3px; right: -3px; border-width: 3px 3px 0 0; border-top-right-radius: 8px; }
        .bracket-bl { bottom: -3px; left: -3px; border-width: 0 0 3px 3px; border-bottom-left-radius: 8px; }
        .bracket-br { bottom: -3px; right: -3px; border-width: 0 3px 3px 0; border-bottom-right-radius: 8px; }

        .stand-qr-card {
          width: 100%;
          height: 100%;
          background: #ffffff;
          border-radius: 18px;
          padding: 3.5mm;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 3px rgba(52,211,153,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stand-qr-card img {
          width: 100%;
          height: 100%;
          display: block;
          image-rendering: pixelated;
        }

        .stand-trust-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          width: 100%;
          position: relative; z-index: 2;
        }
        .stand-trust-pill {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.2);
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .stand-card-footer {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,0.12);
          padding-top: 2.5mm;
          font-size: 8.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.65);
          position: relative; z-index: 2;
        }
      ` }} />

      <div className="no-print" style={{ background: "#064e3b", borderBottom: "1px solid #34d399", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ color: "#fff" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 900, fontFamily: "Outfit, sans-serif" }}>20+ Yrs Sr. UI/Graphic Expert — Acrylic Standee Insert (4x6 Inch / A5)</h1>
          <p style={{ fontSize: "14px", color: "#34d399" }}>✨ 3D Scanner Viewfinder Corner Brackets • Single-Sided Enterprise Theme • High-Res PDF</p>
        </div>
        <PrintButton />
      </div>

      <div className="print-root">
        {printItems.map((item) => (
          <div key={item.id} className="a4-stand-page">
            <div className="stand-acrylic-card">
              <div className="stand-top-status">
                <div className="stand-clinic-brand">
                  <span style={{ color: "#34d399" }}>🏥</span> {item.clinicName || "Doctor Diary Partner"}
                </div>
                <div className="stand-live-chip">
                  <span className="live-dot" />
                  Live OPD Queue
                </div>
              </div>

              <div className="stand-doctor-section">
                <div className="stand-doctor-name">
                  {item.doctorName ? (formatDoctorName(item.doctorName).replace(/^dr\.?\s*/i, "")) : item.clinicName}
                </div>
                {item.doctorSpecialty && <div className="stand-doctor-specialty">{item.doctorSpecialty}</div>}
              </div>

              <div className="stand-action-box">
                <div className="stand-action-en">Scan to Book Live OPD Token</div>
                <div className="stand-action-hi hi">टोकन पाने के लिए कैमरे से स्कैन करें</div>
              </div>

              <div className="stand-qr-viewfinder">
                <div className="qr-corner-bracket bracket-tl" />
                <div className="qr-corner-bracket bracket-tr" />
                <div className="qr-corner-bracket bracket-bl" />
                <div className="qr-corner-bracket bracket-br" />

                <div className="stand-qr-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.qrDataUri} alt={"QR Code " + item.code} />
                </div>
              </div>

              <div className="stand-trust-row">
                <span className="stand-trust-pill">✓ Pay at Clinic</span>
                <span className="stand-trust-pill">✓ 100% Free</span>
                <span className="stand-trust-pill">✓ Track Live Queue</span>
              </div>

              <div className="stand-card-footer">
                <span>Doctor Diary Enterprise OPD Platform</span>
                <span style={{ fontFamily: "monospace", color: "#34d399", fontWeight: 800 }}>Code #{item.code}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
