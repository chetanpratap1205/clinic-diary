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
} from "lucide-react";
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
  "#6366f1",
  "#ef4444",
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

  const hasValidMapsUrl =
    watchedFields.googleMapsUrl && isValidEmbedUrl(watchedFields.googleMapsUrl);

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

      {/* ── SHARE YOUR WEBSITE CARD ─────────────────────────────────── */}
      <Card className="border-0 shadow-lg rounded-3xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${themeColor}15 0%, ${themeColor}08 100%)` }}>
        <CardContent className="p-5 sm:p-7">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: themeColor }}>
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base sm:text-lg">Your Clinic Website</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Share this link with patients. Print it on your visiting card. Add it to your Instagram bio.
              </p>
            </div>
          </div>

          {/* URL Display */}
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-slate-200 p-2 pr-3 mb-3 shadow-sm">
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-700 truncate px-2">
                {bookingUrl}
              </p>
            </div>
            <button
              onClick={copyLink}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-all active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={shareOnWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold py-3 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </button>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-3 rounded-xl hover:bg-slate-50 transition-all active:scale-95"
            >
              <ExternalLink className="w-4 h-4" />
              Preview Page
            </a>
          </div>
        </CardContent>
      </Card>

      {/* ── MAIN FORM + LIVE PREVIEW ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8">

        {/* LEFT: Form */}
        <div className="xl:col-span-3 space-y-5 sm:space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* ── SECTION: Clinic Profile ── */}
            <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> Clinic Profile
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="specialty" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400" /> Specialty
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
                  <label htmlFor="about" className="text-sm font-semibold text-slate-700">
                    About the Clinic / Doctor
                  </label>
                  <textarea
                    id="about"
                    {...register("about")}
                    placeholder="E.g. Dr. Sharma has 15+ years of experience in cardiology. Our clinic is equipped with modern diagnostic tools..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 resize-none h-28 shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  <p className="text-xs text-slate-400">This appears on your public website. A good about section builds patient trust.</p>
                </div>
              </CardContent>
            </Card>

            {/* ── SECTION: Contact & Location ── */}
            <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> Contact & Location
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

                {/* Google Maps Embed */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label htmlFor="google-maps-url" className="text-sm font-semibold text-slate-700">
                      Google Maps Embed (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowMapsGuide(!showMapsGuide)}
                      className="text-xs font-bold flex items-center gap-1 hover:underline"
                      style={{ color: themeColor }}
                    >
                      <Info className="w-3 h-3" />
                      {showMapsGuide ? "Hide Guide" : "How to get the link?"}
                    </button>
                  </div>

                  {showMapsGuide && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-600 space-y-2">
                      <p className="font-bold text-slate-800">Step-by-step:</p>
                      <ol className="space-y-1.5 list-decimal pl-4">
                        <li>Open <strong>Google Maps</strong> and search your clinic</li>
                        <li>Click <strong>Share</strong> → then click <strong>"Embed a map"</strong> tab</li>
                        <li>Copy the URL inside <code className="bg-slate-200 px-1 rounded text-xs">src="..."</code> — it starts with <code className="bg-slate-200 px-1 rounded text-xs">https://www.google.com/maps/embed?pb=</code></li>
                        <li>Paste that URL below</li>
                      </ol>
                      <p className="text-xs text-amber-600 font-semibold mt-2">⚠️ Don't paste the regular share link — it must be the embed src link.</p>
                    </div>
                  )}

                  <Input
                    id="google-maps-url"
                    {...register("googleMapsUrl")}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                  />
                  {errors.googleMapsUrl && <p className="text-xs text-red-500">{errors.googleMapsUrl.message}</p>}

                  {/* Live map preview */}
                  {watchedFields.googleMapsUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-200 mt-2">
                      {hasValidMapsUrl ? (
                        <iframe
                          src={watchedFields.googleMapsUrl!}
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          title="Map preview"
                        />
                      ) : (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                          <Info className="w-5 h-5 text-amber-500 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-amber-800">Invalid embed URL</p>
                            <p className="text-xs text-amber-600">This doesn't look like a Google Maps embed link. Follow the guide above to get the correct URL.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── SECTION: Brand & Logo ── */}
            <Card className="border-slate-100 shadow-sm rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-slate-400" /> Brand & Logo
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Customize how your website looks</p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-5">
                {/* Logo URL */}
                <div className="space-y-2">
                  <label htmlFor="logo-url" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Clinic Logo URL
                  </label>
                  <div className="flex gap-3 items-start">
                    {/* Logo Preview */}
                    <div
                      className="w-14 h-14 rounded-2xl flex-shrink-0 border-2 border-slate-200 flex items-center justify-center text-white font-black text-xl overflow-hidden shadow-sm"
                      style={{ backgroundColor: themeColor }}
                    >
                      {watchedFields.logoUrl && !logoError ? (
                        <img
                          src={watchedFields.logoUrl}
                          alt={watchedFields.name || "logo"}
                          className="w-full h-full object-cover"
                          onError={() => setLogoError(true)}
                          onLoad={() => setLogoError(false)}
                        />
                      ) : (
                        <span>{watchedFields.name?.[0]?.toUpperCase() || "C"}</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        id="logo-url"
                        {...register("logoUrl", {
                          onChange: () => setLogoError(false),
                        })}
                        placeholder="https://example.com/logo.png"
                        className="h-11 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors"
                      />
                      {errors.logoUrl && <p className="text-xs text-red-500">{errors.logoUrl.message}</p>}
                      {logoError && watchedFields.logoUrl && (
                        <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                          <Info className="w-3 h-3" /> Image couldn't load. Make sure it's a direct image link (ends in .png, .jpg etc.)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium">
                      <strong className="text-slate-700">Tip:</strong> Upload your logo to{" "}
                      <strong>Google Photos</strong> → Share → Copy link. Or use{" "}
                      <strong>imgbb.com</strong> to get a direct image URL for free.
                    </p>
                  </div>
                </div>

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
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm"
                        style={{ backgroundColor: color }}
                        aria-label={`Set theme color to ${color}`}
                      >
                        {themeColor === color && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                    <div className="relative">
                      <input
                        type="color"
                        {...register("themeColor")}
                        className="w-9 h-9 rounded-full overflow-hidden cursor-pointer opacity-0 absolute inset-0 z-10"
                        aria-label="Custom color picker"
                      />
                      <div className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                        <Palette className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  {errors.themeColor && <p className="text-xs text-red-500">{errors.themeColor.message}</p>}
                </div>
              </CardContent>
            </Card>

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
