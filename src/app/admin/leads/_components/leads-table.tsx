"use client";

import { useState, useEffect } from "react";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import {
  Phone,
  MapPin,
  Stethoscope,
  Building2,
  MessageCircle,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Clock,
  Users,
  UserCheck,
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateLeadStatus, updateLeadPriority, assignLeadToPartner, getPartners } from "../actions";
import { toast } from "sonner";
import type { DoctorLead } from "@/db/schema";

interface Partner {
  id: string;
  name: string;
}

interface LeadsTableProps {
  leads: (DoctorLead & { partnerName?: string | null })[];
}

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

const priorityConfig: Record<string, { icon: string; color: string }> = {
  hot: { icon: "🔥", color: "text-red-600 bg-red-50 border-red-200" },
  warm: { icon: "🌡️", color: "text-amber-600 bg-amber-50 border-amber-200" },
  normal: { icon: "📋", color: "text-slate-600 bg-slate-50 border-slate-200" },
  cold: { icon: "❄️", color: "text-blue-600 bg-blue-50 border-blue-200" },
};

function getStalenessIndicator(lead: DoctorLead) {
  const lastContact = lead.lastContactedAt ? new Date(lead.lastContactedAt) : null;
  if (lead.status === "converted" || lead.status === "rejected") return null;
  if (!lastContact) {
    const daysSinceCreated = differenceInDays(new Date(), new Date(lead.createdAt));
    if (daysSinceCreated > 7) return { label: `${daysSinceCreated}d stale`, color: "text-red-500" };
    return null;
  }
  const daysSince = differenceInDays(new Date(), lastContact);
  if (daysSince > 7) return { label: `${daysSince}d ago`, color: "text-red-500" };
  if (daysSince > 3) return { label: `${daysSince}d ago`, color: "text-amber-500" };
  return null;
}

export function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    getPartners().then(setPartners);
  }, []);

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
    const formattedPhone = lead.phone.replace(/[^0-9]/g, "");
    const waLink = `https://wa.me/${formattedPhone}?text=${getPitchMessage(lead.doctorName)}`;
    window.open(waLink, "_blank");

    if (lead.status === "new") {
      setIsUpdating(lead.id);
      const res = await updateLeadStatus(lead.id, "contacted");
      if (res.success) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === lead.id
              ? { ...l, status: "contacted", lastContactedAt: new Date() }
              : l
          )
        );
        toast.success("Lead marked as contacted");
      }
      setIsUpdating(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(id);
    const res = await updateLeadStatus(id, newStatus);
    if (res.success) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                status: newStatus,
                lastContactedAt:
                  newStatus === "contacted" ? new Date() : l.lastContactedAt,
                convertedAt: newStatus === "converted" ? new Date() : l.convertedAt,
              }
            : l
        )
      );
      toast.success(`Status → ${statusLabels[newStatus]}`);
    } else {
      toast.error(res.error || "Failed to update status");
    }
    setIsUpdating(null);
  };

  const handlePriorityChange = async (id: string, priority: string) => {
    const res = await updateLeadPriority(id, priority);
    if (res.success) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, priority } : l)));
      toast.success(`Priority → ${priority}`);
    } else {
      toast.error("Failed to update priority");
    }
  };

  const handleAssign = async (leadId: string, partnerId: string | null) => {
    const res = await assignLeadToPartner(leadId, partnerId);
    if (res.success) {
      const partnerName = partners.find((p) => p.id === partnerId)?.name ?? null;
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? { ...l, assignedTo: partnerId, partnerName }
            : l
        )
      );
      toast.success(partnerId ? `Assigned to ${partnerName}` : "Lead unassigned");
    } else {
      toast.error("Failed to assign lead");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700 min-w-[200px]">Doctor / Clinic</TableHead>
              <TableHead className="font-semibold text-slate-700">Contact</TableHead>
              <TableHead className="font-semibold text-slate-700">Priority</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700">Assigned To</TableHead>
              <TableHead className="font-semibold text-slate-700">Added</TableHead>
              <TableHead className="w-32 text-right font-semibold text-slate-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm">No leads found. Add a lead to get started.</p>
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                const staleness = getStalenessIndicator(lead);
                const priority = priorityConfig[lead.priority] ?? priorityConfig.normal;

                return (
                  <TableRow
                    key={lead.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Doctor / Clinic */}
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

                    {/* Contact */}
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

                    {/* Priority */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="focus:outline-none">
                            <Badge
                              variant="outline"
                              className={`${priority.color} cursor-pointer hover:opacity-80 text-xs`}
                            >
                              {priority.icon} {lead.priority}
                            </Badge>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel className="text-xs text-slate-500">Set Priority</DropdownMenuLabel>
                          {Object.entries(priorityConfig).map(([val, cfg]) => (
                            <DropdownMenuItem
                              key={val}
                              onClick={() => handlePriorityChange(lead.id, val)}
                              className={lead.priority === val ? "bg-slate-100" : ""}
                            >
                              {cfg.icon} {val.charAt(0).toUpperCase() + val.slice(1)}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
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
                                {val === "new" && <Clock className="w-4 h-4 mr-2 text-blue-500" />}
                                {val === "contacted" && <MessageCircle className="w-4 h-4 mr-2 text-amber-500" />}
                                {val === "demo_scheduled" && <CalendarDays className="w-4 h-4 mr-2 text-purple-500" />}
                                {val === "converted" && <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />}
                                {val === "rejected" && <XCircle className="w-4 h-4 mr-2 text-red-500" />}
                                {label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {staleness && (
                          <span className={`text-[10px] font-semibold ${staleness.color}`}>
                            ⚠ {staleness.label}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Assigned To */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="focus:outline-none group">
                            {lead.assignedTo ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-1 rounded-lg cursor-pointer hover:bg-teal-100 transition-colors">
                                <UserCheck className="w-3 h-3" />
                                {(lead as any).partnerName ?? "Assigned"}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 border border-dashed border-slate-300 px-2 py-1 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
                                <Users className="w-3 h-3" />
                                Unassigned
                              </span>
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                          <DropdownMenuLabel className="text-xs text-slate-500">Assign to Partner</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleAssign(lead.id, null)}>
                            <Users className="w-4 h-4 mr-2 text-slate-400" />
                            Unassigned (Pool)
                          </DropdownMenuItem>
                          {partners.map((p) => (
                            <DropdownMenuItem
                              key={p.id}
                              onClick={() => handleAssign(lead.id, p.id)}
                              className={lead.assignedTo === p.id ? "bg-slate-100" : ""}
                            >
                              <UserCheck className="w-4 h-4 mr-2 text-teal-600" />
                              {p.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>

                    {/* Added */}
                    <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                      {format(new Date(lead.createdAt), "MMM d, yyyy")}
                      <span className="block text-xs text-slate-400">
                        via {lead.source}
                      </span>
                    </TableCell>

                    {/* Action */}
                    <TableCell className="text-right">
                      <Button
                        onClick={() => handleWhatsAppClick(lead)}
                        className="bg-[#25D366] hover:bg-[#1DA851] text-white shadow-sm flex items-center gap-2 h-9 px-3"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Pitch</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
