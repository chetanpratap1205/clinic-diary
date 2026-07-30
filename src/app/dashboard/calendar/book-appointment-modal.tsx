"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { X, Calendar, Clock, User, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSuccess: () => void;
}

export function BookAppointmentModal({ isOpen, onClose, selectedDate, onSuccess }: BookAppointmentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || phone.length !== 10) {
      toast.error("Please enter a valid name and 10-digit phone number");
      return;
    }

    startTransition(async () => {
      try {
        // We will call the patients API to create/find patient, then create appointment.
        // For simplicity in the modal, we can post to a new custom endpoint or use existing.
        // Actually, our API /api/patients handles `addToQueue` but for today.
        // Let's post to /api/appointments to book for a future date.
        // Wait, we need the patient ID. 
        // Let's do a 2-step: 1. /api/patients (creates/finds patient) 2. /api/appointments
        
        // Step 1: Create or Get Patient
        const patientRes = await fetch("/api/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone }),
        });
        
        const patientData = await patientRes.json();
        if (!patientRes.ok && patientData.error !== "Patient with this phone number already exists") {
           throw new Error(patientData.error || "Failed to create patient");
        }

        // If patient exists, we need to fetch their ID. The POST /api/patients returns error if exists.
        // So we should search for them first.
        let patientId = patientData.patient?.id;
        
        if (!patientId) {
          const searchRes = await fetch(`/api/patients?search=${phone}`);
          const searchData = await searchRes.json();
          if (searchData.patients && searchData.patients.length > 0) {
            patientId = searchData.patients[0].id;
          }
        }

        if (!patientId) {
           throw new Error("Could not create or find patient.");
        }

        // Step 2: Create Appointment
        // But we don't have a direct POST /api/appointments for future dates right now.
        // Wait, the walk-in creates one. Let's see if /api/appointments route exists for POST.
        // If not, we will need to create it! 
        // Let's assume we create POST /api/appointments
        const apptRes = await fetch("/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
             patientId,
             appointmentDate: format(selectedDate, "yyyy-MM-dd"),
             appointmentTime: time + ":00",
             notes
          }),
        });

        if (!apptRes.ok) {
           const errData = await apptRes.json();
           throw new Error(errData.error || "Failed to book appointment");
        }

        toast.success("Appointment booked successfully!");
        onSuccess();
        onClose();
        
      } catch (err: any) {
        toast.error(err.message || "Something went wrong");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-lg text-slate-900">New Booking</h2>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div className="flex items-center gap-2 p-3 bg-sky-50 text-sky-800 rounded-xl mb-2">
            <Calendar className="w-5 h-5 text-sky-600" />
            <span className="font-semibold text-sm">{format(selectedDate, "EEEE, MMMM d, yyyy")}</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Patient Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Time Slot</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="time"
                required
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any specific reason for visit?"
              rows={2}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100 resize-none"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md shadow-sky-500/20 mt-2">
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Booking"}
          </Button>
        </form>
      </div>
    </div>
  );
}
