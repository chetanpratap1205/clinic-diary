"use client";

import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share, PlusSquare, ExternalLink, CheckCircle2, ArrowDown } from "lucide-react";
import type { Language } from "@/lib/i18n";

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  clinicName: string;
  logoUrl?: string | null;
  themeColor?: string;
  platform: "ios" | "in_app" | "desktop" | "android_manual" | string;
  lang?: Language;
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
  let activeLang = lang;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const searchParams = useSearchParams();
    if (!activeLang) {
      activeLang = searchParams?.get("lang") === "hi" ? "hi" : "en";
    }
  } catch {
    if (!activeLang) activeLang = "en";
  }
  const isHindi = activeLang === "hi";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Card / Bottom Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-3xl border border-slate-100 shadow-2xl overflow-hidden z-10 p-6 sm:p-7 max-h-[90vh] flex flex-col"
          >
            {/* Top Brand Stripe */}
            <div
              className="absolute top-0 inset-x-0 h-1.5"
              style={{ backgroundColor: themeColor }}
            />

            {/* Mobile Drag Indicator */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Header: Clinic Icon + App Title + Close */}
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-11 h-11 rounded-2xl overflow-hidden shadow-md ring-1 ring-slate-900/10 flex items-center justify-center text-white font-black text-sm shrink-0"
                  style={{ backgroundColor: logoUrl ? "white" : themeColor }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt={clinicName} className="w-full h-full object-cover" />
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
                    <span>{isHindi ? "आधिकारिक क्लिनिक वेब ऐप" : "Official Web App · Free (< 1MB)"}</span>
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

            {/* Step-by-Step Instructions based on platform */}
            <div className="space-y-3.5 my-2 text-left">
              {platform === "ios" && (
                <>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: themeColor }}
                    >
                      1
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{isHindi ? "शेयर आइकन पर टैप करें" : "Tap the Share button"}</span>
                        <Share className="w-4 h-4 text-sky-600 inline" />
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {isHindi
                          ? "सफारी (Safari) ब्राउज़र के नीचे बार में 📤 शेयर आइकन पर क्लिक करें।"
                          : "Look for the Share icon in Safari's bottom toolbar (or top on iPad)."}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: themeColor }}
                    >
                      2
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{isHindi ? "'Add to Home Screen' चुनें" : "Select 'Add to Home Screen'"}</span>
                        <PlusSquare className="w-4 h-4 text-slate-700 inline" />
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {isHindi
                          ? "नीचे स्क्रॉल करें और 'Add to Home Screen' ➕ विकल्प पर टैप करें।"
                          : "Scroll down the share sheet and tap the 'Add to Home Screen' option."}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: themeColor }}
                    >
                      3
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900">
                        {isHindi ? "ऊपर 'Add' पर टैप करें" : "Tap 'Add' in Top-Right"}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {isHindi
                          ? "ऐप आपके iPhone/iPad की होम स्क्रीन पर 1-टैप एक्सेस के लिए जुड़ जाएगा।"
                          : "The official app icon will appear instantly on your home screen."}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {platform === "in_app" && (
                <>
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 mb-2">
                    <p className="text-xs font-bold text-amber-900">
                      {isHindi
                        ? "व्हाट्सएप / इंस्टाग्राम इन-ऐप ब्राउज़र में हैं?"
                        : "Opened from WhatsApp, Instagram, or Facebook?"}
                    </p>
                    <p className="text-[11px] text-amber-700 mt-1">
                      {isHindi
                        ? "ऐप डाउनलोड करने के लिए इसे क्रोम या सफारी में खोलें:"
                        : "To install as a native app, open this page in Chrome or Safari:"}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: themeColor }}
                    >
                      1
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900">
                        {isHindi ? "ऊपरी कोने में 3 डॉट्स (⋮) दबाएं" : "Tap the 3 dots (⋮ or ⋯) menu"}
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {isHindi
                          ? "स्क्रीन के ऊपर दाएं कोने में मेनू पर टैप करें।"
                          : "Located in the top right corner of your screen."}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: themeColor }}
                    >
                      2
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{isHindi ? "'Open in Chrome / Safari' चुनें" : "Tap 'Open in Chrome / Safari'"}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600 inline" />
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {isHindi
                          ? "इसके बाद आपको 1-टैप में ऐप इंस्टॉल करने का विकल्प मिल जाएगा।"
                          : "This enables instant 1-tap installation directly onto your device."}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {(platform === "desktop" || platform === "android_manual") && (
                <>
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shrink-0 shadow-xs"
                      style={{ backgroundColor: themeColor }}
                    >
                      1
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{isHindi ? "ब्राउज़र मेनू या एड्रेस बार देखें" : "Check Address Bar or Menu (⋮)"}</span>
                        <ArrowDown className="w-3.5 h-3.5 text-slate-600 inline" />
                      </p>
                      <p className="text-slate-500 mt-0.5">
                        {isHindi
                          ? "एड्रेस बार में 'Install' (↓) आइकन दबाएं या मेनू (⋮) से 'Install app' / 'Add to Home Screen' चुनें।"
                          : "Click the Install (↓) icon in the URL bar, or click browser menu (⋮) → 'Install app'."}
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-3.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-emerald-900">
                        {isHindi ? "बिना प्ले स्टोर के तुरंत तैयार" : "Fast, Lightweight & Safe"}
                      </p>
                      <p className="text-emerald-700 mt-0.5">
                        {isHindi
                          ? "यह ऐप सिर्फ < 1MB लेता है और हमेशा लाइव टोकन अपडेट दिखाता है।"
                          : "Takes < 1MB storage, zero login needed, and gives real-time token alerts."}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Got It Button */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-5 rounded-2xl text-white font-bold text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: themeColor }}
              >
                <span>{isHindi ? "समझ गया · ठीक है" : "Got It"}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
