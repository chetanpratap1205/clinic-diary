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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <SocialProofPopup />
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-transparent transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <Image src="/icon-192.png" alt="Doctor Diary Logo" width={36} height={36} className="rounded-xl" />
            </div>
            <span className="font-bold text-white text-lg sm:text-xl tracking-tight">
              Doctor Diary{" "}
              <span className="font-medium text-slate-500 text-xs sm:text-sm ml-1 hidden sm:inline-block">
                by NatureXpress
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
              <InstallButton />
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium text-sm h-9 px-4 hidden sm:inline-flex text-slate-300 hover:text-white hover:bg-white/10"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all font-bold text-sm h-9 px-5 rounded-full border border-teal-400/20"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Obsidian Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover object-top"
          >
            <source src="/hero_bg.mp4" type="video/mp4" />
          </video>
          {/* Uniform dark overlay to make text readable while keeping video colors crisp */}
          <div className="absolute inset-0 bg-[#0A0A0A]/75 sm:bg-[#0A0A0A]/60" />
        </div>

        {/* Deep glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] z-0 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] z-0 animate-pulse" style={{ animationDuration: '8s' }} />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 w-full drop-shadow-2xl">
          <div className="group inline-flex items-center gap-2.5 bg-emerald-500/10 backdrop-blur-md border border-emerald-400/30 text-emerald-50 rounded-full px-5 py-2 text-xs sm:text-sm font-bold mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:bg-emerald-500/20 hover:border-emerald-400/50 transition-all cursor-default">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Built exclusively for independent clinics and specialists</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter leading-[1.1] break-words">
            Turn Your Clinic Into A<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 block sm:inline mt-2 sm:mt-0">
              24/7 Growth Engine.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-10 leading-[1.8] font-medium text-center text-slate-400">
            Stop losing patients to corporate hospitals. Elevate your brand with a <strong className="text-white font-bold tracking-tight">premium booking page</strong>, automate <strong className="text-emerald-400 font-bold tracking-tight">WhatsApp patient reactivation</strong>, and fill empty slots—<span className="text-slate-200">even while you sleep.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 shadow-[0_0_40px_rgba(16,185,129,0.3)] group h-14 px-8 text-base font-black rounded-full transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] border border-emerald-400/50"
              >
                Book Your Free Setup
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#demo" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] h-14 px-8 text-base font-bold rounded-full transition-all group"
              >
                <span className="text-emerald-400 mr-2 group-hover:scale-110 transition-transform inline-block">▶</span> Watch 60-Sec Demo
              </Button>
            </Link>
          </div>
          
          <div className="max-w-xl mx-auto text-center mb-12">
            <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              <span className="text-emerald-400">No apps to download.</span> Includes beautiful physical QR codes for your clinic doors so you can capture bookings 24/7/365. <strong className="text-white">Pays for itself with just one recovered patient.</strong>
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-500">
             <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
               <div className="flex items-center justify-center">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
               </div>
               <div className="text-slate-300">
                 Join <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-black">1,200+ Top Clinics</span> delivering premium care.
               </div>
             </div>
          </div>
        </div>
        
        {/* ROI Calculator */}
        <div className="relative z-10 w-full mt-12">
          <HomeRoiCalculator />
        </div>
      </section>

      {/* The Growth & Experience Engine (Bento Grid) */}
      <section className="py-24 px-4 sm:px-6 bg-[#050505] relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-[1.1]">
              Stop Acting Like a Waiting Room.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Start Operating Like a Premium Brand.
              </span>
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Doctor Diary isn’t just booking software. It’s an end-to-end growth engine designed to eliminate front-desk chaos, dazzle your patients, and effortlessly multiply your revenue.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: The "Wow" Patient Experience */}
            <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 sm:p-12 relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -z-10 group-hover:bg-emerald-500/20 transition-all duration-700" />
              <div className="mb-6">
                <PremiumIcon Icon={Star} variant="glass" size="xl" />
              </div>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">The "Wow" Patient Experience.</h3>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                    Give patients a frictionless, digital-first journey. From beautiful online booking pages to live queue tracking, deliver a modern experience that screams "Top-Tier Clinic" and guarantees 5-star reviews.
                  </p>
                  <ul className="space-y-3">
                    {["No app downloads required", "Beautiful clinic profile page", "Instant WhatsApp updates"].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-emerald-100/70 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Mock UI */}
                <div className="relative h-64 md:h-full min-h-[250px] w-full rounded-2xl bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                  <div className="bg-[#151515] border border-white/10 rounded-2xl p-5 w-64 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform rotate-2 group-hover:rotate-0 transition-all duration-500 z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-400 flex-shrink-0"></div>
                      <div>
                        <div className="text-white font-bold text-sm">Dr. Sharma Clinic</div>
                        <div className="text-slate-500 text-xs">Premium Care</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center px-3 border border-emerald-500/30">
                        <span className="text-emerald-400 text-xs font-bold">Book Appointment</span>
                      </div>
                      <div className="h-10 bg-[#222] rounded-lg flex items-center justify-center px-3 border border-white/5">
                        <span className="text-slate-300 text-xs font-semibold">Track Live Queue</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Eradicate No-Shows */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 sm:p-10 relative overflow-hidden group flex flex-col justify-between">
              <div className="absolute left-0 bottom-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-teal-500/20 transition-all duration-700" />
              <div>
                <div className="mb-6">
                  <PremiumIcon Icon={MessageSquare} variant="glass" size="xl" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">The Patient Reactivation Engine.</h3>
                <p className="text-slate-400 text-base mb-8">
                  Got empty slots? With one click, launch automated WhatsApp health camps or check-up reminders to past patients, and watch your calendar fill up in minutes.
                </p>
              </div>
              <div className="bg-[#111] border border-white/10 rounded-2xl p-4 shadow-2xl relative">
                <div className="absolute -left-3 -top-3 w-8 h-8 bg-teal-500 rounded-full border-4 border-[#0a0a0a] shadow-lg animate-bounce flex items-center justify-center z-20">
                  <Zap className="w-4 h-4 text-[#111]" />
                </div>
                <div className="bg-[#1a2c26] border border-emerald-500/20 rounded-xl p-4 relative z-10">
                  <p className="text-xs text-emerald-100 leading-relaxed">
                    <strong className="text-emerald-400 block mb-1">Dr. Sharma Clinic</strong>
                    Hi Rohan, it's been 6 months since your last visit. Reply 'BOOK' to secure a priority slot for your routine check-up this week.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3: 24/7 Acquisition */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 sm:p-10 relative overflow-hidden group flex flex-col justify-between">
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[70px] -z-10 group-hover:bg-cyan-500/20 transition-all duration-700" />
              <div>
                <div className="mb-6">
                  <PremiumIcon Icon={Smartphone} variant="glass" size="xl" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">24/7 Acquisition: Inside & Out.</h3>
                <p className="text-slate-400 text-base mb-8">
                  Turn every physical touchpoint into a booking engine. We provide premium QR stands for your reception and weatherproof QR decals for your clinic shutter. Whether it's peak rush hour or 2 AM when you're closed, patients scan, book, and join your database instantly.
                </p>
              </div>
              
              {/* Situational UI Mockup */}
              <div className="aspect-[3/2] w-full rounded-2xl bg-[#0d0d0d] border border-white/5 flex flex-col items-center justify-center p-5 relative group-hover:scale-105 transition-transform duration-500 overflow-hidden shadow-inner">
                 <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                 
                 <div className="flex flex-col items-center z-10 w-full max-w-[240px]">
                   {/* Status Badge */}
                   <div className="bg-[#1a1a1a] border border-white/10 rounded-full px-4 py-1.5 mb-5 flex items-center gap-2 shadow-lg backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                      <span className="text-xs text-slate-300 font-semibold tracking-wide">Clinic Closed • 2:14 AM</span>
                   </div>
                   
                   {/* Notification Card */}
                   <div className="bg-gradient-to-b from-[#151515] to-[#0A0A0A] border border-cyan-500/30 rounded-xl p-4 w-full shadow-[0_10px_30px_rgba(6,182,212,0.15)] relative transform group-hover:-translate-y-1 transition-transform duration-500">
                     <div className="flex justify-between items-start mb-2">
                       <div>
                         <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1">New Booking</p>
                         <p className="text-white font-bold text-sm">Tomorrow, 10:30 AM</p>
                       </div>
                       <div className="bg-cyan-500/10 text-cyan-400 p-1.5 rounded-lg border border-cyan-500/20">
                         <Zap className="w-3.5 h-3.5" />
                       </div>
                     </div>
                     <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center">
                       <span className="text-[10px] text-slate-400 font-medium bg-white/5 px-2 py-1 rounded">Via Storefront QR</span>
                       <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                         <CheckCircle className="w-3 h-3" /> Secured
                       </span>
                     </div>
                   </div>
                 </div>
              </div>
            </div>

            {/* Feature 4: Zero Chaos */}
            <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 sm:p-12 relative overflow-hidden group flex flex-col md:flex-row items-center gap-10">
              <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -z-10 group-hover:bg-indigo-500/20 transition-all duration-700" />
              
              <div className="flex-1 z-10">
                <div className="mb-6">
                  <PremiumIcon Icon={Shield} variant="glass" size="xl" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Flawless Operations.<br/>Zero Double-Bookings.</h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Your reputation hinges on reliability. Our enterprise-grade calendar ensures absolute precision. When your calendar is flawless and your front desk is silent, your clinic radiates absolute professionalism.
                </p>
              </div>

              {/* Mock Calendar UI */}
              <div className="w-full md:w-72 bg-[#111] border border-white/10 rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex-shrink-0 z-10 relative">
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-indigo-500 rounded-xl border-4 border-[#0a0a0a] shadow-lg flex items-center justify-center rotate-12 group-hover:rotate-[24deg] transition-transform duration-500">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/5">
                  <div>
                    <span className="text-white font-bold block">10:00 AM</span>
                    <span className="text-slate-500 text-xs">Dr. Sharma</span>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1">Secured</Badge>
                </div>
                <div className="flex items-center justify-between opacity-50">
                  <div>
                    <span className="text-white font-bold block">10:15 AM</span>
                    <span className="text-slate-500 text-xs">Dr. Sharma</span>
                  </div>
                  <Badge className="bg-slate-800 text-slate-400 px-3 py-1 border border-white/5">Locked</Badge>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The Transformation Section */}
      <section className="py-24 px-4 sm:px-6 bg-[#050505] border-t border-white/5 relative overflow-hidden flex flex-col items-center">
         <div className="max-w-7xl mx-auto w-full relative">
           
           <div className="text-center mb-16">
             <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 tracking-tighter">
               Your Front Desk:<br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-slate-400 to-emerald-400">
                 A Call Center or a Premium Clinic?
               </span>
             </h2>
           </div>

           <div className="relative flex flex-col md:flex-row items-center justify-center gap-0 max-w-5xl mx-auto">
             
             {/* The Chaos (Background/Recessed) */}
             <div className="w-full lg:w-[45%] bg-[#0f0707] border border-red-900/30 rounded-3xl p-8 sm:p-10 lg:pr-20 relative lg:translate-x-12 lg:scale-95 z-0 opacity-80 hover:opacity-100 transition-all duration-500">
               <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] -z-10" />
               <h3 className="text-2xl font-bold text-red-50 mb-2">The Old Chaos</h3>
               <p className="text-red-200/70 text-sm mb-8 leading-relaxed pr-4">
                 Your reception is acting like a frantic call center, costing you patients and peace of mind.
               </p>
               
               <ul className="space-y-5 pr-2">
                 {[
                   "The phone never stops ringing.",
                   "Staff waste hours manually calling to confirm appointments.",
                   "Angry patients crowd a chaotic, delayed waiting room.",
                   "Revenue leaks through messy ledgers and no-shows."
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 text-red-100/70 text-sm font-medium">
                     <div className="mt-0.5 bg-red-500/10 border border-red-500/20 rounded-full p-1 flex-shrink-0">
                       <X className="w-3 h-3 text-red-400" />
                     </div>
                     <span className="leading-relaxed">{item}</span>
                   </li>
                 ))}
               </ul>
             </div>

             {/* The Premium Standard (Foreground/Elevated) */}
             <div className="w-full lg:w-[60%] bg-gradient-to-br from-[#0c1f17] to-[#0A0A0A] border border-emerald-500/40 rounded-3xl p-8 sm:p-12 relative z-10 shadow-[0_30px_80px_rgba(16,185,129,0.15)] transform -mt-6 lg:mt-0 lg:-translate-x-6 hover:-translate-y-2 transition-transform duration-500 backdrop-blur-2xl">
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
                   "Patients self-book 24/7 via a beautiful digital portal.",
                   "Automated WhatsApp alerts keep everyone perfectly informed.",
                   "Your receptionist manages a flawless queue from a single iPad.",
                   "100% digital records. Zero paper. Zero stress."
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
      <section className="py-32 px-4 sm:px-6 bg-[#050505] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-8">
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-[40px] p-8 sm:p-14 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <Quote className="absolute top-10 right-10 w-24 h-24 text-white/[0.02] -rotate-12" />
            
            <div className="flex flex-col sm:flex-row gap-10 items-center sm:items-start relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.2)] flex-shrink-0">
                <Image 
                  src="/chetan_profile_photo.png" 
                  alt="Chetan Pratap, Founder" 
                  width={160} 
                  height={160} 
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
          <div className="bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 rounded-[40px] p-8 sm:p-14 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
            
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <Quote className="absolute top-10 right-10 w-24 h-24 text-white/[0.02] -rotate-12" />
            
            <div className="flex flex-col sm:flex-row-reverse gap-10 items-center sm:items-start relative">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.2)] flex-shrink-0 bg-[#0f0f0f] flex items-center justify-center">
                <Image 
                  src="/govind-profile-pic.png" 
                  alt="Govind Bansal, Co-Founder" 
                  width={160} 
                  height={160} 
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
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-emerald-950/20 to-[#050505] relative border-t border-b border-emerald-500/10 overflow-hidden">
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
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative group overflow-hidden">
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
      <section id="pricing" className="py-32 px-4 sm:px-6 bg-[#0a0a0a] relative border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
              An Investment That <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Pays For Itself.</span>
            </h2>
            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed">
              The average clinic using Doctor Diary sees a <strong className="text-white font-bold">₹25,000 to ₹50,000</strong> increase in monthly revenue simply by eliminating no-shows and streamlining operations.
            </p>
          </div>
          
          {/* Starter Kit Unboxing Block */}
          <div className="mb-16 bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-emerald-500/30 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.1)] max-w-5xl mx-auto group">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent -z-10 group-hover:from-emerald-500/20 transition-all duration-700" />
            <div className="w-24 h-24 rounded-2xl bg-[#151515] border border-white/10 shadow-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden transform group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl" />
              <Star className="w-10 h-10 text-emerald-400 relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            </div>
            <div>
              <div className="inline-block bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-3 border border-emerald-500/20">Included Free (Worth ₹1,999)</div>
              <h3 className="text-2xl font-bold text-white mb-3">Premium Clinic Starter Kit</h3>
              <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
                Every subscription includes our physical onboarding kit shipped to your door: Premium Acrylic QR Stands, Weatherproof Shutters QR Decals, and a live Dedicated Staff Training session.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
            {/* Quarterly */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-[32px] p-8 sm:p-10 hover:bg-[#111] transition-colors relative z-0">
              <h3 className="text-2xl font-bold text-white mb-2">Quarterly</h3>
              <p className="text-base text-slate-400 mb-8 min-h-[48px]">Perfect for getting started and testing the waters.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">₹1,499</span>
                <span className="text-slate-500 font-medium">/ 3 mo</span>
              </div>
              <div className="mb-8 inline-block bg-white/5 text-slate-300 text-sm font-semibold px-4 py-2 rounded-xl border border-white/10">
                Less than ₹17/day for your entire clinic
              </div>
              <ul className="space-y-4 mb-10">
                {["One Complete Product", "Unlimited Patients & Appointments", "Free Premium Starter Kit", "Smart WhatsApp & SMS Ready", "Executive Analytics"].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-base font-medium">
                    <Check className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" /> 
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="block w-full">
                <Button variant="outline" className="w-full rounded-2xl bg-[#151515] border-white/10 text-white hover:bg-white/10 h-16 text-lg font-bold">
                  Start Free Setup
                </Button>
              </Link>
            </div>

            {/* Annual - Enterprise Card (Dominant) */}
            <div className="bg-[#050505] rounded-[32px] p-[2px] relative z-10 transform md:scale-105 shadow-[0_30px_100px_rgba(16,185,129,0.25)] group hover:-translate-y-2 transition-transform duration-500">
              {/* Animated Glowing Border */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-[32px] opacity-70 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-[32px] opacity-100" />
              
              <div className="bg-[#0A0A0A] rounded-[30px] p-8 sm:p-12 relative h-full w-full overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
                
                <div className="absolute top-6 right-6 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Best Value
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">Annual</h3>
                <p className="text-base text-emerald-100/60 mb-8 min-h-[48px]">Maximum ROI for established, high-volume clinics.</p>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter">₹4,999</span>
                  <span className="text-slate-400 font-medium">/ yr</span>
                </div>
                
                {/* The Chai Anchor */}
                <div className="mb-8 inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-sm font-bold px-4 py-2.5 rounded-xl border border-emerald-500/30">
                  <span className="animate-pulse">☕</span> Less than ₹14/day. (Cheaper than a cup of chai)
                </div>
                
                <ul className="space-y-5 mb-10 relative z-10">
                  {["Everything in Quarterly", "Dedicated Account Manager", "Priority Support Channel", "Annual Performance Reviews"].map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-white text-base font-semibold">
                      <div className="mt-0.5 bg-emerald-500/20 rounded-full p-1 border border-emerald-500/30">
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" className="block w-full relative z-10">
                  <Button className="w-full rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-slate-950 font-black h-16 text-lg shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] transition-all">
                    Claim Your Area Exclusivity
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-emerald-500/5 rounded-full blur-[150px] -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto">
          {/* Final CTA */}
          <div className="text-center mb-24 relative z-10">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
              Wake up to a full calendar.
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto font-medium">
              Join 1,200+ top-tier doctors who have transformed their clinic into a 24/7 premium brand and automated their growth.
            </p>
            <Link href="/signup">
              <Button size="lg" className="rounded-full bg-white text-black hover:bg-slate-200 h-14 px-10 font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-all">
                Get Started Today
              </Button>
            </Link>
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
              <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link>
              <Link href="/refund" className="hover:text-emerald-400 transition-colors">Refund Policy</Link>
              <a href="mailto:support@doctor.naturexpress.in" className="hover:text-emerald-400 transition-colors">Contact Support</a>
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
