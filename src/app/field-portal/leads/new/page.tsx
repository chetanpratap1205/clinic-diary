"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Search, Loader2, ChevronLeft } from "lucide-react";
import { checkPhoneExists, addLead } from "../../actions";
import Link from "next/link";

export default function NewLeadPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSearching(true);
    setSearchResult(null);
    try {
      const res = await checkPhoneExists(phone);
      setSearchResult(res);
      if (!res.exists) {
        toast.success("Phone number available! Fill in the details below.");
      }
    } catch (err) {
      toast.error("Failed to check phone number");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      phone,
      doctorName: formData.get("doctorName") as string,
      clinicName: formData.get("clinicName") as string,
      specialty: formData.get("specialty") as string,
      city: formData.get("city") as string,
      address: formData.get("address") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const leadId = await addLead(data);
      toast.success("Lead added successfully!");
      router.push(`/field-portal/leads/${leadId}`);
    } catch (err) {
      toast.error("Failed to add lead");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-xl mx-auto w-full space-y-6">
      <header>
        <Link
          href="/field-portal/leads"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Leads
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Add New Clinic
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Search by phone first to prevent duplicates
        </p>
      </header>

      {/* Phone Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="searchPhone" className="sr-only">
              Phone Number
            </Label>
            <Input
              id="searchPhone"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 bg-slate-50 border-slate-200 text-base"
              maxLength={15}
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching || !phone}
            className="h-12 px-6 bg-slate-900 hover:bg-slate-800"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </Button>
        </form>

        {/* Duplicate Warning */}
        {searchResult?.exists && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h3 className="font-semibold text-amber-900 text-sm">
              ⚠ Clinic Already in System
            </h3>
            <p className="text-xs text-amber-700 mt-1">
              This number is registered as{" "}
              <strong>{searchResult.clinicName || "a clinic"}</strong>.
            </p>
            {searchResult.isAssignedToMe ? (
              <Button
                onClick={() =>
                  router.push(`/field-portal/leads/${searchResult.leadId}`)
                }
                variant="outline"
                className="mt-3 w-full bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
              >
                View My Lead →
              </Button>
            ) : (
              <p className="text-xs font-semibold text-amber-800 mt-2">
                This lead is assigned to another partner.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Lead Form */}
      {searchResult?.exists === false && (
        <form
          onSubmit={handleAddLead}
          className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <h2 className="text-lg font-bold text-slate-900">Clinic Details</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Doctor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                name="doctorName"
                required
                placeholder="Dr. John Doe"
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Clinic Name</Label>
              <Input
                name="clinicName"
                placeholder="City Care Clinic"
                className="bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Specialty</Label>
                <Input
                  name="specialty"
                  placeholder="e.g. Dentist"
                  className="bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  name="city"
                  placeholder="e.g. Mumbai"
                  className="bg-slate-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Full Address</Label>
              <Input
                name="address"
                placeholder="Shop No. 12, Main Road..."
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes from Visit</Label>
              <Input
                name="notes"
                placeholder="Met receptionist, doctor available evenings..."
                className="bg-slate-50"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white mt-4 shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? "Saving..." : "Save Clinic Lead"}
          </Button>
        </form>
      )}
    </div>
  );
}
