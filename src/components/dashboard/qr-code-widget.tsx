"use client";

import { useState, useEffect } from "react";
import { QrCode, Download, Share2, CheckCircle2, Smartphone, Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface QrCodeWidgetProps {
  clinicId: string;
  clinicName: string;
  slug: string;
  themeColor: string;
}

export function QrCodeWidget({ clinicId, clinicName, slug, themeColor }: QrCodeWidgetProps) {
  const [hasQr, setHasQr] = useState<boolean | null>(null); // null = loading
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("https://doctor.naturexpress.in");

  useEffect(() => {
    setOrigin(window.location.origin);
    // Check if this clinic has a QR assigned
    fetch(`/api/qr/${clinicId}`, { method: "GET" })
      .then((res) => setHasQr(res.ok))
      .catch(() => setHasQr(false));
  }, [clinicId]);

  const qrImageUrl = `/api/qr/${clinicId}`;
  const bookingUrl = `${origin}/book/${slug}`;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `booking-qr-${slug}.png`;
    a.click();
    toast.success("QR code downloaded!");
  };

  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent(
      `📱 Scan to book your appointment at ${clinicName}!\n\nOr visit: ${bookingUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (hasQr === null) {
    return (
      <div
        className="rounded-3xl border p-6 animate-pulse"
        style={{ borderColor: `${themeColor}20`, background: `${themeColor}08` }}
      >
        <div className="h-5 w-48 bg-slate-200 rounded-full mb-4" />
        <div className="h-40 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  // ─── No QR assigned yet ─────────────────────────────────────────────────────
  if (!hasQr) {
    return (
      <div
        className="rounded-3xl border p-6 sm:p-7"
        style={{ borderColor: `${themeColor}20`, background: `${themeColor}06` }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: themeColor }}
          >
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base sm:text-lg">Your Booking QR Code</h2>
            <p className="text-slate-500 text-sm mt-0.5">For your clinic's appointment card</p>
          </div>
        </div>

        <div className="flex flex-col items-center py-8 text-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <QrCode className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-slate-600 font-semibold text-sm">QR code not yet activated</p>
          <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
            Your physical QR card will be activated during your onboarding. Once activated, patients can scan it to book instantly.
          </p>
          <a
            href="https://wa.me/918077170715?text=Hi%20Chetan%2C%20I%27d%20like%20to%20get%20my%20QR%20card%20activated"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[#20bd5a] transition-all active:scale-95"
          >
            <Smartphone className="w-4 h-4" />
            Request My QR Card
          </a>
        </div>
      </div>
    );
  }

  // ─── QR Assigned — show the full widget ─────────────────────────────────────
  return (
    <div
      className="rounded-3xl border overflow-hidden"
      style={{ borderColor: `${themeColor}25`, background: `linear-gradient(135deg, ${themeColor}12 0%, ${themeColor}05 100%)` }}
    >
      {/* Header */}
      <div className="px-5 sm:px-7 pt-5 sm:pt-7 pb-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: themeColor }}
          >
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-900 text-base sm:text-lg">Your Booking QR Code</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Active
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-0.5">
              Print it, display it, share it — patients scan to book instantly
            </p>
          </div>
        </div>
      </div>

      {/* QR Image + Instructions */}
      <div className="px-5 sm:px-7 pb-5 sm:pb-7">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-center sm:items-start">

          {/* QR Code Image */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt={`QR code for ${clinicName}`}
                width={160}
                height={160}
                className="block"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold text-center">
              Scan to book at {clinicName}
            </p>
          </div>

          {/* Right side — steps + actions */}
          <div className="flex-1 w-full space-y-4">
            {/* How to use */}
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
                How patients use it
              </p>
              {[
                "Scan the QR code with any phone camera",
                "Pick their preferred date and time",
                "Instant confirmation — no calls needed!",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: themeColor }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-slate-600 text-sm">{step}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 bg-[#25D366] text-white text-xs font-bold py-2.5 px-3 rounded-xl hover:bg-[#20bd5a] transition-all active:scale-95 shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                WhatsApp
              </button>
            </div>

            {/* Copy booking link */}
            <div className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
              <p className="flex-1 text-xs text-slate-500 font-mono truncate px-1">{bookingUrl}</p>
              <button
                onClick={handleCopy}
                className="flex-shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-white transition-all active:scale-95"
                style={{ backgroundColor: themeColor }}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* Pro tip */}
        <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
          <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-amber-700 text-xs leading-relaxed">
            <span className="font-bold">Pro tip:</span> Print this QR code and display it at your reception desk. Patients who scan it skip the queue call and book directly!
          </p>
        </div>
      </div>
    </div>
  );
}
