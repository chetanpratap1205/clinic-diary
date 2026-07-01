import Link from "next/link";
import {
  Calendar,
  Clock,
  Bell,
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
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallButton } from "@/components/pwa-provider";
import { PremiumIcon } from "@/components/ui/premium-icon";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface-50 relative overflow-hidden font-sans selection:bg-primary-100 selection:text-primary-950">
      {/* Premium Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-primary-50/90 via-surface-50/50 to-transparent -z-10" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-200/20 blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '5s' }} />

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm flex-shrink-0">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-surface-950 text-lg sm:text-xl tracking-tight">
              Doctor Diary{" "}
              <span className="font-medium text-surface-500 text-xs sm:text-sm ml-1 hidden sm:inline-block">
                by NatureXpress
              </span>
            </span>
          </div>
          <div
            className="flex items-center gap-3 sm:gap-4 animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            <div className="hidden md:block">
              <InstallButton />
            </div>
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium text-sm h-9 px-4 hidden sm:inline-flex text-surface-600 hover:text-surface-950 hover:bg-surface-100"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/20 transition-all font-medium text-sm h-9 px-5 rounded-full"
              >
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 relative">
        <div className="max-w-5xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-primary-200/50 text-primary-800 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold mb-8 shadow-sm animate-slide-up"
          >
            <TrendingUp strokeWidth={1.5} className="w-4 h-4 text-primary-600 flex-shrink-0" />
            <span>Maximize Clinic Revenue & Eliminate No-Shows</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-surface-950 mb-6 tracking-tight animate-slide-up leading-[1.1]"
            style={{ animationDelay: "100ms" }}
          >
            Stop Losing Patients to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-400 to-indigo-500">
              Busy Phone Lines.
            </span>
          </h1>
          <p
            className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            The enterprise-grade booking OS for top-tier clinics. Automate 24/7 self-serve scheduling, send smart WhatsApp reminders, and watch your daily revenue grow as empty slots disappear.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 shadow-xl shadow-primary-600/25 group h-14 px-8 text-base font-semibold rounded-full"
              >
                Start Your Free Setup
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-surface-500 mt-2 sm:mt-0">
              <CheckCircle className="w-4 h-4 text-primary-500" /> No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Premium Value Strip */}
      <section className="py-8 border-y border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap justify-center gap-8 sm:gap-16 items-center text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-slate-800 mb-1">
              <Shield className="w-5 h-5 text-teal-600" />
              <span className="text-xl font-bold">Secure Architecture</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Built on Modern Cloud Tech</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-slate-800 mb-1">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span className="text-xl font-bold">Revenue Focused</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maximize Patient Throughput</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 text-slate-800 mb-1">
              <Star className="w-5 h-5 text-orange-600" />
              <span className="text-xl font-bold">Premium Brand</span>
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Elevate Patient Experience</span>
          </div>
        </div>
      </section>

      {/* ROI Metrics Section */}
      <section className="py-20 px-4 sm:px-6 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Real Numbers, Real Revenue.</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">What happens when you replace manual reception work with intelligent automation.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { metric: "85%", label: "Reduction in No-Shows", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
              { metric: "40+", label: "Hours Saved Monthly", icon: Clock, color: "text-teal-600", bg: "bg-teal-50" },
              { metric: "25%", label: "Increase in Revenue", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
              { metric: "<30s", label: "Patient Booking Time", icon: Zap, color: "text-orange-600", bg: "bg-orange-50" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-all text-center group">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform">
                  <PremiumIcon Icon={stat.icon} variant="glass" size="lg" />
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-2">{stat.metric}</h3>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem vs Solution */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* The Pain */}
            <div className="bg-red-50/50 border border-red-100 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-red-400" />
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">✕</div>
                The Old Way
              </h3>
              <ul className="space-y-4">
                {[
                  "Phone lines constantly busy, turning away new patients.",
                  "High no-show rates because staff forgot to call and remind.",
                  "Receptionists overwhelmed with scheduling instead of patient care.",
                  "Double bookings leading to crowded waiting rooms and angry patients.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The Solution */}
            <div className="bg-white border border-teal-100 rounded-3xl p-8 sm:p-12 shadow-xl shadow-teal-900/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-teal-500" />
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700"><Check className="w-5 h-5" /></div>
                With Doctor Diary
              </h3>
              <ul className="space-y-4">
                {[
                  "Patients book instantly via a 24/7 beautiful booking link.",
                  "Automated WhatsApp reminders ensure patients actually show up.",
                  "Staff focus on providing a premium in-clinic experience.",
                  "Database-level constraints guarantee zero double bookings.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="py-20 sm:py-32 px-4 sm:px-6 relative bg-white">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-primary-50/50 rounded-[100px] blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold text-surface-950 mb-6 tracking-tight">
              Enterprise Power. <br/> Start-up Simplicity.
            </h2>
            <p className="text-surface-500 text-lg">
              Everything you need to run a high-volume, modern clinic without the IT headaches.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - Large */}
            <div className="md:col-span-2 bg-surface-50 border border-surface-200 rounded-3xl p-8 sm:p-10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-100 rounded-full blur-2xl group-hover:bg-primary-200 transition-colors" />
              <div className="mb-6 relative z-10">
                <PremiumIcon Icon={MessageSquare} variant="success" size="xl" />
              </div>
              <h3 className="text-2xl font-bold text-surface-950 mb-3 relative z-10">Smart WhatsApp Automations</h3>
              <p className="text-surface-600 text-lg max-w-md relative z-10">
                Stop manually calling patients. Our system automatically sends instant booking confirmations, 24-hour reminders, and 1-hour follow-ups directly to their WhatsApp.
              </p>
            </div>

            {/* Feature 2 - Small */}
            <div className="bg-surface-50 border border-surface-200 rounded-3xl p-8 sm:p-10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-100 rounded-full blur-2xl group-hover:bg-indigo-200 transition-colors" />
              <div className="mb-6 relative z-10">
                <PremiumIcon Icon={Shield} variant="purple" size="xl" />
              </div>
              <h3 className="text-xl font-bold text-surface-950 mb-3 relative z-10">Zero Double Bookings</h3>
              <p className="text-surface-600 relative z-10">
                Database-level unique constraints ensure that even if two patients click book at the exact same millisecond, only one gets the slot.
              </p>
            </div>

            {/* Feature 3 - Small */}
            <div className="bg-surface-50 border border-surface-200 rounded-3xl p-8 sm:p-10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group relative overflow-hidden">
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-orange-100 rounded-full blur-2xl group-hover:bg-orange-200 transition-colors" />
              <div className="mb-6 relative z-10">
                <PremiumIcon Icon={Star} variant="warning" size="xl" />
              </div>
              <h3 className="text-xl font-bold text-surface-950 mb-3 relative z-10">Branded Booking Link</h3>
              <p className="text-surface-600 relative z-10">
                Share your beautiful, personalized booking page on Instagram, WhatsApp, or Google My Business. Look premium from the first click.
              </p>
            </div>

            {/* Feature 4 - Large */}
            <div className="md:col-span-2 bg-surface-950 rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden relative group">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-primary-900/50 rounded-full blur-3xl" />
              <div className="mb-6 relative z-10">
                <PremiumIcon Icon={BarChart3} variant="solid" size="xl" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Executive Analytics Dashboard</h3>
              <p className="text-surface-300 text-lg max-w-md relative z-10">
                See your clinic&apos;s pulse at a glance. Track daily revenue, patient retention, slot utilization, and receptionist performance in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & ROI Section */}
      <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 relative bg-surface-950 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/15 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              An Investment That <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">Pays For Itself.</span>
            </h2>
            <p className="text-surface-400 text-lg">
              The average clinic using Doctor Diary sees a <strong className="text-white">₹25,000 to ₹50,000</strong> increase in monthly revenue just by eliminating no-shows and filling empty slots.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            {/* 1 Month Tier */}
            <div className="bg-surface-900/50 backdrop-blur-md border border-surface-800/50 rounded-3xl p-8 hover:bg-surface-900 transition-colors">
              <h3 className="text-xl font-semibold text-surface-100 mb-2">1 Month</h3>
              <p className="text-sm text-surface-400 mb-6 min-h-[40px]">Perfect for getting started.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₹499</span>
                <span className="text-surface-400 text-sm">/ mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Unlimited Patients", "Unlimited Appointments", "SMS & Email Reminders", "Basic Analytics", "Standard Support"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-surface-300 text-sm">
                    <Check className="w-4 h-4 text-primary-400 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full">
                <Button variant="outline" className="w-full rounded-xl bg-transparent border-surface-700 text-surface-300 hover:bg-surface-800 hover:text-white h-12">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* 3 Months Tier */}
            <div className="bg-surface-900/50 backdrop-blur-md border border-surface-800/50 rounded-3xl p-8 hover:bg-surface-900 transition-colors">
              <h3 className="text-xl font-semibold text-surface-100 mb-2">3 Months</h3>
              <p className="text-sm text-surface-400 mb-6 min-h-[40px]">Great for growing clinics.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₹1,299</span>
                <span className="text-surface-400 text-sm">/ 3 mo</span>
              </div>
              <div className="mb-6 inline-block bg-surface-800/50 text-surface-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-surface-700/50">
                Works out to just ₹433/month
              </div>
              <ul className="space-y-4 mb-8">
                {["Everything in 1 Month", "Priority Support", "Advanced Analytics", "Custom Branding"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-surface-300 text-sm">
                    <Check className="w-4 h-4 text-primary-400 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full">
                <Button variant="outline" className="w-full rounded-xl bg-transparent border-surface-700 text-surface-300 hover:bg-surface-800 hover:text-white h-12">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* 12 Months Tier - Make it popular */}
            <div className="bg-gradient-to-b from-primary-900/80 to-surface-900/90 backdrop-blur-md border border-primary-500/30 rounded-3xl p-8 transform md:scale-105 shadow-2xl shadow-primary-900/40 relative z-10">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-400 to-indigo-500 rounded-t-3xl" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap shadow-sm">
                Best Value
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">12 Months</h3>
              <p className="text-sm text-primary-100/70 mb-6 min-h-[40px]">Maximum ROI for established clinics.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₹4,999</span>
                <span className="text-surface-400 text-sm">/ yr</span>
              </div>
              <div className="mb-6 inline-block bg-primary-950/50 text-primary-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-primary-800/50">
                Works out to just ₹416/month
              </div>
              <ul className="space-y-4 mb-8">
                {["Everything in 3 Months", "Dedicated Account Manager", "Early Access to Features", "Premium Onboarding"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-surface-100 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary-400 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full">
                <Button className="w-full rounded-xl bg-primary-500 hover:bg-primary-400 text-surface-950 font-bold h-12 shadow-[0_8px_30px_rgb(28,181,137,0.3)]">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Free In-Clinic Demo Banner */}
          <div className="mt-16 max-w-4xl mx-auto p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-primary-900/40 to-surface-900/60 border border-primary-500/30 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/20 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-[60px]" />
            
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-primary-500/20 flex items-center justify-center border border-primary-500/30 text-primary-400 relative z-10">
              <Users className="w-10 h-10" />
            </div>
            
            <div className="text-center sm:text-left relative z-10 flex-1">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Want to see it in action? <span className="text-primary-400">Get a Free Demo</span>
              </h3>
              <p className="text-surface-300 text-base sm:text-lg mb-6 sm:mb-0 max-w-xl">
                Our team will visit your clinic, demonstrate how the platform increases revenue, and set up your system for absolutely free. 
              </p>
            </div>
            
            <div className="flex-shrink-0 relative z-10">
              <Link href="/signup">
                <Button className="bg-white text-primary-950 hover:bg-surface-50 font-bold px-8 h-14 rounded-xl shadow-[0_8px_30px_rgb(255,255,255,0.15)] whitespace-nowrap">
                  Book Free Visit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Strategic Advantage (Replacing Fake Testimonials) */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">The Dual Engine of Growth</h2>
            <p className="text-slate-500 text-lg">Doctor Diary isn&apos;t just a calendar. It&apos;s a strategic asset engineered to drive measurable clinic profitability while simultaneously elevating your practice&apos;s brand perception in the market.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Profit Focus */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110" />
              <div className="mb-6">
                <PremiumIcon Icon={TrendingUp} variant="success" size="lg" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Direct Revenue Optimization</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Every missed appointment is irretrievably lost revenue. By deploying aggressive, automated WhatsApp reminder sequences and frictionless 24/7 self-service booking, Doctor Diary systematically plugs the leaks in your schedule. 
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="w-5 h-5 text-teal-500" /> Maximize daily billable hours</li>
                <li className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="w-5 h-5 text-teal-500" /> Eliminate administrative bottlenecks</li>
                <li className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="w-5 h-5 text-teal-500" /> Accelerate patient acquisition loops</li>
              </ul>
            </div>

            {/* Brand Focus */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -z-10 transition-transform group-hover:scale-110" />
              <div className="mb-6">
                <PremiumIcon Icon={Star} variant="purple" size="lg" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Premium Brand Authority</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Your patient&apos;s experience begins long before they enter your waiting room. A seamless, modern digital booking interface signals that your clinic utilizes state-of-the-art technology and respects their time.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="w-5 h-5 text-indigo-500" /> Project an enterprise-grade digital presence</li>
                <li className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="w-5 h-5 text-indigo-500" /> Stand out against legacy-system competitors</li>
                <li className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="w-5 h-5 text-indigo-500" /> Cultivate high-end patient loyalty</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-surface-950 -z-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/60 to-surface-950/90 -z-10" />
        
        {/* Abstract decorative element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
        
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Ready to upgrade your practice?
          </h2>
          <p className="text-primary-50 text-lg sm:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
            Join the top 1% of digital-first clinics. Set up your account in 5 minutes, share your link, and let the system fill your calendar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-surface-950 hover:bg-surface-50 h-14 px-10 text-base font-bold shadow-[0_8px_30px_rgb(255,255,255,0.1)] rounded-full"
              >
                Create Your Clinic — Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-surface-400 text-sm mt-6">
            Full access. No credit card required to start.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="font-bold text-slate-900 text-lg">
              Doctor Diary{" "}
              <span className="font-medium text-slate-500 text-sm">
                by NatureXpress
              </span>
            </span>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-6 text-sm font-medium text-slate-500 justify-center sm:justify-start">
            <Link href="/privacy" className="hover:text-teal-700 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-teal-700 transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-teal-700 transition-colors">Refund Policy</Link>
            <a href="mailto:support@doctor.naturexpress.in" className="hover:text-teal-700 transition-colors">Contact Support</a>
          </div>
          <p className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} NatureXpress. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
