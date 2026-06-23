import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { PWAProvider } from "@/components/pwa-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f766e",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Doctor Diary — by NatureXpress",
  description:
    "Enterprise doctor appointment platform — fast, premium, no signup required for patients.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Doctor Diary",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
  openGraph: {
    title: "Doctor Diary — by NatureXpress",
    description:
      "Modern doctor appointment platform for elite practices. Set up in 5 minutes.",
    siteName: "Doctor Diary",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen font-sans selection:bg-teal-100 selection:text-teal-900">
        {children}
        <PWAProvider />
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
