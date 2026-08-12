"use server";

import { db } from "@/db";
import { employees } from "@/db/schema";
import { getAuthenticatedEmployee } from "@/lib/auth/rbac";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function getAllEmployees() {
  const admin = await getAuthenticatedEmployee();
  if (!admin || admin.role !== "admin") {
    throw new Error("Unauthorized");
  }

  const staff = await db
    .select()
    .from(employees)
    .orderBy(desc(employees.createdAt));

  return staff;
}

export async function addEmployee(formData: FormData) {
  try {
    const admin = await getAuthenticatedEmployee();
    if (!admin || admin.role !== "admin") {
      return { success: false, error: "Unauthorized. Only Super Admin can add employees." };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;
    const department = formData.get("department") as string;
    const territoryCitiesRaw = (formData.get("territoryCities") as string) || "";
    const targetMonthlyLeads = parseInt((formData.get("targetMonthlyLeads") as string) || "30", 10);
    const targetMonthlyConversions = parseInt((formData.get("targetMonthlyConversions") as string) || "5", 10);

    if (!name || !email || !password) {
      return { success: false, error: "Name, Email, and Initial Password are required" };
    }

    // 1. Create the user in Supabase Auth using the Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error("Supabase Admin Auth Error:", authError);
      return { success: false, error: authError?.message || "Failed to create user in Auth system." };
    }

    const authUserId = authData.user.id;

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

    await db
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
      });

    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    console.error("Error adding employee:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function toggleEmployeeStatus(employeeId: string, currentActiveStatus: boolean) {
  try {
    const admin = await getAuthenticatedEmployee();
    if (!admin || admin.role !== "admin") {
      return { success: false, error: "Unauthorized" };
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
  } catch (error: any) {
    console.error("Error toggling employee status:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}

export async function updateEmployee(id: string, formData: FormData) {
  try {
    const admin = await getAuthenticatedEmployee();
    if (!admin || admin.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;
    const territoryCitiesRaw = (formData.get("territoryCities") as string) || "";
    const targetMonthlyLeads = parseInt((formData.get("targetMonthlyLeads") as string) || "30", 10);
    const targetMonthlyConversions = parseInt((formData.get("targetMonthlyConversions") as string) || "5", 10);

    const territoryCities = territoryCitiesRaw
      .split(",")
      .map((c) => c.trim().toLowerCase())
      .filter(Boolean);

    await db
      .update(employees)
      .set({
        name: name || undefined,
        phone: phone || undefined,
        role: role || undefined,
        territoryCities,
        targetMonthlyLeads,
        targetMonthlyConversions,
        updatedAt: new Date(),
      })
      .where(eq(employees.id, id));

    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating employee:", error);
    return { success: false, error: error.message || "An unexpected error occurred" };
  }
}
