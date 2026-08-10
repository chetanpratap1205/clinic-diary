export const dynamic = "force-dynamic";

import { getAuthenticatedEmployee } from "@/lib/auth/rbac";
import { getAllEmployees } from "./actions";
import { EmployeesClient } from "./employees-client";
import { redirect } from "next/navigation";

export default async function AdminEmployeesPage() {
  const admin = await getAuthenticatedEmployee();
  if (!admin || admin.role !== "admin") {
    redirect("/employee");
  }

  const staff = await getAllEmployees();

  return <EmployeesClient staff={staff} />;
}
