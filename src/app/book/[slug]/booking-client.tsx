"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { getAvailableSlots, createBooking } from "./actions";
import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";


import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Clock, Calendar as CalendarIcon, CheckCircle2, User,
  Loader2, ArrowRight, Sparkles, CalendarCheck, Calendar, Phone,
  Mail, ChevronLeft, ChevronRight, Sun, Sunset, Moon, ShieldCheck, Share2,
  FileText
} from "lucide-react";
import { formatTimeDisplay } from "@/lib/format";
import { PatientLoginModal } from "@/components/patient-login-modal";
import confetti from "canvas-confetti";
import { DICTIONARY, Language } from "@/lib/i18n";

function getContrastColor(hexcolor: string): string {
  if (!hexcolor) return "#ffffff";
  const hex = hexcolor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#0f172a" : "#ffffff";
}


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
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  patientEmail: z
    .string()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  isFirstTime: z.boolean(),
});
type BookingData = z.infer<typeof bookingSchema>;

function stripDr(name: string) {
  return name.replace(/^dr\.?\s*/i, "").trim();
}


function groupSlots(slots: string[]) {
  const morning: string[] = [],
    afternoon: string[] = [],
    evening: string[] = [];
  for (const s of slots) {
    const h = parseInt(s.split(":")[0], 10);
    if (h < 12) morning.push(s);
    else if (h < 17) afternoon.push(s);
    else evening.push(s);
  }
  return { morning, afternoon, evening };
}

