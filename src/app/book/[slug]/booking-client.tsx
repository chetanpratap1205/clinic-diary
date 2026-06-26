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
  CalendarCheck,
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
        setSuccessData({
          appointmentId: res.appointmentId,
          date: format(selectedDate, "EEE, MMM d, yyyy"),
          time: formatTimeDisplay(selectedTime),
        });
      }
    });
  };

  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full"
      >
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/60 backdrop-blur-xl ring-1 ring-slate-900/5 relative h-[500px] flex flex-col justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: themeColor }} />
          
          <CardContent className="p-8 md:p-12 text-center relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl mb-6 bg-gradient-to-tr"
              style={{ backgroundImage: `linear-gradient(to top right, ${themeColor}, ${themeColor}dd)` }}
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
                Booking Confirmed!
              </h2>
              <p className="text-slate-500 text-base mb-8 max-w-sm mx-auto">
                Your appointment is securely confirmed. We've saved a slot for you with Dr. {doctorFirstName}.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-md rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 flex flex-col sm:flex-row gap-4 mb-8"
            >
              <div className="flex-1 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-50">
                  <CalendarCheck className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-base font-bold text-slate-900">{successData.date}</p>
                </div>
              </div>
              <div className="hidden sm:block w-px bg-slate-100" />
              <div className="flex-1 flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-slate-50">
                  <Clock className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Time</p>
                  <p className="text-base font-bold text-slate-900">{successData.time}</p>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => router.push(`/track/${successData.appointmentId}`)}
              className="w-full max-w-md rounded-2xl text-white font-bold text-base shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 py-4"
              style={{ backgroundColor: themeColor }}
            >
              <Sparkles className="w-5 h-5" />
              View Appointment Details
              <ArrowRight className="w-5 h-5 ml-1" />
            </motion.button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select a Date</h2>
        <p className="text-slate-500 mt-1">Choose your preferred day for the consultation.</p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {next14Days.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              className={`flex flex-col items-center justify-center h-[90px] rounded-2xl border-2 transition-all duration-200 active:scale-[0.97] ${
                isSelected
                  ? "border-transparent text-white shadow-lg shadow-black/5"
                  : "border-slate-100 bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50"
              }`}
              style={isSelected ? { backgroundColor: themeColor } : {}}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'opacity-90' : 'text-slate-400'}`}>
                {format(date, "EEE")}
              </span>
              <span className="text-2xl font-black mt-1 tracking-tighter">
                {format(date, "d")}
              </span>
              <span className={`text-[10px] uppercase font-bold mt-1 ${isSelected ? 'opacity-80' : 'text-slate-400'}`}>
                {format(date, "MMM")}
              </span>
              {isToday && !isSelected && (
                <div className="w-1.5 h-1.5 rounded-full mt-1.5" style={{ backgroundColor: themeColor }} />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Available Times</h2>
        <p className="text-slate-500 mt-1 flex items-center gap-2">
          <Calendar className="w-4 h-4" /> {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {isLoadingSlots ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-50/50 rounded-3xl border border-slate-100">
          <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: themeColor }} />
          <p className="text-slate-500 font-medium">Checking doctor's availability...</p>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/80 rounded-3xl border border-slate-100">
          <div className="w-16 h-16 rounded-full bg-slate-200/50 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-900 font-bold text-lg">No slots available</p>
          <p className="text-slate-500 text-sm mt-1 max-w-[250px] mx-auto">
            Dr. {doctorFirstName} is fully booked on this date. Please select another day.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableSlots.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className="py-4 px-2 rounded-2xl border-2 border-slate-100 bg-white text-slate-700 font-bold text-sm hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <Clock className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
              {formatTimeDisplay(time)}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your Details</h2>
        <p className="text-slate-500 mt-1">Please provide your info to confirm the booking.</p>
      </div>

      <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <CalendarCheck className="w-24 h-24" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100">
            <Calendar className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</p>
            <p className="text-sm font-bold text-slate-900">{format(selectedDate, "MMM d, yyyy")}</p>
          </div>
        </div>
        <div className="hidden sm:block w-px h-10 bg-slate-200 relative z-10" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100">
            <Clock className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</p>
            <p className="text-sm font-bold text-slate-900">{selectedTime && formatTimeDisplay(selectedTime)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="patient-name" className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" /> Full Name
          </label>
          <Input
            id="patient-name"
            placeholder="E.g. Rahul Sharma"
            {...register("patientName")}
            className={`h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white text-base transition-all ${
              errors.patientName ? "border-red-400 focus-visible:ring-red-300" : "focus-visible:ring-slate-200"
            }`}
          />
          {errors.patientName && <p className="text-xs text-red-500 font-medium px-1">{errors.patientName.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="patient-phone" className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" /> Mobile Number
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">+91</span>
            <Input
              id="patient-phone"
              type="tel"
              placeholder="9876543210"
              {...register("patientPhone")}
              className={`h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white text-base transition-all pl-12 ${
                errors.patientPhone ? "border-red-400 focus-visible:ring-red-300" : "focus-visible:ring-slate-200"
              }`}
            />
          </div>
          {errors.patientPhone && <p className="text-xs text-red-500 font-medium px-1">{errors.patientPhone.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="patient-email" className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" /> Email <span className="text-slate-400 font-normal ml-1">(Optional)</span>
          </label>
          <Input
            id="patient-email"
            type="email"
            placeholder="your@email.com"
            {...register("patientEmail")}
            className={`h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white text-base transition-all ${
              errors.patientEmail ? "border-red-400 focus-visible:ring-red-300" : "focus-visible:ring-slate-200"
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-14 rounded-2xl text-white font-bold text-base shadow-lg transition-all hover:opacity-90 active:scale-[0.98] mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
          style={{ backgroundColor: themeColor }}
        >
          {isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Confirm Booking
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );

  return (
    <div className="w-full">
      {step > 1 && (
        <button
          onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors mb-4 px-2 py-1 bg-white rounded-lg shadow-sm border border-slate-100 w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}

      <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white ring-1 ring-slate-900/5 relative min-h-[500px]">
        {/* Progress Bar Header */}
        <div className="h-1.5 w-full bg-slate-100">
          <motion.div
            className="h-full"
            style={{ backgroundColor: themeColor }}
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "anticipate" }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="absolute top-6 right-6 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="rounded-full transition-all duration-500 ease-out"
              style={{
                width: s === step ? "24px" : "8px",
                height: "8px",
                backgroundColor: s <= step ? themeColor : "#f1f5f9",
              }}
            />
          ))}
        </div>

        <CardContent className="p-6 sm:p-8 pt-8">
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
