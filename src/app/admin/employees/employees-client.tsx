"use client";

import { useState } from "react";
import { Employee } from "@/db/schema";
import { addEmployee, toggleEmployeeStatus, updateEmployee } from "./actions";
import { UserPlus, X, Loader2, Power, Edit3, Briefcase, MapPin, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  staff: Employee[];
}

export function EmployeesClient({ staff }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      let res;
      if (editingEmployee) {
        res = await updateEmployee(editingEmployee.id, formData);
      } else {
        res = await addEmployee(formData);
      }
      
      if (!res.success) {
        toast.error(res.error || `Failed to ${editingEmployee ? "update" : "add"} employee`);
        return;
      }
      setIsModalOpen(false);
      toast.success(`Staff member profile ${editingEmployee ? "updated" : "created"} successfully!`);
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
          <h2 className="text-xl font-bold text-slate-900">Internal Employee Directory</h2>
          <p className="text-xs text-slate-500">
            Manage Area Managers, territories, targets, and access control.
          </p>
        </div>

        <Button
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add / Invite Staff
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((emp) => (
          <div key={emp.id} className={`bg-white rounded-xl border ${emp.isActive ? "border-slate-200 shadow-sm" : "border-slate-200/50 opacity-75 bg-slate-50/50"} overflow-hidden flex flex-col transition-all hover:shadow-md`}>
            <div className="p-4 flex items-start justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm ${emp.isActive ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-500"}`}>
                  {emp.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{emp.name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">{emp.employeeCode}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                emp.isActive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}>
                {emp.isActive ? "Active" : "Disabled"}
              </span>
            </div>

            <div className="p-4 space-y-3 flex-1 text-sm">
              <div className="flex items-start gap-2.5">
                <Briefcase className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</p>
                  <p className="font-semibold text-slate-700">{emp.role === "admin" ? "Super Admin" : "Area Manager"}</p>
                  <p className="text-xs text-slate-500">{emp.email}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Territory</p>
                  <p className="font-medium text-slate-700">
                    {emp.territoryCities.length > 0 ? emp.territoryCities.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ") : "All Regions"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Target className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div className="w-full">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Targets</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs font-semibold text-slate-700">{emp.targetMonthlyLeads} Leads</span>
                    <span className="text-xs font-semibold text-emerald-700">{emp.targetMonthlyConversions} Conversions</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex gap-2">
              <Button
                onClick={() => handleOpenEdit(emp)}
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs font-semibold text-slate-600 hover:bg-slate-100 border-slate-200"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
              </Button>
              <Button
                onClick={() => handleToggle(emp.id, emp.isActive)}
                variant={emp.isActive ? "outline" : "default"}
                size="sm"
                className={`flex-1 h-8 text-xs font-semibold ${
                  emp.isActive 
                    ? "text-rose-600 border-rose-200 hover:bg-rose-50" 
                    : "bg-emerald-600 hover:bg-emerald-500 text-white"
                }`}
              >
                <Power className="w-3.5 h-3.5 mr-1.5" />
                {emp.isActive ? "Disable Access" : "Enable Access"}
              </Button>
            </div>
          </div>
        ))}
        {staff.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <p className="text-sm font-semibold text-slate-500">No employee profiles created yet. Click "Add / Invite Staff" to add your first team member!</p>
          </div>
        )}
      </div>

      {/* Modal: Add/Edit Employee */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingEmployee ? "Edit Staff Member" : "Add New Staff Member"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs font-bold text-slate-700">Full Name *</Label>
                <Input name="name" defaultValue={editingEmployee?.name} required placeholder="e.g. Amit Patil" className="h-9 text-xs mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Email {!editingEmployee && "*"}</Label>
                  <Input 
                    name="email" 
                    type="email" 
                    defaultValue={editingEmployee?.email}
                    disabled={!!editingEmployee}
                    required={!editingEmployee} 
                    placeholder="amit@naturexpress.in" 
                    className="h-9 text-xs mt-1 disabled:opacity-50" 
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Phone</Label>
                  <Input name="phone" defaultValue={editingEmployee?.phone || ""} placeholder="9876543210" className="h-9 text-xs mt-1" />
                </div>
              </div>

              {!editingEmployee && (
                <div>
                  <Label className="text-xs font-bold text-slate-700">Initial Password *</Label>
                  <Input name="password" required type="text" placeholder="e.g. Staff@123" className="h-9 text-xs mt-1" />
                  <p className="text-[10px] text-slate-400 mt-0.5">The employee will use this to log in at <strong className="text-slate-600">/staff-login</strong> (internal portal).</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="col-span-2">
                  <Label className="text-xs font-bold text-slate-700">Staff Role</Label>
                  <Select name="role" defaultValue={editingEmployee?.role || "area_manager"}>
                    <SelectTrigger className="h-9 text-xs mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="area_manager">Area Manager</SelectItem>
                      <SelectItem value="admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Territory Cities (Comma separated)</Label>
                <Input 
                  name="territoryCities" 
                  defaultValue={editingEmployee?.territoryCities?.join(", ") || ""}
                  placeholder="pune, pcmc, mumbai" 
                  className="h-9 text-xs mt-1" 
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Target Leads / mo</Label>
                  <Input 
                    name="targetMonthlyLeads" 
                    type="number" 
                    defaultValue={editingEmployee?.targetMonthlyLeads || "30"} 
                    className="h-9 text-xs mt-1" 
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Target Conversions / mo</Label>
                  <Input 
                    name="targetMonthlyConversions" 
                    type="number" 
                    defaultValue={editingEmployee?.targetMonthlyConversions || "5"} 
                    className="h-9 text-xs mt-1" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="h-9 text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-9 text-xs bg-teal-600 hover:bg-teal-500 text-white font-bold">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingEmployee ? "Save Changes" : "Create Staff Profile"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
