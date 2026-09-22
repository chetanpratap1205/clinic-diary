import { execSync } from 'child_process';
import * as path from 'path';

function runSalesEngine() {
  const args = process.argv.slice(2);
  let city = 'Indore';
  let specialty = 'Dermatologist';
  let country = 'India';
  let limit = '10';

  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      if (key === 'city' && value) city = value;
      if (key === 'specialty' && value) specialty = value;
      if (key === 'country' && value) country = value;
      if (key === 'limit' && value) limit = value;
    }
  });

  console.log(`\n=============================================================`);
  console.log(`🚀 DOCTOR DIARY — 1-CLICK MASTER SALES PIPELINE ENGINE`);
  console.log(`=============================================================`);
  console.log(`📍 Location   : ${city}, ${country}`);
  console.log(`🩺 Specialty  : ${specialty}`);
  console.log(`🎯 Lead Limit : ${limit}`);
  console.log(`=============================================================\n`);

  // Step 1: Execute Lead Generator Scraper & Auditor
  console.log(`▶️ Step 1/2: Running Stealth Scraper & Digital Audit Engine...`);
  const scrapeCmd = `npx tsx scripts/lead-generator.ts --city="${city}" --specialty="${specialty}" --country="${country}" --limit=${limit}`;
  
  try {
    execSync(scrapeCmd, { stdio: 'inherit', cwd: process.cwd() });
  } catch (err: any) {
    console.error(`❌ Scraper execution failed:`, err.message);
    process.exit(1);
  }

  // Step 2: Import Scraped CSV into Supabase Cloud DB
  console.log(`\n▶️ Step 2/2: Ingesting Qualified Leads into Supabase CRM Database...`);
  const importCmd = `npx tsx scripts/import-leads-to-db.ts`;

  try {
    execSync(importCmd, { stdio: 'inherit', cwd: process.cwd() });
  } catch (err: any) {
    console.error(`❌ Database import failed:`, err.message);
    process.exit(1);
  }

  console.log(`\n=============================================================`);
  console.log(`🎉 1000% ACCURATE SALES PIPELINE RUN COMPLETE!`);
  console.log(`=============================================================`);
  console.log(`📲 All new leads are now active on your Sales Dashboard:`);
  console.log(`   ➡️ Admin Dashboard : https://doctor.naturexpress.in/admin/leads`);
  console.log(`   ➡️ Local CRM View  : http://localhost:3000/admin/leads`);
  console.log(`=============================================================\n`);
}

runSalesEngine();
