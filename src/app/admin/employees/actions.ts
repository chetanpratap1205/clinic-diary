"use server";

import { db } from "@/db";
import { employees } from "@/db/schema";
import { getAuthenticatedEmployee } from "@/lib/auth/rbac";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getAllEmployees() {
  const admin = await getAuthenticatedEmployee();
  if (!admin || (admin.role !== "super_admin" && admin.role !== "area_manager")) {
    throw new Error("Unauthorized");
  }

  const staff = await db
    .select()
    .from(employees)
    .orderBy(desc(employees.createdAt));

  return staff;
}

export async function addEmployee(formData: FormData) {
  const admin = await getAuthenticatedEmployee();
  if (!admin || admin.role !== "super_admin") {
    throw new Error("Unauthorized. Only Super Admin can add employees.");
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const authUserId = formData.get("authUserId") as string; // Supabase auth UUID
  const role = formData.get("role") as string;
  const department = formData.get("department") as string;
  const territoryCitiesRaw = (formData.get("territoryCities") as string) || "";
  const targetMonthlyLeads = parseInt((formData.get("targetMonthlyLeads") as string) || "30", 10);
  const targetMonthlyConversions = parseInt((formData.get("targetMonthlyConversions") as string) || "5", 10);

  if (!name || !email || !authUserId) {
    throw new Error("Name, Email, and Auth User ID are required");
  }

  const territoryCities = territoryCitiesRaw
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  const currentYear = new Date().getFullYear();
  const maxEmp = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(employees);

  const seq = String((maxEmp[0]?.count || 0) + 1).padStart(4, "0");
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const employeeCode = `EMP-${currentYear}-${seq}-${randomSuffix}`;

  const [newEmp] = await db
    .insert(employees)
    .values({
      authUserId,
      employeeCode,
      name,
      email,
      phone,
      role,
      department,
      territoryCities,
      targetMonthlyLeads,
      targetMonthlyConversions,
      isActive: true,
    })
    .returning();

  revalidatePath("/admin/employees");
  return { success: true, employee: newEmp };
}

export async function toggleEmployeeStatus(employeeId: string, currentActiveStatus: boolean) {
  const admin = await getAuthenticatedEmployee();
  if (!admin || admin.role !== "super_admin") {
    throw new Error("Unauthorized");
  }

  await db
    .update(employees)
    .set({
      isActive: !currentActiveStatus,
      updatedAt: new Date(),
    })
    .where(eq(employees.id, employeeId));

  revalidatePath("/admin/employees");
  return { success: true };
}
