"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, Sparkles, Send, CheckCircle2, Shield, Phone, Users } from "lucide-react";
import { toast } from "sonner";

interface EnterpriseContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminName?: string;
}

export function EnterpriseContactModal({ isOpen, onClose, adminName }: EnterpriseContactModalProps) {
  const [doctorName, setDoctorName] = useState(adminName || "");
  const [clinicName, setClinicName] = useState("");
  const [phone, setPhone] = useState("");
  const [doctorCount, setDoctorCount] = useState("2-5");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorName || !phone) {
      toast.error("Please provide your Name and Phone / WhatsApp number.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/lead/enterprise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorName,
          clinicName,
          phone,
          doctorCount,
          notes,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit inquiry");
      }

      setSubmitted(true);
      toast.success("Enterprise inquiry submitted successfully!");

      // Formulate WhatsApp redirection for instant response
      const waText = encodeURIComponent(
        `Hi Doctor Diary Enterprise Team,\nI would like to inquire about the Enterprise / Polyclinic plan.\n\nName: Dr. ${doctorName}\nClinic/Hospital: ${clinicName || "N/A"}\nNumber of Doctors: ${doctorCount}\nRequirements: ${notes || "Multi-doctor setup"}`
      );
      setTimeout(() => {
        window.open(`https://wa.me/918077170715?text=${waText}`, "_blank");
      }, 1200);

    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetForm}>
      <DialogContent className="sm:max-w-xl bg-slate-900 border-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        {!submitted ? (
          <>
            <DialogHeader className="relative z-10 space-y-2 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider w-fit">
                <Building2 className="w-3.5 h-3.5" />
                Enterprise & Polyclinics
              </div>
              <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Schedule an Enterprise Demo & Custom Quote
              </DialogTitle>
              <DialogDescription className="text-slate-300 text-sm leading-relaxed">
                Tailored for multi-doctor clinics, hospitals, & diagnostic chains requiring custom WhatsApp senders, RBAC roles, and white-glove data migration.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="docName" className="text-xs font-bold text-slate-300">
                    Your Name / Lead Doctor <span className="text-teal-400">*</span>
                  </Label>
                  <Input
                    id="docName"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="Dr. Chetan Sharma"
                    required
                    className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 rounded-xl h-11 focus:ring-teal-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phoneNum" className="text-xs font-bold text-slate-300">
                    WhatsApp / Phone Number <span className="text-teal-400">*</span>
                  </Label>
                  <Input
                    id="phoneNum"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    required
                    className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 rounded-xl h-11 focus:ring-teal-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="clinicInst" className="text-xs font-bold text-slate-300">
                    Clinic / Hospital Name
                  </Label>
                  <Input
                    id="clinicInst"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder="Apollo Healthcare / City Polyclinic"
                    className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 rounded-xl h-11 focus:ring-teal-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docCount" className="text-xs font-bold text-slate-300">
                    Number of Doctors
                  </Label>
                  <select
                    id="docCount"
                    value={doctorCount}
                    onChange={(e) => setDoctorCount(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl h-11 px-3 text-sm focus:ring-teal-400 focus:outline-none"
                  >
                    <option value="2-3">2 - 3 Doctors</option>
                    <option value="4-8">4 - 8 Doctors</option>
                    <option value="9-15">9 - 15 Doctors</option>
                    <option value="15+">15+ Doctors / Multi-Branch</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notesReq" className="text-xs font-bold text-slate-300">
                  Custom Requirements / Notes
                </Label>
                <Textarea
                  id="notesReq"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Need custom WhatsApp sender ID, Excel data migration, pharmacy queue integration..."
                  rows={2}
                  className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:ring-teal-400 text-sm"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-300 hover:to-cyan-400 text-slate-950 font-black text-base rounded-xl transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    "Submitting Request..."
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit & Connect on WhatsApp
                    </>
                  )}
                </Button>
                <p className="text-center text-slate-400 text-xs mt-3 flex items-center justify-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  Includes 100% Free Data Migration & VIP Concierge Onboarding
                </p>
              </div>
            </form>
          </>
        ) : (
          <div className="py-8 text-center space-y-4 relative z-10">
            <div className="w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto border border-teal-400/30">
              <CheckCircle2 className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">Inquiry Received!</h3>
            <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
              Our Enterprise Solutions Team has received your request. Opening WhatsApp to connect with our Lead Architect directly...
            </p>
            <Button
              onClick={resetForm}
              className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-xl text-sm font-semibold mt-4"
            >
              Close Window
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
