"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { getLoginRedirectPath } from "./actions";

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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(mapAuthError(error.message));
        return;
      }

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
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
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
    <div className="min-h-screen flex bg-white" style={{ minHeight: "100dvh" }}>
      {/* LEFT: Art / Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden">
        {/* Abstract Dark UI Elements */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-500/20 blur-[120px]" />
        
        <div className="relative z-10 p-16 flex flex-col h-full justify-between">
          <Link href="/" className="inline-flex items-center gap-3 w-fit">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-lg overflow-hidden p-1">
              <img src="/icon-192.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-white text-2xl tracking-tight">
              Doctor Diary
            </span>
          </Link>

          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-6 tracking-tight">
              Manage your clinic <br/> with zero friction.
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">
              Join thousands of doctors who have digitized their practice, saving hours every day and providing a premium experience to patients.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-white">
             <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
               <div className="flex items-center justify-center">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
               </div>
               <div className="text-slate-300 text-sm">
                 Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-black">1,200+ Top Clinics</span> delivering premium care.
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-md overflow-hidden p-1">
                <img src="/icon-192.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-slate-900 text-xl tracking-tight">
                Doctor Diary
              </span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome back</h2>
            <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="dr.sharma@clinic.com"
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
                <Label htmlFor="password" className="text-sm font-bold text-slate-700">Password</Label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetLoading}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors disabled:opacity-50"
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
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-slate-900 font-bold hover:underline transition-all">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
