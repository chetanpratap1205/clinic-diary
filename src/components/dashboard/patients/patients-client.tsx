"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Search, User, Phone, CalendarDays, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

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

export function PatientsClient({ patients }: { patients: PatientWithStats[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter((p) => 
      p.name.toLowerCase().includes(q) || 
      p.phone.includes(q)
    );
  }, [search, patients]);

  return (
    <div className="space-y-6">
      {/* Search Bar - Floating Style */}
      <div className="relative max-w-xl">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Search patients by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-400 transition-all shadow-sm hover:border-slate-300"
        />
      </div>

      {/* Patient List / Grid */}
      <div>
        {filtered.length === 0 ? (
          <Card className="border-slate-100 shadow-sm border-dashed bg-white/50">
            <CardContent className="flex flex-col items-center justify-center py-16 sm:py-24">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <User className="w-8 h-8 text-slate-300" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((patient) => (
              <Link
                key={patient.id}
                href={`/dashboard/patients/${patient.id}`}
                className="group block h-full"
              >
                <Card className="h-full border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-sky-200/60 bg-white">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-50 flex items-center justify-center flex-shrink-0 shadow-sm border border-indigo-100/50 group-hover:scale-105 transition-transform duration-300">
                        <span className="text-indigo-700 font-bold text-lg">
                          {patient.name[0]?.toUpperCase()}
                        </span>
                      </div>
                      
                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 text-base truncate group-hover:text-sky-700 transition-colors">
                          {patient.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-xs font-medium">{patient.phone}</span>
                          </div>
                          {patient.age && (
                            <div className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-xs font-medium">{patient.age} yrs</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
                        <Activity className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-[11px] font-bold">
                          {patient.visitCount} Visit{patient.visitCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        Added {format(new Date(patient.createdAt), "MMM d, yy")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
