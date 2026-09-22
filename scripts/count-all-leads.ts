import { config } from 'dotenv';
config({ path: '.env' });
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(url, key);

  const { data, count, error } = await supabase
    .from('doctor_leads')
    .select('id, doctor_name, clinic_name, phone, city, source, lead_category, message_sent_step, created_at', { count: 'exact' });

  if (error) {
    console.error('❌ Supabase error:', error);
    process.exit(1);
  }

  console.log(`\n=============================================================`);
  console.log(`📊 TOTAL LEADS IN SUPABASE DATABASE: ${count}`);
  console.log(`=============================================================\n`);

  if (data && data.length > 0) {
    const sources: Record<string, number> = {};
    data.forEach(l => {
      const src = l.source || 'unknown';
      sources[src] = (sources[src] || 0) + 1;
    });

    console.log('📌 LEADS BY SOURCE:');
    console.log(sources);
    console.log('\n📌 RECENT 10 LEADS IN DATABASE:');
    data.slice(0, 10).forEach((l, i) => {
      console.log(`${i + 1}. ${l.doctor_name || 'Doc'} | ${l.clinic_name || 'Clinic'} | ${l.phone} | City: ${l.city || 'N/A'} | Source: ${l.source} | Step: ${l.message_sent_step}`);
    });
  }

  process.exit(0);
}

main().catch(console.error);
