"use client";

import { useState, useTransition } from "react";
import { Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { bulkAssignLeadsAction } from "../actions";
import { toast } from "sonner";

interface BulkAssignDialogProps {
  partnerId: string;
  partnerName: string;
  unassignedCount: number;
}

const BATCH_SIZES = [10, 25, 50, 100];

export function BulkAssignDialog({
  partnerId,
  partnerName,
  unassignedCount,
}: BulkAssignDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState(10);

  const handleAssign = () => {
    startTransition(async () => {
      const res = await bulkAssignLeadsAction(partnerId, selected);
      if (res.success) {
        toast.success(`✅ ${res.assigned} leads assigned to ${partnerName}`);
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to assign leads");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-amber-700 border-amber-200 hover:bg-amber-50"
        >
          <Zap className="w-3.5 h-3.5" />
          Assign Leads
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Bulk Assign Leads</DialogTitle>
          <DialogDescription>
            Assign unassigned leads to <strong>{partnerName}</strong>.{" "}
            {unassignedCount > 0 ? (
              <span className="text-emerald-600 font-semibold">
                {unassignedCount} unassigned leads available.
              </span>
            ) : (
              <span className="text-red-500">No unassigned leads available.</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm font-medium text-slate-700">Select batch size:</p>
          <div className="grid grid-cols-4 gap-2">
            {BATCH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelected(size)}
                disabled={size > unassignedCount}
                className={`py-3 rounded-xl text-sm font-bold transition-all border-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                  selected === size
                    ? "border-teal-500 bg-teal-50 text-teal-700"
                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-600">
            Assigning{" "}
            <strong className="text-slate-900">{Math.min(selected, unassignedCount)}</strong> leads
            to {partnerName}. Oldest unassigned leads will be prioritized.
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isPending || unassignedCount === 0}
            className="bg-teal-600 hover:bg-teal-700 min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              `Assign ${Math.min(selected, unassignedCount)} Leads`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
