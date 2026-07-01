"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard boundary caught error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
        Something went wrong
      </h2>
      <p className="text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
        We encountered an unexpected error while loading this dashboard view. Our team has been notified.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          onClick={reset} 
          variant="default"
          className="rounded-xl h-12 px-6 font-bold flex items-center gap-2"
        >
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </Button>
        <Link href="/dashboard" passHref>
          <Button 
            variant="outline"
            className="rounded-xl h-12 px-6 font-bold flex items-center gap-2 w-full sm:w-auto border-slate-200"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard Home
          </Button>
        </Link>
      </div>
      
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-slate-100 rounded-xl text-left overflow-auto max-w-2xl w-full text-xs font-mono text-slate-700">
          <p className="font-bold mb-2">Developer details:</p>
          <p>{error.message}</p>
          <p className="mt-2 text-slate-500">{error.stack}</p>
        </div>
      )}
    </div>
  );
}
