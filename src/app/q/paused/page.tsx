import Link from "next/link";
import { QrCode, Clock, Calendar } from "lucide-react";

// Shown when a QR code is scanned but the clinic's subscription has lapsed
export default function QrPausedPage({
  searchParams,
}: {
  searchParams: Promise<{ clinic?: string; slug?: string }>;
}) {
  return (
    <QrPausedContent searchParamsPromise={searchParams} />
  );
}

async function QrPausedContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ clinic?: string; slug?: string }>;
}) {
  const sp = await searchParamsPromise;
  const clinicName = sp.clinic ? decodeURIComponent(sp.clinic) : "This clinic";

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative inline-flex mb-8">
          <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center shadow-lg">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-black">!</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-2xl font-black text-slate-900 mb-3 leading-tight">
          Online Booking Temporarily Unavailable
        </h1>
        <p className="text-slate-600 text-base leading-relaxed mb-2">
          <span className="font-bold text-slate-800">{clinicName}</span> is temporarily not accepting online appointments.
        </p>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Please call the clinic directly to book your appointment.
        </p>

        {/* CTA */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 mb-6">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Need an appointment?</p>
              <p className="text-slate-500 text-xs mt-0.5">Visit the clinic in person or call them directly</p>
            </div>
          </div>
        </div>

        {/* Footer branding */}
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <QrCode className="w-4 h-4" />
          <p className="text-xs">Powered by <span className="font-bold text-slate-500">ClinicDiary</span></p>
        </div>
      </div>
    </div>
  );
}
