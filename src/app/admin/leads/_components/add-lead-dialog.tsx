"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { addDoctorLead } from "../actions";
import { toast } from "sonner";

export function AddLeadDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data = {
      doctorName: formData.get("doctorName") as string,
      clinicName: formData.get("clinicName") as string,
      phone: formData.get("phone") as string,
      specialty: formData.get("specialty") as string,
      city: formData.get("city") as string,
      source: formData.get("source") as string,
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
      } else {
        toast.error(res.error || "Failed to add lead");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-sm rounded-xl">
          <Plus className="w-4 h-4" />
          <span>Fast Add Lead</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] gap-6">
        <DialogHeader>
          <DialogTitle>Add New Prospect</DialogTitle>
          <DialogDescription>
            Quickly add a doctor to your Leads database.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="doctorName">Doctor Name <span className="text-red-500">*</span></Label>
            <Input id="doctorName" name="doctorName" placeholder="e.g. Rahul Sharma" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number <span className="text-red-500">*</span></Label>
            <Input id="phone" name="phone" placeholder="e.g. 9876543210" required type="tel" />
          </div>

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

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-teal-600 hover:bg-teal-700">
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
