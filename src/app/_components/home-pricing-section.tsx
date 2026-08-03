"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CheckCircle, Sparkles, Building2, Gift, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnterpriseContactModal } from "@/components/billing/EnterpriseContactModal";

export function HomePricingSection() {
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);

  return (
    <section id="pricing" className="py-16 sm:py-32 px-4 sm:px-6 bg-[#0a0a0a] relative border-t border-white/5 overflow-hidden">
      <EnterpriseContactModal
        isOpen={isEnterpriseModalOpen}
        onClose={() => setIsEnterpriseModalOpen(false)}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          {/* 14-Day Free Trial Hook Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md border border-emerald-400/30 text-emerald-400 rounded-full px-5 py-2 text-sm font-bold mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Gift className="w-4 h-4 text-emerald-400 animate-bounce" />
            14-Day Unlimited Free Trial — No Credit Card Required
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
            An Investment That <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Pays For Itself.</span>
          </h2>
          <p className="text-slate-400 text-lg sm:text-xl leading-relaxed">
            The average clinic using Doctor Diary sees a <strong className="text-white font-bold">₹25,000 to ₹50,000</strong> increase in monthly revenue simply by eliminating no-shows and streamlining operations.
          </p>
        </div>
        
        {/* Starter Kit Unboxing Block */}
        <div className="mb-16 bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-emerald-500/30 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.1)] max-w-5xl mx-auto group">
          <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent -z-10 group-hover:from-emerald-500/20 transition-all duration-700" />
          <div className="w-24 h-24 rounded-2xl bg-[#151515] border border-white/10 shadow-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl" />
            <Sparkles className="w-10 h-10 text-emerald-400 relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </div>
          <div>
            <div className="inline-block bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 border border-emerald-500/20">Included Free (Worth ₹1,999)</div>
            <h3 className="text-2xl font-bold text-white mb-3">Premium Clinic Starter Kit</h3>
            <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
              Every subscription includes our physical onboarding kit shipped to your door: Premium Acrylic QR Stands, Weatherproof Shutters QR Decals, and live Dedicated Staff Training.
            </p>
          </div>
        </div>

        {/* 3-Tier Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* 1. Quarterly Plan */}
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] p-6 sm:p-8 hover:bg-[#111] transition-colors relative z-0 flex flex-col justify-between">
            <div>
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
                <h3 className="text-2xl font-bold text-white mt-1">Quarterly</h3>
              </div>
              <p className="text-sm text-slate-400 mb-6 min-h-[40px]">Perfect for getting started — lock in founding pricing before it increases.</p>
              
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">₹1,499</span>
                <span className="text-slate-500 text-sm font-medium">/ 3 mo</span>
              </div>
              <div className="mb-6 inline-block bg-white/5 text-slate-300 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-white/10">
                Less than ₹17/day for your clinic
              </div>
              <ul className="space-y-3.5 mb-8">
                {[
                  "14-Day Unlimited Free Trial",
                  "Unlimited Patients & Appointments",
                  "Free Premium Starter Kit",
                  "Smart WhatsApp & SMS Ready",
                  "Executive Analytics & Queue Manager"
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm font-medium">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" /> 
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/signup" className="block w-full">
              <Button variant="outline" className="w-full rounded-2xl bg-[#151515] border-white/10 text-white hover:bg-white/10 h-14 text-base font-bold">
                Start 14-Day Free Trial
              </Button>
            </Link>
          </div>

          {/* 2. Annual Plan (Dominant) */}
          <div className="bg-[#050505] rounded-[32px] p-[2px] relative z-10 transform md:-translate-y-2 shadow-[0_30px_100px_rgba(16,185,129,0.25)] group transition-all duration-500 flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-[32px] opacity-100" />
            
            <div className="bg-[#0A0A0A] rounded-[30px] p-6 sm:p-8 relative h-full w-full overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
              
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Most Popular</span>
                  <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Best Value
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white">Annual</h3>
                <p className="text-sm text-emerald-100/60 mb-6 min-h-[40px]">Maximum ROI, plus your area exclusivity locked in as a founding clinic.</p>
                
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">₹4,999</span>
                  <span className="text-slate-400 text-sm font-medium">/ yr</span>
                </div>
                
                <div className="mb-6 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-500/30">
                  <span>☕</span> Less than ₹14/day. (Cheaper than chai)
                </div>
                
                <ul className="space-y-3.5 mb-8 relative z-10">
                  {[
                    "14-Day Unlimited Free Trial",
                    "Everything in Quarterly",
                    "Dedicated Account Manager",
                    "Area Exclusivity Rights Locked",
                    "Priority WhatsApp Support Channel"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-white text-sm font-semibold">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/signup" className="block w-full relative z-10">
                <Button className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black h-14 text-base shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </div>
          </div>

          {/* 3. Enterprise & Polyclinics */}
          <div className="bg-[#0c141d] border border-teal-500/30 rounded-[32px] p-6 sm:p-8 hover:border-teal-400/50 transition-colors relative z-0 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Scale</span>
                <Building2 className="w-5 h-5 text-teal-400" />
              </div>

              <h3 className="text-2xl font-bold text-white">Enterprise</h3>
              <p className="text-sm text-slate-400 mb-6 min-h-[40px]">For multi-doctor practices, polyclinics & small hospitals.</p>
              
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-white">Custom</span>
                <span className="text-teal-400 text-xs font-bold">starting ₹14,999/yr</span>
              </div>
              
              <div className="mb-6 inline-block bg-teal-500/10 text-teal-300 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-teal-500/20">
                Tailored SLAs & Multi-Doctor Setup
              </div>
              
              <ul className="space-y-3.5 mb-8">
                {[
                  "Multi-Doctor Queue & Staff Switcher",
                  "Role-Based Access (Doctors, Reception, Pharmacy)",
                  "Custom WhatsApp Sender Branding",
                  "White-Glove Concierge Data Migration",
                  "24/7 VIP Priority Phone Support"
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-200 text-sm font-medium">
                    <Check className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" /> 
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => setIsEnterpriseModalOpen(true)}
              className="w-full rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 h-14 text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20"
            >
              <PhoneCall className="w-4 h-4" />
              Contact Sales / Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
