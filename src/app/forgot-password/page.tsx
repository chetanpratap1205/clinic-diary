"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AnimatedLogo } from "@/components/animated-logo";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean || !clean.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(clean, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });

      if (error) {
        // Don't expose whether the email exists — always show success for security
        console.error("[ForgotPassword] Supabase error:", error.message);
      }

      // Always show the "check your email" screen regardless of whether email
      // exists — this prevents user enumeration attacks
      setSent(true);
    } catch (err) {
      console.error("[ForgotPassword] Unexpected:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── "Check your email" confirmation screen ───────────────────────────── */
  if (sent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0A] relative"
        style={{ minHeight: "100dvh" }}
      >
        {/* Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="flex justify-center mb-8">
            <AnimatedLogo theme="dark" size="md" />
          </div>

          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="p-6 sm:p-10 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </motion.div>

              <h1 className="text-2xl font-bold text-white tracking-tight mb-3">
                Check your inbox
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-2">
                If an account exists for
              </p>
              <p className="font-semibold text-white text-base mb-6 break-all">{email}</p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-3">
                {[
                  "We've sent a password reset link to your email",
                  "Click the link to set a new password",
                  "The link expires in 1 hour — check spam if not found",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 font-medium">{step}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Didn&apos;t receive it?{" "}
                <button
                  className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors"
                  onClick={() => setSent(false)}
                >
                  Try again with a different email
                </button>
                .
              </p>

              <Link href="/login" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white font-bold transition-all"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Main forgot-password form ─────────────────────────────────────────── */
  return (
    <div
      className="flex min-h-screen bg-[#0A0A0A] relative"
      style={{ minHeight: "100dvh" }}
    >
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative border-r border-white/5 bg-black/20 backdrop-blur-3xl z-10">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 p-16 flex flex-col h-full justify-between">
          <AnimatedLogo theme="dark" size="lg" />

          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight"
            >
              Forgot your<br />password?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-slate-400 text-xl font-medium max-w-md leading-relaxed"
            >
              No worries. Enter your registered email and we&apos;ll send you a secure link to reset it in seconds.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit shadow-2xl shadow-black/50"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <div className="text-slate-300 text-sm font-medium">
              Secure reset via{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-black">
                encrypted email link
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-16 relative z-10">

        {/* Mobile logo */}
        <div className="lg:hidden w-full flex flex-col items-center mb-8">
          <AnimatedLogo theme="dark" size="md" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-[440px] bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden"
        >
          <div className="p-6 sm:p-10">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <Mail className="w-7 h-7 text-emerald-400" />
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Reset password</h2>
              <p className="text-slate-400 font-medium text-sm leading-relaxed">
                Enter your registered email. We&apos;ll send a secure link to set a new password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-bold text-slate-300 ml-1">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="doctor@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  inputMode="email"
                  autoFocus
                  className="h-14 text-base rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all px-5"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
                  disabled={loading || !email.includes("@")}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                </Button>
              </div>
            </form>
          </div>

          <div className="border-t border-white/5 bg-black/20 p-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
