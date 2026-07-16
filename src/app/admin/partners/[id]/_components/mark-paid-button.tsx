"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { markCommissionPaidAction } from "../../actions";

export function MarkPaidButton({ payoutId }: { payoutId: string }) {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleMarkPaid() {
    setIsUpdating(true);
    const res = await markCommissionPaidAction(payoutId);
    
    if (res.success) {
      toast.success("Marked as paid");
    } else {
      toast.error(res.error || "Failed to update");
    }
    
    setIsUpdating(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-6 px-2 text-[10px] gap-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 ml-3"
      onClick={handleMarkPaid}
      disabled={isUpdating}
    >
      {isUpdating ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <Check className="w-3 h-3 text-emerald-600" />
      )}
      Mark Paid
    </Button>
  );
}
