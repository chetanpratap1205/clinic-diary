import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "@/components/ui/toaster";
import { PWAProvider } from "@/components/pwa-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Removed userScalable: false — WCAG 1.4.4 accessibility requirement
  themeColor: "#0f766e",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Doctor Diary — by NatureXpress",
  description:
    "Enterprise doctor appointment platform — fast, premium, no signup required for patients.",
  metadataBase: new URL(BASE_URL),
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
    url: BASE_URL,
    images: [
      {
        url: `/api/og`,
        width: 1200,
        height: 630,
        alt: "Doctor Diary — Modern appointment platform for elite practices",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doctor Diary — by NatureXpress",
    description:
      "Modern doctor appointment platform for elite practices. Set up in 5 minutes.",
    images: [`/api/og`],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen font-sans selection:bg-teal-100 selection:text-teal-900">
        {/* Skip to main content — accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-teal-700 focus:text-white focus:rounded-xl focus:font-semibold focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
        <PWAProvider />
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}

