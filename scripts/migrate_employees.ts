import "dotenv/config";
import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Starting DB migration for employees & employee_activities...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "employees" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "auth_user_id" uuid NOT NULL UNIQUE,
      "employee_code" text NOT NULL UNIQUE,
      "name" text NOT NULL,
      "email" text NOT NULL UNIQUE,
      "phone" text,
      "role" text NOT NULL DEFAULT 'field_sales',
      "department" text NOT NULL DEFAULT 'sales',
      "manager_id" uuid REFERENCES "employees"("id") ON DELETE SET NULL,
      "territory_cities" text[] NOT NULL DEFAULT '{}',
      "territory_regions" text[] NOT NULL DEFAULT '{}',
      "target_monthly_leads" integer DEFAULT 30,
      "target_monthly_conversions" integer DEFAULT 5,
      "is_active" boolean NOT NULL DEFAULT true,
      "joined_at" timestamp NOT NULL DEFAULT now(),
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);
  console.log("✔ Created 'employees' table");

  await db.execute(sql`
    ALTER TABLE "doctor_leads" ADD COLUMN IF NOT EXISTS "assigned_employee_id" uuid REFERENCES "employees"("id") ON DELETE SET NULL;
    ALTER TABLE "doctor_leads" ADD COLUMN IF NOT EXISTS "assigned_manager_id" uuid REFERENCES "employees"("id") ON DELETE SET NULL;
  `);
  console.log("✔ Added assigned_employee_id and assigned_manager_id to 'doctor_leads'");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "employee_activities" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "employee_id" uuid NOT NULL REFERENCES "employees"("id") ON DELETE CASCADE,
      "lead_id" uuid REFERENCES "doctor_leads"("id") ON DELETE CASCADE,
      "action_type" text NOT NULL,
      "notes" text,
      "latitude" text,
      "longitude" text,
      "created_at" timestamp NOT NULL DEFAULT now()
    );
  `);
  console.log("✔ Created 'employee_activities' table");

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "employees_role_idx" ON "employees" ("role");
    CREATE INDEX IF NOT EXISTS "employees_manager_idx" ON "employees" ("manager_id");
    CREATE INDEX IF NOT EXISTS "employees_is_active_idx" ON "employees" ("is_active");
    CREATE INDEX IF NOT EXISTS "employees_email_idx" ON "employees" ("email");
    CREATE INDEX IF NOT EXISTS "doctor_leads_assigned_employee_idx" ON "doctor_leads" ("assigned_employee_id");
    CREATE INDEX IF NOT EXISTS "doctor_leads_assigned_manager_idx" ON "doctor_leads" ("assigned_manager_id");
    CREATE INDEX IF NOT EXISTS "employee_activities_emp_idx" ON "employee_activities" ("employee_id");
    CREATE INDEX IF NOT EXISTS "employee_activities_lead_idx" ON "employee_activities" ("lead_id");
    CREATE INDEX IF NOT EXISTS "employee_activities_created_idx" ON "employee_activities" ("created_at");
  `);
  console.log("✔ Created database indexes");

  console.log("🎉 Migration completed successfully!");
}

migrate()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
