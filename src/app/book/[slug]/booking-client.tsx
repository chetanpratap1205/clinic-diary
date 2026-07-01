"use client";

import { useState, useEffect, useTransition } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { getAvailableSlots, createBooking, findPatientAppointment } from "./actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Search, Clock, Calendar as CalendarIcon, CheckCircle2, User,
  Loader2, ArrowRight, Sparkles, CalendarCheck, Calendar, Phone,
  Mail, ChevronLeft, Sun, Sunset, Moon, ShieldCheck, Share2,
} from "lucide-react";
import { formatTimeDisplay } from "@/lib/format";

interface ClinicData {
  id: string;
  name: string;
  doctorName: string;
  themeColor: string | null;
  consultationFee: number | null;
  slug: string;
  specialty?: string | null;
  address?: string | null;
  about?: string | null;
  logoUrl?: string | null;
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

/** Only treat as image if URL ends with a known image extension */
function isSafeImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /\.(png|jpg|jpeg|webp|gif|svg|avif)(\?.*)?$/i.test(url.trim());
}

/** Group time slots into Morning / Afternoon / Evening */
function groupSlots(slots: string[]): { morning: string[]; afternoon: string[]; evening: string[] } {
  const morning: string[] = [];
  const afternoon: string[] = [];
  const evening: string[] = [];
  for (const slot of slots) {
    const hour = parseInt(slot.split(":")[0], 10);
    if (hour < 12) morning.push(slot);
    else if (hour < 17) afternoon.push(slot);
    else evening.push(slot);
  }
  return { morning, afternoon, evening };
}

