"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkInWalkIn } from "@/app/dashboard/actions";

export function CheckInWalkInButton({ patientId, disabled }: { patientId: string, disabled?: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleCheckIn = () => {
    startTransition(async () => {
      const result = await checkInWalkIn(patientId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Patient added to today's queue!");
      }
    });
  };

  return (
    <Button 
      onClick={handleCheckIn}
      disabled={isPending || disabled}
      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm gap-2 w-full sm:w-auto"
    >
      {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
      Add to Today's Queue
    </Button>
  );
}
