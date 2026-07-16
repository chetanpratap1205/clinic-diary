"use client";

import { useState } from "react";
import { MapPin, Search, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function MapsAutoFill({
  onDataFound,
}: {
  onDataFound: (data: { name: string; phone: string }) => void;
}) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleExtract = async () => {
    if (!url) {
      toast.error("Please enter a Google Maps link");
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      const res = await fetch("/api/onboarding/extract-maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || "Failed to extract data");
      }

      if (json.data.name || json.data.phone) {
        onDataFound(json.data);
        setIsSuccess(true);
        toast.success("Magic Auto-Fill Complete!");
        
        // Reset success state after a few seconds
        setTimeout(() => {
          setIsSuccess(false);
          setUrl("");
        }, 3000);
      } else {
        toast.error("Could not find clinic details in this link.");
      }

    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 p-1">
      {/* Animated subtle shimmer background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[200%] animate-[shimmer_3s_infinite]" />
      
      <div className="relative bg-white/60 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Magic Auto-Fill
          </h3>
        </div>
        
        <p className="text-xs text-slate-500 mb-3">
          Paste your Google Maps link and we'll fill out your Clinic Name and Phone automatically.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="url"
              placeholder="https://maps.app.goo.gl/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg text-sm border border-slate-200 bg-white focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-shadow"
            />
          </div>
          <Button
            type="button"
            onClick={handleExtract}
            disabled={isLoading || !url}
            className={`h-10 text-xs font-semibold rounded-lg shrink-0 transition-all ${
              isSuccess 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Extracting...
                </motion.div>
              ) : isSuccess ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Filled!
                </motion.div>
              ) : (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  Auto-Fill
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );
}
