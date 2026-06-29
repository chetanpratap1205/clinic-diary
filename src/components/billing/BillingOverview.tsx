"use client";

import { motion } from "framer-motion";
import { AlertCircle, Calendar, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UsageMetrics } from "./UsageMetrics";
import { format, differenceInDays } from "date-fns";

type Subscription = {
  id: string;
  planId: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
};

interface BillingOverviewProps {
  activeSub: Subscription | null;
  appointmentCount: number;
  totalPaid: number;
}

const PLANS = {
  monthly: { price: "₹499", name: "1 Month Plan", duration: "/ month" },
  quarterly: { price: "₹1299", name: "3 Months Plan", duration: "/ 3 months" },
  yearly: { price: "₹4999", name: "12 Months Plan", duration: "/ 12 months" },
};

export function BillingOverview({ activeSub, appointmentCount, totalPaid }: BillingOverviewProps) {
  const planDetails = activeSub ? PLANS[activeSub.planId as keyof typeof PLANS] : null;

  const renewalDate = activeSub?.currentPeriodEnd
    ? format(new Date(activeSub.currentPeriodEnd), "MMMM dd, yyyy")
    : null;

  const daysUntilRenewal = activeSub?.currentPeriodEnd
    ? differenceInDays(new Date(activeSub.currentPeriodEnd), new Date())
    : null;

  const isRenewalSoon = daysUntilRenewal !== null && daysUntilRenewal <= 5 && daysUntilRenewal >= 0;
  const isExpired = daysUntilRenewal !== null && daysUntilRenewal < 0;

  return (
    <div className="space-y-6">
      {/* Alert for expired plan */}
      {isExpired && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Plan Expired</AlertTitle>
            <AlertDescription>
              Your {planDetails?.name} expired on {renewalDate}. Please renew immediately to avoid disruption of services.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Alert for upcoming renewal */}
      {isRenewalSoon && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Alert variant="warning" className="border-orange-200 bg-orange-50 text-orange-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Renewal Approaching</AlertTitle>
            <AlertDescription>
              Your {planDetails?.name} is set to renew in {daysUntilRenewal} days on {renewalDate}.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="relative overflow-hidden border-0 shadow-xl shadow-slate-900/10 h-full bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-white font-bold tracking-tight">Current Plan</CardTitle>
                  <CardDescription className="mt-1 text-slate-300 font-medium">
                    {activeSub ? `You are currently on the ${planDetails?.name}` : "You don't have an active subscription"}
                  </CardDescription>
                </div>
                {activeSub && activeSub.status === "active" && (
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex gap-1.5 items-center px-3 py-1 shadow-inner backdrop-blur-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              {activeSub ? (
                <>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-black tracking-tight text-white drop-shadow-sm">
                      {planDetails?.price}
                    </span>
                    <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{planDetails?.duration}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-slate-200 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-sm transition-all hover:bg-white/15">
                      <div className="bg-white/20 p-2.5 rounded-xl text-white shadow-inner">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Next billing date</span>
                        <span className="font-semibold text-white tracking-wide">{renewalDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-200 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shadow-sm transition-all hover:bg-white/15">
                      <div className="bg-white/20 p-2.5 rounded-xl text-white shadow-inner">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-0.5">Payment method</span>
                        <span className="font-semibold text-white tracking-wide">Razorpay</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-300 bg-white/5 backdrop-blur-sm rounded-2xl border border-dashed border-white/20 mt-4 shadow-inner">
                  <div className="bg-white/10 p-4 rounded-full mb-4">
                    <Sparkles className="w-8 h-8 text-slate-200" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-1">No Active Plan</h4>
                  <p className="max-w-[250px] text-sm font-medium">Upgrade to a premium plan to unlock all features and grow your clinic.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <UsageMetrics planId={activeSub?.planId || "free"} appointmentCount={appointmentCount} totalPaid={totalPaid} />
        </motion.div>
      </div>
    </div>
  );
}
