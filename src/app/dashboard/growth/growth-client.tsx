"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, Sparkles, Megaphone, Search, Star, Presentation, QrCode, CreditCard, LayoutTemplate, Palette, Globe, Smartphone, Activity, BarChart3, MessageSquare, Bot, Building2, UserPlus, HeartPulse, Receipt, Building, Package, Share2, LineChart, MessageCircle, ShieldCheck, ArrowRight, Target, Users } from "lucide-react";
import { toast } from "sonner";
import { GrowthCard, GrowthCardProps } from "./components/GrowthCard";
import Image from "next/image";

interface GrowthClientProps {
  consultationFee: number;
  themeColor: string;
}

const growClinicServices: Omit<GrowthCardProps, 'onAction'>[] = [
  {
    id: "gmb-opt",
    title: "Google Business Profile Optimization",
    description: "Improve your Google visibility, rank higher in local searches, and help nearby patients discover your clinic.",
    icon: <Search className="text-blue-500" />,
    logoUrl: "https://logo.clearbit.com/google.com",
    badge: { text: "Popular", variant: "default" },
    price: 1499,
    pricingPeriod: "month",
  },
  {
    id: "google-reviews",
    title: "Google Reviews Growth",
    description: "Increase genuine patient reviews and strengthen trust before patients visit your clinic.",
    icon: <Star className="text-yellow-500" />,
    badge: { text: "Recommended", variant: "premium" },
    price: 1999,
    pricingPeriod: "month",
  },
  {
    id: "local-seo",
    title: "Local SEO",
    description: "Rank your clinic higher when patients search for doctors nearby.",
    icon: <Globe className="text-emerald-500" />,
    badge: { text: "Available", variant: "outline" },
    price: 2999,
    pricingPeriod: "month",
  },
  {
    id: "google-ads",
    title: "Google Ads",
    description: "Launch targeted campaigns that bring appointment-ready patients to your clinic.",
    icon: <Search className="text-blue-500" />,
    logoUrl: "https://logo.clearbit.com/google.com",
    badge: { text: "Available", variant: "outline" },
    price: 4999,
    pricingPeriod: "month",
  },
  {
    id: "social-media",
    title: "Social Media Marketing",
    description: "Professionally designed posts and campaigns that build trust and awareness.",
    icon: <Share2 className="text-pink-500" />,
    logoUrl: "https://logo.clearbit.com/meta.com",
    badge: { text: "Available", variant: "outline" },
    price: 3499,
    pricingPeriod: "month",
  }
];

const brandClinicServices: Omit<GrowthCardProps, 'onAction'>[] = [
  {
    id: "qr-kit",
    title: "Premium QR Kit",
    description: "Exclusive Doctor Diary QR Growth System. Outside QR for 24/7 bookings, Reception QR for skipping queues, and Patient File QR for instant re-booking.",
    icon: <QrCode className="text-emerald-500" />,
    badge: { text: "Exclusive", variant: "premium" },
    price: 999,
    pricingPeriod: "one-time",
  },
  {
    id: "visiting-cards",
    title: "Visiting Cards",
    description: "Premium, minimal design visiting cards that leave a lasting impression.",
    icon: <CreditCard className="text-slate-400" />,
    badge: { text: "Available", variant: "outline" },
    price: 1499,
    pricingPeriod: "per 1000",
  },
  {
    id: "reception-branding",
    title: "Reception Branding",
    description: "Reception stands, window stickers, and counter branding for a modern clinic look.",
    icon: <LayoutTemplate className="text-indigo-400" />,
    badge: { text: "Available", variant: "outline" },
    price: 3999,
    pricingPeriod: "one-time",
  },
  {
    id: "posters",
    title: "Posters",
    description: "Professional clinic posters for patient education and brand awareness.",
    icon: <Presentation className="text-orange-400" />,
    badge: { text: "Available", variant: "outline" },
    price: 499,
    pricingPeriod: "per set",
  },
  {
    id: "website",
    title: "Website",
    description: "Fast, responsive, SEO-ready, and appointment-enabled premium doctor landing page.",
    icon: <Globe className="text-blue-400" />,
    badge: { text: "Popular", variant: "default" },
    price: 9999,
    pricingPeriod: "one-time",
  }
];

