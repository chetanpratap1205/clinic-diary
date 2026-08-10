"use client";

import { useState } from "react";
import { Employee } from "@/db/schema";
import { addEmployee, toggleEmployeeStatus } from "./actions";
import { UserPlus, X, Loader2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  staff: Employee[];
}

export function EmployeesClient({ staff }: Props) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await addEmployee(formData);
      if (!res.success) {
        toast.error(res.error || "Failed to add employee");
        return;
      }
      setIsAddModalOpen(false);
      toast.success("Staff member profile created successfully!");
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (empId: string, currentStatus: boolean) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this employee?`)) {
      return;
    }
    try {
      const res = await toggleEmployeeStatus(empId, currentStatus);
      if (!res.success) {
        toast.error(res.error || "Failed to toggle status");
        return;
      }
      toast.success(`Employee access ${currentStatus ? "disabled" : "enabled"}!`);
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Internal Employee Directory & Access Control</h2>
          <p className="text-xs text-slate-500">
            Manage staff profiles, role permissions (RBAC), assigned territories, and access switches.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add / Invite Staff
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Role & Department</th>
                <th className="p-3">Territory Cities</th>
                <th className="p-3">Monthly Targets</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Access Switch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                        {emp.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{emp.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{emp.employeeCode} · {emp.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-100">
                      {emp.role.replace("_", " ")}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 uppercase">{emp.department}</p>
                  </td>

                  <td className="p-3 font-medium text-slate-700">
                    {emp.territoryCities.length > 0 ? emp.territoryCities.join(", ") : "All Regions"}
                  </td>

                  <td className="p-3">
                    <p className="font-medium text-slate-800">
                      {emp.targetMonthlyConversions} conversions / {emp.targetMonthlyLeads} leads
                    </p>
                  </td>

                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                      emp.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {emp.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <Button
                      onClick={() => handleToggle(emp.id, emp.isActive)}
                      size="sm"
                      variant={emp.isActive ? "outline" : "default"}
                      className={`text-[11px] h-7 px-2.5 gap-1 ${
                        emp.isActive ? "text-rose-600 border-rose-200 hover:bg-rose-50" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {emp.isActive ? "Disable Access" : "Enable Access"}
                    </Button>
                  </td>
                </tr>
              ))}

              {staff.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No employee profiles created yet. Click "Add / Invite Staff" to add your first team member!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Employee */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">Add New Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-slate-700">Full Name *</Label>
                <Input name="name" required placeholder="e.g. Amit Patil" className="h-9 text-xs mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Email *</Label>
                  <Input name="email" type="email" required placeholder="amit@naturexpress.in" className="h-9 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Phone</Label>
                  <Input name="phone" placeholder="9876543210" className="h-9 text-xs mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Initial Password *</Label>
                <Input name="password" required type="text" placeholder="e.g. Staff@123" className="h-9 text-xs mt-1" />
                <p className="text-[10px] text-slate-400 mt-0.5">The employee will use this to log in at <strong className="text-slate-600">/staff-login</strong> (internal portal).</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Staff Role</Label>
                  <Select name="role" defaultValue="field_sales">
                    <SelectTrigger className="h-9 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="field_sales">Field BD Executive</SelectItem>
                      <SelectItem value="telecaller">Telecaller / Sales Desk</SelectItem>
                      <SelectItem value="area_manager">Area Manager</SelectItem>
                      <SelectItem value="onboarding_agent">Onboarding Specialist</SelectItem>
                      <SelectItem value="support_agent">Customer Support</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-bold text-slate-700">Department</Label>
                  <Select name="department" defaultValue="sales">
                    <SelectTrigger className="h-9 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Field Sales</SelectItem>
                      <SelectItem value="telecalling">Telecalling</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="management">Management</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Territory Cities (Comma separated)</Label>
                <Input name="territoryCities" placeholder="pune, pcmc, mumbai" className="h-9 text-xs mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Target Leads / mo</Label>
                  <Input name="targetMonthlyLeads" type="number" defaultValue="30" className="h-9 text-xs mt-1" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Target Conversions / mo</Label>
                  <Input name="targetMonthlyConversions" type="number" defaultValue="5" className="h-9 text-xs mt-1" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-9 text-xs bg-teal-600 hover:bg-teal-500 text-white font-bold">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Staff Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
