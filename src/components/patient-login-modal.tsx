"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, ShieldCheck, FileText, UserCircle, Activity } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface PatientLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
  clinicName?: string;
}

export function PatientLoginModal({ isOpen, onClose, themeColor = "#0ea5e9", clinicName = "Clinic" }: PatientLoginModalProps) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setIsLoading(false);
      setStep("otp");
    }, 1200);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      onClose(); // In a real app, this would set auth context and redirect/update UI
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-all"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-4"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden relative">
              {/* Decorative Background Elements */}
              <div 
                className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: themeColor }}
              />
              <div 
                className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: themeColor }}
              />

              <button
                onClick={onClose}
                className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200 text-slate-500 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-8 sm:p-10 relative z-10">
                <div className="flex justify-center mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${themeColor}20, ${themeColor}10)`, border: `1px solid ${themeColor}30` }}
                  >
                    <UserCircle className="w-8 h-8" style={{ color: themeColor }} />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Patient Portal</h2>
                <p className="text-center text-slate-500 text-sm mb-8 px-4">
                  Access your digital health records securely at {clinicName}.
                </p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Activity className="w-4 h-4" style={{ color: themeColor }} />
                    <span className="text-[10px] font-semibold text-slate-600">1-Tap Booking</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <FileText className="w-4 h-4" style={{ color: themeColor }} />
                    <span className="text-[10px] font-semibold text-slate-600">Prescriptions</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="w-4 h-4" style={{ color: themeColor }} />
                    <span className="text-[10px] font-semibold text-slate-600">Secure Vault</span>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {step === "email" ? (
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
                          placeholder="Email Address"
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
                        className="w-full h-14 rounded-2xl text-white font-semibold text-base shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: themeColor }}
                      >
                        {isLoading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            Send Login Link <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.form>
                  ) : (
                    <motion.form 
                      key="otp-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleVerify} 
                      className="space-y-4"
                    >
                      <div className="text-center mb-4">
                        <p className="text-sm text-slate-600">We've sent a 6-digit code to</p>
                        <p className="font-semibold text-slate-900">{email}</p>
                      </div>
                      <div className="space-y-1">
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
                          required
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="h-14 text-center tracking-widest text-xl rounded-2xl bg-white/50 border-slate-200 focus:bg-white font-bold transition-all focus:ring-4 focus:border-transparent"
                          style={{ '--tw-ring-color': `${themeColor}30` } as React.CSSProperties}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={isLoading || otp.length < 6}
                        className="w-full h-14 rounded-2xl text-white font-semibold text-base shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: themeColor }}
                      >
                        {isLoading ? (
                          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          "Verify Securely"
                        )}
                      </Button>
                      <button 
                        type="button" 
                        onClick={() => setStep("email")}
                        className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mt-4"
                      >
                        Change Email Address
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

              </div>
              <div className="bg-slate-50/50 p-4 border-t border-slate-100 text-center">
                <p className="text-[11px] font-medium text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Enterprise-grade security for your health records
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
