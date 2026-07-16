"use client";

import { useState, useTransition } from "react";
import { UserPlus, Loader2, Mail, Phone, MapPin, Target } from "lucide-react";
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
import { createPartnerAction } from "../actions";
import { toast } from "sonner";

export function AddPartnerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      city: formData.get("city") as string,
      region: formData.get("region") as string,
      targetMonthly: parseInt(formData.get("targetMonthly") as string) || 5,
    };

    if (!data.name || !data.email) {
      toast.error("Name and email are required");
      return;
    }

    startTransition(async () => {
      const res = await createPartnerAction(data);
      if (res.success) {
        toast.success(`✅ Partner invited! Magic link sent to ${data.email}`);
        setIsOpen(false);
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error(res.error || "Failed to create partner");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shadow-sm rounded-xl">
          <UserPlus className="w-4 h-4" />
          Add Partner
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-teal-600" />
            </div>
            Add Growth Partner
          </DialogTitle>
          <DialogDescription>
            An invite link will be emailed to the partner. They click it to set
            their password and access their field portal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Name + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Rahul Sharma"
                required
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="rahul@example.com"
                  required
                  className="pl-9 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="9876543210"
                className="pl-9 bg-slate-50"
              />
            </div>
          </div>

          {/* City + Region */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="city"
                  name="city"
                  placeholder="e.g. Pune"
                  className="pl-9 bg-slate-50"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Territory / Region</Label>
              <Input
                id="region"
                name="region"
                placeholder="e.g. Pune West"
                className="bg-slate-50"
              />
            </div>
          </div>

          {/* Monthly Target */}
          <div className="space-y-2">
            <Label htmlFor="targetMonthly">
              Monthly Conversion Target
              <span className="text-xs text-slate-500 ml-2">(how many leads to convert/month)</span>
            </Label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="targetMonthly"
                name="targetMonthly"
                type="number"
                placeholder="5"
                min={1}
                max={100}
                defaultValue={5}
                className="pl-9 bg-slate-50 w-36"
              />
            </div>
          </div>

          {/* Commission Info */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-sm text-teal-800">
            <p className="font-semibold mb-1">Commission Structure</p>
            <ul className="space-y-0.5 text-teal-700 text-xs">
              <li>• <strong>30%</strong> commission on first clinic subscription</li>
              <li>• <strong>10%</strong> commission on all future renewals</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
              className="bg-teal-600 hover:bg-teal-700 min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Invite...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
