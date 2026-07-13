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
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/components/pwa-provider";
import { PremiumIcon } from "@/components/ui/premium-icon";
import { HomeRoiCalculator } from "./_components/home-roi-calculator";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/5 transition-all">
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
            <div className="hidden md:block">
              <InstallButton />
            </div>
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
      <section className="pt-32 pb-20 px-4 sm:px-6 relative min-h-[90vh] flex flex-col items-center justify-center">
        {/* Deep glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[150px] -z-10 animate-pulse" style={{ animationDuration: '8s' }} />
        
        <div className="max-w-5xl mx-auto text-center z-10 w-full">
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-emerald-500/30 text-emerald-300 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold mb-8 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Star strokeWidth={2} className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>The Operating System for Top-Tier Clinics</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tighter leading-[1.05]">
            Stop Losing Revenue to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Empty Chairs.
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Fully automate your booking, eliminate no-shows with smart WhatsApp reminders, and watch your daily revenue grow effortlessly.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-[0_0_30px_rgba(20,184,166,0.4)] group h-14 px-8 text-base font-bold rounded-full transition-all hover:scale-105 border border-teal-400/20"
              >
                Start Your Free Setup
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm font-medium text-slate-500">
             <div className="flex -space-x-3">
               {[1,2,3,4].map((i) => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0A0A0A] bg-slate-800 flex items-center justify-center text-xs text-emerald-400 overflow-hidden">
                    <Users className="w-4 h-4 opacity-50" />
                 </div>
               ))}
             </div>
             <div className="text-left">
               <div className="text-white font-bold flex items-center gap-1">
                 <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" /> 5.0
               </div>
               <div>Trusted by 500+ Top Doctors</div>
             </div>
          </div>
        </div>
        
        {/* ROI Calculator */}
        <HomeRoiCalculator />
      </section>

      {/* The Platform Ecosystem (Bento Grid) */}
      <section className="py-24 px-4 sm:px-6 bg-[#050505] relative border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 tracking-tight">Enterprise Infrastructure.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">Everything a high-volume modern clinic needs, packed into a stark, incredibly fast interface.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: WhatsApp Automations */}
            <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-emerald-500/20 transition-all" />
              <div className="mb-6">
                <PremiumIcon Icon={MessageSquare} variant="glass" size="xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Smart WhatsApp Automations</h3>
              <p className="text-slate-400 text-lg max-w-md mb-8">
                Instantly eliminate no-shows. The system sends immediate booking confirmations, 24-hour reminders, and follow-up requests directly to patients' WhatsApp.
              </p>
              
              {/* Mock UI */}
              <div className="bg-[#111] border border-white/10 rounded-xl p-4 max-w-sm shadow-2xl relative">
                <div className="absolute -left-2 -top-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-[#111] animate-bounce flex items-center justify-center">
                  <Check className="w-3 h-3 text-[#111]" />
                </div>
                <p className="text-sm text-slate-300">
                  <strong className="text-emerald-400">Clinic Diary</strong><br/>
                  Reminder: Your appointment with Dr. Sharma is tomorrow at 10:00 AM.
                </p>
              </div>
            </div>

            {/* Feature 2: Offline to Online */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden group">
               <div className="absolute left-0 bottom-0 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-[60px] -z-10 group-hover:bg-teal-500/20 transition-all" />
              <div className="mb-6">
                <PremiumIcon Icon={Smartphone} variant="glass" size="xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Offline to Online Engine</h3>
              <p className="text-slate-400 mb-6">
                Bridge the gap with physical assets. Order our premium Acrylic QR stands directly from your dashboard to convert walk-ins to digital bookings.
              </p>
              <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-slate-800 to-[#111] border border-white/5 flex items-center justify-center overflow-hidden relative">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity" />
                 <div className="bg-white p-2 rounded shadow-2xl z-10 transform -rotate-6">
                   <div className="w-16 h-16 bg-black" />
                 </div>
              </div>
            </div>

            {/* Feature 3: Executive Analytics */}
            <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden group">
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-[60px] -z-10 group-hover:bg-indigo-500/20 transition-all" />
              <div className="mb-6">
                <PremiumIcon Icon={BarChart3} variant="glass" size="xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Executive Analytics</h3>
              <p className="text-slate-400">
                Track every rupee. Know your exact retention rates, booking sources, and revenue metrics at a glance.
              </p>
            </div>

            {/* Feature 4: Zero Double Bookings */}
            <div className="md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 sm:p-10 relative overflow-hidden group flex flex-col md:flex-row items-center gap-8">
              <div className="absolute right-0 bottom-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] -z-10" />
              
              <div className="flex-1">
                <div className="mb-6">
                  <PremiumIcon Icon={Shield} variant="glass" size="xl" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Zero Double Bookings. Guaranteed.</h3>
                <p className="text-slate-400 text-lg">
                  Our database-level unique constraints ensure that even if two patients click book at the exact same millisecond, only one gets the slot. Your calendar remains flawless.
                </p>
              </div>

              {/* Mock Calendar UI */}
              <div className="w-full md:w-64 bg-[#111] border border-white/10 rounded-xl p-4 shadow-2xl flex-shrink-0">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                  <span className="text-white font-medium">10:00 AM</span>
                  <Badge className="bg-emerald-500 text-[#111]">Booked</Badge>
                </div>
                <div className="flex items-center justify-between opacity-50">
                  <span className="text-white font-medium">10:15 AM</span>
                  <Badge className="bg-slate-800 text-slate-400 hover:bg-slate-800">Locked</Badge>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* The "Sanity Restored" Section (For Receptionists) */}
      <section className="py-24 px-4 sm:px-6 bg-[#0A0A0A] border-t border-white/5 relative overflow-hidden">
         <div className="max-w-7xl mx-auto">
           <div className="grid lg:grid-cols-2 gap-0 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl">
             
             {/* The Chaos */}
             <div className="bg-gradient-to-br from-[#1A0B0B] to-[#0A0A0A] p-12 lg:p-16 relative">
               <div className="absolute top-0 right-0 w-full h-1 bg-red-500/20" />
               <h3 className="text-3xl font-bold text-white mb-4">The Old Chaos</h3>
               <p className="text-slate-400 text-lg mb-8">Receptionists acting as call centers instead of greeting patients.</p>
               
               <ul className="space-y-6">
                 {[
                   "Endless phone ringing.",
                   "Manually calling to confirm appointments.",
                   "Angry patients waiting due to double bookings.",
                   "Messy ledger books and sticky notes."
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 text-slate-300">
                     <div className="mt-1 w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                     </div>
                     <span>{item}</span>
                   </li>
                 ))}
               </ul>
             </div>

             {/* The Calm */}
             <div className="bg-gradient-to-br from-emerald-950/40 to-[#0A0A0A] p-12 lg:p-16 relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
               <h3 className="text-3xl font-bold text-white mb-4">Sanity Restored</h3>
               <p className="text-slate-400 text-lg mb-8">A silent front desk focused entirely on patient experience.</p>
               
               <ul className="space-y-6">
                 {[
                   "Patients book themselves online.",
                   "System auto-reminds everyone via WhatsApp.",
                   "Flawless queue management on a single iPad.",
                   "Complete digital records, zero paper."
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 text-slate-200 font-medium">
                     <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                     <span>{item}</span>
                   </li>
                 ))}
               </ul>
             </div>

           </div>
         </div>
      </section>

      {/* Founder's Guarantee */}
      <section className="py-24 px-4 sm:px-6 bg-[#050505] border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px] -z-10" />
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[32px] p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <Quote className="absolute top-8 right-8 w-16 h-16 text-white/5" />
            
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#111] shadow-[0_0_20px_rgba(16,185,129,0.2)] flex-shrink-0">
                <Image 
                  src="/chetan_profile_photo.png" 
                  alt="Founder" 
                  width={128} 
                  height={128} 
                  className="object-cover w-full h-full"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">A Note From the Founder</h3>
                <p className="text-slate-300 text-lg leading-relaxed mb-6 italic">
                  "I built Doctor Diary because I saw incredible doctors losing massive amounts of money to outdated systems and no-shows. We engineered this platform not just to be software, but to be an active revenue-generating machine for your clinic. Try it. It will pay for itself in the first week."
                </p>
                <div>
                  <div className="font-bold text-white">Chetan Pratap</div>
                  <div className="text-emerald-400 text-sm">Founder & CEO, NatureXpress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Pricing Tier */}
      <section id="pricing" className="py-24 px-4 sm:px-6 bg-[#0A0A0A] relative border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              An Investment That <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Pays For Itself.</span>
            </h2>
            <p className="text-slate-400 text-lg">
              The average clinic using Doctor Diary sees a <strong className="text-white">₹25,000 to ₹50,000</strong> increase in monthly revenue simply by eliminating no-shows.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            {/* 1 Month */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 hover:bg-[#151515] transition-colors relative group">
              <h3 className="text-xl font-semibold text-white mb-2">1 Month</h3>
              <p className="text-sm text-slate-400 mb-6 min-h-[40px]">Perfect for getting started.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₹499</span>
                <span className="text-slate-500 text-sm">/ mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Unlimited Patients", "Unlimited Appointments", "WhatsApp Reminders", "Basic Analytics"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full">
                <Button variant="outline" className="w-full rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 h-12">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* 3 Months */}
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 hover:bg-[#151515] transition-colors relative group">
              <h3 className="text-xl font-semibold text-white mb-2">3 Months</h3>
              <p className="text-sm text-slate-400 mb-6 min-h-[40px]">Great for growing clinics.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₹1,299</span>
                <span className="text-slate-500 text-sm">/ 3 mo</span>
              </div>
              <div className="mb-6 inline-block bg-white/5 text-slate-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10">
                Works out to just ₹433/month
              </div>
              <ul className="space-y-4 mb-8">
                {["Everything in 1 Month", "Priority Support", "Advanced Analytics", "Custom Branding"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full">
                <Button variant="outline" className="w-full rounded-xl bg-transparent border-white/20 text-white hover:bg-white/10 h-12">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* 12 Months - Enterprise Card */}
            <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0A0A0A] border border-emerald-500/50 rounded-3xl p-8 transform md:scale-105 shadow-[0_0_50px_rgba(16,185,129,0.15)] relative z-10 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />
              
              <div className="absolute top-4 right-4 bg-emerald-500 text-[#0A0A0A] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Best Value
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">12 Months</h3>
              <p className="text-sm text-emerald-200/70 mb-6 min-h-[40px]">Maximum ROI for established clinics.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">₹4,999</span>
                <span className="text-slate-400 text-sm">/ yr</span>
              </div>
              <div className="mb-6 inline-block bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Works out to just ₹416/month
              </div>
              <ul className="space-y-4 mb-8 relative z-10">
                {["Everything in 3 Months", "Dedicated Account Manager", "Free Digital Marketing Assets", "Premium Onboarding"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-white text-sm font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full relative z-10">
                <Button className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold h-14 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Image src="/icon-192.png" alt="Doctor Diary Logo" width={32} height={32} className="rounded-lg grayscale opacity-80" />
            </div>
            <span className="font-bold text-white text-lg">
              Doctor Diary{" "}
              <span className="font-medium text-slate-600 text-sm">
                by NatureXpress
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm font-medium text-slate-500 justify-center sm:justify-start">
            <Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-emerald-400 transition-colors">Refund Policy</Link>
            <a href="mailto:support@doctor.naturexpress.in" className="hover:text-emerald-400 transition-colors">Contact Support</a>
          </div>
          <p className="text-sm font-medium text-slate-600">
            © {new Date().getFullYear()} NatureXpress. All rights reserved.
          </p>
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
