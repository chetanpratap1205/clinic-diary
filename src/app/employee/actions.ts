"use server";

import { db } from "@/db";
import {
  doctorLeads,
  employeeActivities,
  unclaimedClinics,
} from "@/db/schema";
import { getAuthenticatedEmployee } from "@/lib/auth/rbac";
import { eq, and, or, like, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEmployeeDashboardStats() {
  const emp = await getAuthenticatedEmployee();
  if (!emp) throw new Error("Unauthorized");

  const isGlobalView = emp.role === "super_admin" || emp.role === "area_manager";

  const leadWhere = isGlobalView
    ? undefined
    : eq(doctorLeads.assignedEmployeeId, emp.employeeId);

  // Group by status for high performance
  const statusCounts = await db
    .select({
      status: doctorLeads.status,
      count: sql<number>`count(*)::int`,
    })
    .from(doctorLeads)
    .where(leadWhere)
    .groupBy(doctorLeads.status);

  let totalAssigned = 0;
  let newLeads = 0;
  let contacted = 0;
  let demoScheduled = 0;
  let converted = 0;

  for (const row of statusCounts) {
    totalAssigned += row.count;
    if (row.status === "new") newLeads += row.count;
    if (row.status === "contacted") contacted += row.count;
    if (row.status === "demo_scheduled") demoScheduled += row.count;
    if (row.status === "converted") converted += row.count;
  }

  // Fetch recent activity count for this employee
  const recentActivities = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(employeeActivities)
    .where(eq(employeeActivities.employeeId, emp.employeeId));

  const activityCount = recentActivities[0]?.count || 0;

  return {
    emp,
    totalAssigned,
    newLeads,
    contacted,
    demoScheduled,
    converted,
    activityCount,
    targetMonthlyLeads: emp.targetMonthlyLeads || 30,
    targetMonthlyConversions: emp.targetMonthlyConversions || 5,
  };
}

export async function getEmployeeLeads(options?: {
  status?: string;
  category?: string;
  query?: string;
}) {
  const emp = await getAuthenticatedEmployee();
  if (!emp) throw new Error("Unauthorized");

  const isGlobalView = emp.role === "super_admin" || emp.role === "area_manager";

  const conditions = [];

  if (!isGlobalView) {
    conditions.push(eq(doctorLeads.assignedEmployeeId, emp.employeeId));
  }

  if (options?.status && options.status !== "all") {
    conditions.push(eq(doctorLeads.status, options.status));
  }

  if (options?.category && options.category !== "all") {
    conditions.push(eq(doctorLeads.leadCategory, options.category));
  }

  if (options?.query) {
    const q = `%${options.query}%`;
    conditions.push(
      or(
        like(doctorLeads.doctorName, q),
        like(doctorLeads.clinicName, q),
        like(doctorLeads.phone, q),
        like(doctorLeads.city, q)
      )
    );
  }

  const leads = await db
    .select()
    .from(doctorLeads)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(doctorLeads.createdAt));

  return leads;
}

export async function addEmployeeLead(formData: FormData) {
  const emp = await getAuthenticatedEmployee();
  if (!emp) throw new Error("Unauthorized");

  const doctorName = formData.get("doctorName") as string;
  const clinicName = formData.get("clinicName") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || null;
  const specialty = (formData.get("specialty") as string) || "General Practice";
  const city = (formData.get("city") as string) || emp.territoryCities[0] || "Pune";
  const address = (formData.get("address") as string) || null;
  const source = (formData.get("source") as string) || "field_visit";
  const leadCategory = (formData.get("leadCategory") as string) || "B";
  const priority = (formData.get("priority") as string) || "normal";
  const notes = (formData.get("notes") as string) || null;

  if (!doctorName || !phone) {
    throw new Error("Doctor Name and Phone are required");
  }

  const [newLead] = await db
    .insert(doctorLeads)
    .values({
      doctorName,
      clinicName,
      phone,
      email,
      specialty,
      city,
      address,
      source,
      leadCategory,
      priority,
      notes,
      assignedEmployeeId: emp.employeeId,
      assignedManagerId: emp.managerId,
      status: "new",
    })
    .returning();

  // Log employee activity
  await db.insert(employeeActivities).values({
    employeeId: emp.employeeId,
    leadId: newLead.id,
    actionType: "lead_added",
    notes: `Added new doctor lead: ${doctorName} (${clinicName || "Clinic"})`,
  });

  revalidatePath("/employee");
  revalidatePath("/employee/leads");
  revalidatePath("/admin/leads");
  return { success: true, lead: newLead };
}

