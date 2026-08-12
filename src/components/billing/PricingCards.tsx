"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ShieldCheck, Sparkles, Loader2, Building2, PhoneCall, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PremiumIcon } from "@/components/ui/premium-icon";
import { toast } from "sonner";
import Script from "next/script";

import { PRICING_PLANS } from "@/lib/config/pricing";
import { EnterpriseContactModal } from "./EnterpriseContactModal";

const plans = Object.values(PRICING_PLANS);

const PLAN_RANKS: Record<string, number> = { quarterly: 1, yearly: 2, enterprise: 3 };

interface PricingCardsProps {
  activePlanId?: string;
  adminName?: string;
}

export function PricingCards({ activePlanId, adminName }: PricingCardsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<typeof plans[0] | null>(null);
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);

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

      {/* Enterprise Lead Modal */}
      <EnterpriseContactModal
        isOpen={isEnterpriseModalOpen}
        onClose={() => setIsEnterpriseModalOpen(false)}
        adminName={adminName}
      />
      
      <div className="text-center mb-12 space-y-4">
        {/* 14-Day Free Trial Hook Banner */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-teal-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-800 font-bold text-xs sm:text-sm shadow-xs backdrop-blur-md">
          <Gift className="w-4 h-4 text-emerald-600 animate-bounce" />
          <span>All Plans Include a <strong>14-Day Unlimited Free Trial</strong> — No Credit Card Required</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-sky-900 bg-clip-text text-transparent">
          Simple, Transparent Pricing
        </h2>
        <p className="text-slate-600 text-base max-w-2xl mx-auto">
          GST Invoice Provided. Cancel or upgrade anytime with zero hidden fees.
        </p>
        <div className="pt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
            ))}
          </div>
          Trusted by 500+ clinics across India
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {plans.map((plan, idx) => {
          const isEnterprise = plan.id === "enterprise";

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.5, type: "spring" }}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between h-full transition-all duration-300
                ${
                  plan.popular
                    ? "bg-slate-900 text-white shadow-2xl ring-2 ring-emerald-500/50 md:-translate-y-2"
                    : isEnterprise
                    ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-teal-500/30 shadow-xl"
                    : "bg-white text-slate-900 border border-slate-200/80 shadow-lg"
                }
              `}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-1 text-xs font-black text-slate-950 flex items-center gap-1 shadow-md uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  Most Popular
                </div>
              )}

              {isEnterprise && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-slate-800 border border-teal-500/40 px-4 py-1 text-xs font-bold text-teal-300 flex items-center gap-1.5 shadow-md uppercase tracking-wider">
                  <Building2 className="w-3.5 h-3.5 text-teal-400" />
                  Polyclinics & Hospitals
                </div>
              )}
              
              <div>
                <div className="mb-6 pt-2">
                  <h3 className={`text-xl font-bold ${plan.popular || isEnterprise ? "text-white" : "text-slate-900"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs sm:text-sm mt-2 min-h-[40px] ${plan.popular || isEnterprise ? "text-slate-300" : "text-slate-500"}`}>
                    {plan.description}
                  </p>
                </div>
                
                <div className="mb-6 flex items-baseline gap-2">
                  <span className={`text-4xl font-black tracking-tight ${plan.popular || isEnterprise ? "text-white" : "text-slate-900"}`}>
                    {isEnterprise ? plan.price : `₹${Math.round(plan.basePrice * 1.18).toLocaleString()}`}
                  </span>
                  <span className={`text-xs font-semibold ${plan.popular || isEnterprise ? "text-slate-400" : "text-slate-500"}`}>
                    {plan.duration}
                  </span>
                </div>
                {!isEnterprise ? (
                  <p className={`text-xs -mt-4 mb-6 ${plan.popular ? "text-slate-400" : "text-slate-400"}`}>incl. 18% GST (₹{plan.basePrice.toLocaleString()} base)</p>
                ) : (
                  <p className="text-xs -mt-4 mb-6 text-teal-400 font-semibold">Custom SLAs & Setup</p>
                )}

                <ul className="mb-8 space-y-3.5">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                      <Check className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.popular ? "text-emerald-400" : isEnterprise ? "text-teal-400" : "text-sky-600"}`} />
                      <span className={plan.popular || isEnterprise ? "text-slate-200" : "text-slate-700"}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {isEnterprise ? (
                  <Button
                    onClick={() => setIsEnterpriseModalOpen(true)}
                    className="w-full py-6 text-sm font-bold rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 shadow-md flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Contact Sales / Demo
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCheckoutPlan(plan)}
                    disabled={loading === plan.id || activePlanId === plan.id}
                    className={`w-full py-6 text-sm font-bold rounded-2xl transition-all ${
                      activePlanId === plan.id
                        ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700 shadow-none"
                        : (PLAN_RANKS[plan.id] || 0) < activeRank
                        ? "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        : plan.popular 
                        ? "bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 shadow-lg shadow-emerald-500/20" 
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                    }`}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : activePlanId === plan.id ? (
                      "Current Plan"
                    ) : (PLAN_RANKS[plan.id] || 0) < activeRank ? (
                      "Downgrade"
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                )}
                {!isEnterprise && activePlanId !== plan.id && (PLAN_RANKS[plan.id] || 0) >= activeRank && (
                  <p className={`text-[10px] text-center mt-2 ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                    14-day trial automatically applied if eligible
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-14 mx-auto max-w-2xl text-center p-6 bg-gradient-to-b from-sky-50/50 to-white rounded-3xl border border-sky-100 shadow-sm"
      >
        <div className="mb-4 flex justify-center">
          <PremiumIcon Icon={ShieldCheck} variant="default" size="xl" />
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-2">100% Money-Back Guarantee</h4>
        <p className="text-slate-600 text-sm leading-relaxed">
          Try our platform risk-free with your 14-day free trial. If you feel it&apos;s not useful after upgrading, we&apos;ll refund your money — <strong>no questions asked.</strong>
        </p>
      </motion.div>

      <Dialog open={!!checkoutPlan} onOpenChange={(open) => !open && !loading && setCheckoutPlan(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Order Summary</DialogTitle>
            <DialogDescription>
              Review your plan details before proceeding to Razorpay checkout.
            </DialogDescription>
          </DialogHeader>
          
          {checkoutPlan && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-semibold text-slate-900">{checkoutPlan.name} Plan</h4>
                  <p className="text-sm text-slate-500">{checkoutPlan.duration}</p>
                </div>
                <div className="font-semibold text-slate-900">₹{checkoutPlan.basePrice.toLocaleString()}</div>
              </div>
              
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>Base Price</span>
                <span>₹{checkoutPlan.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span>GST (18%)</span>
                <span>₹{(checkoutPlan.basePrice * 0.18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="font-bold text-xl text-slate-900">
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
