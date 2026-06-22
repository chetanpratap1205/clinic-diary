import Link from "next/link";
import { Calendar, Clock, Bell, Shield, Star, ArrowRight, CheckCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-teal-50/80 via-teal-50/20 to-transparent -z-10" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/20 blur-[120px] -z-10" />
      <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[120px] -z-10" />

      {/* Navigation */}
      <nav className="glass sticky top-0 z-40 border-b border-slate-200/50 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">
              Doctor Diary <span className="font-medium text-slate-400 text-sm ml-1 hidden sm:inline-block">by NatureXpress</span>
            </span>
          </div>
          <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">Doctor Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-700/20 transition-all font-medium">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-28 px-4 sm:px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-teal-100 text-teal-800 rounded-full px-4 py-1.5 text-sm font-medium mb-8 animate-slide-up shadow-sm">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            Enterprise booking experience — patients book in under 30 seconds
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.15] mb-6 tracking-tight animate-slide-up" style={{ animationDelay: "100ms" }}>
            Modern appointments for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600">
              elite practices
            </span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "200ms" }}>
            Elevate your clinic's digital presence. Provide a beautiful, friction-free booking experience with automated WhatsApp reminders and a secure, premium dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "300ms" }}>
            <Link href="/signup">
              <Button size="xl" className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 shadow-xl shadow-teal-700/20 group h-14 px-8 text-base font-semibold">
                Start Free — Set Up in 5 Minutes
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/book/dr-priya-sharma">
              <Button variant="outline" size="xl" className="w-full sm:w-auto bg-white hover:bg-slate-50 border-slate-200 h-14 px-8 text-base font-medium">
                See Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-8 text-center animate-fade-in" style={{ animationDelay: "400ms" }}>
          {[
            { value: "< 30s", label: "Avg. booking time" },
            { value: "100%", label: "Mobile optimized" },
            { value: "0", label: "Patient signups needed" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
              <div className="text-sm font-medium text-slate-500 mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-teal-50/50 rounded-[100px] blur-3xl -z-10" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Everything your clinic needs</h2>
            <p className="text-slate-500 text-lg">Built securely and thoughtfully for modern healthcare professionals.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Smart Slot Management",
                description: "Set your working hours once. The system auto-generates available slots, blocks holidays, and prevents double-bookings at the database level.",
              },
              {
                icon: Bell,
                title: "WhatsApp Reminders",
                description: "Automatic confirmation, 24-hour, and 1-hour reminders via WhatsApp. Swappable to SMS or email via environment config.",
              },
              {
                icon: Shield,
                title: "Zero Double-Bookings",
                description: "Database-level unique constraint ensures zero race conditions. Even if two patients click at the exact same millisecond — only one books.",
              },
              {
                icon: Clock,
                title: "Premium Dashboard",
                description: "See today's appointments the moment you log in. Full calendar view, quick status updates, no-show marking, and patient contact info.",
              },
              {
                icon: Star,
                title: "Branded Booking Page",
                description: "Each doctor gets a beautiful shareable link like doctordiary.in/dr-sharma — with their logo, theme color, and consultation fee.",
              },
              {
                icon: Activity,
                title: "Secure Multi-tenant",
                description: "One platform, enterprise scale. Each doctor sees only their own data — securely enforced at the database level row policies.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-8 hover:shadow-xl hover:shadow-teal-900/5 hover:-translate-y-1 transition-all duration-300 animate-slide-up group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="font-bold text-slate-900 mb-3 text-lg">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 -z-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 to-indigo-900/40 -z-10" />
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight">Ready to modernize your clinic?</h2>
          <p className="text-teal-100/80 text-lg mb-10 max-w-xl mx-auto font-medium">
            Join the new standard for patient booking. Set up in 5 minutes. Share your link. Watch appointments fill up effortlessly.
          </p>
          <Link href="/signup">
            <Button size="xl" className="bg-white text-slate-900 hover:bg-teal-50 h-14 px-8 text-base font-bold shadow-2xl shadow-teal-900/50">
              Create Your Clinic — Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="font-bold text-slate-900">Doctor Diary <span className="font-medium text-slate-500 text-sm">by NatureXpress</span></span>
          </div>
          <p className="text-sm font-medium text-slate-400">© 2024 Doctor Diary by NatureXpress. Built for modern healthcare.</p>
        </div>
      </footer>
    </div>
  );
}
