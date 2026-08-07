import { config } from 'dotenv';
config({ path: '.env' });
import { db } from './src/db';
import { sql } from 'drizzle-orm';

async function main() {
  await db.execute(sql`ALTER TABLE doctor_leads ADD COLUMN IF NOT EXISTS clinic_slug TEXT;`);
  await db.execute(sql`ALTER TABLE doctor_leads ADD COLUMN IF NOT EXISTS access_pin TEXT;`);
  console.log('Columns added successfully');
  process.exit(0);
}

main().catch(console.error);
