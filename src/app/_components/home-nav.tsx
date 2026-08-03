"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstallButton } from "@/components/pwa-provider";

export function HomeNav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8 py-3"
    >
      <nav
        className={cn(
          "mx-auto max-w-7xl rounded-2xl transition-all duration-300 flex items-center px-4 sm:px-6 h-16",
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-200/90"
            : "bg-white/80 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-200/60"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-1 justify-start">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-200">
            <Image
              src="/icon-192.png"
              alt="Doctor Diary Icon"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-black text-[#0B132B] text-lg sm:text-xl leading-none tracking-tight">
              Doctor Diary
            </span>
            <span className="font-bold text-[#00B7A8] text-[9px] sm:text-[10px] uppercase tracking-widest leading-none mt-1 hidden sm:block">
              by NatureXpress
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center justify-center gap-8 px-4">
          <Link href="/demo" className="text-sm font-extrabold text-[#0B132B] hover:text-[#00B7A8] transition-colors">Watch Demo</Link>
          <Link href="/blog" className="text-sm font-extrabold text-[#0B132B] hover:text-[#00B7A8] transition-colors">Blog</Link>
          <Link href="/login" className="text-sm font-extrabold text-[#0B132B] hover:text-[#00B7A8] transition-colors">Sign In</Link>
          <Link href="#pricing" className="text-sm font-extrabold text-[#0B132B] hover:text-[#00B7A8] transition-colors">Pricing</Link>
        </div>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-3 sm:gap-4 flex-1 justify-end">
          <Link href="/signup" className="hidden sm:inline-flex">
            <Button size="sm" className="bg-[#00B7A8] hover:bg-[#00998c] text-white font-extrabold rounded-full px-5 h-10 text-xs sm:text-sm shadow-md shadow-[#00B7A8]/20 transition-all">
              14-Day Free Trial
            </Button>
          </Link>

          <InstallButton className="!bg-[#0B132B] hover:!bg-[#1a2b5e] !text-white hover:!text-white !border-transparent !rounded-full !font-extrabold shadow-md px-4 sm:px-6 h-10 text-xs sm:text-sm" />
          
          <button 
            className="md:hidden p-2 text-slate-700 hover:text-[#0B132B] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 p-4 flex flex-col gap-3 md:hidden">
          <Link href="/demo" className="text-sm font-extrabold text-[#0B132B] p-2.5 hover:bg-slate-100 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>Watch Demo</Link>
          <Link href="/blog" className="text-sm font-extrabold text-[#0B132B] p-2.5 hover:bg-slate-100 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
          <Link href="/login" className="text-sm font-extrabold text-[#0B132B] p-2.5 hover:bg-slate-100 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
          <Link href="#pricing" className="text-sm font-extrabold text-[#0B132B] p-2.5 hover:bg-slate-100 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
          <Link href="/signup" className="text-sm font-extrabold text-white bg-[#00B7A8] p-3 text-center rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>14-Day Free Trial</Link>
        </div>
      )}
    </header>
  );
}
