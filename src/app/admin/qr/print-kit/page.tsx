import { db } from "@/db";
import { qrCodes } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "../print/print-button";

export const dynamic = "force-dynamic";

// Teal & Emerald Theme for Clean Medical look
const C = {
  main: "#0f766e",    // Teal 700
  light: "#ccfbf1",   // Teal 50
  accent: "#10b981",  // Emerald 500
  text: "#0f172a",    // Slate 900
  muted: "#64748b",   // Slate 500
};

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
    return <div className="p-5 text-red-800 bg-red-50 border border-red-200 font-sans">Error: Invalid QR IDs.</div>;
  }

  const codes = await db
    .select({ id: qrCodes.id, code: qrCodes.code })
    .from(qrCodes)
    .where(inArray(qrCodes.id, idsArray))
    .orderBy(qrCodes.code);

  if (codes.length === 0) {
    return <div className="p-5 text-red-800 bg-red-50 font-sans">Error: No QR codes found.</div>;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://doctor.naturexpress.in";

  // Generate all QR code variants for each clinic code
  const kits = await Promise.all(
    codes.map(async (item) => {
      const base = `${baseUrl}/q/${item.code}`;
      
      const qrInside = await QRCode.toDataURL(`${base}?src=reception`, {
        width: 1200, margin: 2, color: { dark: C.main, light: "#ffffff" }, errorCorrectionLevel: "H",
      });
      const qrOutside = await QRCode.toDataURL(`${base}?src=window`, {
        width: 1200, margin: 2, color: { dark: C.text, light: "#ffffff" }, errorCorrectionLevel: "H",
      });
      const qrStand = await QRCode.toDataURL(`${base}?src=stand`, {
        width: 800, margin: 2, color: { dark: C.main, light: "#ffffff" }, errorCorrectionLevel: "H",
      });
      const qrSticker = await QRCode.toDataURL(`${base}?src=sticker`, {
        width: 400, margin: 1, color: { dark: "#000000", light: "#ffffff" }, errorCorrectionLevel: "M",
      });
      
      return { ...item, qrInside, qrOutside, qrStand, qrSticker };
    })
  );

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=Noto+Sans+Devanagari:wght@600;800&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        .print-kit *, .print-kit *::before, .print-kit *::after {
          box-sizing: border-box; margin: 0; padding: 0;
          font-family: 'Inter', system-ui, sans-serif;
        }
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
          margin: 20px auto;
          background: #fff;
          position: relative;
          overflow: hidden;
          page-break-after: always;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
        }
        @media print { .page-a4 { margin: 0; box-shadow: none; } }

        /* ─── Shared Typography ─── */
        .hi { font-family: 'Noto Sans Devanagari', sans-serif; }
        
        /* ─── PAGE 1 & 2: POSTERS ─── */
        .poster-content {
          padding: 15mm;
          height: 100%; display: flex; flex-direction: column;
          align-items: center; text-align: center;
        }
        .poster-bg-teal {
          position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(180deg, #f0fdfa 0%, #ffffff 40%);
          border: 4mm solid #0f766e;
        }
        .poster-bg-slate {
          position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(180deg, #f8fafc 0%, #ffffff 40%);
          border: 4mm solid #334155;
        }
        .poster-z { position: relative; z-index: 1; }
        
        .p-title-en { font-size: 42px; font-weight: 900; color: #0f172a; line-height: 1.1; letter-spacing: -1px; margin-top: 10mm; }
        .p-title-hi { font-size: 28px; font-weight: 800; color: #0f766e; line-height: 1.4; margin-top: 5mm; }
        .p-sub { font-size: 20px; font-weight: 600; color: #475569; margin-top: 8mm; max-width: 80%; }
        
        .p-qr-box {
          margin-top: 15mm;
          width: 120mm; height: 120mm;
          background: #fff; border-radius: 20px;
          padding: 5mm;
          box-shadow: 0 20px 50px rgba(15,118,110,0.15), 0 0 0 4px #0f766e;
        }
        .p-qr-box.slate-accent { box-shadow: 0 20px 50px rgba(51,65,85,0.15), 0 0 0 4px #334155; }
        .p-qr-box img { width: 100%; height: 100%; object-fit: contain; }
        
        .p-steps {
          display: flex; gap: 10mm; margin-top: auto; margin-bottom: 10mm; width: 100%; justify-content: center;
        }
        .p-step { display: flex; flex-direction: column; align-items: center; gap: 2mm; }
        .p-step-circle { width: 12mm; height: 12mm; border-radius: 50%; background: #0f766e; color: #fff; font-size: 6mm; font-weight: 800; display: flex; align-items: center; justify-content: center; }
        .slate-accent .p-step-circle { background: #334155; }
        .p-step-txt { font-size: 14px; font-weight: 800; color: #0f172a; }

        /* ─── PAGE 3: ACRYLIC STAND (4x6 on A4) ─── */
        .stand-page { display: flex; align-items: center; justify-content: center; background: #f8fafc; }
        /* 4x6 inches = 101.6mm x 152.4mm */
        .stand-cut-area {
          width: 101.6mm; height: 152.4mm;
          background: #fff;
          border: 1px dashed #cbd5e1;
          position: relative;
          display: flex; flex-direction: column; align-items: center;
          padding: 6mm;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }
        /* Scissor cut marks */
        .cut-mark { position: absolute; font-size: 12px; color: #94a3b8; }
        .cm-tl { top: -6mm; left: -2mm; }
        .cm-tr { top: -6mm; right: -2mm; }
        .cm-bl { bottom: -6mm; left: -2mm; }
        .cm-br { bottom: -6mm; right: -2mm; }

        .stand-inner {
          width: 100%; height: 100%;
          border: 2mm solid #0f766e;
          border-radius: 4mm;
          display: flex; flex-direction: column; align-items: center;
          background: linear-gradient(180deg, #ccfbf1 0%, #ffffff 30%);
          padding: 4mm; text-align: center;
        }
        .st-title-en { font-size: 24px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-top: 2mm; }
        .st-title-hi { font-size: 16px; font-weight: 800; color: #0f766e; line-height: 1.2; margin-top: 1mm; }
        
        .st-qr-box {
          margin-top: 5mm; width: 65mm; height: 65mm;
          background: #fff; border-radius: 3mm; padding: 2mm;
          box-shadow: 0 8px 20px rgba(15,118,110,0.2), 0 0 0 2px #0f766e;
        }
        .st-qr-box img { width: 100%; height: 100%; object-fit: contain; }
        .st-footer { margin-top: auto; font-size: 10px; font-weight: 600; color: #64748b; }

        /* ─── PAGE 4-6: STICKERS (Avery L7159 - 3x8) ─── */
        .sticker-page {
          padding-top: 13.5mm; padding-left: 7.2mm; padding-right: 7.2mm;
          display: grid; grid-template-columns: repeat(3, 63.5mm); grid-template-rows: repeat(8, 33.9mm);
          gap: 0px 2.5mm; 
        }
        .sticker {
          width: 63.5mm; height: 33.9mm;
          position: relative; overflow: hidden;
          background: #fff;
          display: flex; align-items: center;
          padding: 2mm; gap: 2mm;
          outline: 1px dashed rgba(0,0,0,0.1);
          outline-offset: -1px;
        }
        @media print { .sticker { outline: none; } }
        
        /* Maximize QR size */
        .stk-qr {
          width: 28mm; height: 28mm; flex-shrink: 0;
          background: #fff; border-radius: 2mm; padding: 1mm;
          border: 1.5px solid #0f766e;
        }
        .stk-qr img { width: 100%; height: 100%; image-rendering: pixelated; }
        
        .stk-txt { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
        .stk-en { font-size: 13px; font-weight: 900; color: #0f172a; line-height: 1.1; letter-spacing: -0.3px; }
        .stk-hi { font-size: 10px; font-weight: 800; color: #0f766e; line-height: 1.2; margin-top: 2mm; }
        .stk-foot { font-size: 7px; font-weight: 800; color: #94a3b8; margin-top: 3mm; font-family: monospace; }
      ` }} />

      <div className="no-print" style={{ background: "#0f172a", borderBottom: "1px solid #334155", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ color: "#fff" }}>
          <h1 style={{ fontSize: "20px", fontWeight: 900 }}>Clinic QR Starter Kit</h1>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>1 Kit = 6 Pages (Inside, Outside, Stand, 3x Stickers). Print on A4, Margins: None.</p>
        </div>
        <PrintButton />
      </div>

      <div className="print-kit">
        {kits.map((kit) => (
          <div key={kit.id}>
            
            {/* ─── PAGE 1: INSIDE POSTER ─── */}
            <div className="page-a4">
              <div className="poster-bg-teal" />
              <div className="poster-content poster-z">
                <div className="p-title-en">Skip the Waiting Area</div>
                <div className="p-title-hi hi">इंतज़ार से बचें, सीधा डॉक्टर से मिलें</div>
                <div className="p-sub">Scan to generate your live token and track your exact turn on your phone.</div>
                
                <div className="p-qr-box">
                  <img src={kit.qrInside} alt="QR Code" />
                </div>
                
                <div className="p-steps">
                  <div className="p-step"><div className="p-step-circle">1</div><div className="p-step-txt">Scan QR<br/><span className="hi" style={{color:"#0f766e", fontSize:"12px"}}>स्कैन करें</span></div></div>
                  <div className="p-step"><div className="p-step-circle">2</div><div className="p-step-txt">Get Token<br/><span className="hi" style={{color:"#0f766e", fontSize:"12px"}}>टोकन लें</span></div></div>
                  <div className="p-step"><div className="p-step-circle">3</div><div className="p-step-txt">Meet Doctor<br/><span className="hi" style={{color:"#0f766e", fontSize:"12px"}}>डॉक्टर से मिलें</span></div></div>
                </div>
              </div>
            </div>

            {/* ─── PAGE 2: OUTSIDE POSTER ─── */}
            <div className="page-a4 slate-accent">
              <div className="poster-bg-slate" />
              <div className="poster-content poster-z">
                <div className="p-title-en" style={{color:"#1e293b"}}>Clinic Closed? Book 24/7</div>
                <div className="p-title-hi hi" style={{color:"#334155"}}>क्लिनिक बंद है? फिर भी बुकिंग करें</div>
                <div className="p-sub">Secure your appointment for tomorrow right now. No need to call!</div>
                
                <div className="p-qr-box slate-accent">
                  <img src={kit.qrOutside} alt="QR Code" />
                </div>
                
                <div className="p-steps slate-accent">
                  <div className="p-step"><div className="p-step-circle">1</div><div className="p-step-txt">Scan QR<br/><span className="hi" style={{color:"#64748b", fontSize:"12px"}}>स्कैन करें</span></div></div>
                  <div className="p-step"><div className="p-step-circle">2</div><div className="p-step-txt">Pick Time<br/><span className="hi" style={{color:"#64748b", fontSize:"12px"}}>समय चुनें</span></div></div>
                  <div className="p-step"><div className="p-step-circle">3</div><div className="p-step-txt">Confirmed!<br/><span className="hi" style={{color:"#64748b", fontSize:"12px"}}>बुकिंग पक्की</span></div></div>
                </div>
              </div>
            </div>

            {/* ─── PAGE 3: ACRYLIC STAND (4x6) ─── */}
            <div className="page-a4 stand-page">
              <div className="stand-cut-area">
                <div className="cut-mark cm-tl">✂</div>
                <div className="cut-mark cm-tr">✂</div>
                <div className="cut-mark cm-bl">✂</div>
                <div className="cut-mark cm-br">✂</div>
                
                <div className="stand-inner">
                  <div className="st-title-en">Scan & Book</div>
                  <div className="st-title-hi hi">स्कैन करें और टोकन लें</div>
                  
                  <div className="st-qr-box">
                    <img src={kit.qrStand} alt="QR Code" />
                  </div>
                  
                  <div style={{marginTop:"auto", fontWeight:800, color:"#115e59", fontSize:"14px"}}>Doctor Diary</div>
                  <div className="st-footer">Powered by NatureXpress • #{kit.code}</div>
                </div>
              </div>
            </div>

            {/* ─── PAGE 4, 5, 6: STICKERS (3x24 = 72 stickers) ─── */}
            {[1, 2, 3].map((pageNum) => (
              <div key={pageNum} className="page-a4 sticker-page">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="sticker">
                    <div className="stk-qr">
                      <img src={kit.qrSticker} alt="QR" />
                    </div>
                    <div className="stk-txt">
                      <div className="stk-en">Scan for<br/>Next Visit</div>
                      <div className="stk-hi hi">अगली बुकिंग स्कैन<br/>करके करें</div>
                      <div className="stk-foot">#{kit.code}</div>
                    </div>
                  </div>
                ))}
              </div>
            ))}

          </div>
        ))}
      </div>
    </>
  );
}
