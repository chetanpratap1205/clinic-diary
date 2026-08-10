import "dotenv/config";
import { db } from "./src/db";
import { employees } from "./src/db/schema";
import { eq, inArray } from "drizzle-orm";

async function migrateRoles() {
  console.log("Starting role migration...");

  // 1. Update super_admin to admin
  const adminRes = await db
    .update(employees)
    .set({ role: "admin" })
    .where(eq(employees.role, "super_admin"))
    .returning({ id: employees.id, role: employees.role });
  console.log(`Updated ${adminRes.length} super_admins to admin.`);

  // 2. Update area_manager to manager
  const managerRes = await db
    .update(employees)
    .set({ role: "manager" })
    .where(eq(employees.role, "area_manager"))
    .returning({ id: employees.id, role: employees.role });
  console.log(`Updated ${managerRes.length} area_managers to manager.`);

  // 3. Update field_sales, telecaller, onboarding_agent, support_agent to staff
  const staffRes = await db
    .update(employees)
    .set({ role: "staff" })
    .where(
      inArray(employees.role, [
        "field_sales",
        "telecaller",
        "onboarding_agent",
        "support_agent",
      ])
    )
    .returning({ id: employees.id, role: employees.role });
  console.log(`Updated ${staffRes.length} various roles to staff.`);

  console.log("Role migration completed.");
}

migrateRoles().catch(console.error).then(() => process.exit(0));
