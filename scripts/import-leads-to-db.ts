import { config } from 'dotenv';
config({ path: '.env' });
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'papaparse';
import { createClient } from '@supabase/supabase-js';

interface LeadCsvRow {
  'Clinic Name': string;
  'Doctor Name': string;
  'Specialty': string;
  'City': string;
  'Country': string;
  'Phone': string;
  'WhatsApp Link': string;
  'Rating': string;
  'Reviews': string;
  'Website': string;
  'Has Website?': string;
  'Has Online Booking?': string;
  'Has Meta Ads?': string;
  'Primary Pain Point': string;
  'WhatsApp Script': string;
  'Cold Call Hook': string;
  'Address': string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/^dr\.?\s*/i, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function importLeadsToDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const args = process.argv.slice(2);
  let csvFilePath = args[0];

  const outputDir = path.join(process.cwd(), 'output');

  if (!csvFilePath) {
    if (!fs.existsSync(outputDir)) {
      console.error('❌ No output directory found. Run lead-generator first!');
      process.exit(1);
    }
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.csv'));
    if (files.length === 0) {
      console.error('❌ No CSV files found in output directory.');
      process.exit(1);
    }
    files.sort((a, b) => fs.statSync(path.join(outputDir, b)).mtimeMs - fs.statSync(path.join(outputDir, a)).mtimeMs);
    csvFilePath = path.join(outputDir, files[0]);
  }

  console.log(`\n📥 Importing leads via Supabase REST API from: ${csvFilePath}\n`);

  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
  const parsed = parse<LeadCsvRow>(csvContent, { header: true, skipEmptyLines: true });

  let inserted = 0;
  let skipped = 0;

  for (const row of parsed.data) {
    const phone = row['Phone'];
    if (!phone) continue;

    const { data: existing } = await supabase
      .from('doctor_leads')
      .select('id')
      .eq('phone', phone)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`⏩ Skipped existing lead: ${row['Clinic Name']} (${phone})`);
      skipped++;
      continue;
    }

    const priority = row['Has Meta Ads?'] === 'YES' ? 'hot' : parseFloat(row['Rating'] || '0') >= 4.5 ? 'warm' : 'normal';

    const baseName = row['Clinic Name'] || row['Doctor Name'] || 'clinic';
    const city = row['City'] || 'clinic';
    const clinicSlug = `${slugify(baseName)}-${slugify(city)}`.slice(0, 45);

    const fullNotes = [
      `Pain Point: ${row['Primary Pain Point']}`,
      `WhatsApp Script: ${row['WhatsApp Script']}`,
      `Cold Call Hook: ${row['Cold Call Hook']}`,
      `Google Rating: ${row['Rating']}★ (${row['Reviews']} reviews)`,
      `Website: ${row['Website'] || 'None'}`,
    ].join('\n\n');

    const { error } = await supabase.from('doctor_leads').insert({
      doctor_name: row['Doctor Name'] || 'Doctor',
      clinic_name: row['Clinic Name'],
      phone,
      specialty: row['Specialty'],
      city: row['City'],
      address: row['Address'],
      source: 'imported',
      status: 'new',
      priority,
      lead_category: 'A',
      clinic_slug: clinicSlug,
      notes: fullNotes,
    });

    if (error) {
      console.error(`❌ Failed to insert lead ${row['Clinic Name']}:`, error.message);
    } else {
      console.log(`✅ Inserted Lead into Supabase DB: ${row['Clinic Name']} (${phone}) [Slug: /clinic/${clinicSlug}] [Priority: ${priority.toUpperCase()}]`);
      inserted++;
    }
  }

  console.log(`\n🎉 SUPABASE IMPORT COMPLETE!`);
  console.log(`📊 Inserted: ${inserted} new leads`);
  console.log(`⏩ Skipped: ${skipped} duplicates\n`);
  process.exit(0);
}

importLeadsToDatabase().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
