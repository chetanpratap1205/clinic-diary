"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { findPatientAppointment } from "./actions";
import { ArrowRight, Loader2, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DICTIONARY, Language } from "@/lib/i18n";

export function TrackWidget({
  clinicId,
  themeColor,
  lang = "en",
}: {
  clinicId: string;
  themeColor: string;
  lang?: Language;
}) {
  const t = DICTIONARY[lang];
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error(t.invalidMobile);
      return;
    }
    setIsLoading(true);
    const res = await findPatientAppointment(clinicId, phone);
    setIsLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else if (res.appointmentId) {
      router.push(`/track/${res.appointmentId}?lang=${lang}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <div className="relative flex-1">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          type="tel"
          inputMode="numeric"
          placeholder={t.yourMobileNumber}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          maxLength={10}
          className="pl-9 h-11 rounded-xl bg-white border-slate-200 text-sm font-medium focus:border-slate-400 transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || phone.length !== 10}
        className="h-11 px-4 rounded-xl font-bold text-white text-sm flex items-center gap-1.5 transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        style={{ backgroundColor: themeColor }}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {t.findStatus} <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
