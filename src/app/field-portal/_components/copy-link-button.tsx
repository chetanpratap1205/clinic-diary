"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, Link2 } from "lucide-react";

export function CopyLinkButton({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://doctor.naturexpress.in";
    const url = `${baseUrl.replace(/\/$/, "")}/onboarding?ref=${referralCode}`;
    
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      onClick={copyLink}
      variant="outline"
      size="sm"
      className="gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 w-full sm:w-auto mt-3 sm:mt-0"
    >
      {copied ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
      ) : (
        <Link2 className="w-4 h-4" />
      )}
      {copied ? "Copied!" : "Copy My Referral Link"}
    </Button>
  );
}
