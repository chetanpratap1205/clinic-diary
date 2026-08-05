import { db } from "@/db";
import { qrCodes, clinics } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "../print/print-button";

export const dynamic = "force-dynamic";

export default async function PrintStickersPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.ids) redirect("/admin/qr");

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const idsArray = sp.ids.split(",").filter((id) => uuidRegex.test(id));
  
  if (idsArray.length === 0) {
    return <div style={{ color: "#7f1d1d", background: "#fef2f2", padding: "20px", margin: "20px", borderRadius: "8px", border: "1px solid #fecaca", fontFamily: "sans-serif" }}><strong>Error:</strong> Invalid QR IDs.</div>;
  }

  const codes = await db
    .select({
      id: qrCodes.id,
      code: qrCodes.code,
      clinicName: clinics.name,
      doctorName: clinics.doctorName,
      doctorSpecialty: clinics.specialty,
      address: clinics.address,
      phone: clinics.phone,
    })
    .from(qrCodes)
    .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
    .where(inArray(qrCodes.id, idsArray))
    .orderBy(qrCodes.code);

  if (codes.length === 0) {
    return <div style={{ color: "#7f1d1d", background: "#fef2f2", padding: "20px", margin: "20px", borderRadius: "8px", border: "1px solid #fecaca", fontFamily: "sans-serif" }}><strong>Error:</strong> No QR codes found.</div>;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  const printItems = await Promise.all(
    codes.map(async (item) => {
      const url = `${baseUrl}/q/${item.code}?src=outside`;
      const qrDataUri = await QRCode.toDataURL(url, {
        width: 1800, margin: 1, color: { dark: "#090d16", light: "#ffffff" }, errorCorrectionLevel: "H",
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
          .page-a4 {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            border: none !important;
          }
          .page-a4:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }

        /* 20+ Yrs Sr. UI/Graphic Expert Outdoor Poster Page */
        .page-a4 {
          width: 210mm; height: 297mm;
          margin: 20mm auto;
          background: radial-gradient(circle at 50% 30%, #0f172a 0%, #080d1a 65%, #04060b 100%);
          color: #ffffff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 40px 120px rgba(0,0,0,0.85);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 10mm 12mm;
          text-align: center;
          border: 6px solid #34d399;
        }

        /* Ambient Cyan Light Glow */
        .page-a4::before {
          content: ''; position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
          width: 200mm; height: 120mm;
          background: radial-gradient(ellipse at center, rgba(52,211,153,0.15) 0%, rgba(0,0,0,0) 70%);
          pointer-events: none;
        }

        /* Top Bar */
        .outdoor-top-bar {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1.5px solid rgba(255,255,255,0.15);
          padding-bottom: 4mm;
          position: relative; z-index: 2;
        }
        .outdoor-clinic-name {
          font-family: 'Outfit', sans-serif;
          font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1.1; letter-spacing: -0.5px;
          text-align: left;
        }
        .outdoor-doctor-sub {
          font-size: 13px; font-weight: 800; color: #34d399; margin-top: 2px; text-align: left;
        }
        .outdoor-badge-chip {
          background: rgba(16,185,129,0.25); border: 1.5px solid rgba(52,211,153,0.6);
          color: #34d399; font-size: 11px; font-weight: 900; padding: 4px 14px; border-radius: 30px;
          text-transform: uppercase; letter-spacing: 1px;
        }

        /* Urgent Headline Box */
        .outdoor-headline-box {
          margin-top: 4mm;
          position: relative; z-index: 2;
        }
        .outdoor-headline-en {
          font-family: 'Outfit', sans-serif;
          font-size: 40px; font-weight: 900; color: #ffffff; line-height: 1.05; letter-spacing: -1.5px;
        }
        .outdoor-headline-hi {
          font-size: 23px; font-weight: 800; color: #34d399; margin-top: 2mm;
        }
        .outdoor-subtext {
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: 2.5mm; max-w: 160mm; margin-left: auto; margin-right: auto;
        }

        /* Ultra-Large Outdoor Viewfinder Scanner Frame (Scannable from 3-8 Feet) */
        .outdoor-qr-viewfinder {
          width: 118mm; height: 118mm;
          position: relative;
          margin: 5mm 0;
          display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 2;
        }
        .out-bracket {
          position: absolute; width: 24px; height: 24px;
          border-color: #34d399; border-style: solid;
        }
        .o-bracket-tl { top: -5px; left: -5px; border-width: 5px 0 0 5px; border-top-left-radius: 14px; }
        .o-bracket-tr { top: -5px; right: -5px; border-width: 5px 5px 0 0; border-top-right-radius: 14px; }
        .o-bracket-bl { bottom: -5px; left: -5px; border-width: 0 0 5px 5px; border-bottom-left-radius: 14px; }
        .o-bracket-br { bottom: -5px; right: -5px; border-width: 0 5px 5px 0; border-bottom-right-radius: 14px; }

        .outdoor-qr-box {
          width: 100%; height: 100%;
          background: #ffffff;
          border-radius: 26px;
          padding: 6mm;
          box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 0 4px #34d399;
          display: flex; align-items: center; justify-content: center;
        }
        .outdoor-qr-box img { width: 100%; height: 100%; object-fit: contain; }

        /* Trust Row */
        .outdoor-trust-row {
          display: flex; gap: 8px; justify-content: center; width: 100%; margin-bottom: 2mm;
          position: relative; z-index: 2;
        }
        .outdoor-trust-pill {
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.25);
          color: #ffffff; font-size: 11px; font-weight: 800; padding: 5px 14px; border-radius: 20px;
        }

        /* Footer */
        .outdoor-footer {
          width: 100%;
          border-top: 1.5px solid rgba(255,255,255,0.15);
          padding-top: 4mm;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(255,255,255,0.75);
          font-size: 11px;
          font-weight: 700;
          position: relative; z-index: 2;
        }
      ` }} />

      <div className="no-print" style={{ background: "#080d1a", borderBottom: "1px solid #34d399", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ color: "#fff" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>20+ Yrs Sr. UI/Graphic Expert — Outside Gate Poster (A4)</h1>
          <p style={{ fontSize: "14px", color: "#34d399" }}>Designed for Main Entrance Gate & Window Glass • 118mm Scannable Viewfinder QR (3–8 ft range) • ✅ High-Res PDF</p>
        </div>
        <PrintButton />
      </div>

      <div className="print-root">
        {printItems.map((item) => (
          <div key={item.id} className="page-a4">
            {/* Top Bar */}
            <div className="outdoor-top-bar">
              <div>
                <div className="outdoor-clinic-name">{item.clinicName || "Doctor Diary Clinic"}</div>
                <div className="outdoor-doctor-sub">
                  {item.doctorName ? `Dr. ${item.doctorName.replace(/^dr\.?\s*/i, "")}` : ""}{item.doctorSpecialty ? ` • ${item.doctorSpecialty}` : ""}
                </div>
              </div>
              <div className="outdoor-badge-chip">
                <span>🚪 Main Entrance Gate</span>
              </div>
            </div>

            {/* Headline */}
            <div className="outdoor-headline-box">
              <div className="outdoor-headline-en outfit">DONT WAIT OUTSIDE IN QUEUE</div>
              <div className="outdoor-headline-hi hi">बाहर लाइन में लगने की ज़रूरत नहीं — सीधा टोकन लें</div>
              <div className="outdoor-subtext">
                Scan this QR code with any mobile camera to reserve your OPD token instantly & track live turn from anywhere.
              </div>
            </div>

            {/* Viewfinder Scannable Focal QR */}
            <div className="outdoor-qr-viewfinder">
              <div className="out-bracket o-bracket-tl" />
              <div className="out-bracket o-bracket-tr" />
              <div className="out-bracket o-bracket-bl" />
              <div className="out-bracket o-bracket-br" />

              <div className="outdoor-qr-box">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.qrDataUri} alt="QR Code" />
              </div>
            </div>

            {/* Trust Pills */}
            <div className="outdoor-trust-row">
              <span className="outdoor-trust-pill">⚡ Instant Token</span>
              <span className="outdoor-trust-pill">✓ Pay at Clinic</span>
              <span className="outdoor-trust-pill">✓ Zero App Needed</span>
            </div>

            {/* Footer */}
            <div className="outdoor-footer">
              <div>{item.address || item.clinicName || "Doctor Diary Partner Clinic"}</div>
              <div>Code: <strong style={{ color: "#34d399", fontFamily: "monospace", fontWeight: 800 }}>#{item.code}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
