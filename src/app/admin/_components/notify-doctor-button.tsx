"use client";

import { MessageSquare } from "lucide-react";

interface NotifyDoctorButtonProps {
  clinicName: string;
  overdueCount: number;
}

export function NotifyDoctorButton({ clinicName, overdueCount }: NotifyDoctorButtonProps) {
  if (overdueCount <= 0) return <span className="text-slate-400 text-xs">—</span>;

  const msg = `Hello Doctor, we noticed your clinic (${clinicName}) has ${overdueCount} overdue patient follow-ups on Doctor Diary. Need help reaching out to your patients?`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
      title="Alert Doctor via WhatsApp regarding overdue patient follow-ups"
    >
      <MessageSquare className="w-3 h-3" />
      Notify Doctor ({overdueCount})
    </a>
  );
}
