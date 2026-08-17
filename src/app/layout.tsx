import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Outfit, Geist } from "next/font/google";
import "./globals.css";
import { Toaster as SonnerToaster } from "sonner";
import { PWAProvider } from "@/components/pwa-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", fallback: ["system-ui", "sans-serif"] });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap", fallback: ["system-ui", "sans-serif"] });

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f766e",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Clinic Management Software for Doctors | Doctor Diary",
  description:
    "The #1 clinic management software for doctors in India. Manage appointments, walk-ins, and follow-ups securely under your own brand.",
  keywords: [
    "clinic management software for doctors",
    "clinic management software India",
    "practice management software",
    "doctor appointment software India",
    "WhatsApp appointment reminder clinic",
    "online appointment booking for doctors India",
    "live queue tracker for doctors",
    "practice management software India",
    "independent clinic software"
  ],
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
    title: "Clinic Management Software for Doctors | Doctor Diary",
    description:
      "The #1 clinic management software for doctors in India. Manage appointments, walk-ins, and follow-ups securely under your own brand.",
    siteName: "Doctor Diary",
    type: "website",
    url: BASE_URL,
    images: [
      {
        url: `/api/og`,
        width: 1200,
        height: 630,
        alt: "Clinic Management Software for Doctors | Doctor Diary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinic Management Software for Doctors | Doctor Diary",
    description:
      "The #1 clinic management software for doctors in India. Manage appointments, walk-ins, and follow-ups securely under your own brand.",
    images: [`/api/og`],
  },
};

import Script from "next/script";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans', display: 'swap', fallback: ['system-ui', 'sans-serif'] });


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn(inter.variable, outfit.variable, "font-sans", geist.variable)}>
      <head>
        {/* Early PWA install prompt global capture — executes before ANY client bundle */}
        <script
          id="pwa-early-capture"
          dangerouslySetInnerHTML={{
            __html: `
              window.__pwaDeferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwaDeferredPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-ready', { detail: e }));
              });
              window.__pwaTriggerInstall = function() {
                if (window.__pwaDeferredPrompt && typeof window.__pwaDeferredPrompt.prompt === 'function') {
                  window.__pwaDeferredPrompt.prompt();
                  return window.__pwaDeferredPrompt.userChoice;
                }
                return Promise.resolve(null);
              };
              window.addEventListener('appinstalled', function() {
                window.__pwaDeferredPrompt = null;
                window.dispatchEvent(new CustomEvent('pwa-installed'));
              });
            `,
          }}
        />
        {/* Google tag (gtag.js) */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-Y3BEDYTXTW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-Y3BEDYTXTW');
          `}
        </Script>
      </head>
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
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}

