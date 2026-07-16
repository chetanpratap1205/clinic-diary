"use client";

import { useState, useTransition } from "react";
import { togglePartnerActiveAction } from "../actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface PartnerToggleProps {
  partnerId: string;
  isActive: boolean | null;
}

export function PartnerToggle({ partnerId, isActive }: PartnerToggleProps) {
  const [active, setActive] = useState(isActive ?? true);
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    const newVal = !active;
    startTransition(async () => {
      const res = await togglePartnerActiveAction(partnerId, newVal);
      if (res.success) {
        setActive(newVal);
        toast.success(newVal ? "Partner activated" : "Partner deactivated");
      } else {
        toast.error(res.error || "Failed to update");
      }
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={active ? "Click to deactivate" : "Click to activate"}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        active ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      {isPending ? (
        <Loader2 className="absolute inset-0 m-auto w-3 h-3 text-white animate-spin" />
      ) : (
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            active ? "translate-x-4" : "translate-x-1"
          }`}
        />
      )}
    </button>
  );
}
