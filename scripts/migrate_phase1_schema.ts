import dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";

async function run() {
  console.log("Starting Phase 1 database schema migration...");
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log("Connected to Supabase PostgreSQL successfully.");

  try {
    await client.query("BEGIN");

    // 1. Clinics enhancements
    console.log("Migrating clinics table...");
    await client.query(`
      ALTER TABLE clinics 
      ADD COLUMN IF NOT EXISTS partner_lab_name text,
      ADD COLUMN IF NOT EXISTS preferred_hospital text,
      ADD COLUMN IF NOT EXISTS teleconsult_url text;
    `);

    // 2. Patients enhancements
    console.log("Migrating patients table...");
    await client.query(`
      ALTER TABLE patients 
      ADD COLUMN IF NOT EXISTS abha_id text,
      ADD COLUMN IF NOT EXISTS is_abha_verified boolean DEFAULT false;
    `);

    // 3. Visit Notes enhancements
    console.log("Migrating visit_notes table...");
    await client.query(`
      ALTER TABLE visit_notes 
      ADD COLUMN IF NOT EXISTS structured_vitals jsonb,
      ADD COLUMN IF NOT EXISTS lab_investigations text[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS referral jsonb;
    `);

    await client.query("COMMIT");
    console.log("Phase 1 schema migration completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    throw err;
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error("Fatal migration error:", err);
  process.exit(1);
});
