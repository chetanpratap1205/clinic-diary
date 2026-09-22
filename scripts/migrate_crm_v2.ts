import { config } from 'dotenv';
config({ path: '.env' });
import { Pool } from 'pg';

async function main() {
  console.log('🔄 Running Sales CRM V2 Database Migration...');

  let connectionString = process.env.DATABASE_URL || '';
  if (!connectionString) {
    console.error('Missing DATABASE_URL');
    process.exit(1);
  }

  // Try port 6543 pooler if 5432 fails
  const pool6543 = new Pool({
    connectionString: connectionString.includes(':5432') ? connectionString.replace(':5432', ':6543') : connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const client = await pool6543.connect();
    console.log('✅ Connected via Supabase pooler (port 6543)');

    await client.query(`
      ALTER TABLE doctor_leads 
      ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'needs_verification',
      ADD COLUMN IF NOT EXISTS last_contact_method TEXT,
      ADD COLUMN IF NOT EXISTS last_call_outcome TEXT,
      ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
      ADD COLUMN IF NOT EXISTS instagram_url TEXT,
      ADD COLUMN IF NOT EXISTS website_url TEXT,
      ADD COLUMN IF NOT EXISTS meta_ads_status TEXT NOT NULL DEFAULT 'unverified';
    `);

    await client.query(`
      ALTER TABLE lead_activities 
      ALTER COLUMN partner_id DROP NOT NULL;
    `);

    await client.query(`
      ALTER TABLE lead_activities 
      ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS performed_by TEXT;
    `);

    client.release();
    await pool6543.end();
    console.log('🎉 Sales CRM V2 Migration Complete!');
    process.exit(0);
  } catch (err: any) {
    console.log('⚠️ Port 6543 failed, attempting port 5432 with SSL...');
    const pool5432 = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      const client = await pool5432.connect();
      console.log('✅ Connected via port 5432');

      await client.query(`
        ALTER TABLE doctor_leads 
        ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'needs_verification',
        ADD COLUMN IF NOT EXISTS last_contact_method TEXT,
        ADD COLUMN IF NOT EXISTS last_call_outcome TEXT,
        ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
        ADD COLUMN IF NOT EXISTS instagram_url TEXT,
        ADD COLUMN IF NOT EXISTS website_url TEXT,
        ADD COLUMN IF NOT EXISTS meta_ads_status TEXT NOT NULL DEFAULT 'unverified';
      `);

      await client.query(`
        ALTER TABLE lead_activities 
        ALTER COLUMN partner_id DROP NOT NULL;
      `);

      await client.query(`
        ALTER TABLE lead_activities 
        ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS performed_by TEXT;
      `);

      client.release();
      await pool5432.end();
      console.log('🎉 Sales CRM V2 Migration Complete!');
      process.exit(0);
    } catch (e: any) {
      console.error('❌ Migration failed:', e.message);
      process.exit(1);
    }
  }
}

main();
