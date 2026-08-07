"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { changeInitialPin } from "@/app/actions/change-pin";
import { motion, AnimatePresence } from "framer-motion";

interface ForcePasswordChangeModalProps {
  isOpen: boolean;
}

export function ForcePasswordChangeModal({ isOpen }: ForcePasswordChangeModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await changeInitialPin(password);
      if (res.error) {
        toast.error(res.error);
      } else {
        setSuccess(true);
        toast.success("Security PIN updated successfully!");
        // Refresh the page after a short delay to dismiss the modal via server layout
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      toast.error("Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen && !success) return null;

  return (
    <AnimatePresence>
      {(isOpen || success) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative"
          >
            {/* Ambient glows */}
            <div className="absolute top-[-50px] left-[-50px] w-[150px] h-[150px] bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-8 relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  {success ? (
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <Lock className="w-8 h-8 text-emerald-400" />
                  )}
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {success ? "Secured!" : "Secure Your Account"}
                </h2>
                <p className="text-slate-400 text-sm">
                  {success 
                    ? "Your account is now secure. Loading your dashboard..."
                    : "For your security, please replace your temporary PIN with a strong, private password."}
                </p>
              </div>

              {!success && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pass" className="text-slate-300 ml-1">New Password</Label>
                    <Input
                      id="new-pass"
                      type="password"
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-slate-950 border-slate-800 text-white h-12 rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all px-4"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-pass" className="text-slate-300 ml-1">Confirm Password</Label>
                    <Input
                      id="confirm-pass"
                      type="password"
                      placeholder="Type it again"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-slate-950 border-slate-800 text-white h-12 rounded-xl focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all px-4"
                    />
                  </div>
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={loading || password.length < 6 || password !== confirmPassword}
                      className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Secure My Account"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
