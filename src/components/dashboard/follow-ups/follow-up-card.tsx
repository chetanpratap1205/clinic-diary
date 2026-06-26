"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, MessageSquare, Phone } from "lucide-react";
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
  const router = useRouter();
  const [isMarking, setIsMarking] = useState(false);

  const handleMarkDone = async () => {
    setIsMarking(true);
    try {
      const res = await fetch(`/api/follow-ups/${followUp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success("Follow-up marked as completed");
      router.refresh();
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
        return "border-red-100 bg-gradient-to-br from-red-50/80 to-white hover:border-red-200 shadow-sm shadow-red-100/30 hover:shadow-md hover:-translate-y-1";
      case "today":
        return "border-amber-100 bg-gradient-to-br from-amber-50/80 to-white hover:border-amber-200 shadow-sm shadow-amber-100/30 hover:shadow-md hover:-translate-y-1";
      case "upcoming":
        return "border-sky-100 bg-gradient-to-br from-sky-50/80 to-white hover:border-sky-200 shadow-sm shadow-sky-100/30 hover:shadow-md hover:-translate-y-1";
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
          <Link href={`/dashboard/patients/${followUp.patient.id}`} className="hover:underline">
            <h3 className="font-bold text-slate-900 text-base">{followUp.patient.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
              <Phone className="w-3 h-3" />
              {followUp.patient.phone}
            </div>
          </Link>
          <span className={cn(
            "text-[10px] font-bold px-2 py-1 rounded-md",
            variant === "overdue" ? "bg-red-100 text-red-700" :
            variant === "today" ? "bg-amber-100 text-amber-700" :
            "bg-sky-100 text-sky-700"
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

        <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-200/50">
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 text-emerald-700 text-xs font-semibold rounded-xl transition-all border border-emerald-200/50 shadow-sm hover:shadow active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp
          </button>
          <button
            onClick={handleMarkDone}
            disabled={isMarking}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all border border-slate-200 shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isMarking ? "Saving..." : "Done"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
