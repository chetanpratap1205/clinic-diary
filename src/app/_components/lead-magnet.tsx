"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, FileText, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { submitLeadMagnetAction } from "@/app/actions/lead-magnet";

export function LeadMagnetSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData();
    formData.append("email", email);

    const res = await submitLeadMagnetAction(formData);

    setLoading(false);

    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMessage(res.error || "Failed to submit. Please try again.");
    }
  };

  const handleDownload = () => {
    // Generate simple text/pdf checklist file on the fly if needed
    const content = `THE 5-STEP SYSTEM TO ELIMINATE NO-SHOWS IN YOUR CLINIC
Doctor Diary Checklist & Playbook

1. Automated WhatsApp Reminders: Send automated 24h and 2h appointment confirmations via WhatsApp.
2. 1-Click Confirmation Buttons: Allow patients to confirm or reschedule instantly from message.
3. Pre-Consultation Intake Forms: Collect basic details before arrival to lock in commitment.
4. Smart Waitlist Queue: Instantly fill last-minute cancelled slots from standby list.
5. Deposit / Exclusivity Booking: Secure high-value appointments with upfront token booking.

Transform your clinic with Doctor Diary: https://doctordiary.in/signup`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "5-Step-NoShow-Elimination-System.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-16 px-4 sm:px-6 relative bg-[#050505] border-t border-white/10 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 bg-gradient-to-b from-[#121215] to-[#0A0A0C] border border-white/15 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
          
          {/* Visual Badge / Guide Cover */}
          <div className="w-full md:w-5/12 flex flex-col items-center text-center shrink-0">
            <div className="relative w-48 sm:w-56 aspect-[3/4] bg-gradient-to-br from-emerald-950 via-slate-900 to-cyan-950 border border-emerald-500/30 rounded-2xl p-6 flex flex-col justify-between shadow-2xl group hover:border-emerald-500/60 transition-all">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  FREE PDF
                </span>
              </div>

              <div className="text-left my-4">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  DOCTOR PLAYBOOK
                </div>
                <h4 className="text-base sm:text-lg font-black text-white leading-tight">
                  The 5-Step System to Eliminate No-Shows
                </h4>
              </div>

              <div className="text-left pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>By Doctor Diary</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Form / Content Section */}
          <div className="w-full md:w-7/12 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Free Practice Growth Resource
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-3 leading-tight">
              Cut Patient No-Shows by 85% in Your Practice
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Download the exact 5-step system top clinics use to keep waiting rooms full, automate WhatsApp reminders, and protect monthly consultation revenue.
            </p>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-left space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-base">Checklist Ready!</h4>
                    <p className="text-slate-300 text-xs">Your free copy is ready to download.</p>
                  </div>
                </div>

                <Button
                  onClick={handleDownload}
                  className="w-full bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Download 5-Step Checklist Now
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your clinic email..."
                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#00B7A8] transition-colors"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold h-12 px-6 rounded-xl flex items-center justify-center gap-2 shrink-0 shadow-[0_4px_14px_0_rgba(0,183,168,0.39)]"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Get Free Guide
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {errorMessage && (
                  <p className="text-red-400 text-xs">{errorMessage}</p>
                )}

                <p className="text-[11px] text-slate-500 font-medium">
                  🔒 100% Free • No spam • Instant download access
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
