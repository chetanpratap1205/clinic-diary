import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Activity,
  TrendingUp,
  Users,
  MessageSquare,
  BarChart3,
  Check,
  Zap,
  Smartphone,
  Quote,
  Lock,
  BellRing,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/components/pwa-provider";
import { PremiumIcon } from "@/components/ui/premium-icon";
import { HomeRoiCalculator } from "./_components/home-roi-calculator";
import { SocialProofPopup } from "./_components/social-proof-popup";
import { ExperienceEngine } from "./_components/experience-engine";
import { RotatingSpecialty } from "./_components/rotating-specialty";
import { HeroRedesign } from "./_components/hero-redesign";
import { HomeNav } from "./_components/home-nav";
import { LeadMagnetSection } from "./_components/lead-magnet";
import { HomePricingSection } from "./_components/home-pricing-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <SocialProofPopup />
      
      {/* Dynamic Floating Navigation */}
      <HomeNav />

      {/* Premium Light Hero Section */}
      <div className="relative z-20 bg-[#FAFBFC] rounded-b-[40px] md:rounded-b-[60px] shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
        <HeroRedesign />
      </div>

      <div className="relative z-10 w-full h-12 bg-[#080808] -mt-12" />

      {/* ROI Calculator Section */}
      <section className="py-20 px-4 sm:px-6 relative border-t border-white/5 bg-[#080808]">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] to-[#080808] z-0" />
        <div className="relative z-10 w-full max-w-7xl mx-auto">
          <div className="text-center mb-12">
             <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tighter">
               See Your Exact ROI.
             </h2>
             <p className="text-slate-400">Calculate how much revenue you are losing to empty slots.</p>
          </div>
          <HomeRoiCalculator />
        </div>
      </section>

      {/* 0% Commission Guarantee Section */}
      <section className="py-16 px-4 sm:px-6 bg-[#00B7A8]/5 border-y border-[#00B7A8]/20 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00B7A8]/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center gap-6">
          <div className="inline-flex items-center justify-center p-3 bg-[#00B7A8]/20 rounded-2xl border border-[#00B7A8]/30 mb-2">
            <Lock className="w-8 h-8 text-[#00B7A8]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            We build your software.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">We never touch your money.</span>
          </h2>
          <p className="text-slate-300 text-lg sm:text-xl font-medium max-w-2xl leading-relaxed">
            Unlike aggregator apps, we charge <strong className="text-white">0% commission</strong> on patient fees. You take payments directly from your patients, exactly as you do now. No interference. No hidden cuts.
          </p>
        </div>
      </section>

      {/* The Growth & Experience Engine (Bento Grid) */}
      <ExperienceEngine />

      {/* The Transformation Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-[#050505] border-t border-white/5 relative overflow-hidden flex flex-col items-center">
         <div className="max-w-7xl mx-auto w-full relative">
           
           <div className="text-center mb-16">
             <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tighter">
               Your Front Desk:<br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-slate-400 to-emerald-400">
                 A Call Center or a Premium Clinic?
               </span>
             </h2>
           </div>

           <div className="relative flex flex-col lg:flex-row items-center justify-center gap-0 max-w-5xl mx-auto">
             
             {/* The Chaos (Background/Recessed) */}
             <div className="w-full lg:w-[45%] bg-[#0f0707] border border-red-900/30 rounded-3xl p-6 sm:p-10 lg:pr-20 relative lg:translate-x-12 lg:scale-95 z-0 opacity-80 hover:opacity-100 transition-all duration-500">
               <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] -z-10" />
               <h3 className="text-2xl font-bold text-red-50 mb-2">The Old Chaos</h3>
               <p className="text-red-200/70 text-sm mb-8 leading-relaxed pr-4">
                 Your reception is acting like a frantic call center, costing you patients and peace of mind.
               </p>
               
               <ul className="space-y-5 pr-2">
                 {[
                   "Paying 15%+ commissions to booking apps.",
                   "Competing on price with 100s of doctors on the same platform.",
                   "Staff waste hours manually managing calls and chaotic queues.",
                   "Losing patient loyalty because the platform owns their data."
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 text-red-100/70 text-sm font-medium">
                     <div className="mt-0.5 bg-red-500/10 border border-red-500/20 rounded-full p-1 flex-shrink-0">
                       <X className="w-3 h-3 text-red-400" />
                     </div>
                     <span className="leading-relaxed">{item}</span>
                   </li>
                 ))}
               </ul>
               <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20 mt-8 group">
                <Image src="/assets/images/frontdesk_psychiatrist.png" alt="Psychiatrist receptionist in a calm modern clinic" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />
              </div>
             </div>

             {/* The Premium Standard (Foreground/Elevated) */}
             <div className="w-full lg:w-[60%] bg-gradient-to-br from-[#0c1f17] to-[#0A0A0A] border border-emerald-500/40 rounded-3xl p-6 sm:p-12 relative z-10 shadow-[0_30px_80px_rgba(16,185,129,0.15)] transform -mt-6 lg:mt-0 lg:-translate-x-6 hover:-translate-y-2 transition-transform duration-500 backdrop-blur-2xl">
               <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -z-10" />
               <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-t-3xl opacity-50" />
               
               <div className="absolute top-6 right-6 hidden sm:block">
                 <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">The New Standard</Badge>
               </div>

               <h3 className="text-3xl font-black text-white mb-2">The Premium Clinic</h3>
               <p className="text-emerald-100/70 text-base mb-10 max-w-sm leading-relaxed">
                 A silent, paperless front desk focused entirely on premium patient hospitality.
               </p>
               
               <ul className="space-y-6">
                 {[
                   "You keep 100% of patient revenue. 0% commission fees.",
                   "Patients see YOUR premium brand, not your competitors.",
                   "Self-booking in Hindi, Marathi, Punjabi, Tamil & English.",
                   "Your front desk manages a flawless digital queue on autopilot."
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-4 text-slate-200 font-medium text-sm sm:text-base">
                     <div className="mt-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full p-1 flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                       <Check className="w-4 h-4 text-emerald-400" />
                     </div>
                     <span className="leading-relaxed">{item}</span>
                   </li>
                 ))}
               </ul>
               
             </div>

           </div>
         </div>
      </section>

      {/* Founder's Guarantee */}
      <section className="py-16 sm:py-32 px-4 sm:px-6 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-8">
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-[40px] p-6 sm:p-14 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <Quote className="absolute top-10 right-10 w-24 h-24 text-white/[0.02] -rotate-12" />
            
            <div className="flex flex-col sm:flex-row gap-10 items-center sm:items-start relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] flex-shrink-0">
                <Image 
                  src="/chetan_profile_photo.png" 
                  alt="Chetan Pratap, Founder" 
                  width={160} 
                  height={160}
                  unoptimized 
                  className="object-cover w-full h-full transition-all duration-700"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-emerald-400 font-bold uppercase tracking-widest mb-4">A Note From the Founder</h3>
                <p className="text-slate-300 text-lg sm:text-xl leading-relaxed mb-8 font-medium">
                  "I built Doctor Diary because I saw incredible doctors losing massive amounts of money to outdated systems and no-shows. We engineered this platform not just to be software, but to be an active, automated revenue-generating machine for your clinic."
                </p>
                
                <div className="bg-[#0A0A0A]/50 border border-emerald-500/20 rounded-2xl p-5 mb-8 inline-block shadow-inner backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <span className="text-white font-bold text-lg">Try it. It will pay for itself in the first week.</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-3xl text-white italic font-serif mb-1 opacity-90">Chetan Pratap</div>
                  <div className="text-emerald-400/80 text-sm font-semibold tracking-wide uppercase">Founder & CEO, NatureXpress</div>
                </div>
              </div>
            </div>
          </div>

          {/* Co-Founder's Note */}
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-[40px] p-6 sm:p-14 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <Quote className="absolute top-10 right-10 w-24 h-24 text-white/[0.02] -rotate-12" />
            
            <div className="flex flex-col sm:flex-row-reverse gap-10 items-center sm:items-start relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex-shrink-0 bg-[#0f0f0f] flex items-center justify-center">
                <Image 
                  src="/govind-profile-pic.png" 
                  alt="Govind Bansal, Co-Founder" 
                  width={160} 
                  height={160} 
                  unoptimized
                  className="object-cover w-full h-full transition-all duration-700"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-cyan-400 font-bold uppercase tracking-widest mb-4">A Note From Leadership</h3>
                <p className="text-slate-300 text-lg sm:text-xl leading-relaxed mb-8 font-medium">
                  "Your clinic's growth shouldn't be limited by administrative bottlenecks. We focus on transforming your front desk from a cost center into a powerful acquisition channel that naturally attracts and retains high-value patients."
                </p>
                
                <div className="bg-[#0A0A0A]/50 border border-cyan-500/20 rounded-2xl p-5 mb-8 inline-flex items-center gap-3 shadow-inner backdrop-blur-md">
                  <TrendingUp className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                  <span className="text-white font-bold text-lg">Turn every interaction into a growth opportunity.</span>
                </div>

                <div className="mt-4">
                  <div className="text-3xl text-white italic font-serif mb-1 opacity-90">Govind Bansal</div>
                  <div className="text-cyan-400/80 text-sm font-semibold tracking-wide uppercase">Co-Founder, Sales & Marketing Head</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* White-Glove Migration Guarantee */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-emerald-950/20 to-[#050505] relative border-t border-b border-emerald-500/10 overflow-hidden">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6">
              <Shield className="w-4 h-4" /> The Fear Eraser
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
              Terrified of losing your current patient records?
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">
              We know that switching software feels like doing open-heart surgery on your clinic. That's why we include our <strong className="text-white">White-Glove Data Migration</strong> for free. 
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "We securely export data from your old, clunky software.",
                "Zero downtime. Your clinic keeps running smoothly.",
                "100% of your patient histories safely transferred in 48 hours."
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-emerald-100/80 font-medium text-sm sm:text-base">
                  <div className="bg-emerald-500/20 rounded-full p-1 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="w-full md:w-5/12">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative">
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping opacity-50" />
                  <Activity className="w-8 h-8 text-emerald-400 relative z-10" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-2">Concierge Onboarding</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  You just hand us your messy Excel sheets or old software login, and our engineering team handles the rest securely.
                </p>
                <div className="w-full bg-[#151515] rounded-full h-2 mb-2 overflow-hidden border border-white/5">
                  <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-[100%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Migration Complete
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Pricing Tier */}
      <HomePricingSection />

      {/* Lead Magnet Section for Capturing Non-Ready Doctor Leads */}
      <LeadMagnetSection />

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] pt-16 sm:pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          {/* Final CTA */}
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10 text-left mb-24">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                Secure your area's<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">digital dominance.</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 font-medium max-w-md">
                Patients are searching for premium clinics right now. Claim your 0% commission infrastructure before local competitors do.
              </p>
              <Link href="/signup">
                <Button size="lg" className="rounded-full bg-white text-black hover:bg-slate-200 h-14 px-10 font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-all">
                  Start Your Free Trial Now
                </Button>
              </Link>
            </div>
            
            <div className="relative w-full aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
               <Image src="/assets/images/cta_general.png" alt="Confident general specialist doctor at modern clinic entrance" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-tr from-[#050505] via-transparent to-transparent opacity-50" />
            </div>
          </div>

          <div className="border-t border-white/10 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-shrink-0 bg-white/5 p-2 rounded-xl border border-white/10 relative group">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-md group-hover:bg-emerald-500/40 transition-colors" />
                  <Image src="/icon-192.png" alt="Doctor Diary Logo" width={28} height={28} className="rounded-md relative z-10" />
                </div>
                <span className="font-bold text-white text-xl tracking-tight">
                  Doctor Diary
                </span>
              </div>
              <span className="font-medium text-slate-500 text-sm">
                Engineered by NatureXpress
              </span>
            </div>
            
            <div className="flex flex-wrap gap-6 sm:gap-10 text-sm font-semibold text-slate-400 justify-center">
              <Link href="/blog" className="hover:text-emerald-400 transition-colors">Blog</Link>
              <Link href="/demo" className="hover:text-emerald-400 transition-colors">Demo</Link>
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
              <Link href="/refund" className="hover:text-emerald-400 transition-colors">Refund Policy</Link>
              <a href="https://wa.me/918077170715?text=Hi%20Doctor%20Diary%20Support%20Team" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                Contact Support (WhatsApp)
              </a>
            </div>
          </div>
          
          <div className="mt-12 text-center text-xs font-medium text-slate-600">
            © {new Date().getFullYear()} NatureXpress. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}
