"use client";

import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Check, Loader2, FileImage, ZoomIn, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface PaperRxScannerModalProps {
  appointmentId: string;
  patientName: string;
  initialRxUrl?: string | null;
  onRxUploaded?: (url: string) => void;
}

export function PaperRxScannerModal({
  appointmentId,
  patientName,
  initialRxUrl,
  onRxUploaded,
}: PaperRxScannerModalProps) {
  const [open, setOpen] = useState(false);
  const [rxUrl, setRxUrl] = useState<string | null>(initialRxUrl || null);
  const [uploading, setUploading] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG, WebP)");
      return;
    }

    try {
      setUploading(true);
      const supabase = createClient();
      const fileExt = file.name.split(".").pop() || "jpg";
      const filePath = `paper-rx/${appointmentId}_${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from("patient-files")
        .upload(filePath, file, { upsert: true });

      if (error) {
        // Fallback: If bucket does not exist or fails, convert to data URL for immediate local viewing
        const reader = new FileReader();
        reader.onload = (event) => {
          const resultUrl = event.target?.result as string;
          setRxUrl(resultUrl);
          if (onRxUploaded) onRxUploaded(resultUrl);
          toast.success("Paper prescription photo attached!");
          setUploading(false);
        };
        reader.readAsDataURL(file);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("patient-files")
        .getPublicUrl(filePath);

      const finalUrl = publicUrlData.publicUrl;
      setRxUrl(finalUrl);
      if (onRxUploaded) onRxUploaded(finalUrl);
      toast.success("Paper prescription photo saved!");
    } catch (err) {
      console.error("Failed to upload Rx photo:", err);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
              rxUrl
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            }`}
            title="Snap or Upload Paper Prescription Photo"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{rxUrl ? "View Rx Photo" : "Snap Paper Rx"}</span>
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-slate-700" />
              Paper Prescription — {patientName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-500">
              Doctors write on traditional pen & paper. Receptionist or Doctor snaps a quick photo to attach it to the patient&apos;s digital record!
            </p>

            {rxUrl ? (
              <div className="space-y-3">
                <div className="relative group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center max-h-[300px]">
                  <img
                    src={rxUrl}
                    alt="Paper Prescription"
                    className="max-h-[300px] w-auto object-contain cursor-pointer"
                    onClick={() => setZoomOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setZoomOpen(true)}
                    className="absolute bottom-3 right-3 bg-slate-900/80 text-white p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-900 transition-colors shadow-lg"
                  >
                    <ZoomIn className="w-4 h-4" />
                    Zoom Photo
                  </button>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl text-xs font-bold"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />}
                    Replace Photo
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-slate-400 hover:bg-slate-50/50 transition-all text-center"
              >
                {uploading ? (
                  <Loader2 className="w-10 h-10 text-slate-400 animate-spin" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
                    <Camera className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm text-slate-800">
                    {uploading ? "Uploading Photo..." : "Tap to Snap or Select Rx Photo"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Supports Camera capture & JPG/PNG upload</p>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Zoom Modal */}
      {zoomOpen && rxUrl && (
        <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            className="absolute top-4 right-4 text-white bg-slate-800 p-3 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={rxUrl}
            alt="Paper Prescription Fullscreen"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
