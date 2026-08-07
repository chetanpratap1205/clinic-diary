"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  description?: string;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = "uploads",
  label = "Upload Image",
  description = "PNG, JPG or WEBP (max. 5MB)",
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  const handleUpload = async (file: File) => {
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Max size is 5MB.");
      return;
    }

    // Validate type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported.");
      return;
    }

    setIsUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${folder}/${uuidv4()}.${ext}`;

      const { error: uploadError, data } = await supabase.storage
        .from("clinic-assets")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("clinic-assets").getPublicUrl(data.path);

      onChange(publicUrl);
      toast.success("Image uploaded successfully!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />

      {value ? (
        <div className="relative w-full rounded-2xl border-2 border-slate-200 overflow-hidden group bg-slate-50">
          {/* Preview Container */}
          <div className="relative aspect-video w-full flex items-center justify-center p-4">
            <img
              src={value}
              alt="Uploaded preview"
              className="max-w-full max-h-full object-contain drop-shadow-sm rounded-lg transition-transform group-hover:scale-[1.02]"
            />
          </div>
          
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-slate-900 font-bold px-4 py-2 rounded-xl text-sm shadow-lg hover:bg-slate-50 active:scale-95 transition-all"
              type="button"
            >
              Change Image
            </button>
            <button
              onClick={handleRemove}
              className="bg-red-500 text-white p-2.5 rounded-xl shadow-lg hover:bg-red-600 active:scale-95 transition-all"
              type="button"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:bg-slate-50 hover:border-sky-400 transition-all cursor-pointer group flex flex-col items-center justify-center text-center ${
            isUploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
              <p className="text-sm font-bold text-slate-700">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-sky-50 transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-sky-500 transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">{label}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">{description}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
