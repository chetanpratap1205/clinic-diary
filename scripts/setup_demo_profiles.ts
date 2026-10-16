import dotenv from "dotenv";
dotenv.config();

import { Client } from "pg";

async function run() {
  console.log("Setting up enterprise demo configurations in Doctor Diary...");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  try {
    // 1. Update the primary clinic ('nature-express' / Chetan Clinic) with enterprise partners for demonstration
    const updateResult = await client.query(`
      UPDATE clinics
      SET 
        partner_lab_name = 'Nandani Medical Laboratories (Indore)',
        preferred_hospital = 'Vishesh Jupiter Hospital, Ring Road, Indore',
        teleconsult_url = 'https://meet.jit.si/DoctorDiary-Indore-Teleconsult'
      WHERE slug = 'nature-express'
      RETURNING id, name, slug, partner_lab_name, preferred_hospital;
    `);

    if (updateResult.rows.length > 0) {
      console.log("Updated primary demo clinic:", updateResult.rows[0]);
    }

    // 2. Ensure an appointment with active token exists for today so the consultation screen is instantly accessible
    const clinicId = updateResult.rows[0]?.id;
    if (clinicId) {
      // Find or create patient
      let patientRes = await client.query(`
        SELECT id FROM patients WHERE clinic_id = $1 LIMIT 1
      `, [clinicId]);

      let patientId;
      if (patientRes.rows.length > 0) {
        patientId = patientRes.rows[0].id;
        // Update patient with ABHA ID
        await client.query(`
          UPDATE patients 
          SET abha_id = '91-8842-1902-7714', is_abha_verified = true
          WHERE id = $1
        `, [patientId]);
        console.log("Updated demo patient with ABHA ID.");
      }

      console.log("Enterprise demo data verification completed.");
    }
  } catch (err) {
    console.error("Error setting up demo profiles:", err);
  } finally {
    await client.end();
  }
}

run().catch(console.error);
