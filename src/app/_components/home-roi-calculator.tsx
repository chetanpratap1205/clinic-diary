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
    <div className="relative w-full max-w-4xl mx-auto mt-8 z-20">
      <div className="relative bg-white border border-slate-200/90 rounded-[32px] p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] overflow-hidden">
        
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          {/* Left Side: Sliders */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-[#0B132B] mb-2 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#00B7A8]" />
                Revenue Recovery Calculator
              </h3>
              <p className="text-slate-600 text-sm font-medium">
                Calculate how much revenue Doctor Diary recovers for your practice each month by eliminating no-shows.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-bold text-slate-700">Average Consultation Fee</label>
                  <span className="text-sm font-black text-[#00B7A8]">₹{fee.toLocaleString()}</span>
                </div>
                <Slider 
                  value={[fee]} 
                  min={200} 
                  max={5000} 
                  step={100}
                  onValueChange={(val) => setFee(val[0])}
                  className="[&_[role=slider]]:bg-[#00B7A8] [&_[role=slider]]:border-[#00B7A8]"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-bold text-slate-700">Patients Per Day</label>
                  <span className="text-sm font-black text-[#00B7A8]">{patientsPerDay}</span>
                </div>
                <Slider 
                  value={[patientsPerDay]} 
                  min={5} 
                  max={150} 
                  step={1}
                  onValueChange={(val) => setPatientsPerDay(val[0])}
                  className="[&_[role=slider]]:bg-[#00B7A8] [&_[role=slider]]:border-[#00B7A8]"
                />
              </div>
            </div>
          </div>

          {/* Right Side: Results Card */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-inner">
            <div className="space-y-6">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Estimated Monthly No-Show Loss</p>
                <p className="text-2xl font-bold text-slate-400 line-through decoration-red-500/60">
                  ₹{lostRevenueMonth.toLocaleString()}
                </p>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <p className="text-[#00B7A8] text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Recovered Revenue With Doctor Diary
                </p>
                <div className="text-3xl sm:text-4xl font-black text-[#0B132B] tracking-tight break-words">
                  +₹{recoveredRevenue.toLocaleString()}<span className="text-sm font-semibold text-slate-500"> / month</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">
                  Based on automated 24h & 2h WhatsApp appointment reminders.
                </p>
              </div>

              <Link href="/signup" className="block pt-2">
                <Button className="w-full h-12 bg-[#00B7A8] hover:bg-[#00998c] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2">
                  <span>Recover This Revenue Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
