"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CheckCircle, Sparkles, Building2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnterpriseContactModal } from "@/components/billing/EnterpriseContactModal";

export function HomePricingSection() {
  const [isEnterpriseModalOpen, setIsEnterpriseModalOpen] = useState(false);

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 bg-[#FAFBFC] relative border-t border-slate-200/80 overflow-hidden">
      <EnterpriseContactModal
        isOpen={isEnterpriseModalOpen}
        onClose={() => setIsEnterpriseModalOpen(false)}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          {/* 14-Day Free Trial Hook Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-5 py-2 text-sm font-bold mb-6 shadow-sm">
            <Gift className="w-4 h-4 text-[#00B7A8]" />
            14-Day Unlimited Free Trial — No Credit Card Required
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0B132B] mb-6 tracking-tight">
            An Investment That <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">Pays For Itself.</span>
          </h2>
          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed mb-8 font-medium">
            The average clinic using Doctor Diary sees a <strong className="text-[#0B132B] font-bold">₹25,000 to ₹50,000</strong> increase in monthly revenue simply by eliminating no-shows and streamlining operations.
          </p>

          {/* Founding License Rate Lock Guarantee */}
          <div className="max-w-md mx-auto bg-[#F8FAFC] border border-emerald-100 p-4 rounded-2xl text-center">
            <p className="text-xs text-slate-600 font-medium">
              ⚡ <strong>Rate Lock Guarantee</strong>: Start your trial today to lock in your founding price for life.
            </p>
          </div>
        </div>
        
        {/* Starter Kit Unboxing Block */}
        <div className="mb-16 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-xl max-w-5xl mx-auto group">
          <div className="w-20 h-20 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] shadow-inner flex items-center justify-center flex-shrink-0 relative overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
            <Sparkles className="w-9 h-9 text-[#00B7A8]" />
          </div>
          <div>
            <div className="inline-block bg-emerald-50 text-[#00B7A8] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 border border-emerald-200">Included Free (Worth ₹1,999)</div>
            <h3 className="text-2xl font-bold text-[#0B132B] mb-2">Premium Clinic Starter Kit</h3>
            <p className="text-slate-600 text-base max-w-2xl leading-relaxed font-medium">
              Every subscription includes our physical onboarding kit shipped to your door: Premium Acrylic QR Stands, Weatherproof Shutters QR Decals, and live Dedicated Staff Training.
            </p>
          </div>
        </div>

        {/* 3-Tier Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* 1. Quarterly Plan */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 hover:shadow-xl transition-all relative z-0 flex flex-col justify-between shadow-md">
            <div>
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
                <h3 className="text-2xl font-bold text-[#0B132B] mt-1">Quarterly</h3>
              </div>
              <p className="text-sm text-slate-500 mb-6 min-h-[40px] font-medium">Perfect for getting started — lock in founding pricing before it increases.</p>
              
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#0B132B]">₹1,499</span>
                <span className="text-slate-500 text-sm font-semibold">/ 3 mo</span>
              </div>
              <div className="mb-6 inline-block bg-slate-100 text-slate-700 text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-slate-200">
                Billed quarterly
              </div>
              <ul className="space-y-3.5 mb-8">
                {[
                  "14-Day Unlimited Free Trial",
                  "Unlimited Patients & Appointments",
                  "Free Premium Starter Kit",
                  "Smart WhatsApp & SMS Ready",
                  "Executive Analytics & Queue Manager"
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                    <Check className="w-4 h-4 text-[#00B7A8] flex-shrink-0 mt-0.5" /> 
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/signup" className="block w-full">
              <Button variant="outline" className="w-full rounded-2xl bg-slate-100 border-slate-200 text-[#0B132B] hover:bg-slate-200 h-14 text-base font-bold">
                Start 14-Day Free Trial
              </Button>
            </Link>
          </div>

          {/* 2. Annual Plan (Dominant) */}
          <div className="bg-white rounded-[32px] p-6 sm:p-8 border-2 border-[#00B7A8] shadow-[0_20px_50px_rgba(0,183,168,0.18)] relative z-10 transform md:-translate-y-2 flex flex-col justify-between">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-[#00B7A8] text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest shadow-md">
              Most Popular • Best Value
            </div>

            <div>
              <div className="mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00B7A8]">Founding License Lock</span>
                <h3 className="text-3xl font-black text-[#0B132B] mt-1">Annual</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6 min-h-[40px] font-medium">Maximum ROI, plus your area exclusivity locked in as a founding clinic.</p>
              
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-5xl font-black text-[#0B132B] tracking-tight">₹4,999</span>
                <span className="text-slate-500 text-sm font-semibold">/ yr</span>
              </div>
              
              <div className="mb-6 inline-flex items-center gap-2 bg-emerald-50 text-[#00B7A8] text-xs font-bold px-3.5 py-2 rounded-xl border border-emerald-200">
                ⭐ Save ₹997 compared to quarterly
              </div>
              
              <ul className="space-y-3.5 mb-8">
                {[
                  "14-Day Unlimited Free Trial",
                  "Everything in Quarterly",
                  "Dedicated Account Manager",
                  "Area Exclusivity Rights Locked",
                  "Priority WhatsApp Support Channel"
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#0B132B] text-sm font-semibold">
                    <CheckCircle className="w-4 h-4 text-[#00B7A8] flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link href="/signup" className="block w-full">
              <Button className="w-full rounded-2xl bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold h-14 text-base shadow-[0_8px_25px_rgba(0,183,168,0.35)]">
                Start 14-Day Free Trial
              </Button>
            </Link>
          </div>

          {/* 3. Enterprise & Polyclinics */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 sm:p-8 hover:shadow-xl transition-all relative z-0 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Scale</span>
                <Building2 className="w-5 h-5 text-slate-600" />
              </div>

              <h3 className="text-2xl font-bold text-[#0B132B]">Enterprise</h3>
              <p className="text-sm text-slate-500 mb-6 min-h-[40px] font-medium">For multi-doctor practices, polyclinics & small hospitals.</p>
              
              <div className="mb-4 flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#0B132B]">Custom</span>
                <span className="text-[#00B7A8] text-xs font-bold">starting ₹14,999/yr</span>
              </div>
              
              <div className="mb-6 inline-block bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-xl border border-slate-200">
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
                  <li key={i} className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                    <Check className="w-4 h-4 text-[#00B7A8] flex-shrink-0 mt-0.5" /> 
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => setIsEnterpriseModalOpen(true)}
              variant="outline"
              className="w-full rounded-2xl bg-slate-100 border-slate-200 text-[#0B132B] hover:bg-slate-200 h-14 text-base font-bold"
            >
              Contact Sales Team
            </Button>
          </div>
        </div>

        {/* Static ROI Line Card */}
        <div className="mt-16 max-w-2xl mx-auto bg-slate-50 border border-slate-200 rounded-[2rem] p-6 sm:p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-[#0B132B] mb-2 uppercase tracking-wider">The Economics of a Calmer Clinic</p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            For a doctor seeing 30 patients/day with an average ₹500 fee:<br />
            Recovering just <strong className="text-slate-900 font-bold">2 no-shows per month</strong> pays back your Doctor Diary subscription. Everything else is pure practice growth.
          </p>
        </div>
      </div>
    </section>
  );
}
