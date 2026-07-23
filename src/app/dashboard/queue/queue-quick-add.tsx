"use client";

import { useState, useTransition } from "react";
import { Search, Plus, UserPlus, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function QueueQuickAdd() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null); // patient or "NOT_FOUND"
  
  const [name, setName] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValidIndianMobileNumber } = await import("@/lib/validations");
    if (!isValidIndianMobileNumber(phone)) return toast.error("Please enter a valid Indian 10-digit mobile number.");

    setIsSearching(true);
    try {
      const res = await fetch(`/api/patients?search=${phone}&t=${Date.now()}`, { cache: "no-store" });
      const data = await res.json();
      const match = data.patients?.find((p: any) => p.phone && p.phone.replace(/\D/g, '') === phone);
      
      if (match) {
        setSearchResult(match);
      } else {
        setSearchResult("NOT_FOUND");
      }
    } catch (err) {
      toast.error("Failed to search patient");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToQueue = async () => {
    startTransition(async () => {
      try {
        let payload = {};
        if (searchResult === "NOT_FOUND") {
          if (!name) {
            toast.error("Name is required");
            return;
          }
          payload = { phone, name, addToQueue: true };
        } else {
          const formData = new FormData();
          formData.append("patientId", searchResult.id);
          formData.append("patientName", searchResult.name);
          formData.append("patientPhone", searchResult.phone);
          
          const res = await fetch("/api/appointments/quick-add", {
            method: "POST",
            body: formData,
          });
          
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || data.error || "Failed to add to queue");
          }
          
          toast.success("Added to queue!");
          setPhone("");
          setSearchResult(null);
          setName("");
          router.refresh();
          return;
        }

        // Create new patient & add to queue
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
        setPhone("");
        setSearchResult(null);
        setName("");
        router.refresh();

      } catch (err: any) {
        toast.error(err.message);
      }
    });
  };

  return (
    <div className="bg-white/90 backdrop-blur-md p-2 rounded-[2rem] border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-2 items-center hover:shadow-md transition-shadow relative z-10">
      <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="tel"
            placeholder="Search patient by mobile number..."
            value={phone}
            maxLength={10}
            pattern="[0-9]*"
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 10);
              setPhone(val);
              setSearchResult(null);
            }}
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none text-slate-800 text-sm focus:outline-none focus:ring-0 placeholder:text-slate-400 font-medium"
          />
        </div>
        {!searchResult && (
          <Button type="submit" disabled={isSearching || phone.length !== 10} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 h-12 transition-all shadow-md shrink-0">
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="font-semibold text-[13px] tracking-wide">Find Patient</span>}
          </Button>
        )}
      </form>

      {searchResult === "NOT_FOUND" && (
        <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full animate-in fade-in slide-in-from-right-4 duration-300">
          <input
            type="text"
            placeholder="Enter New Patient Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
          <Button onClick={handleAddToQueue} disabled={isPending || !name} className="bg-sky-600 hover:bg-sky-700 text-white rounded-full h-12 px-6 gap-2 whitespace-nowrap shadow-md shadow-sky-500/20 shrink-0">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            <span className="font-semibold text-[13px] tracking-wide">Create & Check-in</span>
          </Button>
        </div>
      )}

      {searchResult && searchResult !== "NOT_FOUND" && (
        <div className="flex-1 flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2 pl-5 rounded-full w-full animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <p className="text-sm font-bold text-emerald-900">{searchResult.name}</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Existing Patient</p>
          </div>
          <Button onClick={handleAddToQueue} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 h-10 gap-2 shadow-md shadow-emerald-500/20 shrink-0">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span className="font-semibold text-[13px] tracking-wide">Check-in</span>
          </Button>
        </div>
      )}
    </div>
  );
}
