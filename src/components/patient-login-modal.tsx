"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, ShieldCheck, FileText, UserCircle, Activity, CheckCircle2 } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { sendPatientEmailOtp, verifyPatientEmailOtp } from "@/app/actions/patient-auth";

interface PatientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
  clinicName?: string;
}

export function PatientLoginModal({ isOpen, onClose, themeColor = "#0ea5e9", clinicName = "Clinic" }: PatientLoginModalProps) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "success">("email");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedAppointments, setVerifiedAppointments] = useState<any[]>([]);

  const [resendCooldown, setResendCooldown] = useState(0);

  const startResendTimer = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || resendCooldown > 0) return;
    setIsLoading(true);

    try {
      const res = await sendPatientEmailOtp(email, clinicName);
      setIsLoading(false);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(res.message || "OTP code sent to email!");
      if (res.devOtp) {
        toast.info(`Dev Mode OTP Code: ${res.devOtp}`, { duration: 10000 });
      }
      setStep("otp");
      startResendTimer();
    } catch (err) {
      setIsLoading(false);
      toast.error("Failed to send OTP code. Please try again.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);

    try {
      const res = await verifyPatientEmailOtp(email, otp);
      setIsLoading(false);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Identity verified successfully!");
      setVerifiedAppointments(res.appointments || []);
      setStep("success");
    } catch (err) {
      setIsLoading(false);
      toast.error("Failed to verify code. Please check your OTP.");
    }
  };

  const resetModal = () => {
    setStep("email");
    setOtp("");
    setEmail("");
    setVerifiedAppointments([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetModal}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[65] transition-all"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 overflow-y-auto pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="pointer-events-auto w-full max-w-md my-auto max-h-[88vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden relative"
            >
              {/* Decorative Background Elements */}
              <div 
                className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
                style={{ backgroundColor: themeColor }}
              />
              <div 
                className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
                style={{ backgroundColor: themeColor }}
              />

              <button
                onClick={resetModal}
                className="absolute right-3.5 top-3.5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-20"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 sm:p-8 overflow-y-auto relative z-10 space-y-4">
                <div className="flex justify-center pt-1">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md"
                    style={{ background: `linear-gradient(135deg, ${themeColor}20, ${themeColor}10)`, border: `1px solid ${themeColor}30` }}
                  >
                    <UserCircle className="w-7 h-7" style={{ color: themeColor }} />
                  </div>
                </div>
                
                <div className="text-center space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">My Appointments</h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium">
                    View your appointments & medical history at <strong>{clinicName}</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 mb-6">
                  <div className="flex flex-col items-center text-center gap-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <Activity className="w-4 h-4" style={{ color: themeColor }} />
                    <span className="text-[10px] font-semibold text-slate-600">Live Status</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <FileText className="w-4 h-4" style={{ color: themeColor }} />
                    <span className="text-[10px] font-semibold text-slate-600">Prescriptions</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-4 h-4" style={{ color: themeColor }} />
                    <span className="text-[10px] font-semibold text-slate-600">Health Records</span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {step === "email" && (
                    <motion.form 
                      key="email-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleSendOtp} 
                      className="space-y-4"
                    >
                      <div className="space-y-1 relative">
                        <Mail className="absolute left-4 top-4 text-slate-400 w-5 h-5 z-10" />
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-14 pl-12 py-4 rounded-2xl bg-white/50 border-slate-200 focus:bg-white text-base font-medium transition-all focus:ring-4 focus:border-transparent"
                          style={{ '--tw-ring-color': `${themeColor}30` } as React.CSSProperties}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isLoading || !email}
                        className="w-full h-14 rounded-2xl text-white font-semibold text-base shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: themeColor }}
                      >
                        {isLoading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Send Email OTP <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  )}

                  {step === "otp" && (
                    <motion.form 
                      key="otp-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleVerify} 
                      className="space-y-4"
                    >
                      <div className="text-center mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-xs text-slate-500">Sent a 6-digit security code to</p>
                        <p className="font-bold text-slate-900 text-sm">{email}</p>
                      </div>
                      <div className="space-y-1">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="h-14 text-center tracking-widest text-2xl font-black rounded-2xl bg-white/50 border-slate-200 focus:bg-white transition-all focus:ring-4 focus:border-transparent"
                          style={{ '--tw-ring-color': `${themeColor}30` } as React.CSSProperties}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isLoading || otp.length < 6}
                        className="w-full h-14 rounded-2xl text-white font-bold text-base shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: themeColor }}
                      >
                        {isLoading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Verify & Access History"
                        )}
                      </Button>
                      <div className="flex items-center justify-between text-xs pt-2">
                        <button 
                          type="button" 
                          onClick={() => setStep("email")}
                          className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
                        >
                          Change Email
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleSendOtp()}
                          disabled={resendCooldown > 0}
                          className="font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                          style={{ color: themeColor }}
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {step === "success" && (
                    <motion.div
                      key="success-view"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4 text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Welcome Back!</h3>
                      <p className="text-xs text-slate-500">Found {verifiedAppointments.length} appointment record(s) under <strong>{email}</strong>.</p>
                      
                      <div className="max-h-48 overflow-y-auto space-y-2 text-left pr-1">
                        {verifiedAppointments.length === 0 ? (
                          <p className="text-center text-xs text-slate-400 py-4 border rounded-xl bg-slate-50">No previous appointments found for this email.</p>
                        ) : (
                          verifiedAppointments.map((app) => (
                            <div key={app.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                              <div>
                                <p className="font-bold text-slate-900">{app.patientName}</p>
                                <p className="text-slate-500">{app.appointmentDate} • {app.appointmentTime} {app.tokenNumber ? `(Token #${app.tokenNumber})` : ""}</p>
                              </div>
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">
                                {app.status || "Confirmed"}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <Button
                        onClick={resetModal}
                        className="w-full h-12 rounded-2xl text-white font-bold text-sm shadow-md mt-4"
                        style={{ backgroundColor: themeColor }}
                      >
                        Close & Continue
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
              <div className="bg-slate-50/50 p-4 border-t border-slate-100 text-center flex-shrink-0">
                <p className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> 256-bit encrypted health portal for {clinicName}
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
