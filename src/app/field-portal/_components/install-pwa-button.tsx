"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

export function InstallPwaButton({ isHorizontal = false }: { isHorizontal?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  if (!isInstallable) {
    return null; // Hide if not installable (or already installed)
  }

  if (isHorizontal) {
    return (
      <button
        onClick={handleInstallClick}
        className={cn(
          "flex flex-col items-center justify-center gap-1 p-2 w-full max-w-[80px] rounded-xl transition-colors text-blue-600 hover:text-blue-700"
        )}
      >
        <Download className="w-6 h-6" />
        <span className="text-[10px] font-medium leading-none">Install App</span>
      </button>
    );
  }

  return (
    <div className="px-3 mt-4 animate-in fade-in zoom-in duration-500 delay-300">
      <button
        onClick={handleInstallClick}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer font-medium text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
      >
        <Download className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">Install Partner App</span>
      </button>
    </div>
  );
}
