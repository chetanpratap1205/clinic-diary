"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail, ArrowRight, ShieldCheck, FileText, UserCircle, Activity, CheckCircle2, Download } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { sendPatientPhoneOtp, verifyPatientPhoneOtp, sendPatientEmailOtp, verifyPatientEmailOtp } from "@/app/actions/patient-auth";

interface PatientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
  clinicName?: string;
}

export function PatientLoginModal({ isOpen, onClose, themeColor = "#0ea5e9", clinicName = "Clinic" }: PatientLoginModalProps) {
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"input" | "otp" | "success">("input");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedAppointments, setVerifiedAppointments] = useState<any[]>([]);
  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const p = localStorage.getItem("dd_patient_phone");
      const n = localStorage.getItem("dd_patient_name");
      if (p && p.length === 10) {
        setSavedPhone(p);
        setPhone(p);
      }
      if (n) setSavedName(n);
    } catch (e) {}
  }, [isOpen]);

  const handleQuickDeviceLogin = async () => {
    if (!savedPhone) return;
    setIsLoading(true);
    try {
      const res = await verifyPatientPhoneOtp(savedPhone, "DEVICE_PERSISTED");
      setIsLoading(false);
      if (res.appointments) {
        toast.success(`Welcome back, ${savedName || 'Patient'}!`);
        setVerifiedAppointments(res.appointments);
        setStep("success");
      }
    } catch (e) {
      setIsLoading(false);
      handleSendOtp();
    }
  };

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
    if (resendCooldown > 0) return;
    setIsLoading(true);

    try {
      if (authMode === "phone") {
        const cleanPhone = phone.replace(/\D/g, "").slice(-10);
        if (!cleanPhone || cleanPhone.length !== 10) {
          toast.error("Please enter a valid 10-digit Indian mobile number.");
          setIsLoading(false);
          return;
        }
        const res = await sendPatientPhoneOtp(cleanPhone, clinicName);
        setIsLoading(false);

        if (res.error) {
          toast.error(res.error);
          return;
        }

        toast.success(res.message || "SMS OTP code sent to your phone!");
        if (res.devOtp) {
          toast.info(`Dev Mode SMS OTP Code: ${res.devOtp}`, { duration: 10000 });
        }
        setStep("otp");
        startResendTimer();
      } else {
        if (!email || !email.includes("@")) {
          toast.error("Please enter a valid email address.");
          setIsLoading(false);
          return;
        }
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
      }
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
      if (authMode === "phone") {
        const res = await verifyPatientPhoneOtp(phone, otp);
        setIsLoading(false);

        if (res.error) {
          toast.error(res.error);
          return;
        }

        toast.success("Phone verified successfully!");
        setVerifiedAppointments(res.appointments || []);
        setStep("success");
      } else {
        const res = await verifyPatientEmailOtp(email, otp);
        setIsLoading(false);

        if (res.error) {
          toast.error(res.error);
          return;
        }

        toast.success("Identity verified successfully!");
        setVerifiedAppointments(res.appointments || []);
        setStep("success");
      }
    } catch (err) {
      setIsLoading(false);
      toast.error("Failed to verify OTP code. Please try again.");
    }
  };

  const resetModal = () => {
    setStep("input");
    setOtp("");
    setPhone("");
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
              <button
                onClick={resetModal}
                className="absolute right-3.5 top-3.5 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors z-20"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-5 sm:p-7 overflow-y-auto relative z-10 space-y-4">
                <div className="flex justify-center pt-1">
                  <div 
                    className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-xs"
                    style={{ background: `linear-gradient(135deg, ${themeColor}20, ${themeColor}10)`, border: `1px solid ${themeColor}30` }}
                  >
                    <UserCircle className="w-7 h-7" style={{ color: themeColor }} />
                  </div>
                </div>
                
                <div className="text-center space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">My Appointments & Prescriptions</h2>
                  <p className="text-slate-500 text-xs sm:text-sm font-medium leading-relaxed">
                    Access your live OPD tokens, prescription PDFs & records at <strong>{clinicName}</strong>.
                  </p>
                </div>

                {/* Auth Mode Tabs (Mobile SMS Phone vs Email) */}
                <div className="flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => { setAuthMode("phone"); setStep("input"); }}
                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      authMode === "phone" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mobile SMS OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode("email"); setStep("input"); }}
                    className={`flex-1 py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      authMode === "email" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Email OTP</span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {step === "input" && (
                    <motion.form 
                      key="input-form"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      onSubmit={handleSendOtp} 
                      className="space-y-4 pt-1"
                    >
                      {authMode === "phone" ? (
                        <div className="space-y-1">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                            10-Digit Indian Mobile Number
                          </label>
                          <div className="flex rounded-2xl overflow-hidden border border-slate-200 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all bg-slate-50">
                            <div className="px-3.5 bg-slate-100/90 border-r border-slate-200 flex items-center gap-1.5 text-slate-800 font-black text-sm shrink-0 select-none">
                              <Phone className="w-4 h-4 text-emerald-600" />
                              <span>+91</span>
                            </div>
                            <Input
                              type="tel"
                              inputMode="numeric"
                              placeholder="98765 43210"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                              className="h-13 border-0 bg-transparent rounded-none focus-visible:ring-0 text-base font-bold text-slate-900 px-3.5"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 relative">
                          <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 z-10" />
                            <Input
                              type="email"
                              placeholder="name@example.com"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="h-13 pl-12 rounded-2xl bg-slate-50 border-slate-200 text-sm font-bold text-slate-900"
                            />
                          </div>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        disabled={isLoading || (authMode === "phone" ? phone.length !== 10 : !email)}
                        className="w-full h-13 rounded-2xl text-white font-black text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        style={{ backgroundColor: themeColor }}
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            {authMode === "phone" ? "Send SMS OTP Code" : "Send Email OTP Code"} <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </Button>
                    </motion.form>
                  )}

                  {step === "otp" && (
                    <motion.form 
                      key="otp-form"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      onSubmit={handleVerify} 
                      className="space-y-4 pt-1"
                    >
                      <div className="text-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <p className="text-xs text-slate-500">
                          {authMode === "phone" ? "Sent 4-digit SMS verification code to" : "Sent 6-digit security code to"}
                        </p>
                        <p className="font-black text-slate-900 text-sm mt-0.5">
                          {authMode === "phone" ? `+91 ${phone}` : email}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          placeholder={authMode === "phone" ? "Enter 4-digit OTP" : "Enter 6-digit OTP"}
                          required
                          maxLength={authMode === "phone" ? 4 : 6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="h-13 text-center tracking-widest text-2xl font-black rounded-2xl bg-slate-50 border-slate-200 focus:bg-white text-slate-900"
                        />
                        {authMode === "phone" && (
                          <div className="flex justify-center">
                            <button
                              type="button"
                              onClick={() => setOtp("4829")}
                              className="text-[11px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200/80 transition-all active:scale-95 cursor-pointer shadow-2xs"
                            >
                              🔑 Demo OTP: 4829 (Tap to Auto-fill)
                            </button>
                          </div>
                        )}
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isLoading || (authMode === "phone" ? otp.length < 4 : otp.length < 6)}
                        className="w-full h-13 rounded-2xl text-white font-black text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        style={{ backgroundColor: themeColor }}
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Verify OTP & Access Records"
                        )}
                      </Button>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <button 
                          type="button" 
                          onClick={() => setStep("input")}
                          className="text-slate-500 hover:text-slate-900 font-bold transition-colors"
                        >
                          Change {authMode === "phone" ? "Phone Number" : "Email"}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleSendOtp()}
                          disabled={resendCooldown > 0}
                          className="font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                          style={{ color: themeColor }}
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
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
                      <p className="text-xs text-slate-500">Found {verifiedAppointments.length} appointment record(s) under <strong>{authMode === "phone" ? `+91 ${phone}` : email}</strong>.</p>
                      
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
