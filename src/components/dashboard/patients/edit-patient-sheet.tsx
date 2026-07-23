"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Edit2 } from "lucide-react";
import { updatePatientAction } from "@/app/actions/patients";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Patient = {
  id: string;
  name: string;
  phone: string;
  age: number | null;
  gender: string | null;
  address: string | null;
};

export function EditPatientSheet({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: patient.name || "",
    phone: patient.phone || "",
    age: patient.age?.toString() || "",
    gender: patient.gender || "",
    address: patient.address || "",
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
      const result = await updatePatientAction(patient.id, formData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Patient details updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when opened to latest patient data
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData({
        name: patient.name || "",
        phone: patient.phone || "",
        age: patient.age?.toString() || "",
        gender: patient.gender || "",
        address: patient.address || "",
      });
    }
    setOpen(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger 
        render={
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full border-slate-200 bg-white/50 backdrop-blur hover:bg-slate-50 text-slate-700 shadow-sm transition-all hover:scale-105" />
        }
      >
        <Edit2 className="w-3.5 h-3.5" />
        <span className="font-semibold text-[13px]">Edit Profile</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-white/90 backdrop-blur-xl border-l-slate-200/50">
        <SheetHeader className="mb-6 text-left">
          <SheetTitle className="text-2xl font-bold tracking-tight text-slate-900">Edit Patient</SheetTitle>
          <SheetDescription className="text-slate-500">
            Update {patient.name}'s details here. Changes will reflect immediately.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="edit-phone" className="block text-sm font-medium text-slate-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">
                +91
              </span>
              <input
                id="edit-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="98765 43210"
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 font-medium tracking-wide shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Age */}
            <div>
              <label htmlFor="edit-age" className="block text-sm font-medium text-slate-700 mb-1">
                Age
              </label>
              <input
                id="edit-age"
                name="age"
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 35"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Gender
              </label>
              <div className="flex gap-2">
                {["Male", "Female", "Other"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleGenderSelect(g.toLowerCase())}
                    className={cn(
                       "flex-1 py-2 text-[13px] font-medium rounded-lg border transition-colors shadow-sm",
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
            <label htmlFor="edit-address" className="block text-sm font-medium text-slate-700 mb-1">
              Address
            </label>
            <textarea
              id="edit-address"
              name="address"
              rows={3}
              value={formData.address}
              onChange={handleChange}
              placeholder="City/Area details"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 resize-none shadow-sm"
            />
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || formData.phone.length !== 10}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-10 shadow-md transition-transform active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
