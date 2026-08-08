"use client";

import { useState } from "react";
import { DoctorLead } from "@/db/schema";
import { AuthenticatedEmployee } from "@/lib/auth/rbac";
import { addEmployeeLead, editEmployeeLead, logEmployeeFieldVisit, updateLeadMessageStep } from "../actions";
import {
  Search,
  PlusCircle,
  MessageSquare,
  MapPin,
  Phone,
  X,
  Send,
  Loader2,
  FileText,
  Copy,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { generateLeadDemoUrl } from "@/app/admin/leads/message-builder";

interface Props {
  leads: DoctorLead[];
  emp: AuthenticatedEmployee;
}

export function EmployeeLeadsClient({ leads, emp }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editModalLead, setEditModalLead] = useState<DoctorLead | null>(null);
  const [visitModalLead, setVisitModalLead] = useState<DoctorLead | null>(null);
  const [waDrawerLead, setWaDrawerLead] = useState<DoctorLead | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    if (selectedStatus !== "all" && lead.status !== selectedStatus) return false;
    if (selectedCategory !== "all" && lead.leadCategory !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.doctorName.toLowerCase().includes(q);
      const matchClinic = (lead.clinicName || "").toLowerCase().includes(q);
      const matchPhone = lead.phone.includes(q);
      const matchCity = (lead.city || "").toLowerCase().includes(q);
      if (!matchName && !matchClinic && !matchPhone && !matchCity) return false;
    }
    return true;
  });

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await addEmployeeLead(formData);
      setIsAddModalOpen(false);
      toast.success("Doctor lead added successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to add lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.append("id", editModalLead!.id);
      await editEmployeeLead(formData);
      setEditModalLead(null);
      toast.success("Lead details updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      await logEmployeeFieldVisit(formData);
      setVisitModalLead(null);
      toast.success("Field visit log recorded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to log visit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStepClick = async (leadId: string, stepNumber: number) => {
    try {
      await updateLeadMessageStep(leadId, stepNumber);
      toast.success(`WhatsApp Playbook Step ${stepNumber} recorded!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update step");
    }
  };

  const copyDemoUrl = (lead: DoctorLead) => {
    const url = generateLeadDemoUrl(lead);
    navigator.clipboard.writeText(url);
    toast.success("Live Demo URL copied! 🔗");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Doctor Leads Center</h2>
          <p className="text-xs text-slate-500">
            Assigned doctor pipeline for {emp.name} ({emp.employeeCode})
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Add Doctor Lead
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <Input
            placeholder="Search doctor, clinic, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs border-slate-200"
          />
        </div>

        <div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-10 text-xs border-slate-200">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted / Visited</SelectItem>
              <SelectItem value="demo_scheduled">Demo Scheduled</SelectItem>
              <SelectItem value="converted">Converted Clinic</SelectItem>
              <SelectItem value="rejected">Rejected / Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-10 text-xs border-slate-200">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="A">Category A (Cold Lead)</SelectItem>
              <SelectItem value="B">Category B (Visited Clinic)</SelectItem>
              <SelectItem value="C">Category C (Inbound Request)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile-First Card Grid View */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Search className="w-10 h-10 text-slate-200" />
          <div>
            <p className="font-medium text-slate-500">No leads found</p>
            <p className="text-xs mt-1">Adjust your search or filters to see leads.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLeads.map((lead) => {
            const demoUrl = generateLeadDemoUrl(lead);

            return (
              <div
                key={lead.id}
                className="flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2 bg-slate-50/50">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 truncate" title={lead.doctorName}>
                      Dr. {lead.doctorName}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 truncate mt-0.5" title={lead.clinicName || "Private Clinic"}>
                      {lead.clinicName || "Private Clinic"} · {lead.specialty || "GP"}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      lead.status === "converted" ? "bg-emerald-100 text-emerald-800" :
                      lead.status === "demo_scheduled" ? "bg-amber-100 text-amber-800" :
                      lead.status === "contacted" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-700"
                    }`}>
                      {lead.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-mono font-bold bg-slate-50 p-2 rounded-lg">
                    <Phone className="w-3.5 h-3.5 text-teal-600" /> {lead.phone}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5">
                    {lead.city && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5 bg-slate-100 px-2 py-0.5 rounded">
                        <MapPin className="w-3 h-3" /> {lead.city}
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                      Cat {lead.leadCategory}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Step: <span className="font-bold text-teal-700">{lead.messageSentStep}</span>
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-2 border-t border-slate-100 bg-slate-50 grid grid-cols-4 gap-1.5">
                  <Button
                    onClick={() => setEditModalLead(lead)}
                    variant="outline"
                    size="sm"
                    className="h-8 col-span-1 text-slate-600 border-slate-200 hover:bg-slate-200 p-0"
                    title="Edit Name/Phone"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  
                  <Button
                    onClick={() => copyDemoUrl(lead)}
                    variant="outline"
                    size="sm"
                    className="h-8 col-span-1 text-teal-700 border-teal-200 bg-teal-50 hover:bg-teal-100 p-0"
                    title="Copy Demo Link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    onClick={() => setWaDrawerLead(lead)}
                    size="sm"
                    className="h-8 col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 p-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </Button>
                </div>
                
                {/* Secondary Action */}
                <div className="px-2 pb-2 bg-slate-50">
                  <Button
                    onClick={() => setVisitModalLead(lead)}
                    size="sm"
                    variant="outline"
                    className="w-full text-[11px] h-7 border-slate-200 hover:bg-slate-200"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" /> Log Field Visit & Update Status
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Doctor Lead */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Doctor Lead</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-slate-700">Doctor Name *</Label>
                <Input name="doctorName" required placeholder="e.g. Rajesh Sharma" className="h-9 text-xs mt-1" />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Clinic Name</Label>
                <Input name="clinicName" placeholder="e.g. Sharma Heart Care Clinic" className="h-9 text-xs mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Phone Number *</Label>
                  <Input name="phone" required placeholder="9876543210" className="h-9 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                  <Input name="email" type="email" placeholder="doctor@clinic.com" className="h-9 text-xs mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Specialty</Label>
                  <Input name="specialty" placeholder="Cardiology" className="h-9 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">City</Label>
                  <Input name="city" defaultValue={emp.territoryCities[0] || "Pune"} className="h-9 text-xs mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Clinic Address</Label>
                <Input name="address" placeholder="e.g. 101 MG Road, Kothrud" className="h-9 text-xs mt-1" />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Lead Category</Label>
                <Select name="leadCategory" defaultValue="B">
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Cat A (Cold Lead)</SelectItem>
                    <SelectItem value="B">Cat B (Visited Clinic)</SelectItem>
                    <SelectItem value="C">Cat C (Inbound)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Initial Notes / Observations</Label>
                <Textarea name="notes" placeholder="Met Dr. Rajesh. Currently using paper register..." className="text-xs mt-1 h-20" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-9 text-xs bg-teal-600 hover:bg-teal-500 text-white font-bold">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Lead"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Doctor Lead */}
      {editModalLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Lead Details</h3>
              <button onClick={() => setEditModalLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-slate-700">Doctor Name *</Label>
                <Input name="doctorName" defaultValue={editModalLead.doctorName} required placeholder="e.g. Rajesh Sharma" className="h-9 text-xs mt-1" />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Clinic Name</Label>
                <Input name="clinicName" defaultValue={editModalLead.clinicName || ""} placeholder="e.g. Sharma Heart Care Clinic" className="h-9 text-xs mt-1" />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Phone Number *</Label>
                <Input name="phone" defaultValue={editModalLead.phone} required placeholder="9876543210" className="h-9 text-xs mt-1" />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">City</Label>
                <Input name="city" defaultValue={editModalLead.city || ""} className="h-9 text-xs mt-1" />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditModalLead(null)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-9 text-xs bg-teal-600 hover:bg-teal-500 text-white font-bold">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Log Clinic Visit */}
      {visitModalLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Log Field Visit</h3>
                <p className="text-xs text-slate-500">Dr. {visitModalLead.doctorName} ({visitModalLead.clinicName || "Clinic"})</p>
              </div>
              <button onClick={() => setVisitModalLead(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleVisitSubmit} className="space-y-3">
              <input type="hidden" name="leadId" value={visitModalLead.id} />

              <div>
                <Label className="text-xs font-bold text-slate-700">Update Status</Label>
                <Select name="newStatus" defaultValue={visitModalLead.status}>
                  <SelectTrigger className="h-9 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contacted">Contacted / Clinic Visited</SelectItem>
                    <SelectItem value="demo_scheduled">Demo Scheduled</SelectItem>
                    <SelectItem value="converted">Converted Clinic</SelectItem>
                    <SelectItem value="rejected">Not Interested</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Visit Summary & Feedback *</Label>
                <Textarea
                  name="notes"
                  required
                  placeholder="Doctor interested in WhatsApp prescription sharing. Scheduled demo for Friday 4 PM..."
                  className="text-xs mt-1 h-24"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setVisitModalLead(null)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-9 text-xs bg-teal-600 hover:bg-teal-500 text-white font-bold">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Record Visit Log"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Outreach Playbook Drawer */}
      {waDrawerLead && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-600" /> WhatsApp Playbook
                  </h3>
                  <p className="text-xs text-slate-500">Dr. {waDrawerLead.doctorName} ({waDrawerLead.phone})</p>
                </div>
                <button onClick={() => setWaDrawerLead(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Outreach Template</p>

                {/* Step 1 Template */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-2 hover:border-emerald-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Step 1: Introduction & Free Demo</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">High Intro Rate</span>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg font-mono">
                    "Namaste Dr. {waDrawerLead.doctorName}! I'm {emp.name} from Doctor Diary. We help doctors in {waDrawerLead.city || "your city"} send digital prescriptions via WhatsApp automatically. Would you like a quick 2-min demo?"
                  </p>
                  <a
                    href={`https://wa.me/91${waDrawerLead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Namaste Dr. ${waDrawerLead.doctorName}! I'm ${emp.name} from Doctor Diary. We help doctors in ${waDrawerLead.city || "your city"} send digital prescriptions via WhatsApp automatically. Would you like a quick 2-min demo?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleStepClick(waDrawerLead.id, 1)}
                  >
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 mt-2">
                      <Send className="w-3.5 h-3.5" /> Send Step 1 Message
                    </Button>
                  </a>
                </div>

                {/* Step 2 Template */}
                <div className="border border-slate-200 rounded-xl p-4 space-y-2 hover:border-emerald-500 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Step 2: Patient Follow-up Automation</span>
                    <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded">Efficiency Focus</span>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg font-mono">
                    "Dr. {waDrawerLead.doctorName}, did you know Doctor Diary reduces clinic follow-up no-shows by 40% using automated WhatsApp reminders? Let's get your clinic set up in 5 minutes!"
                  </p>
                  <a
                    href={`https://wa.me/91${waDrawerLead.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Dr. ${waDrawerLead.doctorName}, did you know Doctor Diary reduces clinic follow-up no-shows by 40% using automated WhatsApp reminders? Let's get your clinic set up in 5 minutes!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleStepClick(waDrawerLead.id, 2)}
                  >
                    <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 mt-2">
                      <Send className="w-3.5 h-3.5" /> Send Step 2 Message
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <Button variant="outline" onClick={() => setWaDrawerLead(null)} className="w-full text-xs">
                Close Playbook Drawer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
