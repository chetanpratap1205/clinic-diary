import { db } from "@/db";
import { qrCodes } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { PrintButton } from "../print/print-button";

export const dynamic = "force-dynamic";

export default async function PrintStickersPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string; download?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.ids) redirect("/admin/qr");

  // Validate UUIDs to prevent Postgres crash
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const idsArray = sp.ids.split(",").filter((id) => uuidRegex.test(id));
  
  if (idsArray.length === 0) {
    return <div style={{ color: "#7f1d1d", background: "#fef2f2", padding: "20px", margin: "20px", borderRadius: "8px", border: "1px solid #fecaca", fontFamily: "sans-serif" }}><strong>Error:</strong> Invalid QR IDs provided in the URL.</div>;
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

  // Every code gets its own full A4 sheet (24 stickers).
  // Whether they print 1 clinic or a batch of 10, each gets a full dedicated page.
  const printItems = codes.flatMap(code => Array(24).fill(code));

  const stickersData = await Promise.all(
    printItems.map(async (item) => {
      const url = `${baseUrl}/q/${item.code}?src=sticker`;
      const qrDataUri = await QRCode.toDataURL(url, {
        width: 400,
        margin: 1, // tighter margin for bigger code
        color: { dark: "#0f172a", light: "#ffffff" }, // Slate 900 for premium feel
        errorCorrectionLevel: "H",
      });
      return { ...item, url, qrDataUri };
    })
  );

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+Devanagari:wght@600;700;800&display=swap" />

      <style dangerouslySetInnerHTML={{ __html: `
        /* ══════════════════════════════════════════════════════════
           RESET & A4 Sticker Sheet Layout (Avery 3x8 grid)
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
          .a4-sheet {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
            page-break-inside: avoid;
            border: none !important;
          }
          .a4-sheet:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }

        /* ─── A4 Sheet ─── */
        .a4-sheet {
          width: 210mm;
          height: 297mm;
          margin: 24px auto;
          background: #fff;
          box-shadow: 0 40px 120px rgba(0,0,0,0.7);
          position: relative;
          
          /* Avery L7159 approx margins: top/bottom 13mm, left/right 7mm */
          padding-top: 13.5mm;
          padding-left: 7.2mm;
          padding-right: 7.2mm;
          
          display: grid;
          grid-template-columns: repeat(3, 63.5mm);
          grid-template-rows: repeat(8, 33.9mm);
          gap: 0px 2.5mm; 
        }

        /* ─── Individual Sticker ─── */
        .sticker {
          width: 63.5mm;
          height: 33.9mm;
          position: relative;
          overflow: hidden;
          border-radius: 4px;
          background: #ffffff;
          display: flex;
          align-items: center;
          padding: 3mm 4mm;
          
          /* Visible on screen for preview, invisible on print */
          outline: 1px dashed rgba(15, 23, 42, 0.15);
          outline-offset: -1px;
        }
        
        @media print {
          .sticker { outline: none; }
        }

        /* ─── Ink-Friendly Premium Backgrounds ─── */
        .sticker-bg {
          position: absolute; inset: 0; z-index: 0;
          /* Very subtle dot pattern */
          background-image: radial-gradient(rgba(13, 148, 136, 0.08) 1px, transparent 1px);
          background-size: 5px 5px;
        }
        .sticker-deco {
          position: absolute; top: 0; right: 0;
          width: 35mm; height: 35mm;
          background: radial-gradient(circle at top right, rgba(20, 184, 166, 0.12) 0%, transparent 70%);
          z-index: 1;
        }
        
        /* Vibrant thick accent bar */
        .sticker-accent-bar {
          position: absolute; top: 0; left: 0; bottom: 0; width: 4.5px;
          background: linear-gradient(180deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%);
          z-index: 1;
          box-shadow: 2px 0 8px rgba(13,148,136,0.2);
        }

        /* ─── Content Wrap ─── */
        .sticker-content {
          position: relative; z-index: 2;
          display: flex; width: 100%; height: 100%;
          align-items: center; gap: 4mm;
        }

        /* ─── QR Code ─── */
        .sticker-qr-wrap {
          width: 26.5mm; height: 26.5mm;
          flex-shrink: 0; background: #fff;
          border-radius: 6px; padding: 1.5mm;
          box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15), 0 0 0 1px rgba(13, 148, 136, 0.25);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .sticker-qr-wrap img { width: 100%; height: 100%; display: block; image-rendering: pixelated; }
        
        /* Little scanner corners */
        .qr-corner { position: absolute; width: 6px; height: 6px; border-style: solid; border-color: #0d9488; }
        .qr-corner-tl { top: -1px; left: -1px; border-width: 2px 0 0 2px; border-radius: 4px 0 0 0; }
        .qr-corner-tr { top: -1px; right: -1px; border-width: 2px 2px 0 0; border-radius: 0 4px 0 0; }
        .qr-corner-bl { bottom: -1px; left: -1px; border-width: 0 0 2px 2px; border-radius: 0 0 0 4px; }
        .qr-corner-br { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; border-radius: 0 0 4px 0; }

        /* ─── Text Right Side ─── */
        .sticker-text {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; justify-content: center;
        }
        
        .sticker-header {
          display: flex; align-items: center; gap: 4px; margin-bottom: 2.5px;
        }

        .sticker-title {
          font-size: 13.5px; font-weight: 900; color: #0f172a;
          line-height: 1.1; letter-spacing: -0.3px; margin-bottom: 3.5px;
        }
        .sticker-title span { 
          background: linear-gradient(135deg, #0d9488, #0284c7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sticker-sub {
          font-size: 8.5px; font-weight: 800; color: #1e293b;
          line-height: 1.2; display: flex; align-items: center; gap: 3px;
        }
        
        .sticker-hindi {
          font-family: 'Noto Sans Devanagari', sans-serif;
          font-size: 8px; font-weight: 900; color: #64748b;
          margin-top: 3px;
        }

        /* Footer branding */
        .sticker-footer {
          position: absolute; bottom: 2mm; right: 3mm;
          display: flex; align-items: center; gap: 4px;
        }
        .sticker-brand {
          font-size: 6px; font-weight: 900; color: rgba(15,23,42,0.65);
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .sticker-code {
          font-size: 6.5px; font-weight: 800; color: #0f766e;
          font-family: monospace; letter-spacing: 0.5px;
          background: #f0fdfa; padding: 1.5px 4px; border-radius: 3px; border: 1px solid #99f6e4;
        }
      ` }} />

      {/* ══ ADMIN HEADER (no-print) ══════════════════════════════════ */}
      <div className="no-print" style={{
        background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
        borderBottom: "1px solid rgba(148,163,184,0.15)",
        padding: "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon-192.png" alt="DD" style={{ width: 46, height: 46, borderRadius: 12, boxShadow: "0 4px 14px rgba(0,0,0,0.5), 0 0 0 2px rgba(45,212,191,0.3)" }} />
          <div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontWeight: 900, fontSize: 20, color: "#fff", letterSpacing: "-0.5px" }}>
              Premium QR Stickers 
            </div>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              Format: <strong style={{color:"#fff"}}>Avery L7159 Grid</strong> (24 stickers/page) • Margins: <strong style={{color:"#fff"}}>None</strong> • ✅ Background Graphics <strong style={{color:"#2dd4bf"}}>ON</strong>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <PrintButton />
        </div>
      </div>

      {/* ══ PAGES ════════════════════════════════════════════════════ */}
      <div className="print-root">
        {Array.from({ length: Math.ceil(stickersData.length / 24) }).map((_, pageIdx) => (
          <div key={pageIdx} className="a4-sheet">
            {stickersData.slice(pageIdx * 24, (pageIdx + 1) * 24).map((item, i) => (
              <div key={`${item.id}-${i}`} className="sticker">
                <div className="sticker-bg" />
                <div className="sticker-deco" />
                <div className="sticker-accent-bar" />
                
                <div className="sticker-content">
                  <div className="sticker-qr-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.qrDataUri} alt="QR" />
                    <div className="qr-corner qr-corner-tl" />
                    <div className="qr-corner qr-corner-tr" />
                    <div className="qr-corner qr-corner-bl" />
                    <div className="qr-corner qr-corner-br" />
                  </div>
                  
                  <div className="sticker-text">
                    <div className="sticker-title">
                      Scan to <span>Book</span><br/>Next Visit
                    </div>
                    
                    <div className="sticker-sub">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      Avoid the wait queue
                    </div>
                    
                    <div className="sticker-hindi">
                      अगली बार स्कैन कर बुकिंग करें
                    </div>
                  </div>
                </div>
                
                <div className="sticker-footer">
                  <div className="sticker-brand">Doctor Diary</div>
                  <div className="sticker-code">{item.code}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
