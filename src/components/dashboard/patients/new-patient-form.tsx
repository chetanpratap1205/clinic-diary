"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Phone, CalendarDays, MapPin } from "lucide-react";
import { createPatientAction } from "@/app/actions/patients";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NewPatientForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    address: "",
    addToQueue: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Allow only numbers for phone
    if (name === "phone" && value.length > 0 && !/^\d+$/.test(value)) return;
    if (name === "phone" && value.length > 10) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderSelect = (gender: string) => {
    setFormData((prev) => ({ ...prev, gender }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValidIndianMobileNumber } = await import("@/lib/validations");
    if (!isValidIndianMobileNumber(formData.phone)) {
      toast.error("Please enter a valid Indian 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPatientAction(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success(
        formData.addToQueue 
          ? "Patient added and checked into queue" 
          : "Patient registered successfully"
      );
      
      router.push(`/dashboard/patients/${result.patient?.id}`);
    } catch (error: any) {
      toast.error(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="divide-y divide-slate-100">
          <div className="p-5 space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                  +91
                </span>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="98765 43210"
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 font-medium tracking-wide"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Age */}
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-1">
                  Age <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="e.g. 35"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Gender <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="flex gap-2">
                  {["Male", "Female", "Other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGenderSelect(g.toLowerCase())}
                      className={cn(
                         "flex-1 py-2 text-[13px] font-medium rounded-lg border transition-colors",
                         formData.gender === g.toLowerCase()
                           ? "bg-slate-900 border-slate-900 text-white"
                           : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">
                Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                id="address"
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="City/Area details"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Quick Actions */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                <input
                  type="checkbox"
                  name="addToQueue"
                  checked={formData.addToQueue}
                  onChange={(e) => setFormData(prev => ({ ...prev, addToQueue: e.target.checked }))}
                  className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500/20"
                />
                <div>
                  <div className="font-medium text-slate-900 text-sm">Add to Today's Queue</div>
                  <div className="text-xs text-slate-500 mt-0.5">Automatically checks the patient in for a visit right now.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 flex items-center justify-between gap-3">
            <Link
              href="/dashboard/patients"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-2 py-1"
            >
              Cancel
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || formData.phone.length !== 10}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-10"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Patient"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