export function BookingClient({
  clinic,
  workingDays,
  closedDates,
}: {
  clinic: ClinicData;
  workingDays: number[];
  closedDates: string[];
}) {
  const [mode, setMode] = useState<"book" | "track">("book");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [logoError, setLogoError] = useState(false);
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

  const [trackPhone, setTrackPhone] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  const themeColor = clinic.themeColor ?? "#0ea5e9";
  const doctorFirstName = stripDrPrefix(clinic.doctorName);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingData>({
    resolver: zodResolver(bookingSchema),
    shouldUnregister: false,
  });

  const today = startOfToday();
  const next14Days = Array.from({ length: 14 }).map((_, i) => addDays(today, i));

  useEffect(() => {
    if (mode === "book" && (step === 1 || step === 2)) {
      setIsLoadingSlots(true);
      getAvailableSlots(clinic.id, format(selectedDate, "yyyy-MM-dd"))
        .then((res) => {
          if (res.slots) setAvailableSlots(res.slots);
        })
        .finally(() => setIsLoadingSlots(false));
    }
  }, [selectedDate, clinic.id, step, mode]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(trackPhone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsTracking(true);
    const res = await findPatientAppointment(clinic.id, trackPhone);
    setIsTracking(false);
    if (res.error) {
      toast.error(res.error);
    } else if (res.appointmentId) {
      router.push(`/track/${res.appointmentId}`);
    }
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
          getAvailableSlots(clinic.id, format(selectedDate, "yyyy-MM-dd")).then((r) => {
            if (r.slots) setAvailableSlots(r.slots);
            setIsLoadingSlots(false);
          });
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

  const getGoogleCalendarUrl = () => {
    if (!successData || !selectedTime) return "#";
    const startStr = format(selectedDate, "yyyyMMdd") + "T" + selectedTime.replace(":", "") + "00";
    const text = encodeURIComponent(`Appointment with Dr. ${doctorFirstName}`);
    const details = encodeURIComponent(`Consultation at ${clinic.name}`);
    const location = encodeURIComponent(clinic.address || clinic.name);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startStr}/${startStr}&details=${details}&location=${location}`;
  };

  const shareAppointment = () => {
    if (!successData) return;
    const msg = `My appointment at ${clinic.name} is confirmed!\nDate: ${successData.date}\nTime: ${successData.time}\nTrack: ${window.location.origin}/track/${successData.appointmentId}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ─── SUCCESS SCREEN ────────────────────────────────────────────────────
  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full"
      >
        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white ring-1 ring-slate-900/5 relative">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: themeColor }} />

          <CardContent className="p-8 md:p-10 text-center relative z-10 flex flex-col items-center pt-10">
            {/* Check animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-5"
              style={{ backgroundImage: `linear-gradient(to bottom right, ${themeColor}, ${themeColor}cc)` }}
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                Booking Confirmed!
              </h2>
              <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                Your slot is reserved with Dr. {doctorFirstName}. Save the details below.
              </p>
            </motion.div>

            {/* Date / Time card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-sm rounded-2xl ring-1 ring-slate-100 shadow-sm p-5 text-left mb-6 flex gap-4"
            >
              <div className="flex-1 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <CalendarCheck className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Date</p>
                  <p className="text-sm font-bold text-slate-900">{successData.date}</p>
                </div>
              </div>
              <div className="w-px bg-slate-100" />
              <div className="flex-1 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Time</p>
                  <p className="text-sm font-bold text-slate-900">{successData.time}</p>
                </div>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-sm flex flex-col gap-3"
            >
              <button
                onClick={() => router.push(`/track/${successData.appointmentId}`)}
                className="w-full rounded-2xl text-white font-bold text-sm shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 py-3.5"
                style={{ backgroundColor: themeColor }}
              >
                <Sparkles className="w-4 h-4" />
                View Queue Status
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <div className="flex gap-3 w-full">
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Add to Calendar
                </a>
                <button
                  onClick={shareAppointment}
                  className="flex-1 bg-[#25D366] text-white py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#20bd5a] transition-all active:scale-[0.98] shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>

              {/* Trust note */}
              <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Your appointment is saved and secure
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // ─── STEP 1: DATE SELECTION ─────────────────────────────────────────────
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="space-y-5 pt-2"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pick a Date</h2>
        <p className="text-slate-500 text-sm mt-1">Choose your preferred day for the consultation.</p>
      </div>

      <div className="grid grid-cols-3 min-[400px]:grid-cols-4 sm:grid-cols-5 gap-2.5">
        {next14Days.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const dateStr = format(date, "yyyy-MM-dd");
          const dayOfWeek = date.getDay();
          const isWorkingDay = workingDays.includes(dayOfWeek) && !closedDates.includes(dateStr);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              disabled={!isWorkingDay}
              className={`flex flex-col items-center justify-center h-[84px] rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? "border-transparent text-white shadow-lg scale-[1.02]"
                  : !isWorkingDay
                  ? "border-slate-100 bg-slate-50/50 opacity-35 cursor-not-allowed"
                  : "border-slate-200/60 bg-slate-50/50 text-slate-500 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.97] hover:shadow-sm"
              }`}
              style={
                isSelected
                  ? {
                      backgroundColor: themeColor,
                      backgroundImage: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}dd 100%)`,
                    }
                  : {}
              }
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? "opacity-85" : "text-slate-400"}`}>
                {format(date, "EEE")}
              </span>
              <span className="text-xl font-black mt-1 tracking-tight">
                {format(date, "d")}
              </span>
              <span className={`text-[10px] uppercase font-bold mt-0.5 ${isSelected ? "opacity-75" : "text-slate-400"}`}>
                {format(date, "MMM")}
              </span>
              {isToday && !isSelected && (
                <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ backgroundColor: themeColor }} />
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );

  // ─── STEP 2: TIME SELECTION (grouped) ──────────────────────────────────
  const renderStep2 = () => {
    const { morning, afternoon, evening } = groupSlots(availableSlots);
    const groups = [
      { label: "Morning", icon: Sun, slots: morning },
      { label: "Afternoon", icon: Sunset, slots: afternoon },
      { label: "Evening", icon: Moon, slots: evening },
    ].filter((g) => g.slots.length > 0);

    return (
      <motion.div
        key="step2"
        initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
        transition={{ duration: 0.3 }}
        className="space-y-5 pt-2"
      >
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Available Slots</h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {isLoadingSlots ? (
          <div className="flex flex-col items-center justify-center py-14 bg-slate-50/50 rounded-3xl border border-slate-100">
            <Loader2 className="w-8 h-8 animate-spin mb-3" style={{ color: themeColor }} />
            <p className="text-slate-500 text-sm font-medium">Checking availability...</p>
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-14 bg-slate-50/80 rounded-3xl border border-slate-100">
            <div className="w-14 h-14 rounded-full bg-slate-200/50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-900 font-bold text-base">Fully Booked</p>
            <p className="text-slate-500 text-sm mt-1 max-w-[220px] mx-auto">
              Dr. {doctorFirstName} is fully booked on this day. Please select another date.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map(({ label, icon: Icon, slots }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-2.5">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                  <span className="text-xs text-slate-300 font-medium">({slots.length} slots)</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {slots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className="py-3 px-2 rounded-xl border-2 border-slate-100 bg-white text-slate-700 font-bold text-xs hover:border-slate-300 hover:shadow-sm transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 group"
                    >
                      <Clock className="w-3 h-3 text-slate-300 group-hover:text-slate-400 transition-colors" />
                      {formatTimeDisplay(time)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // ─── STEP 3: PATIENT DETAILS ────────────────────────────────────────────
  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 20, filter: "blur(4px)" }}
      transition={{ duration: 0.3 }}
      className="space-y-5 pt-2"
    >
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Details</h2>
        <p className="text-slate-500 text-sm mt-1">Almost done — just your name and phone number.</p>
      </div>

      {/* Appointment summary */}
      <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 flex gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <CalendarCheck className="w-20 h-20" />
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100">
            <Calendar className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</p>
            <p className="text-xs font-bold text-slate-900">{format(selectedDate, "MMM d, yyyy")}</p>
          </div>
        </div>
        <div className="hidden sm:block w-px bg-slate-200 relative z-10" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100">
            <Clock className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</p>
            <p className="text-xs font-bold text-slate-900">{selectedTime && formatTimeDisplay(selectedTime)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="patient-name" className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" /> Full Name
          </label>
          <Input
            id="patient-name"
            placeholder="E.g. Rahul Sharma"
            {...register("patientName")}
            className={`h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white text-base transition-all shadow-inner focus:shadow-none focus:border-slate-300 ${
              errors.patientName ? "border-red-400 focus-visible:ring-red-300" : "focus-visible:ring-slate-900/10"
            }`}
          />
          {errors.patientName && <p className="text-xs text-red-500 font-medium px-1">{errors.patientName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="patient-phone" className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" /> Mobile Number
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400 text-sm">+91</span>
            <Input
              id="patient-phone"
              type="tel"
              placeholder="9876543210"
              {...register("patientPhone")}
              className={`h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white text-base transition-all shadow-inner focus:shadow-none focus:border-slate-300 pl-12 ${
                errors.patientPhone ? "border-red-400 focus-visible:ring-red-300" : "focus-visible:ring-slate-900/10"
              }`}
            />
          </div>
          {errors.patientPhone && <p className="text-xs text-red-500 font-medium px-1">{errors.patientPhone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="patient-email" className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" /> Email <span className="text-slate-400 font-normal ml-1">(Optional)</span>
          </label>
          <Input
            id="patient-email"
            type="email"
            placeholder="your@email.com"
            {...register("patientEmail")}
            className={`h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white text-base transition-all shadow-inner focus:shadow-none focus:border-slate-300 ${
              errors.patientEmail ? "border-red-400 focus-visible:ring-red-300" : "focus-visible:ring-slate-900/10"
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-2xl text-white font-bold text-sm shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
          style={{
            backgroundColor: themeColor,
            backgroundImage: `linear-gradient(to right, ${themeColor}, ${themeColor}cc)`,
          }}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Confirm Booking
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>

        {/* Trust note under CTA */}
        <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          Free to book · No payment needed · Instant confirmation
        </p>
      </form>
    </motion.div>
  );

  // ─── TRACK VIEW ─────────────────────────────────────────────────────────
  const renderTrackView = () => (
    <motion.div
      key="track"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 pt-2"
    >
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-slate-50 border border-slate-100 mb-4">
          <Search className="w-7 h-7 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Appointment</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto leading-relaxed">
          Already booked? Enter your mobile number to track your live queue position.
        </p>
      </div>

      <form onSubmit={handleTrackSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="track-phone" className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" /> Mobile Number
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400 text-sm">+91</span>
            <Input
              id="track-phone"
              type="tel"
              placeholder="9876543210"
              value={trackPhone}
              onChange={(e) => setTrackPhone(e.target.value)}
              required
              className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white text-base transition-all shadow-inner focus:shadow-none focus:border-slate-300 pl-12 focus-visible:ring-slate-900/10"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isTracking || trackPhone.length !== 10}
          className="w-full h-12 rounded-2xl text-white font-bold text-sm shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100"
          style={{
            backgroundColor: themeColor,
            backgroundImage: `linear-gradient(to right, ${themeColor}, ${themeColor}cc)`,
          }}
        >
          {isTracking ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Find My Appointment
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );

  // ─── MAIN WIDGET ─────────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Back button */}
      {mode === "book" && step > 1 && (
        <button
          onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors mb-3 px-2.5 py-1.5 bg-white rounded-xl shadow-sm border border-slate-100 w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      )}

      <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white ring-1 ring-slate-900/5 relative min-h-[480px]">
        {/* Clinic identity strip */}
        <div
          className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-slate-50"
          style={{ background: `linear-gradient(to right, ${themeColor}08, transparent)` }}
        >
          <div
            className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-black overflow-hidden"
            style={{ backgroundColor: themeColor }}
          >
            {isSafeImageUrl(clinic.logoUrl) && !logoError ? (
              <img
                src={clinic.logoUrl!}
                alt={clinic.name}
                className="w-full h-full object-cover"
                onError={() => setLogoError(true)}
              />
            ) : (
              clinic.name[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-800 truncate">{clinic.name}</p>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              {doctorFirstName.startsWith("Dr.") ? doctorFirstName : `Dr. ${doctorFirstName}`}
              {clinic.specialty ? ` · ${clinic.specialty}` : ""}
            </p>
          </div>
          {clinic.consultationFee ? (
            <span className="flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg text-white" style={{ backgroundColor: themeColor }}>
              ₹{clinic.consultationFee}
            </span>
          ) : null}
        </div>

        {/* Tab toggle */}
        <div className="p-1.5 bg-slate-100/80 rounded-2xl m-4 sm:m-5 mb-2 flex gap-1 relative z-10">
          <button
            onClick={() => setMode("book")}
            className={`flex-1 py-2.5 text-sm font-bold transition-all relative rounded-xl ${
              mode === "book" ? "text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {mode === "book" && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-xl" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <span className="relative z-10">Book Appointment</span>
          </button>
          <button
            onClick={() => setMode("track")}
            className={`flex-1 py-2.5 text-sm font-bold transition-all relative rounded-xl ${
              mode === "track" ? "text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {mode === "track" && (
              <motion.div layoutId="activeTab" className="absolute inset-0 bg-white rounded-xl" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
            )}
            <span className="relative z-10">My Appointment</span>
          </button>
        </div>

        {/* Progress bar */}
        {mode === "book" && (
          <div className="h-1 w-full bg-slate-100 relative overflow-hidden">
            <motion.div
              className="absolute top-0 bottom-0 left-0"
              style={{ backgroundColor: themeColor }}
              initial={{ width: "33%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: "anticipate" }}
            />
          </div>
        )}

        {/* Step indicator dots */}
        {mode === "book" && (
          <div className="absolute top-[64px] right-5 flex items-center gap-1.5 z-20">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="rounded-full transition-all duration-500 ease-out"
                style={{
                  width: s === step ? "20px" : "6px",
                  height: "6px",
                  backgroundColor: s <= step ? themeColor : "#f1f5f9",
                }}
              />
            ))}
          </div>
        )}

        <CardContent className="p-5 sm:p-7 pt-4">
          <AnimatePresence mode="wait">
            {mode === "book" && step === 1 && renderStep1()}
            {mode === "book" && step === 2 && renderStep2()}
            {mode === "book" && step === 3 && renderStep3()}
            {mode === "track" && renderTrackView()}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
