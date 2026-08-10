"use client";

import { useState, useTransition } from "react";
import {
  X,
  CheckCircle2,
  Pencil,
  Clock,
  Send,
  RotateCcw,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Copy, Check, Sparkles, ShieldCheck, Zap } from "lucide-react";
import type { DoctorLead } from "@/db/schema";
import { getCategoryLabel, LEAD_CATEGORIES, buildMessageForStep } from "./message-builder";
import { markMessageSent } from "./actions";
import { DecisionGuideModal } from "./decision-guide-modal";
import { format } from "date-fns";

// ─── Step metadata ────────────────────────────────────────────────────────────
const STEP_META: Record<number, { label: string; subtitle: string; timing: string; timingColor: string }> = {
  1: { label: "Opening Strike", subtitle: "First contact — Hook + Demo + PDF", timing: "Day 1", timingColor: "text-blue-600 bg-blue-50 border-blue-200" },
  2: { label: "Proof & Nudge", subtitle: "Social proof + Micro-commitment ask", timing: "Day 4", timingColor: "text-amber-600 bg-amber-50 border-amber-200" },
  3: { label: "Clean Exit", subtitle: "Final — No pressure, demo video + prospectus link", timing: "Day 8", timingColor: "text-red-600 bg-red-50 border-red-200" },
};

const CATEGORY_META: Record<string, { bg: string; border: string; tag: string }> = {
  A: { bg: "bg-slate-50", border: "border-slate-300", tag: "bg-slate-100 text-slate-700" },
  B: { bg: "bg-teal-50", border: "border-teal-300", tag: "bg-teal-100 text-teal-700" },
  C: { bg: "bg-purple-50", border: "border-purple-300", tag: "bg-purple-100 text-purple-700" },
};

// ─── Individual Step Timeline Card ─────────────────────────────────────────────
interface MessageCardProps {
  lead: DoctorLead;
  category: string;
  step: number;
  activeSentStep: number;
  onStepSent: (step: number) => void;
}

