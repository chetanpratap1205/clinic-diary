"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Play, Star, Calendar, MessageSquare, TrendingUp, ChevronRight, CheckCircle2, Shield, Cloud, Users, Clock, Zap } from "lucide-react";

export function HeroRedesign() {
  return (
    <section className="relative w-full bg-[#FAFBFC] overflow-hidden min-h-[100dvh] lg:h-[100dvh] lg:min-h-[700px] lg:max-h-[950px] flex flex-col justify-between pt-16 lg:pt-0">
      
      {/* Subtle Background Pattern (Dotted) */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Main Content Grid */}
      <div className="w-full max-w-[1600px] mx-auto relative z-10 flex flex-col lg:flex-row items-stretch flex-grow h-full">
        
        {/* Left Column: Content */}
        <div className="w-full lg:w-[45%] flex flex-col justify-center text-left shrink-0 z-20 px-4 sm:px-8 lg:pl-12 lg:pr-8 pt-12 lg:pt-0 pb-12 lg:pb-0 lg:h-full relative">
          
          <div className="flex flex-col justify-center max-w-xl mx-auto lg:mx-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[42px] sm:text-[52px] lg:text-[56px] xl:text-[64px] font-black text-[#0B132B] leading-[1.05] tracking-tight mb-5"
            >
              More Patients.<br />
              <span className="text-[#00B7A8]">Better Patient<br />Experience.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[16px] sm:text-[18px] text-[#334155] mb-8 max-w-md leading-relaxed"
            >
              Everything your clinic needs to attract, engage, and retain patients while reducing administrative work.
            </motion.p>

            {/* Urgency Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 text-[11px] font-bold uppercase tracking-wider mb-5"
            >
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Secure your area before competitors do
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-10"
            >
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#00B7A8] hover:bg-[#00998c] text-white h-14 px-7 text-base font-bold rounded-lg transition-all flex items-center gap-2 group shadow-[0_4px_14px_0_rgba(0,183,168,0.39)]"
                >
                  <Star className="w-5 h-5 fill-current" />
                  Claim Area Exclusivity
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Dialog>
                <DialogTrigger asChild>
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
                </DialogTrigger>
                <DialogContent className="sm:max-w-[800px] w-[95vw] p-0 overflow-hidden bg-black/95 border-none rounded-xl">
                  <div className="relative pt-[56.25%] w-full">
                    <video 
                      autoPlay 
                      controls 
                      className="absolute top-0 left-0 w-full h-full"
                      preload="metadata"
                      playsInline
                    >
                      <source src="/demo_video.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </DialogContent>
              </Dialog>
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

          {/* Footer Trust Bar - Kept in left column to avoid stretching layout */}
          <div className="lg:absolute lg:bottom-6 lg:left-4 sm:left-8 lg:left-12 mt-8 lg:mt-0 flex flex-col md:flex-row items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300 w-full justify-center lg:justify-start">
            <div className="text-[11px] font-bold text-[#0B132B] uppercase tracking-wider shrink-0 text-center lg:text-left">
                Trusted by 1,200+ Independent Doctors
            </div>
          </div>
        </div>

        {/* Right Column: Visuals & Floating Cards */}
        <div className="w-full lg:w-[55%] relative z-10 flex justify-end h-[500px] sm:h-[600px] lg:h-full mt-8 lg:mt-0 overflow-hidden lg:overflow-visible">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.98, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full h-full lg:rounded-tl-[40%] overflow-hidden shadow-[-20px_0_60px_rgba(0,0,0,0.08)]"
          >
            <Image
              src="/assets/images/clinic-hero-exact.png"
              alt="Premium Indian clinic consulting"
              fill
              className="object-cover object-left-top"
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </motion.div>

          {/* Popups (Restored Original Reliable Positioning) */}
          
          {/* 3. WhatsApp Notification */}
          <motion.div
             initial={{ opacity: 0, y: -20 }}
             animate={{ opacity: 1, y: [0, -3, 0] }}
             transition={{ 
               opacity: { duration: 0.5, delay: 1.5 },
               y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 } 
             }}
            className="absolute right-[-10%] sm:right-[5%] lg:right-[12%] top-[5%] lg:top-[18%] bg-white/95 backdrop-blur-md border border-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-xl p-3 w-[260px] z-30 scale-[0.75] sm:scale-90 lg:scale-100 origin-right"
          >
            <div className="flex items-start gap-3">
              <div className="bg-[#25D366] rounded-full p-1.5 flex-shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4 text-white fill-white" />
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[11px] font-bold text-[#0B132B]">WhatsApp</div>
                  <div className="text-[9px] text-[#64748B]">9:30 AM</div>
                </div>
                <p className="text-[11px] text-[#334155] leading-snug pr-4">
                  Hi Rohan, your appointment with Dr. Mehta is confirmed for tomorrow at 11:30 AM.
                </p>
                <div className="flex justify-end mt-1">
                   <CheckCircle2 className="w-3.5 h-3.5 text-[#3b82f6]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 4. Follow-up Reminder */}
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute right-[5%] lg:right-[10%] top-[40%] lg:top-[30%] bg-white/95 backdrop-blur-md border border-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-xl p-3 w-[210px] hidden sm:flex items-start gap-3 z-30 scale-[0.85] lg:scale-100 origin-right"
          >
             <div className="bg-[#eff6ff] p-1.5 rounded-lg flex-shrink-0">
                <Calendar className="w-4 h-4 text-[#3b82f6]" strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-[11px] font-bold text-[#0B132B] mb-0.5">Follow-up Reminder</div>
                <div className="text-[10px] text-[#334155] font-semibold">Tomorrow, 10:00 AM</div>
                <div className="text-[10px] text-[#64748B]">Patient: Neha Sharma</div>
              </div>
          </motion.div>

          {/* 5. Google Review */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute left-[-5%] sm:left-[5%] lg:left-auto lg:right-[5%] bottom-[15%] lg:bottom-[30%] bg-white/95 backdrop-blur-md border border-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] rounded-xl p-3.5 w-[240px] flex items-start gap-3 z-30 scale-[0.75] sm:scale-90 lg:scale-100 origin-left lg:origin-right"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mt-1">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <div>
              <div className="flex justify-between items-center mb-1">
                 <div className="text-[11px] font-bold text-[#0B132B]">New Google Review</div>
                 <div className="text-[9px] text-[#64748B]">9:45 AM</div>
              </div>
              <div className="flex gap-0.5 mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                ))}
              </div>
              <p className="text-[11px] text-[#334155] leading-snug font-medium">
                Excellent experience and very well managed clinic!
              </p>
            </div>
          </motion.div>

          {/* 6. Today's Overview */}
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute left-[5%] lg:left-[15%] bottom-[5%] lg:bottom-[12%] bg-white/95 backdrop-blur-md border border-white shadow-[0_15px_50px_rgba(0,0,0,0.15)] rounded-2xl p-5 w-[380px] z-30 scale-[0.65] sm:scale-80 lg:scale-100 origin-bottom-left"
          >
            <div className="flex justify-between items-center mb-4">
              <div className="text-[12px] font-bold text-[#0B132B]">Today's Overview</div>
              <div className="text-[10px] text-[#00B7A8] font-bold cursor-pointer">View Dashboard</div>
            </div>
            
            <div className="flex justify-between items-end mb-4 pr-4">
              <div>
                <div className="text-[10px] text-[#64748B] font-semibold mb-1">Appointments</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] font-black text-[#0B132B] leading-none">28</span>
                  <span className="text-[10px] text-[#10B981] font-bold">+12%</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] font-semibold mb-1">New Patients</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] font-black text-[#0B132B] leading-none">07</span>
                  <span className="text-[10px] text-[#10B981] font-bold">+8%</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#64748B] font-semibold mb-1">Follow-ups</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] font-black text-[#0B132B] leading-none">15</span>
                  <span className="text-[10px] text-[#10B981] font-bold">+10%</span>
                </div>
              </div>
            </div>

            <div className="w-full h-8 relative mt-1">
               <svg viewBox="0 0 340 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                 <defs>
                   <linearGradient id="sparkline_wide" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#10B981" stopOpacity="0.15" />
                     <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                   </linearGradient>
                 </defs>
                 <path d="M0 25 Q30 20, 60 22 T120 15 T180 20 T240 10 T280 25 T340 5 L340 30 L0 30 Z" fill="url(#sparkline_wide)" />
                 <path d="M0 25 Q30 20, 60 22 T120 15 T180 20 T240 10 T280 25 T340 5" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                 <line x1="0" y1="28" x2="340" y2="28" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
               </svg>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
