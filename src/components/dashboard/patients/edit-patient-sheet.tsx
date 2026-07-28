"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Edit2, User, HeartPulse, AlertCircle, PhoneCall, Mail, ShieldAlert } from "lucide-react";
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
import { parsePatientExtendedData } from "@/lib/patient-helpers";

type Patient = {
  id: string;
  name: string;
  phone: string;
  age: number | null;
  gender: string | null;
  address: string | null;
  medicalNotes?: string | null;
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function EditPatientSheet({ patient }: { patient: Patient }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ext = parsePatientExtendedData(patient.medicalNotes);

  const [formData, setFormData] = useState({
    name: patient.name || "",
    phone: patient.phone || "",
    age: patient.age?.toString() || "",
    gender: patient.gender || "",
    address: patient.address || "",
    email: ext.email || "",
    bloodGroup: ext.bloodGroup || "",
    emergencyContact: ext.emergencyContact || "",
    allergies: ext.allergies || "",
    chronicConditions: ext.chronicConditions || "",
    notes: ext.notes || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

      toast.success("Patient profile updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      const currentExt = parsePatientExtendedData(patient.medicalNotes);
      setFormData({
        name: patient.name || "",
        phone: patient.phone || "",
        age: patient.age?.toString() || "",
        gender: patient.gender || "",
        address: patient.address || "",
        email: currentExt.email || "",
        bloodGroup: currentExt.bloodGroup || "",
        emergencyContact: currentExt.emergencyContact || "",
        allergies: currentExt.allergies || "",
        chronicConditions: currentExt.chronicConditions || "",
        notes: currentExt.notes || "",
      });
    }
    setOpen(newOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger 
        render={
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-full border-slate-200 bg-white/80 backdrop-blur hover:bg-slate-50 text-slate-700 shadow-sm transition-all hover:scale-105" />
        }
      >
        <Edit2 className="w-3.5 h-3.5" />
        <span className="font-semibold text-[13px]">Edit Profile</span>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-white/95 backdrop-blur-xl border-l-slate-200/50 p-4 sm:p-6">
        <SheetHeader className="mb-6 text-left border-b border-slate-100 pb-4">
          <SheetTitle className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-sky-600" />
            Edit Patient Profile
          </SheetTitle>
          <SheetDescription className="text-slate-500 text-xs sm:text-sm">
            Update personal info, clinical background, emergency contacts & allergies for {patient.name}.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section: Basic Demographics */}
          <div className="space-y-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-500" /> Basic Demographics
            </h4>

            {/* Name */}
            <div>
              <label htmlFor="edit-name" className="block text-xs font-bold text-slate-700 mb-1">
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
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-phone" className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold">
                    +91
                  </span>
                  <input
                    id="edit-phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full pl-11 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 font-semibold tracking-wide shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-email" className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="patient@example.com"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            {/* Age, Gender & Blood Group */}
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label htmlFor="edit-age" className="block text-xs font-bold text-slate-700 mb-1">
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
                  placeholder="35"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gender
                </label>
                <div className="flex gap-1">
                  {["male", "female", "other"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleGenderSelect(g)}
                      className={cn(
                        "flex-1 py-1.5 text-xs capitalize font-bold rounded-lg border transition-all shadow-sm",
                        formData.gender === g
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

            {/* Blood Group & Emergency Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="edit-bloodGroup" className="block text-xs font-bold text-slate-700 mb-1">
                  Blood Group
                </label>
                <select
                  id="edit-bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all font-semibold text-slate-800 shadow-sm"
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-emergencyContact" className="block text-xs font-bold text-slate-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  id="edit-emergencyContact"
                  name="emergencyContact"
                  type="text"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  placeholder="e.g. Spouse - 9876543210"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="edit-address" className="block text-xs font-bold text-slate-700 mb-1">
                Address / Location
              </label>
              <input
                id="edit-address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="City / Area details"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>
          </div>

          {/* Section: Clinical Background (For ALL Medical Domains) */}
          <div className="space-y-4 bg-rose-50/40 p-4 rounded-2xl border border-rose-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Universal Clinical History
            </h4>

            {/* Known Allergies */}
            <div>
              <label htmlFor="edit-allergies" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                Known Allergies (Drug / Food / Environment)
              </label>
              <input
                id="edit-allergies"
                name="allergies"
                type="text"
                value={formData.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Sulfa, Latex, Nuts"
                className="w-full px-3.5 py-2 bg-white border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* Chronic Conditions / Ongoing Medical History */}
            <div>
              <label htmlFor="edit-chronicConditions" className="block text-xs font-bold text-slate-700 mb-1">
                Ongoing Conditions & Past Medical History
              </label>
              <input
                id="edit-chronicConditions"
                name="chronicConditions"
                type="text"
                value={formData.chronicConditions}
                onChange={handleChange}
                placeholder="e.g. Hypertension, Diabetes, Anxiety, Asthma, Dental Implants"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
              />
            </div>

            {/* General Doctor Notes */}
            <div>
              <label htmlFor="edit-notes" className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Observations & General Notes
              </label>
              <textarea
                id="edit-notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Session preferences, specific treatment instructions, patient notes..."
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500/50 transition-all placeholder:text-slate-400 resize-none shadow-sm"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 py-2 backdrop-blur">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-900 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || formData.phone.length !== 10}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 h-10 text-xs font-bold shadow-md transition-transform active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
