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
import { Loader2, Palette, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const settingsSchema = z.object({
  name: z.string().min(2, "Clinic name must be at least 2 characters"),
  doctorName: z.string().min(2, "Doctor name must be at least 2 characters"),
  specialty: z.string(),
  consultationFee: z.number().min(0),
  address: z.string().nullable(),
  phone: z.string(),
  themeColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color").nullable(),
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
  };
  slug: string;
}

const PRESET_COLORS = ["#0ea5e9", "#10b981", "#8b5cf6", "#f43f5e", "#f59e0b", "#14b8a6"];

export function SettingsClient({ initialData, slug }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialData.name,
      doctorName: initialData.doctorName,
      specialty: initialData.specialty || "",
      consultationFee: initialData.consultationFee || 0,
      address: initialData.address || "",
      phone: initialData.phone || "",
      themeColor: initialData.themeColor || "#0ea5e9",
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* LEFT: Editor */}
      <div className="lg:col-span-3 space-y-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
              <CardTitle className="text-xl font-bold text-slate-800">Brand Identity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Clinic Name</label>
                  <Input {...register("name")} className="h-11 rounded-xl" />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Doctor Name</label>
                  <Input {...register("doctorName")} className="h-11 rounded-xl" />
                  {errors.doctorName && <p className="text-xs text-red-500">{errors.doctorName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Specialty</label>
                  <Input {...register("specialty")} placeholder="e.g. Cardiologist" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Consultation Fee (₹)</label>
                  <Input type="number" {...register("consultationFee", { valueAsNumber: true })} className="h-11 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Clinic Address</label>
                <Input {...register("address")} className="h-11 rounded-xl" />
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Theme Color
                  </label>
                  <p className="text-xs text-slate-500 mt-1">This color will be used across your public booking page.</p>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue("themeColor", color)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {themeColor === color && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                  <div className="relative">
                    <input 
                      type="color" 
                      {...register("themeColor")}
                      className="w-10 h-10 rounded-full overflow-hidden cursor-pointer opacity-0 absolute inset-0 z-10"
                    />
                    <div 
                      className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50"
                    >
                      <Palette className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                {errors.themeColor && <p className="text-xs text-red-500">{errors.themeColor.message}</p>}
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full h-12 rounded-xl text-white font-semibold shadow-md"
                  style={{ backgroundColor: themeColor }}
                >
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* RIGHT: Live Preview (Wow Factor) */}
      <div className="lg:col-span-2">
        <div className="sticky top-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center justify-between">
            Live Preview
            <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full">Booking Widget</span>
          </h3>
          
          <motion.div 
            className="w-full bg-white rounded-[2rem] border-8 border-slate-100 shadow-xl overflow-hidden relative h-[600px]"
            animate={{ borderColor: themeColor + "20" }} // 20 is subtle hex opacity
          >
            {/* Simulated Phone Top Bar */}
            <div className="h-6 w-full flex items-center justify-center absolute top-0 left-0 z-20">
              <div className="w-20 h-4 bg-slate-100 rounded-b-xl"></div>
            </div>

            <div className="h-full w-full overflow-y-auto pb-10 scrollbar-hide bg-slate-50 flex flex-col">
              <motion.div 
                className="h-1.5 w-full"
                animate={{ backgroundColor: themeColor }}
              />
              
              <div className="p-6 text-center">
                <motion.div 
                  className="w-20 h-20 mx-auto rounded-3xl shadow-md flex items-center justify-center text-white text-3xl font-bold mb-4"
                  animate={{ backgroundColor: themeColor }}
                >
                  {watchedFields.name?.[0]?.toUpperCase() || "C"}
                </motion.div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{watchedFields.name || "Clinic Name"}</h2>
                <p className="text-slate-600 font-medium text-sm mt-1">Dr. {watchedFields.doctorName || "Doctor Name"}</p>
                <p className="text-slate-500 text-xs">{watchedFields.specialty || "Specialty"}</p>
              </div>

              <div className="px-4 flex-1">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-900">Select a Date</h3>
                  </div>
                  <div className="flex gap-2 overflow-hidden">
                    {[1, 2, 3].map((d, i) => (
                      <div key={d} className={`flex-shrink-0 w-14 h-16 rounded-xl border flex flex-col items-center justify-center ${i === 0 ? 'text-white' : 'border-slate-200 text-slate-600'}`}
                           style={i === 0 ? { backgroundColor: themeColor, borderColor: themeColor } : {}}>
                        <span className="text-[10px] uppercase font-semibold">Mon</span>
                        <span className="text-lg font-bold">{d}</span>
                      </div>
                    ))}
                  </div>

                  <motion.button 
                    className="w-full h-10 rounded-xl text-white font-semibold text-sm shadow-md mt-6 flex items-center justify-center gap-2"
                    animate={{ backgroundColor: themeColor }}
                  >
                    Confirm Booking <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="px-4 mt-6 text-center">
                <a 
                  href={`/book/${slug}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-500 hover:underline"
                >
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
