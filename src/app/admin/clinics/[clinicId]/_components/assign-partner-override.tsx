"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { assignReferredByAction, generateManualCommissionAction } from "../../actions";
import { Loader2, RefreshCw } from "lucide-react";

export function AssignPartnerOverride({
  clinicId,
  currentPartnerId,
  partners,
}: {
  clinicId: string;
  currentPartnerId: string | null;
  partners: { id: string; name: string }[];
}) {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleAssign(partnerId: string) {
    setIsAssigning(true);
    const res = await assignReferredByAction(clinicId, partnerId || null);
    if (res.success) {
      toast.success("Referral partner updated.");
    } else {
      toast.error(res.error);
    }
    setIsAssigning(false);
  }

  async function handleGenerate() {
    setIsGenerating(true);
    const res = await generateManualCommissionAction(clinicId);
    if (res.success) {
      toast.success(`Generated ${res.count} missing commission payouts.`);
    } else {
      toast.error(res.error);
    }
    setIsGenerating(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <select
          disabled={isAssigning}
          className="h-9 text-sm rounded-md border border-slate-200 px-3 bg-slate-50 min-w-[200px]"
          value={currentPartnerId || ""}
          onChange={(e) => handleAssign(e.target.value)}
        >
          <option value="">No Partner (Organic)</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        {isAssigning && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
      </div>

      {currentPartnerId && (
        <Button
          variant="outline"
          size="sm"
          disabled={isGenerating}
          onClick={handleGenerate}
          className="text-xs h-8 gap-2 border-slate-200"
        >
          {isGenerating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          )}
          Generate Missing Commissions
        </Button>
      )}
    </div>
  );
}
