"use client";

import { useState, useTransition, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { updateAppointmentStatus } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, User, Play, Check, X, Activity, Undo2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Appointment, Clinic } from "@/db/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { WhatsAppShareButton } from "@/components/dashboard/patients/whatsapp-share-button";
import { formatTimeDisplay } from "@/lib/format";
import { getClinicDelay, getEstimatedStart } from "@/lib/queue-logic";
import { normalizeAppointment } from "@/lib/appointment-utils";
import { formatWhatsAppPhone } from "@/lib/phone-utils";

interface QueueClientProps {
  initialAppointments: Appointment[];
  clinic: Clinic;
  today: string;
  // P0: follow-up metadata keyed by appointmentId
  followUpMap?: Record<string, { isFree: boolean; feeOverride: number | null }>;
}

const QueueCard = ({ 
  appt, 
  clinic, 
  isPending, 
  handleStatusChange, 
  router,
  now,
  delayMinutes,
  followUpInfo,
}: { 
  appt: Appointment; 
  clinic: Clinic; 
  isPending: boolean;
  handleStatusChange: (id: string, status: string, fee?: number) => Promise<boolean>;
  router: any;
  now: Date;
  delayMinutes: number;
  followUpInfo?: { isFree: boolean; feeOverride: number | null };
}) => {
  const { estimatedStart, isDelayed } = getEstimatedStart(appt, delayMinutes, now);
  const adjustedTimeStr = format(estimatedStart, "h:mm a");
  const tokenDisplay = appt.tokenNumber !== null && appt.tokenNumber !== undefined ? appt.tokenNumber : "-";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3 group relative overflow-hidden"
    >
      {appt.status === "in_consultation" && (
         <motion.div 
           className="absolute top-0 left-0 w-1 h-full"
           style={{ backgroundColor: clinic.themeColor || "#0ea5e9" }}
           layoutId="active-indicator"
         />
      )}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[1.1rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0 text-slate-800 border border-slate-300/50 shadow-inner relative overflow-hidden">
             <div className="absolute inset-0 bg-white/50"></div>
             <span className="font-black text-lg tracking-tighter relative z-10">
               <span className="text-slate-400 font-medium text-sm mr-0.5">#</span>{tokenDisplay}
             </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 text-sm">{appt.patientName || "Patient"}</p>
              {appt.acquisitionSource === "qr_reception" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">📍 QR Reception</span>
              )}
              {appt.acquisitionSource === "qr_window" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">🪟 QR Window</span>
              )}
              {appt.acquisitionSource === "qr_stand" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">📐 QR Standee</span>
              )}
              {appt.acquisitionSource === "qr_sticker" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">🏷️ QR Sticker</span>
              )}
              {/* P0: Prefer followUpInfo for detection; fall back to notes string for old records */}
              {followUpInfo ? (
                followUpInfo.isFree ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">Free Follow-up</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-sky-100 text-sky-600">Follow-up</span>
                )
              ) : appt.notes?.includes("Quick check-in") ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">Walk-in</span>
              ) : appt.notes?.includes("Auto-generated from Follow-up") ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-sky-100 text-sky-600">Follow-up</span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-600">Scheduled</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTimeDisplay(appt.appointmentTime)}</span>
              {(appt.status === "checked_in" || appt.status === "confirmed") && (
                <span className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold border",
                  isDelayed ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                )}>
                  <Activity className="w-3 h-3" /> Est: {adjustedTimeStr}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="scale-[0.8] origin-top-right -mt-1 -mr-1">
          <WhatsAppShareButton 
            patientName={appt.patientName} 
            patientPhone={appt.patientPhone}
            clinicName={clinic.name}
            doctorName={clinic.doctorName}
            trackingUrl={`/track/${appt.id}`} 
          />
        </div>
      </div>

      {/* Actions based on status */}
      <div className="flex gap-2 mt-1 w-full">
        {appt.status === "confirmed" && (
          <>
            <button
              onClick={() => handleStatusChange(appt.id, "checked_in")}
              disabled={isPending}
              className="flex-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white min-h-[44px] rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <Check className="w-4 h-4" /> Mark Arrived
            </button>
            <button
               onClick={() => handleStatusChange(appt.id, "no_show")}
               disabled={isPending}
               className="px-4 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white min-h-[44px] rounded-xl transition-all flex items-center justify-center active:scale-[0.98]"
               title="Cancel Appointment"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}

        {appt.status === "checked_in" && (
          <button
            onClick={async () => {
              const success = await handleStatusChange(appt.id, "in_consultation");
              if (success) {
                router.push(`/dashboard/consultation/${appt.id}`);
              }
            }}
            disabled={isPending}
            className="w-full bg-sky-50 text-sky-700 hover:opacity-90 min-h-[44px] rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            style={{ color: clinic.themeColor || "#0ea5e9", backgroundColor: `${clinic.themeColor || "#0ea5e9"}15` }}
          >
            <Play className="w-4 h-4 fill-current" /> Start Consult
          </button>
        )}

        {appt.status === "in_consultation" && (
          <div className="flex gap-2 w-full">
            <button
              onClick={() => router.push(`/dashboard/consultation/${appt.id}`)}
              className="flex-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white min-h-[44px] rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" /> Resume Consult
            </button>
            <button
              onClick={() => handleStatusChange(appt.id, "completed_prompt")}
              className="px-4 bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center justify-center active:scale-[0.98]"
              title="Finish Appointment"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {["completed", "cancelled", "no_show"].includes(appt.status) && (
          <div className="flex flex-col gap-2 w-full mt-1">
             {appt.status === "completed" && (
                <button
                  onClick={() => {
                      const fee = appt.feeCollected ?? (clinic.consultationFee || 0);
                      const text = `*INVOICE & VISIT SUMMARY* 🏥\n\nDear ${appt.patientName},\nThank you for visiting *${clinic.name}* (Dr. ${clinic.doctorName}). We hope you had a comfortable experience!\n\n*Payment Received:* ₹${fee}\n*Date:* ${format(new Date(), "dd MMM yyyy")}\n\n📄 *View & Download your Official E-Receipt here:*\n${window.location.origin}/receipt/${appt.id}\n\n📅 *Need a Follow-up?*\nBook your next visit online instantly:\n${window.location.origin}/book/${clinic.slug}\n\nWishing you a speedy recovery! 🌿`;
                      const formattedPhone = formatWhatsAppPhone(appt.patientPhone);
                      const url = formattedPhone 
                        ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
                        : `https://wa.me/?text=${encodeURIComponent(text)}`;
                      window.open(url, "_blank");
                  }}
                  className="w-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white min-h-[36px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  title="Share Receipt via WhatsApp"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Share Receipt
                </button>
             )}
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 text-center text-xs font-medium text-slate-400 capitalize py-2">
                {appt.status.replace("_", " ")}
              </div>
              <button
                onClick={() => handleStatusChange(appt.id, "checked_in")}
                disabled={isPending}
                className="px-3 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 min-h-[36px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                title="Undo & Move to Waiting"
              >
                <Undo2 className="w-3.5 h-3.5" /> Undo
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Column = ({ title, count, items, icon: Icon, colorClass, clinic, isPending, handleStatusChange, router, now, delayMinutes, followUpMap }: any) => (
  <div className="flex-1 min-w-[300px] flex flex-col gap-3 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
    <div className="flex items-center justify-between mb-2 px-1">
      <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
        <Icon className={cn("w-4 h-4", colorClass)} /> {title}
      </h2>
      <span className="bg-white text-slate-500 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm border border-slate-100">
        {count}
      </span>
    </div>
    <div className="flex flex-col gap-3 flex-1">
      <AnimatePresence mode="popLayout">
        {items.map((appt: Appointment) => (
          <QueueCard 
            key={appt.id} 
            appt={appt} 
            clinic={clinic} 
            isPending={isPending} 
            handleStatusChange={handleStatusChange} 
            router={router} 
            now={now}
            delayMinutes={delayMinutes}
            followUpInfo={followUpMap?.[appt.id]}
          />
        ))}
        {items.length === 0 && (
           <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm py-12 px-4 text-center border-2 border-dashed border-slate-200/60 rounded-2xl bg-white/50"
           >
             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-slate-100">
               <Icon className="w-5 h-5 text-slate-300" />
             </div>
             <p className="font-medium text-slate-500">No patients here</p>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
);

export function QueueClient({ initialAppointments, clinic, today, followUpMap = {} }: QueueClientProps) {
  const router = useRouter();
  type Tab = "Scheduled" | "Waiting" | "In Consult" | "Done";
  const [activeTab, setActiveTab] = useState<Tab>("Waiting");
  
  // Normalize initial data cleanly
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    (initialAppointments || []).map(normalizeAppointment)
  );

  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(new Date());

  // Complete Appointment Modal State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [receiptState, setReceiptState] = useState<"input" | "success">("input");
  const [completingAppt, setCompletingAppt] = useState<Appointment | null>(null);
  // P0: fee defaults from followUpMap (free = 0, paid = clinic fee, normal = clinic fee)
  const [feeCollected, setFeeCollected] = useState<number>(clinic.consultationFee || 0);

  const [searchQuery, setSearchQuery] = useState("");

  // Sync prop updates if server revalidates
  useEffect(() => {
    if (initialAppointments) {
      setAppointments((initialAppointments || []).map(normalizeAppointment));
    }
  }, [initialAppointments]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Window focus auto-resync (resilient against silent socket disconnects)
  useEffect(() => {
    const handleFocus = () => {
      router.refresh();
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    });
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  // Supabase Realtime for instant updates across devices
  useEffect(() => {
    const supabase = createClient();
    let isReconnecting = false;

    const channel = supabase
      .channel(`queue-dashboard-${clinic.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `clinic_id=eq.${clinic.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = normalizeAppointment(payload.new);
            setAppointments((prev) => {
              if (updated.appointmentDate !== today) {
                return prev.filter((a) => a.id !== updated.id);
              }
              const exists = prev.some((a) => a.id === updated.id);
              if (!exists) return [...prev, updated];
              return prev.map((a) => (a.id === updated.id ? updated : a));
            });
          } else if (payload.eventType === "INSERT") {
            const newAppt = normalizeAppointment(payload.new);
            if (newAppt.appointmentDate === today) {
              setAppointments((prev) => {
                if (prev.some((a) => a.id === newAppt.id)) return prev;
                return [...prev, newAppt];
              });
            }
          } else if (payload.eventType === "DELETE") {
            if (payload.old?.id) {
              setAppointments((prev) => prev.filter((a) => a.id !== payload.old.id));
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && isReconnecting) {
          isReconnecting = false;
          router.refresh(); // Reconcile missed events after network drop
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          isReconnecting = true;
          router.refresh();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinic.id, today, router]);

  const handleStatusChange = useCallback(
    async (appointmentId: string, newStatus: string, fee?: number): Promise<boolean> => {
      if (newStatus === "completed_prompt") {
        const apptToComplete = appointments.find((a) => a.id === appointmentId);
        if (apptToComplete) {
          setCompletingAppt(apptToComplete);
          // P0: Auto-fill fee from followUpMap (free follow-ups default to ₹0)
          const fuInfo = followUpMap[appointmentId];
          let defaultFee: number;
          if (fuInfo) {
            // It's a follow-up visit
            defaultFee = fuInfo.isFree
              ? (fuInfo.feeOverride !== null && fuInfo.feeOverride !== undefined ? fuInfo.feeOverride : 0)
              : (apptToComplete.feeCollected ?? clinic.consultationFee ?? 0);
          } else {
            // Normal appointment or old follow-up without map
            defaultFee = apptToComplete.feeCollected ?? clinic.consultationFee ?? 0;
          }
          setFeeCollected(defaultFee);
          setReceiptState("input");
          setCompleteModalOpen(true);
        }
        return false;
      }

      const previousAppointments = [...appointments];

      // Optimistic update
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? normalizeAppointment({ ...a, status: newStatus, feeCollected: fee ?? a.feeCollected })
            : a
        )
      );

      return new Promise<boolean>((resolve) => {
        startTransition(async () => {
          try {
            const res = await updateAppointmentStatus(appointmentId, newStatus, fee);
            if (res?.error) {
              toast.error(res.error);
              setAppointments(previousAppointments); // Revert optimistic update on failure
              resolve(false);
            } else {
              toast.success(`Patient marked as ${newStatus.replace("_", " ")}`);
              resolve(true);
            }
          } catch (err: any) {
            toast.error(err.message || "Failed to update appointment status");
            setAppointments(previousAppointments); // Revert optimistic update on error
            resolve(false);
          }
        });
      });
    },
    [appointments, clinic.consultationFee]
  );

  // Filter & Group appointments with memoization for high-throughput performance
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    const q = searchQuery.toLowerCase().trim();
    return appointments.filter((a) => {
      if (!a) return false;
      const nameMatch = (a.patientName || "").toLowerCase().includes(q);
      const phoneMatch = (a.patientPhone || "").includes(q);
      const tokenMatch = a.tokenNumber !== null && String(a.tokenNumber).includes(q);
      return nameMatch || phoneMatch || tokenMatch;
    });
  }, [appointments, searchQuery]);

  const scheduled = useMemo(
    () =>
      filteredAppointments
        .filter((a) => a && a.status === "confirmed")
        .sort((a, b) => (a.appointmentTime || "").localeCompare(b.appointmentTime || "")),
    [filteredAppointments]
  );

  const checkedIn = useMemo(
    () =>
      filteredAppointments
        .filter((a) => a && a.status === "checked_in")
        .sort((a, b) => {
          const tA = a.tokenNumber ?? 999999;
          const tB = b.tokenNumber ?? 999999;
          if (tA !== tB) return tA - tB;
          return (a.appointmentTime || "").localeCompare(b.appointmentTime || "");
        }),
    [filteredAppointments]
  );

  const inConsultation = useMemo(
    () =>
      filteredAppointments
        .filter((a) => a && a.status === "in_consultation")
        .sort(
          (a, b) =>
            new Date(a.consultationStartTime || 0).getTime() -
            new Date(b.consultationStartTime || 0).getTime()
        ),
    [filteredAppointments]
  );

  const completed = useMemo(
    () =>
      filteredAppointments
        .filter((a) => a && ["completed", "cancelled", "no_show"].includes(a.status))
        .sort((a, b) => {
          const aTime = a.consultationEndTime
            ? new Date(a.consultationEndTime).getTime()
            : new Date(a.createdAt || 0).getTime();
          const bTime = b.consultationEndTime
            ? new Date(b.consultationEndTime).getTime()
            : new Date(b.createdAt || 0).getTime();
          return bTime - aTime;
        }),
    [filteredAppointments]
  );

  const delayMinutes = useMemo(() => getClinicDelay(appointments, now), [appointments, now]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "Scheduled", label: "Scheduled", count: scheduled.length },
    { id: "Waiting", label: "Waiting", count: checkedIn.length },
    { id: "In Consult", label: "In Consult", count: inConsultation.length },
    { id: "Done", label: "Done", count: completed.length },
  ];

  return (
    <div className="space-y-4 relative">
      {/* Live Queue Instant Search Bar */}
      <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter queue by token #, patient name, or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-transparent text-xs sm:text-sm font-medium text-slate-800 focus:outline-none placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>
      {/* Complete Appointment Modal */}
      {completeModalOpen && completingAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            {receiptState === "input" ? (
              <>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Complete Appointment</h3>
                <p className="text-sm text-slate-500 mb-6">Record fee collected for {completingAppt.patientName}</p>
                
                <div className="space-y-4">
                  {/* P0: Show free follow-up context if applicable */}
                  {completingAppt && followUpMap[completingAppt.id]?.isFree && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                      <span className="text-emerald-600 text-lg">🎉</span>
                      <div>
                        <p className="text-xs font-bold text-emerald-800">Free Follow-up Visit</p>
                        <p className="text-[11px] text-emerald-600 mt-0.5">Within clinic's free follow-up window. Fee pre-set to ₹0.</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Amount Collected (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                      <input 
                        type="number" 
                        value={feeCollected} 
                        onChange={(e) => setFeeCollected(Number(e.target.value))}
                        className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setFeeCollected(0)}
                      className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                    >
                      Free Follow-up (₹0)
                    </button>
                    <button 
                      onClick={() => setFeeCollected(clinic.consultationFee || 0)}
                      className="flex-1 py-2 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      Standard Fee
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => {
                        setCompleteModalOpen(false);
                        setCompletingAppt(null);
                      }}
                      className="flex-1 py-3 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        await handleStatusChange(completingAppt.id, "completed", feeCollected);
                        setReceiptState("success");
                      }}
                      className="flex-1 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      Complete & Save
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center animate-in slide-in-from-right-4 duration-300">
                 <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
                   <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mb-1">Receipt Ready</h3>
                 <p className="text-sm text-slate-500 mb-6">Appointment completed successfully.</p>
                 
                 <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-left">
                   <div className="flex justify-between items-center mb-2.5 pb-2.5 border-b border-slate-200/60">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient</span>
                     <span className="font-bold text-slate-900 text-sm">{completingAppt.patientName}</span>
                   </div>
                   <div className="flex justify-between items-center mb-2.5 pb-2.5 border-b border-slate-200/60">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                     <span className="font-bold text-slate-900 text-sm">{format(new Date(), "dd MMM yyyy")}</span>
                   </div>
                   <div className="flex justify-between items-center pt-1">
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee Collected</span>
                     <span className="font-black text-emerald-600 text-xl">₹{feeCollected}</span>
                   </div>
                 </div>

                 <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => {
                        const text = `*INVOICE & VISIT SUMMARY* 🏥\n\nDear ${completingAppt.patientName},\nThank you for visiting *${clinic.name}* (Dr. ${clinic.doctorName}). We hope you had a comfortable experience!\n\n*Payment Received:* ₹${feeCollected}\n*Date:* ${format(new Date(), "dd MMM yyyy")}\n\n📄 *View & Download your Official E-Receipt here:*\n${window.location.origin}/receipt/${completingAppt.id}\n\n📅 *Need a Follow-up?*\nBook your next visit online instantly:\n${window.location.origin}/book/${clinic.slug}\n\nWishing you a speedy recovery! 🌿`;
                        const formattedPhone = formatWhatsAppPhone(completingAppt.patientPhone);
                        const url = formattedPhone
                          ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
                          : `https://wa.me/?text=${encodeURIComponent(text)}`;
                        window.open(url, "_blank");
                        setCompleteModalOpen(false);
                      }}
                      className="w-full py-3.5 bg-[#25D366] text-white font-bold rounded-xl shadow-md shadow-[#25D366]/20 hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                       <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                       Share via WhatsApp
                    </button>
                    <button 
                      onClick={() => {
                        setCompleteModalOpen(false);
                      }}
                      className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-700 transition-colors"
                    >
                       Skip & Close
                    </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Tabs */}
      <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border",
              activeTab === tab.id 
                ? "bg-slate-900 text-white border-slate-900" 
                : "bg-white text-slate-500 border-slate-200"
            )}
          >
            {tab.label} <span className={cn("ml-1.5 px-1.5 py-0.5 rounded-md text-[10px]", activeTab === tab.id ? "bg-white/20" : "bg-slate-100")}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar lg:snap-none">
        <div className={cn("min-w-full lg:min-w-0 lg:flex-1 transition-opacity", activeTab === "Scheduled" ? "block" : "hidden lg:block")}>
          <Column 
            title="Scheduled" 
            count={scheduled.length} 
            items={scheduled} 
            icon={Clock} 
            colorClass="text-slate-400"
            clinic={clinic}
            isPending={isPending}
            handleStatusChange={handleStatusChange}
            router={router}
            now={now}
            delayMinutes={delayMinutes}
            followUpMap={followUpMap}
          />
        </div>
        <div className={cn("min-w-full lg:min-w-0 lg:flex-1 transition-opacity", activeTab === "Waiting" ? "block" : "hidden lg:block")}>
          <Column 
            title="Waiting" 
            count={checkedIn.length} 
            items={checkedIn} 
            icon={User} 
            colorClass="text-indigo-500"
            clinic={clinic}
            isPending={isPending}
            handleStatusChange={handleStatusChange}
            router={router}
            now={now}
            delayMinutes={delayMinutes}
            followUpMap={followUpMap}
          />
        </div>
        <div className={cn("min-w-full lg:min-w-0 lg:flex-1 transition-opacity", activeTab === "In Consult" ? "block" : "hidden lg:block")}>
          <Column 
            title="In Consult" 
            count={inConsultation.length} 
            items={inConsultation} 
            icon={Play} 
            colorClass="text-sky-500"
            clinic={clinic}
            isPending={isPending}
            handleStatusChange={handleStatusChange}
            router={router}
            now={now}
            delayMinutes={delayMinutes}
            followUpMap={followUpMap}
          />
        </div>
        <div className={cn("min-w-full lg:min-w-0 lg:flex-1 transition-opacity", activeTab === "Done" ? "block" : "hidden lg:block")}>
          <Column 
            title="Done" 
            count={completed.length} 
            items={completed} 
            icon={CheckCircle2} 
            colorClass="text-emerald-500"
            clinic={clinic}
            isPending={isPending}
            handleStatusChange={handleStatusChange}
            router={router}
            now={now}
            delayMinutes={delayMinutes}
            followUpMap={followUpMap}
          />
        </div>
      </div>
    </div>
  );
}
