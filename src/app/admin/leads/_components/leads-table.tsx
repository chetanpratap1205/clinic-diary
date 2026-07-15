"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Phone, 
  MapPin, 
  Stethoscope, 
  Building2, 
  MessageCircle,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Clock,
  Users
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateLeadStatus } from "../actions";
import { toast } from "sonner";
import type { DoctorLead } from "@/db/schema";

interface LeadsTableProps {
  leads: DoctorLead[];
}

export function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const getPitchMessage = (doctorName: string) => {
    const text = `Hello Dr. ${doctorName},

Managing appointments, tracking patient payments, and reducing no-shows can be a daily struggle. 

I'm from *NatureXpress*, and we've built *Doctor Diary*—a smart, simple clinic management platform designed specifically to solve these pain points for doctors like you.

With Doctor Diary, you get:
✅ Smart Appointment Reminders
✅ Seamless Billing & Revenue Tracking
✅ A Beautiful Admin Dashboard

Check out our quick demo video here: [Demo Link]

Would you be open to a quick 5-min chat or a free trial? Let me know!`;
    
    return encodeURIComponent(text);
  };

  const handleWhatsAppClick = async (lead: DoctorLead) => {
    // 1. Open WhatsApp in new tab
    const formattedPhone = lead.phone.replace(/[^0-9]/g, ""); // strip non-numeric
    const waLink = `https://wa.me/${formattedPhone}?text=${getPitchMessage(lead.doctorName)}`;
    window.open(waLink, "_blank");

    // 2. If it's a new lead, automatically mark as contacted
    if (lead.status === "new") {
      setIsUpdating(lead.id);
      const res = await updateLeadStatus(lead.id, "contacted");
      if (res.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === lead.id ? { ...l, status: "contacted" } : l))
        );
        toast.success("Lead marked as contacted");
      } else {
        toast.error("Failed to update status automatically");
      }
      setIsUpdating(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    const res = await updateLeadStatus(id, newStatus);
    if (res.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
      toast.success(`Status updated to ${newStatus}`);
    } else {
      toast.error(res.error || "Failed to update status");
    }
    setIsUpdating(null);
  };

  const statusColors: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    contacted: "bg-amber-50 text-amber-700 border-amber-200",
    demo_scheduled: "bg-purple-50 text-purple-700 border-purple-200",
    converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  const statusLabels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    demo_scheduled: "Demo Scheduled",
    converted: "Converted",
    rejected: "Rejected",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700 min-w-[200px]">Doctor / Clinic</TableHead>
              <TableHead className="font-semibold text-slate-700">Contact</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700">Added</TableHead>
              <TableHead className="w-32 text-right font-semibold text-slate-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No leads found. Add a lead to get started.</p>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">
                        Dr. {lead.doctorName}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        {lead.specialty && (
                          <span className="flex items-center gap-1">
                            <Stethoscope className="w-3 h-3" />
                            {lead.specialty}
                          </span>
                        )}
                        {lead.clinicName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {lead.clinicName}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-900 font-medium flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {lead.phone}
                      </p>
                      {lead.city && (
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {lead.city}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          disabled={isUpdating === lead.id}
                          className="focus:outline-none disabled:opacity-50"
                        >
                          <Badge
                            variant="outline"
                            className={`${
                              statusColors[lead.status] || "bg-slate-50 text-slate-600"
                            } cursor-pointer hover:opacity-80 transition-opacity`}
                          >
                            {statusLabels[lead.status] || lead.status}
                          </Badge>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {Object.entries(statusLabels).map(([val, label]) => (
                          <DropdownMenuItem
                            key={val}
                            onClick={() => handleStatusChange(lead.id, val)}
                            className={lead.status === val ? "bg-slate-100" : ""}
                          >
                            {val === 'new' && <Clock className="w-4 h-4 mr-2 text-blue-500" />}
                            {val === 'contacted' && <MessageCircle className="w-4 h-4 mr-2 text-amber-500" />}
                            {val === 'demo_scheduled' && <CalendarDays className="w-4 h-4 mr-2 text-purple-500" />}
                            {val === 'converted' && <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />}
                            {val === 'rejected' && <XCircle className="w-4 h-4 mr-2 text-red-500" />}
                            {label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                    {format(new Date(lead.createdAt), "MMM d, yyyy")}
                    <span className="block text-xs text-slate-400">
                      via {lead.source}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        onClick={() => handleWhatsAppClick(lead)}
                        className="bg-[#25D366] hover:bg-[#1DA851] text-white shadow-sm flex items-center gap-2 h-9 px-3"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Pitch</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
