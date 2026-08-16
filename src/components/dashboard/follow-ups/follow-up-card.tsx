"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, MessageSquare, Phone, Sparkles, Send, Calendar, HeartPulse, ShieldAlert, X, MoreVertical, UserMinus } from "lucide-react";
import { updateFollowUpStatusAction } from "@/app/actions/follow-ups";
import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FollowUpCardProps {
  followUp: {
    id: string;
    dueDate: string;
    notes: string | null;
    patient: {
      id: string;
      name: string;
      phone: string;
    };
  };
  clinic: {
    name: string;
    doctorName?: string;
    slug: string;
  };
  variant: "overdue" | "today" | "upcoming";
}

export function FollowUpCard({ followUp, variant, clinic }: FollowUpCardProps) {
  const [isMarking, setIsMarking] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [openMenu, setOpenMenu] = useState(false);

  const handleMarkDone = async () => {
    setIsMarking(true);
    try {
      const result = await updateFollowUpStatusAction(followUp.id, "checked_in");

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Patient checked in for follow-up!");
    } catch (error: any) {
      toast.error(error.message);
      setIsMarking(false);
    }
  };

  const handleStatusChange = async (newStatus: "cancelled" | "missed") => {
    try {
      const result = await updateFollowUpStatusAction(followUp.id, newStatus);
      if (result.error) throw new Error(result.error);
      toast.success(`Follow-up marked as ${newStatus}`);
      setOpenMenu(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in");
  const bookingLink = `${origin}/clinic/${clinic.slug}`;
  const formattedDueDate = format(new Date(followUp.dueDate), "dd MMM yyyy");
  const doctorName = clinic.doctorName || "Doctor";

  // High-converting revenue-multiplier preset messages
  const templates = [
    {
      id: "no_show",
      title: "🚨 No-Show Recovery & Slot Re-booking",
      tag: "Urgent Action",
      message: `*Missed Appointment Alert - ${clinic.name}* 🚨\n\nDear ${followUp.patient.name},\n${doctorName} missed you yesterday! 🩺\n\nSince your token was marked as a No-Show, it has expired. The clinic queue is filling up fast today, but we have temporarily held a priority re-booking slot for you.\n\n👉 *Tap here to instantly secure a new token before the queue closes:*\n${bookingLink}\n\nReply to this message if you need assistance!`,
    },
    {
      id: "routine",
      title: "📅 Scheduled Follow-up & Session Due",
      tag: "Highest Conversion",
      message: `*Follow-up Reminder from ${clinic.name}* 🏥\n\nDear ${followUp.patient.name},\nThis is a gentle reminder for your scheduled follow-up visit with ${doctorName} on *${formattedDueDate}*.\n\nRegular check-ups ensure optimal recovery and long-term health!\n\n👉 *Book your preferred slot online now:*\n${bookingLink}\n\nWishing you good health! 🌿`,
    },
    {
      id: "recovery",
      title: "🩺 Post-Treatment Recovery & Care Check-in",
      tag: "Patient Loyalty",
      message: `*Health Check-in from ${clinic.name}* 🏥\n\nDear ${followUp.patient.name},\n${doctorName} is checking in on your recovery & progress since your last visit. How are you feeling today?\n\nIf you need a follow-up review or consultation, reserve your slot in 1 tap:\n👉 ${bookingLink}\n\nTake care! 🌿`,
    },
    {
      id: "overdue",
      title: "⚠️ Overdue Recall & Slot Priority",
      tag: "Revenue Recall",
      message: `*Priority Care Notice - ${clinic.name}* ⚠️\n\nDear ${followUp.patient.name},\nOur records indicate your follow-up review with ${doctorName} is currently overdue.\n\nTo ensure your health plan stays on track, please pick your preferred slot today:\n👉 ${bookingLink}\n\nHave questions? Reply directly to this message!`,
    },
    {
      id: "preventive",
      title: "🌿 Preventive Care & Routine Review",
      tag: "Wellness Boost",
      message: `*Preventive Wellness Reminder - ${clinic.name}* 🌿\n\nDear ${followUp.patient.name},\nPreventive care is key to long-term health! ${doctorName} recommends completing your periodic check-up.\n\nSelect your convenient time online without waiting:\n👉 ${bookingLink}\n\nSee you soon!`,
    },
  ];

  const sendWhatsAppMessage = (text: string) => {
    const cleanPhone = followUp.patient.phone.replace(/\D/g, "");
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    setIsTemplateDialogOpen(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "overdue":
        return "border-red-200/80 bg-gradient-to-br from-red-50/90 to-white hover:border-red-300 shadow-sm shadow-red-100/30 hover:shadow-lg hover:-translate-y-1";
      case "today":
        return "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white hover:border-amber-300 shadow-sm shadow-amber-100/30 hover:shadow-lg hover:-translate-y-1";
      case "upcoming":
        return "border-sky-200/80 bg-gradient-to-br from-sky-50/90 to-white hover:border-sky-300 shadow-sm shadow-sky-100/30 hover:shadow-lg hover:-translate-y-1";
    }
  };

  const getDaysText = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(followUp.dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.abs(differenceInDays(due, today));

    if (variant === "today") return "Due Today";
    if (variant === "overdue") return `${diff} day${diff !== 1 ? "s" : ""} overdue`;
    return `In ${diff} day${diff !== 1 ? "s" : ""}`;
  };

  return (
    <>
      <Card className={cn("transition-all duration-200 shadow-sm rounded-2xl overflow-hidden", getVariantStyles())}>
        <CardContent className="p-4 sm:p-5 flex flex-col h-full">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className={cn(
                "w-10 h-10 rounded-[0.8rem] flex items-center justify-center flex-shrink-0 shadow-inner border border-white/50",
                variant === "overdue" ? "bg-red-100 text-red-700" :
                variant === "today" ? "bg-amber-100 text-amber-700" :
                "bg-sky-100 text-sky-700"
              )}>
                <span className="font-extrabold text-sm">
                  {followUp.patient.name[0]?.toUpperCase()}
                </span>
              </div>
              
              <Link href={`/dashboard/patients/${followUp.patient.id}`} className="hover:underline group">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-sky-700 transition-colors">{followUp.patient.name}</h3>
                <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5 font-semibold">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {followUp.patient.phone}
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border",
                variant === "overdue" ? "bg-red-100 text-red-800 border-red-200" :
                variant === "today" ? "bg-amber-100 text-amber-800 border-amber-200" :
                "bg-sky-100 text-sky-800 border-sky-200"
              )}>
                {getDaysText()}
              </span>
              <div className="relative">
                <button onClick={() => setOpenMenu(!openMenu)} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {openMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(false)} />
                    <div className="absolute right-0 top-8 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                      <button onClick={() => handleStatusChange("missed")} className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                        <UserMinus className="w-4 h-4" /> No Answer
                      </button>
                      <button onClick={() => handleStatusChange("cancelled")} className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center gap-2">
                        <X className="w-4 h-4" /> Patient Refused
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {followUp.notes && (
            <p className="text-xs text-slate-600 mb-4 bg-white/80 p-2.5 rounded-xl border border-slate-100/80 leading-relaxed flex-grow">
              💬 {followUp.notes}
            </p>
          )}
          {!followUp.notes && <div className="flex-grow mb-4"></div>}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-200/50">
            <button
              onClick={() => setIsTemplateDialogOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Preset
            </button>
            <button
              onClick={handleMarkDone}
              disabled={isMarking}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isMarking ? "Processing..." : "Walk-in Today"}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Preset WhatsApp Message Dialog Modal */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-md w-full bg-white/95 backdrop-blur-xl rounded-3xl p-5 border border-slate-200 shadow-2xl">
          <DialogHeader className="text-left mb-3">
            <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              Select WhatsApp Revenue Message
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Pick a tailored message template for {followUp.patient.name} to maximize callback conversion:
            </DialogDescription>
          </DialogHeader>

          {/* Template Selector Cards */}
          <div className="space-y-2.5 my-2">
            {templates.map((tpl, idx) => {
              const isSelected = selectedTemplateIndex === idx;
              return (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateIndex(idx)}
                  className={cn(
                    "w-full text-left p-3 rounded-2xl border transition-all text-xs flex flex-col gap-1",
                    isSelected
                      ? "bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500/50 shadow-sm"
                      : "bg-slate-50/80 border-slate-200/80 hover:bg-slate-100"
                  )}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{tpl.title}</span>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {tpl.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 italic">
                    &quot;{tpl.message.slice(0, 100)}...&quot;
                  </p>
                </button>
              );
            })}
          </div>

          {/* Message Preview */}
          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-2xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto border border-slate-800 shadow-inner">
            {templates[selectedTemplateIndex]?.message}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 mt-2">
            <button
              onClick={() => setIsTemplateDialogOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => sendWhatsAppMessage(templates[selectedTemplateIndex].message)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Send via WhatsApp
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
