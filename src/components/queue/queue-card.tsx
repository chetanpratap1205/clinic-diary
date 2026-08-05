import { motion } from "framer-motion";
import { Clock, CheckCircle2, User, Play, Check, X, Activity, Undo2, Star, MessageCircle } from "lucide-react";
import type { Appointment, Clinic } from "@/db/schema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { WhatsAppShareButton } from "@/components/dashboard/patients/whatsapp-share-button";
import { formatTimeDisplay } from "@/lib/format";
import { getEstimatedStart } from "@/lib/queue-logic";
import { formatWhatsAppPhone } from "@/lib/phone-utils";

interface QueueCardProps {
  appt: Appointment;
  clinic: Clinic;
  isPending: boolean;
  handleStatusChange: (id: string, status: string, fee?: number) => Promise<boolean>;
  router: any;
  now: Date;
  delayMinutes: number;
  followUpInfo?: { isFree: boolean; feeOverride: number | null };
}

export const QueueCard = ({
  appt,
  clinic,
  isPending,
  handleStatusChange,
  router,
  now,
  delayMinutes,
  followUpInfo,
}: QueueCardProps) => {
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
              <span className="text-slate-400 font-medium text-sm mr-0.5">#</span>
              {tokenDisplay}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-slate-900 text-sm">{appt.patientName || "Patient"}</p>
              {appt.acquisitionSource === "qr_reception" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  📍 QR Reception
                </span>
              )}
              {appt.acquisitionSource === "qr_window" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 border border-indigo-200">
                  🪟 QR Window
                </span>
              )}
              {appt.acquisitionSource === "qr_stand" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                  📐 QR Standee
                </span>
              )}
              {appt.acquisitionSource === "qr_sticker" && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  🏷️ QR Sticker
                </span>
              )}
              {followUpInfo ? (
                followUpInfo.isFree ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                    Free Follow-up
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-sky-100 text-sky-600">
                    Follow-up
                  </span>
                )
              ) : appt.notes?.includes("Quick check-in") ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                  Walk-in
                </span>
              ) : appt.notes?.includes("Auto-generated from Follow-up") ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-sky-100 text-sky-600">
                  Follow-up
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-600">
                  Scheduled
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {formatTimeDisplay(appt.appointmentTime)}
              </span>
              {(appt.status === "checked_in" || appt.status === "confirmed") && (
                <span
                  className={cn(
                    "flex items-center gap-1 px-1.5 py-0.5 rounded-md font-semibold border",
                    isDelayed ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  )}
                >
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
          <div className="flex gap-2 w-full">
            <button
              onClick={async () => {
                const success = await handleStatusChange(appt.id, "in_consultation");
                if (success) {
                  router.push(`/dashboard/consultation/${appt.id}`);
                }
              }}
              disabled={isPending}
              className="flex-1 bg-sky-50 text-sky-700 hover:opacity-90 min-h-[44px] rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
              style={{ color: clinic.themeColor || "#0ea5e9", backgroundColor: `${clinic.themeColor || "#0ea5e9"}15` }}
            >
              <Play className="w-4 h-4 fill-current" /> Start Consult
            </button>
            <button
              onClick={() => {
                const trackUrl = `${window.location.origin}/track/${appt.id}`;
                const text = `*YOUR TURN IS NEXT!* 🏥\n\nHi ${appt.patientName.split(' ')[0]},\nDr. ${clinic.doctorName} is ready for Token *#${tokenDisplay}* at ${clinic.name}.\n\nPlease step up to the consultation room.\n\n📍 *Track Live Status:* ${trackUrl}`;
                const formattedPhone = formatWhatsAppPhone(appt.patientPhone);
                const url = formattedPhone
                  ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
                  : `https://wa.me/?text=${encodeURIComponent(text)}`;
                window.open(url, "_blank");
              }}
              className="px-3.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
              title="Send 1-Click WhatsApp Call Notification"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Call WA</span>
            </button>
          </div>
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
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => {
                    const fee = appt.feeCollected ?? (clinic.consultationFee || 0);
                    const text = `*INVOICE & VISIT SUMMARY* 🏥\n\nDear ${appt.patientName},\nThank you for visiting *${clinic.name}* (Dr. ${clinic.doctorName}). We hope you had a comfortable experience!\n\n*Payment Received:* ₹${fee}\n*Date:* ${format(
                      new Date(),
                      "dd MMM yyyy"
                    )}\n\n📄 *View & Download your Official E-Receipt here:*\n${window.location.origin}/receipt/${
                      appt.id
                    }\n\n📅 *Need a Follow-up?*\nBook your next visit online instantly:\n${window.location.origin}/book/${
                      clinic.slug
                    }\n\nWishing you a speedy recovery! 🌿`;
                    const formattedPhone = formatWhatsAppPhone(appt.patientPhone);
                    const url = formattedPhone
                      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
                      : `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(url, "_blank");
                  }}
                  className="flex-1 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white min-h-[36px] rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  title="Share Receipt via WhatsApp"
                >
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Receipt
                </button>
                <button
                  onClick={() => {
                    const reviewLink = `${window.location.origin}/review/${appt.id}`;
                    const text = `Hi ${appt.patientName.split(' ')[0]}, thank you for visiting Dr. ${clinic.doctorName}! We hope you had a great experience using our Smart Queue.\n\nCould you take 10 seconds to support us with a quick rating? 🌟\n${reviewLink}`;
                    const formattedPhone = formatWhatsAppPhone(appt.patientPhone);
                    const url = formattedPhone
                      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
                      : `https://wa.me/?text=${encodeURIComponent(text)}`;
                    window.open(url, "_blank");
                  }}
                  className="flex-1 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white min-h-[36px] rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                  title="Ask for Review via WhatsApp"
                >
                  <Star className="w-3 h-3 fill-current" />
                  Get Review
                </button>
              </div>
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
