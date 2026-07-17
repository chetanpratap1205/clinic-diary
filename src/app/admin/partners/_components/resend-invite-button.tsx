"use client";

import { useState, useTransition } from "react";
import { MailCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendPartnerInviteAction } from "../actions";
import { toast } from "sonner";

interface ResendInviteButtonProps {
  partnerId: string;
  partnerName: string;
}

export function ResendInviteButton({ partnerId, partnerName }: ResendInviteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleResend = () => {
    startTransition(async () => {
      const res = await resendPartnerInviteAction(partnerId);
      if (res.success) {
        toast.success(`✅ Invite email resent to ${partnerName}`);
      } else {
        toast.error(res.error || "Failed to resend invite");
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleResend}
      disabled={isPending}
      className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg px-3 py-2 transition-colors"
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <MailCheck className="w-3.5 h-3.5" />
      )}
      {isPending ? "Sending…" : "Resend Invite"}
    </Button>
  );
}
