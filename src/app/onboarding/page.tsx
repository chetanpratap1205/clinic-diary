"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { submitOnboarding } from "./actions";

const onboardingSchema = z.object({
  name: z.string().min(3, "Clinic name must be at least 3 characters"),
  doctorName: z.string().min(3, "Doctor name must be at least 3 characters"),
  specialty: z.string().min(3, "Specialty is required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number"),
  slug: z.string()
    .min(3, "URL slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  consultationFee: z.number().min(0, "Fee cannot be negative"),
});

type OnboardingData = z.infer<typeof onboardingSchema>;

const steps = [
  { id: "clinic", title: "Clinic Details", subtitle: "Let's set up your digital practice" },
  { id: "operations", title: "Operations", subtitle: "How your clinic runs" },
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      consultationFee: 500,
    },
    mode: "onChange",
  });

  const slugValue = watch("slug");

  const nextStep = async () => {
    // Validate current step fields before moving on
    const fieldsToValidate = currentStep === 0 
      ? ["name", "doctorName", "specialty", "slug"] as const
      : ["phone", "consultationFee"] as const;
      
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: OnboardingData) => {
    setIsSubmitting(true);
    const result = await submitOnboarding(data);
    
    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    }
    // If successful, the server action handles the redirect to /dashboard
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-sky-200/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Tracker */}
        <div className="mb-8 flex justify-center items-center gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  index <= currentStep
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/20 scale-110"
                    : "bg-white text-slate-400 shadow-sm border border-slate-200"
                }`}
              >
                {index < currentStep ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
              </div>
              <span
                className={`text-sm font-bold transition-colors duration-300 ${
                  index <= currentStep ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-1 rounded-full transition-colors duration-300 ${
                    index < currentStep ? "bg-sky-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {steps[currentStep].title}
              </h1>
              <p className="text-slate-500 mt-1">{steps[currentStep].subtitle}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="relative min-h-[300px]">
                <AnimatePresence mode="wait" initial={false}>
                  {currentStep === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5 absolute w-full"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-semibold text-slate-700">Clinic Name</Label>
                          <Input
                            id="name"
                            placeholder="e.g. City Care Clinic"
                            {...register("name")}
                            className={`h-12 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors focus:shadow-none focus:border-slate-300 ${errors.name ? "border-red-500" : ""}`}
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500 font-medium">{errors.name.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doctorName" className="font-semibold text-slate-700">Doctor Name</Label>
                          <Input
                            id="doctorName"
                            placeholder="e.g. Dr. A. Sharma"
                            {...register("doctorName")}
                            className={`h-12 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors focus:shadow-none focus:border-slate-300 ${errors.doctorName ? "border-red-500" : ""}`}
                          />
                          {errors.doctorName && (
                            <p className="text-sm text-red-500 font-medium">{errors.doctorName.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialty" className="font-semibold text-slate-700">Specialty</Label>
                        <Input
                          id="specialty"
                          placeholder="e.g. Cardiologist, General Physician"
                          {...register("specialty")}
                          className={`h-12 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors focus:shadow-none focus:border-slate-300 ${errors.specialty ? "border-red-500" : ""}`}
                        />
                        {errors.specialty && (
                          <p className="text-sm text-red-500 font-medium">{errors.specialty.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slug" className="font-semibold text-slate-700">Public Booking URL</Label>
                        <div className={`flex items-center shadow-inner bg-slate-50/50 rounded-xl overflow-hidden focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-300 transition-all border ${errors.slug ? "border-red-500" : "border-slate-200"}`}>
                          <div className="px-3 py-3 text-slate-400 text-sm whitespace-nowrap bg-transparent select-none font-medium">
                            {(process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in").replace("https://", "")}/
                          </div>
                          <Input
                            id="slug"
                            placeholder="dr-sharma"
                            {...register("slug")}
                            className="border-0 bg-transparent focus-visible:ring-0 px-0 h-12 text-base font-semibold text-slate-900 shadow-none rounded-none"
                          />
                        </div>
                        {errors.slug && (
                          <p className="text-sm text-red-500 font-medium">{errors.slug.message}</p>
                        )}
                        {!errors.slug && slugValue && (
                          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Looking good! Patients will book here.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-5 absolute w-full"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="font-semibold text-slate-700">Clinic Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="e.g. 9876543210"
                          {...register("phone")}
                          className={`h-12 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors focus:shadow-none focus:border-slate-300 ${errors.phone ? "border-red-500" : ""}`}
                        />
                        {errors.phone && (
                          <p className="text-sm text-red-500 font-medium">{errors.phone.message}</p>
                        )}
                        <p className="text-xs text-slate-500 font-medium">
                          Used for sending appointment reminders to you and your patients.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="consultationFee" className="font-semibold text-slate-700">Consultation Fee (₹)</Label>
                        <Input
                          id="consultationFee"
                          type="number"
                          placeholder="500"
                          {...register("consultationFee", { valueAsNumber: true })}
                          className={`h-12 rounded-xl text-base shadow-inner bg-slate-50/50 focus:bg-white transition-colors focus:shadow-none focus:border-slate-300 ${errors.consultationFee ? "border-red-500" : ""}`}
                        />
                        {errors.consultationFee && (
                          <p className="text-sm text-red-500 font-medium">{errors.consultationFee.message}</p>
                        )}
                      </div>
                      
                      <div className="p-4 bg-sky-50 rounded-lg border border-sky-100">
                        <h4 className="font-semibold text-sky-800 text-sm mb-1">Standard Working Hours</h4>
                        <p className="text-sky-600 text-sm">
                          We will default your availability to Monday-Friday, 9:00 AM - 5:00 PM with 30-minute slots. 
                          You can fully customize this later in your dashboard settings.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0 || isSubmitting}
                  className={currentStep === 0 ? "invisible" : ""}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep} className="bg-sky-600 hover:bg-sky-700">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]">
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
