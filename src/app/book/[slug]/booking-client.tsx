"use client";

import { useState, useEffect, useTransition } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { getAvailableSlots, createBooking } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, User, Phone, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";

interface ClinicData {
  id: string;
  name: string;
  doctorName: string;
  themeColor: string | null;
  consultationFee: number | null;
}

const bookingSchema = z.object({
  patientName: z.string().min(2, "Name must be at least 2 characters"),
  patientPhone: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
});

type BookingData = z.infer<typeof bookingSchema>;

export function BookingClient({ clinic }: { clinic: ClinicData }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const themeColor = clinic.themeColor ?? "#0ea5e9";

  const { register, handleSubmit, formState: { errors } } = useForm<BookingData>({
    resolver: zodResolver(bookingSchema),
  });

  // Generate next 14 days
  const today = startOfToday();
  const next14Days = Array.from({ length: 14 }).map((_, i) => addDays(today, i));

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
        data.patientPhone
      );

      if (res.error) {
        toast.error(res.error);
        if (res.error.includes("taken")) {
          // Send them back to time selection
          setStep(2);
          setSelectedTime(null);
          // Refresh slots
          setIsLoadingSlots(true);
          getAvailableSlots(clinic.id, format(selectedDate, "yyyy-MM-dd")).then((r) => {
            if (r.slots) setAvailableSlots(r.slots);
            setIsLoadingSlots(false);
          });
        }
      } else if (res.appointmentId) {
        toast.success("Booking confirmed!");
        router.push(`/track/${res.appointmentId}`);
      }
    });
  };

  function formatTimeDisplay(time: string): string {
    const t = time.slice(0, 5);
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayH = h % 12 || 12;
    return `${displayH}:${m.toString().padStart(2, "0")} ${ampm}`;
  }

  // --- Render Functions ---

  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900">Select a Date</h2>
        <p className="text-slate-500 text-sm mt-1">When would you like to visit?</p>
      </div>

      <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {next14Days.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              className={`snap-start flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[88px] rounded-2xl border transition-all ${
                isSelected 
                  ? "border-transparent text-white shadow-md scale-105" 
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
              style={isSelected ? { backgroundColor: themeColor } : {}}
            >
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                {format(date, "EEE")}
              </span>
              <span className="text-2xl font-bold mt-1">
                {format(date, "d")}
              </span>
              <span className="text-[10px] uppercase font-medium mt-0.5 opacity-80">
                {format(date, "MMM")}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900">Available Times</h2>
        <p className="text-slate-500 text-sm mt-1">{format(selectedDate, "EEEE, MMMM d")}</p>
      </div>

      {isLoadingSlots ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300 mb-4" />
          <p className="text-slate-500 text-sm animate-pulse">Finding available slots...</p>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No slots available</p>
          <p className="text-slate-500 text-sm mt-1 px-4">Dr. {clinic.doctorName} is fully booked on this date. Please select another date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {availableSlots.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className="py-3 px-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
            >
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900">Your Details</h2>
        <p className="text-slate-500 text-sm mt-1">Almost done! Enter your info to confirm.</p>
      </div>

      <Card className="border-slate-100 bg-slate-50/50 shadow-sm">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date</p>
              <p className="text-sm font-semibold text-slate-900">{format(selectedDate, "MMM d, yyyy")}</p>
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Time</p>
              <p className="text-sm font-semibold text-slate-900">{selectedTime && formatTimeDisplay(selectedTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" /> Full Name
          </label>
          <Input 
            placeholder="John Doe" 
            {...register("patientName")} 
            className={`h-12 rounded-xl bg-white ${errors.patientName ? "border-red-500" : ""}`}
          />
          {errors.patientName && <p className="text-xs text-red-500 font-medium">{errors.patientName.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" /> Mobile Number
          </label>
          <Input 
            type="tel"
            placeholder="9876543210" 
            {...register("patientPhone")} 
            className={`h-12 rounded-xl bg-white ${errors.patientPhone ? "border-red-500" : ""}`}
          />
          {errors.patientPhone && <p className="text-xs text-red-500 font-medium">{errors.patientPhone.message}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-12 rounded-xl text-white font-semibold text-base shadow-md transition-all hover:opacity-90 mt-4"
          style={{ backgroundColor: themeColor }}
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Booking"}
        </Button>
      </form>
    </motion.div>
  );

  return (
    <div className="w-full">
      {/* Back Button Area */}
      {step > 1 && step < 4 && (
        <button
          onClick={() => setStep((s) => (s - 1) as any)}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}
      {step === 1 && <div className="h-10 mb-2"></div>}

      <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white relative">
        {/* Progress Bar */}
        {step < 4 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
            <motion.div 
              className="h-full"
              style={{ backgroundColor: themeColor }}
              initial={{ width: "33%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        <CardContent className="p-6 sm:p-8">
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
