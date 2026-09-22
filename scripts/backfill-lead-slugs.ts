import { config } from 'dotenv';
config({ path: '.env' });
import { createClient } from '@supabase/supabase-js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/^dr\.?\s*/i, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

async function backfillLeadSlugs() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  console.log(`\n🔗 BACKFILLING UNIQUE CLINIC SLUGS FOR ALL DOCTOR LEADS...\n`);

  const { data: leads, error } = await supabase
    .from('doctor_leads')
    .select('id, doctor_name, clinic_name, city, clinic_slug');

  if (error || !leads) {
    console.error('❌ Failed to fetch leads:', error);
    process.exit(1);
  }

  let updatedCount = 0;
  const usedSlugs = new Set<string>();

  // Collect existing non-null slugs
  leads.forEach(l => {
    if (l.clinic_slug) usedSlugs.add(l.clinic_slug);
  });

  for (const lead of leads) {
    if (lead.clinic_slug) continue;

    const baseName = lead.clinic_name || lead.doctor_name || 'clinic';
    const city = lead.city || 'clinic';
    let baseSlug = `${slugify(baseName)}-${slugify(city)}`.slice(0, 45);

    if (!baseSlug || baseSlug === '-') {
      baseSlug = `doctor-${lead.id.slice(0, 6)}`;
    }

    let candidateSlug = baseSlug;
    let counter = 1;

    while (usedSlugs.has(candidateSlug)) {
      candidateSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    usedSlugs.add(candidateSlug);

    const { error: updateErr } = await supabase
      .from('doctor_leads')
      .update({ clinic_slug: candidateSlug })
      .eq('id', lead.id);

    if (updateErr) {
      console.error(`❌ Error updating lead ${lead.id}:`, updateErr.message);
    } else {
      console.log(`✅ Backfilled Slug: ${lead.doctor_name || lead.clinic_name} ➔ /clinic/${candidateSlug}`);
      updatedCount++;
    }
  }

  console.log(`\n🎉 SLUG BACKFILL COMPLETE!`);
  console.log(`📊 Updated ${updatedCount} leads with personalized preview links.\n`);
  process.exit(0);
}

backfillLeadSlugs().catch(console.error);
