export const dynamic = "force-dynamic";

import { getAuthenticatedEmployee } from "@/lib/auth/rbac";
import { getEmployeeLeads } from "../actions";
import { EmployeeLeadsClient } from "./employee-leads-client";
import { redirect } from "next/navigation";

export default async function EmployeeLeadsPage() {
  const emp = await getAuthenticatedEmployee();
  if (!emp) redirect("/staff-login");

  const leads = await getEmployeeLeads();

  return <EmployeeLeadsClient leads={leads} emp={emp} />;
}
