"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDoctorName } from "@/lib/utils";
import type { Clinic, Appointment } from "@/db/schema";
import { Volume2, VolumeX, Maximize2, Minimize2, Tv, Users, Activity, CheckCircle2 } from "lucide-react";
import { soundEngine } from "@/lib/sound";

interface TVQueueDisplayProps {
  clinic: Clinic;
  initialAppts: Appointment[];
}

export function TVQueueDisplay({ clinic, initialAppts }: TVQueueDisplayProps) {
  const [appts, setAppts] = useState<Appointment[]>(initialAppts);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const prevServingIdRef = useRef<string | null>(null);

  // Live Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Realtime Supabase Subscription
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`tv_queue_${clinic.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `clinic_id=eq.${clinic.id}`,
        },
        async () => {
          // Refetch today's queue
          try {
            const res = await fetch(`/api/clinic/${clinic.slug}/tv-queue`);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data.appointments)) {
                setAppts(data.appointments);
              }
            }
          } catch (err) {
            console.error("Failed to refresh TV queue:", err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinic.id, clinic.slug]);

  // Derive Serving & Waiting
  const nowServing = appts.find(
    (a) => a.status === "in_consultation" || a.status === "checked_in"
  );
  
  const upcomingQueue = appts.filter(
    (a) =>
      a.id !== nowServing?.id &&
      (a.status === "confirmed" || a.status === "checked_in")
  );

  const completedTodayCount = appts.filter((a) => a.status === "completed").length;

  // Audio Announcement when Now Serving Token changes
  useEffect(() => {
    if (!nowServing) return;
    if (prevServingIdRef.current && prevServingIdRef.current !== nowServing.id) {
      // Trigger chime
      if (!isMuted) {
        soundEngine.playChime();
        // Web Speech Announcement
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          try {
            window.speechSynthesis.cancel();
            const tokenNum = nowServing.tokenNumber || "Next";
            const text = `Token number ${tokenNum}, please proceed to doctor's consultation room.`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
          } catch (e) {
            console.warn("TTS Error:", e);
          }
        }
      }
    }
    prevServingIdRef.current = nowServing.id;
  }, [nowServing?.id, nowServing?.tokenNumber, isMuted]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const themeColor = clinic.themeColor || "#0ea5e9";

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white font-sans flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-20 sm:h-24 px-8 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          {clinic.logoUrl ? (
            <img
              src={clinic.logoUrl}
              alt={clinic.name}
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-contain bg-white p-1"
            />
          ) : (
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center font-black text-2xl text-white shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              {clinic.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {clinic.name}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-slate-400">
              {formatDoctorName(clinic.doctorName)} • {clinic.specialty}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-2xl sm:text-4xl font-mono font-black text-emerald-400 tracking-wider">
              {currentTime}
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-400">Live Waiting Room Queue</p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title={isMuted ? "Unmute Voice Announcements" : "Mute Voice Announcements"}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Waiting Room Content */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: BIG NOW SERVING HERO CARD */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-emerald-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black px-6 py-2 rounded-bl-2xl text-sm sm:text-base tracking-widest uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
              NOW SERVING
            </div>

            <p className="text-sm sm:text-lg font-bold text-emerald-400 tracking-wider uppercase mb-2">
              Please enter consultation room
            </p>

            {nowServing ? (
              <div className="flex flex-col gap-4">
                <div className="text-7xl sm:text-9xl font-black font-mono tracking-tighter text-white">
                  #{nowServing.tokenNumber || "1"}
                </div>
                <div>
                  <h2 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight line-clamp-1">
                    {nowServing.patientName}
                  </h2>
                  <p className="text-lg sm:text-xl text-slate-400 font-medium mt-1">
                    Status: <span className="text-emerald-400 font-bold capitalize">{nowServing.status.replace("_", " ")}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-4xl font-extrabold text-slate-500">NO PATIENT IN ROOM</p>
                <p className="text-lg text-slate-400 mt-2">Doctor is ready for next appointment</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: UPCOMING QUEUE TOKENS */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xl sm:text-2xl font-black text-slate-200 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-sky-400" />
              UP NEXT IN QUEUE
            </h3>
            <span className="text-sm font-bold bg-sky-500/20 text-sky-400 px-3 py-1 rounded-full">
              {upcomingQueue.length} Waiting
            </span>
          </div>

          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
            {upcomingQueue.length > 0 ? (
              upcomingQueue.slice(0, 5).map((appt, idx) => (
                <div
                  key={appt.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between transition-all hover:border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-2xl text-sky-400">
                      #{appt.tokenNumber || idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-lg text-slate-200 line-clamp-1">{appt.patientName}</p>
                      <p className="text-xs text-slate-400">Confirmed • Queue Spot #{idx + 1}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-800 px-3 py-1 rounded-lg">
                    Waiting
                  </span>
                </div>
              ))
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-500">
                <p className="font-semibold text-base">No upcoming patients in queue</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Completed Consultations Today</span>
            </div>
            <span className="font-bold font-mono text-base text-white">{completedTodayCount}</span>
          </div>
        </div>
      </main>

      {/* Ticker Footer */}
      <footer className="h-14 px-8 bg-slate-900/90 border-t border-slate-800/80 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Live Clinic Waiting Display • Powering {clinic.name}</span>
        </div>
        <div>
          <span>Scan Clinic QR Code on your receipt to track your queue status on mobile</span>
        </div>
      </footer>
    </div>
  );
}
