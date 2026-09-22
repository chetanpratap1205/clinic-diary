"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Sparkles,
  Search,
  Star,
  Globe,
  QrCode,
  CreditCard,
  LayoutTemplate,
  Activity,
  BarChart3,
  MessageSquare,
  Bot,
  Building2,
  HeartPulse,
  Share2,
  LineChart,
  MessageCircle,
  ShieldCheck,
  Target,
  Users,
  CheckCircle2,
  Clock,
  Zap,
  ArrowRight,
  Filter,
  PlusCircle,
  PhoneCall,
  CalendarCheck,
  Send,
  Layers,
  Sparkle,
  Stethoscope,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";
import { GrowthCard, GrowthCardProps } from "./components/GrowthCard";
import { requestGrowthService } from "./actions";

interface GrowthClientProps {
  consultationFee: number;
  themeColor: string;
  requestedServices?: Record<string, string>;
}

export interface GrowthServiceItem extends Omit<GrowthCardProps, "onAction"> {
  category: "acquisition" | "retention" | "branding" | "partners" | "ai";
}

const allGrowthServices: GrowthServiceItem[] = [
  // --- ACQUISITION & SEO ---
  {
    id: "gmb-opt",
    title: "Google Business Profile Optimization",
    description: "Rank #1 on Google Maps when local patients search for 'doctor near me' or specialist clinics.",
    category: "acquisition",
    targetRole: "doctor",
    icon: <Search className="text-blue-600" />,
    badge: { text: "High Demand", variant: "default" },
    price: 2999,
    pricingPeriod: "month",
    stats: [
      { label: "Google Views", value: "+320%" },
      { label: "New Patient Calls", value: "3.2x" },
    ],
    features: ["Profile Setup & Verification", "Keyword & Category Optimization", "Monthly Local Search Report"],
  },
  {
    id: "google-reviews",
    title: "Automated Google Review Growth",
    description: "Automatically send WhatsApp review requests to happy patients post-consultation to reach 4.9+ stars.",
    category: "acquisition",
    targetRole: "both",
    icon: <Star className="text-amber-500" />,
    badge: { text: "Must Have", variant: "premium" },
    price: 1999,
    pricingPeriod: "month",
    stats: [
      { label: "Avg Google Rating", value: "4.9★" },
      { label: "Review Conversion", value: "94%" },
    ],
    features: ["Automated Post-Visit SMS/WhatsApp", "Negative Feedback Interception", "Live Review Showcase Widget"],
  },
  {
    id: "local-seo",
    title: "Hyperlocal Clinic SEO Engine",
    description: "Dominate organic Google search results in your city for your medical specialty.",
    category: "acquisition",
    targetRole: "doctor",
    icon: <Globe className="text-emerald-600" />,
    badge: { text: "Organic Growth", variant: "outline" },
    price: 2999,
    pricingPeriod: "month",
    stats: [
      { label: "Local Search Rank", value: "Top 3" },
      { label: "Organic Traffic", value: "+180%" },
    ],
    features: ["Competitor Rank Analysis", "Medical Directory Listings", "On-Page SEO & Schema"],
  },
  {
    id: "google-ads",
    title: "Targeted Patient Acquisition Ads",
    description: "High-ROI Google & Meta ad campaigns targeting patients looking for immediate appointments.",
    category: "acquisition",
    targetRole: "doctor",
    icon: <Target className="text-red-500" />,
    badge: { text: "Max Footfall", variant: "success" },
    price: 8999,
    pricingPeriod: "month",
    stats: [
      { label: "Avg Campaign ROI", value: "5.4x" },
      { label: "Booking Conversion", value: "28%" },
    ],
    features: ["Precision Keyword Bidding", "Ad Copy & Landing Page", "Transparent Weekly Reports"],
  },
  {
    id: "clinic-website",
    title: "Premium Website & Online Booking Page",
    description: "Lightning-fast landing page with 24/7 instant online booking for your patients.",
    category: "acquisition",
    targetRole: "both",
    icon: <Globe className="text-indigo-600" />,
    badge: { text: "Enterprise", variant: "default" },
    price: 7999,
    pricingPeriod: "one-time",
    stats: [
      { label: "Load Speed", value: "<1.2s" },
      { label: "Mobile Ready", value: "100%" },
    ],
    features: ["Custom Domain Integration", "Real-Time Schedule Sync", "SEO & Speed Optimized"],
  },

  // --- RETENTION & RECALLS (DOCTOR & RECEPTIONIST VALUE) ---
  {
    id: "patient-recall",
    title: "Automated Patient Recall & Follow-ups",
    description: "Smart automated SMS/WhatsApp reminders for chronic care follow-ups, vaccinations, and routine checkups.",
    category: "retention",
    targetRole: "receptionist",
    icon: <CalendarCheck className="text-purple-600" />,
    badge: { text: "Reception Saver", variant: "premium" },
    price: 1499,
    pricingPeriod: "month",
    stats: [
      { label: "Repeat Visits", value: "+42%" },
      { label: "Manual Calls", value: "Zero" },
    ],
    features: ["Auto 3/6-Month Follow-Up Triggers", "Custom Disease Protocol Templates", "1-Click Patient Confirmation"],
  },
  {
    id: "whatsapp-reminders",
    title: "Smart WhatsApp Appointment Reminders",
    description: "Drastically reduce clinic no-shows with automated WhatsApp confirmations and navigation links.",
    category: "retention",
    targetRole: "receptionist",
    icon: <MessageCircle className="text-emerald-600" />,
    badge: { text: "High Efficiency", variant: "success" },
    price: 1999,
    pricingPeriod: "month",
    stats: [
      { label: "Clinic No-Shows", value: "-65%" },
      { label: "WhatsApp Read Rate", value: "98%" },
    ],
    features: ["Automated 24h & 2h Reminders", "Interactive Reschedule Buttons", "Google Maps Clinic Location Link"],
  },
  {
    id: "health-broadcasts",
    title: "Patient Health & Health Camp Broadcasts",
    description: "Send seasonal health awareness tips, camp notifications, or new clinic schedule updates in bulk.",
    category: "retention",
    targetRole: "both",
    icon: <Send className="text-blue-500" />,
    badge: { text: "On-Demand", variant: "outline" },
    price: 999,
    pricingPeriod: "month",
    stats: [
      { label: "Patient Reach", value: "100%" },
      { label: "Camp Footfall", value: "+30%" },
    ],
    features: ["Compliance Compliant Blasts", "Pre-approved Health Templates", "Delivery Analytics"],
  },
  {
    id: "referral-engine",
    title: "Patient Family Referral Engine",
    description: "Encourage satisfied patients to refer family members with digital referral QR codes.",
    category: "retention",
    targetRole: "doctor",
    icon: <Users className="text-pink-600" />,
    badge: { text: "Built on Request", variant: "warning" },
    isCustomOnDemand: true,
    price: 1999,
    pricingPeriod: "month",
    stats: [
      { label: "Word-of-Mouth", value: "+35%" },
      { label: "Family Bookings", value: "High" },
    ],
    features: ["Digital Referral Link", "Reward Tracking System", "Custom Clinic Offer"],
  },

  // --- RECEPTION & BRANDING ---
  {
    id: "qr-kit",
    title: "Smart Clinic QR Growth System",
    description: "All-in-one physical acrylic QR kit: Entrance 24/7 booking QR, Reception Express Check-in, & Rx QR.",
    category: "branding",
    targetRole: "receptionist",
    icon: <QrCode className="text-emerald-600" />,
    badge: { text: "Reception Essential", variant: "premium" },
    price: 999,
    pricingPeriod: "one-time",
    stats: [
      { label: "Check-in Time", value: "15 sec" },
      { label: "Queue Wait Time", value: "-50%" },
    ],
    features: ["Weather-Proof Acrylic Standees", "Express Check-in Counter Stand", "Prescription Sheet Booking QR"],
  },
  {
    id: "visiting-cards",
    title: "NFC & QR Digital Visiting Cards",
    description: "Premium matte visiting cards with embedded NFC tap technology and instant appointment booking QR.",
    category: "branding",
    targetRole: "doctor",
    icon: <CreditCard className="text-slate-700" />,
    badge: { text: "Premium Print", variant: "outline" },
    price: 1999,
    pricingPeriod: "per 500",
    stats: [
      { label: "Digital Tap Share", value: "Instant" },
      { label: "Print Quality", value: "350 GSM" },
    ],
    features: ["Matte Finish & Spot UV", "Tap-to-Save Contact", "Direct QR Booking Link"],
  },
  {
    id: "reception-branding",
    title: "Reception Standees & Guidance Signage",
    description: "Transform your waiting area with modern clinic branding, patient guidance standees, and banners.",
    category: "branding",
    targetRole: "receptionist",
    icon: <LayoutTemplate className="text-indigo-600" />,
    badge: { text: "On-Demand", variant: "outline" },
    price: 3499,
    pricingPeriod: "one-time",
    features: ["Custom Clinic Dimensions", "Durable Metallic Frames", "Professional Patient Instructions"],
  },

  // --- PARTNER INTEGRATIONS ---
  {
    id: "apollo-diagnostics",
    title: "Apollo Diagnostics Lab Sync",
    description: "Integrated lab test booking and automated digital report sync directly into patient EHR.",
    category: "partners",
    targetRole: "both",
    icon: <Activity className="text-blue-600" />,
    badge: { text: "Integrated", variant: "success" },
    isIntegrated: true,
    features: ["Seamless Report Upload", "Home Sample Pickup Integration", "Zero Setup Cost"],
  },
  {
    id: "tata-1mg",
    title: "Tata 1mg Pharmacy Fulfillment",
    description: "1-click digital prescription forwarding for doorstep medicine delivery for your patients.",
    category: "partners",
    targetRole: "receptionist",
    icon: <HeartPulse className="text-red-500" />,
    badge: { text: "Integrated", variant: "outline" },
    features: ["1-Click Prescription Dispatch", "Automated Patient Refills", "Pan-India Coverage"],
  },
  {
    id: "razorpay",
    title: "Razorpay Smart Payment QR",
    description: "Collect payments seamlessly via UPI, Cards, and Netbanking at reception or online.",
    category: "partners",
    targetRole: "receptionist",
    icon: <CreditCard className="text-blue-500" />,
    badge: { text: "Integrated", variant: "outline" },
    features: ["Instant Bank Settlement", "Zero Monthly Charge", "Reconciliation Dashboard"],
  },
  {
    id: "whatsapp-meta",
    title: "Official WhatsApp Business API (Green Tick)",
    description: "Official Meta Cloud API integration with verified clinic badge for automated patient communication.",
    category: "partners",
    targetRole: "both",
    icon: <MessageCircle className="text-emerald-600" />,
    badge: { text: "Verified Badge", variant: "premium" },
    price: 2499,
    pricingPeriod: "month",
    features: ["Meta Green Tick Verification", "24/7 Automated Interactive Bot", "End-to-End Encrypted"],
  },

  // --- AI & ADVANCED TOOLS ---
  {
    id: "ai-receptionist",
    title: "24/7 AI Voice Phone Receptionist",
    description: "AI Voice Assistant that answers incoming phone calls, schedules appointments, and answers clinic FAQs 24/7.",
    category: "ai",
    targetRole: "receptionist",
    icon: <Bot className="text-purple-600" />,
    badge: { text: "AI Innovation", variant: "premium" },
    price: 4999,
    pricingPeriod: "month",
    stats: [
      { label: "Missed Calls", value: "0%" },
      { label: "Phone Bookings", value: "+38%" },
    ],
    features: ["Natural Human-Like Voice", "Live Calendar Booking", "Hindi & English Support"],
  },
  {
    id: "revenue-analytics",
    title: "Clinic Revenue & Patient Analytics",
    description: "Deep insights into clinic footfall trends, doctor revenue breakdown, and patient demographics.",
    category: "ai",
    targetRole: "doctor",
    icon: <BarChart3 className="text-blue-600" />,
    badge: { text: "Built-In", variant: "success" },
    isIntegrated: true,
    features: ["Real-time Revenue Tracking", "Exportable PDF/Excel Reports", "Patient Cohort Trends"],
  },
];

