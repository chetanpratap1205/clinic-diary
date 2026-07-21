"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PremiumIcon } from "@/components/ui/premium-icon";
import { toast } from "sonner";
import Script from "next/script";

const plans = [
  {
    id: "quarterly",
    name: "Quarterly",
    price: "₹1,499",
    basePrice: 1499,
    duration: "per 3 months",
    description: "Perfect for getting started and testing the waters.",
    features: [
      "One Complete Product",
      "Unlimited Patients & Appointments",
      "Free Premium Starter Kit",
      "Smart WhatsApp & SMS Ready",
      "Executive Analytics",
    ],
    popular: false,
  },
  {
    id: "yearly",
    name: "Annual",
    price: "₹4,999",
    basePrice: 4999,
    duration: "per year",
    description: "Maximum ROI for established clinics.",
    features: [
      "Everything in Quarterly",
      "Dedicated Account Manager",
      "Priority Support Channel",
      "Annual Performance Reviews",
    ],
    popular: true,
  },
];

const PLAN_RANKS: Record<string, number> = { quarterly: 1, yearly: 2 };

interface PricingCardsProps {
  activePlanId?: string;
  adminName?: string;
}

export function PricingCards({ activePlanId, adminName }: PricingCardsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<typeof plans[0] | null>(null);
  const activeRank = activePlanId ? PLAN_RANKS[activePlanId] || 0 : 0;

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId);
      
      // 1. Create order on our backend
      const res = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "Doctor Diary",
        description: "Clinic Management Subscription",
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Verify payment on success
          const verifyRes = await fetch("/api/billing/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...response,
              planId,
            }),
          });
          
          if (verifyRes.ok) {
            toast.success("Subscription successful! Your account is upgraded.");
            setTimeout(() => window.location.reload(), 1500);
          } else {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: adminName || "Clinic Admin",
          // email: "admin@clinic.com",
          // contact: "9999999999"
        },
        theme: {
          color: "#0ea5e9",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        toast.error(`Payment Failed: ${response.error.description}`);
      });
      
      rzp1.open();

    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Simple, No Hidden Cost
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          GST Invoice Provided. No long-term lock-in.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
        {plans.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15, duration: 0.5, type: "spring" }}
            className={`relative rounded-3xl bg-white p-8 shadow-xl ring-1 ring-gray-900/10 flex flex-col h-full 
              ${plan.popular ? "md:scale-105 border-2 border-primary ring-0 shadow-2xl z-10" : ""}
            `}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-1 text-sm font-medium text-white flex items-center gap-1 shadow-md">
                <Sparkles strokeWidth={1.5} className="w-4 h-4" />
                Best Value
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-2 h-10">{plan.description}</p>
            </div>
            
            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-gray-900">{plan.price}</span>
              <span className="text-sm font-semibold text-gray-500">{plan.duration}</span>
            </div>
            <p className="text-xs text-gray-400 -mt-4 mb-6">+ 18% GST</p>

            <ul className="mb-8 flex-1 space-y-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <Check strokeWidth={1.5} className="h-5 w-5 text-sky-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => setCheckoutPlan(plan)}
              disabled={loading === plan.id || activePlanId === plan.id}
              className={`w-full py-6 text-base font-semibold rounded-xl transition-all ${
                activePlanId === plan.id
                ? "bg-slate-100 text-slate-500 hover:bg-slate-100 cursor-not-allowed border border-slate-200 shadow-none"
                : (PLAN_RANKS[plan.id] || 0) < activeRank
                ? "bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                : plan.popular 
                ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg border-none" 
                : "bg-gray-900 hover:bg-gray-800 text-white border-none"
              }`}
            >
              {loading === plan.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : activePlanId === plan.id ? (
                "Current Plan"
              ) : (PLAN_RANKS[plan.id] || 0) < activeRank ? (
                "Downgrade"
              ) : (
                "Upgrade Now"
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-16 mx-auto max-w-2xl text-center p-6 bg-gradient-to-b from-sky-50/50 to-white rounded-3xl border border-sky-100 shadow-sm"
      >
        <div className="mb-4 flex justify-center">
          <PremiumIcon Icon={ShieldCheck} variant="default" size="xl" />
        </div>
        <h4 className="text-xl font-semibold text-gray-900 mb-2">100% Money-Back Guarantee</h4>
        <p className="text-gray-600">
          Try our premium features risk-free for your first month. If you feel it&apos;s not useful, we&apos;ll refund your money — <strong>no questions asked.</strong>
        </p>
      </motion.div>

      <Dialog open={!!checkoutPlan} onOpenChange={(open) => !open && !loading && setCheckoutPlan(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Order Summary</DialogTitle>
            <DialogDescription>
              Review your plan details before proceeding to payment.
            </DialogDescription>
          </DialogHeader>
          
          {checkoutPlan && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <h4 className="font-semibold text-gray-900">{checkoutPlan.name} Plan</h4>
                  <p className="text-sm text-gray-500">{checkoutPlan.duration}</p>
                </div>
                <div className="font-semibold text-gray-900">₹{checkoutPlan.basePrice.toLocaleString()}</div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Base Price</span>
                <span>₹{checkoutPlan.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>GST (18%)</span>
                <span>₹{(checkoutPlan.basePrice * 0.18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="font-bold text-xl text-gray-900">
                  ₹{(checkoutPlan.basePrice * 1.18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between gap-3 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setCheckoutPlan(null)}
              disabled={loading !== null}
              className="w-full sm:w-auto rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => checkoutPlan && handleSubscribe(checkoutPlan.id)} 
              disabled={loading !== null}
              className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md rounded-xl border-none"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Processing..." : "Proceed to Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
