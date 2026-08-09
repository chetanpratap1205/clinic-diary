"use client";

import { useState, useTransition } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { DoctorLead } from "@/db/schema";
import {
  SPECIALTIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  LEAD_CATEGORIES,
  getSuggestedPillar,
} from "./message-builder";
import { createLead, updateLead, getGrowthPartners } from "./actions";
import { useEffect } from "react";
import { format } from "date-fns";

interface AddEditLeadModalProps {
  lead?: DoctorLead | null; // null / undefined = add mode, DoctorLead = edit mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddEditLeadModal({ lead = null, open, onOpenChange, onSuccess }: AddEditLeadModalProps) {
  const [isPending, startTransition] = useTransition();
  const [partners, setPartners] = useState<any[]>([]);
  const isEdit = !!lead;

  useEffect(() => {
    if (open) {
      getGrowthPartners().then(setPartners);
    }
  }, [open]);

  const [form, setForm] = useState({
    doctorName: lead?.doctorName ?? "",
    clinicName: lead?.clinicName ?? "",
    phone: lead?.phone ?? "",
    email: lead?.email ?? "",
    specialty: lead?.specialty ?? "",
    city: lead?.city ?? "",
    address: lead?.address ?? "",
    source: lead?.source ?? "google_maps",
    status: lead?.status ?? "new",
    priority: lead?.priority ?? "normal",
    leadCategory: lead?.leadCategory ?? "A",
    domainPillar: lead?.domainPillar ?? "",
    assignedTo: lead?.assignedTo ?? "",
    notes: lead?.notes ?? "",
    followUpDate: lead?.followUpDate
      ? format(new Date(lead.followUpDate), "yyyy-MM-dd")
      : "",
    degree: lead?.degree ?? "",
    consultationFee: lead?.consultationFee?.toString() ?? "",
    experienceYears: lead?.experienceYears?.toString() ?? "",
    timings: lead?.timings ?? "",
    about: lead?.about ?? "",
    logoUrl: lead?.logoUrl ?? "",
  });

  if (!open) return null;

  const handleSpecialtyChange = (val: string) => {
    const suggestedPillar = getSuggestedPillar(val);
    setForm((f) => ({ ...f, specialty: val, domainPillar: suggestedPillar }));
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doctorName.trim()) {
      toast.error("Doctor name is required");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    startTransition(async () => {
      const payload = {
        doctorName: form.doctorName,
        clinicName: form.clinicName || undefined,
        phone: form.phone,
        email: form.email || undefined,
        specialty: form.specialty || undefined,
        city: form.city || undefined,
        address: form.address || undefined,
        source: form.source,
        status: form.status,
        priority: form.priority,
        leadCategory: form.leadCategory,
        domainPillar: form.domainPillar || undefined,
        assignedTo: form.assignedTo || undefined,
        notes: form.notes || undefined,
        followUpDate: form.followUpDate || undefined,
        degree: form.degree || undefined,
        consultationFee: form.consultationFee ? parseInt(form.consultationFee) : undefined,
        experienceYears: form.experienceYears ? parseInt(form.experienceYears) : undefined,
        timings: form.timings || undefined,
        about: form.about || undefined,
        logoUrl: form.logoUrl || undefined,
      };

      const res = isEdit
        ? await updateLead(lead!.id, payload)
        : await createLead(payload);

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(isEdit ? "Lead updated!" : "Lead added! 🎯");
        onOpenChange(false);
        onSuccess?.();
      }
    });
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] sm:w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEdit ? `Edit Lead — ${lead.doctorName}` : "Add New Lead"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit ? "Update lead information and pipeline data." : "Add a doctor lead to your CRM pipeline."}
            </p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            {/* Doctor Info */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Doctor Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Doctor Name <span className="text-red-500">*</span></Label>
                  <Input
                    required
                    placeholder="Dr. Rajesh Sharma"
                    value={form.doctorName}
                    onChange={set("doctorName")}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Clinic Name</Label>
                  <Input
                    placeholder="Sharma Clinic"
                    value={form.clinicName}
                    onChange={set("clinicName")}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Phone <span className="text-red-500">*</span></Label>
                  <Input
                    required
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={set("phone")}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Email</Label>
                  <Input
                    type="email"
                    placeholder="dr.sharma@email.com"
                    value={form.email}
                    onChange={set("email")}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Specialty</Label>
                  <Select value={form.specialty} onValueChange={handleSpecialtyChange}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">City</Label>
                  <Input
                    placeholder="Pune"
                    value={form.city}
                    onChange={set("city")}
                    className="h-9"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <Label className="text-sm">Address</Label>
                  <Input
                    placeholder="Clinic address (optional)"
                    value={form.address}
                    onChange={set("address")}
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Public Profile Details */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Public Profile Details (For Demo Page)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Degree</Label>
                  <Input
                    placeholder="MBBS, MD"
                    value={form.degree}
                    onChange={set("degree")}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Consultation Fee (₹)</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={form.consultationFee}
                    onChange={set("consultationFee")}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Experience (Years)</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={form.experienceYears}
                    onChange={set("experienceYears")}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Timings</Label>
                  <Input
                    placeholder="Mon-Sat 10:00 AM - 8:00 PM"
                    value={form.timings}
                    onChange={set("timings")}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-sm">Logo URL</Label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={form.logoUrl}
                    onChange={set("logoUrl")}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-sm">About</Label>
                  <textarea
                    placeholder="Short bio about the doctor..."
                    value={form.about}
                    onChange={set("about")}
                    rows={2}
                    className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Pipeline Info */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pipeline & Playbook</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">Lead Category</Label>
                  <Select
                    value={form.leadCategory}
                    onValueChange={(v) => setForm((f) => ({ ...f, leadCategory: v }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          <div>
                            <p className="font-medium">{c.label}</p>
                            <p className="text-xs text-slate-500">{c.desc}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <Label className="text-sm">Assigned Partner</Label>
                  <Select
                    value={form.assignedTo}
                    onValueChange={(v) => setForm((f) => ({ ...f, assignedTo: v === "unassigned" ? "" : v }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned" className="text-slate-400 italic">Unassigned</SelectItem>
                      {partners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Source</Label>
                  <Select
                    value={form.source}
                    onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_SOURCES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Priority</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEAD_PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Follow-Up Date</Label>
                  <Input
                    type="date"
                    value={form.followUpDate}
                    onChange={set("followUpDate")}
                    className="h-9"
                  />
                </div>
                {form.specialty && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Domain Pillar</Label>
                    <Select
                      value={form.domainPillar}
                      onValueChange={(v) => setForm((f) => ({ ...f, domainPillar: v }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Auto-suggested from specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="growth">Growth & Reputation</SelectItem>
                        <SelectItem value="efficiency">Time & Efficiency</SelectItem>
                        <SelectItem value="continuity">Patient Continuity</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-400">Auto-suggested based on specialty</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-sm">Notes</Label>
              <textarea
                placeholder="Any notes about this doctor, their clinic, conversations, objections..."
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex gap-3 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 gap-2"
              disabled={isPending}
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Add Lead"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