export function GrowthClient({ consultationFee, themeColor, requestedServices = {} }: GrowthClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCustomRequest, setIsCustomRequest] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Form states
  const [primaryGoal, setPrimaryGoal] = useState("footfall");
  const [contactMethod, setContactMethod] = useState("whatsapp");
  const [customFeatureNote, setCustomFeatureNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAction = (service: any) => {
    setSelectedService(service);
    setIsCustomRequest(false);
    setIsDialogOpen(true);
  };

  const handleOpenCustomBuildModal = () => {
    setSelectedService({
      id: "custom-growth-tool",
      title: "Request Custom Growth Feature",
      description: "Describe any feature or integration your clinic needs. Our engineering team will build and deploy it for you.",
      price: 0,
    });
    setIsCustomRequest(true);
    setIsDialogOpen(true);
  };

  const submitRequest = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);
    try {
      const descriptionDetails = isCustomRequest
        ? `Custom Request: ${customFeatureNote} (Contact via: ${contactMethod})`
        : `${selectedService.description} (Goal: ${primaryGoal}, Contact: ${contactMethod})`;

      const res = await requestGrowthService({
        id: selectedService.id,
        title: selectedService.title,
        description: descriptionDetails,
        price: selectedService.price || 0,
        category: "growth_service",
      });

      if (res.success) {
        toast.success("Request received! Our Growth & Engineering team will contact you within 24 hours.");
        setIsDialogOpen(false);
        setCustomFeatureNote("");
      } else {
        toast.error(res.error || "Failed to submit request.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Services
  const filteredServices = useMemo(() => {
    return allGrowthServices.filter((service) => {
      // Category Filter
      if (selectedCategory !== "all" && service.category !== selectedCategory) {
        return false;
      }
      // Role Filter
      if (selectedRoleFilter !== "all") {
        if (selectedRoleFilter === "doctor" && service.targetRole !== "doctor" && service.targetRole !== "both") {
          return false;
        }
        if (selectedRoleFilter === "receptionist" && service.targetRole !== "receptionist" && service.targetRole !== "both") {
          return false;
        }
      }
      // Search Query Filter
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = service.title.toLowerCase().includes(query);
        const matchesDesc = service.description.toLowerCase().includes(query);
        const matchesFeatures = service.features?.some((f) => f.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesFeatures;
      }

      return true;
    });
  }, [selectedCategory, selectedRoleFilter, searchQuery]);

  return (
    <div className="space-y-8 pb-16">
      {/* --- ENTERPRISE SAAS HEADER --- */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-200/60">
              <Zap className="w-3.5 h-3.5 text-blue-600" /> Enterprise Clinic Growth Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Growth & Practice Scale Hub
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
              Accelerate patient footfall, automate reception workflows, and build an unbeatable online reputation with enterprise growth tools.
            </p>
          </div>

          {/* Clinic Health Score & Quick Action */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-slate-50 border border-slate-200/70 p-4 rounded-xl">
            <div className="flex items-center gap-3 pr-4 border-b sm:border-b-0 sm:border-r border-slate-200/80 pb-3 sm:pb-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-emerald-500/20">
                82
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Growth Health Score</div>
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> High Readiness • 3 Quick Wins
                </div>
              </div>
            </div>

            <Button
              onClick={handleOpenCustomBuildModal}
              className="bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl h-10 px-4 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-blue-400" /> Request Custom Tool
            </Button>
          </div>
        </div>
      </div>

      {/* --- CONTROLS & FILTER BAR --- */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search growth tools, GMB, WhatsApp, QR, AI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white border-slate-200 rounded-xl text-sm font-medium focus-visible:ring-blue-500"
            />
          </div>

          {/* Target Role Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider hidden sm:inline">Value For:</span>
            {[
              { id: "all", label: "All Roles", icon: Layers },
              { id: "doctor", label: "Doctor Focus", icon: Stethoscope },
              { id: "receptionist", label: "Reception Ease", icon: ClipboardList },
            ].map((role) => {
              const IconComp = role.icon;
              const isActive = selectedRoleFilter === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleFilter(role.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  {role.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
          {[
            { id: "all", label: "All Solutions", count: allGrowthServices.length },
            {
              id: "acquisition",
              label: "Acquisition & SEO",
              count: allGrowthServices.filter((s) => s.category === "acquisition").length,
            },
            {
              id: "retention",
              label: "Retention & Recalls",
              count: allGrowthServices.filter((s) => s.category === "retention").length,
            },
            {
              id: "branding",
              label: "Reception & Branding",
              count: allGrowthServices.filter((s) => s.category === "branding").length,
            },
            {
              id: "partners",
              label: "Partner Integrations",
              count: allGrowthServices.filter((s) => s.category === "partners").length,
            },
            {
              id: "ai",
              label: "AI & Analytics",
              count: allGrowthServices.filter((s) => s.category === "ai").length,
            },
          ].map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- GRID OF SERVICES --- */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <GrowthCard
              key={service.id}
              {...service}
              onAction={() => handleOpenAction(service)}
              requestStatus={requestedServices[service.title]}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto my-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No matching growth tools found</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              We can build any custom tool or integration specifically tailored for your clinic upon request.
            </p>
          </div>
          <Button
            onClick={handleOpenCustomBuildModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-10 px-5 shadow-sm"
          >
            Request Custom Feature Development
          </Button>
        </div>
      )}

      {/* --- BUILD ON DEMAND GUARANTEE BANNER --- */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
            <Sparkle className="w-3.5 h-3.5 text-indigo-400" /> On-Demand Engineering Guarantee
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Need a Specific Tool for Your Reception or Practice?
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed">
            If a tool or partner integration isn't listed here, tell us what you need. Our team will build, configure, and activate it for your clinic within 48 to 72 hours.
          </p>
        </div>

        <Button
          onClick={handleOpenCustomBuildModal}
          size="lg"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl h-12 px-6 shadow-lg shadow-blue-600/30 flex-shrink-0"
        >
          Request Custom Build
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* --- REQUEST SETUP DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[460px] bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold text-slate-900">
              {selectedService?.icon && (
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                  {selectedService.icon}
                </div>
              )}
              {selectedService?.title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
              {selectedService?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {isCustomRequest ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">What tool or feature do you need built?</label>
                <textarea
                  rows={4}
                  value={customFeatureNote}
                  onChange={(e) => setCustomFeatureNote(e.target.value)}
                  placeholder="E.g. Custom WhatsApp bot for automated lab collection booking, or integration with local billing software..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Primary Objective for your Clinic</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "footfall", label: "Increase new patient calls & footfall" },
                    { id: "reception", label: "Automate reception & reduce phone calls" },
                    { id: "retention", label: "Boost repeat visits & reviews" },
                  ].map((goal) => (
                    <label
                      key={goal.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        primaryGoal === goal.id
                          ? "bg-blue-50/70 border-blue-500 ring-1 ring-blue-500"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="primaryGoal"
                        value={goal.id}
                        checked={primaryGoal === goal.id}
                        onChange={() => setPrimaryGoal(goal.id)}
                        className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-slate-800">{goal.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Contact Method */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-700">Preferred Contact Method</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "whatsapp", label: "WhatsApp" },
                  { id: "call", label: "Phone Call" },
                  { id: "email", label: "Email" },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setContactMethod(method.id)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      contactMethod === method.id
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-800 font-medium leading-normal">
                Our Growth & Engineering specialist will review your request and get in touch within 24 hours.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-slate-200 text-slate-700 text-xs font-semibold h-10 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl shadow-sm"
              onClick={submitRequest}
              disabled={isSubmitting || (isCustomRequest && !customFeatureNote.trim())}
            >
              {isSubmitting ? "Submitting..." : isCustomRequest ? "Submit Custom Request" : "Request Setup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
