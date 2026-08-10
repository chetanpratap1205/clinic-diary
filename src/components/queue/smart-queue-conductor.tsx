import { AlertTriangle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FadeInUp } from "@/components/dashboard/dashboard-animations";
import { formatDoctorName } from "@/lib/utils";

interface SmartQueueConductorProps {
  delayMinutes: number;
  doctorName: string;
}

export const SmartQueueConductor = ({ delayMinutes, doctorName }: SmartQueueConductorProps) => {
  const [copied, setCopied] = useState(false);

  // We only activate the conductor if delay is significant (> 15 mins)
  if (delayMinutes <= 15) return null;

  const apologyMessage = `${formatDoctorName(doctorName)} is currently running ${delayMinutes} minutes behind schedule due to an unexpected emergency. We sincerely apologize for the delay. Your queue position is secured and we will see you shortly.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(apologyMessage);
    setCopied(true);
    toast.success("Apology message copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <FadeInUp>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm mb-2">
        <div className="flex gap-3">
          <div className="bg-amber-100 p-2.5 rounded-xl shrink-0 h-fit">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 text-sm sm:text-base">
              You are running {delayMinutes} minutes behind schedule.
            </h3>
            <p className="text-amber-700/80 text-xs sm:text-sm mt-0.5">
              Patients might be getting anxious. Send a quick update to the waiting room.
            </p>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-amber-100 text-amber-700 font-bold px-4 py-2.5 rounded-xl border border-amber-200 transition-all shadow-sm active:scale-95 text-xs sm:text-sm shrink-0"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy Apology Message"}
        </button>
      </div>
    </FadeInUp>
  );
};
