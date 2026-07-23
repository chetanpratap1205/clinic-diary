"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, MessageSquare, Phone } from "lucide-react";
import { updateFollowUpStatusAction } from "@/app/actions/follow-ups";
import { Card, CardContent } from "@/components/ui/card";
import { differenceInDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
    slug: string;
  };
  variant: "overdue" | "today" | "upcoming";
}

export function FollowUpCard({ followUp, variant, clinic }: FollowUpCardProps) {
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkDone = async () => {
    setIsMarking(true);
    try {
      const result = await updateFollowUpStatusAction(followUp.id, "checked_in");

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Patient checked in successfully");
    } catch (error: any) {
      toast.error(error.message);
      setIsMarking(false);
    }
  };

  const handleWhatsApp = () => {
    const bookingLink = `${process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in"}/book/${clinic.slug}`;
    const text = `Hi ${followUp.patient.name}, this is a reminder from ${clinic.name}. Your follow-up visit was scheduled around ${format(new Date(followUp.dueDate), "MMM d, yyyy")}. Please book your slot at your convenience using our online portal: ${bookingLink}`;
    const url = `https://wa.me/91${followUp.patient.phone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "overdue":
        return "border-red-100 bg-gradient-to-br from-red-50/80 to-white hover:border-red-200 shadow-sm shadow-red-100/30 hover:shadow-lg hover:-translate-y-1.5";
      case "today":
        return "border-amber-100 bg-gradient-to-br from-amber-50/80 to-white hover:border-amber-200 shadow-sm shadow-amber-100/30 hover:shadow-lg hover:-translate-y-1.5";
      case "upcoming":
        return "border-sky-100 bg-gradient-to-br from-sky-50/80 to-white hover:border-sky-200 shadow-sm shadow-sky-100/30 hover:shadow-lg hover:-translate-y-1.5";
    }
  };

  const getDaysText = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(followUp.dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.abs(differenceInDays(due, today));

    if (variant === "today") return "Today";
    if (variant === "overdue") return `${diff} day${diff !== 1 ? "s" : ""} ago`;
    return `In ${diff} day${diff !== 1 ? "s" : ""}`;
  };

  return (
    <Card className={cn("transition-all duration-200 shadow-sm", getVariantStyles())}>
      <CardContent className="p-4 sm:p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-start gap-3">
            {/* Squircle Avatar */}
            <div className={cn(
              "w-10 h-10 rounded-[0.8rem] flex items-center justify-center flex-shrink-0 shadow-inner border border-white/50",
              variant === "overdue" ? "bg-red-100 text-red-700" :
              variant === "today" ? "bg-amber-100 text-amber-700" :
              "bg-sky-100 text-sky-700"
            )}>
              <span className="font-bold text-sm">
                {followUp.patient.name[0]?.toUpperCase()}
              </span>
            </div>
            
            <Link href={`/dashboard/patients/${followUp.patient.id}`} className="hover:underline group">
              <h3 className="font-bold text-slate-900 text-base group-hover:text-sky-700 transition-colors">{followUp.patient.name}</h3>
              <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                {followUp.patient.phone}
              </div>
            </Link>
          </div>
          <span className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border",
            variant === "overdue" ? "bg-red-100 text-red-700 border-red-200" :
            variant === "today" ? "bg-amber-100 text-amber-700 border-amber-200" :
            "bg-sky-100 text-sky-700 border-sky-200"
          )}>
            {getDaysText()}
          </span>
        </div>

        {followUp.notes && (
          <p className="text-xs text-slate-600 mb-4 bg-white/60 p-2 rounded-lg border border-slate-100 flex-grow">
            {followUp.notes}
          </p>
        )}
        {!followUp.notes && <div className="flex-grow mb-4"></div>}

        <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-200/50">
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            WhatsApp
          </button>
          <button
            onClick={handleMarkDone}
            disabled={isMarking}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-slate-900/10 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isMarking ? "Saving..." : "Check In"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
