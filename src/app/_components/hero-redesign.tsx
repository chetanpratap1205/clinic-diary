"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Play, Star, Calendar, MessageSquare, TrendingUp, ChevronRight, CheckCircle2, Shield, Cloud, Users, Clock, Zap } from "lucide-react";

export function HeroRedesign() {
  return (
    <section 
      className="relative w-full bg-[#FAFBFC] overflow-hidden min-h-[100dvh] lg:h-[100dvh] lg:min-h-[700px] lg:max-h-[950px] flex flex-col justify-between pt-20 lg:pt-20 group/section"
    >
      
      {/* Subtle Background Pattern & Mouse Glow */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 opacity-0 group-hover/section:opacity-100 transition-opacity duration-1000 pointer-events-none mix-blend-multiply" />

      {/* Main Content Grid */}
      <div className="w-full max-w-[1600px] mx-auto relative z-10 flex flex-col lg:flex-row items-stretch flex-grow h-full">
        
        {/* Left Column: Content */}
        <div className="w-full lg:w-[45%] flex flex-col text-left shrink-0 z-20 px-4 sm:px-8 lg:pl-12 lg:pr-8 pt-8 lg:pt-0 pb-8 lg:pb-10 lg:h-full relative">
          
          <div className="flex flex-col justify-center max-w-xl mx-auto lg:mx-0 lg:my-auto pt-2 lg:pt-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[40px] sm:text-[46px] lg:text-[48px] xl:text-[52px] font-black text-[#0B132B] leading-[1.05] tracking-tight mb-2 lg:mb-3"
            >
              Stop Sharing Patients.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00B7A8] via-emerald-400 to-[#00B7A8] animate-text-gradient pb-1 inline-block">Build a Premium Clinic.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[14px] sm:text-[16px] text-[#334155] mb-4 lg:mb-5 max-w-md leading-relaxed"
            >
              Deliver a 5-star patient experience that naturally grows your practice. Get your own custom app, zero-chaos queue management, and keep 100% of your revenue.
            </motion.p>

            {/* Urgency Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[10px] font-bold uppercase tracking-wider mb-4 lg:mb-5"
            >
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Secure your area before competitors do
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-start gap-3 w-full sm:w-auto mb-4 lg:mb-5"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="relative overflow-hidden w-full sm:w-auto bg-[#00B7A8] hover:bg-[#00998c] text-white h-14 px-7 text-base font-bold rounded-lg transition-all flex items-center gap-2 group shadow-[0_4px_14px_0_rgba(0,183,168,0.39)] hover:shadow-[0_8px_25px_rgba(0,183,168,0.5)]"
                  >
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                    <Star className="w-5 h-5 fill-current relative z-10" />
                    <span className="relative z-10">Start 14-Day Free Trial</span>
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform relative z-10" />
                  </Button>
                </Link>
                
                <Link href="/demo" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto bg-white border-[#E5E7EB] text-[#0B132B] hover:bg-[#F8FAFC] h-14 px-8 text-base font-bold rounded-lg transition-all flex items-center gap-2 group shadow-sm"
                  >
                    <div className="bg-[#0B132B]/5 rounded-full p-1">
                      <Play className="w-3.5 h-3.5 fill-[#0B132B]" />
                    </div>
                    Watch 2-min Demo
                  </Button>
                </Link>
              </div>

              {/* Free Trial & 0% Commission Hook */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2 text-sm font-bold text-[#00B7A8]">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>0% Commission on Patient Fees. You keep 100%.</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                  <span>14-Day Unlimited Free Trial • No Credit Card Required</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="flex flex-wrap items-center gap-x-6 gap-y-4 text-[12px] font-semibold text-[#475569]"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#3b82f6]" strokeWidth={1.5} />
                <span className="w-24 leading-tight">Saves 15+ Hours/Week</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[#10B981] rounded-full p-1">
                  <TrendingUp className="w-3 h-3 text-white" />
                </div>
                <span className="w-24 leading-tight">Reduce Patient No-Shows</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#F59E0B]" strokeWidth={1.5} />
                <span className="w-24 leading-tight">Zero Front-Desk Chaos</span>
              </div>
            </motion.div>
          </div>

          {/* Footer Trust Bar with Avatar Pile */}
          <div className="mt-8 lg:mt-auto flex flex-col md:flex-row items-center gap-4 opacity-90 transition-all duration-300 w-full justify-center lg:justify-start">
            
            <div className="flex -space-x-3">
              <Image src="https://i.pravatar.cc/100?img=11" alt="Doctor" width={32} height={32} unoptimized className="rounded-full border-2 border-[#FAFBFC] shadow-sm z-30" />
              <Image src="https://i.pravatar.cc/100?img=32" alt="Doctor" width={32} height={32} unoptimized className="rounded-full border-2 border-[#FAFBFC] shadow-sm z-20" />
              <Image src="https://i.pravatar.cc/100?img=12" alt="Doctor" width={32} height={32} unoptimized className="rounded-full border-2 border-[#FAFBFC] shadow-sm z-10" />
              <Image src="https://i.pravatar.cc/100?img=47" alt="Doctor" width={32} height={32} unoptimized className="rounded-full border-2 border-[#FAFBFC] shadow-sm z-0" />
            </div>

            <div className="text-[12px] font-bold text-[#0B132B] uppercase tracking-wider shrink-0 text-center lg:text-left flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00B7A8]" />
              Powering 1,200+ Premium Clinics across 40+ Medical Domains
            </div>
          </div>
        </div>

        {/* Right Column: Visuals & Floating Cards */}
        <div className="w-full lg:w-[55%] relative z-10 flex justify-end h-[480px] sm:h-[600px] lg:h-full mt-8 lg:mt-0">
          
          {/* Main Image Anchor */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full rounded-2xl lg:rounded-none lg:rounded-l-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
          >
            <Image
              src="/assets/images/clinic-hero-exact.png?v=2"
              alt="Premium Indian clinic consulting"
              fill
              className="object-cover object-center lg:object-left-top"
              priority
              unoptimized={true}
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            {/* Premium Inner Glow/Shadow Overlay */}
            <div className="absolute inset-0 rounded-2xl lg:rounded-none lg:rounded-l-[40px] shadow-[inset_0_0_80px_rgba(0,0,0,0.05)] pointer-events-none" />
          </motion.div>          {/* Popups (Contextual Highlights) */}
          
          {/* 1. App Live Sync Pointer (Near Phone - Top Left) */}
          <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5, delay: 1.2 }}
             className="absolute left-[5%] lg:left-[18%] top-[15%] lg:top-[28%] flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white/50 z-30 pointer-events-none"
          >
             <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
             <span className="text-[10px] font-bold text-[#0B132B] uppercase tracking-wider">Live App Sync</span>
          </motion.div>

          {/* 2. New Booking Notification (Below Phone Hand - Bottom Left) */}
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 25px rgba(59,130,246,0.2)" }}
             transition={{ duration: 0.6, delay: 1.8, type: "spring" }}
            className="absolute left-[0%] lg:left-[2%] top-[60%] lg:top-[65%] bg-white/95 backdrop-blur-xl border border-blue-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-xl p-2.5 w-[200px] lg:w-[220px] z-30 transform-gpu cursor-default"
          >
            <div className="flex items-start gap-2.5">
              <div className="bg-blue-500 rounded-full p-1.5 flex-shrink-0 shadow-sm">
                <Calendar className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="w-full pt-0.5">
                <div className="text-[10px] font-bold text-[#0B132B] mb-0.5">New Booking Received</div>
                <p className="text-[9px] text-[#334155] leading-snug font-medium">
                  Patient Rohan booked via clinic QR code.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3. Instant QR Booking Pointer (Near Prescription - Bottom Right) */}
          <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5, delay: 2.2 }}
             className="absolute right-[5%] lg:right-[12%] bottom-[20%] lg:bottom-[12%] flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white/50 z-30 pointer-events-none"
          >
             <div className="w-2 h-2 rounded-full bg-[#00B7A8] animate-pulse" />
             <span className="text-[10px] font-bold text-[#0B132B] uppercase tracking-wider">Instant QR Booking</span>
          </motion.div>

          {/* 4. Google Review (Near Prescription - Center Right, moved away from face) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 25px rgba(245,158,11,0.2)" }}
            transition={{ duration: 0.6, delay: 2.8, type: "spring" }}
            className="absolute right-[2%] lg:right-[4%] bottom-[35%] lg:bottom-[30%] bg-white/95 backdrop-blur-xl border border-amber-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-xl p-2.5 w-[180px] lg:w-[200px] z-30 transform-gpu cursor-default"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="bg-white rounded-full p-1 shadow-sm flex-shrink-0">
                <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div className="flex gap-[1px]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
            </div>
            <p className="text-[9px] lg:text-[10px] text-[#334155] leading-snug font-medium">
              "Seamless digital experience! Highly recommend Dr. Arjun."
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
