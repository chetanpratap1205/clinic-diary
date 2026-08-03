import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Mail, Phone, Globe, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAFBFC] py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-3xl mb-8">
        <Link href="/" className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-3xl bg-white p-8 sm:p-12 rounded-[2rem] shadow-sm border border-slate-200/60 relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-6">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B132B] tracking-tight mb-3">Contact Us</h1>
          <p className="text-slate-500 font-medium">We're here to help you build your premium clinic.</p>
        </div>

        {/* Corporate Details Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8 mb-10">
          <h2 className="text-lg font-bold text-[#0B132B] mb-6 flex items-center gap-2">
             <ShieldCheck className="w-5 h-5 text-emerald-500" />
             Corporate Information
          </h2>
          
          <div className="space-y-5">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Product</div>
              <div className="text-slate-900 font-semibold">Doctor Diary by NatureXpress</div>
            </div>
            
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Legal Entity</div>
              <div className="text-slate-900 font-bold text-lg">PRATWI SOLUTIONS PRIVATE LIMITED</div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CIN</div>
              <div className="text-slate-700 font-mono text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-md inline-block">U62011UP2023PTC187090</div>
            </div>

            <div className="flex gap-3 items-start pt-2">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Registered Address</div>
                <div className="text-slate-700 font-medium leading-relaxed">
                  124, Heera Bagh, Vijay Nagar,<br />
                  Indore, Madhya Pradesh
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
           <a href="mailto:support@doctor.naturexpress.in" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all group">
             <div className="bg-slate-100 group-hover:bg-emerald-100 p-3 rounded-lg text-slate-500 group-hover:text-emerald-600 transition-colors">
               <Mail className="w-5 h-5" />
             </div>
             <div>
               <div className="text-sm font-bold text-slate-900">Email Support</div>
               <div className="text-xs text-slate-500 font-medium">support@doctor.naturexpress.in</div>
             </div>
           </a>

           <a href="https://wa.me/918077170715" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-[#25D366]/30 hover:bg-[#25D366]/5 transition-all group">
             <div className="bg-slate-100 group-hover:bg-[#25D366]/20 p-3 rounded-lg text-slate-500 group-hover:text-[#25D366] transition-colors">
               <Phone className="w-5 h-5" />
             </div>
             <div>
               <div className="text-sm font-bold text-slate-900">WhatsApp</div>
               <div className="text-xs text-slate-500 font-medium">+91 8077170715</div>
             </div>
           </a>
        </div>

        {/* Other Innovations (Subtle Cross-linking) */}
        <div className="border-t border-slate-100 pt-10">
          <div className="text-center mb-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <Globe className="w-4 h-4" />
              Other Innovations by NatureXpress
            </h3>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <a href="https://kisan.naturexpress.in" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors border border-slate-200 hover:border-emerald-200">Kisan</a>
            <a href="https://eco.naturexpress.in" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors border border-slate-200 hover:border-emerald-200">Eco</a>
            <a href="https://eudr.naturexpress.in" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors border border-slate-200 hover:border-emerald-200">EUDR</a>
            <a href="https://hub.naturexpress.in" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors border border-slate-200 hover:border-emerald-200">Hub</a>
            <a href="https://partner.naturexpress.in" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-slate-500 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-full transition-colors border border-slate-200 hover:border-emerald-200">Partner</a>
          </div>
        </div>

      </div>
    </div>
  );
}
