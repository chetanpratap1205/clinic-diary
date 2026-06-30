"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateClinicSettings } from "./actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Palette, CheckCircle2, ChevronRight, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const settingsSchema = z.object({
  name: z.string().min(2, "Clinic name must be at least 2 characters"),
  doctorName: z.string().min(2, "Doctor name must be at least 2 characters"),
  specialty: z.string(),
  consultationFee: z.number().min(0),
  address: z.string().nullable(),
  phone: z.string(),
  themeColor: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color")
    .nullable(),
  about: z.string().nullable().optional(),
  logoUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  googleMapsUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
});

type SettingsData = z.infer<typeof settingsSchema>;

interface SettingsClientProps {
  initialData: {
    name: string;
    doctorName: string;
    specialty: string;
    consultationFee: number;
    address: string | null;
    phone: string;
    themeColor: string | null;
    about?: string | null;
    logoUrl?: string | null;
    googleMapsUrl?: string | null;
  };
  slug: string;
}

const PRESET_COLORS = [
  "#0ea5e9",
  "#10b981",
  "#8b5cf6",
  "#f43f5e",
  "#f59e0b",
  "#14b8a6",
];

export function SettingsClient({ initialData, slug }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData.name,
      doctorName: initialData.doctorName,
      specialty: initialData.specialty || "",
      consultationFee: initialData.consultationFee || 0,
      address: initialData.address || "",
      phone: initialData.phone || "",
      themeColor: initialData.themeColor || "#0ea5e9",
      about: initialData.about || "",
      logoUrl: initialData.logoUrl || "",
      googleMapsUrl: initialData.googleMapsUrl || "",
    },
  });

  const watchedFields = watch();
  const themeColor = watchedFields.themeColor || "#0ea5e9";
  
  const displayDoctorName = watchedFields.doctorName?.trim().startsWith("Dr.") 
    ? watchedFields.doctorName 
    : `Dr. ${watchedFields.doctorName || "Doctor Name"}`;

  const onSubmit = (data: SettingsData) => {
    startTransition(async () => {
      const res = await updateClinicSettings(data);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Settings saved successfully!");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8">
      {/* LEFT: Editor */}
      <div className="xl:col-span-3 space-y-5 sm:space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">
                Brand Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="clinic-name" className="text-sm font-semibold text-slate-700">
                    Clinic Name
                  </label>
                  <Input
                    id="clinic-name"
                    {...register("name")}
                    className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="doctor-name" className="text-sm font-semibold text-slate-700">
                    Doctor Name
                  </label>
                  <Input
                    id="doctor-name"
                    {...register("doctorName")}
                    className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  {errors.doctorName && (
                    <p className="text-xs text-red-500">
                      {errors.doctorName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="specialty" className="text-sm font-semibold text-slate-700">
                    Specialty
                  </label>
                  <Input
                    id="specialty"
                    {...register("specialty")}
                    placeholder="e.g. Cardiologist"
                    className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="consultation-fee" className="text-sm font-semibold text-slate-700">
                    Consultation Fee (₹)
                  </label>
                  <Input
                    id="consultation-fee"
                    type="number"
                    inputMode="numeric"
                    {...register("consultationFee", { valueAsNumber: true })}
                    className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="clinic-address" className="text-sm font-semibold text-slate-700">
                  Clinic Address
                </label>
                <Input
                  id="clinic-address"
                  {...register("address")}
                  className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="clinic-phone" className="text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <Input
                  id="clinic-phone"
                  {...register("phone")}
                  type="tel"
                  inputMode="tel"
                  className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="logo-url" className="text-sm font-semibold text-slate-700">
                  Logo URL (Optional)
                </label>
                <Input
                  id="logo-url"
                  {...register("logoUrl")}
                  placeholder="https://example.com/logo.png"
                  className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                />
                {errors.logoUrl && (
                  <p className="text-xs text-red-500">{errors.logoUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="google-maps-url" className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                  <span>Google Maps Embed URL (Optional)</span>
                </label>
                <Input
                  id="google-maps-url"
                  {...register("googleMapsUrl")}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Go to Google Maps → Share → Embed a map, and copy the <code className="bg-slate-100 px-1 py-0.5 rounded">src="..."</code> link.
                </p>
                {errors.googleMapsUrl && (
                  <p className="text-xs text-red-500">{errors.googleMapsUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="about" className="text-sm font-semibold text-slate-700">
                  About Clinic
                </label>
                <textarea
                  id="about"
                  {...register("about")}
                  placeholder="Brief description of your clinic or practice..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 resize-none h-24 shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Theme Color */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Theme Color
                  </label>
                  <p className="text-xs text-slate-500 mt-1">
                    Used across your public booking page.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue("themeColor", color)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm"
                      style={{ backgroundColor: color }}
                      aria-label={`Set theme color to ${color}`}
                    >
                      {themeColor === color && (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      )}
                    </button>
                  ))}
                  <div className="relative">
                    <input
                      type="color"
                      {...register("themeColor")}
                      className="w-10 h-10 rounded-full overflow-hidden cursor-pointer opacity-0 absolute inset-0 z-10"
                      aria-label="Custom color picker"
                    />
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                      <Palette className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                {errors.themeColor && (
                  <p className="text-xs text-red-500">
                    {errors.themeColor.message}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 rounded-xl text-white font-semibold shadow-md"
                  style={{ backgroundColor: themeColor }}
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* RIGHT: Live Preview — stacks below on mobile, sticky on xl */}
      <div className="xl:col-span-2">
        <div className="xl:sticky xl:top-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center justify-between">
            Live Preview
            <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
              Booking Widget
            </span>
          </h3>

          <motion.div
            className="w-full bg-slate-50 rounded-[2.5rem] sm:rounded-[3rem] border-[10px] sm:border-[14px] shadow-2xl overflow-hidden relative"
            style={{ maxHeight: "580px", borderColor: "#f1f5f9" }}
          >
            {/* Inner Phone Bezel */}
            <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.4rem] border-4 border-slate-200/50 pointer-events-none z-20" />
            
            {/* Simulated Phone Top Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex items-start justify-center z-30 pointer-events-none">
              <div className="w-24 h-4 bg-slate-100/80 backdrop-blur-md rounded-b-2xl shadow-sm border-b border-x border-slate-200/50" />
            </div>

            <div
              className="overflow-y-auto pb-8 bg-slate-50 flex flex-col scrollbar-hide h-full relative z-10"
              style={{ minHeight: "520px" }}
            >
              {/* Header Banner */}
              <motion.div
                className="h-20 w-full flex-shrink-0 relative overflow-hidden"
                style={{ 
                  backgroundColor: themeColor,
                  backgroundImage: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`
                }}
              >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              </motion.div>

              <div className="px-5 pb-5 pt-0 text-center flex-shrink-0 relative -mt-10">
                <motion.div
                  className="w-20 h-20 mx-auto rounded-3xl shadow-lg border-4 border-slate-50 flex items-center justify-center text-white text-3xl font-black mb-3 bg-center bg-cover bg-no-repeat overflow-hidden relative z-10"
                  animate={{ backgroundColor: themeColor }}
                  style={{ backgroundImage: watchedFields.logoUrl ? `url(${watchedFields.logoUrl})` : "none" }}
                >
                  {!watchedFields.logoUrl && (watchedFields.name?.[0]?.toUpperCase() || "C")}
                </motion.div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {watchedFields.name || "Clinic Name"}
                </h2>
                <p className="text-slate-600 font-bold text-sm mt-0.5">
                  {displayDoctorName}
                </p>
                <p className="text-slate-500 text-xs font-medium">
                  {watchedFields.specialty || "Specialty"}
                </p>
              </div>
              
              {watchedFields.about && (
                <div className="px-4 mb-4">
                  <div className="bg-white/60 backdrop-blur-sm p-3.5 rounded-2xl border border-white shadow-sm text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {watchedFields.about}
                  </div>
                </div>
              )}

              <div className="px-4 flex-1">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-sm border border-white p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    Select a Date
                  </h3>
                  <div className="flex gap-2.5 overflow-hidden">
                    {[1, 2, 3].map((d, i) => (
                      <div
                        key={d}
                        className={`flex-shrink-0 w-[60px] h-[72px] rounded-2xl border flex flex-col items-center justify-center transition-all ${
                          i === 0 
                            ? "text-white shadow-md shadow-slate-200/50" 
                            : "border-slate-200/60 bg-slate-50/50 text-slate-500"
                        }`}
                        style={
                          i === 0
                            ? {
                                backgroundColor: themeColor,
                                backgroundImage: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)`,
                                borderColor: themeColor,
                              }
                            : {}
                        }
                      >
                        <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                          Mon
                        </span>
                        <span className="text-xl font-black mt-0.5">{d}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    className="w-full h-12 rounded-xl text-white font-bold text-sm shadow-lg mt-6 flex items-center justify-center gap-2 transition-transform active:scale-95"
                    style={{ 
                      backgroundColor: themeColor,
                      backgroundImage: `linear-gradient(to right, ${themeColor}, ${themeColor}dd)`
                    }}
                  >
                    Confirm Booking{" "}
                    <ChevronRight className="w-4 h-4" strokeWidth={3} />
                  </motion.button>
                </div>
              </div>

              <div className="px-4 mt-6 mb-2 text-center flex-shrink-0">
                <a
                  href={`/book/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Live Page
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
