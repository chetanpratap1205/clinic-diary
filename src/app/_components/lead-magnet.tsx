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
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The 5-Step System to Eliminate No-Shows</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 800px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc; }
    .cover { background: linear-gradient(135deg, #0B132B 0%, #1e293b 100%); color: white; padding: 60px 40px; border-radius: 24px; text-align: center; margin-bottom: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
    .badge { background: #00B7A8; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 20px; }
    h1 { font-size: 42px; margin: 0 0 20px 0; line-height: 1.2; letter-spacing: -1px; }
    .subtitle { font-size: 20px; color: #cbd5e1; font-weight: 400; margin: 0; }
    .step { background: white; padding: 40px; border-radius: 20px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.02), 0 10px 15px rgba(0,0,0,0.03); border: 1px solid #e2e8f0; }
    .step-number { font-size: 64px; font-weight: 900; color: #f1f5f9; line-height: 1; float: right; margin-top: -20px; }
    .step h2 { color: #0B132B; font-size: 24px; margin-top: 0; }
    .step p { font-size: 16px; color: #475569; margin-bottom: 20px; }
    .action-item { background: #f0fdfa; border-left: 4px solid #00B7A8; padding: 15px 20px; border-radius: 0 12px 12px 0; color: #0f766e; font-weight: 500; font-size: 15px; }
    .cta { text-align: center; margin-top: 60px; padding: 40px; background: white; border-radius: 20px; border: 2px dashed #cbd5e1; }
    .cta-button { display: inline-block; background: #00B7A8; color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 18px; margin-top: 20px; box-shadow: 0 10px 20px rgba(0, 183, 168, 0.2); }
  </style>
</head>
<body>

  <div class="cover">
    <div class="badge">Doctor Diary Playbook</div>
    <h1>The 5-Step System to<br>Eliminate Clinic No-Shows</h1>
    <p class="subtitle">How top clinics recover ₹50,000+ per month by fixing their waiting room logistics.</p>
  </div>

  <p style="font-size: 18px; text-align: center; margin-bottom: 40px;">Patient no-shows aren't just an annoyance—they are the single largest leak in a private clinic's revenue. Implementing these 5 exact steps will reduce your no-shows by up to 85%.</p>

  <div class="step">
    <div class="step-number">01</div>
    <h2>The 24h & 2h WhatsApp Strategy</h2>
    <p>Patients forget. SMS messages get ignored. Phone calls from the receptionist are intrusive and time-consuming. The modern standard is WhatsApp.</p>
    <p>By automating a friendly WhatsApp reminder exactly 24 hours before the appointment, and a secondary "Queue is moving" reminder 2 hours prior, you trigger psychological commitment.</p>
    <div class="action-item"><strong>Action Step:</strong> Stop calling patients. Move entirely to automated WhatsApp reminders via your clinic's official number.</div>
  </div>

  <div class="step">
    <div class="step-number">02</div>
    <h2>1-Click Rescheduling (The Pressure Release)</h2>
    <p>Patients often no-show because they feel embarrassed to call and cancel. Give them an easy way out that benefits you.</p>
    <p>Include a "Reschedule" button directly in the WhatsApp reminder. When they tap it, your calendar instantly frees up, allowing a walk-in to take that exact slot.</p>
    <div class="action-item"><strong>Action Step:</strong> Remove friction. Let patients cancel or reschedule digitally without speaking to staff.</div>
  </div>

  <div class="step">
    <div class="step-number">03</div>
    <h2>Live Queue Tracking (Zero Anxiety)</h2>
    <p>The "Waiting Room Penalty" forces patients to sit for hours. This causes walk-outs. By giving them a link to track the live queue from home, they only arrive exactly when it's their turn.</p>
    <div class="action-item"><strong>Action Step:</strong> Implement a digital token board. Tell patients "You are #18, we are currently serving #12".</div>
  </div>

  <div class="step">
    <div class="step-number">04</div>
    <h2>Smart Waitlist Autofill</h2>
    <p>When someone cancels 2 hours before, that slot is usually lost revenue. A Smart Waitlist automatically detects the cancellation and messages the next person on the standby list.</p>
    <div class="action-item"><strong>Action Step:</strong> Never leave a cancelled slot empty. Keep a digital standby list and message them instantly.</div>
  </div>

  <div class="step">
    <div class="step-number">05</div>
    <h2>The Token Booking Deposit</h2>
    <p>For high-value or long aesthetic procedures, a small upfront token fee (e.g., ₹500) completely locks the patient in. They will not no-show if money is on the line.</p>
    <div class="action-item"><strong>Action Step:</strong> Collect a 100% automated UPI deposit for first-time or high-value consults.</div>
  </div>

  <div class="cta">
    <h2 style="margin-top:0;">Want to automate this entire system instantly?</h2>
    <p>Doctor Diary implements all 5 of these steps for your clinic out-of-the-box, with zero setup required.</p>
    <a href="https://doctordiary.in/signup" class="cta-button">Claim Your 14-Day Free Trial</a>
  </div>

</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Doctor_Diary_Playbook.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="py-20 px-4 sm:px-6 relative bg-[#F8FAFC] border-t border-slate-200/80 overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-12">
          
          {/* Visual Badge / Guide Cover */}
          <div className="w-full md:w-5/12 flex flex-col items-center text-center shrink-0">
            <div className="relative w-48 sm:w-56 aspect-[3/4] bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 flex flex-col justify-between shadow-md">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-xl bg-[#00B7A8] text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#00B7A8] bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                  FREE PDF
                </span>
              </div>

              <div className="text-left my-4">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  DOCTOR PLAYBOOK
                </div>
                <h4 className="text-base sm:text-lg font-black text-[#0B132B] leading-tight">
                  The 5-Step System to Eliminate No-Shows
                </h4>
              </div>

              <div className="text-left pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>By Doctor Diary</span>
                <Sparkles className="w-4 h-4 text-[#00B7A8]" />
              </div>
            </div>
          </div>

          {/* Form / Content Section */}
          <div className="w-full md:w-7/12 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#00B7A8] text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Free Practice Growth Resource
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#0B132B] tracking-tight mb-3 leading-tight">
              Cut Patient No-Shows by 85% in Your Practice
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
              Download the exact 5-step system top clinics use to keep waiting rooms full, automate WhatsApp reminders, and protect monthly consultation revenue.
            </p>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-left space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="bg-[#00B7A8] text-white p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[#0B132B] font-bold text-base">Checklist Ready!</h4>
                    <p className="text-slate-600 text-xs font-medium">Your free copy is ready to download.</p>
                  </div>
                </div>

                <Button
                  onClick={handleDownload}
                  className="w-full bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold h-12 rounded-xl flex items-center justify-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  Download 5-Step Checklist Now
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSubmit(e as any);
                      }
                    }}
                    placeholder="Enter your clinic email..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[#0B132B] placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#00B7A8] transition-colors font-medium"
                  />
                  <Button
                    type="button"
                    onClick={handleSubmit as any}
                    disabled={loading}
                    className="bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold h-12 px-6 rounded-xl flex items-center justify-center gap-2 shrink-0 shadow-md"
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
                  <p className="text-red-500 text-xs font-medium">{errorMessage}</p>
                )}

                <p className="text-[11px] text-slate-500 font-medium">
                  🔒 100% Free • No spam • Instant download access
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
