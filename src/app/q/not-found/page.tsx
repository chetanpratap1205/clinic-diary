import Link from "next/link";
import { QrCode, AlertCircle } from "lucide-react";

export default function QrNotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-8">
          <AlertCircle className="w-12 h-12 text-red-400" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 mb-3">
          Invalid QR Code
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8">
          This QR code is not recognized. Please scan a valid Doctor Diary code.
        </p>

        <div className="flex items-center justify-center gap-2 text-slate-400">
          <QrCode className="w-4 h-4" />
          <p className="text-xs">Powered by <span className="font-bold text-slate-500">Doctor Diary by NatureXpress</span></p>
        </div>
      </div>
    </div>
  );
}
