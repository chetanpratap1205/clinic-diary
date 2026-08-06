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
import { PatientInstallButton } from "@/components/pwa-provider";
import { PushOptIn } from "@/components/push-opt-in";
import confetti from "canvas-confetti";
import { DICTIONARY, Language } from "@/lib/i18n";

function getContrastColor(hexcolor: string): string {
  if (!hexcolor) return "#ffffff";
  const hex = hexcolor.replace("#", "");
  const r = parseInt(hex.substring(0, 2) || "0", 16);
  const g = parseInt(hex.substring(2, 4) || "0", 16);
  const b = parseInt(hex.substring(4, 6) || "0", 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 200 ? "#0f172a" : "#ffffff";
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
  patientName: z.string().min(2, "Please enter your full name"),
  patientPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  patientEmail: z
    .string()
    .email("Please enter a valid email address")
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
  const next30 = Array.from({ length: 30 }, (_, i) => addDays(today, i));

  const [selectedDate, setSelectedDate] = useState<Date>(
    () =>
      next30.find(
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
  const preselectedService = searchParams.get("service") || searchParams.get("treatment") || undefined;

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

  // Handle URL pre-selected slot parameters (?slot=17:30&date=yyyy-MM-dd)
  useEffect(() => {
    const slotParam = searchParams.get("slot");
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    }
    if (slotParam) {
      setSelectedTime(slotParam);
      setStep(3);
    }
  }, [searchParams]);

  // Auto-center active date in horizontal carousel
  useEffect(() => {
    if (scrollRef.current) {
      const activeEl = scrollRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedDate]);

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
    const referralUrl = `${window.location.origin}/book/${clinic.slug}`;
    const msg = `My OPD appointment at ${clinic.name} is confirmed for ${successData.date} at ${successData.time}.\n\nTrack live queue 👉 ${window.location.origin}/track/${successData.appointmentId}\n\nBook your appointment online at ${clinic.name} here: ${referralUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // ── 10/10 SUCCESS DIGITAL BOARDING TICKET ──────────────────────────────────
  if (successData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-900/10 shadow-2xl">
          {/* Top Decorative Gradient */}
          <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}bb)` }} />
          
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            
            {/* Animated Success Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl mb-4 relative"
              style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, boxShadow: `0 15px 35px -5px ${themeColor}60` }}
            >
              <CheckCircle2 className="w-10 h-10 text-white stroke-[2.5]" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 mb-2 inline-block">
                OPD Token Reserved
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{t.confirmed}</h2>
              <p className="text-slate-500 text-xs sm:text-sm max-w-[290px] mx-auto mt-1 mb-6 font-medium">
                {t.confirmedSub(doctorFirst, lexicon?.doctorTitle || "Dr.")}
              </p>
            </motion.div>

            {/* 10/10 Digital Boarding Ticket Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className="w-full max-w-sm rounded-3xl border-2 border-slate-100 bg-gradient-to-b from-slate-50/90 via-slate-50/50 to-white p-5 relative overflow-hidden mb-6 shadow-sm"
            >
              {/* Semi-circle Ticket Cutouts */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-inner -translate-y-1/2" />
              <div className="absolute top-1/2 -right-3 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-inner -translate-y-1/2" />

              <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200 px-2">
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clinic</p>
                  <p className="text-xs font-black text-slate-900 line-clamp-1">{clinic.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Doctor</p>
                  <p className="text-xs font-black text-slate-900">Dr. {doctorFirst}</p>
                </div>
              </div>

              <div className="py-4 flex items-center justify-between px-2">
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.dateLabel}</p>
                  <p className="text-sm font-black text-slate-900">{successData.date}</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.timeLabel}</p>
                  <p className="text-sm font-black text-slate-900">{successData.time}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-200 px-2 flex items-center justify-between text-xs font-bold text-slate-600">
                <span className="flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Pay ₹{clinic.consultationFee || 0} at Clinic
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zero Booking Fee</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="w-full max-w-sm space-y-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push(`/track/${successData.appointmentId}?lang=${lang}`)}
                className="w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: textColor, boxShadow: `0 12px 30px -8px ${themeColor}60` }}
              >
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                <Sparkles className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{t.trackCta}</span>
                <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <div className="flex gap-2">
                <a
                  href={calUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 py-3 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Save Android
                </a>
                <button
                  onClick={downloadIcs}
                  className="flex-1 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 py-3 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                  Save iPhone
                </button>
                <button
                  onClick={shareWA}
                  className="w-11 bg-[#25D366] text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center hover:bg-[#1fba5a] transition-all shadow-md active:scale-95 flex-shrink-0"
                  aria-label="Share via WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1 mb-2 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                {t.secure}
              </p>

              {/* ── Turn Alert Opt-In Card (High-Intent Placement) ─────────── */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="w-full mb-2"
              >
                <PushOptIn
                  appointmentId={successData.appointmentId}
                  clinicId={clinic.id}
                  variant="card"
                />
              </motion.div>

              {/* Patient Portal Card */}
              <div 
                onClick={() => setIsLoginModalOpen(true)}
                className="w-full relative overflow-hidden rounded-2xl cursor-pointer group hover:shadow-md transition-all border border-slate-200/80 bg-slate-50/50 hover:bg-white p-3.5 flex items-center gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100 flex-shrink-0">
                  <FileText className="w-5 h-5" style={{ color: themeColor }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">My Appointments & Records</p>
                  <p className="text-[10.5px] text-slate-500 font-medium">View prescriptions, medical records & tokens.</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Dedicated 10/10 Clinic App Install Card */}
              <div className="pt-1">
                <PatientInstallButton
                  clinicName={clinic.name}
                  logoUrl={clinic.logoUrl}
                  themeColor={themeColor}
                  className="w-full justify-between py-3 px-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-0 shadow-xl"
                />
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
          <div className="border-t border-slate-50 px-5 py-3 flex items-center justify-center gap-2 bg-slate-50/40">
            <div className="w-4 h-4 rounded-sm flex items-center justify-center" style={{ backgroundColor: themeColor }}>
              <span style={{ color: textColor, fontSize: "7px", fontWeight: 900 }}>DD</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Powered by <span className="font-bold text-slate-600">Doctor Diary</span> · OPD Queue Platform
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── STEP 1: 10/10 TACTILE DATE PICKER ──────────────────────────────────────
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
          <h2 className="text-lg font-black text-slate-900 tracking-tight">{t.pickDate}</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">{t.pickDateSub}</p>
        </div>
        {!isSameDay(selectedDate, today) && workingDays.includes(today.getDay()) && !closedDates.includes(format(today, "yyyy-MM-dd")) && (
          <button 
            onClick={() => { 
              setSelectedDate(today);
              scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
            }} 
            className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200/80 transition-colors shadow-sm active:scale-95"
          >
            Select Today
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 z-10 w-8 h-8 hidden sm:flex items-center justify-center bg-white shadow-lg border border-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-transform hover:scale-110 active:scale-95"
          aria-label="Scroll dates left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x gap-2.5 pb-4 pt-1.5 -mx-5 px-5 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full"
        >
          {next30.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const dateStr = format(date, "yyyy-MM-dd");
            const isWorking = workingDays.includes(date.getDay()) && !closedDates.includes(dateStr);
            return (
              <motion.button
                key={date.toISOString()}
                data-selected={isSelected}
                whileHover={isWorking ? { y: -2 } : {}}
                whileTap={isWorking ? { scale: 0.94 } : {}}
                onClick={() => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                  setStep(2);
                }}
                disabled={!isWorking}
                aria-label={`Select date ${format(date, "EEEE, MMMM d, yyyy")}`}
                className={`flex-shrink-0 w-[68px] flex flex-col items-center justify-center h-[88px] rounded-2xl border transition-all duration-300 snap-center relative overflow-hidden ${
                  isSelected
                    ? "border-transparent text-white shadow-xl scale-[1.04]"
                    : !isWorking
                    ? "border-slate-100 bg-slate-50/50 opacity-30 cursor-not-allowed text-slate-400"
                    : "border-slate-200/80 bg-white text-slate-900 hover:border-slate-300 hover:shadow-md"
                }`}
                style={isSelected ? { backgroundColor: themeColor, boxShadow: `0 12px 25px -5px ${themeColor}60`, color: "#ffffff" } : {}}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider ${isSelected ? "text-white/90" : "text-slate-400"}`}>
                  {format(date, "EEE")}
                </span>
                <span className={`text-[22px] font-black mt-0.5 leading-none tracking-tight ${isSelected ? "text-white" : "text-slate-900"}`}>
                  {format(date, "d")}
                </span>
                <span className={`text-[9.5px] uppercase font-extrabold mt-0.5 ${isSelected ? "text-white/90" : "text-slate-400"}`}>
                  {format(date, "MMM")}
                </span>
              </motion.button>
            );
          })}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 z-10 w-8 h-8 hidden sm:flex items-center justify-center bg-white shadow-lg border border-slate-100 rounded-full text-slate-600 hover:text-slate-900 transition-transform hover:scale-110 active:scale-95"
          aria-label="Scroll dates right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setStep(2)}
        disabled={!workingDays.includes(selectedDate.getDay()) || closedDates.includes(format(selectedDate, "yyyy-MM-dd"))}
        className="w-full h-14 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed group relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: textColor, boxShadow: `0 10px 25px -5px ${themeColor}50` }}
      >
        <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
        <span className="relative z-10">{t.seeMore}</span>
        <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );

  // ── STEP 2: 10/10 TIME SLOTS (PRESSED & VIBRANT) ──────────────────────────
  const renderStep2 = () => {
    const { morning, afternoon, evening } = groupSlots(slots);
    const groups = [
      { label: t.morning, icon: Sun, items: morning, color: "text-amber-500 bg-amber-50" },
      { label: t.afternoon, icon: Sunset, items: afternoon, color: "text-orange-500 bg-orange-50" },
      { label: t.evening, icon: Moon, items: evening, color: "text-indigo-500 bg-indigo-50" },
    ].filter((g) => g.items.length > 0);

    const handleJumpToNextAvailable = () => {
      const nextOpen = next30.find(
        (d) =>
          !isSameDay(d, selectedDate) &&
          workingDays.includes(d.getDay()) &&
          !closedDates.includes(format(d, "yyyy-MM-dd"))
      );
      if (nextOpen) {
        setSelectedDate(nextOpen);
        setSelectedTime(null);
        setStep(1);
      }
    };

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
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">{t.pickTime}</h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5 flex items-center gap-1.5 font-medium">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              {format(selectedDate, "EEEE, MMMM d")}
            </p>
          </div>
          {slots.length > 0 && slots.length <= 8 && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1.5 shadow-sm animate-pulse">
              <span>🔥</span> {slots.length} Slots Remaining
            </span>
          )}
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
          <div className="text-center py-10 bg-slate-50/80 rounded-3xl border border-slate-100 p-6 space-y-4 shadow-inner">
            <div className="w-12 h-12 rounded-full bg-slate-200/60 flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="font-black text-slate-800 text-base">{t.fullyBooked}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed font-medium">
                {t.fullyBookedSub(stripDr(clinic.doctorName), lexicon?.doctorTitle || "Dr.")}
              </p>
            </div>
            <button
              onClick={handleJumpToNextAvailable}
              className="inline-flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl text-white shadow-md transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              Check Next Available Date <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map(({ label, icon: Icon, items, color }) => (
              <div key={label}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1 rounded-lg ${color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
                  <span className="text-[10px] text-slate-400 font-bold">({items.length})</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {items.map((time) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        onClick={() => {
                          setSelectedTime(time);
                          setTimeout(() => setStep(3), 150);
                        }}
                        className={`relative py-3 rounded-2xl border-2 transition-all active:scale-95 text-center overflow-hidden font-extrabold text-[12.5px] ${
                          isSelected
                            ? "border-transparent text-white shadow-lg scale-[1.02]"
                            : "border-slate-100 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
                        }`}
                        style={isSelected ? { backgroundColor: themeColor, boxShadow: `0 8px 20px -4px ${themeColor}60` } : {}}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-time-pill"
                            className="absolute inset-0"
                            style={{ backgroundColor: themeColor }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
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

  // ── STEP 3: 10/10 DETAILS FORM (iOS TOGGLE & ANIMATED FOCUS) ─────────────
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
        <h2 className="text-lg font-black text-slate-900 tracking-tight">{t.details}</h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">{t.detailsSub}</p>
      </div>

      {/* Booking Summary Pill */}
      <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/80 p-4 flex gap-4 items-center justify-between shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm">
            <Calendar className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{t.dateLabel}</p>
            <p className="text-xs font-black text-slate-900">{format(selectedDate, "MMM d, yyyy")}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-slate-200" />
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 shadow-sm">
            <Clock className="w-4 h-4" style={{ color: themeColor }} />
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{t.timeLabel}</p>
            <p className="text-xs font-black text-slate-900">{selectedTime && formatTimeDisplay(selectedTime)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <Input
              id="p-name"
              placeholder={`${lexicon?.patientTitle || 'Patient'} Full Name`}
              {...register("patientName")}
              className={`h-12 pl-10 pr-4 rounded-xl bg-slate-50/60 border-slate-200/80 focus:bg-white text-sm font-semibold text-slate-900 transition-all ${errors.patientName ? "border-red-400" : ""}`}
            />
          </div>
          {errors.patientName && <p className="text-xs text-red-500 font-semibold px-1">{errors.patientName.message}</p>}
        </div>

        {/* Phone Input with Dedicated Country Code Prefix Group */}
        <div className="space-y-1">
          <div className="flex rounded-xl overflow-hidden border border-slate-200/80 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all bg-slate-50/60">
            <div className="px-3 bg-slate-100/90 border-r border-slate-200/80 flex items-center gap-1.5 text-slate-700 font-bold text-xs shrink-0 select-none">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>+91</span>
            </div>
            <Input
              id="p-phone"
              type="tel"
              inputMode="numeric"
              placeholder="10-digit mobile number"
              {...register("patientPhone")}
              className="h-12 border-0 bg-transparent rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-semibold text-slate-900 px-3"
            />
          </div>
          {errors.patientPhone && <p className="text-xs text-red-500 font-semibold px-1">{errors.patientPhone.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="p-email"
              type="email"
              placeholder={`Email address ${t.optional}`}
              {...register("patientEmail")}
              className="h-12 pl-10 pr-4 rounded-xl bg-slate-50/60 border-slate-200/80 focus:bg-white text-sm font-semibold text-slate-900 transition-all"
            />
          </div>
        </div>

        {/* First Time Visitor Premium iOS Switch Toggle */}
        <div className="pt-2">
          <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60 cursor-pointer hover:bg-slate-100/50 transition-colors">
            <div className="flex flex-col text-left pr-4">
              <span className="text-xs sm:text-sm font-black text-slate-800 select-none">
                First time visiting this clinic?
              </span>
              <span className="text-[10.5px] text-slate-400 font-medium select-none">
                We'll reserve extra time for your consultation.
              </span>
            </div>
            
            {/* iOS Switch */}
            <div className="relative flex-shrink-0">
              <input 
                type="checkbox" 
                {...register("isFirstTime")} 
                className="peer sr-only"
              />
              <div 
                className="w-11 h-6 rounded-full bg-slate-200 peer-checked:bg-[var(--theme-color)] transition-colors duration-300" 
                style={{ '--theme-color': themeColor } as React.CSSProperties} 
              />
              <div className="w-5 h-5 rounded-full bg-white shadow-md absolute top-0.5 left-0.5 peer-checked:translate-x-5 transition-transform duration-300" />
            </div>
          </label>
        </div>

        {/* CTA + Trust note */}
        <div className="space-y-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isPending}
            className="relative overflow-hidden w-full h-[56px] rounded-2xl font-black text-base shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 group"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`, color: textColor, boxShadow: `0 12px 25px -5px ${themeColor}60` }}
          >
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[20deg]" />
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin relative z-10" />
            ) : (
              <span className="relative z-10 flex items-center gap-2">{t.ctaConfirm} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            )}
          </motion.button>

          {/* Explicit free booking notice */}
          <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-[11px] text-emerald-700 font-bold text-center leading-tight">
              {t.trustNote(clinic.consultationFee ? Number(clinic.consultationFee).toLocaleString("en-IN") : undefined)}
            </p>
          </div>

          {/* Explicit cancellation / no-show policy notice (Point 28) */}
          <p className="text-[10.5px] text-slate-400 text-center font-medium leading-tight">
            Free cancellation & slot release. Please notify clinic if unable to attend.
          </p>
        </div>
      </form>
    </motion.div>
  );

  // ── WIDGET SHELL ─────────────────────────────────────────────────────────
  return (
    <div className="w-full" id="booking">

      <div className="relative bg-white rounded-3xl overflow-hidden shadow-xs">
        {/* Sleek Progress Bar */}
        <div className="h-1 w-full bg-slate-100 relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-r-full"
            style={{ backgroundColor: themeColor }}
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* Back Button & Step Counter */}
        <div className="flex items-center justify-between px-5 pt-3 pb-0 min-h-[32px]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> {t.back}
            </button>
          ) : (
            <div />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Step {step} of 3
          </span>
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