export async function logEmployeeFieldVisit(formData: FormData) {
  const emp = await getAuthenticatedEmployee();
  if (!emp) throw new Error("Unauthorized");

  const leadId = formData.get("leadId") as string;
  const notes = formData.get("notes") as string;
  const newStatus = formData.get("newStatus") as string;
  const latitude = (formData.get("latitude") as string) || null;
  const longitude = (formData.get("longitude") as string) || null;

  if (!leadId || !notes) {
    throw new Error("Lead ID and Notes are required");
  }

  const isGlobalView = emp.role === "super_admin" || emp.role === "area_manager";

  // Verify lead ownership
  const [existingLead] = await db
    .select({ id: doctorLeads.id, assignedEmployeeId: doctorLeads.assignedEmployeeId })
    .from(doctorLeads)
    .where(eq(doctorLeads.id, leadId))
    .limit(1);

  if (!existingLead) throw new Error("Lead not found");
  if (!isGlobalView && existingLead.assignedEmployeeId !== emp.employeeId) {
    throw new Error("Unauthorized: You can only log visits for your own assigned leads.");
  }

  // Update lead status if provided
  if (newStatus) {
    await db
      .update(doctorLeads)
      .set({
        status: newStatus,
        leadCategory: newStatus === "contacted" ? "B" : undefined,
        lastContactedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(doctorLeads.id, leadId));
  }

  // Log activity
  await db.insert(employeeActivities).values({
    employeeId: emp.employeeId,
    leadId,
    actionType: "visit_logged",
    notes,
    latitude,
    longitude,
  });

  revalidatePath("/employee");
  revalidatePath("/employee/leads");
  return { success: true };
}

export async function updateLeadMessageStep(leadId: string, stepNumber: number) {
  const emp = await getAuthenticatedEmployee();
  if (!emp) throw new Error("Unauthorized");

  const isGlobalView = emp.role === "super_admin" || emp.role === "area_manager";

  // Verify lead ownership
  const [existingLead] = await db
    .select({ id: doctorLeads.id, assignedEmployeeId: doctorLeads.assignedEmployeeId })
    .from(doctorLeads)
    .where(eq(doctorLeads.id, leadId))
    .limit(1);

  if (!existingLead) throw new Error("Lead not found");
  if (!isGlobalView && existingLead.assignedEmployeeId !== emp.employeeId) {
    throw new Error("Unauthorized: You can only send outreach messages to your own assigned leads.");
  }

  await db
    .update(doctorLeads)
    .set({
      messageSentStep: stepNumber,
      lastContactedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(doctorLeads.id, leadId));

  await db.insert(employeeActivities).values({
    employeeId: emp.employeeId,
    leadId,
    actionType: "whatsapp_sent",
    notes: `Sent WhatsApp Outreach Playbook Step ${stepNumber}`,
  });

  revalidatePath("/employee/leads");
  return { success: true };
}

export async function claimUnclaimedDirectoryClinic(unclaimedId: string) {
  const emp = await getAuthenticatedEmployee();
  if (!emp) throw new Error("Unauthorized");

  const [clinic] = await db
    .select()
    .from(unclaimedClinics)
    .where(eq(unclaimedClinics.id, unclaimedId))
    .limit(1);

  if (!clinic) throw new Error("Directory clinic not found");
  if (clinic.isClaimed) throw new Error("This clinic has already been claimed by another representative.");

  // Create lead assigned to employee
  const [newLead] = await db
    .insert(doctorLeads)
    .values({
      doctorName: clinic.doctorName,
      clinicName: clinic.clinicName,
      phone: clinic.phone || "",
      specialty: clinic.specialty,
      city: clinic.city,
      address: clinic.address,
      source: "directory_claim",
      leadCategory: "A",
      assignedEmployeeId: emp.employeeId,
      assignedManagerId: emp.managerId,
      status: "new",
    })
    .returning();

  // Mark directory clinic as claimed
  await db
    .update(unclaimedClinics)
    .set({ isClaimed: true, updatedAt: new Date() })
    .where(eq(unclaimedClinics.id, unclaimedId));

  // Log activity
  await db.insert(employeeActivities).values({
    employeeId: emp.employeeId,
    leadId: newLead.id,
    actionType: "directory_claimed",
    notes: `Claimed directory listing: ${clinic.doctorName} - ${clinic.clinicName} (${clinic.city})`,
  });

  revalidatePath("/employee/directory");
  revalidatePath("/employee/leads");
  return { success: true, lead: newLead };
}