const trustedPartners: Omit<GrowthCardProps, 'onAction'>[] = [
  {
    id: "apollo-diagnostics",
    title: "Apollo Diagnostics",
    description: "Integrated lab test bookings and digital reports directly in Clinic Diary.",
    icon: <Activity className="text-blue-600" />,
    logoUrl: "https://logo.clearbit.com/apollodiagnostics.in",
    badge: { text: "Available", variant: "success" },
    isIntegrated: true,
  },
  {
    id: "tata-1mg",
    title: "Tata 1mg",
    description: "Seamless e-pharmacy integration for automated prescription fulfillment.",
    icon: <HeartPulse className="text-red-500" />,
    logoUrl: "https://logo.clearbit.com/1mg.com",
    badge: { text: "Available", variant: "outline" },
  },
  {
    id: "razorpay",
    title: "Razorpay",
    description: "Collect payments seamlessly via UPI, Cards, and Netbanking.",
    icon: <CreditCard className="text-blue-500" />,
    logoUrl: "https://logo.clearbit.com/razorpay.com",
    badge: { text: "Available", variant: "outline" },
  },
  {
    id: "msg91",
    title: "MSG91",
    description: "Reliable SMS delivery for patient alerts, OTPs, and booking confirmations.",
    icon: <MessageSquare className="text-orange-500" />,
    logoUrl: "https://logo.clearbit.com/msg91.com",
    badge: { text: "Available", variant: "outline" },
  },
  {
    id: "whatsapp-meta",
    title: "WhatsApp Business",
    description: "Official WhatsApp Cloud API integration for automated patient communication.",
    icon: <MessageCircle className="text-emerald-500" />,
    logoUrl: "https://logo.clearbit.com/whatsapp.com",
    badge: { text: "Premium", variant: "premium" },
  }
];

const premiumTools: Omit<GrowthCardProps, 'onAction'>[] = [
  {
    id: "ai-receptionist",
    title: "AI Voice Receptionist",
    description: "Intelligent voice assistant to handle patient calls 24/7, book appointments, and answer FAQs.",
    icon: <Bot className="text-indigo-500" />,
    badge: { text: "Premium", variant: "premium" },
    price: 4999,
    pricingPeriod: "month",
  },
  {
    id: "whatsapp-auto",
    title: "WhatsApp Automation",
    description: "Automated appointment reminders, patient follow-ups, and review requests via WhatsApp.",
    icon: <MessageCircle className="text-emerald-500" />,
    logoUrl: "https://logo.clearbit.com/whatsapp.com",
    badge: { text: "Available", variant: "outline" },
    price: 1999,
    pricingPeriod: "month",
  },
  {
    id: "sms-auto",
    title: "SMS Automation",
    description: "Ensure high delivery rates for critical appointment reminders and health alerts.",
    icon: <MessageSquare className="text-blue-500" />,
    badge: { text: "Available", variant: "outline" },
    price: 999,
    pricingPeriod: "month",
  },
  {
    id: "clinic-analytics",
    title: "Clinic Analytics",
    description: "Modern dashboard with charts and growth metrics to track your clinic's performance.",
    icon: <LineChart className="text-emerald-400" />,
    badge: { text: "Popular", variant: "default" },
  },
  {
    id: "advanced-reports",
    title: "Advanced Reports",
    description: "Deep dive into financial, patient demographic, and operational analytics.",
    icon: <BarChart3 className="text-purple-400" />,
    badge: { text: "Available", variant: "outline" },
  }
];

