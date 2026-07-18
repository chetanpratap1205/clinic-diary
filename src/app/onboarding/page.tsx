"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronDown,
  Link2,
  Phone,
  IndianRupee,
  User,
  Building2,
} from "lucide-react";
import { submitOnboarding } from "./actions";
import { MapsAutoFill } from "./_components/maps-auto-fill";

// ─── Schema ────────────────────────────────────────────────────────────────────
const onboardingSchema = z.object({
  name: z.string().min(3, "Clinic name must be at least 3 characters"),
  doctorName: z.string().min(3, "Doctor name must be at least 3 characters"),
  specialty: z.string().min(2, "Please select or enter a specialty"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  slug: z
    .string()
    .min(3, "URL must be at least 3 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Only lowercase letters, numbers, and hyphens allowed"
    ),
  consultationFee: z.number().min(0, "Fee cannot be negative"),
  referralCode: z.string().optional(),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

// ─── Specialty Options ─────────────────────────────────────────────────────────
const SPECIALTIES = [
  "General Physician",
  "Pediatrician",
  "Cardiologist",
  "Dermatologist",
  "Orthopedic Surgeon",
  "Gynecologist / Obstetrician",
  "ENT Specialist",
  "Neurologist",
  "Psychiatrist",
  "Ophthalmologist",
  "Dentist",
  "Urologist",
  "Gastroenterologist",
  "Pulmonologist",
  "Endocrinologist",
  "Nephrologist",
  "Oncologist",
  "Rheumatologist",
  "Physiotherapist",
  "Ayurvedic Doctor",
  "Homeopathic Doctor",
  "Other",
];

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/^dr\.?\s*/i, "dr-")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

function FieldGroup({
  label,
  htmlFor,
  icon,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={htmlFor}
        className="text-sm font-bold text-slate-300 flex items-center gap-2 ml-1"
      >
        {icon}
        {label}
      </Label>
      {children}
      <div className="min-h-[24px]">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 font-medium flex items-center gap-1.5 ml-1"
          >
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [specialtyQuery, setSpecialtyQuery] = useState("");
  const [highlightFields, setHighlightFields] = useState<Record<string, boolean>>({});
  const specialtyRef = useRef<HTMLDivElement>(null);
  const BASE_URL = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in"
  ).replace(/^https?:\/\//, "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { consultationFee: 500, referralCode: "" },
    mode: "onChange",
  });

  const doctorName = watch("doctorName");
  const slugValue = watch("slug");
  const specialtyValue = watch("specialty");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      setValue("referralCode", ref);
    }
  }, [setValue]);

  useEffect(() => {
    if (!slugTouched && doctorName) {
      const generated = generateSlug(doctorName);
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [doctorName, slugTouched, setValue]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        specialtyRef.current &&
        !specialtyRef.current.contains(e.target as Node)
      ) {
        setShowSpecialtyDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredSpecialties = SPECIALTIES.filter((s) =>
    s.toLowerCase().includes(specialtyQuery.toLowerCase())
  );

  const onSubmit = async (data: OnboardingData) => {
    setIsSubmitting(true);
    const result = await submitOnboarding(data);
    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    }
  };

  const handleDataFound = (data: { name: string; phone: string }) => {
    const fieldsToHighlight: Record<string, boolean> = {};
    if (data.name) {
      setValue("name", data.name, { shouldValidate: true });
      fieldsToHighlight.name = true;
    }
    if (data.phone) {
      setValue("phone", data.phone, { shouldValidate: true });
      fieldsToHighlight.phone = true;
    }

    setHighlightFields(fieldsToHighlight);
    setTimeout(() => {
      setHighlightFields({});
    }, 2000);
  };

  const slugIsValid = slugValue && !errors.slug;

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-start p-4 pb-12 relative overflow-hidden"
      style={{ minHeight: "100dvh" }}
    >
      {/* ── BACKGROUND GLOWS ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none fixed" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[130px] pointer-events-none fixed" />

      <div className="w-full max-w-[540px] relative z-10 pt-10 sm:pt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] mb-6">
            <Stethoscope className="w-8 h-8 text-emerald-400" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Set up your clinic
          </h1>
          <p className="text-slate-400 text-base mt-2 font-medium">
            Just a few details and you&apos;re ready to go
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="bg-white/5 backdrop-blur-3xl rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-white/10 overflow-visible relative"
        >
          {/* subtle top gradient line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-400 to-cyan-400/0 rounded-t-[32px] opacity-30" />

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 sm:p-10 space-y-2">
              
              <div className="mb-8">
                <MapsAutoFill onDataFound={handleDataFound} />
              </div>

              {/* ── Section: About You ─────────────────────────────── */}
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400 mb-6 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-emerald-400/50" />
                  About You
                </p>
                <div className="space-y-2">
                  <FieldGroup
                    label="Your Name"
                    htmlFor="doctorName"
                    icon={<User className="w-4 h-4 text-emerald-400/70" />}
                    error={errors.doctorName?.message}
                  >
                    <Input
                      id="doctorName"
                      placeholder="Dr. Anita Sharma"
                      {...register("doctorName")}
                      className={`h-14 rounded-2xl text-base bg-black/20 text-white placeholder:text-slate-600 transition-all px-5 border-2 ${
                        errors.doctorName
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/5 focus:border-emerald-500/50 focus:bg-black/40"
                      }`}
                    />
                  </FieldGroup>

                  <FieldGroup
                    label="Specialty"
                    htmlFor="specialty-input"
                    icon={<Stethoscope className="w-4 h-4 text-emerald-400/70" />}
                    error={errors.specialty?.message}
                  >
                    <div ref={specialtyRef} className="relative">
                      <div
                        className={`flex items-center h-14 rounded-2xl bg-black/20 transition-all cursor-pointer border-2 px-5 ${
                          showSpecialtyDropdown
                            ? "border-emerald-500/50 bg-black/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                            : errors.specialty
                            ? "border-red-500/50"
                            : "border-white/5 hover:border-white/10"
                        }`}
                        onClick={() => setShowSpecialtyDropdown(!showSpecialtyDropdown)}
                      >
                        <input
                          id="specialty-input"
                          type="text"
                          placeholder="e.g. General Physician"
                          value={showSpecialtyDropdown ? specialtyQuery : specialtyValue || ""}
                          onChange={(e) => {
                            setSpecialtyQuery(e.target.value);
                            setShowSpecialtyDropdown(true);
                          }}
                          onFocus={() => {
                            setSpecialtyQuery("");
                            setShowSpecialtyDropdown(true);
                          }}
                          className="flex-1 h-full bg-transparent text-base text-white placeholder-slate-600 outline-none"
                        />
                        <ChevronDown
                          className={`w-5 h-5 text-slate-500 transition-transform flex-shrink-0 ${
                            showSpecialtyDropdown ? "rotate-180 text-emerald-400" : ""
                          }`}
                        />
                      </div>

                      <input type="hidden" {...register("specialty")} />

                      <AnimatePresence>
                        {showSpecialtyDropdown && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 top-[calc(100%+8px)] w-full bg-[#151515] rounded-2xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
                          >
                            <div className="max-h-56 overflow-y-auto custom-scrollbar">
                              {filteredSpecialties.length === 0 ? (
                                <div className="px-5 py-4 text-sm text-slate-500">
                                  No match — type to use custom
                                </div>
                              ) : (
                                filteredSpecialties.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    className={`w-full text-left px-5 py-3.5 text-sm font-medium transition-colors ${
                                      specialtyValue === s
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                                    }`}
                                    onClick={() => {
                                      setValue("specialty", s, { shouldValidate: true });
                                      setShowSpecialtyDropdown(false);
                                      setSpecialtyQuery("");
                                    }}
                                  >
                                    {s}
                                  </button>
                                ))
                              )}
                              {specialtyQuery && !SPECIALTIES.some((s) => s.toLowerCase() === specialtyQuery.toLowerCase()) && (
                                <button
                                  type="button"
                                  className="w-full text-left px-5 py-3.5 text-sm font-bold text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 border-t border-white/5 transition-colors"
                                  onClick={() => {
                                    setValue("specialty", specialtyQuery, { shouldValidate: true });
                                    setShowSpecialtyDropdown(false);
                                    setSpecialtyQuery("");
                                  }}
                                >
                                  + Use &quot;{specialtyQuery}&quot;
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </FieldGroup>
                </div>
              </div>

              {/* ── Section: Your Clinic ─────────────────────────────── */}
              <div className="mb-6 pt-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-6 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-cyan-400/50" />
                  Your Clinic
                </p>
                <div className="space-y-2">
                  <FieldGroup
                    label="Clinic Name"
                    htmlFor="name"
                    icon={<Building2 className="w-4 h-4 text-cyan-400/70" />}
                    error={errors.name?.message}
                  >
                    <Input
                      id="name"
                      placeholder="e.g. City Care Clinic"
                      {...register("name")}
                      className={`h-14 rounded-2xl text-base transition-all duration-500 px-5 border-2 ${
                        highlightFields.name 
                          ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-100 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]" 
                          : errors.name
                          ? "bg-black/20 border-red-500/50 text-white focus:border-red-500"
                          : "bg-black/20 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:bg-black/40"
                      }`}
                    />
                  </FieldGroup>

                  <FieldGroup
                    label="Clinic Phone"
                    htmlFor="phone"
                    icon={<Phone className="w-4 h-4 text-cyan-400/70" />}
                    error={errors.phone?.message}
                  >
                    <Input
                      id="phone"
                      placeholder="9876543210"
                      inputMode="tel"
                      maxLength={10}
                      {...register("phone")}
                      className={`h-14 rounded-2xl text-base transition-all duration-500 px-5 border-2 ${
                        highlightFields.phone
                          ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-100 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]"
                          : errors.phone
                          ? "bg-black/20 border-red-500/50 text-white focus:border-red-500"
                          : "bg-black/20 border-white/5 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:bg-black/40"
                      }`}
                    />
                  </FieldGroup>

                  <FieldGroup
                    label="Consultation Fee"
                    htmlFor="consultationFee"
                    icon={<IndianRupee className="w-4 h-4 text-cyan-400/70" />}
                    error={errors.consultationFee?.message}
                  >
                    <div
                      className={`flex items-center h-14 rounded-2xl bg-black/20 transition-all focus-within:bg-black/40 focus-within:border-cyan-500/50 border-2 ${
                        errors.consultationFee ? "border-red-500/50" : "border-white/5 hover:border-white/10"
                      }`}
                    >
                      <span className="pl-5 pr-2 text-slate-500 font-bold select-none text-base">₹</span>
                      <input
                        id="consultationFee"
                        type="number"
                        inputMode="numeric"
                        placeholder="500"
                        {...register("consultationFee", { valueAsNumber: true })}
                        className="flex-1 h-full bg-transparent outline-none text-base font-bold text-white pr-5"
                      />
                    </div>
                  </FieldGroup>
                </div>
              </div>

              {/* ── Section: Referral (Optional) ─────────────────────────────── */}
              <div className="mb-6 pt-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-indigo-400/50" />
                  Partner Referral
                </p>
                <div className="space-y-2">
                  <FieldGroup
                    label="Referral Code (Optional)"
                    htmlFor="referralCode"
                    icon={<Link2 className="w-4 h-4 text-indigo-400/70" />}
                    error={errors.referralCode?.message}
                  >
                    <Input
                      id="referralCode"
                      placeholder="e.g. GP-RAHUL-A3B2"
                      {...register("referralCode")}
                      className="h-14 rounded-2xl text-base bg-black/20 text-white placeholder:text-slate-600 transition-all px-5 border-2 border-white/5 focus:border-indigo-500/50 focus:bg-black/40"
                    />
                  </FieldGroup>
                </div>
              </div>

              {/* ── Section: Booking URL ─────────────────────────────── */}
              <div className="mb-2 pt-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-white/30" />
                  Your Booking Link
                </p>

                <Label htmlFor="slug" className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-2 ml-1">
                  <Link2 className="w-4 h-4 text-slate-500" />
                  Your unique URL name
                </Label>

                <div
                  className={`flex items-center h-14 rounded-2xl bg-black/20 transition-all focus-within:bg-black/40 focus-within:border-emerald-500/50 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.1)] border-2 ${
                    errors.slug
                      ? "border-red-500/50"
                      : slugIsValid
                      ? "border-emerald-500/30"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <input
                    id="slug"
                    placeholder="dr-sharma"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    {...register("slug", { onChange: () => setSlugTouched(true) })}
                    className="flex-1 h-full px-5 bg-transparent outline-none text-base font-bold text-white min-w-0"
                  />
                  <div className="pr-4 flex-shrink-0">
                    {slugIsValid && <CheckCircle2 className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                    {errors.slug && <AlertCircle className="w-5 h-5 text-red-500" />}
                  </div>
                </div>

                <div className="min-h-[24px] mt-1">
                  {errors.slug && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-400 font-medium flex items-center gap-1.5 ml-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      {errors.slug.message}
                    </motion.p>
                  )}
                </div>

                {slugValue && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 flex items-start gap-2 px-4 py-3 rounded-2xl border text-sm font-medium transition-colors ${
                      slugIsValid
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-400"
                    }`}
                  >
                    <Link2 className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-70" />
                    <span className="break-all leading-snug">
                      {BASE_URL}/<span className="font-bold text-white">{slugValue}</span>
                    </span>
                  </motion.div>
                )}
              </div>

              {/* ── Working Hours note ─────────────────────────────────── */}
              <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50" />
                <p className="text-sm text-slate-300 font-medium leading-relaxed pl-2">
                  <span className="font-bold text-white block mb-1">Default schedule applies:</span> 
                  Mon–Fri, 9:00 AM – 5:00 PM, 30-min slots. You can fully customize this anytime from your dashboard.
                </p>
              </div>
            </div>

            {/* ── Submit Button ───────────────────────────────── */}
            <div className="p-6 sm:px-10 sm:pb-10 pt-2 relative z-10">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-16 text-lg font-black rounded-2xl bg-white text-black hover:bg-slate-200 active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Setting up your clinic…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6" />
                    Complete Setup — Go to Dashboard
                  </span>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        <p className="text-center text-xs text-slate-500 mt-8 pb-8 font-medium">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-slate-400 hover:text-white underline underline-offset-2 transition-colors">
            Terms of Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
