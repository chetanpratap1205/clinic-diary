"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Menu,
  PlusSquare,
  Share,
  X,
} from "lucide-react";
import type { Language } from "@/lib/i18n";
import type { DevicePlatform } from "@/hooks/use-pwa-install";

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName: string;
  logoUrl?: string | null;
  themeColor?: string;
  platform: DevicePlatform | string;
  lang?: Language;
}

function Step({
  number,
  title,
  body,
  icon,
  themeColor,
}: {
  number: number;
  title: string;
  body: string;
  icon?: ReactNode;
  themeColor: string;
}) {
  return (
    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
        style={{ backgroundColor: themeColor }}
      >
        {number}
      </div>
      <div className="flex-1 text-xs">
        <p className="font-bold text-slate-900 flex items-center gap-1.5">
          <span>{title}</span>
          {icon}
        </p>
        <p className="text-slate-500 mt-0.5">{body}</p>
      </div>
    </div>
  );
}

export function PWAInstallGuideModal({
  isOpen,
  onClose,
  clinicName,
  logoUrl,
  themeColor = "#0f766e",
  platform,
  lang,
}: PWAInstallGuideModalProps) {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const activeLang = lang || (searchParams?.get("lang") === "hi" ? "hi" : "en");
  const isHindi = activeLang === "hi";
  const isIOS = platform === "ios" || platform === "ios_in_app";
  const isIOSInApp = platform === "ios_in_app";
  const isAndroidInApp = platform === "android_in_app";
  const isInApp = platform === "in_app";
  const isAndroidManual = platform === "android";
  const isDesktop = platform === "desktop";

  const copyCurrentLink = async () => {
    if (typeof window === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(window.location.href);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl border border-slate-100 shadow-2xl overflow-hidden z-10 p-6 sm:p-7 max-h-[90vh] flex flex-col"
          >
            <div
              className="absolute top-0 inset-x-0 h-1.5"
              style={{ backgroundColor: themeColor }}
            />

            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-2xl overflow-hidden shadow-md ring-1 ring-slate-900/10 flex items-center justify-center text-white font-black text-sm shrink-0"
                  style={{ backgroundColor: logoUrl ? "white" : themeColor }}
                >
                  {logoUrl ? (
                    <Image
                      src={logoUrl}
                      alt={clinicName}
                      width={44}
                      height={44}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{clinicName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900 leading-tight truncate">
                    {clinicName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>
                      {isHindi
                        ? "Official clinic web app, free"
                        : "Official Web App, Free"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 my-2 text-left overflow-y-auto pr-0.5">
              {typeof window !== "undefined" && Boolean(window.__pwaDeferredPrompt) && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-950">
                    {isHindi ? "1-Tap Install Ready!" : "1-Tap Install Available!"}
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    {isHindi
                      ? "Direct Chrome prompt se app 1 tap me install karein."
                      : "Install this clinic app with 1 tap via the browser prompt."}
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (typeof window !== "undefined" && window.__pwaDeferredPrompt) {
                        const prompt = window.__pwaDeferredPrompt;
                        try {
                          await prompt.prompt();
                          const choice = await prompt.userChoice;
                          if (choice.outcome === "accepted") {
                            onClose();
                          }
                        } catch (e) {
                          console.warn("Native prompt error:", e);
                        }
                      }
                    }}
                    className="mt-2.5 w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isHindi ? "1-Tap App Install Karein" : "Install App in 1 Tap"}</span>
                  </button>
                </div>
              )}

              {isIOSInApp && (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60">
                  <p className="text-xs font-bold text-amber-900">
                    {isHindi
                      ? "iPhone par pehle Safari me kholen"
                      : "On iPhone, open this page in Safari first"}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">
                    {isHindi
                      ? "WhatsApp, Instagram, ya Facebook browser se app add nahi hota. Menu me Open in Safari chune, phir neeche ke steps follow karein."
                      : "WhatsApp, Instagram, and Facebook browsers cannot add the app directly. Use their menu to open this page in Safari, then follow the steps below."}
                  </p>
                  <button
                    type="button"
                    onClick={copyCurrentLink}
                    className="mt-3 w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                    style={{ backgroundColor: themeColor }}
                  >
                    <Copy className="w-4 h-4" />
                    <span>{isHindi ? "Link copy karein" : "Copy Link"}</span>
                  </button>
                </div>
              )}

              {isIOS && (
                <>
                  <Step
                    number={1}
                    title={isHindi ? "Safari me Share button tap karein" : "Tap the Share button in Safari"}
                    body={
                      isHindi
                        ? "Safari toolbar me Share icon dekhein. iPhone par ye aksar bottom bar me hota hai."
                        : "Look for the Share icon in Safari's toolbar. On iPhone it is usually in the bottom bar."
                    }
                    icon={<Share className="w-4 h-4 text-sky-600 inline" />}
                    themeColor={themeColor}
                  />
                  <Step
                    number={2}
                    title={isHindi ? "Add to Home Screen chunein" : "Select Add to Home Screen"}
                    body={
                      isHindi
                        ? "Share sheet me neeche scroll karein aur Add to Home Screen option tap karein."
                        : "Scroll the share sheet and tap the Add to Home Screen option."
                    }
                    icon={<PlusSquare className="w-4 h-4 text-slate-700 inline" />}
                    themeColor={themeColor}
                  />
                  <Step
                    number={3}
                    title={isHindi ? "Top-right Add tap karein" : "Tap Add in the top-right"}
                    body={
                      isHindi
                        ? "Clinic app icon turant home screen par aa jayega."
                        : "The clinic app icon will appear on your home screen."
                    }
                    themeColor={themeColor}
                  />
                </>
              )}

              {isAndroidInApp && (
                <>
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60">
                    <p className="text-xs font-bold text-amber-900">
                      {isHindi
                        ? "Chrome me kholkar one-tap install karein"
                        : "Open in Chrome for one-tap install"}
                    </p>
                    <p className="text-[11px] text-amber-700 mt-1">
                      {isHindi
                        ? "In-app browser native install prompt nahi dikhata. Chrome me kholne ke baad Install button dobara tap karein."
                        : "In-app browsers do not show the native install prompt. Open in Chrome, then tap Install again."}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window === "undefined") return;
                        const url = window.location.href.replace(/^https?:\/\//, "");
                        window.location.href = `intent://${url}#Intent;scheme=https;package=com.android.chrome;end;`;
                      }}
                      className="mt-3 w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
                      style={{ backgroundColor: themeColor }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>{isHindi ? "Chrome me kholen" : "Open in Google Chrome"}</span>
                    </button>
                  </div>
                  <Step
                    number={1}
                    title={isHindi ? "Ya menu se Open in Chrome chunein" : "Or use the menu to open in Chrome"}
                    body={
                      isHindi
                        ? "Screen ke top-right menu me Open in Chrome option chunein."
                        : "Use the top-right menu and choose Open in Chrome."
                    }
                    icon={<Menu className="w-4 h-4 text-slate-700 inline" />}
                    themeColor={themeColor}
                  />
                </>
              )}

              {isInApp && (
                <Step
                  number={1}
                  title={isHindi ? "System browser me kholen" : "Open in your system browser"}
                  body={
                    isHindi
                      ? "Is browser ka menu kholkar Safari ya Chrome me open karein, phir app add karein."
                      : "Use this browser's menu to open the page in Safari or Chrome, then add the app from there."
                  }
                  icon={<ExternalLink className="w-4 h-4 text-slate-700 inline" />}
                  themeColor={themeColor}
                />
              )}

              {(isAndroidManual || isDesktop) && (
                <>
                  <Step
                    number={1}
                    title={
                      isAndroidManual
                        ? isHindi
                          ? "Chrome menu kholen"
                          : "Open the Chrome menu"
                        : isHindi
                          ? "Address bar ya menu check karein"
                          : "Check the address bar or menu"
                    }
                    body={
                      isAndroidManual
                        ? isHindi
                          ? "Agar native prompt nahi dikha, Chrome ke three-dot menu se Install app ya Add to Home Screen chunein."
                          : "If the native prompt did not appear, use Chrome's three-dot menu and choose Install app or Add to Home Screen."
                        : isHindi
                          ? "Address bar ke install icon ya browser menu se Install app chunein."
                          : "Use the install icon in the address bar, or choose Install app from the browser menu."
                    }
                    icon={<ArrowDown className="w-3.5 h-3.5 text-slate-600 inline" />}
                    themeColor={themeColor}
                  />
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-900">
                        {isHindi ? "Fast aur lightweight" : "Fast and lightweight"}
                      </p>
                      <p className="text-emerald-700 mt-0.5">
                        {isHindi
                          ? "App home screen se khulega aur live token updates ke liye ready rahega."
                          : "The app opens from the home screen and stays ready for live token updates."}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-5 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: themeColor }}
              >
                <span>{isHindi ? "Samajh gaya" : "Got It"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
