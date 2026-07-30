import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import type { Appointment, Clinic } from "@/db/schema";
import { formatWhatsAppPhone } from "@/lib/phone-utils";

interface CompleteAppointmentModalProps {
  completeModalOpen: boolean;
  setCompleteModalOpen: (open: boolean) => void;
  receiptState: "input" | "success";
  setReceiptState: (state: "input" | "success") => void;
  completingAppt: Appointment | null;
  setCompletingAppt: (appt: Appointment | null) => void;
  feeCollected: number;
  setFeeCollected: (fee: number) => void;
  clinic: Clinic;
  followUpMap: Record<string, { isFree: boolean; feeOverride: number | null }>;
  handleStatusChange: (id: string, status: string, fee?: number) => Promise<boolean>;
}

export const CompleteAppointmentModal = ({
  completeModalOpen,
  setCompleteModalOpen,
  receiptState,
  setReceiptState,
  completingAppt,
  setCompletingAppt,
  feeCollected,
  setFeeCollected,
  clinic,
  followUpMap,
  handleStatusChange,
}: CompleteAppointmentModalProps) => {
  if (!completeModalOpen || !completingAppt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        {receiptState === "input" ? (
          <>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Complete Appointment</h3>
            <p className="text-sm text-slate-500 mb-6">Record fee collected for {completingAppt.patientName}</p>

            <div className="space-y-4">
              {followUpMap[completingAppt.id]?.isFree && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                  <span className="text-emerald-600 text-lg">🎉</span>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Free Follow-up Visit</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      Within clinic&apos;s free follow-up window. Fee pre-set to ₹0.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Amount Collected (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={feeCollected}
                    onChange={(e) => setFeeCollected(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setFeeCollected(0)}
                  className="flex-1 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                  Free Follow-up (₹0)
                </button>
                <button
                  onClick={() => setFeeCollected(clinic.consultationFee || 0)}
                  className="flex-1 py-2 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  Standard Fee
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setCompleteModalOpen(false);
                    setCompletingAppt(null);
                  }}
                  className="flex-1 py-3 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleStatusChange(completingAppt.id, "completed", feeCollected);
                    setReceiptState("success");
                  }}
                  className="flex-1 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md hover:bg-slate-800 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  Complete & Save
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center animate-in slide-in-from-right-4 duration-300">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-50">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Receipt Ready</h3>
            <p className="text-sm text-slate-500 mb-6">Appointment completed successfully.</p>

            <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 text-left">
              <div className="flex justify-between items-center mb-2.5 pb-2.5 border-b border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Patient</span>
                <span className="font-bold text-slate-900 text-sm">{completingAppt.patientName}</span>
              </div>
              <div className="flex justify-between items-center mb-2.5 pb-2.5 border-b border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                <span className="font-bold text-slate-900 text-sm">{format(new Date(), "dd MMM yyyy")}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fee Collected</span>
                <span className="font-black text-emerald-600 text-xl">₹{feeCollected}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  const text = `*INVOICE & VISIT SUMMARY* 🏥\n\nDear ${completingAppt.patientName},\nThank you for visiting *${
                    clinic.name
                  }* (Dr. ${
                    clinic.doctorName
                  }). We hope you had a comfortable experience!\n\n*Payment Received:* ₹${feeCollected}\n*Date:* ${format(
                    new Date(),
                    "dd MMM yyyy"
                  )}\n\n📄 *View & Download your Official E-Receipt here:*\n${window.location.origin}/receipt/${
                    completingAppt.id
                  }\n\n📅 *Need a Follow-up?*\nBook your next visit online instantly:\n${window.location.origin}/book/${
                    clinic.slug
                  }\n\nWishing you a speedy recovery! 🌿`;
                  const formattedPhone = formatWhatsAppPhone(completingAppt.patientPhone);
                  const url = formattedPhone
                    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`
                    : `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(url, "_blank");
                  setCompleteModalOpen(false);
                }}
                className="w-full py-3.5 bg-[#25D366] text-white font-bold rounded-xl shadow-md shadow-[#25D366]/20 hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Share via WhatsApp
              </button>
              <button
                onClick={() => {
                  setCompleteModalOpen(false);
                }}
                className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-700 transition-colors"
              >
                Skip & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
