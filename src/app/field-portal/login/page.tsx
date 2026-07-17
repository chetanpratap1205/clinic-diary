"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, MapPin, TrendingUp, Wallet, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AnimatedLogo } from "@/components/animated-logo";

const AUTH_ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "Incorrect email or password. Please try again.",
  "Email not confirmed": "Please verify your email address first. Check your inbox for the invite link.",
  "User not found": "No partner account found with this email. Contact your admin.",
  "Too many requests": "Too many attempts. Please wait a few minutes and try again.",
};

function mapAuthError(message: string): string {
  return AUTH_ERROR_MAP[message] ?? "Sign in failed. Please try again.";
}

function FieldPortalLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
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
      toast.success("Welcome back, Partner! 🎯");
      router.push("/field-portal");
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
        // After reset, partners land back on their portal login — not the doctor login
        redirectTo: `${window.location.origin}/auth/callback?next=/field-portal/login`,
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
      className="flex min-h-screen bg-white"
      style={{ minHeight: "100dvh", backgroundColor: "#ffffff" }}
    >
      {/* ── LEFT: Partner Brand Panel (desktop only) ───────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-blue-600/25 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />

        <div className="relative z-10 p-16 flex flex-col h-full justify-between">
          <AnimatedLogo theme="dark" size="lg" subLabel="Field Partner Portal" />

          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
              Grow your income.<br />One clinic at a time.
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
              Your dedicated portal to manage leads, track commissions, and hit your monthly targets — all in one place.
            </p>

            {/* Feature list */}
            <div className="flex flex-col gap-3 mt-8">
              {[
                { icon: MapPin,    label: "Manage your territory leads",              color: "text-blue-400"   },
                { icon: TrendingUp, label: "Track conversions & monthly targets",     color: "text-indigo-400" },
                { icon: Wallet,    label: "View commission earnings in real-time",     color: "text-emerald-400"},
                { icon: Zap,       label: "30% on first sale · 10% on renewals",      color: "text-amber-400"  },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md w-fit">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
            <span className="text-slate-300 text-sm">
              Access your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-black">
                NatureXpress Partner Dashboard
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Form Panel ─────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <AnimatedLogo theme="light" size="md" subLabel="Field Partner Portal" />
          </div>

          {/* Access denied banner */}
          {errorParam === "access_denied" && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 font-medium">
              ⚠️ You need a partner account to access the Field Portal. Please sign in below or contact your admin.
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Partner Sign In
            </h2>
            <p className="text-slate-500 font-medium">Access your NatureXpress partner dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="partner-email" className="text-sm font-bold text-slate-700">Email Address</Label>
              <Input
                id="partner-email"
                type="email"
                placeholder="partner@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                inputMode="email"
                className="h-12 text-base rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="partner-password" className="text-sm font-bold text-slate-700">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                >
                  {resetLoading ? "Sending…" : "Forgot Password?"}
                </button>
              </div>
              <div className="relative">
                <Input
                  id="partner-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 pr-12 text-base rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-colors tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In to Field Portal"}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Cross-links */}
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-slate-500">
              Are you a doctor / clinic?{" "}
              <Link href="/login" className="text-slate-900 font-bold hover:underline transition-all">
                Sign in here
              </Link>
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Don&apos;t have partner access?{" "}
              <span className="font-semibold text-slate-600">
                Contact your admin to send you an invite link.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FieldPortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      }
    >
      <FieldPortalLoginForm />
    </Suspense>
  );
}
