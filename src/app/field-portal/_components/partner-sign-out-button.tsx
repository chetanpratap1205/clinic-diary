"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signOutPartner } from "../actions";

export function PartnerSignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={() => {
        startTransition(async () => {
          await signOutPartner();
        });
      }}
    >
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : (
          <LogOut className="w-3.5 h-3.5 shrink-0" />
        )}
        {isPending ? "Signing out…" : "Sign Out"}
      </button>
    </form>
  );
}
