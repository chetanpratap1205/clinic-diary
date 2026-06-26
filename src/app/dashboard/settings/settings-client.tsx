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
    },
  });

  const watchedFields = watch();
  const themeColor = watchedFields.themeColor || "#0ea5e9";

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
                    className="h-11 rounded-xl text-base"
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
                    className="h-11 rounded-xl text-base"
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
                    className="h-11 rounded-xl text-base"
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
                    className="h-11 rounded-xl text-base"
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
                  className="h-11 rounded-xl text-base"
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
                  className="h-11 rounded-xl text-base"
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
                  className="h-11 rounded-xl text-base"
                />
                {errors.logoUrl && (
                  <p className="text-xs text-red-500">{errors.logoUrl.message}</p>
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
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-slate-900/20 resize-none h-24"
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
            className="w-full bg-white rounded-[2rem] border-4 sm:border-8 border-slate-100 shadow-xl overflow-hidden relative"
            style={{ maxHeight: "520px" }}
            animate={{ borderColor: themeColor + "25" }}
          >
            {/* Simulated Phone Top Bar */}
            <div className="h-5 w-full flex items-center justify-center">
              <div className="w-16 h-3 bg-slate-100 rounded-b-xl" />
            </div>

            <div
              className="overflow-y-auto pb-8 bg-slate-50 flex flex-col scrollbar-hide"
              style={{ height: "480px" }}
            >
              <motion.div
                className="h-1.5 w-full flex-shrink-0"
                animate={{ backgroundColor: themeColor }}
              />

              <div className="p-5 text-center flex-shrink-0">
                <motion.div
                  className="w-16 h-16 mx-auto rounded-2xl shadow-md flex items-center justify-center text-white text-2xl font-bold mb-3 bg-center bg-cover bg-no-repeat overflow-hidden relative"
                  animate={{ backgroundColor: themeColor }}
                  style={{ backgroundImage: watchedFields.logoUrl ? `url(${watchedFields.logoUrl})` : "none" }}
                >
                  {!watchedFields.logoUrl && (watchedFields.name?.[0]?.toUpperCase() || "C")}
                </motion.div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {watchedFields.name || "Clinic Name"}
                </h2>
                <p className="text-slate-600 font-medium text-sm mt-0.5">
                  Dr. {watchedFields.doctorName || "Doctor Name"}
                </p>
                <p className="text-slate-500 text-xs">
                  {watchedFields.specialty || "Specialty"}
                </p>
              </div>
              
              {watchedFields.about && (
                <div className="px-4 mb-4">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm text-xs text-slate-500 line-clamp-3">
                    {watchedFields.about}
                  </div>
                </div>
              )}

              <div className="px-4 flex-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  <h3 className="text-sm font-bold text-slate-900 mb-3">
                    Select a Date
                  </h3>
                  <div className="flex gap-2 overflow-hidden">
                    {[1, 2, 3].map((d, i) => (
                      <div
                        key={d}
                        className={`flex-shrink-0 w-14 h-16 rounded-xl border flex flex-col items-center justify-center ${
                          i === 0 ? "text-white" : "border-slate-200 text-slate-600"
                        }`}
                        style={
                          i === 0
                            ? {
                                backgroundColor: themeColor,
                                borderColor: themeColor,
                              }
                            : {}
                        }
                      >
                        <span className="text-[10px] uppercase font-semibold">
                          Mon
                        </span>
                        <span className="text-lg font-bold">{d}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    className="w-full h-10 rounded-xl text-white font-semibold text-sm shadow-md mt-5 flex items-center justify-center gap-2"
                    animate={{ backgroundColor: themeColor }}
                  >
                    Confirm Booking{" "}
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="px-4 mt-5 text-center flex-shrink-0">
                <a
                  href={`/book/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
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