export function GrowthClient({ consultationFee, themeColor }: GrowthClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const handleAction = (service: any) => {
    setSelectedService(service);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-16 pb-20">
      
      {/* Enterprise Hero Section */}
      <section className="relative bg-slate-900 rounded-[2rem] p-8 md:p-16 text-center lg:text-left shadow-2xl border border-slate-800 overflow-hidden mb-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900 pointer-events-none" />
        
        <div className="relative z-10 lg:w-1/2 space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full font-semibold text-sm mb-2 border border-blue-500/20">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Enterprise Clinic Growth Platform
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Scale Your Practice <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              With Predictable ROI
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Stop losing potential patients to competitors. Doctor Diary provides end-to-end digital marketing and premium branding solutions that position your clinic as the top choice in your city.
          </p>
          
          <div className="pt-6 flex flex-wrap gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              className="rounded-full h-14 px-8 text-lg font-bold bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-600/30"
              onClick={() => {
                document.getElementById('grow-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Solutions
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4 px-4 py-3 bg-slate-800/50 rounded-full border border-slate-700/50">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center font-bold text-xs text-white">4.9</div>
                <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-slate-900 flex items-center justify-center"><Star className="w-4 h-4 text-white fill-white" /></div>
              </div>
              <div className="text-sm font-medium text-slate-300 text-left leading-tight">
                Trusted by <br/><span className="text-white font-bold">1,200+ Top Clinics</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 lg:w-1/2 w-full max-w-xl mx-auto">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 bg-slate-800">
            <Image 
              src="/assets/growth/clinic-reception.png" 
              alt="Modern Clinic Reception" 
              fill
              className="object-cover"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            
            {/* ROI Stats Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-white tracking-tight">+42%</div>
                  <div className="text-sm font-medium text-emerald-100 uppercase tracking-wider">Average Patient Footfall</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-900 shadow-xl hidden md:block">
            <Image 
              src="/assets/growth/doctor-tablet.png"
              alt="Doctor Using Tablet"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ROI & Trust Section (Replaced Pain Points) */}
      <section className="mb-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
            Why Top Clinics Choose Doctor Diary Growth
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            We don't just provide software; we provide a proven blueprint for clinic expansion.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 hover:shadow-xl hover:shadow-blue-900/5 transition-all text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">3x</div>
            <h3 className="text-lg font-bold text-slate-700 mb-3 uppercase tracking-wider">Search Visibility</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Clinics using our local SEO and GMB optimization see a 300% increase in calls directly from Google search within 90 days.
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 hover:shadow-xl hover:shadow-emerald-900/5 transition-all text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10" />
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">68%</div>
            <h3 className="text-lg font-bold text-slate-700 mb-3 uppercase tracking-wider">Patient Retention</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              Our WhatsApp automation and premium branding keeps patients returning to your clinic for follow-ups instead of seeking alternatives.
            </p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-8 hover:shadow-xl hover:shadow-indigo-900/5 transition-all text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-indigo-600 fill-indigo-600/20" />
            </div>
            <div className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">4.8+</div>
            <h3 className="text-lg font-bold text-slate-700 mb-3 uppercase tracking-wider">Average Rating</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              We automate review collection directly from happy patients, burying negative feedback and building bulletproof trust.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: Grow My Clinic */}
      <section id="grow-section" className="space-y-8 mb-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Grow My Clinic
          </h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Bring more patients to your clinic with proven digital growth services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {growClinicServices.map((service) => (
            <GrowthCard key={service.id} {...service} onAction={() => handleAction(service)} />
          ))}
        </div>
      </section>

      {/* Section 2: Brand My Clinic */}
      <section className="space-y-8 mb-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Palette className="w-8 h-8 text-indigo-600" />
            Brand My Clinic
          </h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Create a modern clinic experience that patients remember.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brandClinicServices.map((service) => (
            <GrowthCard key={service.id} {...service} onAction={() => handleAction(service)} />
          ))}
        </div>
      </section>

      {/* Section 3: Trusted Partners */}
      <section className="space-y-8 mb-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            Trusted Partners
          </h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Carefully selected partners to support your clinic's operations and growth.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustedPartners.map((service) => (
            <GrowthCard key={service.id} {...service} onAction={() => handleAction(service)} />
          ))}
        </div>
      </section>

      {/* Section 4: Premium Tools */}
      <section className="space-y-8 mb-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Bot className="w-8 h-8 text-purple-600" />
            Premium Tools
          </h2>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            Power your clinic with intelligent automation and deep insights.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {premiumTools.map((service) => (
            <GrowthCard key={service.id} {...service} onAction={() => handleAction(service)} />
          ))}
        </div>
      </section>

      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl text-slate-900">
              {selectedService?.logoUrl ? (
                <Image src={selectedService.logoUrl} alt={selectedService.title} width={24} height={24} className="rounded-sm" unoptimized />
              ) : selectedService?.icon ? (
                <div className="w-6 h-6">{selectedService.icon}</div>
              ) : null}
              {selectedService?.title}
            </DialogTitle>
            <DialogDescription className="text-slate-500 pt-2 text-base leading-relaxed font-medium">
              {selectedService?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <p className="text-sm text-blue-800 bg-blue-50 p-4 rounded-xl border border-blue-100 font-medium">
              Our team will get in touch with you shortly to configure this service for your clinic.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20"
              onClick={() => {
                toast.success("Request sent successfully! Our growth team will contact you soon.");
                setIsDialogOpen(false);
              }}
            >
              Request Setup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
