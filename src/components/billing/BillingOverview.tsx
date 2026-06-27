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
          <Card className="relative overflow-hidden border-sky-100 shadow-sm h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles className="w-32 h-32 text-sky-500" />
            </div>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-gray-900">Current Plan</CardTitle>
                  <CardDescription className="mt-1">
                    {activeSub ? `You are currently on the ${planDetails?.name}` : "You don't have an active subscription"}
                  </CardDescription>
                </div>
                {activeSub && activeSub.status === "active" && (
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 flex gap-1 items-center px-3 py-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {activeSub ? (
                <>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-black tracking-tight text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                      {planDetails?.price}
                    </span>
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{planDetails?.duration}</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-sky-100/50 shadow-sm transition-all hover:shadow-md">
                      <div className="bg-sky-100 p-2 rounded-lg text-sky-600">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Next billing date</span>
                        <span className="font-semibold">{renewalDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-sky-100/50 shadow-sm transition-all hover:shadow-md">
                      <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">Payment method</span>
                        <span className="font-semibold">Razorpay</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 mt-4">
                  <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-700 mb-1">No Active Plan</h4>
                  <p className="max-w-[250px] text-sm">Upgrade to a premium plan to unlock all features and grow your clinic.</p>
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
