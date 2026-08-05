import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { employees, doctorLeads } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export type EmployeeRole =
  | "super_admin"
  | "area_manager"
  | "field_sales"
  | "telecaller"
  | "onboarding_agent"
  | "support_agent";

export interface AuthenticatedEmployee {
  authUserId: string;
  employeeId: string;
  employeeCode: string;
  name: string;
  email: string;
  role: EmployeeRole;
  department: string;
  managerId: string | null;
  territoryCities: string[];
  territoryRegions: string[];
  targetMonthlyLeads: number;
  targetMonthlyConversions: number;
  isSuperAdminEnv: boolean;
}

/**
 * Retrieves the currently logged-in authenticated employee.
 * Checks super admin fallback list first, then active employee records.
 */
export async function getAuthenticatedEmployee(): Promise<AuthenticatedEmployee | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    // Check environment variable super admin override
    const adminIds = (process.env.ADMIN_USER_IDS ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const isSuperAdminEnv = adminIds.includes(user.id);

    // Fetch employee profile from DB
    let [emp] = await db
      .select()
      .from(employees)
      .where(and(eq(employees.authUserId, user.id), eq(employees.isActive, true)))
      .limit(1);

    // If super admin via env but doesn't have an employees row yet, auto-provision one to preserve FK integrity
    if (!emp && isSuperAdminEnv) {
      try {
        const [newSuperAdmin] = await db
          .insert(employees)
          .values({
            authUserId: user.id,
            employeeCode: "EMP-ADMIN-00",
            name: user.email?.split("@")[0] || "Super Admin",
            email: user.email || `admin-${user.id.slice(0, 6)}@naturexpress.in`,
            role: "super_admin",
            department: "management",
            territoryCities: [],
            territoryRegions: [],
            targetMonthlyLeads: 50,
            targetMonthlyConversions: 10,
            isActive: true,
          })
          .onConflictDoNothing()
          .returning();

        if (newSuperAdmin) {
          emp = newSuperAdmin;
        } else {
          // In case onConflictDoNothing prevented insert, query again
          const [found] = await db
            .select()
            .from(employees)
            .where(eq(employees.authUserId, user.id))
            .limit(1);
          emp = found;
        }
      } catch (err) {
        console.error("Auto-provisioning super admin error:", err);
      }
    }

    if (emp) {
      return {
        authUserId: user.id,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        name: emp.name,
        email: emp.email,
        role: isSuperAdminEnv ? "super_admin" : (emp.role as EmployeeRole),
        department: emp.department,
        managerId: emp.managerId,
        territoryCities: emp.territoryCities || [],
        territoryRegions: emp.territoryRegions || [],
        targetMonthlyLeads: emp.targetMonthlyLeads ?? 30,
        targetMonthlyConversions: emp.targetMonthlyConversions ?? 5,
        isSuperAdminEnv,
      };
    }

    // Fallback for Super Admins configured via env without DB write
    if (isSuperAdminEnv) {
      return {
        authUserId: user.id,
        employeeId: user.id,
        employeeCode: "EMP-ADMIN-00",
        name: user.email?.split("@")[0] || "Super Admin",
        email: user.email || "admin@naturexpress.in",
        role: "super_admin",
        department: "management",
        managerId: null,
        territoryCities: [],
        territoryRegions: [],
        targetMonthlyLeads: 50,
        targetMonthlyConversions: 10,
        isSuperAdminEnv: true,
      };
    }

    return null;
  } catch (err) {
    console.error("Error checking employee auth:", err);
    return null;
  }
}

/**
 * Enforces role-based route guard on server components & server actions.
 */
export async function requireEmployeeRole(
  allowedRoles: EmployeeRole[]
): Promise<AuthenticatedEmployee> {
  const emp = await getAuthenticatedEmployee();
  if (!emp) {
    redirect("/login");
  }

  if (emp.role === "super_admin") {
    return emp; // Super Admin has universal access
  }

  if (!allowedRoles.includes(emp.role)) {
    redirect("/employee");
  }

  return emp;
}

/**
 * Automated Round-Robin Lead Assignment Engine for Inbound / Directory Leads.
 * Assigns newly created doctor leads to the active telecaller or field sales rep in that city
 * who has the fewest assigned leads.
 */
export async function autoAssignLeadRoundRobin(leadCity?: string | null): Promise<{
  assignedEmployeeId: string | null;
  assignedManagerId: string | null;
}> {
  try {
    // 1. Fetch active telecallers or sales reps
    const activeStaff = await db
      .select({
        id: employees.id,
        role: employees.role,
        managerId: employees.managerId,
        territoryCities: employees.territoryCities,
      })
      .from(employees)
      .where(
        and(
          eq(employees.isActive, true),
          inArray(employees.role, ["telecaller", "field_sales"])
        )
      );

    if (activeStaff.length === 0) {
      return { assignedEmployeeId: null, assignedManagerId: null };
    }

    // Filter staff matching city if provided
    let candidateStaff = activeStaff;
    if (leadCity) {
      const cityLower = leadCity.toLowerCase().trim();
      const cityMatches = activeStaff.filter((s) =>
        s.territoryCities.some((c) => c.toLowerCase() === cityLower)
      );
      if (cityMatches.length > 0) {
        candidateStaff = cityMatches;
      }
    }

    // 2. Count current lead allocation for candidates to pick the least loaded
    const staffIds = candidateStaff.map((s) => s.id);
    const leadCounts = await db
      .select({
        employeeId: doctorLeads.assignedEmployeeId,
        count: sql<number>`count(*)::int`,
      })
      .from(doctorLeads)
      .where(inArray(doctorLeads.assignedEmployeeId, staffIds))
      .groupBy(doctorLeads.assignedEmployeeId);

    const countMap = new Map<string, number>();
    staffIds.forEach((id) => countMap.set(id, 0));
    leadCounts.forEach((lc) => {
      if (lc.employeeId) countMap.set(lc.employeeId, lc.count);
    });

    // Sort by lead count ascending
    candidateStaff.sort((a, b) => (countMap.get(a.id) || 0) - (countMap.get(b.id) || 0));
    const selectedStaff = candidateStaff[0];

    return {
      assignedEmployeeId: selectedStaff.id,
      assignedManagerId: selectedStaff.managerId,
    };
  } catch (error) {
    console.error("Error in autoAssignLeadRoundRobin:", error);
    return { assignedEmployeeId: null, assignedManagerId: null };
  }
}
