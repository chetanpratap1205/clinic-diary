"use client";

import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateClinicSettings } from "./actions";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Palette,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Globe,
  MapPin,
  Phone,
  User,
  Stethoscope,
  ImageIcon,
  Info,
  Navigation,
  BadgeCheck,
  Star,
  ShieldCheck,
  CalendarDays,
  Sparkles,
  Wand2,
  Bot,
  Building2,
  Fingerprint,
  Activity,
  Landmark,
  Compass,
  Feather,
  Zap,
  Command,
  Layers,
  MessageCircle,
  Link,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PresetsManager } from "./components/presets-manager";
import { ImageUploader } from "@/components/ui/image-uploader";
import { motion } from "framer-motion";
import { SPECIALTY_LIST } from "@/lib/specialty-taxonomy";

const settingsSchema = z.object({
  name: z.string().min(2, "Clinic name must be at least 2 characters"),
  doctorName: z.string().min(2, "Doctor name must be at least 2 characters"),
  degree: z.string().nullable().optional(),
  specialty: z.string(),
  consultationFee: z.number().min(0),
  freeFollowupDays: z.number().min(0).max(365), // P0: required, no default (set in defaultValues)
  address: z.string().nullable(),
  phone: z.string(),
  themeColor: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color")
    .nullable(),
  about: z.string().nullable().optional(),
  logoUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  heroImageUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  googleMapsUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  billingAddress: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  gstin: z.string().nullable().optional(),
  vitalsPresets: z.array(z.string()),
  complaintPresets: z.array(z.string()),
  diagnosisPresets: z.array(z.string()),
  treatmentPresets: z.array(z.string()),
  whatsappNumber: z.string().nullable().optional(),
  instagramUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  facebookUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  youtubeUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  websiteUrl: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
});

type SettingsData = z.infer<typeof settingsSchema>;

interface SettingsClientProps {
  initialData: {
    name: string;
    doctorName: string;
    degree: string | null;
    specialty: string;
    consultationFee: number;
    freeFollowupDays: number; // P0
    address: string | null;
    phone: string;
    themeColor: string | null;
    about?: string | null;
    logoUrl?: string | null;
    heroImageUrl?: string | null;
    googleMapsUrl?: string | null;
    billingAddress?: string | null;
    state?: string | null;
    gstin?: string | null;
    whatsappNumber?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    youtubeUrl?: string | null;
    websiteUrl?: string | null;
    vitalsPresets: string[];
    complaintPresets: string[];
    diagnosisPresets: string[];
    treatmentPresets: string[];
  };
  slug: string;
}

const PRESET_COLORS = [
  "#0F172A", // Midnight Blue
  "#059669", // Deep Emerald
  "#7C3AED", // Amethyst
  "#2563EB", // Royal Blue
  "#E11D48", // Crimson Rose
  "#D97706", // Amber Gold
];

function isValidEmbedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return (
      (u.hostname.includes("google.com") || u.hostname.includes("maps.google")) &&
      (u.pathname.includes("/maps/embed") || u.searchParams.has("pb"))
    );
  } catch {
    return false;
  }
}

