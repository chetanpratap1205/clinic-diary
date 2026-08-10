"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getLoginRedirectPath } from "@/app/login/actions";
import { motion } from "framer-motion";

export default function StaffLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleStaffLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!email || !password) {
        toast.error("Please enter your staff email and password.");
        setLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        toast.error("Invalid staff credentials. Please check email and password.");
        setLoading(false);
        return;
      }

      // Check role redirection
      const redirectPath = await getLoginRedirectPath();

      // Ensure that non-staff users (e.g. doctors) cannot access internal portal via staff login
      if (redirectPath === "/dashboard") {
        await supabase.auth.signOut();
        toast.error("Access denied. This portal is strictly for internal staff & administrators.");
        setLoading(false);
        return;
      }

      toast.success("Authenticated successfully. Redirecting to Staff Console...");
      window.location.href = redirectPath;
    } catch {
      toast.error("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden text-slate-100"
      style={{ minHeight: "100dvh" }}
    >
      {/* Subtle Grid Background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        {/* Top Header Banner */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 sm:p-8 text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/5">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Doctor Diary Staff Console
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Restricted access for internal employees & management
          </p>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-4 mb-2">
               <p className="text-xs text-teal-200 leading-relaxed">
                 <strong>Welcome Team!</strong> Please log in using the email and initial password provided by your administrator. 
               </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-email" className="text-xs font-bold text-slate-300">
                Staff Email Address
              </Label>
              <Input
                id="staff-email"
                type="email"
                placeholder="name@naturexpress.in or staff email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 text-sm rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 focus:bg-slate-950 focus:border-teal-500/50 focus:ring-teal-500/20 transition-all px-4"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="staff-password" className="text-xs font-bold text-slate-300">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="staff-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter staff password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-12 pr-11 text-sm rounded-xl bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 focus:bg-slate-950 focus:border-teal-500/50 focus:ring-teal-500/20 transition-all px-4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                className="w-full h-12 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/20 transition-all active:scale-[0.98]"
                disabled={loading || !email || password.length < 6}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" /> Sign In to Staff Console
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <div className="border-t border-slate-800/80 bg-slate-950/50 px-6 py-4 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            Doctor logging into clinic?{" "}
            <a href="/login" className="text-teal-400 hover:underline font-semibold">
              Go to Doctor Portal ↗
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