function MessageCard({ lead, category, step, activeSentStep, onStepSent }: MessageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMsg, setEditedMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const isSent = activeSentStep >= step;
  const isRecommended = step === activeSentStep + 1;
  const isLocked = step > activeSentStep + 1;
  
  const stepMeta = STEP_META[step];
  // buildMessageForStep now includes personalized demo URL in all messages
  const originalMessage = buildMessageForStep(lead, category, step);
  const displayMessage = isEditing ? editedMsg : originalMessage;

  const phone = lead.phone.replace(/\D/g, "");
  const phoneWithCountry = phone.startsWith("91") ? phone : `91${phone}`;

  const handleSend = () => {
    const finalMsg = isEditing ? editedMsg : originalMessage;
    const url = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(finalMsg)}`;
    window.open(url, "_blank");
    
    startTransition(async () => {
      const newStep = Math.max(step, activeSentStep);
      await markMessageSent(lead.id, newStep);
      toast.success(`Step ${step} sent & recorded ✓`);
      onStepSent(newStep);
      setIsEditing(false);
    });
  };

  const handleMarkSent = () => {
    startTransition(async () => {
      const newStep = Math.max(step, activeSentStep);
      await markMessageSent(lead.id, newStep);
      toast.success(`Step ${step} marked as sent`);
      onStepSent(newStep);
    });
  };

  const handleEditToggle = () => {
    if (!isEditing) setEditedMsg(originalMessage);
    setIsEditing(!isEditing);
  };

  return (
    <div className="relative pl-10 pb-10 last:pb-0">
      {/* Timeline Line */}
      {step !== 3 && (
        <div className={`absolute left-4 top-10 bottom-0 w-[2px] -ml-[1px] rounded-full ${isSent ? "bg-emerald-400" : "bg-slate-200"}`} />
      )}

      {/* Timeline Dot */}
      <div className={`absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white shadow-sm z-10 transition-colors ${
        isSent ? "bg-emerald-500 text-white" : 
        isRecommended ? "bg-green-600 text-white ring-green-50 shadow-md scale-110" : 
        "bg-slate-100 text-slate-400"
      }`}>
        {isSent ? "✓" : step}
      </div>

      {/* Card */}
      <div className={`rounded-2xl border transition-all duration-300 ${
        isLocked ? "opacity-50 grayscale-[0.3] pointer-events-none border-slate-100 bg-slate-50/50" :
        isRecommended ? "border-green-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white ring-1 ring-green-100/50" :
        "border-slate-200 bg-white shadow-sm hover:shadow-md"
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`text-sm font-extrabold tracking-tight ${isLocked ? "text-slate-500" : "text-slate-800"}`}>
                {stepMeta.label}
              </span>
              {isRecommended && (
                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200 uppercase tracking-wider shadow-sm">
                  Send Next
                </span>
              )}
              {isSent && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Sent
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500">{stepMeta.subtitle}</p>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5 shadow-sm ${stepMeta.timingColor}`}>
            <Clock className="w-3.5 h-3.5" />
            {stepMeta.timing}
          </span>
        </div>

        {/* Message Content (Only show if not locked) */}
        {!isLocked && (
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" /> Message Preview
              </span>
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-600 transition-colors font-semibold bg-slate-50 hover:bg-teal-50 px-2.5 py-1 rounded-md"
              >
                {isEditing ? <RotateCcw className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                {isEditing ? "Reset to Default" : "Edit Message"}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={editedMsg}
                onChange={(e) => setEditedMsg(e.target.value)}
                rows={10}
                className="w-full text-[13px] p-4 rounded-xl border-2 border-teal-100 bg-white focus:outline-none focus:ring-0 focus:border-teal-400 resize-none leading-relaxed text-slate-700 shadow-inner transition-colors"
              />
            ) : (
              <div className="relative">
                {/* Visual WhatsApp Bubble */}
                <div className="bg-[#E7FDE1] rounded-2xl rounded-tl-sm px-4 py-3.5 text-[14px] text-[#111B21] leading-[1.4] whitespace-pre-wrap font-sans shadow-[0_1px_0.5px_rgba(0,0,0,0.13)]">
                  {displayMessage}
                  {/* WhatsApp Time indicator mockup */}
                  <div className="text-[10px] text-slate-500 text-right mt-1 opacity-70">
                    {format(new Date(), "HH:mm")}
                  </div>
                </div>
                {/* Visual WhatsApp Tail */}
                <svg viewBox="0 0 8 13" width="8" height="13" className="absolute -left-2 top-0 text-[#E7FDE1]">
                  <path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                  <path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z" />
                </svg>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2.5 pt-3 border-t border-slate-100">
              <Button
                onClick={handleSend}
                disabled={isPending}
                className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] text-white h-11 text-sm gap-2 font-bold rounded-xl shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:-translate-y-0.5 transition-all"
              >
                <Send className="w-4 h-4" />
                {isSent ? "Resend via WhatsApp" : "Send via WhatsApp"}
              </Button>
              {!isSent && (
                <Button
                  onClick={handleMarkSent}
                  disabled={isPending}
                  variant="outline"
                  className="h-11 px-4 text-xs font-semibold text-slate-700 gap-2 flex-shrink-0 rounded-xl hover:bg-slate-100 border-slate-200 transition-colors"
                  title="Mark as sent without opening WhatsApp"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  Mark Sent
                </Button>
              )}
              <Button
                onClick={() => {
                  const finalMsg = isEditing ? editedMsg : originalMessage;
                  navigator.clipboard.writeText(finalMsg);
                  toast.success("Message copied to clipboard!");
                }}
                variant="outline"
                className="h-11 w-11 p-0 flex items-center justify-center text-slate-600 flex-shrink-0 rounded-xl hover:bg-slate-100 border-slate-200 transition-colors"
                title="Copy message to clipboard"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Drawer ──────────────────────────────────────────────────────────────
interface WhatsAppMessageDrawerProps {
  lead: DoctorLead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStepSent?: () => void;
}

export function WhatsAppMessageDrawer({ lead, open, onOpenChange, onStepSent }: WhatsAppMessageDrawerProps) {
  const [guideOpen, setGuideOpen] = useState(false);
  // Track step progress locally for instant UI feedback while action revalidates server
  const [localStep, setLocalStep] = useState<number>(lead?.messageSentStep ?? 0);

  if (!open || !lead) return null;

  const category = lead.leadCategory || "A";
  const catInfo = LEAD_CATEGORIES.find((c) => c.value === category);
  const catMeta = CATEGORY_META[category] || CATEGORY_META.A;

  return (
    <>

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" 
        onClick={() => onOpenChange(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-50 shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                Dispatch to Dr. {lead.doctorName.split(' ').pop()}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs text-slate-500 font-medium truncate">
                  {lead.phone}
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${catMeta.tag} truncate`}>
                  Category {category}: {catInfo?.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setGuideOpen(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs h-8 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Strategy Guide
            </Button>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Timeline */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-xl mx-auto">
            {/* Context Notice */}
            <div className={`mb-8 p-4 rounded-xl border flex gap-3 items-start ${catMeta.bg} ${catMeta.border}`}>
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <span className="text-xs font-bold">ℹ</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Executing {getCategoryLabel(category)} Playbook
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  This lead is marked as Category {category}. Send these 3 messages in sequence. 
                  Each message includes a personalised live demo link for {lead.clinicName || "this clinic"}.
                </p>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="py-2">
              {[1, 2, 3].map((step) => (
                <MessageCard
                  key={step}
                  lead={lead}
                  category={category}
                  step={step}
                  activeSentStep={localStep}
                  onStepSent={(newStep) => {
                    setLocalStep(newStep);
                    onStepSent?.();
                  }}
                />
              ))}
            </div>

            {/* Founder Sales Cheat Sheet (Objection Handling Card) */}
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-[#0B132B] text-white shadow-xl border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Founder Closing Playbook — Quick Objection Handles
                </h4>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="font-semibold text-amber-300">Doctor asks: "What's the catch / pricing?"</span>
                  <p className="text-slate-300 mt-1">
                    ⚡ Reply: *"No catch! 0% commission forever. Your custom booking site & mobile app are 100% free with a 14-day full trial."*
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="font-semibold text-amber-300">Doctor asks: "I don't have time to type."</span>
                  <p className="text-slate-300 mt-1">
                    ⚡ Reply: *"You write as usual on your paper Rx pad. Doctor Diary delivers the digital WhatsApp copy automatically."*
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="font-semibold text-amber-300">Doctor asks: "My staff can't handle complex software."</span>
                  <p className="text-slate-300 mt-1">
                    ⚡ Reply: *"Zero staff training needed. It takes 2 minutes to onboard, and our concierge team handles all patient data setup."*
                  </p>
                </div>
              </div>
            </div>
            
            {localStep >= 3 && (
              <div className="mt-8 text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 mb-1">Sequence Complete</h3>
                <p className="text-xs text-slate-600">All 3 steps have been sent to this doctor.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {guideOpen && <DecisionGuideModal onClose={() => setGuideOpen(false)} open={guideOpen} onOpenChange={setGuideOpen} />}
    </>
  );
}
