"use client";

import { useState } from "react";
import { UnclaimedClinic } from "@/db/schema";
import { AuthenticatedEmployee } from "@/lib/auth/rbac";
import { claimUnclaimedDirectoryClinic } from "../actions";
import { Search, MapPin, Building2, UserPlus, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  clinics: UnclaimedClinic[];
  emp: AuthenticatedEmployee;
}

export function DirectoryClient({ clinics, emp }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const filteredClinics = clinics.filter((c) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.doctorName.toLowerCase().includes(q) ||
        c.clinicName.toLowerCase().includes(q) ||
        c.specialty.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleClaim = async (unclaimedId: string) => {
    setClaimingId(unclaimedId);
    try {
      await claimUnclaimedDirectoryClinic(unclaimedId);
      toast.success("Successfully claimed clinic! Added to your Doctor Leads pipeline.");
    } catch (err: any) {
      toast.error(err.message || "Failed to claim clinic");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Regional Doctor Directory</h2>
          <p className="text-xs text-slate-500">
            Unclaimed doctor listings in {emp.territoryCities.length > 0 ? emp.territoryCities.join(", ") : "your territory"}. Claim to convert into active sales leads!
          </p>
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search by doctor, specialty, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs border-slate-200"
          />
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClinics.map((clinic) => (
          <div key={clinic.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-teal-500 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-100">
                  {clinic.specialty}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" /> {clinic.city}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2">Dr. {clinic.doctorName}</h3>
              <p className="text-xs font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> {clinic.clinicName}
              </p>
              <p className="text-xs text-slate-500 mt-2 line-clamp-2">{clinic.address}</p>
            </div>

            <div className="pt-3 border-t border-slate-100">
              {clinic.isClaimed ? (
                <div className="flex items-center justify-center gap-1 text-xs font-bold text-slate-400 py-1.5 bg-slate-100 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Already Claimed
                </div>
              ) : (
                <Button
                  onClick={() => handleClaim(clinic.id)}
                  disabled={claimingId === clinic.id}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs gap-2 h-9"
                >
                  {claimingId === clinic.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Claim & Add to My Leads
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}

        {filteredClinics.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            No unclaimed doctor listings found matching query.
          </div>
        )}
      </div>
    </div>
  );
}