export function BookingClient({
  clinic,
  workingDays,
  closedDates,
  lexicon,
  lang,
}: {
  clinic: ClinicData;
  workingDays: number[];
  closedDates: string[];
  lexicon: {
    doctorTitle: string;
    patientTitle: string;
    consultationTerm: string;
    clinicType: string;
  };
  lang: Language;
}) {
  const t = DICTIONARY[lang];
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") =>
    scrollRef.current?.scrollBy({ left: dir === "left" ? -180 : 180, behavior: "smooth" });

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [logoError, setLogoError] = useState(false);
  const today = startOfToday();
  const next14 = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const [selectedDate, setSelectedDate] = useState<Date>(
    () =>
      next14.find(
        (d) =>
          workingDays.includes(d.getDay()) &&
          !closedDates.includes(format(d, "yyyy-MM-dd"))
      ) || today
  );
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [successData, setSuccessData] = useState<{
    appointmentId: string;
    date: string;
    time: string;
  } | null>(null);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const acqSource = searchParams.get("source") || undefined;

  const themeColor = clinic.themeColor ?? "#0ea5e9";
  const textColor = getContrastColor(themeColor);
  const doctorFirst = stripDr(clinic.doctorName);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingData>({ 
    resolver: zodResolver(bookingSchema), 
    shouldUnregister: false,
    defaultValues: { isFirstTime: true }
  });

  // Pillar 2: Zero-Friction Patient UX (Auto-fill Memory)
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("dd_patient_name");
      const savedPhone = localStorage.getItem("dd_patient_phone");
      if (savedName) setValue("patientName", savedName);
      if (savedPhone) setValue("patientPhone", savedPhone);
    } catch (e) {
      // Ignore localStorage errors (e.g., incognito)
    }
  }, [setValue]);

  useEffect(() => {
    if (step <= 2) {
      setLoadingSlots(true);
      getAvailableSlots(clinic.id, format(selectedDate, "yyyy-MM-dd"))
        .then((r) => { if (r.slots) setSlots(r.slots); })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDate, clinic.id, step]);

  const onSubmit = (data: BookingData) => {
    if (!selectedTime) return;

    // Pillar 4: Bulletproof Data (Phone Normalization)
    let cleanPhone = data.patientPhone.replace(/\D/g, "");
    if (cleanPhone.length > 10 && cleanPhone.startsWith("91")) {
      cleanPhone = cleanPhone.slice(-10);
    }

    // Save to memory for future frictionless bookings
    try {
      localStorage.setItem("dd_patient_name", data.patientName);
      localStorage.setItem("dd_patient_phone", cleanPhone);
    } catch (e) {}

    startTransition(async () => {
      const res = await createBooking(
        clinic.id,
        format(selectedDate, "yyyy-MM-dd"),
        selectedTime,
        data.patientName,
        cleanPhone,
        data.patientEmail,
        acqSource
      );
      if (res.error) {
        toast.error(res.error);
        if (res.error.includes("taken")) {
          setStep(2);
          setSelectedTime(null);
          setLoadingSlots(true);
          getAvailableSlots(clinic.id, format(selectedDate, "yyyy-MM-dd")).then((r) => {
            if (r.slots) setSlots(r.slots);
            setLoadingSlots(false);
          });
        }
      } else if ("appointmentId" in res && (res as any).appointmentId) {
        // Fire Confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: [themeColor, '#ffffff']
        });
        
        setSuccessData({
          appointmentId: (res as any).appointmentId,
          date: format(selectedDate, "EEE, MMM d, yyyy"),
          time: formatTimeDisplay(selectedTime),
        });
      }
    });
  };

  const calUrl = () => {
    if (!successData || !selectedTime) return "#";
    const start = format(selectedDate, "yyyyMMdd") + "T" + selectedTime.replace(":", "") + "00";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Appointment – Dr. ${doctorFirst}`)}&dates=${start}/${start}&details=${encodeURIComponent(`Consultation at ${clinic.name}`)}&location=${encodeURIComponent(clinic.address || clinic.name)}&ctz=Asia/Kolkata`;
  };

  const downloadIcs = () => {
    if (!successData || !selectedTime) return;
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const [h, m] = (selectedTime || "10:00").split(":");
    const startTimeStr = `${year}${month}${day}T${h}${m}00`;
    const endHour = String((parseInt(h, 10) + 1) % 24).padStart(2, "0");
    const endTimeStr = `${year}${month}${day}T${endHour}${m}00`;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Doctor Diary//EN",
      "BEGIN:VEVENT",
      `SUMMARY:Appointment - Dr. ${doctorFirst}`,
      `DESCRIPTION:Consultation with Dr. ${doctorFirst} at ${clinic.name}`,
      `LOCATION:${clinic.address || clinic.name}`,
      `DTSTART:${startTimeStr}`,
      `DTEND:${endTimeStr}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `appointment-dr-${doctorFirst.toLowerCase().replace(/\s+/g, "-")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareWA = () => {
    if (!successData) return;
    const msg = `My appointment at ${clinic.name} is confirmed!\nDate: ${successData.date}\nTime: ${successData.time}\nTrack my turn live 👉 ${window.location.origin}/track/${successData.appointmentId}\n\nBooked via Doctor Diary 📋`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
      >
        <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-slate-900/5 shadow-2xl">
          <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}99)` }} />
          <div className="p-8 flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-xl mb-4"
              style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}bb)` }}
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <h2 className="text-2xl font-black text-slate-900 mb-1">{t.confirmed}</h2>
              <p className="text-slate-500 text-sm max-w-[280px] mx-auto mb-6">{t.confirmedSub(doctorFirst, lexicon?.doctorTitle || "Dr.")}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-sm rounded-2xl border border-slate-100 bg-slate-50 p-4 flex justify-around gap-4 mb-5 shadow-inner"
            >
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.dateLabel}</p>
                <p className="text-sm font-bold text-slate-900">{successData.date}</p>
              </div>
              <div className="w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.timeLabel}</p>
                <p className="text-sm font-bold text-slate-900">{successData.time}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full max-w-sm space-y-3"
            >
              <button
                onClick={() => router.push(`/track/${successData.appointmentId}?lang=${lang}`)}
                className="w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, color: textColor }}
              >
                <Sparkles className="w-4 h-4" />
                {t.trackCta}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex gap-2">
                <a
                  href={calUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border border-slate-200 bg-white text-slate-700 py-3 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Save to Android
                </a>
                <button
                  onClick={downloadIcs}
                  className="flex-1 border border-slate-200 bg-white text-slate-700 py-3 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 hover:bg-slate-50 transition-all shadow-sm"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                  Save to iPhone
                </button>
                <button
                  onClick={shareWA}
                  className="w-11 bg-[#25D366] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center hover:bg-[#1fba5a] transition-all shadow-sm flex-shrink-0"
                  aria-label="Share via WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1 mb-4">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {t.secure}
              </p>

              {/* Patient Portal Upsell */}
              <div 
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full relative overflow-hidden rounded-2xl cursor-pointer group hover:shadow-lg transition-all border border-blue-100/50"
                style={{ background: `linear-gradient(to right, ${themeColor}15, ${themeColor}05)` }}
              >
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: themeColor }} />
                <div className="p-4 flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                    <FileText className="w-5 h-5" style={{ color: themeColor }} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-slate-900 mb-0.5 group-hover:text-blue-700 transition-colors">Access Patient Portal</p>
                    <p className="text-[11px] text-slate-500 font-medium">Save details for 1-tap booking & view digital records.</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

            </motion.div>
          </div>

          <PatientLoginModal 
            isOpen={isLoginModalOpen} 
            onClose={() => setIsLoginModalOpen(false)} 
            themeColor={themeColor} 
            clinicName={clinic.name} 
          />

          {/* Attribution */}
          <div className="border-t border-slate-50 px-5 py-3 flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ backgroundColor: themeColor }}>
              <span style={{ color: textColor, fontSize: "7px", fontWeight: 900 }}>DD</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Powered by <span className="font-bold text-slate-500">Doctor Diary</span>
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── STEP 1: DATE ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <motion.div
      key="step1"
      layout
      initial={{ opacity: 0, x: -16, filter: "blur(3px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: -16, filter: "blur(3px)" }}
      transition={{ duration: 0.28, layout: { duration: 0.3, type: "spring", bounce: 0 } }}
      className="space-y-5"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">{t.pickDate}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{t.pickDateSub}</p>
        </div>
        {!isSameDay(selectedDate, today) && workingDays.includes(today.getDay()) && !closedDates.includes(format(today, "yyyy-MM-dd")) && (
          <button 
            onClick={() => { 
              setSelectedDate(today);
              scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
            }} 
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Today
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 z-10 w-7 h-7 hidden sm:flex items-center justify-center bg-white shadow-md border border-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Scroll dates left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x gap-2 pb-3 pt-1 -mx-5 px-5 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
        >
          {next14.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const dateStr = format(date, "yyyy-MM-dd");
            const isWorking = workingDays.includes(date.getDay()) && !closedDates.includes(dateStr);
            return (
              <button
                key={date.toISOString()}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                  setStep(2);
                }}
                disabled={!isWorking}
                className={`flex-shrink-0 w-[66px] flex flex-col items-center justify-center h-[84px] rounded-2xl border-2 transition-all duration-200 snap-center ${
                  isSelected
                    ? "border-transparent shadow-lg scale-[1.05]"
                    : !isWorking
                    ? "border-slate-100 bg-slate-50/40 opacity-25 cursor-not-allowed"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:shadow-sm active:scale-95"
                }`}
                style={isSelected ? { backgroundColor: themeColor } : {}}
              >
                <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? "opacity-70" : "text-slate-400"}`} style={isSelected ? { color: textColor } : {}}>
                  {format(date, "EEE")}
                </span>
                <span className={`text-[22px] font-black mt-0.5 leading-none`} style={{ color: isSelected ? textColor : undefined }}>
                  {format(date, "d")}
                </span>
                <span className={`text-[9px] uppercase font-bold mt-0.5 ${isSelected ? "opacity-70" : "text-slate-400"}`} style={isSelected ? { color: textColor } : {}}>
                  {format(date, "MMM")}
                </span>
                {isToday && !isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ backgroundColor: themeColor }} />
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 z-10 w-7 h-7 hidden sm:flex items-center justify-center bg-white shadow-md border border-slate-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
          aria-label="Scroll dates right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!workingDays.includes(selectedDate.getDay()) || closedDates.includes(format(selectedDate, "yyyy-MM-dd"))}
        className="w-full h-13 py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40 disabled:translate-y-0 disabled:cursor-not-allowed"
        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, color: textColor }}
      >
        {t.seeMore} <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );

  // ── STEP 2: TIME ─────────────────────────────────────────────────────────
  const renderStep2 = () => {
    const { morning, afternoon, evening } = groupSlots(slots);
    const groups = [
      { label: t.morning, icon: Sun, items: morning },
      { label: t.afternoon, icon: Sunset, items: afternoon },
      { label: t.evening, icon: Moon, items: evening },
    ].filter((g) => g.items.length > 0);

    return (
      <motion.div
        key="step2"
        layout
        initial={{ opacity: 0, x: 16, filter: "blur(3px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, x: 16, filter: "blur(3px)" }}
        transition={{ duration: 0.28, layout: { duration: 0.3, type: "spring", bounce: 0 } }}
        className="space-y-5"
      >
        <div>
          <h2 className="text-lg font-black text-slate-900">{t.pickTime}</h2>
          <p className="text-slate-500 text-sm mt-0.5 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            {format(selectedDate, "EEEE, MMMM d")}
          </p>
        </div>

        {loadingSlots ? (
          <div className="space-y-5 animate-pulse mt-4">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="w-24 h-4 bg-slate-200 rounded-full mb-3 opacity-50" />
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-11 bg-slate-100 rounded-xl opacity-70" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-200/60 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-bold text-slate-700 text-sm">{t.fullyBooked}</p>
            <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed font-medium">
              {t.fullyBookedSub(stripDr(clinic.doctorName), lexicon?.doctorTitle || "Dr.")}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map(({ label, icon: Icon, items }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                  <span className="text-[10px] text-slate-300 font-medium">({items.length} {t.slots})</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {items.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          // Slight delay to allow layoutId animation to play before sliding out
                          setTimeout(() => setStep(3), 150);
                        }}
                        className={`relative py-3 rounded-xl border-2 transition-all active:scale-95 text-center overflow-hidden font-bold text-[12px] ${isSelected ? "border-transparent text-white" : "border-slate-100 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"}`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-time-pill"
                            className="absolute inset-0"
                            style={{ backgroundColor: themeColor }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                          />
                        )}
                        <span className="relative z-10">{formatTimeDisplay(time)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // ── STEP 3: DETAILS ───────────────────────────────────────────────────────
  const renderStep3 = () => (
    <motion.div
      key="step3"
      layout
      initial={{ opacity: 0, x: 16, filter: "blur(3px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, x: 16, filter: "blur(3px)" }}
      transition={{ duration: 0.28, layout: { duration: 0.3, type: "spring", bounce: 0 } }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-lg font-black text-slate-900">{t.details}</h2>
        <p className="text-slate-500 text-sm mt-0.5">{t.detailsSub}</p>
      </div>

      {/* Summary */}
      <div className="rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 flex gap-4 items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm">
            <Calendar className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{t.dateLabel}</p>
            <p className="text-xs font-bold text-slate-900">{format(selectedDate, "MMM d, yyyy")}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm">
            <Clock className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{t.timeLabel}</p>
            <p className="text-xs font-bold text-slate-900">{selectedTime && formatTimeDisplay(selectedTime)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="w-5 h-5 text-slate-400 group-focus-within:text-[var(--theme-color)] transition-colors" style={{ '--theme-color': themeColor } as React.CSSProperties} />
            </div>
            <Input
              id="p-name"
              placeholder={`${lexicon?.patientTitle || 'Patient'} Name (e.g. Rahul Sharma)`}
              {...register("patientName")}
              className={`h-14 pl-12 py-4 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base font-medium transition-all focus:ring-4 focus:border-transparent ${errors.patientName ? "border-red-400 focus:ring-red-400/20" : ""}`}
              style={{ '--tw-ring-color': `${themeColor}30` } as React.CSSProperties}
            />
          </div>
          {errors.patientName && <p className="text-xs text-red-500 font-medium px-2">{errors.patientName.message}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <div className="relative group flex">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Phone className="w-5 h-5 text-slate-400 group-focus-within:text-[var(--theme-color)] transition-colors" style={{ '--theme-color': themeColor } as React.CSSProperties} />
            </div>
            <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none z-10">
              <span className="font-bold text-slate-400 text-base select-none">+91</span>
            </div>
            <Input
              id="p-phone"
              type="tel"
              inputMode="numeric"
              placeholder="98765 43210"
              {...register("patientPhone")}
              className={`h-14 pl-24 py-4 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base font-medium transition-all focus:ring-4 focus:border-transparent ${errors.patientPhone ? "border-red-400 focus:ring-red-400/20" : ""}`}
              style={{ '--tw-ring-color': `${themeColor}30` } as React.CSSProperties}
            />
          </div>
          {errors.patientPhone && <p className="text-xs text-red-500 font-medium px-2">{errors.patientPhone.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-slate-400 group-focus-within:text-[var(--theme-color)] transition-colors" style={{ '--theme-color': themeColor } as React.CSSProperties} />
            </div>
            <Input
              id="p-email"
              type="email"
              placeholder={`${t.emailLabel} ${t.optional}`}
              {...register("patientEmail")}
              className="h-14 pl-12 py-4 rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-base font-medium transition-all focus:ring-4 focus:border-transparent"
              style={{ '--tw-ring-color': `${themeColor}30` } as React.CSSProperties}
            />
          </div>
        </div>

        {/* First Time Visitor Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                {...register("isFirstTime")} 
                className="peer appearance-none w-5 h-5 rounded-md border-2 border-slate-300 checked:border-[var(--theme-color)] checked:bg-[var(--theme-color)] transition-all cursor-pointer"
                style={{ '--theme-color': themeColor } as React.CSSProperties}
              />
              <CheckCircle2 className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
            </div>
            <span className="text-sm font-bold text-slate-700 select-none">First time visiting this clinic?</span>
          </label>
        </div>

        {/* CTA + Trust note */}
        <div className="space-y-3 pt-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isPending}
            className="relative overflow-hidden w-full h-[56px] rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 group"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}cc)`, color: textColor, boxShadow: `0 10px 25px -5px ${themeColor}60` }}
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[20deg]" />
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin relative z-10" />
            ) : (
              <span className="relative z-10 flex items-center gap-2">{t.ctaConfirm} <ArrowRight className="w-4 h-4" /></span>
            )}
          </motion.button>

          {/* Explicit free booking notice */}
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-[11px] text-emerald-700 font-bold text-center leading-tight">
              {t.trustNote(clinic.consultationFee)}
            </p>
          </div>
        </div>
      </form>
    </motion.div>
  );

  // ── WIDGET SHELL ─────────────────────────────────────────────────────────
  return (
    <div className="w-full" id="booking">

      <div className="relative bg-white rounded-3xl overflow-hidden">
        {/* Top color bar */}
        <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}88)` }} />

        {/* Progress bar */}
        <div className="h-0.5 w-full bg-slate-100 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{ backgroundColor: themeColor }}
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: "anticipate" }}
          />
        </div>

        {/* Back + step dots row */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0 min-h-[36px]">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> {t.back}
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className="rounded-full transition-all duration-400"
                style={{
                  width: s === step ? "20px" : "5px",
                  height: "5px",
                  backgroundColor: s <= step ? themeColor : "#e2e8f0",
                }}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="p-5 sm:p-7 pt-4">
          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </AnimatePresence>
        </div>

        {/* Doctor Diary attribution */}
        <div className="border-t border-slate-50 px-5 py-3 flex items-center justify-center gap-2">
          <div
            className="w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: themeColor }}
          >
            <span style={{ color: textColor, fontSize: "7px", fontWeight: 900, lineHeight: 1 }}>DD</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium">
            Powered by <span className="font-bold text-slate-600">Doctor Diary</span> · Smart Queue System
          </p>
        </div>
      </div>
    </div>
  );
}
