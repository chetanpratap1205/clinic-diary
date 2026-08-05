"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmployeeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Employee Portal Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto p-4">
      <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-rose-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-sm text-slate-500 mb-6">
        An error occurred while loading your staff workspace. Please try again or contact your team lead.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => reset()} className="gap-2 bg-teal-600 hover:bg-teal-700 font-bold text-xs">
          <RefreshCcw className="w-4 h-4" /> Try again
        </Button>
      </div>
    </div>
  );
}
