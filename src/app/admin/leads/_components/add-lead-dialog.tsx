"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus, Loader2, Flame, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDoctorLead, getPartners } from "../actions";
import { toast } from "sonner";

interface Partner {
  id: string;
  name: string;
}

export function AddLeadDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    if (isOpen) {
      getPartners().then(setPartners);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const assignedTo = formData.get("assignedTo") as string;

    const data = {
      doctorName: formData.get("doctorName") as string,
      clinicName: (formData.get("clinicName") as string) || null,
      phone: formData.get("phone") as string,
      email: (formData.get("email") as string) || null,
      specialty: (formData.get("specialty") as string) || null,
      city: (formData.get("city") as string) || null,
      source: formData.get("source") as string,
      priority: (formData.get("priority") as string) || "normal",
      assignedTo: assignedTo && assignedTo !== "none" ? assignedTo : null,
      status: "new" as const,
    };

    if (!data.doctorName || !data.phone) {
      toast.error("Doctor name and phone are required");
      return;
    }

    startTransition(async () => {
      const res = await addDoctorLead(data);
      if (res.success) {
        toast.success("Lead added successfully!");
        setIsOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(res.error || "Failed to add lead");
      }
    });
  };

  const priorityOptions = [
    { value: "hot", label: "🔥 Hot", desc: "Ready to buy now" },
    { value: "warm", label: "🌡️ Warm", desc: "Interested, needs follow-up" },
    { value: "normal", label: "📋 Normal", desc: "Standard outreach" },
    { value: "cold", label: "❄️ Cold", desc: "Not yet engaged" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-sm rounded-xl">
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Add a doctor or clinic to your sales pipeline.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Doctor Name + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doctorName">
                Doctor Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="doctorName"
                name="doctorName"
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Mobile <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="9876543210"
                required
                type="tel"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="doctor@example.com" />
          </div>

          {/* Clinic + City */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clinicName">Clinic Name</Label>
              <Input id="clinicName" name="clinicName" placeholder="e.g. City Care" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" placeholder="e.g. Pune" />
            </div>
          </div>

          {/* Specialty + Source */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Specialty</Label>
              <Input id="specialty" name="specialty" placeholder="e.g. Dentist" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select name="source" defaultValue="field_visit">
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field_visit">Field Visit</SelectItem>
                  <SelectItem value="online">Online Search</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select name="priority" defaultValue="normal">
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs text-slate-500 ml-2">— {opt.desc}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assign to Partner */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Assign to Partner</Label>
            <Select name="assignedTo" defaultValue="none">
              <SelectTrigger>
                <SelectValue placeholder="Select partner (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned (pool)</SelectItem>
                {partners.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-teal-600 hover:bg-teal-700 min-w-[100px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
