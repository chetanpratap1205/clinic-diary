"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Search, User, Phone, CalendarDays, Activity, MessageCircle, Plus, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PremiumIcon } from "@/components/ui/premium-icon";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface PatientWithStats {
  id: string;
  name: string;
  phone: string;
  age: number | null;
  gender: string | null;
  address: string | null;
  createdAt: Date;
  visitCount: number;
}

export function PatientsClient({ 
  patients, 
  clinic,
  totalCount,
  currentPage,
  pageSize,
  initialSearch
}: { 
  patients: PatientWithStats[], 
  clinic: any,
  totalCount?: number,
  currentPage?: number,
  pageSize?: number,
  initialSearch?: string
}) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch || "");
  const [isPending, startTransition] = useTransition();

  const totalPages = totalCount && pageSize ? Math.ceil(totalCount / pageSize) : 1;
  const current = currentPage || 1;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      params.set("page", "1");
      router.push(`/dashboard/patients?${params.toString()}`);
    });
  };

  const handlePageChange = (newPage: number) => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      params.set("page", newPage.toString());
      router.push(`/dashboard/patients?${params.toString()}`);
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar - Premium Spotlight Style */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-2xl mx-auto sm:mx-0 group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search strokeWidth={2} className="w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search patients by name or phone... (Press Enter)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-12 py-4 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl text-base text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-sky-500/15 focus:border-sky-400 transition-all shadow-sm hover:shadow-md"
        />
        <div className="absolute inset-y-0 right-4 flex items-center">
           {isPending ? (
             <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
           ) : (
             <button type="submit" className="hidden sm:flex text-xs font-semibold text-slate-300 border border-slate-200 rounded-md px-2 py-1 bg-slate-50 shadow-sm hover:bg-slate-100 hover:text-slate-600 transition-colors">
               ↵
             </button>
           )}
        </div>
      </form>

      {/* Patient List / Grid */}
      <div>
        {patients.length === 0 ? (
          <Card className="border-slate-100 shadow-sm border-dashed bg-white/50">
            <CardContent className="flex flex-col items-center justify-center py-16 sm:py-24">
              <div className="mb-4">
                <PremiumIcon Icon={User} variant="glass" size="xl" />
              </div>
              <p className="text-slate-900 font-bold text-lg">
                {search ? "No patients found" : "No patients yet"}
              </p>
              <p className="text-slate-500 text-sm mt-1 max-w-sm text-center">
                {search ? "Try adjusting your search query to find who you're looking for." : "Add your first patient to start managing appointments and follow-ups."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr opacity-100 transition-opacity duration-200" style={{ opacity: isPending ? 0.6 : 1 }}>
            {patients.map((patient) => (
              <Card key={patient.id} className="group relative h-full flex flex-col border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/60 bg-white/60 backdrop-blur-sm overflow-hidden rounded-2xl">
                
                {/* Main Card Content (Clickable) */}
                <Link
                  href={`/dashboard/patients/${patient.id}`}
                  className="p-5 flex flex-col flex-1 z-10"
                >
                  <div className="flex items-start gap-4">
                    {/* Premium Squircle Avatar */}
                    <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center flex-shrink-0 shadow-inner border border-slate-200/80 group-hover:from-sky-50 group-hover:to-blue-50 transition-colors duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/40"></div>
                      <span className="text-slate-700 group-hover:text-sky-700 font-bold text-xl relative z-10">
                        {patient.name[0]?.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Details */}
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="font-bold text-slate-900 text-base truncate group-hover:text-sky-700 transition-colors">
                        {patient.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Phone strokeWidth={2} className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-600">{patient.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100/50">
                      <Activity strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="text-[11px] font-bold tracking-wide">
                        {patient.visitCount} Visit{patient.visitCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {patient.age ? (
                      <p className="text-[11px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        {patient.age} yrs
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                        <CalendarDays strokeWidth={1.5} className="w-3 h-3" />
                        {format(new Date(patient.createdAt), "MMM d, yy")}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Quick Actions Bar (Hover Reveal on Desktop, Visible on Mobile) */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-100 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20 flex items-center justify-around gap-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                   <a 
                     href={`tel:${patient.phone}`} 
                     className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Phone className="w-5 h-5 mb-1" />
                     <span className="text-[10px] font-bold">Call</span>
                   </a>
                   <a 
                     href={`https://wa.me/91${patient.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hi ${patient.name}, this is a message from ${clinic.name}. You can book your next appointment using our online portal: ${(process.env.NEXT_PUBLIC_BASE_URL || "https://doctor.naturexpress.in")}/book/${clinic.slug}`)}`}
                     target="_blank" rel="noopener noreferrer"
                     className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <MessageCircle className="w-5 h-5 mb-1" />
                     <span className="text-[10px] font-bold">WhatsApp</span>
                   </a>
                   <Link 
                     href={`/dashboard/queue?add=${patient.id}`}
                     className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                     onClick={(e) => e.stopPropagation()}
                   >
                     <Plus className="w-5 h-5 mb-1" />
                     <span className="text-[10px] font-bold">Queue</span>
                   </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current === 1 || isPending}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
            Page {current} of {totalPages}
          </div>

          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current === totalPages || isPending}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
