import dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";

async function seedDemoClinicalData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    // 1. Get the most recent appointment
    const apptRes = await client.query(`
      SELECT a.id, a.patient_id, p.name 
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      ORDER BY a.appointment_date DESC, a.created_at DESC
      LIMIT 1;
    `);

    if (apptRes.rows.length > 0) {
      const appt = apptRes.rows[0];
      console.log("Seeding demo consultation data on latest appointment:", appt);

      // Link ABHA to this patient
      await client.query(`
        UPDATE patients
        SET abha_id = '91-8842-1902-7714', is_abha_verified = true
        WHERE id = $1;
      `, [appt.patient_id]);

      // Upsert rich visit note with vitals, labs, referral, Notion Pharma Rx
      const vitals = {
        bpSystolic: "120",
        bpDiastolic: "80",
        pulse: "72",
        spo2: "99",
        bloodSugar: "105",
        temp: "98.4",
        weight: "68"
      };

      const labs = ["CBC / Hemogram", "Lipid Profile", "HbA1c & Fasting Sugar", "Kidney Function Test (KFT)"];
      const referral = {
        hospital: "Vishesh Jupiter Hospital, Ring Road, Indore",
        specialty: "Critical Care / Cardiology",
        urgency: "Priority",
        reason: "Comprehensive cardiac telemetry and tertiary stabilization follow-up"
      };

      const treatment = "1. Inj Meromicron 1g IV TDS x 3 days (Notion Pharma)\n2. Cap Pantamac-DSR 1 cap OD before breakfast x 5 days\n3. Tab Megafenac-SP 1 tab BD post meals x 3 days\n4. Routine hydration and vitals chart monitoring.";

      await client.query(`
        UPDATE visit_notes
        SET 
          structured_vitals = $1,
          lab_investigations = $2,
          referral = $3,
          treatment = $4,
          diagnosis = 'Acute Febrile Illness with Mild Bronchospasm'
        WHERE appointment_id = $5;
      `, [JSON.stringify(vitals), labs, JSON.stringify(referral), treatment, appt.id]);

      console.log("Seeded appointment ID:", appt.id, "with vitals, labs, referral & Notion Pharma medicines.");
    }
  } catch (e) {
    console.error("Error seeding demo:", e);
  } finally {
    await client.end();
  }
}

seedDemoClinicalData();
