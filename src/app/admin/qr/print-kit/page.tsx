import { db } from "@/db";
import { qrCodes, clinics } from "@/db/schema";
import { inArray, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "../print/print-button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

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
    })
    .from(qrCodes)
    .leftJoin(clinics, eq(qrCodes.clinicId, clinics.id))
    .where(inArray(qrCodes.id, idsArray))
    .orderBy(qrCodes.code);

  if (codes.length === 0) {
    return <div className="p-5 text-red-800 bg-red-50 font-sans">Error: No QR codes found.</div>;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  // Generate QR codes with extremely high error correction and distinct colors
  const kits = await Promise.all(
    codes.map(async (item) => {
      const base = `${baseUrl}/q/${item.code}`;
      
      const qrInside = await QRCode.toDataURL(`${base}?src=reception`, {
        width: 1200, margin: 1, color: { dark: "#0A5C55", light: "#ffffff" }, errorCorrectionLevel: "H",
      });
      const qrOutside = await QRCode.toDataURL(`${base}?src=window`, {
        width: 1200, margin: 1, color: { dark: "#0F172A", light: "#ffffff" }, errorCorrectionLevel: "H",
      });
      const qrStand = await QRCode.toDataURL(`${base}?src=stand`, {
        width: 1000, margin: 1, color: { dark: "#0A5C55", light: "#ffffff" }, errorCorrectionLevel: "H",
      });
      const qrSticker = await QRCode.toDataURL(`${base}?src=sticker`, {
        width: 600, margin: 1, color: { dark: "#000000", light: "#ffffff" }, errorCorrectionLevel: "M",
      });
      
      return { ...item, qrInside, qrOutside, qrStand, qrSticker };
    })
  );

  return (
    <>
      { }
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@600;800&family=Plus+Jakarta+Sans:wght@700;800;900&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --teal-900: #042f2e;
          --teal-800: #115e59;
          --teal-700: #0f766e;
          --teal-600: #0d9488;
          --teal-brand: #0A5C55;
          --emerald-500: #10b981;
          --slate-900: #0f172a;
          --slate-800: #1e293b;
          --slate-500: #64748b;
          --slate-50: #f8fafc;
        }

        .print-kit *, .print-kit *::before, .print-kit *::after {
          box-sizing: border-box; margin: 0; padding: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .hi { font-family: 'Noto Sans Devanagari', sans-serif; }
        .head { font-family: 'Plus Jakarta Sans', sans-serif; }

        body { background: #0f172a; }

        @media print {
          @page { margin: 0; size: A4 portrait; }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: #ffffff !important;
          }
          .no-print { display: none !important; }
        }

        .page-a4 {
          width: 210mm; height: 297mm;
          margin: 20mm auto;
          background: #fff;
          position: relative;
          overflow: hidden;
          page-break-after: always;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }
        @media print { .page-a4 { margin: 0; box-shadow: none; } }

        /* ─── PAGE 1: INSIDE POSTER (Waiting Room) ─── */
        .p1-hero {
          width: 100%; height: 160mm;
          background-image: url('/assets/images/patient_hero.jpg');
          background-size: cover;
          background-position: center 20%;
          position: relative;
        }
        .p1-hero::after {
          content: '';
          position: absolute; bottom: 0; left: 0; width: 100%; height: 60mm;
          background: linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 90%, #ffffff 100%);
        }
        
        .p1-content {
          position: relative; z-index: 10;
          margin-top: -30mm;
          padding: 0 15mm;
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        
        .p1-title-en { font-size: 48px; font-weight: 900; color: var(--slate-900); line-height: 1.1; letter-spacing: -1px; }
        .p1-title-hi { font-size: 26px; font-weight: 800; color: var(--teal-700); line-height: 1.4; margin-top: 3mm; }
        
        .p1-qr-container {
          display: flex; align-items: center; justify-content: center; gap: 8mm;
          margin-top: 15mm;
          width: 100%;
        }
        
        .p1-qr-box {
          width: 90mm; height: 90mm;
          background: #fff; border-radius: 6mm;
          padding: 4mm;
          box-shadow: 0 20px 50px rgba(10,92,85,0.15), 0 0 0 2px rgba(10,92,85,0.1);
        }
        .p1-qr-box img { width: 100%; height: 100%; object-fit: contain; }
        
        .p1-steps {
          text-align: left; display: flex; flex-direction: column; gap: 6mm;
        }
        .p1-step { display: flex; align-items: center; gap: 4mm; }
        .p1-step-icon { 
          width: 14mm; height: 14mm; border-radius: 50%; 
          background: var(--teal-50); color: var(--teal-brand);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(10,92,85,0.2);
        }
        .p1-step-txt-en { font-size: 18px; font-weight: 800; color: var(--slate-900); }
        .p1-step-txt-hi { font-size: 14px; font-weight: 600; color: var(--slate-500); margin-top: 1mm; }

        /* ─── PAGE 2: OUTSIDE POSTER (Clinic Door) ─── */
        .p2-bg {
          position: absolute; inset: 0;
          background-image: url('/assets/images/teal_abstract.jpg');
          background-size: cover; background-position: center;
        }
        .p2-bg::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(10,92,85,0.9) 100%);
        }
        
        .p2-content {
          position: relative; z-index: 10;
          padding: 20mm; height: 100%;
          display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        
        .p2-badge {
          background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.5);
          color: #34d399; font-weight: 800; font-size: 16px; letter-spacing: 2px; text-transform: uppercase;
          padding: 3mm 8mm; border-radius: 50px; margin-top: 10mm; margin-bottom: 8mm;
        }
        
        .p2-title-en { font-size: 56px; font-weight: 900; color: #ffffff; line-height: 1.1; letter-spacing: -1.5px; }
        .p2-title-hi { font-size: 32px; font-weight: 800; color: #6ee7b7; line-height: 1.4; margin-top: 5mm; }
        
        .p2-qr-wrapper {
          margin-top: 20mm; position: relative;
        }
        .p2-qr-box {
          width: 130mm; height: 130mm;
          background: #ffffff; border-radius: 8mm; padding: 6mm;
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
          position: relative; z-index: 2;
        }
        .p2-qr-box img { width: 100%; height: 100%; object-fit: contain; }
        
        .p2-footer { margin-top: auto; margin-bottom: 10mm; color: rgba(255,255,255,0.7); font-size: 16px; font-weight: 600; }

        /* ─── PAGE 3: ACRYLIC STAND (4x6 Double-Sided) ─── */
        .stand-page { 
          display: flex; align-items: center; justify-content: center; 
          background: #f8fafc;
        }
        .stand-cut-area {
          width: 195mm; height: 145mm;
          background: #ffffff;
          position: relative;
          border: 1.5px dashed #cbd5e1;
          display: flex;
          box-shadow: 0 20px 50px rgba(0,0,0,0.08);
        }

        /* ─── PAGE 4: STICKERS (Avery L7159 - 3x8) ─── */
        .sticker-page {
          padding-top: 13.5mm; padding-left: 7.2mm; padding-right: 7.2mm;
          display: grid; grid-template-columns: repeat(3, 63.5mm); grid-template-rows: repeat(8, 33.9mm);
          gap: 0px 2.5mm; 
        }
        .sticker {
          width: 63.5mm; height: 33.9mm;
          position: relative; overflow: hidden;
          background: #fff; display: flex; align-items: center;
          padding: 2mm; gap: 2.5mm;
          outline: 1px dashed rgba(0,0,0,0.1); outline-offset: -1px;
        }
        @media print { .sticker { outline: none; } }
        
        .stk-qr {
          width: 26mm; height: 26mm; flex-shrink: 0;
          background: #fff; border-radius: 2mm; padding: 0.5mm;
          border: 2px solid var(--teal-brand);
        }
        .stk-qr img { width: 100%; height: 100%; image-rendering: pixelated; }
        
        .stk-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
        .stk-en { font-size: 13px; font-weight: 900; color: var(--slate-900); line-height: 1.1; letter-spacing: -0.3px; }
        .stk-hi { font-size: 10px; font-weight: 800; color: var(--teal-700); line-height: 1.2; margin-top: 1.5mm; }
        .stk-foot { font-size: 9px; font-weight: 800; color: var(--slate-900); margin-top: 3mm; font-family: monospace; }
      ` }} />

      <div className="no-print" style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ color: "#fff" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 900, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Premium Enterprise QR Kit</h1>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>1 Kit = 4 Pages (Inside Poster, Outside Poster, Acrylic Stand 4x6, 24 Stickers Sheet). Margins: None.</p>
        </div>
        <PrintButton />
      </div>

      <div className="print-kit">
        {kits.map((kit) => (
          <div key={kit.id}>
            
            {/* ─── PAGE 1: INSIDE POSTER ─── */}
            <div className="page-a4">
              <div className="p1-hero" />
              <div className="p1-content">
                <div className="p1-title-en head">Skip the Waiting Area</div>
                <div className="p1-title-hi hi">इंतज़ार से बचें, सीधा डॉक्टर से मिलें</div>
                {kit.doctorName && (
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0d9488", marginTop: 4 }}>
                    {kit.doctorName} · {kit.clinicName}
                  </div>
                )}
                
                <div className="p1-qr-container">
                  <div className="p1-qr-box">
                    <img src={kit.qrInside} alt="QR Code" />
                  </div>
                  <div className="p1-steps">
                    <div className="p1-step">
                      <div className="p1-step-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"></path><path d="M17 3h2a2 2 0 0 1 2 2v2"></path><path d="M21 17v2a2 2 0 0 1-2 2h-2"></path><path d="M7 21H5a2 2 0 0 1-2-2v-2"></path></svg>
                      </div>
                      <div>
                        <div className="p1-step-txt-en">1. Scan QR</div>
                        <div className="p1-step-txt-hi hi">अपने फोन से स्कैन करें</div>
                      </div>
                    </div>
                    <div className="p1-step">
                      <div className="p1-step-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      </div>
                      <div>
                        <div className="p1-step-txt-en">2. Get Live Token</div>
                        <div className="p1-step-txt-hi hi">अपना टोकन नंबर लें</div>
                      </div>
                    </div>
                    <div className="p1-step">
                      <div className="p1-step-icon" style={{background: "#10b981", color: "#fff", border: "none"}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <div>
                        <div className="p1-step-txt-en">3. Arrive On Time</div>
                        <div className="p1-step-txt-hi hi">समय पर आएं — लाइन नहीं</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── PAGE 2: OUTSIDE POSTER ─── */}
            <div className="page-a4">
              <div className="p2-bg" />
              <div className="p2-content">
                <div className="p2-badge">24/7 Online Token Engine</div>
                <div className="p2-title-en head">Clinic Closed or Doctor Out?</div>
                <div className="p2-title-en head" style={{marginTop:"-5px"}}>Book Slot Instantly.</div>
                <div className="p2-title-hi hi">क्लिनिक बंद है या डॉक्टर बाहर हैं? ऑनलाइन स्लॉट बुक करें</div>
                {kit.doctorName && (
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#6ee7b7", marginTop: 8 }}>
                    {kit.doctorName} · {kit.clinicName}
                  </div>
                )}
                
                <div className="p2-qr-wrapper">
                  <div className="p2-qr-box">
                    <img src={kit.qrOutside} alt="QR Code" />
                  </div>
                </div>
                
                <div className="p2-footer">Book your next visit for any open date in 30 seconds. No phone call needed!</div>
              </div>
            </div>

            {/* ─── PAGE 3: ACRYLIC STAND (4x6 DOUBLE-SIDED) ─── */}
            <div className="page-a4 stand-page">
              <div className="stand-cut-area" style={{ padding: "6mm", display: "flex", gap: "4mm" }}>
                {/* Panel 1 */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", borderRight: "1px dashed #cbd5e1", paddingRight: "4mm" }}>
                  <div style={{ background: "#0f766e", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px" }}>FRONT SIDE</div>
                  <div style={{ fontSize: "18px", fontWeight: 900, textAlign: "center" }}>Scan to <span style={{ color: "#0d9488" }}>Join Queue</span></div>
                  <div style={{ width: "48mm", height: "48mm" }}><img src={kit.qrStand} alt="QR" style={{ width: "100%", height: "100%" }} /></div>
                  <div style={{ fontSize: "9px", color: "#64748b", fontFamily: "monospace" }}>#{kit.code}</div>
                </div>

                {/* Panel 2 */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ background: "#312e81", color: "#fff", fontSize: "10px", fontWeight: 800, padding: "2px 8px", borderRadius: "4px" }}>BACK SIDE</div>
                  <div style={{ fontSize: "16px", fontWeight: 900, textAlign: "center" }}>{kit.doctorName || kit.clinicName || "Doctor Diary"}</div>
                  <div style={{ fontSize: "11px", color: "#0f766e", textAlign: "center" }}>Real-time Live Token Tracking</div>
                  <div style={{ fontSize: "9px", color: "#64748b", fontFamily: "monospace" }}>#{kit.code}</div>
                </div>
              </div>
            </div>

            {/* ─── PAGE 4: STICKERS (Avery L7159 - 24 stickers) ─── */}
            <div className="page-a4 sticker-page">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="sticker">
                  <div style={{ position: "absolute", top: "1.5mm", right: "2.5mm", fontSize: "7px", fontWeight: 900, color: "rgba(13,148,136,0.35)", letterSpacing: "0.5px", textTransform: "uppercase" }}>Doctor Diary</div>
                  <div className="stk-qr">
                    <img src={kit.qrSticker} alt="QR" />
                  </div>
                  <div className="stk-txt">
                    <div className="stk-en head">Book Next<br/>Visit Online</div>
                    <div className="stk-hi hi">अगली बार बिना लाइन के</div>
                    <div className="stk-foot">{kit.doctorName || kit.clinicName || kit.code} · #{kit.code}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>
    </>
  );
}
