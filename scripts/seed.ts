import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { clinics, clinicAdmins, availability, appointments } from "../src/db/schema";
import { format, addDays } from "date-fns";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const db = drizzle(pool);

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // 1. Get the first authenticated user from Supabase auth.users
    const usersResult = await pool.query(`SELECT id, email FROM auth.users LIMIT 1`);
    
    if (usersResult.rows.length === 0) {
      console.error("❌ No users found in auth.users. Please sign up in the UI first.");
      process.exit(1);
    }

    const authUser = usersResult.rows[0];
    console.log(`✅ Found Auth User: ${authUser.email} (${authUser.id})`);

    // 2. Clear existing test data
    console.log("🧹 Clearing old test data...");
    await db.delete(appointments);
    await db.delete(availability);
    await db.delete(clinicAdmins);
    await db.delete(clinics);

    // 3. Create Clinic
    console.log("🏥 Creating Clinic...");
    const [newClinic] = await db.insert(clinics).values({
      name: "Nature Express Cardiology",
      slug: "nature-express",
      doctorName: "Emily Chen",
      specialty: "Senior Cardiologist",
      phone: "9876543210",
      consultationFee: 1500,
      themeColor: "#10b981", // Emerald green for Wow Factor
      address: "123 Healing Avenue, Wellness District",
      about: "Providing premium, tech-forward cardiac care.",
    }).returning();

    // 4. Link Clinic to Auth User
    await db.insert(clinicAdmins).values({
      clinicId: newClinic.id,
      authUserId: authUser.id,
    });
    console.log("✅ Linked Clinic to Auth User");

    // 5. Setup Availability (Mon-Fri, 9AM-5PM, 30min slots)
    console.log("📅 Setting up weekly availability...");
    const availabilityData = [];
    for (let i = 1; i <= 5; i++) {
      availabilityData.push({
        clinicId: newClinic.id,
        dayOfWeek: i,
        startTime: "09:00:00",
        endTime: "17:00:00",
        slotDurationMinutes: 30,
      });
    }
    await db.insert(availability).values(availabilityData);

    // 6. Generate Dummy Appointments (Today & Tomorrow)
    console.log("🩺 Seeding realistic appointments...");
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const todayStr = format(today, "yyyy-MM-dd");
    const tomorrowStr = format(tomorrow, "yyyy-MM-dd");

    const dummyAppointments = [
      {
        clinicId: newClinic.id,
        patientName: "John Doe",
        patientPhone: "9876543211",
        appointmentDate: todayStr,
        appointmentTime: "09:30:00",
        status: "completed",
      },
      {
        clinicId: newClinic.id,
        patientName: "Sarah Connor",
        patientPhone: "9876543212",
        appointmentDate: todayStr,
        appointmentTime: "11:00:00",
        status: "confirmed",
      },
      {
        clinicId: newClinic.id,
        patientName: "Bruce Wayne",
        patientPhone: "9876543213",
        appointmentDate: todayStr,
        appointmentTime: "14:30:00",
        status: "cancelled",
      },
      {
        clinicId: newClinic.id,
        patientName: "Tony Stark",
        patientPhone: "9876543214",
        appointmentDate: tomorrowStr,
        appointmentTime: "10:00:00",
        status: "confirmed",
      },
      {
        clinicId: newClinic.id,
        patientName: "Natasha Romanoff",
        patientPhone: "9876543215",
        appointmentDate: tomorrowStr,
        appointmentTime: "15:30:00",
        status: "confirmed",
      }
    ];

    await db.insert(appointments).values(dummyAppointments);

    console.log("🎉 Seeding complete! You can now log into the dashboard.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
