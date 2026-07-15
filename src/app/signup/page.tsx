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
import { Loader2, Eye, EyeOff, Activity, Mail, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

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

      if (error) {
        toast.error(error.message);
        return;
      }

      // If email confirmation is disabled, user is signed in immediately
      if (data.session) {
        toast.success("Account created successfully!");
        router.push("/onboarding");
      } else {
        // Show email confirmation screen
        setNeedsConfirmation(true);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Email confirmation screen
  if (needsConfirmation) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-50 flex items-center justify-center p-4"
        style={{ minHeight: "100dvh" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center shadow-md overflow-hidden p-1">
                <img src="/icon-192.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-slate-900 text-xl tracking-tight">
                Doctor Diary
              </span>
            </Link>
          </div>

          <Card className="shadow-xl border-slate-200/60 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-8 pb-8 text-center">
              {/* Animated mail icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center mx-auto mb-6"
              >
                <Mail className="w-9 h-9 text-teal-600" />
              </motion.div>

              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
                Check your email
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed mb-2">
                We&apos;ve sent a verification link to
              </p>
              <p className="font-semibold text-slate-900 text-base mb-6 break-all">
                {email}
              </p>

              <div className="bg-teal-50 rounded-2xl p-4 mb-6 text-left space-y-2">
                {[
                  "Click the link in the email to verify your account",
                  "Then you'll be taken to set up your clinic profile",
                  "The link expires in 24 hours",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-teal-800 font-medium">{step}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Didn&apos;t receive it? Check your spam folder, or{" "}
                <button
                  className="text-teal-700 font-medium hover:underline"
                  onClick={async () => {
                    await supabase.auth.resend({
                      type: "signup",
                      email,
                    });
                    toast.success("Verification email resent!");
                  }}
                >
                  click to resend
                </button>
                .
              </p>

              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl border-slate-200 font-medium"
                >
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
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
              Start your digital <br/> clinic today.
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">
              Join thousands of doctors who have digitized their practice, saving hours every day and providing a premium experience to patients.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-white">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                  D{i}
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-slate-400">
              Trusted by 10,000+ top doctors across India.
            </p>
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
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Create an account</h2>
            <p className="text-slate-500 font-medium">Start managing your clinic efficiently.</p>
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
              <Label htmlFor="password" className="text-sm font-bold text-slate-700">Password</Label>
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
              <p className="text-xs text-slate-400 font-medium mt-1">Minimum 8 characters required</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-slate-900 font-bold hover:underline transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
