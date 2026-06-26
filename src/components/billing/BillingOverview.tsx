"use client";

import { motion } from "framer-motion";
import { AlertCircle, Calendar, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UsageMetrics } from "./UsageMetrics";

export function BillingOverview() {
  // Mock data for the demonstration
  const activePlan = {
    name: "3 Months Plan",
    price: "₹1299",
    status: "active",
    renewalDate: "July 26, 2026",
    daysUntilRenewal: 30, // For alert demonstration, let's say 3 days if we want to show it, or keep it normal
  };

  const isRenewalSoon = activePlan.daysUntilRenewal <= 5;

  return (
    <div className="space-y-6">
      {/* Alert for upcoming renewal */}
      {isRenewalSoon && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Alert variant="warning" className="border-orange-200 bg-orange-50 text-orange-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Renewal Approaching</AlertTitle>
            <AlertDescription>
              Your {activePlan.name} is set to renew in {activePlan.daysUntilRenewal} days on {activePlan.renewalDate}.
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
                  <CardDescription className="mt-1">You are currently on the {activePlan.name}</CardDescription>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 flex gap-1 items-center px-3 py-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold tracking-tight text-gray-900">{activePlan.price}</span>
                <span className="text-sm font-medium text-gray-500">/ 3 months</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <Calendar className="w-4 h-4 text-sky-500" />
                  <span>Next billing date: <strong className="text-gray-900">{activePlan.renewalDate}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <CreditCard className="w-4 h-4 text-sky-500" />
                  <span>Payment method: <strong className="text-gray-900">Razorpay</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <UsageMetrics />
        </motion.div>
      </div>
    </div>
  );
}
