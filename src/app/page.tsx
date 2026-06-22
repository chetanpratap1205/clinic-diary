import Link from "next/link";
import { Calendar, Clock, Bell, Shield, Star, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">Nature Express Hub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Doctor Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-24 px-4 sm:px-6 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            Zero friction booking — patients book in under 30 seconds
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Modern appointments for{" "}
            <span className="text-sky-600">Indian clinics</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Give your patients a beautiful, mobile-first booking experience — with automatic WhatsApp reminders, no double-bookings, and a premium dashboard for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="xl" className="w-full sm:w-auto">
                Start Free — Set Up in 5 Minutes
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/book/dr-priya-sharma">
              <Button variant="outline" size="xl" className="w-full sm:w-auto">
                See Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-slate-100 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 grid grid-cols-3 gap-8 text-center">
          {[
            { value: "< 30s", label: "Avg. booking time" },
            { value: "100%", label: "Mobile optimized" },
            { value: "0", label: "Patient signups needed" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-sky-600">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Everything your clinic needs</h2>
            <p className="text-slate-500 text-lg">Built specifically for Indian healthcare practices</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                title: "Smart Slot Management",
                description: "Set your working hours once. The system auto-generates available slots, blocks holidays, and prevents double-bookings at the database level.",
                color: "sky",
              },
              {
                icon: Bell,
                title: "WhatsApp Reminders",
                description: "Automatic confirmation, 24-hour, and 1-hour reminders via WhatsApp. Swappable to SMS or email via environment config.",
                color: "emerald",
              },
              {
                icon: Shield,
                title: "No Double-Bookings",
                description: "Database-level unique constraint ensures zero race conditions. Even if two patients click at the same millisecond — only one books.",
                color: "violet",
              },
              {
                icon: Clock,
                title: "Patient Dashboard",
                description: "See today's appointments the moment you log in. Full calendar view, quick status updates, no-show marking, and patient contact info.",
                color: "amber",
              },
              {
                icon: Star,
                title: "Branded Booking Page",
                description: "Each doctor gets a shareable link like hub.natureexpress.in/dr-sharma — with their logo, theme color, and consultation fee.",
                color: "rose",
              },
              {
                icon: CheckCircle,
                title: "Multi-tenant & Secure",
                description: "One platform, many doctors. Each doctor sees only their own data — enforced at the database level, not just the application layer.",
                color: "teal",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className={`w-10 h-10 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-5 h-5 text-${feature.color}-600`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 bg-sky-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to modernize your clinic?</h2>
          <p className="text-sky-100 text-lg mb-8">
            Set up in 5 minutes. Share your booking link. Watch appointments fill automatically.
          </p>
          <Link href="/signup">
            <Button size="xl" className="bg-white text-sky-700 hover:bg-sky-50">
              Create Your Clinic — It&apos;s Free
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-sky-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="font-semibold text-slate-700">Nature Express Hub</span>
          </div>
          <p className="text-sm text-slate-400">© 2024 Nature Express Hub. Built for Indian healthcare.</p>
        </div>
      </footer>
    </div>
  );
}
