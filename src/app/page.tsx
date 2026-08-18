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
import { PremiumIcon } from "@/components/ui/premium-icon";
import { SocialProofPopup } from "./_components/social-proof-popup";
import { TheMirror } from "./_components/the-mirror";
import { ExperienceEngine } from "./_components/experience-engine";
import { PatientJourneyTimeline } from "./_components/patient-journey-timeline";
import { DoctorDashboard } from "./_components/doctor-dashboard";
import { DigitalClinicOwnership } from "./_components/digital-clinic-ownership";
import { DoctorStories } from "./_components/doctor-stories";
import { RotatingSpecialty } from "./_components/rotating-specialty";
import { HeroRedesign } from "./_components/hero-redesign";
import { HomeNav } from "./_components/home-nav";
import { LeadMagnetSection } from "./_components/lead-magnet";
import { HomePricingSection } from "./_components/home-pricing-section";
import { HomeRoiCalculator } from "./_components/home-roi-calculator";
import { TerritoryChecker } from "./_components/territory-checker";
import { EnterpriseSecurityGrid } from "./_components/enterprise-security-grid";
import { ZeroFrictionGuarantee } from "./_components/zero-friction-guarantee";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] relative overflow-hidden font-sans selection:bg-[#00B7A8]/30 selection:text-[#00B7A8]">
      <SocialProofPopup />
      
      {/* Dynamic Floating Navigation */}
      <HomeNav />

      {/* Premium Light Hero Section */}
      <div className="relative z-20 bg-[#F8FAFC] overflow-hidden">
        <HeroRedesign />
      </div>

      {/* Section 2: The Mirror */}
      <TheMirror />

      {/* Section 3: Zero Friction Guarantee */}
      <ZeroFrictionGuarantee />

      {/* Section 4: Digital Clinic / Ownership */}
      <DigitalClinicOwnership />

      {/* Section 5: Experience Engine (Hyper-Personalized Solution) */}
      <ExperienceEngine />

      {/* Section 6: Patient Journey Timeline */}
      <PatientJourneyTimeline />

      {/* Section 7: Doctor Dashboard View */}
      <DoctorDashboard />

      {/* Exclusivity Checker */}
      <TerritoryChecker />

      {/* Section 7: Social Proof / Doctor Stories */}
      <DoctorStories />

      {/* Enterprise Infrastructure & Security Grid */}
      <EnterpriseSecurityGrid />

      {/* Pre-Pricing ROI Calculator */}
      <HomeRoiCalculator />

      {/* Premium Pricing Tier */}
      <HomePricingSection />

      {/* Lead Magnet Section */}
      <LeadMagnetSection />

      {/* Clean Executive Navy Footer */}
      <footer className="border-t border-slate-800 bg-[#0B132B] text-white pt-16 sm:pt-24 pb-12 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* Final CTA */}
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10 text-left mb-20">
            <div>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                Your clinic is already a brand.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Give it the technology it deserves.</span>
              </h2>
              <p className="text-slate-300 text-lg mb-8 font-medium max-w-md">
                Get started today in under 5 minutes. Secure your founding pricing and area exclusivity.
              </p>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
                <Link href="/signup">
                  <Button size="lg" className="rounded-full bg-[#00B7A8] hover:bg-[#00998c] text-white h-14 px-8 font-bold text-base shadow-[0_8px_30px_rgba(0,183,168,0.35)] transition-all">
                    Claim Your Clinic's Digital Space →
                  </Button>
                </Link>
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-4">
                Your clinic. Your patients. Your relationship.
              </p>
            </div>
            
            <div className="relative w-full aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group">
               <Image src="/assets/images/cta_general.png" alt="Confident general specialist doctor at modern clinic entrance" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-tr from-[#0B132B] via-transparent to-transparent opacity-60" />
            </div>
          </div>

          <div className="border-t border-slate-800 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-shrink-0 bg-white/10 p-2 rounded-xl border border-white/10 relative">
                  <Image src="/icon-192.png" alt="Doctor Diary Logo" width={28} height={28} className="rounded-md relative z-10" />
                </div>
                <span className="font-bold text-white text-xl tracking-tight">
                  Doctor Diary
                </span>
              </div>
              <span className="font-medium text-slate-400 text-sm">
                Engineered by NatureXpress
              </span>
            </div>
            
            <div className="flex flex-wrap gap-6 sm:gap-10 text-sm font-semibold text-slate-300 justify-center">
              <Link href="/blog" className="hover:text-[#00B7A8] transition-colors">Blog</Link>
              <Link href="/demo" className="hover:text-[#00B7A8] transition-colors">Demo</Link>
              <Link href="/privacy" className="hover:text-[#00B7A8] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#00B7A8] transition-colors">Terms</Link>
              <Link href="/refund" className="hover:text-[#00B7A8] transition-colors">Refund Policy</Link>
              <Link href="/contact" className="hover:text-[#00B7A8] transition-colors">Contact Us</Link>
            </div>
          </div>
          
          <div className="mt-12 text-center text-xs font-medium text-slate-400">
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
