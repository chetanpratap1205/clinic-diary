"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button 
      onClick={() => {
        if (typeof window !== "undefined") {
          window.print();
        }
      }}
      className="bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center gap-2"
    >
      <Printer className="w-4 h-4" />
      Print Invoice
    </Button>
  );
}
