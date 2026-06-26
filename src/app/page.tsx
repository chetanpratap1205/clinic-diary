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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Premium Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-teal-50/90 via-slate-50/50 to-transparent -z-10" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/20 blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '5s' }} />

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-slate-200/50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 animate-fade-in">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-sm flex-shrink-0">
              <Activity className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
              Doctor Diary{" "}
              <span className="font-medium text-slate-400 text-xs sm:text-sm ml-1 hidden sm:inline-block">
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
                className="font-medium text-sm h-9 px-4 hidden sm:inline-flex text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="sm"
                className="bg-teal-700 hover:bg-teal-800 text-white shadow-lg shadow-teal-700/20 transition-all font-medium text-sm h-9 px-5 rounded-full"
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
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-teal-100/50 text-teal-800 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold mb-8 shadow-sm animate-slide-up"
          >
            <TrendingUp className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>Maximize Clinic Revenue & Eliminate No-Shows</span>
          </div>
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 tracking-tight animate-slide-up leading-[1.1]"
            style={{ animationDelay: "100ms" }}
          >
            Stop Losing Patients to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-600">
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
                className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 shadow-xl shadow-teal-700/25 group h-14 px-8 text-base font-semibold rounded-full"
              >
                Start Your Free Setup
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-2 sm:mt-0">
              <CheckCircle className="w-4 h-4 text-teal-600" /> No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="py-8 border-y border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap justify-center gap-8 sm:gap-16 items-center text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-slate-800">500+</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Clinics Onboarded</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-slate-800">₹10M+</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Consultations</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-slate-800">Zero</span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Double Bookings</span>
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
                <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-teal-50/50 rounded-[100px] blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
              Enterprise Power. <br/> Start-up Simplicity.
            </h2>
            <p className="text-slate-500 text-lg">
              Everything you need to run a high-volume, modern clinic without the IT headaches.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 - Large */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-100 rounded-full blur-2xl group-hover:bg-teal-200 transition-colors" />
              <MessageSquare className="w-10 h-10 text-teal-700 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">Smart WhatsApp Automations</h3>
              <p className="text-slate-600 text-lg max-w-md relative z-10">
                Stop manually calling patients. Our system automatically sends instant booking confirmations, 24-hour reminders, and 1-hour follow-ups directly to their WhatsApp.
              </p>
            </div>

            {/* Feature 2 - Small */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 hover:shadow-lg transition-all group relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-100 rounded-full blur-2xl group-hover:bg-indigo-200 transition-colors" />
              <Shield className="w-10 h-10 text-indigo-700 mb-6 relative z-10" />
              <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">Zero Double Bookings</h3>
              <p className="text-slate-600 relative z-10">
                Database-level unique constraints ensure that even if two patients click book at the exact same millisecond, only one gets the slot.
              </p>
            </div>

            {/* Feature 3 - Small */}
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 hover:shadow-lg transition-all group relative overflow-hidden">
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-orange-100 rounded-full blur-2xl group-hover:bg-orange-200 transition-colors" />
              <Star className="w-10 h-10 text-orange-600 mb-6 relative z-10" />
              <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">Branded Booking Link</h3>
              <p className="text-slate-600 relative z-10">
                Share your beautiful, personalized booking page on Instagram, WhatsApp, or Google My Business. Look premium from the first click.
              </p>
            </div>

            {/* Feature 4 - Large */}
            <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl overflow-hidden relative group">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-teal-900/50 rounded-full blur-3xl" />
              <BarChart3 className="w-10 h-10 text-teal-400 mb-6 relative z-10" />
              <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Executive Analytics Dashboard</h3>
              <p className="text-slate-300 text-lg max-w-md relative z-10">
                See your clinic&apos;s pulse at a glance. Track daily revenue, patient retention, slot utilization, and receptionist performance in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing & ROI Section */}
      <section id="pricing" className="py-20 sm:py-32 px-4 sm:px-6 relative bg-slate-900 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
              An Investment That <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Pays For Itself.</span>
            </h2>
            <p className="text-slate-400 text-lg">
              The average clinic using Doctor Diary sees a <strong className="text-white">₹25,000 to ₹50,000</strong> increase in monthly revenue just by eliminating no-shows and filling empty slots.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {/* Free Tier */}
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800 transition-colors">
              <h3 className="text-xl font-semibold text-slate-200 mb-2">Free Plan</h3>
              <p className="text-sm text-slate-400 mb-6 min-h-[40px]">Perfect for exploring the platform.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₹0</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Up to 5 Patients", "Basic Analytics", "Booking Link"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-teal-400 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full">
                <Button variant="outline" className="w-full rounded-xl bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-12">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Popular Tier */}
            <div className="bg-gradient-to-b from-teal-900/80 to-slate-800/90 backdrop-blur-md border border-teal-500/30 rounded-3xl p-8 transform md:scale-105 shadow-2xl shadow-teal-900/50 relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-t-3xl" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">12 Months</h3>
              <p className="text-sm text-teal-200/70 mb-6 min-h-[40px]">Maximum ROI for established clinics.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₹4,999</span>
                <span className="text-slate-400 text-sm">/ yr</span>
              </div>
              <div className="mb-6 inline-block bg-teal-950/50 text-teal-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-teal-800/50">
                Works out to just ₹416/month
              </div>
              <ul className="space-y-4 mb-8">
                {["Unlimited Patients & Appointments", "Automated WhatsApp Reminders", "Advanced Analytics", "Zero Double Bookings", "Priority Support"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-200 text-sm">
                    <CheckCircle className="w-4 h-4 text-teal-400 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full">
                <Button className="w-full rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold h-12 shadow-lg shadow-teal-500/25">
                  Start Your Practice
                </Button>
              </Link>
            </div>

            {/* Monthly Tier */}
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8 hover:bg-slate-800 transition-colors">
              <h3 className="text-xl font-semibold text-slate-200 mb-2">1 Month</h3>
              <p className="text-sm text-slate-400 mb-6 min-h-[40px]">Flexibility to grow at your pace.</p>
              <div className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-white">₹499</span>
                <span className="text-slate-400 text-sm">/ mo</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Unlimited Patients & Appointments", "Automated WhatsApp Reminders", "Standard Analytics", "Zero Double Bookings"].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-teal-400 flex-shrink-0" /> {feat}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full">
                <Button variant="outline" className="w-full rounded-xl bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white h-12">
                  Go Monthly
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-16 text-center max-w-2xl mx-auto p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <Shield className="w-8 h-8 text-teal-500" />
            <div className="text-left">
              <h4 className="text-white font-semibold">100% Money-Back Guarantee</h4>
              <p className="text-sm text-slate-400">If you don't see an increase in patient turnout within 30 days, we'll refund your money. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Trusted by Top Practitioners</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
              <div className="text-teal-600 mb-4 flex gap-1">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 text-lg italic mb-6">
                &quot;Doctor Diary completely transformed our clinic. We went from chaotic mornings to everything being neatly organized. Our revenue is up 30% because our slots are always fully utilized and no-shows are basically zero.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg">
                  AS
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Dr. Amit Sharma</h4>
                  <p className="text-sm text-slate-500">Chief Cardiologist, HeartCare Clinic</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative">
              <div className="text-teal-600 mb-4 flex gap-1">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-slate-700 text-lg italic mb-6">
                &quot;The WhatsApp reminders are an absolute game changer. Patients love how easy it is to book on their phones. My front desk finally has time to actually greet patients instead of being glued to the phone.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                  PP
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Dr. Priya Patel</h4>
                  <p className="text-sm text-slate-500">Dermatologist & Founder, SkinGlow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 -z-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/60 to-slate-900/90 -z-10" />
        
        {/* Abstract decorative element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-600/20 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3" />
        
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            Ready to upgrade your practice?
          </h2>
          <p className="text-teal-50 text-lg sm:text-xl mb-10 max-w-2xl mx-auto font-medium leading-relaxed opacity-90">
            Join the top 1% of digital-first clinics. Set up your account in 5 minutes, share your link, and let the system fill your calendar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 h-14 px-10 text-base font-bold shadow-2xl shadow-teal-900/50 rounded-full"
              >
                Create Your Clinic — Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-slate-400 text-sm mt-6">
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
            <a href="mailto:support@naturexpress.com" className="hover:text-teal-700 transition-colors">Contact Support</a>
          </div>
          <p className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} NatureXpress. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
