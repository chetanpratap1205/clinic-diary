"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { Search, Plus, UserPlus, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export function QueueQuickAdd() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-fill from URL parameter ?add=
  useEffect(() => {
    const addId = searchParams.get("add");
    if (addId && !selectedPatient && !isCreatingNew) {
      const fetchPatient = async () => {
        try {
          const res = await fetch(`/api/patients/${addId}`);
          const data = await res.json();
          if (data.patient) {
            setSelectedPatient(data.patient);
          }
        } catch (err) {
          console.error("Failed to auto-fetch patient:", err);
        }
      };
      fetchPatient();
    }
  }, [searchParams, selectedPatient, isCreatingNew]);

  // Debounced Search (Instant 1+ char matching)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length >= 1 && !selectedPatient && !isCreatingNew) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/patients?search=${encodeURIComponent(searchTerm.trim())}&t=${Date.now()}`, { cache: "no-store" });
          const data = await res.json();
          if (data.patients) {
            setSearchResults(data.patients);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error("Search failed");
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 200); // 200ms fast debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedPatient, isCreatingNew]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectExisting = (patient: any) => {
    setSelectedPatient(patient);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleStartCreateNew = () => {
    const digits = searchTerm.replace(/\D/g, '');
    if (digits.length === 10) {
      setNewPhone(digits);
    } else {
      setNewName(searchTerm);
    }
    setIsCreatingNew(true);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleAddToQueue = async () => {
    startTransition(async () => {
      try {
        if (isCreatingNew) {
          if (!newName || !newPhone) {
            toast.error("Name and 10-digit phone are required");
            return;
          }
          const { isValidIndianMobileNumber } = await import("@/lib/validations");
          if (!isValidIndianMobileNumber(newPhone)) {
             toast.error("Please enter a valid Indian 10-digit mobile number.");
             return;
          }

          const payload = { phone: newPhone, name: newName, addToQueue: true };
          const res = await fetch("/api/patients", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || data.error || "Failed to create patient");
          }
          
          toast.success("Patient created and added to queue!");
        } else if (selectedPatient) {
          const formData = new FormData();
          formData.append("patientId", selectedPatient.id);
          formData.append("patientName", selectedPatient.name);
          formData.append("patientPhone", selectedPatient.phone);
          
          const res = await fetch("/api/appointments/quick-add", {
            method: "POST",
            body: formData,
          });
          
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || data.error || "Failed to add to queue");
          }
          toast.success("Added to queue!");
        }

        setSearchTerm("");
        setSelectedPatient(null);
        setIsCreatingNew(false);
        setNewName("");
        setNewPhone("");
        router.refresh();

      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <div className="relative z-50">
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-2 items-center hover:shadow-md transition-shadow relative z-10">
        
        {/* Search Input */}
        {!selectedPatient && !isCreatingNew && (
          <div className="flex-1 flex gap-2 w-full" ref={dropdownRef}>
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient by name or mobile..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                   if (searchResults.length > 0) setShowDropdown(true);
                }}
                className="w-full pl-12 pr-10 py-3 bg-transparent border-none text-slate-800 text-sm focus:outline-none focus:ring-0 placeholder:text-slate-400 font-medium"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                   <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                </div>
              )}
            </div>
            
            <Button onClick={handleStartCreateNew} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 h-12 transition-all shadow-md shrink-0">
              <span className="font-semibold text-[13px] tracking-wide">Add New</span>
            </Button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {searchResults.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto py-2">
                    {searchResults.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => handleSelectExisting(patient)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center gap-3 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{patient.name}</p>
                          <p className="text-xs text-slate-500">{patient.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : searchTerm.trim().length >= 1 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-slate-500 mb-3">No matching patients found.</p>
                    <Button onClick={handleStartCreateNew} size="sm" variant="outline" className="rounded-full">
                      Add as New Patient
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        )}

        {/* Selected Existing Patient State */}
        {selectedPatient && (
          <div className="flex-1 flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2 pl-5 rounded-full w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <p className="text-sm font-bold text-emerald-900">{selectedPatient.name}</p>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Existing Patient</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button onClick={() => setSelectedPatient(null)} variant="ghost" className="h-10 px-4 text-slate-500 hover:text-slate-700 rounded-full">
                Cancel
              </Button>
              <Button onClick={handleAddToQueue} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 h-10 gap-2 shadow-md shadow-emerald-500/20">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span className="font-semibold text-[13px] tracking-wide">Check-in</span>
              </Button>
            </div>
          </div>
        )}

        {/* Create New Patient State */}
        {isCreatingNew && (
          <div className="flex-1 flex flex-col md:flex-row gap-2 w-full animate-in fade-in slide-in-from-right-4 duration-300">
             <input
              type="text"
              placeholder="Patient Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <input
              type="tel"
              placeholder="10-digit Mobile"
              value={newPhone}
              maxLength={10}
              onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
              className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <div className="flex gap-2 shrink-0 justify-end">
              <Button onClick={() => setIsCreatingNew(false)} variant="ghost" className="h-12 px-4 text-slate-500 hover:text-slate-700 rounded-full">
                Cancel
              </Button>
              <Button onClick={handleAddToQueue} disabled={isPending || !newName || newPhone.length !== 10} className="bg-sky-600 hover:bg-sky-700 text-white rounded-full h-12 px-6 gap-2 whitespace-nowrap shadow-md shadow-sky-500/20 shrink-0">
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span className="font-semibold text-[13px] tracking-wide">Create & Check-in</span>
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
