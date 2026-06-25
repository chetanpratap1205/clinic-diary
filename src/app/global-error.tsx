"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Activity, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your error monitoring service here (e.g., Sentry)
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 font-sans">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
          {/* Background blobs */}
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-200/20 blur-[120px] -z-10" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-orange-200/20 blur-[100px] -z-10" />

          <div className="text-center max-w-md w-full">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                Doctor Diary
              </span>
            </Link>

            {/* Error icon */}
            <div className="w-24 h-24 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
              Something went wrong
            </h1>
            <p className="text-slate-500 text-base leading-relaxed mb-2">
              We encountered an unexpected error. Our team has been notified.
            </p>
            {error.digest && (
              <p className="text-xs text-slate-400 font-mono mb-8">
                Error ID: {error.digest}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={reset}
                size="lg"
                className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white h-12 px-6 rounded-xl font-semibold shadow-md"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Link href="/">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-6 rounded-xl font-medium bg-white border-slate-200"
                >
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