function formatTimeDisplay(time: string): string {
  if (!time) return "";
  const t = time.slice(0, 5);
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function SettingsClient({ initialData, slug }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showMapsGuide, setShowMapsGuide] = useState(false);
  const [origin, setOrigin] = useState("https://doctor.naturexpress.in");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const bookingUrl = `${origin}/book/${slug}`;

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
      degree: initialData.degree || "",
      specialty: initialData.specialty || "",
      consultationFee: initialData.consultationFee || 0,
      freeFollowupDays: initialData.freeFollowupDays ?? 0, // P0
      address: initialData.address || "",
      phone: initialData.phone || "",
      themeColor: initialData.themeColor || "#0ea5e9",
      about: initialData.about || "",
      logoUrl: initialData.logoUrl || "",
      heroImageUrl: initialData.heroImageUrl || "",
      googleMapsUrl: initialData.googleMapsUrl || "",
      billingAddress: initialData.billingAddress || "",
      state: initialData.state || "",
      gstin: initialData.gstin || "",
      whatsappNumber: initialData.whatsappNumber || "",
      instagramUrl: initialData.instagramUrl || "",
      facebookUrl: initialData.facebookUrl || "",
      youtubeUrl: initialData.youtubeUrl || "",
      websiteUrl: initialData.websiteUrl || "",
      vitalsPresets: initialData.vitalsPresets || [],
      complaintPresets: initialData.complaintPresets || [],
      diagnosisPresets: initialData.diagnosisPresets || [],
      treatmentPresets: initialData.treatmentPresets || [],
    },
  });

  const watchedFields = watch();
  const themeColor = watchedFields.themeColor || "#0ea5e9";

  const displayDoctorName = watchedFields.doctorName?.trim().startsWith("Dr.")
    ? watchedFields.doctorName
    : `Dr. ${watchedFields.doctorName || "Doctor Name"}`;

  const hasValidMapsUrl = !!watchedFields.googleMapsUrl && watchedFields.googleMapsUrl.startsWith("http");

  const onSubmit = (data: SettingsData) => {
    startTransition(async () => {
      const res = await updateClinicSettings(data);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Website updated successfully!");
      }
    });
  };

  const generateSmartAbout = () => {
    const { name, doctorName, specialty, address } = watchedFields;
    const docName = doctorName || "our lead specialist";
    const clinicName = name || "Our clinic";
    const spec = specialty || "medical care";
    const loc = address ? ` in ${address.split(',')[0]}` : "";
    
    const template = `Welcome to ${clinicName}, a premium healthcare destination${loc}. Led by ${docName}, a highly trusted expert in ${spec}, we are committed to revolutionizing your healthcare experience. \n\nWe understand that your time is valuable. That's why we've implemented a state-of-the-art digital booking system with transparent live queues, ensuring zero waiting room anxiety. \n\nWhether you need routine consultations or specialized treatments, our patient-first approach guarantees personalized, compassionate care from the moment you book. Experience modern healthcare without the hassle—book your appointment today.`;
    
    setValue("about", template, { shouldDirty: true, shouldValidate: true });
    toast.success("Premium 'About' section generated!");
  };

  const copyAIPrompt = async () => {
    const { name, doctorName, specialty, address } = watchedFields;
    const prompt = `Act as an expert healthcare copywriter. Write a premium, highly SEO-optimized "About Clinic" section (max 3 short paragraphs) for my clinic. 
    
Here are my details:
Clinic Name: ${name || "[My Clinic]"}
Doctor Name: ${doctorName || "[My Name]"}
Specialty: ${specialty || "[My Specialty]"}
Location: ${address || "[My City]"}

Make it sound extremely premium, trustworthy, and empathetic. Emphasize that we use a modern SaaS platform (Doctor Diary) that offers instant online booking, live queue tracking, and zero waiting time. The tone should be welcoming but highly professional, highlighting our patient-first approach and eliminating the pain points of traditional crowded clinics. Do not include any placeholder brackets in the final output.`;
    
    await navigator.clipboard.writeText(prompt);
    toast.success("AI Prompt copied to clipboard!");
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(bookingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const msg = encodeURIComponent(
      `Book an appointment at ${watchedFields.name || "our clinic"}: ${bookingUrl}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* ── MAIN FORM + LIVE PREVIEW ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8">

        {/* LEFT: Form */}
        <div className="xl:col-span-3 space-y-5 sm:space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full h-auto p-1.5 bg-slate-100 sm:rounded-2xl rounded-xl flex flex-col sm:grid sm:grid-cols-3 gap-1.5 mb-6">
                <TabsTrigger value="profile" className="w-full rounded-lg sm:rounded-xl py-2.5 text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2 transition-all">
                  <User className="w-4 h-4" /> Profile & Brand
                </TabsTrigger>
                <TabsTrigger value="location" className="w-full rounded-lg sm:rounded-xl py-2.5 text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2 transition-all">
                  <MapPin className="w-4 h-4" /> Location
                </TabsTrigger>
                <TabsTrigger value="presets" className="w-full rounded-lg sm:rounded-xl py-2.5 text-sm font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center justify-center gap-2 transition-all">
                  <Zap className="w-4 h-4" /> Presets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-5 focus:outline-none">
                {/* ── SECTION: Clinic Profile ── */}
            <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center border shadow-sm transition-colors" style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30`, color: themeColor }}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  Clinic Profile
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Appears as your website headline</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="clinic-name" className="text-sm font-semibold text-slate-700">
                      Clinic Name *
                    </label>
                    <Input
                      id="clinic-name"
                      {...register("name")}
                      className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                    />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="doctor-name" className="text-sm font-semibold text-slate-700">
                      Doctor Name *
                    </label>
                    <Input
                      id="doctor-name"
                      {...register("doctorName")}
                      className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                    />
                    {errors.doctorName && <p className="text-xs text-red-500">{errors.doctorName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="degree" className="text-sm font-semibold text-slate-700">
                      Degree & Qualifications (SEO)
                    </label>
                    <Input
                      id="degree"
                      {...register("degree")}
                      placeholder="e.g. MBBS, MD (Medicine)"
                      className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                    />
                    {errors.degree && <p className="text-xs text-red-500">{errors.degree.message}</p>}
                  </div>
                </div>

                {/* Brand Imagery */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="space-y-3 max-w-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center border border-sky-100 flex-shrink-0">
                        <User className="w-4 h-4 text-sky-500" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-800">Doctor Profile Picture</label>
                        <p className="text-xs font-medium text-slate-500">Professional portrait for your booking page</p>
                      </div>
                    </div>
                    <ImageUploader 
                      value={watchedFields.logoUrl || ""}
                      onChange={(url) => setValue("logoUrl", url, { shouldValidate: true, shouldDirty: true })}
                      folder={`clinic-${slug}/logos`}
                      label="Upload Doctor Photo"
                      description="Square PNG/JPG (max 2MB)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-2">
                    <label htmlFor="specialty" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-slate-400" /> Domain / Specialty
                    </label>
                    <Input
                      id="specialty"
                      list="specialty-list"
                      {...register("specialty")}
                      placeholder="Type or select a specialty..."
                      className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                    />
                    <datalist id="specialty-list">
                      {SPECIALTY_LIST.map((spec) => (
                        <option key={spec} value={spec} />
                      ))}
                    </datalist>
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

                  {/* P0: Free Follow-up Policy */}
                  <div className="space-y-2">
                    <label htmlFor="free-followup-days" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">₹0</span>
                      Free Follow-up Window (Days)
                    </label>
                    <Input
                      id="free-followup-days"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={365}
                      {...register("freeFollowupDays", { valueAsNumber: true })}
                      className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {[0, 3, 7, 14, 30].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setValue("freeFollowupDays", d, { shouldValidate: true })}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all"
                        >
                          {d === 0 ? "No free" : `${d} days`}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400">
                      {watchedFields.freeFollowupDays && watchedFields.freeFollowupDays > 0
                        ? `Patients who return within ${watchedFields.freeFollowupDays} days of their last visit will be marked as a free follow-up (₹0).`
                        : "Set to 0 to charge full fee for all follow-up visits."}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="about" className="text-sm font-semibold text-slate-700">
                    About the Clinic / Doctor
                  </label>
                  <textarea
                    id="about"
                    {...register("about")}
                    placeholder="E.g. Dr. Sharma has 15+ years of experience in cardiology. Our clinic is equipped with modern diagnostic tools..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 resize-none h-32 shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  
                  {/* AI Generation Tools */}
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-indigo-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Feather className="w-3.5 h-3.5" /> Need help writing?
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={generateSmartAbout}
                          className="w-full flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold py-2.5 px-3 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Auto-Generate (Instant)
                        </button>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          Fills in a premium, SEO-optimized template instantly using your details.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={copyAIPrompt}
                          className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white text-xs font-bold py-2.5 px-3 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                        >
                          <Command className="w-3.5 h-3.5" />
                          Copy Prompt for ChatGPT
                        </button>
                        <ol className="text-[10px] text-slate-500 leading-tight list-decimal pl-3 space-y-0.5">
                          <li>Click copy</li>
                          <li>Open ChatGPT or Gemini</li>
                          <li>Paste and hit send</li>
                          <li>Paste the result back above</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── SECTION: Brand & Logo ── */}
            <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center border shadow-sm transition-colors" style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30`, color: themeColor }}>
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  Brand & Logo
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Customize how your website looks</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-5">
                {/* Theme Color */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Theme Color</label>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Used for your website's hero, buttons, and accents
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setValue("themeColor", color)}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm border border-black/5"
                        style={{ backgroundColor: color }}
                        aria-label={`Set theme color to ${color}`}
                      >
                        {themeColor === color && <CheckCircle2 className="w-4 h-4 text-white drop-shadow-md" />}
                      </button>
                    ))}
                    <div className="w-px h-6 bg-slate-200 mx-1" />
                    <label
                      htmlFor="custom-color"
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm border border-slate-200 overflow-hidden relative cursor-pointer group"
                      title="Pick custom color"
                      style={{ backgroundColor: !PRESET_COLORS.includes(themeColor) ? themeColor : "#ffffff" }}
                    >
                      <input
                        type="color"
                        id="custom-color"
                        value={themeColor}
                        onChange={(e) => setValue("themeColor", e.target.value)}
                        className="absolute inset-[-10px] w-20 h-20 opacity-0 cursor-pointer"
                      />
                      <Palette className={`w-4 h-4 ${!PRESET_COLORS.includes(themeColor) ? "text-white drop-shadow-md" : "text-slate-400 group-hover:text-slate-600"}`} />
                    </label>
                  </div>
                  {errors.themeColor && <p className="text-xs text-red-500">{errors.themeColor.message}</p>}
                </div>
              </CardContent>
            </Card>
              </TabsContent>

              <TabsContent value="location" className="space-y-5 focus:outline-none">
            {/* ── SECTION: Billing & Tax Details ── */}
            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white/70 backdrop-blur-xl">
              <div className="h-1.5 w-full bg-slate-800" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center border border-slate-200 bg-slate-50 shadow-sm text-slate-600">
                    <Landmark className="w-4 h-4" />
                  </div>
                  Billing & Tax Details
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">Configure your B2B invoice details for Doctor Diary subscriptions.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Info className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 mb-0.5">Claim 18% Input Tax Credit (ITC)</h4>
                    <p className="text-xs text-blue-800/80 leading-relaxed">
                      If your clinic is GST registered, enter your GSTIN and registered billing address below. We will automatically generate B2B Tax Invoices for your subscription, allowing your CA to claim ITC and effectively making your subscription 18% cheaper.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="clinic-gstin" className="text-sm font-semibold text-slate-700 flex items-center justify-between">
                        GSTIN
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-wider">Optional</span>
                      </label>
                      <Input
                        id="clinic-gstin"
                        {...register("gstin")}
                        placeholder="e.g. 29ABCDE1234F1Z5"
                        className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors uppercase font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="clinic-state" className="text-sm font-semibold text-slate-700">
                        State (For Tax Calculation)
                      </label>
                      <Input
                        id="clinic-state"
                        {...register("state")}
                        placeholder="e.g. Maharashtra"
                        className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="clinic-billing-address" className="text-sm font-semibold text-slate-700">
                      Registered Billing Address
                    </label>
                    <Input
                      id="clinic-billing-address"
                      {...register("billingAddress")}
                      placeholder="Full registered address for tax invoices"
                      className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── SECTION: Contact & Location ── */}
            <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center border shadow-sm transition-colors" style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30`, color: themeColor }}>
                    <Compass className="w-4 h-4" />
                  </div>
                  Contact & Location
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Patients can call and find your clinic from your website</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="clinic-phone" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
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
                    <label htmlFor="clinic-address" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-slate-400" /> Clinic Address
                    </label>
                    <Input
                      id="clinic-address"
                      {...register("address")}
                      placeholder="Full address for Google Maps directions"
                      className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  The address you enter automatically becomes a clickable "Get Directions" link on your website — patients can tap to open Google Maps.
                </p>

                {/* Google Maps Link */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label htmlFor="google-maps-url" className="text-sm font-semibold text-slate-700">
                      Google Maps Link (Optional)
                    </label>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Open your clinic in Google Maps, tap Share, and paste the link here (e.g. <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">https://maps.app.goo.gl/...</code>).
                  </p>
                  <Input
                    id="google-maps-url"
                    {...register("googleMapsUrl")}
                    placeholder="https://maps.app.goo.gl/..."
                    className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  {errors.googleMapsUrl && <p className="text-xs text-red-500">{errors.googleMapsUrl.message}</p>}
                </div>
              </CardContent>
            </Card>

            {/* ── SECTION: Social & Contact Links ── */}
            <Card className="rounded-3xl border-slate-200 shadow-sm overflow-hidden bg-white/70 backdrop-blur-xl">
              <div className="h-1.5 w-full bg-slate-800" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center border border-slate-200 bg-slate-50 shadow-sm text-slate-600">
                    <Globe className="w-4 h-4" />
                  </div>
                  Social & Contact Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* WhatsApp */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="whatsappNumber" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-[#25D366]" /> WhatsApp Number
                    </label>
                  </div>
                  <Input
                    id="whatsappNumber"
                    {...register("whatsappNumber")}
                    placeholder="e.g. 9876543210"
                    className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  {errors.whatsappNumber && <p className="text-xs text-red-500">{errors.whatsappNumber.message}</p>}
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="instagramUrl" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Link className="w-4 h-4 text-pink-500" /> Instagram Link
                    </label>
                  </div>
                  <Input
                    id="instagramUrl"
                    {...register("instagramUrl")}
                    placeholder="https://instagram.com/yourclinic"
                    className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  {errors.instagramUrl && <p className="text-xs text-red-500">{errors.instagramUrl.message}</p>}
                </div>

                {/* YouTube */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="youtubeUrl" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Link className="w-4 h-4 text-red-500" /> YouTube Link
                    </label>
                  </div>
                  <Input
                    id="youtubeUrl"
                    {...register("youtubeUrl")}
                    placeholder="https://youtube.com/@yourchannel"
                    className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  {errors.youtubeUrl && <p className="text-xs text-red-500">{errors.youtubeUrl.message}</p>}
                </div>

                {/* Website */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="websiteUrl" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-500" /> Clinic Website
                    </label>
                  </div>
                  <Input
                    id="websiteUrl"
                    {...register("websiteUrl")}
                    placeholder="https://yourclinic.com"
                    className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  {errors.websiteUrl && <p className="text-xs text-red-500">{errors.websiteUrl.message}</p>}
                </div>

              </CardContent>
            </Card>

            </TabsContent>

              <TabsContent value="presets" className="space-y-5 focus:outline-none">
                <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center border shadow-sm transition-colors" style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30`, color: themeColor }}>
                        <Layers className="w-4 h-4" />
                      </div>
                      1-Tap Clinical Presets
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">Speed up consultations with quick-tap pills.</p>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 space-y-4">
                    <PresetsManager
                      title="Vitals Presets"
                      description="Common vitals templates."
                      placeholder="e.g. BP 120/80, WT 75kg"
                      items={watchedFields.vitalsPresets}
                      onChange={(items) => setValue("vitalsPresets", items, { shouldDirty: true })}
                      themeColor={themeColor}
                    />
                    <PresetsManager
                      title="Complaint Presets"
                      description="Most frequent patient complaints."
                      placeholder="e.g. Fever for 3 days"
                      items={watchedFields.complaintPresets}
                      onChange={(items) => setValue("complaintPresets", items, { shouldDirty: true })}
                      themeColor={themeColor}
                    />
                    <PresetsManager
                      title="Diagnosis Presets"
                      description="Standard diagnoses you assign."
                      placeholder="e.g. Viral Pharyngitis"
                      items={watchedFields.diagnosisPresets}
                      onChange={(items) => setValue("diagnosisPresets", items, { shouldDirty: true })}
                      themeColor={themeColor}
                    />
                    <PresetsManager
                      title="Treatment / Rx Presets"
                      description="Combinations of medicines you often prescribe."
                      placeholder="e.g. Tab Paracetamol 500mg 1-0-1"
                      items={watchedFields.treatmentPresets}
                      onChange={(items) => setValue("treatmentPresets", items, { shouldDirty: true })}
                      themeColor={themeColor}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl text-white font-bold shadow-md text-base"
              style={{ backgroundColor: themeColor }}
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Save & Publish Website"
              )}
            </Button>
          </form>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="xl:col-span-2">
          <div className="xl:sticky xl:top-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Live Preview</h3>
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                Patient view
              </span>
            </div>

            {/* Phone Frame */}
            <motion.div
              className="w-full bg-slate-50 rounded-[2.5rem] sm:rounded-[3rem] border-[10px] sm:border-[14px] shadow-2xl overflow-hidden relative"
              style={{ maxHeight: "640px", borderColor: "#e2e8f0" }}
            >
              {/* Notch */}
              <div className="absolute top-0 inset-x-0 h-5 flex items-start justify-center z-30 pointer-events-none">
                <div className="w-20 h-3.5 bg-slate-200/90 rounded-b-xl" />
              </div>

              <div
                className="overflow-y-auto scrollbar-hide"
                style={{ minHeight: "500px", maxHeight: "600px" }}
              >
                {/* Hero Banner */}
                <div
                  className="relative px-4 pt-6 pb-5"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}cc 100%)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Mini Logo — uses img tag with onError, never backgroundImage */}
                    <div
                      className="w-14 h-14 rounded-2xl border-2 border-white/30 flex items-center justify-center text-white font-black text-lg flex-shrink-0 overflow-hidden"
                      style={{ backgroundColor: `${themeColor}88` }}
                    >
                      {watchedFields.logoUrl && !logoError ? (
                        <img
                          src={watchedFields.logoUrl}
                          alt={watchedFields.name || "logo"}
                          className="w-full h-full object-cover"
                          onError={() => setLogoError(true)}
                        />
                      ) : (
                        watchedFields.name?.[0]?.toUpperCase() || "C"
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-0.5">
                        <BadgeCheck className="w-3 h-3 text-white/80" />
                        <span className="text-white/70 text-[9px] font-bold uppercase tracking-wider">Verified</span>
                      </div>
                      <p className="text-white font-black text-sm leading-tight">
                        {watchedFields.name || "Clinic Name"}
                      </p>
                      <p className="text-white/80 text-[11px] font-semibold">{displayDoctorName}</p>
                      {watchedFields.specialty && (
                        <p className="text-white/60 text-[10px]">{watchedFields.specialty}</p>
                      )}
                    </div>
                  </div>

                  {/* Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {watchedFields.consultationFee ? (
                      <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-1 rounded-full border border-white/30">
                        ₹{watchedFields.consultationFee}
                      </span>
                    ) : null}
                    {watchedFields.phone && (
                      <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-1 rounded-full border border-white/30">
                        Call Now
                      </span>
                    )}
                    {watchedFields.address && (
                      <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-1 rounded-full border border-white/30">
                        Directions
                      </span>
                    )}
                  </div>
                </div>

                {/* About */}
                {watchedFields.about && (
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">About</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed line-clamp-3">
                      {watchedFields.about}
                    </p>
                  </div>
                )}

                {/* Trust Signals */}
                <div className="px-3 py-2.5 grid grid-cols-3 gap-1.5 border-b border-slate-100">
                  {[
                    { icon: ShieldCheck, label: "Secure" },
                    { icon: Star, label: "Instant" },
                    { icon: CalendarDays, label: "No Signup" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="bg-white rounded-xl p-1.5 text-center shadow-sm border border-slate-100">
                      <Icon className="w-3 h-3 mx-auto mb-0.5" style={{ color: themeColor }} />
                      <p className="text-[8px] font-black text-slate-600">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Booking Card Preview */}
                <div className="px-3 py-3">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Tab Bar */}
                    <div className="p-1.5 bg-slate-100/80 m-2.5 mb-2 rounded-xl flex gap-1">
                      <div className="flex-1 py-1.5 text-center text-[9px] font-black bg-white rounded-lg shadow-sm text-slate-800">
                        Book
                      </div>
                      <div className="flex-1 py-1.5 text-center text-[9px] font-medium text-slate-400">
                        Track Queue
                      </div>
                    </div>

                    <div className="px-3 pb-4">
                      <p className="text-[10px] font-black text-slate-900 mb-1.5">Select a Date</p>
                      <div className="flex gap-1.5 overflow-hidden">
                        {[1, 2, 3].map((d, i) => (
                          <div
                            key={d}
                            className="flex-shrink-0 w-[44px] h-[52px] rounded-xl border flex flex-col items-center justify-center"
                            style={
                              i === 0
                                ? { backgroundColor: themeColor, borderColor: themeColor }
                                : { backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }
                            }
                          >
                            <span className={`text-[8px] font-bold uppercase ${i === 0 ? "text-white/90" : "text-slate-400"}`}>
                              Mon
                            </span>
                            <span className={`text-sm font-black ${i === 0 ? "text-white" : "text-slate-600"}`}>
                              {d}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div
                        className="w-full py-2.5 rounded-xl text-white font-bold text-[10px] text-center mt-3 shadow-sm"
                        style={{ backgroundColor: themeColor }}
                      >
                        Confirm Booking →
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address in preview */}
                {watchedFields.address && (
                  <div className="px-3 pb-3">
                    <div className="flex items-start gap-2 bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                      <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: themeColor }} />
                      <p className="text-[9px] text-slate-600 leading-relaxed">{watchedFields.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <p className="text-center text-xs text-slate-400">
              Changes appear instantly on your website after saving
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
