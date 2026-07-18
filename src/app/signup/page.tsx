"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Mail, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { AnimatedLogo } from "@/components/animated-logo";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });
      if (error) { toast.error(error.message); return; }
      if (data.session) {
        toast.success("Account created successfully!");
        router.push("/onboarding");
      } else {
        setNeedsConfirmation(true);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Email confirmation screen ──────────────────────────────────────────── */
  if (needsConfirmation) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0A] relative overflow-hidden"
        style={{ minHeight: "100dvh" }}
      >
        {/* Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

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
            <div className="p-8 sm:p-10 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
                className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
                <Mail className="w-9 h-9 text-emerald-400" />
              </motion.div>

              <h1 className="text-2xl font-bold text-white tracking-tight mb-3">
                Check your email
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-2">
                We&apos;ve sent a verification link to
              </p>
              <p className="font-semibold text-white text-base mb-6 break-all">{email}</p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-3">
                {[
                  "Click the link in the email to verify your account",
                  "Then you'll be taken to set up your clinic profile",
                  "The link expires in 24 hours",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 font-medium">{step}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 mb-6">
                Didn&apos;t receive it? Check your spam folder, or{" "}
                <button
                  className="text-emerald-400 font-bold hover:text-emerald-300 hover:underline transition-colors"
                  onClick={async () => {
                    await supabase.auth.resend({ type: "signup", email });
                    toast.success("Verification email resent!");
                  }}
                >
                  click to resend
                </button>
                .
              </p>

              <Link href="/login" className="block w-full">
                <Button variant="outline" className="w-full h-12 rounded-2xl border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white font-bold transition-all">
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Main signup form ───────────────────────────────────────────────────── */
  return (
    <div
      className="flex min-h-screen bg-[#0A0A0A] relative overflow-hidden"
      style={{ minHeight: "100dvh" }}
    >
      {/* ── BACKGROUND GLOWS (Visible on both mobile & desktop) ── */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* ── LEFT: Brand Panel (Desktop only) ──────────────────────────── */}
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
              Start your digital<br />clinic today.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="text-slate-400 text-xl font-medium max-w-md leading-relaxed"
            >
              Join thousands of doctors who have digitized their practice, saving hours every day and providing a premium experience to patients.
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
              Join{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-black">
                21,000+ Top Doctors
              </span>{" "}
              delivering premium care.
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ─────────────────────────────────────────── */}
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
          <div className="p-8 sm:p-10">
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Create an account</h2>
              <p className="text-slate-400 font-medium">Start managing your clinic efficiently.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-bold text-slate-300 ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="dr.sharma@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  inputMode="email"
                  className="h-14 text-base rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all px-5"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-bold text-slate-300 ml-1">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="h-14 pr-12 text-base rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all px-5 tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 bg-white hover:bg-slate-200 text-black font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="border-t border-white/5 bg-black/20 p-6 text-center space-y-3">
            <p className="text-sm font-medium text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-white font-bold hover:text-emerald-400 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
