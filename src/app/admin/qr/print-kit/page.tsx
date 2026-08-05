import { db } from "@/db";
import { qrCodes, clinics } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "../print/print-button";

export const dynamic = "force-dynamic";

export default async function PrintKitPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.ids) redirect("/admin/qr");

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const idsArray = sp.ids.split(",").filter((id) => uuidRegex.test(id));
  
  if (idsArray.length === 0) {
    return <div className="p-5 text-red-800 bg-red-50 font-sans">Error: Invalid QR IDs.</div>;
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
    return <div className="p-5 text-red-800 bg-red-50 font-sans">Error: No QR codes found.</div>;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  const kits = await Promise.all(
    codes.map(async (item) => {
      const base = `${baseUrl}/q/${item.code}`;
      const qrInside = await QRCode.toDataURL(`${base}?src=reception`, {
        width: 1800, margin: 1, color: { dark: "#064e3b", light: "#ffffff" }, errorCorrectionLevel: "H",
      });
      return { ...item, qrInside };
    })
  );

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@700;800;900&family=Outfit:wght@600;700;800;900&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        .print-kit *, .print-kit *::before, .print-kit *::after {
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

        /* 20+ Yrs Sr. UI/Graphic Expert A4 Poster Layout */
        .page-a4 {
          width: 210mm; height: 297mm;
          margin: 20mm auto;
          background: #ffffff;
          position: relative;
          overflow: hidden;
          box-shadow: 0 40px 120px rgba(0,0,0,0.85);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 10mm 12mm;
          text-align: center;
          border: 6px solid #064e3b;
        }

        /* Top Executive Header Card */
        .poster-top-bar {
          width: 100%;
          background: linear-gradient(135deg, #080d1a 0%, #064e3b 60%, #022c22 100%);
          border-radius: 20px;
          padding: 6mm 8mm;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 15px 40px rgba(6,78,59,0.25);
        }
        .poster-clinic-title {
          font-family: 'Outfit', sans-serif;
          font-size: 22px; font-weight: 900; color: #ffffff; line-height: 1.1; letter-spacing: -0.5px;
          text-align: left;
        }
        .poster-doctor-sub {
          font-size: 13px; font-weight: 800; color: #34d399; margin-top: 2px; text-align: left;
        }
        .poster-badge-chip {
          background: rgba(52,211,153,0.2); border: 1.5px solid rgba(52,211,153,0.5);
          color: #34d399; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.8px; whitespace: nowrap;
          display: flex; align-items: center; gap: 6px;
        }

        /* Headline Box */
        .poster-headline-box {
          margin-top: 5mm;
        }
        .poster-headline-en {
          font-family: 'Outfit', sans-serif;
          font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.05; letter-spacing: -1.2px;
        }
        .poster-headline-hi {
          font-size: 21px; font-weight: 800; color: #064e3b; margin-top: 2mm;
        }

        /* Scanner Target Frame & Focal QR Code */
        .poster-qr-viewfinder {
          width: 106mm; height: 106mm;
          position: relative;
          margin: 5mm 0;
          display: flex; align-items: center; justify-content: center;
        }
        .poster-bracket {
          position: absolute; width: 22px; height: 22px;
          border-color: #064e3b; border-style: solid;
        }
        .p-bracket-tl { top: -4px; left: -4px; border-width: 4px 0 0 4px; border-top-left-radius: 12px; }
        .p-bracket-tr { top: -4px; right: -4px; border-width: 4px 4px 0 0; border-top-right-radius: 12px; }
        .p-bracket-bl { bottom: -4px; left: -4px; border-width: 0 0 4px 4px; border-bottom-left-radius: 12px; }
        .p-bracket-br { bottom: -4px; right: -4px; border-width: 0 4px 4px 0; border-bottom-right-radius: 12px; }

        .poster-qr-box {
          width: 100%; height: 100%;
          background: #ffffff;
          border-radius: 24px;
          padding: 5mm;
          box-shadow: 0 25px 60px rgba(0,0,0,0.12), 0 0 0 2px rgba(6,78,59,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .poster-qr-box img { width: 100%; height: 100%; object-fit: contain; }

        /* 3-Step Visual Infographic Grid */
        .poster-steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 5mm;
          width: 100%;
          margin: 3mm 0;
        }
        .poster-step-card {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 18px;
          padding: 4.5mm 3mm;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .poster-step-num {
          width: 32px; height: 32px; border-radius: 50%;
          background: #064e3b; color: #ffffff;
          font-size: 14px; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 2mm; box-shadow: 0 4px 10px rgba(6,78,59,0.25);
        }
        .poster-step-title {
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 900; color: #0f172a; line-height: 1.2;
        }
        .poster-step-sub {
          font-size: 10px; font-weight: 700; color: #064e3b; margin-top: 1mm;
        }

        /* Footer Guarantee Bar */
        .poster-footer-bar {
          width: 100%;
          border-top: 1.5px dashed #cbd5e1;
          padding-top: 4mm;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
        }
        .poster-footer-badges {
          display: flex; gap: 10px;
        }
        .poster-footer-badge {
          color: #064e3b; font-weight: 800; background: #f0fdf4; border: 1px solid #bbf7d0;
          padding: 3.5px 12px; border-radius: 14px; font-size: 10px;
        }
      ` }} />

      <div className="no-print" style={{ background: "#064e3b", borderBottom: "1px solid #34d399", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ color: "#fff" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>20+ Yrs Sr. UI/Graphic Expert — Inside Reception Poster (A4)</h1>
          <p style={{ fontSize: "14px", color: "#34d399" }}>Designed for Waiting Room Walls & Reception Counter • 106mm Viewfinder Scannable QR • ✅ Print Ready PDF</p>
        </div>
        <PrintButton />
      </div>

      <div className="print-kit">
        {kits.map((kit) => (
          <div key={kit.id} className="page-a4">
            {/* Top Bar */}
            <div className="poster-top-bar">
              <div>
                <div className="poster-clinic-title">{kit.clinicName || "Doctor Diary Clinic"}</div>
                <div className="poster-doctor-sub">
                  {kit.doctorName ? `Dr. ${kit.doctorName.replace(/^dr\.?\s*/i, "")}` : ""}{kit.doctorSpecialty ? ` • ${kit.doctorSpecialty}` : ""}
                </div>
              </div>
              <div className="poster-badge-chip">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
                <span>🔴 Live OPD Queue</span>
              </div>
            </div>

            {/* Headline */}
            <div className="poster-headline-box">
              <div className="poster-headline-en outfit">SKIP THE WAITING ROOM QUEUE</div>
              <div className="poster-headline-hi hi">लाइव डिजिटल ओपीडी टोकन पाएं — फोन से कतार देखें</div>
            </div>

            {/* Central Viewfinder QR Code */}
            <div className="poster-qr-viewfinder">
              <div className="poster-bracket p-bracket-tl" />
              <div className="poster-bracket p-bracket-tr" />
              <div className="poster-bracket p-bracket-bl" />
              <div className="poster-bracket p-bracket-br" />

              <div className="poster-qr-box">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={kit.qrInside} alt="QR Code" />
              </div>
            </div>

            {/* 3 Steps */}
            <div className="poster-steps-grid">
              <div className="poster-step-card">
                <div className="poster-step-num">1</div>
                <div className="poster-step-title">Scan QR</div>
                <div className="poster-step-sub hi">कैमरे से स्कैन करें</div>
              </div>
              <div className="poster-step-card">
                <div className="poster-step-num">2</div>
                <div className="poster-step-title">Get Token</div>
                <div className="poster-step-sub hi">टोकन नंबर प्राप्त करें</div>
              </div>
              <div className="poster-step-card">
                <div className="poster-step-num">3</div>
                <div className="poster-step-title">Track Live</div>
                <div className="poster-step-sub hi">बारी लाइव देखें</div>
              </div>
            </div>

            {/* Footer */}
            <div className="poster-footer-bar">
              <div className="poster-footer-badges">
                <span className="poster-footer-badge">✓ Pay at Clinic</span>
                <span className="poster-footer-badge">✓ 100% Free</span>
                <span className="poster-footer-badge">✓ Zero App Needed</span>
              </div>
              <div>
                Code: <strong style={{ color: "#0f172a", fontFamily: "monospace", fontWeight: 800 }}>#{kit.code}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
