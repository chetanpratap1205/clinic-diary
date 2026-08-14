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
            <h3 className="text-lg font-bold text-[#0B132B] mb-2">Secure Data Encryption</h3>
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

        {/* Ecosystem Integrations Ribbon */}
        <div className="mt-20 border-t border-slate-200/60 pt-12 text-center relative z-10">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Natively integrated with the tools your patients already use</p>
          <div className="flex flex-wrap justify-center items-center gap-10 sm:gap-20 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-default">
            {/* WhatsApp */}
            <div className="flex items-center gap-2 font-black text-xl sm:text-2xl text-[#0B132B]">
              <svg className="w-7 h-7 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              WhatsApp
            </div>
            {/* Google */}
            <div className="flex items-center gap-2 font-black text-xl sm:text-2xl text-[#0B132B]">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </div>
            {/* UPI */}
            <div className="flex items-center gap-2 font-black text-xl sm:text-2xl text-[#0B132B]">
              <div className="px-2 py-0.5 rounded border-2 border-slate-800 tracking-tight">UPI</div>
              Payments
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
