import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Nature Express Hub — Doctor Appointment Platform",
  description: "Book doctor appointments online — fast, easy, no signup required for patients.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen">
        {children}
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
