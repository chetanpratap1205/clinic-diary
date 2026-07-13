"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff } from "lucide-react";

interface ToggleVerifiedButtonProps {
  reviewId: string;
  isVerified: boolean;
}

export function ToggleVerifiedButton({
  reviewId,
  isVerified: initialVerified,
}: ToggleVerifiedButtonProps) {
  const [verified, setVerified] = useState(initialVerified);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reviewId, isVerified: !verified }),
      });
      if (res.ok) {
        setVerified(!verified);
        toast.success(verified ? "Review marked as unverified" : "Review verified ✓");
      } else {
        toast.error("Failed to update review");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={verified ? "Click to unverify" : "Click to verify"}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
        verified
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {verified ? (
        <ShieldCheck className="w-3.5 h-3.5" />
      ) : (
        <ShieldOff className="w-3.5 h-3.5" />
      )}
      {verified ? "Verified" : "Unverified"}
    </button>
  );
}
