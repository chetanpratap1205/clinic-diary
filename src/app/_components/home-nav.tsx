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
      if (window.scrollY > 20) {
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
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out px-4 sm:px-6 lg:px-8",
        isScrolled ? "py-3" : "py-5"
      )}
    >
      <nav
        className={cn(
          "mx-auto max-w-7xl rounded-2xl transition-all duration-300 ease-in-out flex items-center justify-between px-4 sm:px-6",
          isScrolled
            ? "bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 h-16"
            : "bg-transparent border-transparent h-16"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
          <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
            <Image
              src="/icon-192.png"
              alt="Doctor Diary Icon"
              fill
              className="object-contain"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-black text-[#0B132B] text-lg sm:text-xl leading-none tracking-tight">
              Doctor Diary
            </span>
            <span className="font-semibold text-[#00B7A8] text-[9px] sm:text-[10px] uppercase tracking-widest leading-none mt-1 hidden sm:block">
              by NatureXpress
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 mr-8 lg:mr-24">
          <Link href="/login" className="text-sm font-black text-[#0B132B] hover:text-[#00B7A8] transition-colors">Sign In</Link>
          <Link href="#pricing" className="text-sm font-black text-[#0B132B] hover:text-[#00B7A8] transition-colors">Pricing</Link>
        </div>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <InstallButton className="!bg-[#0B132B] hover:!bg-[#1a2b5e] !text-white hover:!text-white !border-transparent !rounded-full !font-bold shadow-md px-4 sm:px-6 h-9 sm:h-10" />
          
          <button 
            className="md:hidden p-2 text-slate-600 hover:text-[#0B132B] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex flex-col gap-4 md:hidden backdrop-blur-xl">
          <Link href="/login" className="text-sm font-black text-[#0B132B] p-2 hover:bg-slate-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
          <Link href="#pricing" className="text-sm font-black text-[#0B132B] p-2 hover:bg-slate-50 rounded-lg" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
        </div>
      )}
    </header>
  );
}
