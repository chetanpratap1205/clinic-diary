"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updatePartnerAction } from "../../actions";
import { Settings2, Loader2 } from "lucide-react";

export function EditPartnerDialog({
  partner,
}: {
  partner: { id: string; name: string; targetMonthly: number | null };
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [target, setTarget] = useState(partner.targetMonthly?.toString() || "10");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    const res = await updatePartnerAction(partner.id, {
      targetMonthly: parseInt(target) || 10,
    });

    if (res.success) {
      toast.success("Partner settings updated!");
      setOpen(false);
    } else {
      toast.error(res.error || "Failed to update settings");
    }
    setIsSubmitting(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
          <Settings2 className="w-3.5 h-3.5" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Partner Settings</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="targetMonthly">Monthly Sales Target</Label>
            <Input
              id="targetMonthly"
              type="number"
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
            />
            <p className="text-xs text-slate-500">
              The number of clinic conversions this partner is expected to hit each month.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
