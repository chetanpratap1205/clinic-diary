"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getLoginRedirectPath } from "./actions";
import { AnimatedLogo } from "@/components/animated-logo";
import { motion } from "framer-motion";

const AUTH_ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "Incorrect email or password. Please try again.",
  "Email not confirmed":
    "Please verify your email address before signing in. Check your inbox.",
  "User not found": "No account found with this email. Please sign up.",
  "Too many requests": "Too many attempts. Please wait a few minutes and try again.",
};

function mapAuthError(message: string): string {
  return AUTH_ERROR_MAP[message] ?? "Sign in failed. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(mapAuthError(error.message)); return; }
      toast.success("Welcome back!");
      const redirectPath = await getLoginRedirectPath();
      router.push(redirectPath);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) { toast.error("Please enter your email address first."); return; }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
      });
      if (error) {
        toast.error("Could not send reset email. Please try again.");
      } else {
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen bg-[#0A0A0A] relative overflow-hidden"
      style={{ minHeight: "100dvh" }}
    >
      {/* ── BACKGROUND GLOWS (Visible on both mobile & desktop) ── */}
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* ── LEFT: Brand Panel (Desktop only) ─────────────────────────── */}
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
              Manage your clinic<br />with zero friction.
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
        
        {/* Mobile Header Branding */}
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
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Welcome back</h2>
              <p className="text-slate-400 font-medium">Please enter your details to sign in.</p>
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
                <div className="flex items-center justify-between px-1">
                  <Label htmlFor="password" className="text-sm font-bold text-slate-300">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={resetLoading}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? "Sending…" : "Forgot Password?"}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="border-t border-white/5 bg-black/20 p-6 text-center space-y-3">
            <p className="text-sm font-medium text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-white font-bold hover:text-emerald-400 transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
