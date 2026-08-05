"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// ─── VAPID Key (injected at build time via NEXT_PUBLIC_VAPID_KEY) ─────────────
const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || "";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

interface PushOptInProps {
  appointmentId: string;
  clinicId?: string;
  /** "card" = full card (for success ticket), "badge" = compact pill (for tracking page) */
  variant?: "card" | "badge";
}

export function PushOptIn({ appointmentId, clinicId, variant = "badge" }: PushOptInProps) {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null); // null = checking
  const [isSupported, setIsSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    // 1. Check browser capability
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !PUBLIC_VAPID_KEY
    ) {
      setIsSupported(false);
      return;
    }

    // 2. Check if permission already denied — no point showing button
    if (Notification.permission === "denied") {
      setIsSupported(false);
      return;
    }

    // 3. Check if THIS appointment already has an active DB subscription
    // by checking the push manager for an existing subscription and verifying
    // it matches what we have stored for this appointment
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then(async (existingSub) => {
        if (!existingSub) {
          setIsSubscribed(false);
          return;
        }

        // Verify the subscription is saved for THIS appointment in our DB
        try {
          const res = await fetch(
            `/api/push/check?endpoint=${encodeURIComponent(existingSub.endpoint)}&appointmentId=${appointmentId}`
          );
          if (res.ok) {
            const { subscribed } = await res.json();
            setIsSubscribed(subscribed);
          } else {
            setIsSubscribed(false);
          }
        } catch {
          // If check fails, fall back to showing the button
          setIsSubscribed(false);
        }
      })
      .catch(() => setIsSubscribed(false));
  }, [appointmentId]);

  const handleSubscribe = async () => {
    if (!isSupported || !PUBLIC_VAPID_KEY) return;
    setLoading(true);

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Permission denied. Enable notifications in your browser settings.");
        setLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          appointmentId,
          clinicId,
          userType: "patient",
        }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        toast.success("🔔 Turn alerts enabled! You'll be notified when it's your turn.");
      } else {
        toast.error("Failed to enable notifications. Please try again.");
      }
    } catch (e: any) {
      console.error("Push opt-in error:", e);
      toast.error(e.message || "Could not enable notifications.");
    } finally {
      setLoading(false);
    }
  };

  // Don't render on unsupported browsers or while initial check is running
  if (!isSupported) return null;
  if (isSubscribed === null) return null; // Still checking — avoid flash

  // ── Subscribed State ─────────────────────────────────────────────────────────
  if (isSubscribed) {
    if (variant === "card") {
      return (
        <div className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-xs font-black text-emerald-900">Live Turn Alerts Active</p>
            <p className="text-[10.5px] text-emerald-700 font-medium">You'll get an OS notification when it's your turn.</p>
          </div>
          <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-bold">
        <Check className="w-3.5 h-3.5 text-emerald-600" /> Turn Alerts On
      </div>
    );
  }

  // ── Opt-In Button ─────────────────────────────────────────────────────────────
  if (variant === "card") {
    return (
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 hover:border-amber-300 hover:shadow-md transition-all group active:scale-[0.98] disabled:opacity-60 text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
          {loading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Bell className="w-4 h-4 text-white" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-slate-900">
            {loading ? "Enabling Alerts…" : "Enable Turn Alerts 🔔"}
          </p>
          <p className="text-[10.5px] text-slate-500 font-medium">
            Get an OS notification the moment it's your turn — free, instant.
          </p>
        </div>
        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <span className="text-amber-600 text-[10px] font-black">→</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bell className="w-3.5 h-3.5" />}
      <span>{loading ? "Enabling…" : "Turn Alerts"}</span>
    </button>
  );
}
