"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function HomeRoiCalculator() {
  const [fee, setFee] = useState(800);
  const [patientsPerDay, setPatientsPerDay] = useState(30);

  // Assumptions
  const workingDays = 26; // per month
  const averageNoShowRate = 0.15; // 15% industry average without automated reminders
  const recoveredRate = 0.85; // We recover 85% of those no-shows

  const totalPatientsMonth = patientsPerDay * workingDays;
  const lostPatientsMonth = Math.round(totalPatientsMonth * averageNoShowRate);
  const lostRevenueMonth = lostPatientsMonth * fee;
  
  const recoveredPatients = Math.round(lostPatientsMonth * recoveredRate);
  const recoveredRevenue = recoveredPatients * fee;

  return (
    <div className="relative w-full max-w-4xl mx-auto mt-16 z-20">
      {/* Glow behind the calculator */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[32px] blur opacity-20 animate-pulse" />
      
      <div className="relative bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl overflow-hidden">
        
        {/* Subtle inner top glow */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Sliders */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
                Revenue Recovery Calculator
              </h3>
              <p className="text-slate-400 text-sm">
                See exactly how much you are losing to no-shows and how much Doctor Diary recovers for you automatically.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-300">Average Consultation Fee</label>
                  <span className="text-sm font-bold text-emerald-400">₹{fee.toLocaleString()}</span>
                </div>
                <Slider 
                  value={[fee]} 
                  min={200} 
                  max={5000} 
                  step={100}
                  onValueChange={(val) => setFee(val[0])}
                  className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-400"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-slate-300">Patients Per Day</label>
                  <span className="text-sm font-bold text-emerald-400">{patientsPerDay}</span>
                </div>
                <Slider 
                  value={[patientsPerDay]} 
                  min={5} 
                  max={150} 
                  step={1}
                  onValueChange={(val) => setPatientsPerDay(val[0])}
                  className="[&_[role=slider]]:bg-emerald-500 [&_[role=slider]]:border-emerald-400"
                />
              </div>
            </div>
          </div>

          {/* Right Side: Results */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -z-10" />
            
            <div className="space-y-6">
              <div>
                <p className="text-slate-400 text-sm mb-1">Your current lost revenue (monthly)</p>
                <p className="text-2xl font-semibold text-slate-300 line-through decoration-red-500/50">
                  ₹{lostRevenueMonth.toLocaleString()}
                </p>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Monthly Revenue Recovered
                </p>
                <div className="text-5xl font-black text-white tracking-tighter">
                  +₹{recoveredRevenue.toLocaleString()}
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  Based on 85% recovery rate using 24/7 automated WhatsApp reminders.
                </p>
              </div>

              <Link href="/signup" className="block mt-4">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                  Start Recovering Revenue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
