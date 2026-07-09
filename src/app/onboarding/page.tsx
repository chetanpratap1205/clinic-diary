"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
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

// ─── Helper: Generate slug from doctor name ─────────────────────────────────────
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

// ─── Field wrapper with icon ────────────────────────────────────────────────────
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
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"
      >
        {icon}
        {label}
      </Label>
      {children}
      {/* Error always in flow, never absolutely positioned */}
      <div className="min-h-[20px]">
        {error && (
          <p className="text-xs text-red-500 font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSpecialtyDropdown, setShowSpecialtyDropdown] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [specialtyQuery, setSpecialtyQuery] = useState("");
  const specialtyRef = useRef<HTMLDivElement>(null);
  const BASE_URL = (
    process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in"
  ).replace(/^https?:\/\//, "");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { consultationFee: 500 },
    mode: "onChange",
  });

  const doctorName = watch("doctorName");
  const slugValue = watch("slug");
  const specialtyValue = watch("specialty");

  // ── Auto-generate slug from doctor name if user hasn't manually edited it
  useEffect(() => {
    if (!slugTouched && doctorName) {
      const generated = generateSlug(doctorName);
      setValue("slug", generated, { shouldValidate: true });
    }
  }, [doctorName, slugTouched, setValue]);

  // ── Close specialty dropdown on outside click
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
    // On success, server action redirects to /dashboard
  };

  const slugIsValid = slugValue && !errors.slug;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex flex-col items-center justify-start p-4 pb-10"
      style={{ minHeight: "100dvh" }}
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed top-[-15%] left-[-10%] w-[55%] h-[55%] bg-sky-200/40 rounded-full blur-[130px]" />
      <div className="pointer-events-none fixed bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-emerald-200/35 rounded-full blur-[130px]" />

      <div className="w-full max-w-lg relative z-10 pt-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-7"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-600 shadow-lg shadow-sky-600/30 mb-4">
            <Stethoscope className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Set up your clinic
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Just a few details and you&apos;re ready to go
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/80 overflow-hidden"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 sm:p-8 space-y-0">

              {/* ── Section: About You ─────────────────────────────── */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-4">
                  About You
                </p>
                <div className="space-y-1">
                  {/* Doctor Name */}
                  <FieldGroup
                    label="Your Name"
                    htmlFor="doctorName"
                    icon={<User className="w-3.5 h-3.5 text-slate-400" />}
                    error={errors.doctorName?.message}
                  >
                    <Input
                      id="doctorName"
                      placeholder="Dr. Anita Sharma"
                      {...register("doctorName")}
                      className={`h-12 rounded-xl text-base bg-slate-50 focus:bg-white transition-colors border ${
                        errors.doctorName
                          ? "border-red-400 focus:border-red-400"
                          : "border-slate-200 focus:border-sky-400"
                      }`}
                    />
                  </FieldGroup>

                  {/* Specialty */}
                  <FieldGroup
                    label="Specialty"
                    htmlFor="specialty-input"
                    icon={<Stethoscope className="w-3.5 h-3.5 text-slate-400" />}
                    error={errors.specialty?.message}
                  >
                    <div ref={specialtyRef} className="relative">
                      <div
                        className={`flex items-center h-12 rounded-xl border bg-slate-50 transition-colors cursor-pointer ${
                          showSpecialtyDropdown
                            ? "border-sky-400 bg-white ring-2 ring-sky-400/20"
                            : errors.specialty
                            ? "border-red-400"
                            : "border-slate-200"
                        }`}
                        onClick={() =>
                          setShowSpecialtyDropdown(!showSpecialtyDropdown)
                        }
                      >
                        <input
                          id="specialty-input"
                          type="text"
                          placeholder="e.g. General Physician"
                          value={
                            showSpecialtyDropdown
                              ? specialtyQuery
                              : specialtyValue || ""
                          }
                          onChange={(e) => {
                            setSpecialtyQuery(e.target.value);
                            setShowSpecialtyDropdown(true);
                          }}
                          onFocus={() => {
                            setSpecialtyQuery("");
                            setShowSpecialtyDropdown(true);
                          }}
                          className="flex-1 h-full px-4 bg-transparent text-base text-slate-900 placeholder-slate-400 outline-none rounded-xl"
                        />
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 mr-3 transition-transform flex-shrink-0 ${
                            showSpecialtyDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </div>

                      {/* Hidden input for react-hook-form */}
                      <input type="hidden" {...register("specialty")} />

                      {showSpecialtyDropdown && (
                        <div className="absolute z-50 top-full mt-1 w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                          <div className="max-h-52 overflow-y-auto">
                            {filteredSpecialties.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-slate-400">
                                No match — type to use custom
                              </div>
                            ) : (
                              filteredSpecialties.map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-sky-50 hover:text-sky-700 ${
                                    specialtyValue === s
                                      ? "bg-sky-50 text-sky-700"
                                      : "text-slate-700"
                                  }`}
                                  onClick={() => {
                                    setValue("specialty", s, {
                                      shouldValidate: true,
                                    });
                                    setShowSpecialtyDropdown(false);
                                    setSpecialtyQuery("");
                                  }}
                                >
                                  {s}
                                </button>
                              ))
                            )}
                            {/* Allow custom entry if not in list */}
                            {specialtyQuery &&
                              !SPECIALTIES.some(
                                (s) =>
                                  s.toLowerCase() ===
                                  specialtyQuery.toLowerCase()
                              ) && (
                                <button
                                  type="button"
                                  className="w-full text-left px-4 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-t border-slate-100 transition-colors"
                                  onClick={() => {
                                    setValue("specialty", specialtyQuery, {
                                      shouldValidate: true,
                                    });
                                    setShowSpecialtyDropdown(false);
                                    setSpecialtyQuery("");
                                  }}
                                >
                                  + Use &quot;{specialtyQuery}&quot;
                                </button>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </FieldGroup>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 my-5" />

              {/* ── Section: Your Clinic ─────────────────────────────── */}
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-4">
                  Your Clinic
                </p>
                <div className="space-y-1">
                  {/* Clinic Name */}
                  <FieldGroup
                    label="Clinic Name"
                    htmlFor="name"
                    icon={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
                    error={errors.name?.message}
                  >
                    <Input
                      id="name"
                      placeholder="e.g. City Care Clinic"
                      {...register("name")}
                      className={`h-12 rounded-xl text-base bg-slate-50 focus:bg-white transition-colors border ${
                        errors.name
                          ? "border-red-400 focus:border-red-400"
                          : "border-slate-200 focus:border-sky-400"
                      }`}
                    />
                  </FieldGroup>

                  {/* Phone */}
                  <FieldGroup
                    label="Clinic Phone"
                    htmlFor="phone"
                    icon={<Phone className="w-3.5 h-3.5 text-slate-400" />}
                    error={errors.phone?.message}
                  >
                    <Input
                      id="phone"
                      placeholder="9876543210"
                      inputMode="tel"
                      maxLength={10}
                      {...register("phone")}
                      className={`h-12 rounded-xl text-base bg-slate-50 focus:bg-white transition-colors border ${
                        errors.phone
                          ? "border-red-400 focus:border-red-400"
                          : "border-slate-200 focus:border-sky-400"
                      }`}
                    />
                  </FieldGroup>

                  {/* Consultation Fee */}
                  <FieldGroup
                    label="Consultation Fee"
                    htmlFor="consultationFee"
                    icon={<IndianRupee className="w-3.5 h-3.5 text-slate-400" />}
                    error={errors.consultationFee?.message}
                  >
                    <div
                      className={`flex items-center h-12 rounded-xl border bg-slate-50 transition-colors focus-within:bg-white focus-within:border-sky-400 ${
                        errors.consultationFee
                          ? "border-red-400"
                          : "border-slate-200"
                      }`}
                    >
                      <span className="pl-4 pr-1 text-slate-500 font-semibold select-none text-base">
                        ₹
                      </span>
                      <input
                        id="consultationFee"
                        type="number"
                        inputMode="numeric"
                        placeholder="500"
                        {...register("consultationFee", {
                          valueAsNumber: true,
                        })}
                        className="flex-1 h-full bg-transparent outline-none text-base font-semibold text-slate-900 pr-4"
                      />
                    </div>
                  </FieldGroup>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 my-5" />

              {/* ── Section: Booking URL ─────────────────────────────── */}
              <div className="mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-1">
                  Your Booking Page Link
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Patients will use this link to book appointments with you.
                  Auto-filled from your name — you can change it.
                </p>

                <FieldGroup
                  label=""
                  htmlFor="slug"
                  icon={<Link2 className="w-3.5 h-3.5 text-slate-400" />}
                  error={errors.slug?.message}
                >
                  {/* URL preview pill */}
                  <div
                    className={`flex items-center rounded-xl border overflow-hidden transition-colors bg-slate-50 focus-within:bg-white focus-within:border-sky-400 ${
                      errors.slug
                        ? "border-red-400"
                        : slugIsValid
                        ? "border-emerald-400"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Domain prefix */}
                    <div className="pl-3 pr-1 py-3 text-slate-400 text-xs sm:text-sm whitespace-nowrap bg-transparent select-none font-medium flex-shrink-0 max-w-[45%] overflow-hidden text-ellipsis">
                      {BASE_URL}/
                    </div>
                    <input
                      id="slug"
                      placeholder="dr-sharma"
                      {...register("slug", {
                        onChange: () => setSlugTouched(true),
                      })}
                      className="flex-1 h-12 bg-transparent outline-none text-sm sm:text-base font-semibold text-slate-900 pr-3 min-w-0"
                    />
                    {/* Inline status icon — no layout shift */}
                    <div className="pr-3 flex-shrink-0">
                      {slugIsValid && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {errors.slug && (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                  {/* Success hint — in flow, uses min-h in FieldGroup */}
                  {!errors.slug && slugIsValid && (
                    <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 -mt-4 pb-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Patients will book at{" "}
                      <span className="font-bold">
                        {BASE_URL}/{slugValue}
                      </span>
                    </p>
                  )}
                </FieldGroup>
              </div>

              {/* ── Working Hours note ─────────────────────────────────── */}
              <div className="mt-4 p-4 bg-sky-50 rounded-2xl border border-sky-100">
                <p className="text-xs text-sky-700 font-medium leading-relaxed">
                  <span className="font-bold">Default schedule:</span> Mon–Fri,
                  9:00 AM – 5:00 PM, 30-min slots. Customize anytime from your
                  dashboard.
                </p>
              </div>
            </div>

            {/* ── Sticky Submit Button ───────────────────────────────── */}
            <div className="px-6 sm:px-8 pb-6 pt-2 bg-white/90 backdrop-blur-md border-t border-slate-100 sticky bottom-0">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-base font-bold rounded-2xl bg-sky-600 hover:bg-sky-700 active:scale-[0.98] text-white shadow-lg shadow-sky-600/30 transition-all"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Setting up your clinic…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Complete Setup — Go to Dashboard
                  </span>
                )}
              </Button>
            </div>
          </form>
        </motion.div>

        <p className="text-center text-xs text-slate-400 mt-5 pb-4">
          By continuing, you agree to our{" "}
          <a
            href="/terms"
            className="underline hover:text-slate-600 transition-colors"
          >
            Terms of Service
          </a>
          .
        </p>
      </div>
    </div>
  );
}
