"use client";

import { useState, useEffect, useTransition } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { getAvailableSlots, createBooking } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  ChevronLeft,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ClinicData {
  id: string;
  name: string;
  doctorName: string;
  themeColor: string | null;
  consultationFee: number | null;
  slug: string;
}

const bookingSchema = z.object({
  patientName: z.string().min(2, "Name must be at least 2 characters"),
  patientPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  patientEmail: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
});

type BookingData = z.infer<typeof bookingSchema>;

/** Strip leading "Dr." prefix */
function stripDrPrefix(name: string): string {
  return name.replace(/^dr\.?\s*/i, "").trim();
}

function formatTimeDisplay(time: string): string {
  const t = time.slice(0, 5);
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
}

export function BookingClient({ clinic }: { clinic: ClinicData }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [successData, setSuccessData] = useState<{
    appointmentId: string;
    date: string;
    time: string;
  } | null>(null);
  const router = useRouter();

  const themeColor = clinic.themeColor ?? "#0ea5e9";
  const doctorFirstName = stripDrPrefix(clinic.doctorName);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingData>({
    resolver: zodResolver(bookingSchema),
  });

  const today = startOfToday();
  const next14Days = Array.from({ length: 14 }).map((_, i) =>
    addDays(today, i)
  );

  useEffect(() => {
    if (step === 1 || step === 2) {
      setIsLoadingSlots(true);
      getAvailableSlots(clinic.id, format(selectedDate, "yyyy-MM-dd"))
        .then((res) => {
          if (res.slots) setAvailableSlots(res.slots);
        })
        .finally(() => setIsLoadingSlots(false));
    }
  }, [selectedDate, clinic.id, step]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const onSubmit = (data: BookingData) => {
    if (!selectedTime) return;

    startTransition(async () => {
      const res = await createBooking(
        clinic.id,
        format(selectedDate, "yyyy-MM-dd"),
        selectedTime,
        data.patientName,
        data.patientPhone,
        data.patientEmail
      );

      if (res.error) {
        toast.error(res.error);
        if (res.error.includes("taken")) {
          setStep(2);
          setSelectedTime(null);
          setIsLoadingSlots(true);
          getAvailableSlots(clinic.id, format(selectedDate, "yyyy-MM-dd")).then(
            (r) => {
              if (r.slots) setAvailableSlots(r.slots);
              setIsLoadingSlots(false);
            }
          );
        }
      } else if (res.appointmentId) {
        // Show success screen first, then navigate
        setSuccessData({
          appointmentId: res.appointmentId,
          date: format(selectedDate, "EEE, MMM d"),
          time: formatTimeDisplay(selectedTime),
        });
      }
    });
  };

  // ──── Success Screen ────
  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className="w-full"
      >
        <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
          <div className="h-1.5" style={{ backgroundColor: themeColor }} />
          <CardContent className="p-8 text-center">
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 28, delay: 0.1 }}
              className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-1">
                You&apos;re booked! 🎉
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Your appointment is confirmed with{" "}
                <span className="font-semibold text-slate-700">
                  Dr. {doctorFirstName}
                </span>
              </p>
            </motion.div>

            {/* Appointment summary pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4 mb-6 text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${themeColor}18` }}
                >
                  <Calendar className="w-4 h-4" style={{ color: themeColor }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Date
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {successData.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${themeColor}18` }}
                >
                  <Clock className="w-4 h-4" style={{ color: themeColor }} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Time
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {successData.time}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              onClick={() =>
                router.push(`/track/${successData.appointmentId}`)
              }
              className="w-full h-13 rounded-xl text-white font-semibold text-sm shadow-md transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 py-3.5"
              style={{ backgroundColor: themeColor }}
            >
              <Sparkles className="w-4 h-4" />
              Track My Appointment
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ──── Step 1: Date Selection ────
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Select a Date
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          When would you like to visit?
        </p>
      </div>

      <div className="-mx-5 sm:-mx-6 px-5 sm:px-6">
        <div className="flex overflow-x-auto pb-3 gap-2.5 snap-x scrollbar-hide">
          {next14Days.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                className={`snap-start flex-shrink-0 flex flex-col items-center justify-center w-[68px] sm:w-[72px] h-[84px] sm:h-[90px] rounded-2xl border transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? "border-transparent text-white shadow-md scale-105"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
                style={isSelected ? { backgroundColor: themeColor } : {}}
                aria-label={format(date, "EEEE MMMM d")}
                aria-pressed={isSelected}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">
                  {format(date, "EEE")}
                </span>
                <span className="text-2xl font-bold mt-1 leading-none">
                  {format(date, "d")}
                </span>
                <span className="text-[10px] uppercase font-medium mt-1 opacity-80">
                  {format(date, "MMM")}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1 h-1 rounded-full bg-teal-500 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );

  // ──── Step 2: Time Selection ────
  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Available Times
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {format(selectedDate, "EEEE, MMMM d")}
        </p>
      </div>

      {isLoadingSlots ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm animate-pulse">
            Finding available slots...
          </p>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No slots available</p>
          <p className="text-slate-500 text-sm mt-1 px-4">
            Dr. {doctorFirstName} is fully booked. Please select another date.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
          {availableSlots.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className="py-3 px-1 sm:px-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs sm:text-sm hover:border-slate-300 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 min-h-[48px]"
            >
              {formatTimeDisplay(time)}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );

  // ──── Step 3: Patient Details ────
  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">
          Your Details
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Almost done! Enter your info to confirm.
        </p>
      </div>

      {/* Appointment Summary */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${themeColor}18` }}
          >
            <Calendar className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Date
            </p>
            <p className="text-sm font-bold text-slate-900">
              {format(selectedDate, "MMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-200 hidden sm:block" />
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${themeColor}18` }}
          >
            <Clock className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Time
            </p>
            <p className="text-sm font-bold text-slate-900">
              {selectedTime && formatTimeDisplay(selectedTime)}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="patient-name"
            className="text-sm font-semibold text-slate-700 flex items-center gap-2"
          >
            <User className="w-4 h-4 text-slate-400" /> Full Name
          </label>
          <Input
            id="patient-name"
            placeholder="e.g. Rahul Sharma"
            autoComplete="name"
            {...register("patientName")}
            className={`h-12 rounded-xl bg-white text-base ${
              errors.patientName ? "border-red-400 focus-visible:ring-red-300" : ""
            }`}
          />
          {errors.patientName && (
            <p className="text-xs text-red-500 font-medium">
              {errors.patientName.message}
            </p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="space-y-1.5">
          <label
            htmlFor="patient-phone"
            className="text-sm font-semibold text-slate-700 flex items-center gap-2"
          >
            <Phone className="w-4 h-4 text-slate-400" /> Mobile Number
          </label>
          <Input
            id="patient-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="9876543210"
            {...register("patientPhone")}
            className={`h-12 rounded-xl bg-white text-base ${
              errors.patientPhone ? "border-red-400 focus-visible:ring-red-300" : ""
            }`}
          />
          {errors.patientPhone && (
            <p className="text-xs text-red-500 font-medium">
              {errors.patientPhone.message}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label
            htmlFor="patient-email"
            className="text-sm font-semibold text-slate-700 flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-slate-400" /> Email <span className="text-slate-400 font-normal ml-1">(Optional)</span>
          </label>
          <Input
            id="patient-email"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            {...register("patientEmail")}
            className={`h-12 rounded-xl bg-white text-base ${
              errors.patientEmail ? "border-red-400 focus-visible:ring-red-300" : ""
            }`}
          />
          {errors.patientEmail && (
            <p className="text-xs text-red-500 font-medium">
              {errors.patientEmail.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-xl text-white font-semibold text-base shadow-md transition-all hover:opacity-90 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
          style={{ backgroundColor: themeColor }}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Confirm Booking
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );

  return (
    <div className="w-full">
      {/* Back Button */}
      {step > 1 && (
        <button
          onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-5 -ml-1 py-2 px-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      {step === 1 && <div className="h-8 sm:h-10 mb-1" />}

      <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white relative">
        {/* Clinic-colored progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: themeColor }}
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          />
        </div>

        {/* Step dots */}
        <div className="absolute top-4 right-5 flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="rounded-full transition-all duration-300"
              style={{
                width: s === step ? "20px" : "6px",
                height: "6px",
                backgroundColor: s <= step ? themeColor : "#e2e8f0",
              }}
            />
          ))}
        </div>

        <CardContent className="p-5 sm:p-7 pt-6">
          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
