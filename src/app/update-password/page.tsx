"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle2, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AnimatedLogo } from "@/components/animated-logo";
import { motion } from "framer-motion";
import { getLoginRedirectPath } from "@/app/login/actions";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [checking, setChecking] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Verify there's a valid recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast.error("This link has expired or is invalid. Please request a new one.");
        router.push("/forgot-password");
      } else {
        setChecking(false);
      }
    });
  }, [router, supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error(error.message ?? "Failed to update password. Please try again.");
        return;
      }

      setDone(true);
      toast.success("Password updated successfully!");

      // Redirect to correct dashboard after 2 seconds
      setTimeout(async () => {
        try {
          const redirectPath = await getLoginRedirectPath();
          window.location.href = redirectPath;
        } catch {
          window.location.href = "/login";
        }
      }, 2000);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Validate password strength indicator (simplified — no strict rules)
  const strength =
    password.length === 0
      ? 0
      : password.length < 6
      ? 1
      : password.length < 10
      ? 2
      : 3;

  const strengthLabel = ["", "Too short", "Good", "Strong"];
  const strengthColor = ["", "bg-rose-500", "bg-amber-500", "bg-emerald-500"];

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (done) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0A] relative"
        style={{ minHeight: "100dvh" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-500/10 blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10 text-center"
        >
          <div className="flex justify-center mb-8">
            <AnimatedLogo theme="dark" size="md" />
          </div>
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-9 h-9 text-emerald-400" />
            </motion.div>
            <h1 className="text-2xl font-black text-white mb-2">Password Updated!</h1>
            <p className="text-slate-400 text-sm">Redirecting you to your dashboard…</p>
            <div className="mt-6 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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

      {/* Left panel — desktop */}
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
              transition={{ duration: 0.8 }}
              className="text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight"
            >
              Set your new<br />password.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-slate-400 text-xl font-medium max-w-md leading-relaxed"
            >
              Choose a password you can remember easily. Minimum 6 characters.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 text-sm font-medium">Encrypted &amp; secure reset</span>
          </motion.div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-16 relative z-10">

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
            <div className="mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">New Password</h2>
              <p className="text-slate-400 font-medium text-sm">
                Choose something you&apos;ll remember. At least 6 characters.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* New password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-bold text-slate-300 ml-1">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    autoFocus
                    className="h-14 pr-12 text-base rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all px-5"
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

                {/* Simple strength bar */}
                {password.length > 0 && (
                  <div className="flex items-center gap-2 mt-1.5 px-1">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            strength >= i ? strengthColor[strength] : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-semibold ${
                      strength === 1 ? "text-rose-400" :
                      strength === 2 ? "text-amber-400" :
                      "text-emerald-400"
                    }`}>
                      {strengthLabel[strength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-bold text-slate-300 ml-1">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className={`h-14 text-base rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 transition-all px-5 ${
                    confirmPassword.length > 0
                      ? password === confirmPassword
                        ? "border-emerald-500/40 focus:border-emerald-500/60"
                        : "border-rose-500/40 focus:border-rose-500/60"
                      : "focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  }`}
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-rose-400 font-medium ml-1">Passwords do not match</p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]"
                  disabled={
                    loading ||
                    password.length < 6 ||
                    password !== confirmPassword
                  }
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Set New Password"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
