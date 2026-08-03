"use client";

import { ShieldCheck, Lock, Server, FileCheck, Award } from "lucide-react";

export function EnterpriseSecurityGrid() {
  return (
    <section className="py-24 px-4 sm:px-6 bg-white border-t border-slate-200/80 relative overflow-hidden">
      {/* Ambient soft glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-[#00B7A8] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-4">
            <ShieldCheck className="w-4 h-4" /> Enterprise-Grade Trust Infrastructure
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0B132B] mb-6 tracking-tight">
            Built Like Bank Software.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-600 to-[#00897B]">
              Owned 100% By Your Practice.
            </span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-medium">
            Doctor Diary is engineered on high-resilience medical cloud infrastructure. We provide the enterprise backbone while you retain complete sovereignty over your patients and data.
          </p>
        </div>

        {/* 4 Enterprise Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Data Sovereignty */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0B132B] mb-2">100% Patient Data Ownership</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Your patient database is encrypted and locked strictly to your clinic. Unlike aggregator apps, we never sell, share, or market to your patients.
            </p>
          </div>

          {/* Card 2: Security & Encryption */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0B132B] mb-2">NABH & HIPAA Compliant</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              End-to-end 256-bit AES encryption for all prescriptions, records, and billing data with automated daily multi-region cloud backups.
            </p>
          </div>

          {/* Card 3: Uptime SLA */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0B132B] mb-2">99.99% Uptime Guarantee</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Hosted on redundant cloud nodes ensuring zero clinic interruption during peak consulting hours, even on slow mobile data connections.
            </p>
          </div>

          {/* Card 4: Legal 0% Cut Contract */}
          <div className="bg-[#F8FAFC] border border-slate-200/90 hover:border-emerald-500/40 rounded-3xl p-6 transition-all duration-300 group shadow-sm hover:shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#00B7A8] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0B132B] mb-2">Contractual 0% Cut SLA</h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
              Our terms legally guarantee that Doctor Diary operates purely as software infrastructure. All patient payments route directly to your bank account.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
