"use client";

import { useState, useTransition, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { updateAppointmentStatus } from "@/app/dashboard/actions";
import { toast } from "sonner";
import { Clock, CheckCircle2, User, Play, Search, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Appointment, Clinic } from "@/db/schema";
import { cn } from "@/lib/utils";
import { getClinicDelay } from "@/lib/queue-logic";
import { normalizeAppointment } from "@/lib/appointment-utils";
import { QueueColumn } from "@/components/queue/queue-column";
import { CompleteAppointmentModal } from "@/components/queue/complete-appointment-modal";
import { SmartQueueConductor } from "@/components/queue/smart-queue-conductor";
import { FadeInUp } from "@/components/dashboard/dashboard-animations";

interface QueueClientProps {
  initialAppointments: Appointment[];
  clinic: Clinic;
  today: string;
  followUpMap?: Record<string, { isFree: boolean; feeOverride: number | null }>;
}

export function QueueClient({ initialAppointments, clinic, today, followUpMap = {} }: QueueClientProps) {
  const router = useRouter();
  type Tab = "Scheduled" | "Waiting" | "In Consult" | "Done";
  const [activeTab, setActiveTab] = useState<Tab>("Waiting");
  
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    (initialAppointments || []).map(normalizeAppointment)
  );

  const [isPending, startTransition] = useTransition();
  const [now, setNow] = useState(new Date());

  // Modal State
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [receiptState, setReceiptState] = useState<"input" | "success">("input");
  const [completingAppt, setCompletingAppt] = useState<Appointment | null>(null);
  const [feeCollected, setFeeCollected] = useState<number>(clinic.consultationFee || 0);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (initialAppointments) {
      setAppointments((initialAppointments || []).map(normalizeAppointment));
    }
  }, [initialAppointments]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleFocus = () => router.refresh();
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") router.refresh();
    });
    return () => window.removeEventListener("focus", handleFocus);
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    let isReconnecting = false;
    const channel = supabase
      .channel(`queue-dashboard-${clinic.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter: `clinic_id=eq.${clinic.id}` }, (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = normalizeAppointment(payload.new);
            setAppointments((prev) => {
              if (updated.appointmentDate !== today) return prev.filter((a) => a.id !== updated.id);
              return prev.some((a) => a.id === updated.id) ? prev.map((a) => (a.id === updated.id ? updated : a)) : [...prev, updated];
            });
          } else if (payload.eventType === "INSERT") {
            const newAppt = normalizeAppointment(payload.new);
            if (newAppt.appointmentDate === today) {
              setAppointments((prev) => prev.some((a) => a.id === newAppt.id) ? prev : [...prev, newAppt]);
            }
          } else if (payload.eventType === "DELETE") {
            if (payload.old?.id) setAppointments((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && isReconnecting) {
          isReconnecting = false;
          router.refresh(); 
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          isReconnecting = true;
          router.refresh();
        }
      });
    return () => { supabase.removeChannel(channel); };
  }, [clinic.id, today, router]);

  const handleStatusChange = useCallback(
    async (appointmentId: string, newStatus: string, fee?: number): Promise<boolean> => {
      if (newStatus === "completed_prompt") {
        const apptToComplete = appointments.find((a) => a.id === appointmentId);
        if (apptToComplete) {
          setCompletingAppt(apptToComplete);
          const fuInfo = followUpMap[appointmentId];
          const defaultFee = fuInfo 
            ? (fuInfo.isFree ? (fuInfo.feeOverride ?? 0) : (apptToComplete.feeCollected ?? clinic.consultationFee ?? 0))
            : (apptToComplete.feeCollected ?? clinic.consultationFee ?? 0);
          setFeeCollected(defaultFee);
          setReceiptState("input");
          setCompleteModalOpen(true);
        }
        return false;
      }

      const previousAppointments = [...appointments];
      setAppointments((prev) => prev.map((a) => a.id === appointmentId ? normalizeAppointment({ ...a, status: newStatus, feeCollected: fee ?? a.feeCollected }) : a));

      return new Promise<boolean>((resolve) => {
        startTransition(async () => {
          try {
            const res = await updateAppointmentStatus(appointmentId, newStatus, fee);
            if (res?.error) {
              toast.error(res.error);
              setAppointments(previousAppointments); 
              resolve(false);
            } else {
              toast.success(`Patient marked as ${newStatus.replace("_", " ")}`);
              resolve(true);
            }
          } catch (err: any) {
            toast.error(err.message || "Failed to update appointment status");
            setAppointments(previousAppointments); 
            resolve(false);
          }
        });
      });
    },
    [appointments, clinic.consultationFee, followUpMap]
  );

  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    const q = searchQuery.toLowerCase().trim();
    return appointments.filter((a) => {
      if (!a) return false;
      return (a.patientName || "").toLowerCase().includes(q) || (a.patientPhone || "").includes(q) || (a.tokenNumber !== null && String(a.tokenNumber).includes(q));
    });
  }, [appointments, searchQuery]);

  const scheduled = useMemo(() => filteredAppointments.filter((a) => a && a.status === "confirmed").sort((a, b) => (a.appointmentTime || "").localeCompare(b.appointmentTime || "")), [filteredAppointments]);
  const checkedIn = useMemo(() => filteredAppointments.filter((a) => a && a.status === "checked_in").sort((a, b) => {
    const tA = a.tokenNumber ?? 999999;
    const tB = b.tokenNumber ?? 999999;
    if (tA !== tB) return tA - tB;
    return (a.appointmentTime || "").localeCompare(b.appointmentTime || "");
  }), [filteredAppointments]);
  const inConsultation = useMemo(() => filteredAppointments.filter((a) => a && a.status === "in_consultation").sort((a, b) => new Date(a.consultationStartTime || 0).getTime() - new Date(b.consultationStartTime || 0).getTime()), [filteredAppointments]);
  const completed = useMemo(() => filteredAppointments.filter((a) => a && ["completed", "cancelled", "no_show"].includes(a.status)).sort((a, b) => {
    const aTime = a.consultationEndTime ? new Date(a.consultationEndTime).getTime() : new Date(a.createdAt || 0).getTime();
    const bTime = b.consultationEndTime ? new Date(b.consultationEndTime).getTime() : new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  }), [filteredAppointments]);

  const delayMinutes = useMemo(() => getClinicDelay(appointments, now), [appointments, now]);

  const totalToday = appointments.length;
  const completedToday = completed.length;
  const progressPercent = totalToday === 0 ? 0 : Math.round((completedToday / totalToday) * 100);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "Scheduled", label: "Scheduled", count: scheduled.length },
    { id: "Waiting", label: "Waiting", count: checkedIn.length },
    { id: "In Consult", label: "In Consult", count: inConsultation.length },
    { id: "Done", label: "Done", count: completed.length },
  ];

  return (
    <div className="space-y-4 relative">
      {/* Workload Progress Bar */}
      {totalToday > 0 && (
        <FadeInUp>
          <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 p-1.5 rounded-lg">
                <Activity className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Daily Progress
              </span>
            </div>
            <div className="flex-1 max-w-md flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                {completedToday} of {totalToday} ({progressPercent}%)
              </span>
            </div>
          </div>
        </FadeInUp>
      )}

      {/* Smart Conductor */}
      <SmartQueueConductor delayMinutes={delayMinutes} doctorName={clinic.doctorName || "Doctor"} />

      {/* Live Queue Instant Search Bar */}
      <div className="bg-white/80 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Instant live search by token #, patient name, or 3-digit phone..."
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

      <CompleteAppointmentModal
        completeModalOpen={completeModalOpen}
        setCompleteModalOpen={setCompleteModalOpen}
        receiptState={receiptState}
        setReceiptState={setReceiptState}
        completingAppt={completingAppt}
        setCompletingAppt={setCompletingAppt}
        feeCollected={feeCollected}
        setFeeCollected={setFeeCollected}
        clinic={clinic}
        followUpMap={followUpMap}
        handleStatusChange={handleStatusChange}
      />

      {/* Mobile Tabs */}
      <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {tabs.map((tab) => (
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
            {tab.label}
            <span
              className={cn(
                "ml-1.5 px-1.5 py-0.5 rounded-md text-[10px]",
                activeTab === tab.id ? "bg-white/20" : "bg-slate-100"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar lg:snap-none">
        <div className={cn("min-w-full lg:min-w-0 lg:flex-1 transition-opacity", activeTab === "Scheduled" ? "block" : "hidden lg:block")}>
          <QueueColumn
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
            emptyStateMessage="No upcoming appointments today. Ensure your booking link is shared."
          />
        </div>
        <div className={cn("min-w-full lg:min-w-0 lg:flex-1 transition-opacity", activeTab === "Waiting" ? "block" : "hidden lg:block")}>
          <QueueColumn
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
            emptyStateMessage="Lobby is clear. Great time to catch up on notes!"
          />
        </div>
        <div className={cn("min-w-full lg:min-w-0 lg:flex-1 transition-opacity", activeTab === "In Consult" ? "block" : "hidden lg:block")}>
          <QueueColumn
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
            emptyStateMessage="Ready for the next patient. Hit 'Start Consult' when they walk in."
          />
        </div>
        <div className={cn("min-w-full lg:min-w-0 lg:flex-1 transition-opacity", activeTab === "Done" ? "block" : "hidden lg:block")}>
          <QueueColumn
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
            emptyStateMessage="Let's get started! Complete your first appointment to see it here."
          />
        </div>
      </div>
    </div>
  );
}
